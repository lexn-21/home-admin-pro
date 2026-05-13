-- Mieter-Dokumente: Mietvertrag, Perso, SCHUFA, etc.
CREATE TYPE public.tenant_doc_kind AS ENUM ('contract','id','schufa','income','handover','other');

CREATE TABLE public.tenant_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  kind public.tenant_doc_kind NOT NULL DEFAULT 'other',
  name text NOT NULL,
  path text NOT NULL,
  size_bytes integer,
  mime text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_documents_tenant ON public.tenant_documents(tenant_id);

ALTER TABLE public.tenant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own tenant_documents all"
ON public.tenant_documents FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Mieter-Notizen (frei) — einfache, append-only Liste
CREATE TABLE public.tenant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tenant_notes_tenant ON public.tenant_notes(tenant_id);

ALTER TABLE public.tenant_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own tenant_notes all"
ON public.tenant_notes FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Storage Policies für documents-Bucket: User darf in eigenem Ordner CRUDen
DO $$ BEGIN
  CREATE POLICY "documents own select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "documents own insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "documents own delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;