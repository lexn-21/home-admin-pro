
-- =========================================================
-- 1. PROPERTIES: fehlende Felder ergänzen
-- =========================================================
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS area_sqm numeric,
  ADD COLUMN IF NOT EXISTS rooms numeric,
  ADD COLUMN IF NOT EXISTS cold_rent numeric,
  ADD COLUMN IF NOT EXISTS utilities numeric,
  ADD COLUMN IF NOT EXISTS deposit numeric,
  ADD COLUMN IF NOT EXISTS sonderafa_7b boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'rented',
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS notes text;

-- =========================================================
-- 2. TENANTS: direkter property_id-Bezug + since + notes
-- =========================================================
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS property_id uuid,
  ADD COLUMN IF NOT EXISTS since date,
  ADD COLUMN IF NOT EXISTS notes text,
  ALTER COLUMN unit_id DROP NOT NULL;

-- name als Alias für full_name (View-freundlich): wir nutzen full_name weiter, kein Rename
-- =========================================================
-- 3. PAYMENTS: property_id, month (text), type, status, notes
-- =========================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_simple') THEN
    CREATE TYPE public.payment_status_simple AS ENUM ('paid','open','late');
  END IF;
END $$;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS property_id uuid,
  ADD COLUMN IF NOT EXISTS month text,
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'rent',
  ADD COLUMN IF NOT EXISTS status public.payment_status_simple DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS notes text,
  ALTER COLUMN unit_id DROP NOT NULL;

-- =========================================================
-- 4. EXPENSES: type, contractor, classification
-- =========================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_classification') THEN
    CREATE TYPE public.expense_classification AS ENUM ('maintenance','production','anschaffungsnah');
  END IF;
END $$;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS contractor text,
  ADD COLUMN IF NOT EXISTS classification public.expense_classification NOT NULL DEFAULT 'maintenance';

-- =========================================================
-- 5. TASKS (neue Tabelle)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid,
  title text NOT NULL,
  description text,
  category text,
  due_date date,
  done boolean NOT NULL DEFAULT false,
  legal_ref text,
  legal_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own tasks all" ON public.tasks;
CREATE POLICY "own tasks all" ON public.tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS tasks_set_updated_at ON public.tasks;
CREATE TRIGGER tasks_set_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 6. CONTRACT_TEMPLATES (öffentlich lesbar)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  source text,
  url text,
  format text,
  is_free boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "templates public read" ON public.contract_templates;
CREATE POLICY "templates public read" ON public.contract_templates
  FOR SELECT USING (active = true);

-- =========================================================
-- 7. ADVISOR_DIRECTORY (öffentlich lesbar)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.advisor_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  firm text,
  address text,
  zip text,
  city text,
  phone text,
  email text,
  website text,
  immobilien_focus boolean NOT NULL DEFAULT false,
  partner_status text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_directory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advisor_directory public read" ON public.advisor_directory;
CREATE POLICY "advisor_directory public read" ON public.advisor_directory
  FOR SELECT USING (active = true);

-- =========================================================
-- 8. AUTO-FRISTEN beim Anlegen eines Objekts
-- =========================================================
CREATE OR REPLACE FUNCTION public.tg_create_default_tasks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _y int := EXTRACT(YEAR FROM COALESCE(NEW.purchase_date, CURRENT_DATE))::int;
  _next_year int := EXTRACT(YEAR FROM CURRENT_DATE)::int + 1;
BEGIN
  INSERT INTO public.tasks(user_id, property_id, title, description, category, due_date, legal_ref, legal_url) VALUES
  (NEW.user_id, NEW.id,
   'NK-Abrechnung ' || _next_year - 1 || ' erstellen',
   'Nebenkostenabrechnung für ' || NEW.name || ' erstellen und an Mieter verschicken.',
   'Abrechnung',
   make_date(_next_year, 12, 31),
   '§ 556 Abs. 3 BGB',
   'https://www.gesetze-im-internet.de/bgb/__556.html'),
  (NEW.user_id, NEW.id,
   'Heizkostenabrechnung erstellen',
   'Verbrauchsabhängige Heizkostenabrechnung für ' || NEW.name || '.',
   'Abrechnung',
   make_date(_next_year, 12, 31),
   'HeizkostenV',
   'https://www.gesetze-im-internet.de/heizkostenv/'),
  (NEW.user_id, NEW.id,
   'Steuererklärung Anlage V vorbereiten',
   'Anlage V (Einkünfte aus Vermietung und Verpachtung) vorbereiten.',
   'Steuer',
   make_date(_next_year, 7, 31),
   '§ 21 EStG',
   'https://www.gesetze-im-internet.de/estg/__21.html'),
  (NEW.user_id, NEW.id,
   'Energieausweis-Gültigkeit prüfen',
   'Gültigkeit des Energieausweises prüfen — gilt 10 Jahre.',
   'Recht',
   make_date(_y + 10, 12, 31),
   '§ 80 GEG',
   'https://www.gesetze-im-internet.de/geg/__80.html');
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS properties_create_default_tasks ON public.properties;
CREATE TRIGGER properties_create_default_tasks
  AFTER INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.tg_create_default_tasks();

