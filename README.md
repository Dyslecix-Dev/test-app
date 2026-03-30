# Full-Stack Boilerplate

An opinionated full-stack Next.js boilerplate for building modern web applications. Ships with authentication, database, UI components, PWA support, and a comprehensive testing setup — ready to build on.

## What's Included

| Category      | Technology                                                    |
| ------------- | ------------------------------------------------------------- |
| Framework     | Next.js 16, React 19, TypeScript 5.9                          |
| Database      | PostgreSQL (Supabase), Drizzle ORM                            |
| Auth          | Supabase Auth (cookie sessions, proxy-based route protection) |
| UI            | shadcn/ui (New York), Tailwind CSS v4, Radix UI               |
| State         | Zustand (global), nuqs (URL query params)                     |
| Forms         | Conform, Zod v4                                               |
| PWA           | Serwist (service worker, offline fallback, installable)       |
| Testing       | Vitest (unit), Playwright (e2e), Lighthouse CI (perf)         |
| Code Quality  | ESLint, Prettier, CI pipelines via GitHub Actions             |
| Animations    | Motion (Framer Motion)                                        |
| Charts        | Recharts                                                      |
| Email         | Resend + React Email (transactional email, templates)         |
| Notifications | Sonner (toasts)                                               |
| Dark Mode     | next-themes (system, light, dark)                             |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- [pnpm](https://pnpm.io/) v10+
- A [Supabase](https://supabase.com/) project

### Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd full-stack-boilerplate
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your Supabase credentials. See [docs/environment.md](docs/environment.md) for details on each variable.

   > **Want to explore the UI first?** You can skip env setup and run `NODE_ENV=test pnpm dev` to start the dev server with validation disabled. Auth and database features won't work, but you can browse the pages and components.
   >
   > **Using the Vercel × Supabase integration?** All env vars are populated automatically when you create a Supabase project through Vercel. The `.env.example` file includes every variable Vercel provides — some are aliases for the same value (see [docs/environment.md](docs/environment.md) for details).

4. **Configure Supabase Auth**

   In your [Supabase dashboard](https://supabase.com/dashboard) under **Authentication → URL Configuration**:
   - Set **Site URL** to `http://localhost:3000`
   - Add `http://localhost:3000/**` to **Redirect URLs**

   For production, add your deployed domain to both fields as well.

5. **Set up the database**

   ```bash
   pnpm db:push       # Push schema to your Supabase database
   ```

6. **Start the dev server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
app/
  layout.tsx          # Root layout (theme, PWA, toasts, URL state providers)
  page.tsx            # Landing page
  auth/               # Auth routes (login, sign-up, forgot-password, etc.)
  protected/          # Auth-guarded pages
  ~offline/           # PWA offline fallback page
emails/               # React Email templates (welcome, reset-password, otp)
components/
  ui/                 # shadcn/ui primitives
  *.tsx               # Feature components
lib/
  db/                 # Drizzle ORM (client, schema, queries)
  email/              # Resend client + sendEmail helper
  supabase/           # Supabase clients (server, browser, proxy)
  utils.ts            # Shared utilities
e2e/                  # Playwright E2E tests
docs/                 # Detailed documentation
.agents/skills/       # Claude Code agent skills
.github/workflows/    # CI pipelines (Vitest, Playwright, Lighthouse)
```

## Available Scripts

| Command                 | Description                     |
| ----------------------- | ------------------------------- |
| `pnpm dev`              | Start development server        |
| `pnpm build`            | Build for production            |
| `pnpm start`            | Start production server         |
| `pnpm test`             | Run unit tests (Vitest)         |
| `pnpm test:e2e`         | Run E2E tests (Playwright)      |
| `pnpm lighthouse:local` | Build and run Lighthouse audit  |
| `pnpm lint`             | Run ESLint                      |
| `pnpm format`           | Format code with Prettier       |
| `pnpm db:generate`      | Generate a database migration   |
| `pnpm db:migrate`       | Run pending migrations          |
| `pnpm db:push`          | Push schema to database (dev)   |
| `pnpm db:seed`          | Seed database with initial data |
| `pnpm db:studio`        | Open Drizzle Studio             |
| `pnpm email:dev`        | Preview email templates (3001)  |

## Documentation

Detailed guides for each area of the codebase:

- [Auth Patterns](docs/auth-patterns.md) — Supabase Auth, session management, route protection
- [CI/CD](docs/ci-cd.md) — GitHub Actions workflows, deployment
- [Deployment](docs/deployment.md) — Vercel, Docker, other platforms, production checklist
- [Component Patterns](docs/component-patterns.md) — shadcn/ui, styling, server vs client components, utility hooks
- [Database Patterns](docs/database-patterns.md) — Drizzle ORM, schema conventions, migrations, seeding
- [Email](docs/email.md) — Resend setup, sendEmail() helper, React Email templates
- [Environment Variables](docs/environment.md) — Required env vars, build-time validation
- [PWA](docs/pwa.md) — Service worker, manifest, offline support, push notifications
- [Testing](docs/testing.md) — Vitest, Playwright, Lighthouse CI configuration

## Pre-Launch Checklist

Before shipping, work through [CHECKLIST.md](CHECKLIST.md) — it covers branding, environment setup, email templates, database, auth configuration, and removing demo content.

## Cleaning Up

The full-stack boilerplate ships with a few demo-only files. These are safe to delete — they have no effect on the rest of the app:

| What to remove        | File(s)                                       | Also remove from                                                                         |
| --------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Deploy button         | `components/deploy-button.tsx`                | Its `<DeployButton />` usage and import in `app/page.tsx` and `app/protected/layout.tsx` |
| Hero section          | `components/hero.tsx`                         | Its `<Hero />` usage and import in `app/page.tsx`                                        |
| Demo protected page   | `app/protected/page.tsx`                      | Replace with your own protected content                                                  |
| Example E2E test      | `e2e/example.spec.ts`                         | Replace with your own tests                                                              |
| Example profile page  | `app/protected/profile/`                      | Replace with your own profile page                                                       |
| Example Zustand store | `lib/stores/example-store.ts`                 | Replace with your own stores                                                             |
| Example nuqs hook     | `lib/hooks/use-search-params.ts`              | Replace with your own hooks                                                              |
| Example unit tests    | `lib/utils.test.ts`, `lib/rate-limit.test.ts` | Replace with your own tests                                                              |

Every removable line is also marked with a `TODO` comment in the code — search for `TODO: remove` to find them all.

## Customizing

### Branding

1. Update app name in `app/manifest.ts` and `app/layout.tsx`
2. Replace icons in `public/icons/` and splash screens in `public/splash/`
3. Modify theme colors in `app/globals.css`

### Adding UI Components

```bash
pnpm dlx shadcn@latest add button card dialog
```

### Adding Database Tables

1. Create a new schema file in `lib/db/schema/`
2. Export it from `lib/db/schema/index.ts`
3. Run `pnpm db:generate && pnpm db:migrate`

### Deployment

The project is configured for [Vercel](https://vercel.com). Connect your GitHub repo and deploy. For other platforms:

```bash
pnpm build && pnpm start
```

## Agent Skills (Claude Code)

This full-stack boilerplate ships with pre-configured [Claude Code](https://claude.ai/claude-code) agent skills in `.agents/skills/` for AI-assisted development:

| Skill                            | Source                      | Purpose                                           |
| -------------------------------- | --------------------------- | ------------------------------------------------- |
| agent-email-inbox                | resend/resend-skills        | Resend inbox and email management patterns        |
| email-best-practices             | resend/email-best-practices | Email design, deliverability, and templates       |
| frontend-design                  | anthropics/skills           | Frontend design best practices                    |
| react-email                      | resend/react-email          | React Email component patterns                    |
| resend                           | resend/resend-skills        | Resend API usage, sending patterns, and webhooks  |
| seo-audit                        | coreyhaines31               | SEO auditing guidelines                           |
| shadcn                           | shadcn/ui                   | Component patterns, composition, forms, styling   |
| supabase-postgres-best-practices | supabase/agent-skills       | PostgreSQL queries, schema, security, connections |
| systematic-debugging             | obra/superpowers            | Root cause tracing and debugging strategies       |
| test-driven-development          | obra/superpowers            | TDD workflow and testing anti-patterns            |
| vercel-react-best-practices      | vercel-labs                 | React performance, rendering, bundle optimization |
| web-design-guidelines            | vercel-labs                 | a11y, performance, and UX auditing guidelines     |

Skills are locked via `skills-lock.json`.

## Health Check & Uptime Monitoring

The app exposes a `GET /api/health` endpoint that tests database connectivity and returns:

- `200 { "status": "ok" }` — app and database are healthy
- `503 { "status": "error", "message": "Database connection failed" }` — app is up but the database is unreachable

This endpoint is designed for uptime monitoring services like [Better Stack](https://betterstack.com/). To set it up:

1. Create a monitor in Better Stack pointing to `https://your-domain.com/api/health`
2. Set the expected status code to `200`
3. Choose your check interval (e.g., every 30 seconds)

Better Stack will alert you when the endpoint returns a non-200 status or becomes unreachable, catching both app crashes and database outages.

## Code Quality

- **ESLint** with Next.js, TypeScript, accessibility, and Prettier configs
- **Prettier** with import sorting and Tailwind class ordering
- **Build-time env validation** via Zod in `next.config.ts`
- **Security headers** (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
- **Lighthouse CI** enforces accessibility scores above 90%

## License

[MIT](LICENSE)
