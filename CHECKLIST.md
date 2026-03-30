# Pre-Launch Checklist

A checklist of everything to update before shipping this full-stack boilerplate as your own app. Items are grouped roughly in the order you'd tackle them.

---

## 1. Environment & Services

See [docs/environment.md](docs/environment.md) for full details on every variable.

- [ ] Copy `.env.example` to `.env` and fill in all values
- [ ] Create a [Supabase](https://supabase.com/dashboard/organizations) account and set Supabase **Site URL** to your domain in the Supabase dashboard (`Authentication → URL Configuration`)
- [ ] Add your domain to Supabase **Redirect URLs** (include `http://localhost:3000/**` for local dev)
- [ ] Generate VAPID keys and add to `.env`:

  ```bash
  pnpm dlx web-push generate-vapid-keys
  ```

- [ ] Create a [Resend](https://resend.com) account, generate an API key, and add `RESEND_API_KEY` to `.env` (`API Keys`)
- [ ] Verify your sending domain in the Resend dashboard (`Domains`)
- [ ] Add Resend DNS records to your domain provider
- [ ] Set `VAPID_MAILTO` in `.env` to your app's contact email (e.g. `mailto:hello@example.com`) — required for push notification delivery
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` in `.env` to your [Sentry](https://sentry.io) project DSN (optional — error tracking is disabled when unset)
- [ ] Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` for production rate limiting (optional — falls back to in-memory in dev)

---

## 2. App Identity & Branding

- [ ] **[`lib/config.ts`](lib/config.ts)** — update `name` and `description` in `siteConfig` (propagates to layout, manifest, OG image, sitemap, robots, hero, nav, and JSON-LD automatically)
- [ ] **[`app/globals.css`](app/globals.css)** — update theme colors (`--primary`, `--background`, etc.) to match your brand (use [Color Hunt](https://colorhunt.co/) for palette inspiration)
- [ ] **[`public/icons/`](public/icons/)** — replace `apple-icon-180.png`, `icon-192x192.png` and `icon-512x512.png` with your own app icons
- [ ] **[`public/splash/`](public/splash/)** — replace placeholder Apple splash screen images with your own branded images (all device sizes)
- [ ] **[`package.json`](package.json)** — update `name` from `"full-stack boilerplate"` to your project name
- [ ] **[`app/manifest.ts`](app/manifest.ts)** — update `background_color` and `theme_color` to match your brand
- [ ] **[`app/layout.tsx`](app/layout.tsx)** — update `themeColor` in viewport export to match your brand
- [ ] **[`app/layout.tsx`](app/layout.tsx)** — replace Geist with your preferred font (or keep it)
- [ ] **[`app/layout.tsx`](app/layout.tsx)** — update `lang` attribute to match your app's primary locale
- [ ] **[`app/layout.tsx`](app/layout.tsx)** — remove `<Analytics />` and `<SpeedInsights />` if not deploying to Vercel
- [ ] **[`app/favicon.ico`](app/favicon.ico)** — replace with your own favicon
- [ ] **[`app/opengraph-image.tsx`](app/opengraph-image.tsx)** — update `backgroundColor` and styling to match your brand (text pulls from `siteConfig` automatically)
- [ ] **[`app/error.tsx`](app/error.tsx)** — customize the error page copy and styling to match your brand
- [ ] **[`app/not-found.tsx`](app/not-found.tsx)** — customize the 404 page copy and styling to match your brand

---

## 3. Email Templates

See [docs/email.md](docs/email.md) for full details.

- [ ] **[`emails/welcome.tsx`](emails/welcome.tsx)** — update the default `appName` prop to match your app (or pass it from `siteConfig.name` when calling `sendEmail`)
- [ ] Set `EMAIL_FROM` in `.env` to your verified domain address (e.g. `"My App <noreply@yourdomain.com>"`) — required for `sendEmail()` calls

---

## 4. Database & Storage

See [docs/database-patterns.md](docs/database-patterns.md) for full details.

- [ ] **[`lib/db/schema/users.ts`](lib/db/schema/users.ts)** — review and update the `user_role` enum values if your app uses different roles
- [ ] **[`lib/db/seed.ts`](lib/db/seed.ts)** — replace the placeholder seed data with data relevant to your app
- [ ] Run `pnpm db:push` (or `pnpm db:generate && pnpm db:migrate`) to apply the schema to your database
- [ ] Run `pnpm db:seed` to seed the database with your initial data (requires `POSTGRES_URL_NON_POOLING` to be set)
- [ ] If using file uploads: create an `uploads` bucket in Supabase Storage (`Storage → Files`) (the `lib/storage/` helpers expect this bucket to exist)

---

## 5. Auth & Route Protection

See [docs/auth-patterns.md](docs/auth-patterns.md) for full details.

- [ ] **[`lib/supabase/proxy.ts`](lib/supabase/proxy.ts)** — update the route protection condition to match your app's public vs. protected routes
- [ ] **[`components/login-form.tsx`](components/login-form.tsx)** — update the fallback redirect route to your app's main authenticated route
- [ ] **[`components/login-form.tsx`](components/login-form.tsx)** — uncomment OTP sign-in handler and buttons if you want OTP support (or remove the TODOs)
- [ ] **[`components/sign-up-form.tsx`](components/sign-up-form.tsx)** — update `emailRedirectTo` to your app's post-signup destination
- [ ] **[`components/forgot-password-form.tsx`](components/forgot-password-form.tsx)** — ensure the redirect URL is configured in Supabase dashboard redirect URLs
- [ ] **[`components/update-password-form.tsx`](components/update-password-form.tsx)** — update redirect route to an authenticated route
- [ ] **[`app/auth/confirm/route.ts`](app/auth/confirm/route.ts)** — update the default redirect (`"/"`) to your app's main authenticated route
- [ ] Decide if you need email confirmation enabled or disabled in the Supabase Auth settings (`Authentication → Sign In / Providers → Email`)
- [ ] In Resend, (`Settings → SMTP`) copy the SMTP credentials:
  - Host: `smtp.resend.com`
  - Port: `465`
  - Username: `resend`
  - Password: your Resend API key
- [ ] In Supabase (`Authentication → Email → Set up SMTP`) fill in the SMTP credentials:
  - Sender email address: your verified domain address (e.g. `noreply@yourdomain.com`)
  - Sender name: your app name
  - Host: `smtp.resend.com`
  - Port number: `465`
  - Username: `resend`
  - Password: your Resend API key

---

## 6. Service Worker & Caching

See [docs/pwa.md](docs/pwa.md) for full details.

- [ ] **[`app/sw.ts`](app/sw.ts)** — add custom `urlPattern` entries to the `appCaching` array for your app's API routes or CDN assets if needed
- [ ] **[`app/sw.ts`](app/sw.ts)** — update default notification icon/badge paths in the push event handler if you've changed icon filenames
- [ ] Verify the offline fallback page ([`app/~offline/page.tsx`](app/~offline/page.tsx)) looks appropriate for your app

---

## 7. Demo & Boilerplate Content

- [ ] **[`app/protected/page.tsx`](app/protected/page.tsx)** — replace the demo content with your actual protected page
- [ ] **[`app/protected/layout.tsx`](app/protected/layout.tsx)** — remove `<DeployButton />` (boilerplate helper only) and replace the placeholder nav with your app's navigation
- [ ] **[`app/page.tsx`](app/page.tsx)** — replace the landing page content with your own
- [ ] **[`app/page.tsx`](app/page.tsx)** — remove `DeployButton` and `Hero` imports/usage (boilerplate demos)
- [ ] **[`app/protected/page.tsx`](app/protected/page.tsx)** — remove `ExampleCounter` (Zustand demo)
- [ ] **[`app/protected/layout.tsx`](app/protected/layout.tsx)** — remove Users link (pagination demo)
- [ ] **[`app/protected/users/page.tsx`](app/protected/users/page.tsx)** — replace demo page with your app's actual paginated data
- [ ] **[`app/protected/profile/page.tsx`](app/protected/profile/page.tsx)** — replace demo page with your app's actual profile page
- [ ] **[`app/protected/profile/actions.ts`](app/protected/profile/actions.ts)** — update profile schema to match your app's user fields
- [ ] **[`app/protected/profile/profile-form.tsx`](app/protected/profile/profile-form.tsx)** — replace demo form with your app's actual profile form
- [ ] **[`components/deploy-button.tsx`](components/deploy-button.tsx)** — delete this component (boilerplate only)
- [ ] **[`components/hero.tsx`](components/hero.tsx)** — replace with your app's title and description, or delete
- [ ] **[`components/example-counter.tsx`](components/example-counter.tsx)** — replace demo with your app's actual Zustand-powered component, or delete
- [ ] **[`components/example-counter.test.tsx`](components/example-counter.test.tsx)** — replace with tests for your own components
- [ ] **[`components/example-counter.a11y.test.tsx`](components/example-counter.a11y.test.tsx)** — replace with a11y tests for your own components
- [ ] **[`components/file-upload.tsx`](components/file-upload.tsx)** — replace demo with your app's actual upload UI
- [ ] **[`lib/stores/example-store.ts`](lib/stores/example-store.ts)** — replace example with your app's actual global state
- [ ] **[`lib/hooks/use-search-params.ts`](lib/hooks/use-search-params.ts)** — replace example URL state with your app's actual search params
- [ ] **[`e2e/example.spec.ts`](e2e/example.spec.ts)** — delete this file and add your own e2e tests
- [ ] **[`e2e/a11y.spec.ts`](e2e/a11y.spec.ts)** — replace example with a11y tests for your own pages

---

## 8. CI/CD

See [docs/ci-cd.md](docs/ci-cd.md) for full details.

- [ ] Add required secrets to your GitHub repository (`Settings → Secrets and variables → Actions`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - Any other env vars needed for your test suite
- [ ] Review `.github/workflows/` and remove or adjust any workflows not relevant to your project
- [ ] Connect the repo to Vercel (or your chosen host) and configure env vars there (`Settings → Environment Variables`)

---

## 9. SEO & Metadata

- [ ] **[`app/sitemap.ts`](app/sitemap.ts)** — add your app's public routes (dynamic routes can be fetched from the database)
- [ ] **[`app/robots.ts`](app/robots.ts)** — update disallow rules to match your app's private routes
- [ ] **[`app/page.tsx`](app/page.tsx)** — review the JSON-LD structured data `@type` (defaults to `"WebSite"`) and update if your app is a different schema type

---

## 10. Security & Infrastructure

- [ ] **[`next.config.ts`](next.config.ts)** — update the Content-Security-Policy if you add external scripts, fonts, or APIs (and remove Vercel Analytics / Sentry domains if you remove those services)
- [ ] **[`next.config.ts`](next.config.ts)** — review security headers (`X-Frame-Options`, `Referrer-Policy`, etc.) and adjust if your app needs to be embedded in iframes or has different referrer requirements
- [ ] **[`lib/push/index.ts`](lib/push/index.ts)** — remove or update the hardcoded `mailto:hello@example.com` VAPID fallback (relies on `VAPID_MAILTO` env var being set)

---

## 11. Service Worker & Misc

- [ ] **[`app/sw.ts`](app/sw.ts)** — adjust the default background sync delay (ms) to match your app's UX expectations
- [ ] **[`lib/push/index.ts`](lib/push/index.ts)** — set `VAPID_MAILTO` in `.env` to your app's contact email
- [ ] **[`lib/storage/index.ts`](lib/storage/index.ts)** — create an `uploads` bucket in Supabase before using storage helpers
- [ ] **[`lib/db/ensure-user.test.ts`](lib/db/ensure-user.test.ts)** — mock the db module and finish the test
- [ ] Add a `LICENSE` file to the project root if open-sourcing

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

### Remove Sentry (error tracking)

- Delete `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Remove `@sentry/nextjs` from `package.json`
- Remove the `withSentryConfig()` wrapper in `next.config.ts`
- Remove the `Sentry.captureException()` call in `app/error.tsx`
- Remove `NEXT_PUBLIC_SENTRY_DSN` from `.env`
- Remove `https://*.ingest.sentry.io` from the CSP `connect-src` in `next.config.ts`

### Remove rate limiting

- Delete `lib/rate-limit.ts`
- Remove `@upstash/ratelimit` and `@upstash/redis` from `package.json`
- Remove `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` from `.env`
