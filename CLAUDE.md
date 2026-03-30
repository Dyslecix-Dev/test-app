# Project: Boilerplate

An opinionated full-stack Next.js boilerplate with Supabase, Drizzle ORM, shadcn/ui, and PWA support.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript 5.9)
- **Database**: PostgreSQL (Supabase) + Drizzle ORM
- **Auth**: Supabase Auth (cookie-based sessions via `@supabase/ssr`)
- **UI**: shadcn/ui (New York style) + Tailwind CSS v4 + Radix UI
- **State**: Zustand (global) + nuqs (URL query state)
- **Forms**: Conform + Zod v4
- **Email**: Resend + React Email (`@react-email/components`, `@react-email/render`)
- **PWA**: Serwist (service worker + offline support)
- **Testing**: Vitest (unit) + Playwright (e2e) + Lighthouse CI (perf)

## Commands

```bash
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server
pnpm test             # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright)
pnpm lighthouse:local # Lighthouse audit (build + test)
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm db:generate      # Generate Drizzle migration
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema directly (dev)
pnpm db:seed          # Seed the database with initial data
pnpm db:studio        # Open Drizzle Studio
pnpm email:dev        # Preview email templates (port 3001)
```

## Project Structure

```text
app/
  layout.tsx          # Root layout (providers: Theme, Serwist, Nuqs, Toaster)
  page.tsx            # Landing page
  globals.css         # Tailwind v4 theme (CSS variables, @theme inline)
  manifest.ts         # PWA manifest
  sw.ts               # Service worker (Serwist)
  auth/               # Auth routes (login, sign-up, confirm, etc.)
  protected/          # Auth-guarded routes
  ~offline/           # PWA offline fallback
emails/               # React Email templates (welcome, reset-password, otp)
components/
  ui/                 # shadcn/ui primitives (button, card, input, etc.)
  *.tsx               # Feature components (login-form, auth-button, etc.)
lib/
  db/                 # Drizzle ORM client + schema + paginate helper
  email/              # Resend client + sendEmail helper
  storage/            # Supabase Storage helpers + upload action
  supabase/           # Supabase clients (server, browser, proxy)
  logger.ts           # Structured logger (JSON in prod, readable in dev)
  utils.ts            # cn() utility + helpers
proxy.ts              # Next.js 16 proxy (was middleware.ts in Next.js 15)
e2e/                  # Playwright test files
drizzle/              # Generated migrations
.agents/skills/       # Claude Code agent skills
.github/workflows/    # CI: vitest, playwright, lighthouse
```

## Agent Skills

Installed via `skills-lock.json`. These enhance AI-assisted development:

- **agent-email-inbox** — Resend inbox and email management patterns
- **email-best-practices** — Email design, deliverability, and template best practices
- **frontend-design** — Frontend design best practices
- **react-email** — React Email component patterns and Resend integration
- **resend** — Resend API usage, sending patterns, and webhooks
- **seo-audit** — SEO auditing guidelines
- **shadcn** — shadcn/ui component patterns, composition, forms, styling rules
- **supabase-postgres-best-practices** — PostgreSQL query, schema, security, and connection patterns
- **systematic-debugging** — Root cause tracing and debugging strategies
- **test-driven-development** — TDD workflow and testing anti-patterns
- **vercel-react-best-practices** — React performance, rendering, bundle optimization
- **web-design-guidelines** — a11y, performance, and UX auditing guidelines

## MCP Servers

Configured in `.mcp.json`. Available during AI-assisted development:

- **eslint** — Lint files directly via `@eslint/mcp`
- **github** — Manage GitHub issues, PRs, and repos (requires `GITHUB_PERSONAL_ACCESS_TOKEN`)
- **inkeepMcp** — Search Zod v4 docs (`mcp.inkeep.com/zod`)
- **next-devtools** — Next.js dev tools (docs, browser eval, upgrade)
- **resend** — Manage Resend resources (emails, contacts, domains, broadcasts)
- **shadcn** — Browse and add shadcn/ui components
- **supabase** — Manage Supabase project (tables, auth, edge functions, logs)
- **vercel** — Manage Vercel deployments and project settings
- **vitest** — Run and analyze Vitest tests

