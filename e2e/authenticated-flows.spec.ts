import { test, expect } from "@playwright/test";

/**
 * Flujos autenticados por modulo (cliente, profesional, admin).
 *
 * Requieren usuarios de prueba reales en Supabase. Se omiten automaticamente
 * si no hay credenciales en variables de entorno, de modo que la suite sigue
 * pasando en CI sin base de datos sembrada.
 *
 * Para ejecutarlos, exporta antes de correr Playwright:
 *   TEST_CLIENT_EMAIL / TEST_CLIENT_PASSWORD
 *   TEST_PRO_EMAIL    / TEST_PRO_PASSWORD
 *   TEST_ADMIN_EMAIL  / TEST_ADMIN_PASSWORD
 */

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
}

const client = {
  email: process.env.TEST_CLIENT_EMAIL,
  password: process.env.TEST_CLIENT_PASSWORD,
};
const pro = {
  email: process.env.TEST_PRO_EMAIL,
  password: process.env.TEST_PRO_PASSWORD,
};
const admin = {
  email: process.env.TEST_ADMIN_EMAIL,
  password: process.env.TEST_ADMIN_PASSWORD,
};

test.describe("Modulo Cliente (autenticado)", () => {
  test.skip(!client.email || !client.password, "Sin credenciales TEST_CLIENT_*");

  test("aterriza en el dashboard de cliente tras login", async ({ page }) => {
    await login(page, client.email!, client.password!);
    await page.waitForURL("**/cliente");
    await expect(page.locator("text=Mis Citas")).toBeVisible();
  });

  test("puede abrir la pantalla de reservar", async ({ page }) => {
    await login(page, client.email!, client.password!);
    await page.waitForURL("**/cliente");
    await page.goto("/cliente/reservar");
    expect(page.url()).toContain("/cliente/reservar");
  });

  test("no puede acceder al panel de admin (guard por rol)", async ({ page }) => {
    await login(page, client.email!, client.password!);
    await page.waitForURL("**/cliente");
    await page.goto("/admin");
    await expect.poll(() => page.url()).not.toContain("/admin");
  });
});

test.describe("Modulo Profesional (autenticado)", () => {
  test.skip(!pro.email || !pro.password, "Sin credenciales TEST_PRO_*");

  test("aterriza en el dashboard profesional tras login", async ({ page }) => {
    await login(page, pro.email!, pro.password!);
    await page.waitForURL("**/profesional");
    expect(page.url()).toContain("/profesional");
  });

  test("puede gestionar servicios", async ({ page }) => {
    await login(page, pro.email!, pro.password!);
    await page.waitForURL("**/profesional");
    await page.goto("/profesional/servicios");
    expect(page.url()).toContain("/profesional/servicios");
  });

  test("puede gestionar horarios", async ({ page }) => {
    await login(page, pro.email!, pro.password!);
    await page.waitForURL("**/profesional");
    await page.goto("/profesional/horarios");
    expect(page.url()).toContain("/profesional/horarios");
  });
});

test.describe("Modulo Admin (autenticado)", () => {
  test.skip(!admin.email || !admin.password, "Sin credenciales TEST_ADMIN_*");

  test("aterriza en el panel de administracion tras login", async ({ page }) => {
    await login(page, admin.email!, admin.password!);
    await page.waitForURL("**/admin");
    await expect(page.locator("text=Panel de Administración")).toBeVisible();
  });

  test("puede ver analytics", async ({ page }) => {
    await login(page, admin.email!, admin.password!);
    await page.waitForURL("**/admin");
    await page.goto("/admin/analytics");
    expect(page.url()).toContain("/admin/analytics");
  });
});
