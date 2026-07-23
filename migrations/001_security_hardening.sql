-- ============================================================================
-- Migracion 001: Hardening de seguridad y consistencia
-- ============================================================================
-- Aplica sobre una base de datos ya existente los cambios de schema.sql.
-- Idempotente: puede ejecutarse varias veces sin error.
-- Ejecutar en el SQL Editor de Supabase.

BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- --- Columnas updated_at -----------------------------------------------------
ALTER TABLE profiles     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE services     ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- --- CHECKs de dominio -------------------------------------------------------
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_duration_range;
ALTER TABLE services ADD  CONSTRAINT services_duration_range
  CHECK (duration_minutes BETWEEN 5 AND 480);
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_price_nonneg;
ALTER TABLE services ADD  CONSTRAINT services_price_nonneg CHECK (price >= 0);

-- --- Anti doble-reserva ------------------------------------------------------
ALTER TABLE appointments DROP COLUMN IF EXISTS time_range;
ALTER TABLE appointments ADD COLUMN time_range TSRANGE GENERATED ALWAYS AS (
  tsrange((date + start_time), (date + end_time))
) STORED;

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_no_overlap;
ALTER TABLE appointments ADD CONSTRAINT appointments_no_overlap EXCLUDE USING gist (
  professional_id WITH =,
  time_range WITH &&
) WHERE (status <> 'cancelada');

-- --- Funciones auxiliares ----------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_role()
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_services_updated_at ON services;
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS trg_appointments_updated_at ON appointments;
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- --- Endurecer handle_new_user ----------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := new.raw_user_meta_data ->> 'role';
  IF user_role IS NULL OR user_role NOT IN ('cliente', 'profesional') THEN
    user_role := 'cliente';
  END IF;
  INSERT INTO public.profiles (id, role, full_name)
  VALUES (new.id, user_role, COALESCE(new.raw_user_meta_data ->> 'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- --- RLS: recrear policies sin recursion y con WITH CHECK -------------------
DROP POLICY IF EXISTS "Users view own profile" ON profiles;
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Admin view all profiles" ON profiles;
CREATE POLICY "Admin view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id AND role = public.current_role());

DROP POLICY IF EXISTS "Admin manages all profiles" ON profiles;
CREATE POLICY "Admin manages all profiles" ON profiles
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Professional manages own services" ON services;
CREATE POLICY "Professional manages own services" ON services
  FOR ALL USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin manages all services" ON services;
CREATE POLICY "Admin manages all services" ON services
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Professional manages own schedules" ON schedules;
CREATE POLICY "Professional manages own schedules" ON schedules
  FOR ALL USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin manages all schedules" ON schedules;
CREATE POLICY "Admin manages all schedules" ON schedules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Clients view own appointments" ON appointments;
CREATE POLICY "Clients view own appointments" ON appointments
  FOR SELECT USING ((SELECT auth.uid()) = client_id);

DROP POLICY IF EXISTS "Professionals view their appointments" ON appointments;
CREATE POLICY "Professionals view their appointments" ON appointments
  FOR SELECT USING ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Admin view all appointments" ON appointments;
CREATE POLICY "Admin view all appointments" ON appointments
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Clients create appointments" ON appointments;
CREATE POLICY "Clients create appointments" ON appointments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = client_id AND status = 'pendiente');

DROP POLICY IF EXISTS "Professionals update their appointments" ON appointments;
CREATE POLICY "Professionals update their appointments" ON appointments
  FOR UPDATE USING ((SELECT auth.uid()) = professional_id)
  WITH CHECK ((SELECT auth.uid()) = professional_id);

DROP POLICY IF EXISTS "Clients update own appointments" ON appointments;
DROP POLICY IF EXISTS "Clients cancel own appointments" ON appointments;
CREATE POLICY "Clients cancel own appointments" ON appointments
  FOR UPDATE USING ((SELECT auth.uid()) = client_id)
  WITH CHECK ((SELECT auth.uid()) = client_id AND status = 'cancelada');

DROP POLICY IF EXISTS "Admin manages all appointments" ON appointments;
CREATE POLICY "Admin manages all appointments" ON appointments
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;
