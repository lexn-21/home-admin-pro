-- Anti-spam quota check function
CREATE OR REPLACE FUNCTION public.check_user_quota(_user_id uuid, _resource text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_pro boolean;
  _count int;
  _limit int;
BEGIN
  _is_pro := public.has_pro_access(_user_id, 'sandbox') OR public.has_pro_access(_user_id, 'live');

  IF _resource = 'property' THEN
    SELECT count(*) INTO _count FROM public.properties WHERE user_id = _user_id;
    _limit := CASE WHEN _is_pro THEN 50 ELSE 3 END;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Maximal % Immobilien erreicht. Upgrade auf Pro für mehr.', _limit USING ERRCODE = 'check_violation';
    END IF;

  ELSIF _resource = 'listing_published' THEN
    SELECT count(*) INTO _count FROM public.listings WHERE user_id = _user_id AND status = 'published';
    _limit := CASE WHEN _is_pro THEN 50 ELSE 3 END;
    IF _count >= _limit THEN
      RAISE EXCEPTION 'Maximal % aktive Inserate erreicht. Upgrade auf Pro für mehr.', _limit USING ERRCODE = 'check_violation';
    END IF;

  ELSIF _resource = 'application_daily' THEN
    SELECT count(*) INTO _count FROM public.applications
      WHERE seeker_user_id = _user_id AND created_at > now() - interval '24 hours';
    _limit := CASE WHEN _is_pro THEN 50 ELSE 5 END;
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

REVOKE EXECUTE ON FUNCTION public.check_user_quota(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_user_quota(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.tg_quota_property() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_user_quota(NEW.user_id, 'property'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_quota_listing() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'published') THEN
    PERFORM public.check_user_quota(NEW.user_id, 'listing_published');
  END IF;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.tg_quota_application() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.check_user_quota(NEW.seeker_user_id, 'application_daily'); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.tg_quota_ad_slot() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.advertiser_user_id IS NOT NULL THEN
    PERFORM public.check_user_quota(NEW.advertiser_user_id, 'ad_slot');
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS quota_property ON public.properties;
CREATE TRIGGER quota_property BEFORE INSERT ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.tg_quota_property();

DROP TRIGGER IF EXISTS quota_listing ON public.listings;
CREATE TRIGGER quota_listing BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.tg_quota_listing();

DROP TRIGGER IF EXISTS quota_application ON public.applications;
CREATE TRIGGER quota_application BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_quota_application();

DROP TRIGGER IF EXISTS quota_ad_slot ON public.ad_slots;
CREATE TRIGGER quota_ad_slot BEFORE INSERT ON public.ad_slots
  FOR EACH ROW EXECUTE FUNCTION public.tg_quota_ad_slot();