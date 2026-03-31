# PWA (Progressive Web App)

## Stack

- **Service worker**: Serwist (`serwist` + `@serwist/turbopack`)
- **Manifest**: Next.js `app/manifest.ts`
- **Offline fallback**: `app/~offline/page.tsx`
- **Push notifications**: `web-push` (server) + Web Push API (client)

## How It Works

### Service Worker (`app/sw.ts`)

`app/sw.ts` is compiled by Serwist's esbuild pipeline (via `app/serwist/[path]/route.ts`), not by the TypeScript project. It uses `/// <reference lib="webworker" />` for its own type environment and is excluded from `tsconfig.json` to prevent webworker types from polluting the main compilation.

The service worker handles:

- **Precaching**: Static assets are precached at install time (manifest auto-injected by Serwist at build)
- **Runtime caching**: Layered strategies for different request types (see below)
- **Offline fallback**: Navigation requests fall back to `/~offline` when offline
- **Auto-update**: `skipWaiting` and `clientsClaim` ensure immediate activation (see [Long-lived sessions](#long-lived-sessions) for caveats)
- **Push notifications**: Listens for `push` events and displays system notifications
- **Notification clicks**: Opens or focuses the app at the notification's target URL
- **"Left in progress" reminders**: Receives messages from the client to fire delayed notifications

### Runtime Caching Strategies

The service worker uses purpose-built caching strategies layered on top of Serwist's defaults:

| Request type | Strategy | Cache name | Notes |
| Page navigations | NetworkFirst (3s timeout) | `pages` | Serves cached page if network is slow/down |
| Google Fonts CSS | StaleWhileRevalidate | `google-fonts-stylesheets` | Always fresh, instant load |
| Google Fonts files | CacheFirst | `google-fonts-webfonts` | Immutable, cached for 1 year |
| Static assets (`/icons/`, `/splash/`, `/images/`) | CacheFirst | `static-assets` | Cached for 30 days |
| API routes (`/api/*`) | NetworkFirst (3s timeout) | `api-responses` | Offline-friendly data access |
| Next.js RSC payloads | StaleWhileRevalidate | `next-data` | Fast navigations |

To add custom caching rules, edit `app/sw.ts` and add entries to the `appCaching` array.

### Provider (`app/serwist.ts`)

The `SerwistProvider` is a client component that registers the service worker. It's wrapped around the app in `app/layout.tsx`:

```tsx
<SerwistProvider swUrl="/serwist/sw.js">{children}</SerwistProvider>
```

### Manifest (`app/manifest.ts`)

The web app manifest defines how the app appears when installed:

```ts
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "My App",
    short_name: "MyApp",
    display: "standalone",
    start_url: "/",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
```

## Offline Support

### Offline Banner

The `<OfflineBanner />` component is mounted in the root layout (`app/layout.tsx`). It shows a fixed banner at the top of the viewport when the browser goes offline and hides automatically when connectivity returns.

Uses the `useOnlineStatus()` hook from `lib/hooks/use-online-status.ts`, which is built on `useSyncExternalStore` for tear-free SSR + client hydration.

### Offline Fallback Page

When the user navigates to a page that isn't cached and the network is down, the service worker serves `app/~offline/page.tsx` instead. Edit this page to customize the offline experience.

## Push Notifications

### Architecture

```text
Client (browser)                     Server
──────────────────                   ──────────────────
PushNotificationManager              lib/push/actions.ts
  ↓ subscribe()                        ↓ subscribeToPush()
  PushManager.subscribe()    →       DB: push_subscriptions table
                                       ↓
                                     lib/push/index.ts
                                       ↓ sendPushToUser(userId, payload)
                                     web-push → Push Service → SW
                                                                ↓
SW (app/sw.ts)                                          push event
  ↓ showNotification()                              notificationclick
  → User taps → openWindow(url)
```

### Setup

1. **Generate VAPID keys** (one-time):

   ```bash
   pnpm dlx web-push generate-vapid-keys
   ```

2. **Add to `.env`**:

   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
   VAPID_PRIVATE_KEY=your_private_key
   ```

3. **Set `VAPID_MAILTO`** in your `.env` to your app's contact email (e.g. `mailto:you@example.com`). Falls back to `mailto:hello@example.com` if not set.

4. **Run the migration** to create the `push_subscriptions` table:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

### Components

#### `<PushNotificationManager />`

A client component that handles the subscribe/unsubscribe lifecycle. It:

- Detects browser support for push notifications
- Reads the existing subscription from the Serwist-registered service worker
- Subscribes/unsubscribes via the Web Push API
- Persists the subscription to the database via server actions

Place it wherever you want the enable/disable notifications UI (e.g., settings page, protected layout nav).

```tsx
import { PushNotificationManager } from "@/components/push-notification-manager";

<PushNotificationManager />;
```

#### `<InstallPrompt />`

Shows an install-to-home-screen prompt:

- On Chrome/Edge: captures `beforeinstallprompt` and shows a native install button
- On iOS Safari: shows manual "Add to Home Screen" instructions
- Hidden when the app is already installed (standalone mode)

```tsx
import { InstallPrompt } from "@/components/install-prompt";

<InstallPrompt />;
```

### Sending Notifications (Server-Side)

Use `sendPushToUser()` from `lib/push/index.ts` to send a notification to all of a user's devices:

```ts
import { sendPushToUser } from "@/lib/push";

await sendPushToUser(userId, {
  title: "Workout complete!",
  body: "Great job — you logged 12 sets today.",
  url: "/workouts/summary",
  tag: "workout-complete", // de-duplicates if sent multiple times
});
```

The function automatically cleans up expired subscriptions (HTTP 410 from the push service).

### Notification Payload Shape

The service worker expects this JSON shape from push events:

```ts
{
  title: string;
  body: string;
  icon?: string;   // defaults to /icons/icon-192x192.png
  badge?: string;  // defaults to /icons/icon-192x192.png
  url?: string;    // URL to open on click (defaults to "/")
  tag?: string;    // de-duplicates notifications with the same tag
}
```

## "Left in Progress" Reminders

The `<VisibilityReminder />` component detects when the user leaves a page with unsaved work and asks the service worker to fire a notification after a delay.

```tsx
import { VisibilityReminder } from "@/components/visibility-reminder";

<VisibilityReminder
  hasUnsavedWork={isDirty}
  title="Workout in progress"
  body="You left a workout unfinished — tap to continue."
  url="/workouts/active"
  delay={5 * 60 * 1000} // 5 minutes (default)
/>;
```

- If the user comes back before the delay, the reminder is cancelled.
- If the component unmounts, the reminder is cancelled.
- Only one reminder can be active at a time (new one replaces the previous).

## Re-engagement Notifications

The `<ActivityTracker />` component (mounted in `app/protected/layout.tsx`) updates the user's `last_active_at` timestamp once per session. Use this in a scheduled server-side job to find inactive users and send re-engagement push notifications:

```ts
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { sendPushToUser } from "@/lib/push";
import { lt } from "drizzle-orm";

// Find users inactive for 7+ days
const inactiveUsers = await db
  .select()
  .from(users)
  .where(lt(users.lastActiveAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));

for (const user of inactiveUsers) {
  await sendPushToUser(user.id, {
    title: "We miss you!",
    body: "You have updates waiting — tap to check in.",
    url: "/",
    tag: "re-engagement",
  });
}
```

Schedule this with Vercel Cron, Supabase `pg_cron`, or any external scheduler.

## Long-lived Sessions

By default, the service worker uses `skipWaiting: true` and `clientsClaim: true` in `app/sw.ts`. This means a new service worker activates immediately on install and takes control of all open tabs — users always get the latest cached assets without needing to close and reopen the app.

### The tradeoff

When a new deployment changes chunk hashes, tabs that are already open still reference the old chunk URLs. If the old chunks are no longer in the precache (because the new SW replaced them), lazy-loaded imports can fail with a network error. This is unlikely to cause issues for short sessions because:

- Page navigations use **NetworkFirst**, so the browser fetches fresh HTML from the server.
- RSC payloads use **StaleWhileRevalidate**, so stale data is served while the cache updates.
- Old chunks typically survive in the browser HTTP cache and CDN for a while.

However, for apps where users keep a tab open for hours without refreshing (dashboards, editors, multi-step forms), the risk of a stale-chunk failure increases.

### Switching to prompt-based updates

If your app has long-lived sessions, replace immediate activation with a user-prompted reload:

1. **Disable `skipWaiting`** in `app/sw.ts`:

   ```ts
   const serwist = new Serwist({
     precacheEntries: self.__SW_MANIFEST,
     skipWaiting: false, // wait for user action
     clientsClaim: true,
     // ...rest unchanged
   });
   ```

2. **Detect the waiting worker** in a client component and prompt the user to reload:

   ```tsx
   "use client";

   import { useEffect, useState } from "react";

   export function UpdatePrompt() {
     const [showUpdate, setShowUpdate] = useState(false);

     useEffect(() => {
       if (!("serviceWorker" in navigator)) return;

       navigator.serviceWorker.ready.then((registration) => {
         registration.addEventListener("updatefound", () => {
           const newWorker = registration.installing;
           if (!newWorker) return;

           newWorker.addEventListener("statechange", () => {
             if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
               setShowUpdate(true);
             }
           });
         });
       });
     }, []);

     if (!showUpdate) return null;

     return (
       <div role="alert" className="bg-primary text-primary-foreground fixed right-4 bottom-4 z-50 rounded-lg p-4 shadow-lg">
         <p className="text-sm font-medium">A new version is available.</p>
         <button
           onClick={() => {
             navigator.serviceWorker.ready.then((registration) => {
               registration.waiting?.postMessage({ type: "SKIP_WAITING" });
             });
             window.location.reload();
           }}
           className="bg-primary-foreground text-primary mt-2 rounded px-3 py-1 text-sm"
         >
           Reload
         </button>
       </div>
     );
   }
   ```

3. **Listen for the `SKIP_WAITING` message** in `app/sw.ts` (add before `serwist.addEventListeners()`):

   ```ts
   self.addEventListener("message", (event) => {
     if ((event.data as { type?: string })?.type === "SKIP_WAITING") {
       self.skipWaiting();
     }
   });
   ```

4. **Mount `<UpdatePrompt />`** in your root layout or protected layout.

This gives users a clear signal that a new version is ready and lets them choose when to reload, avoiding mid-session asset mismatches.

## Customizing

### Update app name and branding

1. Edit `app/manifest.ts` — change `name`, `short_name`, `description`
2. Edit `app/layout.tsx` — update `APP_NAME`, `APP_DEFAULT_TITLE`, `APP_DESCRIPTION`
3. Replace icons in `public/icons/` (192x192 and 512x512 PNG)
4. Replace splash screens in `public/splash/` (Apple splash screens for all device sizes are configured in `app/layout.tsx` metadata)

### Update the offline page

Edit `app/~offline/page.tsx` to customize what users see when offline.

### Update caching strategies

Edit the `appCaching` array in `app/sw.ts` to add or modify runtime caching rules. Each entry needs a `urlPattern` and a `handler` (Serwist strategy class).

### Update push notification defaults

- Default icon/badge paths: `app/sw.ts` (push event handler)
- VAPID mailto address: `VAPID_MAILTO` env var (falls back to `mailto:hello@example.com`)
- "Left in progress" reminder delay: `app/sw.ts` (message event handler)

## Apple Splash Screens

Full Apple splash screen support is configured in `app/layout.tsx` via `metadata.appleWebApp.startupImage`. This covers all iPhone and iPad screen sizes in both portrait and landscape orientations.

Splash screen images are stored in `public/splash/`.

## Build Integration

Serwist integrates with Next.js via the `withSerwist` wrapper in `next.config.ts`:

```ts
import { withSerwist } from "@serwist/turbopack";
export default withSerwist(nextConfig);
```

The service worker is built automatically during `pnpm build` and served from `/serwist/sw.js`.

## Browser Support

| Feature               | Chrome | Safari      | Firefox | iOS Safari               |
| --------------------- | ------ | ----------- | ------- | ------------------------ |
| Service worker        | Yes    | Yes         | Yes     | Yes                      |
| Push notifications    | Yes    | 16+ (macOS) | Yes     | 16.4+ (home screen only) |
| `beforeinstallprompt` | Yes    | No          | No      | No                       |
| Background sync       | Yes    | No          | No      | No                       |
