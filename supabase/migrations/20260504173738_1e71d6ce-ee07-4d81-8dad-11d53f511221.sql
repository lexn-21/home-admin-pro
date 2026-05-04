CREATE TABLE public.places_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zip TEXT NOT NULL,
  category TEXT NOT NULL,
  radius_km INT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  UNIQUE (zip, category, radius_km)
);

CREATE INDEX idx_places_cache_lookup ON public.places_cache(zip, category, radius_km, expires_at);

ALTER TABLE public.places_cache ENABLE ROW LEVEL SECURITY;
-- Keine Policies: nur service_role (Edge Functions) darf zugreifen.