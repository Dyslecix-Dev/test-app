"use client";

import { useEffect, useState } from "react";

import { subscribeToPush, unsubscribeFromPush } from "@/lib/push/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// NOTE: manages the push notification lifecycle: checks support, subscribes/unsubscribes, and persists the subscription to the server.

// NOTE: this component relies on the service worker registered by SerwistProvider at `/serwist/sw.js` — it does NOT register a separate worker.

// Usage:
// ```tsx
// <PushNotificationManager />
// ```

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      // NOTE: read existing subscription from the Serwist-registered worker
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager
          .getSubscription()
          .then(setSubscription)
          .catch(() => setError("Failed to read notification subscription"));
      });
    }
  }, []);

  async function subscribe() {
    setIsLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      setSubscription(sub);
      await subscribeToPush(sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribe() {
    if (!subscription) return;
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      setSubscription(null);
      await unsubscribeFromPush(endpoint);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {subscription ? (
          <button onClick={unsubscribe} disabled={isLoading} className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline disabled:opacity-50">
            {isLoading ? "Disabling\u2026" : "Disable notifications"}
          </button>
        ) : (
          <button onClick={subscribe} disabled={isLoading} className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline disabled:opacity-50">
            {isLoading ? "Enabling\u2026" : "Enable notifications"}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
