"use server";

import { parseWithZod } from "@conform-to/zod/v4";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod/v4";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { logger } from "@/lib/logger";
import { createRateLimiter } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color")
    .default("#6366f1"),
});

const projectLimiter = createRateLimiter({ limit: 20, windowMs: 60_000 });

export async function createProject(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Not authenticated" };
  }

  const { success } = await projectLimiter.check(user.id);
  if (!success) {
    return { status: "error", message: "Too many requests — slow down." };
  }

  const submission = parseWithZod(formData, { schema: projectSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const [project] = await db
    .insert(projects)
    .values({
      userId: user.id,
      name: submission.value.name,
      description: submission.value.description ?? null,
      color: submission.value.color,
    })
    .returning({ id: projects.id });

  logger.info({ userId: user.id, projectId: project.id }, "Project created");
  redirect(`/protected/projects/${project.id}`);
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // only the project owner can delete it
  await db.delete(projects).where(and(eq(projects.id, projectId), eq(projects.userId, user.id)));

  logger.info({ userId: user.id, projectId }, "Project deleted");
  revalidatePath("/protected/projects");
  redirect("/protected/projects");
}
