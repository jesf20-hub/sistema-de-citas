<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Comandos de verificación

- `npm run lint` — ESLint.
- `npx tsc --noEmit` — chequeo de tipos.
- `npm test` — tests unitarios (Vitest) de la lógica pura en `tests/unit/`.
- `npm run test:coverage` — cobertura de `src/lib`.
- `npm run test:e2e` — tests end-to-end (Playwright) en `e2e/`. Requieren un
  dev server que arranque; define un `NEXT_PUBLIC_SUPABASE_URL` válido en
  `.env.local`. Los flujos autenticados (`e2e/authenticated-flows.spec.ts`) se
  omiten salvo que definas `TEST_CLIENT_*`, `TEST_PRO_*` y `TEST_ADMIN_*`.

Ejecuta `npm run lint`, `npx tsc --noEmit` y `npm test` antes de dar por
terminado un cambio.

## Base de datos

El esquema canónico está en `schema.sql` (instalación limpia). Para bases ya
existentes, aplica las migraciones incrementales en `migrations/`.
