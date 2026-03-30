"use server";

import { parseWithZod } from "@conform-to/zod";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createClient } from "@/lib/supabase/server";

// TODO: update this schema to match your app's user profile fields
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function updateProfile(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const submission = parseWithZod(formData, { schema: profileSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  if (!user) {
    return submission.reply({ formErrors: ["Not authenticated"] });
  }

  await db.update(users).set({ name: submission.value.name, updatedAt: new Date() }).where(eq(users.id, user.id));

  return submission.reply();
}
