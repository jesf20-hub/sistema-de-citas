-- ============================================================================
-- Extensiones necesarias
-- ============================================================================
-- btree_gist permite combinar '=' (igualdad) con '&&' (solapamiento) en un
-- constraint EXCLUDE, base para impedir dobles reservas a nivel de base de datos.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ============================================================================
-- Tablas
-- ============================================================================

-- Tabla de perfiles (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'profesional', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de servicios ofrecidos por profesionales
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 60 CHECK (duration_minutes BETWEEN 5 AND 480),
  price DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de horarios semanales del profesional
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

-- Tabla de citas/reservas
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmada', 'cancelada', 'completada')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Columna generada: rango temporal de la cita (fecha + horas).
  time_range TSRANGE GENERATED ALWAYS AS (
    tsrange((date + start_time), (date + end_time))
  ) STORED,
  CONSTRAINT appointments_end_after_start CHECK (end_time > start_time),
  -- Anti doble-reserva a nivel de BD: un profesional no puede tener dos citas
  -- solapadas que no esten canceladas. Elimina la race condition del
  -- check-then-insert que existe en la capa de aplicacion.
  CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
    professional_id WITH =,
    time_range WITH &&
  ) WHERE (status <> 'cancelada')
);

-- ============================================================================
-- Indices
-- ============================================================================

-- Indices Foreign Key (evitan full table scan en JOINs y CASCADE)
CREATE INDEX idx_appointments_client_id ON appointments (client_id);
CREATE INDEX idx_appointments_professional_id ON appointments (professional_id);
CREATE INDEX idx_appointments_service_id ON appointments (service_id);
CREATE INDEX idx_services_professional_id ON services (professional_id);
CREATE INDEX idx_schedules_professional_id ON schedules (professional_id);

-- Indices compuestos para queries frecuentes
CREATE INDEX idx_appointments_prof_date_status ON appointments (professional_id, date, status);
CREATE INDEX idx_appointments_client_date ON appointments (client_id, date);

-- Indice parcial: solo citas pendientes (las mas consultadas por profesionales)
CREATE INDEX idx_appointments_pending ON appointments (date)
  WHERE status = 'pendiente';

-- ============================================================================
-- Funciones auxiliares
-- ============================================================================

-- Helper SECURITY DEFINER para comprobar el rol admin SIN recursion de RLS.
-- Consultar 'profiles' dentro de una policy DE 'profiles' provoca recursion
-- infinita; encapsularlo en una funcion que evalua con privilegios del
-- creador (y por tanto salta RLS) lo resuelve.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

-- Devuelve el rol del usuario autenticado sin disparar RLS recursivo.
CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

-- Mantiene updated_at al dia en cada UPDATE.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger para crear perfil automaticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := new.raw_user_meta_data ->> 'role';

  -- Evitar escalacion de privilegios: solo 'cliente' o 'profesional'
  IF user_role IS NULL OR user_role NOT IN ('cliente', 'profesional') THEN
    user_role := 'cliente';
  END IF;

  INSERT INTO public.profiles (id, role, full_name)
  VALUES (
    new.id,
    user_role,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- RLS Policies
-- ============================================================================
-- Nota de rendimiento: se usa (SELECT auth.uid()) en lugar de auth.uid() para
-- que Postgres evalue la funcion UNA vez por query (initPlan) en vez de por
-- fila, mejorando el rendimiento en tablas grandes.

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Profiles: usuarios ven/editan su propio perfil. Admin ve todo (via is_admin()).
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Admin view all profiles" ON profiles;
CREATE POLICY "Admin view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  -- Impide que un usuario cambie su propio rol (escalacion de privilegios):
  -- el rol resultante debe seguir siendo el que ya tenia.
  WITH CHECK (
    (SELECT auth.uid()) = id
    AND role = public.current_role()
  );

DROP POLICY IF EXISTS "Admin manages all profiles" ON profiles;
CREATE POLICY "Admin manages all profiles" ON profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Services: profesional gestiona los suyos, todos pueden ver
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Professional manages own services" ON services;
CREATE POLICY "Professional manages own services" ON services
  FOR ALL
  USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin manages all services" ON services;
CREATE POLICY "Admin manages all services" ON services
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Schedules: profesional gestiona los suyos, todos pueden ver
DROP POLICY IF EXISTS "Anyone can view schedules" ON schedules;
CREATE POLICY "Anyone can view schedules" ON schedules
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Professional manages own schedules" ON schedules;
CREATE POLICY "Professional manages own schedules" ON schedules
  FOR ALL
  USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin manages all schedules" ON schedules;
CREATE POLICY "Admin manages all schedules" ON schedules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Appointments: clientes ven sus citas, profesional ve las suyas, admin ve todo
DROP POLICY IF EXISTS "Clients view own appointments" ON appointments;
CREATE POLICY "Clients view own appointments" ON appointments
  FOR SELECT USING ((SELECT auth.uid()) = client_id);

DROP POLICY IF EXISTS "Professionals view their appointments" ON appointments;
CREATE POLICY "Professionals view their appointments" ON appointments
  FOR SELECT USING ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin view all appointments" ON appointments;
CREATE POLICY "Admin view all appointments" ON appointments
  FOR SELECT USING (public.is_admin());

-- El cliente solo puede crear citas a su nombre y en estado 'pendiente'.
DROP POLICY IF EXISTS "Clients create appointments" ON appointments;
CREATE POLICY "Clients create appointments" ON appointments
  FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = client_id AND status = 'pendiente');

-- El profesional puede actualizar sus citas (confirmar, completar, cancelar).
DROP POLICY IF EXISTS "Professionals update their appointments" ON appointments;
CREATE POLICY "Professionals update their appointments" ON appointments
  FOR UPDATE
  USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

-- El cliente solo puede CANCELAR sus citas. WITH CHECK evita que se auto-confirme
-- o marque como completada (escalacion de estado).
DROP POLICY IF EXISTS "Clients update own appointments" ON appointments;
CREATE POLICY "Clients cancel own appointments" ON appointments
  FOR UPDATE
  USING ((SELECT auth.uid()) = client_id)
  WITH CHECK ((SELECT auth.uid()) = client_id AND status = 'cancelada');

DROP POLICY IF EXISTS "Admin manages all appointments" ON appointments;
CREATE POLICY "Admin manages all appointments" ON appointments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- Storage: bucket de avatares
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase (idempotente):
-- INSERT INTO storage.buckets (id, name, public)
--   VALUES ('avatars', 'avatars', true)
--   ON CONFLICT (id) DO NOTHING;

-- Los avatares se guardan como '<user_id>/<archivo>' para que la policy de
-- storage compruebe la propiedad por la primera carpeta del path.
-- CREATE POLICY "Users manage own avatar" ON storage.objects
--   FOR ALL USING (
--     bucket_id = 'avatars'
--     AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
--   ) WITH CHECK (
--     bucket_id = 'avatars'
--     AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Public can view avatars" ON storage.objects
--   FOR SELECT USING (bucket_id = 'avatars');

-- ============================================================================
-- Realtime
-- ============================================================================
-- Para habilitar Supabase Realtime en la tabla appointments:
-- ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
