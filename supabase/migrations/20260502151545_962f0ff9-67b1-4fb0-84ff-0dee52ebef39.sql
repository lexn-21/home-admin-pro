CREATE OR REPLACE FUNCTION public.user_plan_tier(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _price text;
  _active boolean;
BEGIN
  -- Aktives bezahltes Abo (sandbox ODER live)
  SELECT s.price_id,
         (s.status IN ('active','trialing','past_due') AND (s.current_period_end IS NULL OR s.current_period_end > now()))
         OR (s.status = 'canceled' AND s.current_period_end IS NOT NULL AND s.current_period_end > now())
    INTO _price, _active
    FROM public.subscriptions s
   WHERE s.user_id = _user_id
   ORDER BY s.created_at DESC
   LIMIT 1;

  IF _active THEN
    IF _price IN ('pro_monthly','pro_yearly') THEN RETURN 'pro'; END IF;
    IF _price IN ('verwalten_plus_monthly','verwalten_plus_yearly') THEN RETURN 'verwalten_plus'; END IF;
  END IF;

  -- 30-Tage-Pro-Trial
  IF EXISTS (
    SELECT 1 FROM public.profiles
     WHERE user_id = _user_id AND created_at > (now() - interval '30 days')
  ) THEN
    RETURN 'pro';
  END IF;

  RETURN 'free';
END;
$$;

CREATE OR REPLACE FUNCTION public.check_user_quota(_user_id uuid, _resource text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _tier text;
  _count int;
  _limit int;
BEGIN
  _tier := public.user_plan_tier(_user_id);

  IF _resource = 'property' THEN
    SELECT count(*) INTO _count FROM public.properties WHERE user_id = _user_id;
    _limit := CASE _tier WHEN 'pro' THEN 50 WHEN 'verwalten_plus' THEN 5 ELSE 1 END;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Maximal % Immobilie(n) erreicht. Upgrade auf einen höheren Plan für mehr.', _limit USING ERRCODE = 'check_violation';
    END IF;

  ELSIF _resource = 'listing_published' THEN
    SELECT count(*) INTO _count FROM public.listings WHERE user_id = _user_id AND status = 'published';
    _limit := CASE _tier WHEN 'pro' THEN 50 WHEN 'verwalten_plus' THEN 5 ELSE 1 END;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Maximal % aktive Inserate erreicht. Upgrade für mehr.', _limit USING ERRCODE = 'check_violation';
    END IF;

  ELSIF _resource = 'application_daily' THEN
    SELECT count(*) INTO _count FROM public.applications
      WHERE seeker_user_id = _user_id AND created_at > now() - interval '24 hours';
    _limit := CASE _tier WHEN 'pro' THEN 50 WHEN 'verwalten_plus' THEN 20 ELSE 3 END;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Tageslimit von % Bewerbungen erreicht. Morgen wieder neue Chancen!', _limit USING ERRCODE = 'check_violation';
    END IF;

  ELSIF _resource = 'ad_slot' THEN
    SELECT count(*) INTO _count FROM public.ad_slots
      WHERE advertiser_user_id = _user_id AND created_at > now() - interval '7 days';
    _limit := 10;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Maximal % Werbeplätze pro Woche.', _limit USING ERRCODE = 'check_violation';
    END IF;
  END IF;
END;
$$;