-- Admin-Tabelle (separat von profiles, sicher)
CREATE TABLE IF NOT EXISTS public.app_admins (
  user_id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.app_admins ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin(_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.app_admins WHERE user_id = _user) $$;

CREATE POLICY "admins read own" ON public.app_admins FOR SELECT USING (auth.uid() = user_id);

-- ad_slots erweitern
ALTER TABLE public.ad_slots
  ADD COLUMN IF NOT EXISTS advertiser_user_id uuid,
  ADD COLUMN IF NOT EXISTS moderation_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS paid_until timestamptz,
  ADD COLUMN IF NOT EXISTS impressions_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS clicks_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

-- alte public-read-policy ersetzen: nur approved + bezahlt sichtbar
DROP POLICY IF EXISTS "ad_slots public read active" ON public.ad_slots;
CREATE POLICY "ad_slots public read active" ON public.ad_slots FOR SELECT USING (
  active = true
  AND moderation_status = 'approved'
  AND starts_at <= now()
  AND (ends_at IS NULL OR ends_at > now())
  AND (advertiser_user_id IS NULL OR (paid_until IS NOT NULL AND paid_until > now()))
);

-- Werbetreibende: eigene Slots sehen/erstellen/ändern
CREATE POLICY "ad_slots advertiser read own" ON public.ad_slots FOR SELECT
  USING (auth.uid() = advertiser_user_id);
CREATE POLICY "ad_slots advertiser insert" ON public.ad_slots FOR INSERT
  WITH CHECK (
    auth.uid() = advertiser_user_id
    AND moderation_status = 'pending'
    AND advertiser_user_id IS NOT NULL
  );
CREATE POLICY "ad_slots advertiser update own" ON public.ad_slots FOR UPDATE
  USING (auth.uid() = advertiser_user_id)
  WITH CHECK (auth.uid() = advertiser_user_id AND moderation_status IN ('pending','paused'));
CREATE POLICY "ad_slots advertiser delete own" ON public.ad_slots FOR DELETE
  USING (auth.uid() = advertiser_user_id AND (paid_until IS NULL OR paid_until < now()));

-- Admins: volle Rechte
CREATE POLICY "ad_slots admin all" ON public.ad_slots FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- ad_slots_for: nur approved + paid_until ok
CREATE OR REPLACE FUNCTION public.ad_slots_for(_placement text, _zip text DEFAULT NULL, _city text DEFAULT NULL, _kind text DEFAULT NULL, _limit integer DEFAULT 6)
RETURNS SETOF ad_slots LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.ad_slots a
  WHERE a.active = true
    AND a.moderation_status = 'approved'
    AND a.starts_at <= now()
    AND (a.ends_at IS NULL OR a.ends_at > now())
    AND (a.advertiser_user_id IS NULL OR (a.paid_until IS NOT NULL AND a.paid_until > now()))
    AND a.placement = _placement
    AND (a.target_kind IS NULL OR _kind IS NULL OR a.target_kind = _kind)
    AND (
      cardinality(a.target_zips) = 0 OR _zip IS NULL OR _zip = ANY(a.target_zips)
      OR EXISTS (SELECT 1 FROM unnest(a.target_zips) z WHERE _zip LIKE (substr(z,1,3) || '%'))
    )
    AND (cardinality(a.target_cities) = 0 OR _city IS NULL OR _city = ANY(a.target_cities))
  ORDER BY
    (CASE WHEN _zip IS NOT NULL AND _zip = ANY(a.target_zips) THEN 0 ELSE 1 END),
    (CASE WHEN _city IS NOT NULL AND _city = ANY(a.target_cities) THEN 0 ELSE 1 END),
    a.priority DESC, a.created_at DESC
  LIMIT _limit;
$$;

-- ad_orders Tabelle
CREATE TABLE IF NOT EXISTS public.ad_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ad_slot_id uuid NOT NULL,
  stripe_session_id text,
  stripe_payment_intent text,
  status text NOT NULL DEFAULT 'pending',
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  duration_days integer NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ad_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_orders own read" ON public.ad_orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ad_orders own insert" ON public.ad_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ad_orders service all" ON public.ad_orders FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "ad_orders admin read" ON public.ad_orders FOR SELECT USING (public.is_admin(auth.uid()));

-- Tracking-Funktion (anonym, atomar)
CREATE OR REPLACE FUNCTION public.ad_track_event(_ad_id uuid, _event_type text, _zip text DEFAULT NULL, _city text DEFAULT NULL, _listing_id uuid DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF _event_type NOT IN ('impression','click') THEN
    RAISE EXCEPTION 'invalid event_type';
  END IF;
  INSERT INTO public.ad_events(ad_id, event_type, context_zip, context_city, context_listing_id)
  VALUES (_ad_id, _event_type, _zip, _city, _listing_id);
  IF _event_type = 'impression' THEN
    UPDATE public.ad_slots SET impressions_count = impressions_count + 1 WHERE id = _ad_id;
  ELSE
    UPDATE public.ad_slots SET clicks_count = clicks_count + 1 WHERE id = _ad_id;
  END IF;
END; $$;

-- Trigger: updated_at
CREATE TRIGGER ad_orders_updated BEFORE UPDATE ON public.ad_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX IF NOT EXISTS idx_ad_slots_advertiser ON public.ad_slots(advertiser_user_id);
CREATE INDEX IF NOT EXISTS idx_ad_orders_user ON public.ad_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_orders_session ON public.ad_orders(stripe_session_id);