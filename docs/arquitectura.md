# Sistema de Servicios x Cita — Documentación

Repositorio: https://github.com/jesf20-hub/sistema-de-citas

## Stack
- **Next.js 16.2.9** (App Router, React 19, TypeScript strict)
- **Supabase** (Auth + Postgres + RLS + Realtime + Storage)
- **Tailwind CSS 4** (dark mode con next-themes)
- **Zod 4** (validaciones client/server)
- **Recharts** (gráficos en admin analytics)
- **Pino** (logs estructurados)
- **Playwright** (e2e), **Vitest** (unitarios)

## Roles de usuario
| Rol | Permisos |
|-----|----------|
| `cliente` | Reservar citas, ver sus citas, cancelar propias |
| `profesional` | Gestionar servicios/horarios, confirmar/completar/cancelar citas |
| `admin` | Panel global, analytics, cambiar roles, ver todo |

## Estructura del proyecto
```
src/
├── app/
│   ├── (auth)/           # login, register, reset-password
│   ├── (dashboard)/
│   │   ├── admin/        # panel + analytics (charts con recharts)
│   │   ├── cliente/      # mis citas, reservar, confirmar, cancelar
│   │   ├── perfil/       # editar perfil, subir avatar
│   │   └── profesional/  # dashboard, servicios CRUD, horarios, calendario
│   └── api/
│       ├── graphql/      # GraphQL endpoint (graphql-yoga)
│       └── health/       # health check (estado DB + uptime)
├── components/           # navbar, theme-toggle, calendar, skeletons
├── lib/
│   ├── actions/          # server actions (auth, appointments, profesional, admin)
│   ├── supabase/         # clientes server.ts y client.ts
│   ├── graphql/          # schema + resolvers para /api/graphql
│   ├── booking.ts        # lógica pura de fechas/horarios (testeable)
│   ├── db.ts             # getUser, verifySession, requireRole, getUserOrNull
│   ├── logger.ts         # pino: audit(), security()
│   ├── rate-limit.ts     # rate limit en memoria
│   ├── schemas.ts        # Zod schemas para todas las entidades
│   ├── types.ts          # Appointment, Service, Profile, Schedule
│   └── utils.ts          # formatPrice, formatTime, formatDate, etc.
├── proxy.ts              # auth, guards por rol, rate-limit en /login y /register
```

## Base de datos (Postgres + Supabase)
- `profiles` (extiende auth.users): id, role, full_name, phone, avatar_url, bio
- `services`: id, professional_id, name, duration_minutes, price, active
- `schedules`: id, professional_id, day_of_week, start_time, end_time
- `appointments`: id, client_id, professional_id, service_id, date, start_time, end_time, status, notes, time_range (generado)

### RLS Policies
- Sin recursión (función `is_admin()` SECURITY DEFINER)
- Clientes solo cancelan (WITH CHECK status = 'cancelada')
- Profesionales gestionan sus servicios/horarios/citas
- Admin gestiona todo

### Anti doble-reserva
- `btree_gist` + columna `time_range` generada + `EXCLUDE` constraint

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Comandos
```bash
npm run dev       # servidor desarrollo (localhost:3000)
npm run build     # build producción
npm test          # tests unitarios (Vitest)
npm run lint      # ESLint
npx tsc --noEmit  # chequeo de tipos
npm run test:e2e  # Playwright
```

## CI (GitHub Actions)
- `.github/workflows/ci.yml`: lint → tsc → test en cada push a master
- e2e opcional con variables `NEXT_PUBLIC_SUPABASE_URL` + secrets

## Seguridad
- CSP, HSTS, Permissions-Policy en next.config.ts
- Rate limit en `/login`, `/register` y en `createAppointment`
- Upload de avatar: magic bytes (no solo extensión), path bajo `userId/`
- RLS en todas las tablas
- Proxy con guards de rol para rutas protegidas
- Sesiones Supabase se refrescan correctamente en proxy
