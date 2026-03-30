/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { CacheFirst, NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// NOTE: Background Sync API types (not yet in default TypeScript lib)
interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
}

// NOTE: these enhance the default cache with strategies optimized for interactive CRUD apps.
// TODO: add custom urlPattern entries to match your app's API routes and CDN assets
const appCaching: RuntimeCaching[] = [
  // NOTE: pages - serve from cache immediately, update in background
  {
    matcher: ({ request }) => request.mode === "navigate",
    handler: new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 3,
    }),
  },
  // NOTE: Google Fonts stylesheets (rarely change)
  {
    matcher: ({ url }) => url.origin === "https://fonts.googleapis.com",
    handler: new StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" }),
  },
  // NOTE: Google Fonts webfont files (immutable)
  {
    matcher: ({ url }) => url.origin === "https://fonts.gstatic.com",
    handler: new CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [{ cacheExpiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 } } as never],
    }),
  },
  // NOTE: static assets in public/ (icons, splash screens, images)
  {
    matcher: ({ url }) => /^\/(icons|splash|images)\//.test(url.pathname),
    handler: new CacheFirst({
      cacheName: "static-assets",
      plugins: [{ cacheExpiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 } } as never],
    }),
  },
  // NOTE: API routes - network-first with fast fallback to cache
  {
    matcher: ({ url }) => url.pathname.startsWith("/api/"),
    handler: new NetworkFirst({
      cacheName: "api-responses",
      networkTimeoutSeconds: 3,
    }),
  },
  // NOTE: Next.js data fetches (RSC payloads)
  {
    matcher: ({ url }) => url.pathname.startsWith("/_next/data/"),
    handler: new StaleWhileRevalidate({ cacheName: "next-data" }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [...appCaching, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

// NOTE: push notifications handlers fire when a push message arrives from the server, even if the app is closed.
// The payload shape is defined in lib/push/actions.ts → sendPushNotification().
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json() as {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    url?: string;
    tag?: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      // TODO: update default icon/badge paths to match your app's assets
      icon: data.icon || "/icons/icon-192x192.png",
      badge: data.badge || "/icons/icon-192x192.png",
      tag: data.tag || "default",
      data: { url: data.url || "/" },
    }),
  );
});

// NOTE: only allow same-origin URLs or relative paths — reject anything else.
function isSafeUrl(url: string): boolean {
  if (url.startsWith("/")) return true;
  try {
    return new URL(url).origin === self.location.origin;
  } catch {
    return false;
  }
}

// NOTE: open the app (or focus it) when the user taps a notification.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const rawUrl = (event.notification.data as { url?: string })?.url || "/";
  const url = isSafeUrl(rawUrl) ? rawUrl : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // NOTE: focus an existing tab if one is open at the target URL
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // NOTE: otherwise open a new tab
      return self.clients.openWindow(url);
    }),
  );
});

// NOTE: the client sends a SW_SET_REMINDER message when the user leaves a page with unsaved work.
// The SW fires a local notification after a delay so the user is reminded to come back.
// See components/visibility-reminder.tsx for the client-side integration.
let reminderTimeout: ReturnType<typeof setTimeout> | null = null;

self.addEventListener("message", (event) => {
  const data = event.data as { type: string; title?: string; body?: string; delay?: number; url?: string } | undefined;
  if (!data) return;

  if (data.type === "SW_SET_REMINDER") {
    // NOTE: clear any previous reminder
    if (reminderTimeout) clearTimeout(reminderTimeout);

    // TODO: adjust default delay (ms) to match your app's UX expectations
    const delay = data.delay ?? 5 * 60 * 1000; // default: 5 minutes

    reminderTimeout = setTimeout(() => {
      self.registration.showNotification(data.title || "Don\u2019t forget!", {
        body: data.body || "You have unsaved work waiting for you.",
        icon: "/icons/icon-192x192.png",
        tag: "in-progress-reminder",
        data: { url: data.url || "/" },
      });
      reminderTimeout = null;
    }, delay);
  }

  if (data.type === "SW_CLEAR_REMINDER") {
    if (reminderTimeout) {
      clearTimeout(reminderTimeout);
      reminderTimeout = null;
    }
  }
});

// NOTE: queues failed mutations (POST/PUT/PATCH/DELETE) and replays them when connectivity returns.
// Supported in Chromium-based browsers — other browsers gracefully ignore the registration.
// The client can also explicitly request a sync by calling:
//   navigator.serviceWorker.ready.then(r => r.sync.register("retry-queue"));
const SYNC_TAG = "retry-queue";
const SYNC_STORE = "bg-sync-requests";

// NOTE: IndexedDB helpers for persisting queued requests across SW restarts
function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("sw-bg-sync", 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(SYNC_STORE, { keyPath: "id", autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueRequest(request: Request) {
  const db = await openSyncDB();
  const body = await request.text();
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  const tx = db.transaction(SYNC_STORE, "readwrite");
  tx.objectStore(SYNC_STORE).add({
    url: request.url,
    method: request.method,
    headers,
    body,
    timestamp: Date.now(),
  });
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function replayRequests() {
  const db = await openSyncDB();
  const tx = db.transaction(SYNC_STORE, "readwrite");
  const store = tx.objectStore(SYNC_STORE);

  const items = await new Promise<{ id: number; url: string; method: string; headers: Record<string, string>; body: string }[]>((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  for (const item of items) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: ["GET", "HEAD"].includes(item.method) ? undefined : item.body,
      });
      store.delete(item.id);
    } catch {
      // NOTE: still offline — stop replaying, the sync event will fire again
      break;
    }
  }
}

// NOTE: intercept failed mutations and queue them for background sync
self.addEventListener("fetch", (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.method === "GET" || event.request.method === "HEAD") return;

  event.respondWith(
    fetch(event.request.clone()).catch(async () => {
      await enqueueRequest(event.request.clone());
      // NOTE: register for background sync if the API is available
      if ("sync" in self.registration) {
        await (self.registration as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync.register(SYNC_TAG);
      }
      return new Response(JSON.stringify({ queued: true }), {
        status: 202,
        headers: { "Content-Type": "application/json" },
      });
    }),
  );
});

// NOTE: replay queued requests when connectivity returns
self.addEventListener("sync", ((event: SyncEvent) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(replayRequests());
  }
}) as EventListener);

serwist.addEventListeners();
