// TODO: delete this file — it's a boilerplate demo. Add your own e2e tests in this directory.

import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "My App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "My App" })).toBeVisible();
});

test("login page renders form", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});

test("sign up page renders form", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await expect(page.getByRole("heading", { name: "Sign up" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
});

test("protected route redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/protected");
  await expect(page).toHaveURL(/\/auth\/login/);
});

test("login page links to sign up", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByRole("link", { name: "Sign up" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-up/);
});

test("sign up page links to login", async ({ page }) => {
  await page.goto("/auth/sign-up");
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL(/\/auth\/login/);
});
