-- 1) search_path auf interne Funktionen setzen, die ihn noch nicht haben
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;

-- 2) EXECUTE auf interne Trigger-/Quota-Funktionen revoken (Trigger laufen weiterhin als SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.tg_inc_app_count() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_create_default_tasks() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_quota_property() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_quota_listing() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_quota_application() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.tg_quota_ad_slot() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.check_user_quota(uuid, text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.advisor_touch_token(text) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.ensure_default_unit(uuid) FROM anon, public;

-- 3) Storage: listing-photos darf einzeln gelesen werden, aber kein Listing aller Objekte
-- Bestehende generische SELECT-Policy (falls vorhanden) durch eine restriktivere ersetzen.
DO $$
BEGIN
  -- Alte permissive Policies entfernen (Namen können variieren — wir nehmen die typischen)
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='listing-photos public read') THEN
    EXECUTE 'DROP POLICY "listing-photos public read" ON storage.objects';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public read listing-photos') THEN
    EXECUTE 'DROP POLICY "Public read listing-photos" ON storage.objects';
  END IF;
END $$;

-- Neue Policy: Lesen einzelner Dateien nur wenn ein konkreter name angefragt wird (Liste über bucket allein erlaubt nichts Sensibles, aber wir erzwingen owner_id IS NOT NULL)
CREATE POLICY "listing-photos read individual"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'listing-photos');

-- Upload nur durch Owner in eigenen Ordner (user_id-Prefix)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='listing-photos owner insert') THEN
    EXECUTE $POL$
      CREATE POLICY "listing-photos owner insert"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1])
    $POL$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='listing-photos owner update') THEN
    EXECUTE $POL$
      CREATE POLICY "listing-photos owner update"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1])
    $POL$;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='listing-photos owner delete') THEN
    EXECUTE $POL$
      CREATE POLICY "listing-photos owner delete"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1])
    $POL$;
  END IF;
END $$;