-- =========================================================
-- 9. STORAGE BUCKET "documents"
-- =========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "documents own read" ON storage.objects;
CREATE POLICY "documents own read" ON storage.objects
  FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "documents own insert" ON storage.objects;
CREATE POLICY "documents own insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "documents own update" ON storage.objects;
CREATE POLICY "documents own update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "documents own delete" ON storage.objects;
CREATE POLICY "documents own delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =========================================================
-- 10. SEED-DATEN: 3 Steuerberater
-- =========================================================
INSERT INTO public.advisor_directory (name, firm, address, zip, city, phone, email, website, immobilien_focus, partner_status) VALUES
('Max Mustermann', 'Mustermann Steuerberatung', 'Hauptstraße 12', '48143', 'Münster', '+49 251 1234567', 'kontakt@mustermann-stb.de', 'https://mustermann-stb.de', true, 'partner'),
('Dr. Anna Schmidt', 'Schmidt & Partner', 'Marktplatz 5', '48231', 'Warendorf', '+49 2581 7654321', 'info@schmidt-partner.de', 'https://schmidt-partner.de', true, 'verified'),
('Klaus Weber', 'Weber Steuerkanzlei', 'Bahnhofstr. 22', '59269', 'Beckum', '+49 2521 998877', 'kanzlei@weber-stb.de', NULL, false, 'listed')
ON CONFLICT DO NOTHING;

-- =========================================================
-- 11. SEED-DATEN: 8 Vertragsvorlagen
-- =========================================================
INSERT INTO public.contract_templates (title, description, category, source, url, format, is_free, sort_order) VALUES
('Mietvertrag Wohnraum', 'Rechtssicherer Mietvertrag, regelmäßig an BGH-Updates angepasst.', 'Mietvertrag', 'Haus & Grund', 'https://www.hausundgrund.de/mietvertrag', 'PDF', false, 10),
('Mietvertrag (Mieterbund-Variante)', 'Ausgewogener Mietvertrag aus Sicht beider Parteien.', 'Mietvertrag', 'Mieterbund', 'https://www.mieterbund.de/mietrecht/mietvertrag.html', 'PDF', false, 20),
('Wohnungs-Übergabeprotokoll', 'Protokoll für Ein- und Auszug mit Zählerständen und Mängelliste.', 'Übergabe', 'Haus & Grund', 'https://www.hausundgrund.de/uebergabeprotokoll', 'PDF', false, 30),
('Kündigungsschreiben Mietverhältnis', 'Mustertext für ordentliche Kündigung.', 'Kündigung', 'Mieterbund', 'https://www.mieterbund.de/mietrecht/kuendigung.html', 'DOCX', true, 40),
('Mieterhöhung § 558 BGB', 'Mieterhöhung bis zur ortsüblichen Vergleichsmiete.', 'Mieterhöhung', 'Haus & Grund', 'https://www.hausundgrund.de/mieterhoehung', 'PDF', false, 50),
('Hausordnung', 'Vorlage für eine vermieterseitige Hausordnung.', 'Hausordnung', 'Haus & Grund', 'https://www.hausundgrund.de/hausordnung', 'PDF', false, 60),
('Mieter-Selbstauskunft', 'Strukturierter Bewerberbogen mit Bonitätsangaben.', 'Bewerbung', 'Immowelt', 'https://www.immowelt.de/ratgeber/vermieten/selbstauskunft', 'PDF', true, 70),
('Nebenkostenabrechnung-Vorlage', 'Strukturierte NK-Abrechnung nach BetrKV.', 'Abrechnung', 'IHK', 'https://www.ihk.de/nebenkosten', 'XLSX', true, 80)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 12. Schema-Reload
-- =========================================================
NOTIFY pgrst, 'reload schema';
