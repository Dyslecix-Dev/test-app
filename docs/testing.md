# Testing

## Overview

| Tool                   | Type                 | Config                 | Command           |
| ---------------------- | -------------------- | ---------------------- | ----------------- |
| Vitest                 | Unit                 | `vitest.config.ts`     | `pnpm test`       |
| Testing Library        | Component            | `vitest.config.ts`     | `pnpm test`       |
| vitest-axe             | Accessibility (unit) | `vitest.setup.ts`      | `pnpm test`       |
| Playwright             | E2E                  | `playwright.config.ts` | `pnpm test:e2e`   |
| @axe-core/playwright   | Accessibility (E2E)  | `playwright.config.ts` | `pnpm test:e2e`   |
| Playwright Screenshots | Visual regression    | `playwright.config.ts` | `pnpm test:e2e`   |
| Lighthouse             | Performance          | `lighthouserc.cjs`     | `pnpm lighthouse` |

## Unit Tests (Vitest)

### Configuration

- **Environment**: jsdom
- **Setup file**: `vitest.setup.ts` (imports `@testing-library/jest-dom`, `vitest-axe` matchers, auto-cleanup after each test)
- **Test pattern**: `**/*.test.{ts,tsx}`
- **Excludes**: `node_modules`, `.next`, `e2e`
- **Path alias**: `@/` resolves to project root

### Writing tests

Place test files next to the code they test:

```text
components/
  my-component.tsx
  my-component.test.tsx
lib/
  my-util.ts
  my-util.test.ts
```

Example:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("renders heading", () => {
    render(<MyComponent />);
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});
```

### Running

```bash
pnpm test          # Run all unit tests (watch mode)
pnpm test -- run   # Run once (CI mode)
```

## Component Tests (Vitest + Testing Library)

Component tests render React components in jsdom and simulate user interaction. They complement unit tests (which test pure logic) by verifying that components render correctly, respond to clicks, and update state.

### Example

See `components/example-counter.test.tsx` for a full example. Key patterns:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MyComponent } from "@/components/my-component";

describe("MyComponent", () => {
  it("responds to user interaction", async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.getByText("Success")).toBeInTheDocument();
  });
});
```

### Component test tips

- Use `userEvent.setup()` over `fireEvent` — it simulates real browser behavior (focus, keydown, keyup, click)
- Query by accessible role (`getByRole`) over test IDs when possible
- For components that use Zustand, reset the store in `afterEach` to prevent state leaking between tests
- Wrap external state changes (e.g., `store.setState()`) in `act()` when they happen outside React's event system

## Accessibility Tests (axe-core)

Two layers of accessibility testing catch violations at different levels:

### Component-level (vitest-axe)

Runs axe on rendered component DOM in Vitest. Catches a11y issues in specific component states (error messages visible, interactive states, etc.) that Lighthouse can't reach.

Setup is automatic — `vitest.setup.ts` registers the `toHaveNoViolations()` matcher via `vitest-axe/matchers`.

See `components/example-counter.a11y.test.tsx` for a full example:

```tsx
import { render } from "@testing-library/react";
import { expect, it } from "vitest";
import { axe } from "vitest-axe";
import { MyComponent } from "@/components/my-component";

it("has no a11y violations", async () => {
  const { container } = render(<MyComponent />);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Page-level (@axe-core/playwright)

Runs axe on full pages in a real browser. Tests WCAG 2.1 AA compliance in the complete rendering context (layout, fonts, colors, etc.).

See `e2e/a11y.spec.ts` for a full example:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("page has no a11y violations", async ({ page }) => {
  await page.goto("/my-page");
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});
```

### When to use which

| Layer                | Tests                            | Catches                                                       |
| -------------------- | -------------------------------- | ------------------------------------------------------------- |
| vitest-axe           | Component states, interactive UI | Missing labels, invalid ARIA, contrast in component isolation |
| @axe-core/playwright | Full pages in browser            | Layout-level a11y, color contrast with real CSS, focus order  |
| Lighthouse CI        | Page-level scoring               | Overall a11y score regression, broad best-practice checks     |

## E2E Tests (Playwright)

### Configuration

- **Test directory**: `e2e/`
- **Base URL**: `http://localhost:3000`
- **Browsers**: Chromium + Firefox locally, adds Safari on CI
- **Dev server**: Automatically starts `pnpm dev` before tests
- **Retries**: 2 on CI, 0 locally
- **Traces**: Captured on first retry

### Writing tests

E2E tests go in the `e2e/` directory:

```ts
import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "My App" })).toBeVisible();
});

test("protected route redirects unauthenticated users", async ({ page }) => {
  await page.goto("/protected");
  await expect(page).toHaveURL(/\/auth\/login/);
});
```

### Running

```bash
pnpm test:e2e                        # Run all E2E tests
pnpm exec playwright test --ui       # Open interactive UI
pnpm exec playwright show-report     # View HTML report
```

