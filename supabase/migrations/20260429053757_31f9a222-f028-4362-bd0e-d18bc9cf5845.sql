
-- Vault categories
DO $$ BEGIN
  CREATE TYPE public.vault_category AS ENUM (
    'kaufvertrag','mietvertrag','nebenkostenabrechnung','versicherung',
    'steuerbescheid','grundbuch','energieausweis','foto','rechnung',
    'protokoll','korrespondenz','sonstiges'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.vault_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID,
  tenant_id UUID,
  category public.vault_category NOT NULL DEFAULT 'sonstiges',
  display_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  enc_salt TEXT NOT NULL,
  enc_iv TEXT NOT NULL,
  notes TEXT,
  retention_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own vault docs all" ON public.vault_documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS vault_docs_user_idx ON public.vault_documents(user_id);
CREATE INDEX IF NOT EXISTS vault_docs_property_idx ON public.vault_documents(property_id);

CREATE TRIGGER vault_docs_updated BEFORE UPDATE ON public.vault_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PIN verification (stores only a verification token encrypted with derived key)
CREATE TABLE IF NOT EXISTS public.vault_settings (
  user_id UUID PRIMARY KEY,
  pin_salt TEXT NOT NULL,
  verifier_iv TEXT NOT NULL,
  verifier_ct TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vault_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own vault settings all" ON public.vault_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER vault_settings_updated BEFORE UPDATE ON public.vault_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: users can only access files under their own user_id/ prefix
CREATE POLICY "vault read own" ON storage.objects
  FOR SELECT USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "vault insert own" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "vault update own" ON storage.objects
  FOR UPDATE USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "vault delete own" ON storage.objects
  FOR DELETE USING (bucket_id = 'vault' AND auth.uid()::text = (storage.foldername(name))[1]);
