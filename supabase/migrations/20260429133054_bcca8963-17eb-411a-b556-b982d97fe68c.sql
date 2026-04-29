-- Bonitäts-Checks
CREATE TABLE IF NOT EXISTS public.bonitaets_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid,
  seeker_user_id uuid NOT NULL,
  owner_user_id uuid,
  provider text NOT NULL DEFAULT 'mock',
  status text NOT NULL DEFAULT 'pending',
  score integer,
  rating text,
  paid_amount numeric DEFAULT 0,
  report_path text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bonitaets_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seeker own bonitaet"
ON public.bonitaets_checks FOR ALL
USING (auth.uid() = seeker_user_id)
WITH CHECK (auth.uid() = seeker_user_id);

CREATE POLICY "owner read shared bonitaet"
ON public.bonitaets_checks FOR SELECT
USING (auth.uid() = owner_user_id AND status = 'completed');

CREATE TRIGGER trg_bonitaet_updated
BEFORE UPDATE ON public.bonitaets_checks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- KI-Score auf Bewerbungen
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS ai_score integer,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_strengths text[],
  ADD COLUMN IF NOT EXISTS ai_concerns text[],
  ADD COLUMN IF NOT EXISTS ai_scored_at timestamptz,
  ADD COLUMN IF NOT EXISTS bonitaet_check_id uuid;

-- KI-Felder auf Listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS ai_description text,
  ADD COLUMN IF NOT EXISTS ai_suggested_rent numeric,
  ADD COLUMN IF NOT EXISTS ai_generated_at timestamptz;