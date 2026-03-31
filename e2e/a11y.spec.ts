// NOTE: example E2E accessibility test — demonstrates how to use @axe-core/playwright to catch a11y violations on full pages in the browser.

// NOTE: this complements Lighthouse CI by:
// - Testing pages that require authentication or specific state
// - Testing interactive states (after clicking, scrolling, filling forms)
// - Running axe with custom rules or tags (e.g., WCAG 2.1 AA only)

// TODO: replace this example with a11y tests for your own pages

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("accessibility", () => {
  test("home page has no critical a11y violations", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    expect(results.violations).toEqual([]);
  });

  test("login page has no critical a11y violations", async ({ page }) => {
    await page.goto("/auth/login");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    expect(results.violations).toEqual([]);
  });

  test("sign-up page has no critical a11y violations", async ({ page }) => {
    await page.goto("/auth/sign-up");

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();

    expect(results.violations).toEqual([]);
  });
});
