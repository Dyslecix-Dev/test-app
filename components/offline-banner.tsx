"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";

// NOTE: displays a fixed banner at the top of the viewport when the user is offline.
// Drop this into your layout or page — it renders nothing when online.

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 shadow-sm dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200"
    >
      <WifiOff className="size-4" />
      You&apos;re offline &mdash; changes will sync when you reconnect
    </div>
  );
}
