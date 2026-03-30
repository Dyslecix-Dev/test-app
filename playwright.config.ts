import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",

  // NOTE: run tests in files in parallel
  fullyParallel: true,

  // NOTE: fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // NOTE: retry on CI only
  retries: process.env.CI ? 2 : 0,

  // NOTE: opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // NOTE: reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: "html",

  // NOTE: shared settings for all the projects below
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // NOTE: screenshot comparison defaults
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
    },
  },

  // NOTE: configure projects for major browsers
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: /visual\.spec\.ts/,
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testIgnore: /visual\.spec\.ts/,
    },
    ...(process.env.CI ? [{ name: "webkit", use: { ...devices["Desktop Safari"] }, testIgnore: /visual\.spec\.ts/ }] : []),

    // NOTE: visual regression tests — Chromium only for consistent rendering
    {
      name: "visual",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /visual\.spec\.ts/,
    },

    // NOTE: mobile viewport tests — Mobile Chrome runs locally + CI, Mobile Safari CI-only (WebKit requires macOS 14+)
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testIgnore: /visual\.spec\.ts/,
    },
    ...(process.env.CI
      ? [
          {
            name: "Mobile Safari",
            use: { ...devices["iPhone 12"] },
            testIgnore: /visual\.spec\.ts/,
          },
        ]
      : []),
  ],

  // NOTE: run your local dev server before starting the tests
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
