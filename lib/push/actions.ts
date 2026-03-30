"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema/push-subscriptions";
import { createClient } from "@/lib/supabase/server";

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// NOTE: save a push subscription for the authenticated user.
export async function subscribeToPush(sub: PushSubscriptionJSON) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // NOTE: upsert — if the endpoint already exists, update the keys
  await db
    .insert(pushSubscriptions)
    .values({
      userId: user.id,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
        userId: user.id,
      },
    });

  return { success: true };
}

// NOTE: remove a push subscription for the authenticated user.
export async function unsubscribeFromPush(endpoint: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)));

  return { success: true };
}
