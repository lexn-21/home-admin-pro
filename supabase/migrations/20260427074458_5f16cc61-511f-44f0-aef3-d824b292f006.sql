-- Tax advisor invitations
CREATE TABLE public.advisor_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_name TEXT NOT NULL,
  advisor_email TEXT,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days'),
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own advisor_links all"
ON public.advisor_links FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_advisor_links_updated_at
BEFORE UPDATE ON public.advisor_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_advisor_links_token ON public.advisor_links(token) WHERE revoked = false;

-- Security definer function to validate a token and return the owner user_id
CREATE OR REPLACE FUNCTION public.advisor_owner_for_token(_token TEXT)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id
  FROM public.advisor_links
  WHERE token = _token
    AND revoked = false
    AND expires_at > now()
  LIMIT 1;
$$;

-- Function to log access (increments counter, sets last_accessed_at)
CREATE OR REPLACE FUNCTION public.advisor_touch_token(_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner UUID;
BEGIN
  SELECT user_id INTO _owner
  FROM public.advisor_links
  WHERE token = _token AND revoked = false AND expires_at > now()
  LIMIT 1;

  IF _owner IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.advisor_links
  SET last_accessed_at = now(),
      access_count = access_count + 1
  WHERE token = _token;

  RETURN _owner;
END;
$$;

-- Read-only edge-style RPCs that return data scoped by token
CREATE OR REPLACE FUNCTION public.advisor_get_data(_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner UUID;
  _result JSONB;
BEGIN
  SELECT public.advisor_owner_for_token(_token) INTO _owner;
  IF _owner IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_build_object(
    'owner_name', (SELECT display_name FROM public.profiles WHERE user_id = _owner),
    'properties', COALESCE((SELECT jsonb_agg(to_jsonb(p)) FROM public.properties p WHERE p.user_id = _owner), '[]'::jsonb),
    'units',      COALESCE((SELECT jsonb_agg(to_jsonb(u)) FROM public.units u WHERE u.user_id = _owner), '[]'::jsonb),
    'tenants',    COALESCE((SELECT jsonb_agg(to_jsonb(t)) FROM public.tenants t WHERE t.user_id = _owner), '[]'::jsonb),
    'payments',   COALESCE((SELECT jsonb_agg(to_jsonb(pa)) FROM public.payments pa WHERE pa.user_id = _owner), '[]'::jsonb),
    'expenses',   COALESCE((SELECT jsonb_agg(to_jsonb(e)) FROM public.expenses e WHERE e.user_id = _owner), '[]'::jsonb)
  ) INTO _result;

  RETURN _result;
END;
$$;

-- Allow anon + authenticated to call the public RPCs (token is the auth)
GRANT EXECUTE ON FUNCTION public.advisor_get_data(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.advisor_touch_token(TEXT) TO anon, authenticated;