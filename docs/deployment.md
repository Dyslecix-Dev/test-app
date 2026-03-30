# Deployment

## Vercel (Recommended)

The project is pre-configured for Vercel. Zero config is needed beyond environment variables.

### Steps

1. **Connect your repository** — Import the repo in the [Vercel dashboard](https://vercel.com/new). Vercel auto-detects the Next.js framework.

2. **Set environment variables** — In **Settings > Environment Variables**, add all required variables from [environment.md](environment.md). If you use the Vercel x Supabase integration, most variables are populated automatically.

3. **Configure Supabase Auth redirect URLs** — In your [Supabase dashboard](https://supabase.com/dashboard) under **Authentication > URL Configuration**:
   - Set **Site URL** to your production domain (e.g. `https://myapp.com`)
   - Add `https://myapp.com/**` to **Redirect URLs**

4. **Run the database migration** — After the first deploy, run:

   ```bash
   pnpm db:migrate
   ```

   Or use `pnpm db:push` for initial setup. Subsequent schema changes should use the migration workflow (`pnpm db:generate && pnpm db:migrate`).

5. **Deploy** — Push to your main branch. Vercel builds and deploys automatically.

### Vercel Project Settings

These are auto-detected but worth verifying:

| Setting          | Value          |
| ---------------- | -------------- |
| Framework Preset | Next.js        |
| Build Command    | `pnpm build`   |
| Output Directory | `.next`        |
| Install Command  | `pnpm install` |
| Node.js Version  | 20.x (LTS)     |

### Preview Deployments

Vercel creates a preview deployment for every pull request. These inherit environment variables from the **Preview** environment scope. Make sure your Supabase redirect URLs include the Vercel preview domain pattern:

```text
https://*-<your-team>.vercel.app/**
```

## Other Platforms

The app is a standard Next.js project. Any platform that supports Node.js can host it.

### Build and Start

```bash
pnpm build
pnpm start
```

The production server listens on port 3000 by default. Override with the `PORT` environment variable.

### Docker

```dockerfile
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

> **Note**: To use the standalone output mode, add `output: "standalone"` to `next.config.ts`. This is not enabled by default because Vercel doesn't need it.

### Railway / Render / Fly.io

These platforms support Next.js natively. General steps:

1. Connect your Git repository
2. Set environment variables (see [environment.md](environment.md))
3. Set the build command to `pnpm build` and start command to `pnpm start`
4. Configure the Supabase Auth redirect URLs for your new domain

## Production Checklist

Before going live, verify:

### Environment

- [ ] All required env vars are set (see [environment.md](environment.md))
- [ ] `NEXT_PUBLIC_APP_URL` is set to your production domain
- [ ] `VAPID_MAILTO` is set to a real contact email
- [ ] `NEXT_PUBLIC_SENTRY_DSN` is set for error tracking
- [ ] `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set for production rate limiting

### Supabase

- [ ] Site URL and redirect URLs configured for the production domain
- [ ] Row Level Security (RLS) policies reviewed and enabled on all tables
- [ ] Database migrations applied (`pnpm db:migrate`)
- [ ] Storage bucket created if using file uploads (`uploads`)

### DNS and HTTPS

- [ ] Custom domain configured with your hosting provider
- [ ] HTTPS enabled (automatic on Vercel, Render, Railway)
- [ ] `NEXT_PUBLIC_APP_URL` matches the final domain (including `https://`)

### Monitoring

- [ ] Health check monitor configured at `/api/health` (see README)
- [ ] Sentry alerts configured for error thresholds
- [ ] Uptime monitoring set up (e.g. Better Stack, Datadog)

### Performance

- [ ] Run `pnpm lighthouse:local` and verify scores meet thresholds
- [ ] Accessibility score >= 90% (enforced by Lighthouse CI)
- [ ] Review bundle size with `npx @next/bundle-analyzer`

## Database Migrations in Production

**Never run `pnpm db:push` in production.** Use the migration workflow:

```bash
# 1. Generate a migration from schema changes
pnpm db:generate

# 2. Review the generated SQL in drizzle/
# 3. Apply the migration
pnpm db:migrate
```

For CI/CD, add the migration step to your deployment pipeline:

```yaml
# Example: run migrations before the app starts
- run: pnpm db:migrate
  env:
    POSTGRES_URL_NON_POOLING: ${{ secrets.POSTGRES_URL_NON_POOLING }}
```

## Rollback Strategy

- **Code rollbacks**: Vercel supports instant rollbacks to any previous deployment from the dashboard
- **Database rollbacks**: Drizzle doesn't generate down migrations automatically. For critical changes, write a manual rollback migration or use Supabase's point-in-time recovery (Pro plan)

## Environment-Specific Behavior

| Behavior       | Development    | Production                    |
| -------------- | -------------- | ----------------------------- |
| Rate limiting  | In-memory      | Upstash Redis                 |
| Logging        | Human-readable | JSON (for log aggregators)    |
| Sentry         | Disabled       | Enabled (if DSN set)          |
| Session replay | Disabled       | 1% of sessions, 100% on error |
| Env validation | Enforced       | Enforced                      |
| Service worker | Registered     | Registered + precaching       |
