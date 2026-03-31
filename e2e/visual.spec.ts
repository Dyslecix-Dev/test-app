import { expect, test } from "@playwright/test";

test.describe("visual regression", () => {
  test.beforeEach(async ({ page }) => {
    // NOTE: disable animations and transitions for deterministic screenshots
    await page.addInitScript(() => {
      const style = document.createElement("style");
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });
  });

  test("home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "My App" })).toBeVisible();
    await expect(page).toHaveScreenshot("home.png", { fullPage: true });
  });

  test("login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page).toHaveScreenshot("login.png", { fullPage: true });
  });

  test("sign up page", async ({ page }) => {
    await page.goto("/auth/sign-up");
    await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
    await expect(page).toHaveScreenshot("sign-up.png", { fullPage: true });
  });

  test("forgot password page", async ({ page }) => {
    await page.goto("/auth/forgot-password");
    await expect(page.getByRole("heading")).toBeVisible();
    await expect(page).toHaveScreenshot("forgot-password.png", { fullPage: true });
  });

  test("not found page", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page).toHaveScreenshot("not-found.png", { fullPage: true });
  });

  test("home page - dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "My App" })).toBeVisible();
    await expect(page).toHaveScreenshot("home-dark.png", { fullPage: true });
  });

  test("login page - dark mode", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
    await expect(page).toHaveScreenshot("login-dark.png", { fullPage: true });
  });
});
