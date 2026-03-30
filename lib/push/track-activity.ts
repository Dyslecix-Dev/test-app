"use server";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { createClient } from "@/lib/supabase/server";

// NOTE: Updates the authenticated user's `last_active_at` timestamp.
// Called by the <ActivityTracker /> client component on mount.
// Used by re-engagement push notification jobs to find inactive users.
export async function trackActivity() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, user.id));
}
