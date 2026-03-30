# Environment Variables

## Setup

1. Copy the example file: `cp .env.example .env`
2. Fill in values from your Supabase project dashboard

## Variables

### Build-time validated

These variables are checked by the Zod schema in `next.config.ts` at build and dev startup. Missing **required** variables will fail the build. **Optional** variables are validated if present but won't block startup when empty. To skip all validation (e.g. while exploring the UI without any credentials), run `NODE_ENV=test pnpm dev`.

| Variable                               | Description                                     | Required? |
| -------------------------------------- | ----------------------------------------------- | :-------: |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL                            |    Yes    |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key                        |    Yes    |
| `POSTGRES_URL`                         | Pooled connection string (used at runtime)      |    Yes    |
| `POSTGRES_URL_NON_POOLING`             | Direct connection string (used for migrations)  |    Yes    |
| `NEXT_PUBLIC_APP_URL`                  | Canonical app URL for email redirects           | Optional  |
| `RESEND_API_KEY`                       | Resend API key for sending email                | Optional  |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`         | VAPID public key (sent to browser for push sub) | Optional  |
| `VAPID_PRIVATE_KEY`                    | VAPID private key (server-side, keep secret)    | Optional  |
| `VAPID_MAILTO`                         | VAPID contact email (`mailto:…`)                | Optional  |

> **Minimum to run `pnpm dev`:** Set the 4 required variables (Supabase URL, publishable key, and both Postgres URLs). Email and push features will throw at runtime if used without their keys, but the app will start and all other features work.

Generate VAPID keys with:

```bash
pnpm dlx web-push generate-vapid-keys
```

### Public (exposed to browser)

| Variable                               | Description                   | Build-validated? |
| -------------------------------------- | ----------------------------- | :--------------: |
| `NEXT_PUBLIC_SUPABASE_URL`             | Supabase project URL          |       Yes        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Supabase anonymous/public key |        No        |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key      |       Yes        |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`         | VAPID public key for push     |     Optional     |
| `NEXT_PUBLIC_APP_URL`                  | Canonical app URL (redirects) |     Optional     |
| `NEXT_PUBLIC_SENTRY_DSN`               | Sentry DSN (error tracking)   |        No        |

> **`ANON_KEY` vs `PUBLISHABLE_KEY`**: These hold the same Supabase key under different names. The app code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. If using the Vercel integration, both are populated automatically.

### Server-only (Supabase)

> **Why are there duplicate-looking variables?** When you create a Supabase project through the Vercel integration, Vercel automatically provisions all of these environment variables. Some are aliases for the same value under different naming conventions (e.g. `SUPABASE_ANON_KEY` and `SUPABASE_PUBLISHABLE_KEY` hold the same key; `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SECRET_KEY` are likewise equivalent). If you're setting up manually, you only need the ones the app actually uses — the rest are provided for Vercel compatibility.

| Variable                    | Description                                      | Build-validated? |
| --------------------------- | ------------------------------------------------ | :--------------: |
| `SUPABASE_ANON_KEY`         | Supabase anonymous key (server-side)             |        No        |
| `SUPABASE_PUBLISHABLE_KEY`  | Supabase publishable key (server-side)           |        No        |
| `SUPABASE_SECRET_KEY`       | Supabase secret key                              |        No        |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (bypasses RLS)                  |        No        |
| `SUPABASE_JWT_SECRET`       | JWT verification secret                          |        No        |
| `SUPABASE_URL`              | Supabase project URL (server-side)               |        No        |
| `SUPABASE_ACCESS_TOKEN`     | Personal access token (Supabase MCP server only) |        No        |

### Server-only (Integrations)

| Variable                       | Description                         | Build-validated? |
| ------------------------------ | ----------------------------------- | :--------------: |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub PAT (GitHub MCP server only) |        No        |

> **Note**: `SUPABASE_ACCESS_TOKEN` and `GITHUB_PERSONAL_ACCESS_TOKEN` are optional — only required if you use the corresponding MCP servers. Leave them blank or omit them otherwise.

### Server-only (Database)

| Variable                   | Description                                                                         | Build-validated? |
| -------------------------- | ----------------------------------------------------------------------------------- | :--------------: |
| `POSTGRES_URL`             | Pooled connection string (used at runtime)                                          |       Yes        |
| `POSTGRES_URL_NON_POOLING` | Direct connection string (used for migrations)                                      |       Yes        |
| `POSTGRES_HOST`            | Database host                                                                       |        No        |
| `POSTGRES_DATABASE`        | Database name                                                                       |        No        |
| `POSTGRES_USER`            | Database user                                                                       |        No        |
| `POSTGRES_PASSWORD`        | Database password                                                                   |        No        |
| `POSTGRES_PRISMA_URL`      | Prisma-compatible connection string (unused — auto-populated by Vercel integration) |        No        |

### Server-only (Email)

| Variable         | Description                      | Build-validated? |
| ---------------- | -------------------------------- | :--------------: |
| `RESEND_API_KEY` | Resend API key for sending email |     Optional     |

### Server-only (Push)

