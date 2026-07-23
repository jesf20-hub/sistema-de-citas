import { test, expect } from "@playwright/test";

// Verifica el guard de autenticacion del proxy para TODAS las rutas protegidas.
// Un usuario no autenticado siempre debe terminar en /login.
const protectedRoutes = [
  "/cliente",
  "/cliente/reservar",
  "/cliente/calendario",
  "/profesional",
  "/profesional/servicios",
  "/profesional/horarios",
  "/profesional/calendario",
  "/admin",
  "/admin/analytics",
  "/perfil",
];

test.describe("Control de acceso (usuario no autenticado)", () => {
  for (const route of protectedRoutes) {
    test(`${route} redirige a /login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForURL("**/login");
      expect(page.url()).toContain("/login");
    });
  }
});

test.describe("Rutas publicas accesibles sin sesion", () => {
  const publicRoutes = ["/", "/login", "/register", "/reset-password"];
  for (const route of publicRoutes) {
    test(`${route} responde 200`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status()).toBeLessThan(400);
    });
  }
});
