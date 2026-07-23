import { test, expect } from "@playwright/test";

test.describe("Modulo Auth - Registro", () => {
  test("muestra todos los campos del formulario", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="full_name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="new-password"]')).toBeVisible();
    await expect(page.locator("select#role")).toBeVisible();
  });

  test("el selector de rol solo ofrece cliente y profesional (no admin)", async ({ page }) => {
    await page.goto("/register");
    const options = await page.locator("select#role option").allTextContents();
    const joined = options.join(" ").toLowerCase();
    expect(joined).not.toContain("admin");
  });

  test("exige contrasena de minimo 8 caracteres (cliente-side)", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("input#password")).toHaveAttribute("minLength", "8");
  });

  test("campos obligatorios tienen atributo required", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="full_name"]')).toHaveAttribute("required", "");
    await expect(page.locator("input#email")).toHaveAttribute("required", "");
    await expect(page.locator("input#password")).toHaveAttribute("required", "");
  });

  test("enlace para ir a iniciar sesion", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
  });
});

test.describe("Modulo Auth - Login", () => {
  test("muestra campos de email y password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();
  });

  test("enlace a recuperar contrasena", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('a[href="/reset-password"]').first()).toBeVisible();
  });

  test("enlace para crear cuenta", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
  });
});

test.describe("Modulo Auth - Reset password", () => {
  test("muestra formulario de recuperacion", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator("text=Recuperar")).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test("el email es obligatorio", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.locator('input[type="email"]')).toHaveAttribute("required", "");
  });
});
