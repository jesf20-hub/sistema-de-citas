# Esquema de base de datos

## profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente','profesional','admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## services
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 5 AND 480),
  price DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## schedules
```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(professional_id, day_of_week),
  CONSTRAINT schedules_end_after_start CHECK (end_time > start_time)
);
```

## appointments
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','confirmada','cancelada','completada')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  time_range TSRANGE GENERATED ALWAYS AS (
    tsrange((date + start_time), (date + end_time))
  ) STORED,
  CONSTRAINT appointments_end_after_start CHECK (end_time > start_time),
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
    professional_id WITH =,
    time_range WITH &&
  ) WHERE (status <> 'cancelada')
);
```

## Índices
- FK: `appointments(client_id)`, `appointments(professional_id)`, `appointments(service_id)`, `services(professional_id)`, `schedules(professional_id)`
- Compuestos: `appointments(professional_id, date, status)`, `appointments(client_id, date)`
- Parcial: `appointments(date) WHERE status = 'pendiente'`

## Funciones
- `is_admin()` — SECURITY DEFINER que salta RLS para evitar recursión
- `current_role()` — devuelve el rol del usuario actual sin recursión RLS
- `set_updated_at()` — trigger que actualiza `updated_at` en profiles, services, appointments
- `handle_new_user()` — trigger post-insert en auth.users que crea el perfil automático
  - Bloquea rol `admin` en signup (fuerza `cliente`)
