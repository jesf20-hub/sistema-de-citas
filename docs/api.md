# API y Server Actions

## Server Actions (llamadas desde formularios React)

### Auth (`src/lib/actions/auth.ts`)
| Acción | Descripción | Rate Limit |
|--------|-------------|------------|
| `signup(state, formData)` | Crea cuenta (cliente/profesional). No admin. | En proxy |
| `login(state, formData)` | Login por email. Redirige al dashboard del rol. | En proxy |
| `updateProfile(formData)` | Actualiza nombre, teléfono, bio | No |
| `uploadAvatar(formData)` | Sube avatar (magic bytes, <5MB, carpetas por userId) | No |
| `logout()` | Cierra sesión, redirige a /login | No |

### Appointments (`src/lib/actions/appointments.ts`)
| Acción | Descripción | Validaciones | Rate Limit |
|--------|-------------|-------------|------------|
| `createAppointment(formData)` | Cliente reserva cita | Fecha futura, servicio activo y del profesional, duración = servicio, dentro del horario, sin solapamiento | 15/min por userId |
| `updateAppointmentStatus(formData)` | Profesional/admin cambia estado | Profesional solo sus citas (filtro por professional_id) | No |
| `cancelAppointment(id)` | Cliente cancela su cita | Solo el dueño de la cita | No |

### Profesional (`src/lib/actions/profesional.ts`)
| Acción | Descripción |
|--------|-------------|
| `createService(formData)` | Crea servicio propio |
| `updateService(formData)` | Actualiza servicio propio |
| `deleteService(id)` | Elimina servicio propio (con verificación de propiedad) |
| `createSchedule(formData)` | Crea/actualiza horario semanal |
| `deleteSchedule(id)` | Elimina horario propio |

### Admin (`src/lib/actions/admin.ts`)
| Acción | Descripción |
|--------|-------------|
| `updateUserRole(userId, role)` | Solo admin: cambia rol de un usuario |

## Endpoints HTTP

### `GET /api/health`
```json
{ "status": "healthy|degraded", "checks": { "db": true }, "uptime": 123.45 }
```
- HTTP 200 si DB OK, 503 si DB caída

### `GET/POST /api/graphql`
GraphQL endpoint con:
- GraphiQL en desarrollo (`npm run dev`)
- Queries: `me`, `professionals`, `services`, `schedules`, `myAppointments`, `allProfiles` (admin), `metrics` (admin)
- Mutations: `createAppointment`, `cancelAppointment`, `updateAppointmentStatus`
- Mismas validaciones que las server actions
- Autenticación vía cookie de Supabase
