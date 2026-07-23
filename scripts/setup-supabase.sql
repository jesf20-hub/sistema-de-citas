-- ============================================================================
-- SETUP inicial de Supabase
-- ============================================================================
-- Ejecutar una sola vez en el SQL Editor de Supabase (es idempotente).
-- Requisito: schema.sql o migrations/001_security_hardening.sql ya aplicados.
-- ============================================================================

BEGIN;

-- 1. Bucket de avatares (para uploadAvatar)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- 2. RLS de storage: cada usuario gestiona solo SUS avatares
--    La carpeta es '<user_id>/<archivo>' — la policy valida que el primer
--    segmento del path coincida con el auth.uid() del usuario autenticado.
DROP POLICY IF EXISTS "Users manage own avatar" ON storage.objects;
CREATE POLICY "Users manage own avatar" ON storage.objects
  FOR ALL
  USING (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
  );

-- 3. Asegurar acceso público de lectura a los avatares
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. Supabase Realtime para citas (actualizaciones en vivo en dashboards)
--    Primero verificamos si la tabla ya está en la publicación.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'appointments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
END $$;

COMMIT;

-- ============================================================================
-- Verificación (descomentar para chequear)
-- ============================================================================
-- SELECT * FROM storage.buckets WHERE name = 'avatars';
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