## Key Conventions

### Imports

- Use `@/` alias for all imports (e.g., `@/components/ui/button`)
- No relative parent imports (`../` banned by ESLint)

### Styling

- Tailwind v4 — no `tailwind.config.ts`, theme is in `globals.css` via `@theme inline`
- Use `cn()` from `@/lib/utils` for conditional class names
- Colors use HSL CSS variables (see `globals.css`)

### Components

- Default to **Server Components** unless interactivity is needed
- Client components require `"use client"` directive
- shadcn/ui components live in `components/ui/` — add via `pnpm dlx shadcn@latest add`
- Feature components go in `components/`

### Code Style

- **Prettier**: 200 char width, double quotes, semicolons, CRLF, trailing commas
- **Prettier plugins**: organize-imports, tailwindcss
- **ESLint**: next/core-web-vitals + typescript + jsx-a11y + prettier

### Supabase Clients

- **Never store in global variables** — always create per-function (Fluid Compute)
- Server: `createClient()` from `@/lib/supabase/server`
- Browser: `createClient()` from `@/lib/supabase/client`
- Do not add code between `createServerClient()` and `getClaims()` in the proxy

### Email

- Templates live in `emails/` at the project root as React Email components (`.tsx`)
- `render` is re-exported from `@react-email/components` — no separate `@react-email/render` needed
- Use `sendEmail()` from `@/lib/email` — it renders HTML + plain-text automatically
- Never instantiate `Resend` directly in feature code; use `createEmailClient()` or `sendEmail()`
- Preview templates locally with `pnpm email:dev`

### Database

- Schema files in `lib/db/schema/` (one per table)
- Use `prepare: false` for Supabase pooled connections
- `POSTGRES_URL` for runtime, `POSTGRES_URL_NON_POOLING` for migrations
- Use `paginate()` from `@/lib/db/paginate` for offset pagination queries

### Storage

- Use `uploadFile()` / `deleteFile()` / `getPublicUrl()` from `@/lib/storage`
- File uploads go through the `uploadFileAction` server action in `@/lib/storage/actions`
- Create a `uploads` bucket in Supabase Storage dashboard before using

### Rate Limiting

- Uses Upstash Redis in production (`@upstash/ratelimit`), in-memory fallback in dev
- Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for production

### Error Tracking

- Sentry (`@sentry/nextjs`) — set `NEXT_PUBLIC_SENTRY_DSN` to enable
- Config files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Error boundary (`app/error.tsx`) auto-captures exceptions

### Logging

- Use `logger` from `@/lib/logger` instead of `console.log` in server code
- Outputs JSON in production, human-readable in development
- Levels: `debug`, `info`, `warn`, `error` (controlled by `LOG_LEVEL` env var)

### Testing

- Unit tests: co-locate as `*.test.{ts,tsx}` next to source files
- E2E tests: in `e2e/` directory
- Accessibility must score >= 90% (Lighthouse CI errors below this)

## Deep Dive Docs

Before working on specific areas, read the relevant guide:

- Before working on **auth flows**: read `@docs/auth-patterns.md`
- Before **changing CI/CD workflows**: read `@docs/ci-cd.md`
- Before **creating components**: read `@docs/component-patterns.md`
- Before working on **database changes**: read `@docs/database-patterns.md`
- Before **adding or changing env vars**: read `@docs/environment.md`
- Before **working on email templates or sending email**: read `@docs/email.md`
- Before **modifying PWA/service worker**: read `@docs/pwa.md`
- Before **writing or modifying tests**: read `@docs/testing.md`
- Before **deploying or configuring production**: read `@docs/deployment.md`
