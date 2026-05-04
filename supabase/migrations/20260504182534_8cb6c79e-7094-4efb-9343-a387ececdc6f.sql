-- Extend listing_kind enum
ALTER TYPE public.listing_kind ADD VALUE IF NOT EXISTS 'wg_room';

-- Extend listings with WG fields
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS wg_total_rooms INTEGER,
  ADD COLUMN IF NOT EXISTS wg_current_flatmates INTEGER,
  ADD COLUMN IF NOT EXISTS wg_room_size_sqm NUMERIC,
  ADD COLUMN IF NOT EXISTS wg_furnished BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS wg_shared_facilities JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS wg_flatmate_age_min INTEGER,
  ADD COLUMN IF NOT EXISTS wg_flatmate_age_max INTEGER,
  ADD COLUMN IF NOT EXISTS wg_flatmate_gender_pref TEXT,
  ADD COLUMN IF NOT EXISTS students_welcome BOOLEAN DEFAULT false;

-- Extend seeker_profiles
ALTER TABLE public.seeker_profiles
  ADD COLUMN IF NOT EXISTS is_student BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS university TEXT,
  ADD COLUMN IF NOT EXISTS study_program TEXT,
  ADD COLUMN IF NOT EXISTS study_semester INTEGER,
  ADD COLUMN IF NOT EXISTS bafoeg_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS guarantor_name TEXT,
  ADD COLUMN IF NOT EXISTS guarantor_relation TEXT,
  ADD COLUMN IF NOT EXISTS guarantor_income NUMERIC,
  ADD COLUMN IF NOT EXISTS guarantor_document_path TEXT,
  ADD COLUMN IF NOT EXISTS study_certificate_path TEXT;

-- WG member links (invite flatmates to vote)
CREATE TABLE IF NOT EXISTS public.wg_member_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL,
  member_email TEXT,
  member_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'decision_maker',
  token TEXT NOT NULL UNIQUE DEFAULT encode(extensions.gen_random_bytes(24), 'hex'),
  revoked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '180 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_accessed_at TIMESTAMPTZ
);
ALTER TABLE public.wg_member_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wg_member_links own all" ON public.wg_member_links
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Application votes
CREATE TABLE IF NOT EXISTS public.application_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL,
  member_link_id UUID NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('yes','no','maybe')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (application_id, member_link_id)
);
ALTER TABLE public.application_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "application_votes owner read"
  ON public.application_votes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.applications a
    WHERE a.id = application_votes.application_id AND a.owner_user_id = auth.uid()
  ));

-- Tenant portal: NKA listing for tenant
CREATE OR REPLACE FUNCTION public.tenant_portal_get_nka(_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _link RECORD;
BEGIN
  SELECT * INTO _link FROM public.tenant_portal_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object(
      'id', d.id,
      'period_id', d.period_id,
      'year', p.year,
      'period_start', p.period_start,
      'period_end', p.period_end,
      'vorauszahlung_summe', d.vorauszahlung_summe,
      'ist_summe', d.ist_summe,
      'saldo', d.saldo,
      'pdf_path', d.pdf_path,
      'sent_at', d.sent_at,
      'breakdown', d.breakdown
    ) ORDER BY p.year DESC)
    FROM public.nka_distributions d
    JOIN public.nka_periods p ON p.id = d.period_id
    WHERE d.tenant_id = _link.tenant_id AND d.sent_at IS NOT NULL
  ), '[]'::jsonb);
END; $$;

-- Tenant portal: signed PDF url (uses storage RLS bypass via security definer)
CREATE OR REPLACE FUNCTION public.tenant_portal_nka_pdf_path(_token TEXT, _distribution_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _link RECORD; _path TEXT;
BEGIN
  SELECT * INTO _link FROM public.tenant_portal_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT pdf_path INTO _path FROM public.nka_distributions
   WHERE id = _distribution_id AND tenant_id = _link.tenant_id;
  RETURN _path;
END; $$;

-- WG-Casting: resolve token
CREATE OR REPLACE FUNCTION public.wg_casting_resolve(_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _link RECORD;
BEGIN
  SELECT * INTO _link FROM public.wg_member_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  UPDATE public.wg_member_links SET last_accessed_at = now() WHERE id = _link.id;
  RETURN jsonb_build_object(
    'member', jsonb_build_object('name', _link.member_name, 'role', _link.role),
    'listing', (SELECT to_jsonb(l) FROM public.listings l WHERE l.id = _link.listing_id),
    'applications', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'status', a.status,
        'cover_message', a.cover_message,
        'snapshot_profile', a.snapshot_profile,
        'ai_score', a.ai_score,
        'ai_summary', a.ai_summary,
        'created_at', a.created_at,
        'my_vote', (SELECT v.vote FROM public.application_votes v
                    WHERE v.application_id = a.id AND v.member_link_id = _link.id),
        'votes', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'vote', v.vote, 'comment', v.comment,
            'member_name', m.member_name
          ))
          FROM public.application_votes v
          JOIN public.wg_member_links m ON m.id = v.member_link_id
          WHERE v.application_id = a.id
        ), '[]'::jsonb)
      ) ORDER BY a.created_at DESC)
      FROM public.applications a
      WHERE a.listing_id = _link.listing_id
    ), '[]'::jsonb)
  );
END; $$;

-- WG-Casting: cast vote
CREATE OR REPLACE FUNCTION public.wg_casting_vote(
  _token TEXT, _application_id UUID, _vote TEXT, _comment TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _link RECORD; _new UUID; _listing UUID;
BEGIN
  SELECT * INTO _link FROM public.wg_member_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid token'; END IF;
  IF _vote NOT IN ('yes','no','maybe') THEN RAISE EXCEPTION 'invalid vote'; END IF;
  -- ensure application belongs to listing
  SELECT listing_id INTO _listing FROM public.applications WHERE id = _application_id;
  IF _listing IS NULL OR _listing <> _link.listing_id THEN
    RAISE EXCEPTION 'application not in listing';
  END IF;
  INSERT INTO public.application_votes(application_id, member_link_id, vote, comment)
  VALUES (_application_id, _link.id, _vote, _comment)
  ON CONFLICT (application_id, member_link_id)
    DO UPDATE SET vote = EXCLUDED.vote, comment = EXCLUDED.comment, created_at = now()
  RETURNING id INTO _new;
  RETURN _new;
END; $$;