<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:karpathy-agent-rules -->
# Andrej Karpathy Coding Guidelines

These guidelines bias toward caution and quality. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused.
- Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan with verification checks.
<!-- END:karpathy-agent-rules -->

## Comandos de verificación

- `npm run lint` — ESLint.
- `npx tsc --noEmit` — chequeo de tipos.
- `npm test` — tests unitarios (Vitest) de la lógica pura en `tests/unit/`.
- `npm run test:coverage` — cobertura de `src/lib`.
- `npm run test:e2e` — tests end-to-end (Playwright) en `e2e/`. Requieren un
  dev server que arranque; define un `NEXT_PUBLIC_SUPABASE_URL` válido en
  `.env.local`. Los flujos autenticados se omiten salvo que definas `TEST_*`.

Ejecuta `npm run lint`, `npx tsc --noEmit` y `npm test` antes de dar por
terminado un cambio.

## Base de datos

El esquema canónico está en `schema.sql` (instalación limpia). Para bases ya
existentes, aplica las migraciones incrementales en `migrations/`.

## Stack del proyecto

- **Next.js 16.2.9** (App Router) — Server Actions NO funcionan, usar API Routes
- **Supabase** (Auth + Postgres + RLS + Realtime + Storage)
- **Tailwind CSS 4** + **lucide-react** (iconos) + **framer-motion** (animaciones)
- **Zod 4** (validación) · **Recharts** (charts) · **Pino** (logs)
- **Playwright** (e2e) · **Vitest** (unitarios)

## Usuarios de prueba (Supabase)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@sistema.com | Admin123! | admin |
| pro@sistema.com | Pro123456! | profesional |
| cliente@sistema.com | Cli123456! | cliente |
