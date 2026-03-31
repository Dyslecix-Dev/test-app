import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// NOTE: ensures a row exists in the Drizzle `users` table for the given Supabase Auth user.
// Called automatically in the protected layout so every authenticated page has a user row.
// On first visit the row is created; on subsequent visits the existing row is returned.
export async function createOrGetUser({ id, email }: { id: string; email: string }) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (existing) return existing;

  const [created] = await db.insert(users).values({ id, email }).onConflictDoNothing().returning();
  return created ?? (await db.query.users.findFirst({ where: eq(users.id, id) }));
}
