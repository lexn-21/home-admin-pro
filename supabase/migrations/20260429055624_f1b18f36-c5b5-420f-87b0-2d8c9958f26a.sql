CREATE TABLE public.market_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip TEXT NOT NULL UNIQUE,
  city TEXT,
  avg_rent_sqm NUMERIC(8,2) NOT NULL,
  avg_purchase_sqm NUMERIC(10,2) NOT NULL,
  yield_factor NUMERIC(5,2) NOT NULL,
  avg_utilities_sqm NUMERIC(6,2) DEFAULT 2.50,
  vacancy_rate NUMERIC(4,2) DEFAULT 2.50,
  sample_size INT DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_index ENABLE ROW LEVEL SECURITY;
CREATE POLICY "market_index public read" ON public.market_index FOR SELECT USING (true);

CREATE TYPE provider_category AS ENUM (
  'sanitaer','elektrik','heizung','dach','maler','garten',
  'reinigung','schluessel','schaedling','steuerberater','jurist','energieberater'
);

CREATE TABLE public.providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category provider_category NOT NULL,
  city TEXT, zip TEXT,
  lat NUMERIC(9,6), lng NUMERIC(9,6),
  phone TEXT, email TEXT, website TEXT,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INT DEFAULT 0,
  premium BOOLEAN DEFAULT false,
  hourly_rate NUMERIC(7,2),
  response_time_hours INT DEFAULT 24,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers public read" ON public.providers FOR SELECT USING (true);

CREATE TYPE booking_status AS ENUM ('requested','quoted','accepted','in_progress','completed','cancelled','disputed');

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_id UUID REFERENCES public.providers(id),
  property_id UUID,
  category provider_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  urgency TEXT DEFAULT 'normal',
  budget_estimate NUMERIC(10,2),
  quoted_amount NUMERIC(10,2),
  final_amount NUMERIC(10,2),
  commission_rate NUMERIC(5,2) DEFAULT 10.00,
  commission_amount NUMERIC(10,2),
  status booking_status NOT NULL DEFAULT 'requested',
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  rating INT,
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bookings all" ON public.bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER bookings_updated BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tenant_portal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24),'hex'),
  revoked BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '365 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_portal_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tenant portal links" ON public.tenant_portal_links FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TYPE issue_status AS ENUM ('open','acknowledged','in_progress','resolved','closed');
CREATE TYPE issue_severity AS ENUM ('info','minor','major','urgent');

CREATE TABLE public.tenant_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  unit_id UUID NOT NULL,
  category TEXT NOT NULL,
  severity issue_severity NOT NULL DEFAULT 'minor',
  title TEXT NOT NULL,
  description TEXT,
  status issue_status NOT NULL DEFAULT 'open',
  reported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tenant issues" ON public.tenant_issues FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER tenant_issues_updated BEFORE UPDATE ON public.tenant_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.tenant_portal_resolve(_token TEXT)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE _link RECORD;
BEGIN
  SELECT * INTO _link FROM public.tenant_portal_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'tenant', (SELECT to_jsonb(t) FROM public.tenants t WHERE t.id = _link.tenant_id),
    'unit',   (SELECT to_jsonb(u) FROM public.units u WHERE u.id = _link.unit_id),
    'property', (SELECT to_jsonb(p) FROM public.properties p
                  JOIN public.units u ON u.property_id = p.id WHERE u.id = _link.unit_id LIMIT 1),
    'issues', COALESCE((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.reported_at DESC)
                         FROM public.tenant_issues i WHERE i.tenant_id = _link.tenant_id), '[]'::jsonb)
  );
END; $$;

CREATE OR REPLACE FUNCTION public.tenant_portal_report_issue(
  _token TEXT, _category TEXT, _severity issue_severity, _title TEXT, _description TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _link RECORD; _new UUID;
BEGIN
  SELECT * INTO _link FROM public.tenant_portal_links
  WHERE token = _token AND revoked = false AND expires_at > now() LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid token'; END IF;
  INSERT INTO public.tenant_issues(user_id, tenant_id, unit_id, category, severity, title, description)
  VALUES (_link.user_id, _link.tenant_id, _link.unit_id, _category, _severity, _title, _description)
  RETURNING id INTO _new;
  RETURN _new;
END; $$;

CREATE OR REPLACE FUNCTION public.avm_estimate(_zip TEXT, _living_space NUMERIC, _annual_rent NUMERIC)
RETURNS JSONB LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE _m RECORD; _val_sqm NUMERIC; _val_rent NUMERIC;
BEGIN
  SELECT * INTO _m FROM public.market_index WHERE zip = _zip LIMIT 1;
  IF NOT FOUND THEN
    SELECT NULL::TEXT AS zip, NULL::TEXT AS city,
           AVG(avg_rent_sqm)::NUMERIC AS avg_rent_sqm,
           AVG(avg_purchase_sqm)::NUMERIC AS avg_purchase_sqm,
           AVG(yield_factor)::NUMERIC AS yield_factor
      INTO _m FROM public.market_index;
  END IF;
  _val_sqm := COALESCE(_living_space,0) * COALESCE(_m.avg_purchase_sqm,0);
  _val_rent := COALESCE(_annual_rent,0) * COALESCE(_m.yield_factor,0);
  RETURN jsonb_build_object(
    'zip', _zip,
    'value_sqm_method', _val_sqm,
    'value_income_method', _val_rent,
    'value_blended', (_val_sqm * 0.4 + _val_rent * 0.6),
    'avg_purchase_sqm', _m.avg_purchase_sqm,
    'avg_rent_sqm', _m.avg_rent_sqm,
    'yield_factor', _m.yield_factor
  );
END; $$;