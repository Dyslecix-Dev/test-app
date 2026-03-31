"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

import { db } from "@/lib/db";
import { projects, taskComments, tasks } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { getPublicUrl, uploadFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

export const commentSchema = z.object({
  body: z.string().min(1, "Comment cannot be empty").max(2000),
});

const commentLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

export async function addComment(projectId: string, taskId: string, _prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { status: "error", message: "Not authenticated" };

  const { success } = await commentLimiter.check(user.id);
  if (!success) return { status: "error", message: "Too many comments — slow down." };

  const submission = parseWithZod(formData, { schema: commentSchema });
  if (submission.status !== "success") return submission.reply();

  await db.insert(taskComments).values({
    taskId,
    userId: user.id,
    body: submission.value.body,
  });

  logger.info({ userId: user.id, taskId }, "Comment added");
  revalidatePath(`/protected/projects/${projectId}/tasks/${taskId}`);
  return submission.reply();
}

export async function uploadTaskAttachment(projectId: string, taskId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  // verify task belongs to a project the user owns
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));
  if (!project) return { error: "Project not found" };

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { error: "No file provided" };

  const MAX_SIZE = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 5) * 1024 * 1024;
  if (file.size > MAX_SIZE) return { error: "File too large (max 5 MB)" };

  const rawExt = file.name.split(".").pop() ?? "bin";
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin";
  const path = `tasks/${taskId}/${Date.now()}.${ext}`;

  const { path: storedPath } = await uploadFile("uploads", path, file);
  const publicUrl = await getPublicUrl("uploads", storedPath);

  await db
    .update(tasks)
    .set({ attachmentUrl: publicUrl, updatedAt: new Date() })
    .where(and(eq(tasks.id, taskId), eq(tasks.projectId, projectId)));

  logger.info({ userId: user.id, taskId, path: storedPath }, "Task attachment uploaded");
  revalidatePath(`/protected/projects/${projectId}/tasks/${taskId}`);
  return { url: publicUrl };
}
