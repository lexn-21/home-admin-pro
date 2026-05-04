CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text NOT NULL,
  environment text NOT NULL,
  event_type text,
  processed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (event_id, environment)
);
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service_role (bypasses RLS) may access.

CREATE TABLE IF NOT EXISTS public.ai_usage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ai_usage_log_user_day_idx
  ON public.ai_usage_log (user_id, function_name, created_at DESC);
ALTER TABLE public.ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own ai usage"
  ON public.ai_usage_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.check_ai_quota(_user_id uuid, _function text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _tier text;
  _used int;
  _limit int;
BEGIN
  _tier := public.user_plan_tier(_user_id);
  _limit := CASE _tier
    WHEN 'pro' THEN 500
    WHEN 'verwalten_plus' THEN 50
    ELSE 3
  END;
  SELECT count(*) INTO _used FROM public.ai_usage_log
   WHERE user_id = _user_id
     AND function_name = _function
     AND created_at > now() - interval '24 hours';
  IF _used >= _limit THEN
    RAISE EXCEPTION 'KI-Tageslimit erreicht (% von % Calls). Upgrade für mehr.', _used, _limit
      USING ERRCODE = 'check_violation';
  END IF;
  INSERT INTO public.ai_usage_log(user_id, function_name) VALUES (_user_id, _function);
END;
$$;