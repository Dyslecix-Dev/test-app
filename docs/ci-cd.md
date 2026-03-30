# CI/CD

## GitHub Actions Workflows

All workflows run on push and pull requests to `main`/`master`.

### Unit Tests (`.github/workflows/vitest.yml`)

Runs Vitest unit tests.

- **Timeout**: 15 minutes
- **Steps**: Install dependencies, run `pnpm test`

### E2E Tests (`.github/workflows/playwright.yml`)

Runs Playwright browser tests.

- **Timeout**: 60 minutes
- **Browsers**: Chromium, Firefox, Safari (Safari only on CI)
- **Steps**: Install dependencies, install Playwright browsers, run tests
- **Artifacts**: `playwright-report/` uploaded (30-day retention)

### Lighthouse CI (`.github/workflows/lighthouse.yml`)

Runs performance, accessibility, best-practices, and SEO audits.

- **Timeout**: 15 minutes
- **Steps**: Install, build production site, collect reports (3 runs), assert thresholds, upload
- **Artifacts**: `.lighthouseci/` uploaded (30-day retention)
- **Thresholds** (from `lighthouserc.cjs`):
  - Performance: warn if < 90%
  - Accessibility: **error** if < 90%
  - Best Practices: warn if < 90%
  - SEO: warn if < 90%

## Shared Configuration

All workflows use:

- `actions/checkout@v6`
- `pnpm/action-setup@v5` (auto-detects version from `packageManager` in `package.json`)
- `actions/setup-node@v6` with `node-version: lts/*` and pnpm cache
- `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"` env var

## Adding a New Workflow

Create a new file in `.github/workflows/`:

```yaml
name: My Workflow
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  my-job:
    timeout-minutes: 15
    runs-on: ubuntu-latest
    env:
      FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"
    steps:
      - uses: actions/checkout@v6
      - uses: pnpm/action-setup@v5
      - uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: "pnpm"
      - name: Install dependencies
        run: pnpm install
      - name: Your step
        run: pnpm your-command
```

## Deployment

The project is configured for Vercel deployment (uses `VERCEL_URL` env var for metadata). Deploy by connecting your GitHub repo to Vercel, or use the deploy button in the app.

For other platforms, run:

```bash
pnpm build    # Produces .next/ output
pnpm start    # Starts production server
```
