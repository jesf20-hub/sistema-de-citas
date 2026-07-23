import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("Appointments App", () => {
  test("landing page loads", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=CitasPro")).toBeVisible();
    await expect(page.locator("text=Crear cuenta gratis")).toBeVisible();
    await expect(page.locator("text=Iniciar sesión")).toBeVisible();
  });

  test("login page has correct form fields", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
  });

  test("register page has role selector", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="new-password"]')).toBeVisible();
    await expect(page.locator("select#role")).toBeVisible();
  });

  test("register page validates password length client-side", async ({ page }) => {
    await page.goto(`${BASE}/register`);
    // Check minLength attribute on password
    const passwordInput = page.locator('input[id="password"]');
    await expect(passwordInput).toHaveAttribute("minLength", "8");
  });

  test("protected route redirects to login when unauthenticated", async ({ page }) => {
    await page.goto(`${BASE}/cliente`);
    await page.waitForURL("**/login");
    expect(page.url()).toContain("/login");
  });

  test("reset password page loads", async ({ page }) => {
    await page.goto(`${BASE}/reset-password`);
    await expect(page.locator("text=Recuperar")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("landing page has accessible skip link", async ({ page }) => {
    await page.goto(BASE);
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });
});