| Variable       | Description                      | Build-validated? |
| -------------- | -------------------------------- | :--------------: |
| `VAPID_MAILTO` | VAPID contact email (`mailto:…`) |     Optional     |

### Server-only (Rate Limiting)

| Variable                   | Description                                | Build-validated? |
| -------------------------- | ------------------------------------------ | :--------------: |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis URL                          |        No        |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token                        |        No        |
| `AUTH_RATE_LIMIT`          | Max auth requests per window (default: 10) |        No        |
| `AUTH_RATE_WINDOW_MS`      | Rate limit window in ms (default: 60000)   |        No        |

> Falls back to in-memory rate limiting when not set (fine for local development).

### Server-only (Storage)

| Variable             | Description                             | Build-validated? |
| -------------------- | --------------------------------------- | :--------------: |
| `UPLOAD_MAX_SIZE_MB` | File upload max size in MB (default: 5) |        No        |

### System

| Variable   | Description                            | Build-validated? |
| ---------- | -------------------------------------- | :--------------: |
| `NODE_ENV` | `development`, `production`, or `test` |       Yes        |

## Build-time Validation

All environment variables are validated at build time using Zod in `next.config.ts`. Missing or invalid variables will fail the build in both development and production:

```ts
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  POSTGRES_URL: z.url(),
  POSTGRES_URL_NON_POOLING: z.url(),
  NEXT_PUBLIC_APP_URL: z.url().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
  VAPID_PRIVATE_KEY: z.string().min(1).optional(),
  VAPID_MAILTO: z.string().startsWith("mailto:").optional(),
});

if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production") {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // NOTE: prints each invalid field and exits
    process.exit(1);
  }
}
```

To skip validation locally (e.g., when you don't have all credentials set up yet), pass `NODE_ENV=test` inline:

```bash
NODE_ENV=test pnpm dev
```

Note: Setting `NODE_ENV` in `.env.local` does not work — Next.js overrides it based on the command (`dev` → `development`, `build`/`start` → `production`).

## Where Variables Are Used

| Context               | Variables used                                                      | File                     |
| --------------------- | ------------------------------------------------------------------- | ------------------------ |
| Browser client        | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`  | `lib/supabase/client.ts` |
| Server client         | Same as browser (via SSR)                                           | `lib/supabase/server.ts` |
| Proxy                 | Same as browser (via SSR)                                           | `lib/supabase/proxy.ts`  |
| Database (runtime)    | `POSTGRES_URL`                                                      | `lib/db/index.ts`        |
| Database (migrations) | `POSTGRES_URL_NON_POOLING`                                          | `drizzle.config.ts`      |
| Auth redirects        | `NEXT_PUBLIC_APP_URL`                                               | `components/*-form.tsx`  |
| Push notifications    | `VAPID_MAILTO`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `lib/push/index.ts`      |

## Security Notes

- Never commit `.env` files. Only `.env.example` (with empty values) is tracked.
- `NEXT_PUBLIC_*` variables are embedded in client bundles and visible to users. Only put public keys there.
- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. Use only in trusted server contexts.

## Troubleshooting

### "Invalid or missing environment variables" on `pnpm dev`

The Zod schema in `next.config.ts` validates 7 variables at startup. If you only want to explore the UI without setting up external services, run:

```bash
NODE_ENV=test pnpm dev
```

This skips validation entirely. Auth, database, and email features won't work, but you can browse the pages and components.

### "I filled in `.env` but the build still fails"

Next.js overrides `NODE_ENV` based on the command — setting it in `.env` has no effect. If you're trying to skip validation, pass `NODE_ENV=test` inline (see above). For actual credentials, make sure they're in `.env` (not `.env.example`).

### "Sign-up works but I never receive a confirmation email"

Supabase sends its own confirmation emails (separate from the React Email templates in `emails/`). Check:

1. In the [Supabase dashboard](https://supabase.com/dashboard), go to **Authentication → Providers → Email** and confirm that "Enable email confirmations" is configured as you expect
2. Check the **Authentication → Email Templates** tab — Supabase uses these templates for confirmation/reset emails, not the ones in `emails/`
3. In development, Supabase rate-limits email sending. Check the **Authentication → Users** tab to see if the user was created

### "The database seed fails with a duplicate key error"

The seed script uses `onConflictDoNothing()` and should be safe to run multiple times. If you're seeing this error, your seed file may have been modified to remove the conflict handling. Check `lib/db/seed.ts`.

### "I get a connection error when running `pnpm db:push` or `pnpm db:migrate`"

These commands use `POSTGRES_URL_NON_POOLING` (a direct, non-pooled connection). Make sure this variable is set in your `.env`. It's a different value than `POSTGRES_URL` — find it in your Supabase dashboard under **Settings → Database → Connection string → URI** (select "Direct" mode, not "Pooler").

### "Which Supabase variable do I actually need?"

The app code uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. All other Supabase variables in `.env.example` are auto-populated by the Vercel integration for compatibility. If setting up manually, you only need those two from your Supabase dashboard under **Settings → API**.