### Installing browsers

```bash
pnpm exec playwright install --with-deps
```

## Performance (Lighthouse CI)

### Configuration (`lighthouserc.cjs`)

- **Preset**: Desktop
- **Runs**: 3 per URL
- **Thresholds**:
  - Performance: warn < 0.9
  - Accessibility: **error** < 0.9
  - Best Practices: warn < 0.9
  - SEO: warn < 0.9

### Running

```bash
pnpm lighthouse:local   # Build + collect + assert locally
pnpm lighthouse          # Assert only (requires prior build)
```

Reports are uploaded to temporary public storage and saved as CI artifacts.

## Visual Regression Tests (Playwright Screenshots)

Uses Playwright's built-in `toHaveScreenshot()` for pixel-level visual regression testing.

### How it works

- Screenshots are compared against baseline images stored in `e2e/visual.spec.ts-snapshots/`
- Baselines are committed to the repo and should be generated in CI (Linux) for consistency
- Tests run on **Chromium only** (the `visual` project) to avoid cross-platform font rendering differences
- Animations and transitions are disabled for deterministic captures

### Test file

Visual tests live in `e2e/visual.spec.ts`. Each test navigates to a page and captures a full-page screenshot:

```ts
test("home page", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "My App" })).toBeVisible();
  await expect(page).toHaveScreenshot("home.png", { fullPage: true });
});
```

### Generating baselines

First run will always fail because no baselines exist yet. Generate them:

```bash
# Generate baselines locally
pnpm exec playwright test visual.spec.ts --update-snapshots

# Generate baselines for CI (Linux) using Docker
pnpm exec playwright test visual.spec.ts --update-snapshots --project=visual
```

For cross-platform consistency, generate baselines in the same environment as CI. You can use the Playwright Docker image:

```bash
docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.52.0-noble \
  npx playwright test visual.spec.ts --update-snapshots --project=visual
```

Commit the generated snapshots in `e2e/visual.spec.ts-snapshots/`.

### Updating baselines

When a visual change is intentional, re-run with `--update-snapshots`:

```bash
pnpm exec playwright test visual.spec.ts --update-snapshots --project=visual
```

Review the diff, then commit the updated baselines.

### Threshold settings

In `playwright.config.ts`:

- `maxDiffPixelRatio: 0.01` — allows up to 1% pixel difference (handles sub-pixel rendering)
- `animations: "disabled"` — freezes CSS animations during capture
- Visual tests are isolated to the `visual` project so other browser projects skip them

### CI behavior

- On failure, diff images are uploaded as the `visual-regression-diffs` artifact
- The HTML report also includes visual comparison for failed screenshot assertions

### Tips

- **False positives**: If you see flaky diffs from font rendering, increase `maxDiffPixelRatio` or use `maxDiffPixels` for specific assertions
- **New pages**: Add a new test case to `e2e/visual.spec.ts`, run `--update-snapshots`, and commit the baseline
- **Dark mode**: Use `page.emulateMedia({ colorScheme: "dark" })` before navigating (already included for key pages)

## Mocking API Requests (MSW)

[Mock Service Worker](https://mswjs.io/) (MSW) is set up for intercepting HTTP requests in both tests and browser development. Mock handlers live in `lib/msw/`.

### Files

| File                  | Purpose                                       |
| --------------------- | --------------------------------------------- |
| `lib/msw/handlers.ts` | Shared request handlers (add your mocks here) |
| `lib/msw/server.ts`   | Node server for Vitest tests                  |
| `lib/msw/browser.ts`  | Browser worker for in-browser dev mocking     |

### Using MSW in unit tests

Start the mock server in your test file:

```ts
import { server } from "@/lib/msw/server";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("MyComponent", () => {
  it("shows data from the API", async () => {
    // Override a handler for this specific test
    server.use(
      http.get("/api/users", () => {
        return HttpResponse.json([{ id: "1", name: "Test User" }]);
      }),
    );

    // render and assert...
  });
});
```

### Adding handlers

Add new mock handlers to `lib/msw/handlers.ts`:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  // Add your own handlers:
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: "1", email: "test@example.com", name: "Test User" }]);
  }),
];
```

Handlers defined here are shared by both the test server and browser worker. Override them per-test with `server.use()` when you need different responses.

### Using MSW in the browser (optional)

For in-browser API mocking during development (e.g., when a backend isn't ready), start the worker in a client component:

```ts
if (process.env.NODE_ENV === "development") {
  const { worker } = await import("@/lib/msw/browser");
  await worker.start();
}
```

The `public/mockServiceWorker.js` file is already in place — MSW uses it to intercept browser fetch requests.

## CI Integration

All three test types run automatically on push/PR to `main` via GitHub Actions. See `docs/ci-cd.md` for details.
