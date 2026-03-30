# Pre-Launch Checklist

A checklist of everything to update before shipping this boilerplate as your own app. Items are grouped roughly in the order you'd tackle them.

---

## 1. Environment & Services

See [docs/environment.md](docs/environment.md) for full details on every variable.

- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Set Supabase **Site URL** to your domain in the Supabase dashboard (`Authentication → URL Configuration`)
- [ ] Add your domain to Supabase **Redirect URLs** (include `http://localhost:3000/**` for local dev)
- [ ] Generate VAPID keys and add to `.env`:

  ```bash
  pnpm dlx web-push generate-vapid-keys
  ```

- [ ] Create a [Resend](https://resend.com) account, generate an API key, and add `RESEND_API_KEY` to `.env`
- [ ] Verify your sending domain in the Resend dashboard
- [ ] Set `VAPID_MAILTO` in `.env` to your app's contact email (e.g. `mailto:you@example.com`) — required for push notification delivery

---

## 2. App Identity & Branding

- [ ] **`app/manifest.ts`** — update `name`, `short_name`, `description`, `background_color`, `theme_color`
- [ ] **`app/layout.tsx`** — update `APP_NAME`, `APP_DEFAULT_TITLE`, `APP_TITLE_TEMPLATE`, `APP_DESCRIPTION`
- [ ] **`public/icons/`** — replace `icon-192x192.png` and `icon-512x512.png` with your own app icons
- [ ] **`public/splash/`** — replace placeholder Apple splash screen images with your own branded images (all device sizes)
- [ ] **`app/globals.css`** — update theme colors (`--primary`, `--background`, etc.) to match your brand

---

## 3. Email Templates

See [docs/email.md](docs/email.md) for full details.

- [ ] **`emails/welcome.tsx`** — update `Preview`, `Heading`, and `Text` with your app's name and messaging
- [ ] Update the `from` address in all `sendEmail()` calls to use your verified Resend domain

---

## 4. Database & Storage

See [docs/database-patterns.md](docs/database-patterns.md) for full details.

- [ ] **`lib/db/schema/users.ts`** — review and update the `user_role` enum values if your app uses different roles
- [ ] **`lib/db/seed.ts`** — replace the placeholder seed data with data relevant to your app
- [ ] Run `pnpm db:push` (or `pnpm db:generate && pnpm db:migrate`) to apply the schema to your database
- [ ] If using file uploads: create an `uploads` bucket in [Supabase Storage](https://supabase.com/dashboard/project/_/storage/buckets) (the `lib/storage/` helpers expect this bucket to exist)

---

## 5. Auth & Route Protection

See [docs/auth-patterns.md](docs/auth-patterns.md) for full details.

- [ ] **`lib/supabase/proxy.ts`** — update the route protection condition to match your app's public vs. protected routes
- [ ] Decide if you need email confirmation enabled or disabled in the Supabase Auth settings (`Authentication → Providers → Email`)

---

## 6. Service Worker & Caching

See [docs/pwa.md](docs/pwa.md) for full details.

- [ ] **`app/sw.ts`** — add custom `urlPattern` entries to the `appCaching` array for your app's API routes or CDN assets if needed
- [ ] **`app/sw.ts`** — update default notification icon/badge paths in the push event handler if you've changed icon filenames
- [ ] Verify the offline fallback page (`app/~offline/page.tsx`) looks appropriate for your app

---

## 7. Demo & Boilerplate Content

- [ ] **`app/protected/page.tsx`** — replace the demo content with your actual protected page
- [ ] **`app/protected/layout.tsx`** — remove `<DeployButton />` (boilerplate helper only) and replace the placeholder nav with your app's navigation
- [ ] **`app/page.tsx`** — replace the landing page content with your own

---

## 8. CI/CD

See [docs/ci-cd.md](docs/ci-cd.md) for full details.

- [ ] Add required secrets to your GitHub repository (`Settings → Secrets and variables → Actions`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Any other env vars needed for your test suite
- [ ] Review `.github/workflows/` and remove or adjust any workflows not relevant to your project
- [ ] Connect the repo to Vercel (or your chosen host) and configure env vars there

---

## Optional: Remove Unused Features

If you don't need certain features, here's what to clean up:

### Remove push notifications

- Delete `lib/push/`
- Delete `lib/db/schema/push-subscriptions.ts` and remove its export from `lib/db/schema/index.ts`
- Delete `components/push-notification-manager.tsx`, `components/visibility-reminder.tsx`
- Remove push event handlers from `app/sw.ts`
- Remove `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` from `.env` and `next.config.ts`
- Run `pnpm db:generate && pnpm db:migrate` to drop the `push_subscriptions` table

### Remove email

- Delete `emails/`, `lib/email/`
- Remove `RESEND_API_KEY` from `.env` and `next.config.ts`

### Remove the activity tracker

- Remove `<ActivityTracker />` from `app/protected/layout.tsx`
- Remove `lastActiveAt` from `lib/db/schema/users.ts`
- Run `pnpm db:generate && pnpm db:migrate`
