CREATE TABLE IF NOT EXISTS public.notification_prefs (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_application boolean NOT NULL DEFAULT true,
  email_application_status boolean NOT NULL DEFAULT true,
  email_ad_moderation boolean NOT NULL DEFAULT true,
  email_invoice boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own prefs select" ON public.notification_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own prefs insert" ON public.notification_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prefs update" ON public.notification_prefs FOR UPDATE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.notify_get_listing_owner_email(_listing_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _owner uuid; _email text; _opt boolean; _title text;
BEGIN
  SELECT l.user_id, l.title INTO _owner, _title FROM public.listings l WHERE l.id = _listing_id AND l.status = 'published';
  IF _owner IS NULL THEN RETURN NULL; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.applications WHERE listing_id = _listing_id AND seeker_user_id = auth.uid()) THEN RETURN NULL; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _owner;
  SELECT COALESCE(email_new_application, true) INTO _opt FROM public.notification_prefs WHERE user_id = _owner;
  IF _opt IS NULL THEN _opt := true; END IF;
  RETURN jsonb_build_object('email', _email, 'opted_in', _opt, 'listing_title', _title);
END; $$;

CREATE OR REPLACE FUNCTION public.notify_get_ad_advertiser_email(_ad_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _adv uuid; _email text; _opt boolean; _title text;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN NULL; END IF;
  SELECT a.advertiser_user_id, a.title INTO _adv, _title FROM public.ad_slots a WHERE a.id = _ad_id;
  IF _adv IS NULL THEN RETURN NULL; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _adv;
  SELECT COALESCE(email_ad_moderation, true) INTO _opt FROM public.notification_prefs WHERE user_id = _adv;
  IF _opt IS NULL THEN _opt := true; END IF;
  RETURN jsonb_build_object('email', _email, 'opted_in', _opt, 'ad_title', _title);
END; $$;

CREATE OR REPLACE FUNCTION public.notify_get_application_seeker_email(_application_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _seeker uuid; _owner uuid; _email text; _opt boolean; _title text;
BEGIN
  SELECT a.seeker_user_id, a.owner_user_id, l.title INTO _seeker, _owner, _title
  FROM public.applications a JOIN public.listings l ON l.id = a.listing_id WHERE a.id = _application_id;
  IF _seeker IS NULL OR _owner <> auth.uid() THEN RETURN NULL; END IF;
  SELECT email INTO _email FROM auth.users WHERE id = _seeker;
  SELECT COALESCE(email_application_status, true) INTO _opt FROM public.notification_prefs WHERE user_id = _seeker;
  IF _opt IS NULL THEN _opt := true; END IF;
  RETURN jsonb_build_object('email', _email, 'opted_in', _opt, 'listing_title', _title);
END; $$;

GRANT EXECUTE ON FUNCTION public.notify_get_listing_owner_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_get_ad_advertiser_email(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_get_application_seeker_email(uuid) TO authenticated;