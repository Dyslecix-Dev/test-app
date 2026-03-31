"use client";

import { useEffect, useRef } from "react";

import { trackActivity } from "@/lib/push/track-activity";

// NOTE: silently updates the user's `last_active_at` timestamp once per session.
// Place this in your authenticated layout so it fires on every visit.
// The timestamp is used by server-side jobs to send re-engagement push notifications to users who haven't visited in a while.

// Usage (in `app/protected/layout.tsx`):
// ```tsx
// <ActivityTracker />
// ```

export function ActivityTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackActivity();
  }, []);

  return null;
}
