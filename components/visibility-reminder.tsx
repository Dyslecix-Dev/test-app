"use client";

import { useEffect } from "react";

interface VisibilityReminderProps {
  // NOTE: whether there is unsaved or in-progress work right now
  hasUnsavedWork: boolean;
  // NOTE: notification title (shown after the delay)
  title?: string;
  // NOTE: notification body
  body?: string;
  // NOTE: delay in milliseconds before the reminder fires (default: 5 min)
  delay?: number;
  // NOTE: URL to open when the user taps the notification
  url?: string;
}

// NOTE: sends a reminder notification via the service worker when the user leaves the page with unsaved work. The SW fires the notification after a configurable delay.
// If the user returns before the delay elapses, the reminder is cancelled.

// Usage:
// ```tsx
// <VisibilityReminder
//   hasUnsavedWork={isDirty}
//   title="Workout in progress"
//   body="You left a workout unfinished — tap to continue."
//   url="/workouts/active"
// />
// ```

export function VisibilityReminder({ hasUnsavedWork, title, body, delay, url }: VisibilityReminderProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    function handleVisibilityChange() {
      if (!navigator.serviceWorker.controller) return;

      if (document.visibilityState === "hidden" && hasUnsavedWork) {
        navigator.serviceWorker.controller.postMessage({
          type: "SW_SET_REMINDER",
          title,
          body,
          delay,
          url,
        });
      } else {
        // NOTE: user came back (or no unsaved work) — cancel any pending reminder
        navigator.serviceWorker.controller.postMessage({ type: "SW_CLEAR_REMINDER" });
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // NOTE: clean up on unmount
      navigator.serviceWorker.controller?.postMessage({ type: "SW_CLEAR_REMINDER" });
    };
  }, [hasUnsavedWork, title, body, delay, url]);

  return null;
}
