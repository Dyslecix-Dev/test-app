"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

import { TaskAssignedEmail } from "@/emails/task-assigned";
import { siteConfig } from "@/lib/config";
import { db } from "@/lib/db";
import { projects, tasks, users } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import { sendPushToUser } from "@/lib/push";
import { createRateLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "in_review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.string().optional(), // ISO date string from <input type="date">
  assigneeId: z.string().uuid().optional(),
});

const taskLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });

export async function createTask(projectId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  // verify caller owns the project
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  if (!project) return { status: "error", message: "Project not found" };

  const { success } = await taskLimiter.check(user.id);
  if (!success) return { status: "error", message: "Too many requests — slow down." };

  const submission = parseWithZod(formData, { schema: taskSchema });
  if (submission.status !== "success") return submission.reply();

  const { title, description, status, priority, dueDate, assigneeId } = submission.value;

  const [task] = await db
    .insert(tasks)
    .values({
      projectId,
      assigneeId: assigneeId ?? null,
      title,
      description: description ?? null,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
    })
    .returning({ id: tasks.id });

  logger.info({ userId: user.id, projectId, taskId: task.id }, "Task created");

  // Notify assignee via push + email (fire-and-forget — don't block the response)
  if (assigneeId && assigneeId !== user.id) {
    const [assignee] = await db.select().from(users).where(eq(users.id, assigneeId));
    if (assignee) {
      const taskUrl = `${siteConfig.url}/protected/projects/${projectId}/tasks/${task.id}`;

      // push notification
      sendPushToUser(assigneeId, {
        title: "New task assigned",
        body: `${project.name}: ${title}`,
        url: taskUrl,
        tag: `task-${task.id}`,
      }).catch((err) => logger.warn({ err }, "Push notification failed"));

      // email notification
      if (process.env.RESEND_API_KEY) {
        sendEmail({
          to: assignee.email,
          subject: `New task assigned: ${title}`,
          template: (
            <TaskAssignedEmail
              assigneeName={assignee.name ?? assignee.email}
              assignerName={user.email ?? "Someone"}
              taskTitle={title}
              projectName={project.name}
              taskUrl={taskUrl}
              priority={priority}
            />
          ),
        }).catch((err) => logger.warn({ err }, "Task assignment email failed"));
      }
    }
  }

  revalidatePath(`/protected/projects/${projectId}`);
  return submission.reply();
}

export async function updateTaskStatus(projectId: string, taskId: string, status: "todo" | "in_progress" | "in_review" | "done") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // verify project ownership
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  if (!project) throw new Error("Project not found");

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  logger.info({ userId: user.id, taskId, status }, "Task status updated");
  revalidatePath(`/protected/projects/${projectId}`);
}

export async function deleteTask(projectId: string, taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  if (!project) throw new Error("Project not found");

  await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  logger.info({ userId: user.id, taskId, projectId }, "Task deleted");
  revalidatePath(`/protected/projects/${projectId}`);
}
