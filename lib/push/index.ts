import { eq } from "drizzle-orm";
import webpush from "web-push";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema/push-subscriptions";

// NOTE: lazily initialize VAPID credentials on first use so the module can be imported without crashing when the optional VAPID env vars are not set.
let vapidInitialised = false;
function ensureVapid() {
  if (vapidInitialised) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env to enable push notifications.");
  }
  // TODO: set VAPID_MAILTO in your .env to your app's contact email (e.g. mailto:you@example.com)
  webpush.setVapidDetails(process.env.VAPID_MAILTO ?? "mailto:hello@example.com", publicKey, privateKey);
  vapidInitialised = true;
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  // NOTE: URL to open when the notification is tapped
  url?: string;
  // NOTE: de-duplicates notifications — only the latest with the same tag is shown
  tag?: string;
}

// NOTE: send a push notification to a single subscription.
export async function sendPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: PushPayload) {
  ensureVapid();
  try {
    new URL(subscription.endpoint);
  } catch {
    throw new Error(`Invalid push subscription endpoint: ${subscription.endpoint}`);
  }

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth },
    },
    JSON.stringify(payload),
  );
}

// NOTE: send a push notification to all subscriptions for a given user.
// Automatically removes expired/invalid subscriptions (HTTP 410).
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));

  const results = await Promise.allSettled(subs.map((sub) => sendPush(sub, payload)));

  // NOTE: clean up gone subscriptions
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (result.status === "rejected" && (result.reason as { statusCode?: number })?.statusCode === 410) {
      await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, subs[i].id));
    }
  }

  return results;
}
