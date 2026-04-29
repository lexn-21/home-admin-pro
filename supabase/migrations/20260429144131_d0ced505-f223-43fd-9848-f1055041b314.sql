-- 1) Geo-Spalten an listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS lat NUMERIC,
  ADD COLUMN IF NOT EXISTS lng NUMERIC;

CREATE INDEX IF NOT EXISTS idx_listings_geo ON public.listings (lat, lng) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_listings_zip_pub ON public.listings (zip) WHERE status = 'published';

-- 2) Werbeflächen
CREATE TABLE IF NOT EXISTS public.ad_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  sponsor_name TEXT,
  image_url TEXT,
  click_url TEXT NOT NULL,
  cta_label TEXT DEFAULT 'Mehr erfahren',
  placement TEXT NOT NULL DEFAULT 'market_grid', -- market_grid | market_top | listing_detail | listing_sidebar
  target_zips TEXT[] DEFAULT '{}',
  target_cities TEXT[] DEFAULT '{}',
  target_kind TEXT, -- null = beide, 'rent' | 'sale'
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_slots public read active" ON public.ad_slots;
CREATE POLICY "ad_slots public read active"
  ON public.ad_slots FOR SELECT
  USING (active = true AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now()));

CREATE TRIGGER trg_ad_slots_updated
  BEFORE UPDATE ON public.ad_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Tracking
CREATE TABLE IF NOT EXISTS public.ad_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ad_slots(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- impression | click
  context_listing_id UUID,
  context_zip TEXT,
  context_city TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_events_ad ON public.ad_events (ad_id, created_at DESC);

ALTER TABLE public.ad_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ad_events anyone insert" ON public.ad_events;
CREATE POLICY "ad_events anyone insert"
  ON public.ad_events FOR INSERT
  WITH CHECK (event_type IN ('impression','click'));

-- 4) Umkreissuche (Haversine, km)
CREATE OR REPLACE FUNCTION public.listings_nearby(
  _lat NUMERIC,
  _lng NUMERIC,
  _radius_km NUMERIC DEFAULT 10,
  _kind TEXT DEFAULT NULL,
  _exclude_id UUID DEFAULT NULL,
  _limit INTEGER DEFAULT 60
)
RETURNS TABLE (
  id UUID, title TEXT, kind TEXT, status TEXT,
  city TEXT, zip TEXT, price NUMERIC, rooms NUMERIC, living_space NUMERIC,
  photos TEXT[], lat NUMERIC, lng NUMERIC, distance_km NUMERIC, published_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT l.id, l.title, l.kind::text, l.status::text,
         l.city, l.zip, l.price, l.rooms, l.living_space,
         l.photos, l.lat, l.lng,
         (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(_lat)) * cos(radians(l.lat)) *
              cos(radians(l.lng) - radians(_lng)) +
              sin(radians(_lat)) * sin(radians(l.lat))
            ))
         ))::numeric AS distance_km,
         l.published_at
  FROM public.listings l
  WHERE l.status = 'published'
    AND l.lat IS NOT NULL AND l.lng IS NOT NULL
    AND (_kind IS NULL OR l.kind::text = _kind)
    AND (_exclude_id IS NULL OR l.id <> _exclude_id)
    AND (6371 * acos(
            LEAST(1.0, GREATEST(-1.0,
              cos(radians(_lat)) * cos(radians(l.lat)) *
              cos(radians(l.lng) - radians(_lng)) +
              sin(radians(_lat)) * sin(radians(l.lat))
            ))
         )) <= _radius_km
  ORDER BY distance_km ASC
  LIMIT _limit;
$$;

-- 5) Passende Anzeigen abrufen
CREATE OR REPLACE FUNCTION public.ad_slots_for(
  _placement TEXT,
  _zip TEXT DEFAULT NULL,
  _city TEXT DEFAULT NULL,
  _kind TEXT DEFAULT NULL,
  _limit INTEGER DEFAULT 6
)
RETURNS SETOF public.ad_slots
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT *
  FROM public.ad_slots a
  WHERE a.active = true
    AND a.starts_at <= now()
    AND (a.ends_at IS NULL OR a.ends_at > now())
    AND a.placement = _placement
    AND (a.target_kind IS NULL OR _kind IS NULL OR a.target_kind = _kind)
    AND (
      cardinality(a.target_zips) = 0 OR _zip IS NULL OR _zip = ANY(a.target_zips)
      OR EXISTS (SELECT 1 FROM unnest(a.target_zips) z WHERE _zip LIKE (substr(z,1,3) || '%'))
    )
    AND (cardinality(a.target_cities) = 0 OR _city IS NULL OR _city = ANY(a.target_cities))
  ORDER BY
    -- bessere PLZ/Stadt-Treffer zuerst
    (CASE WHEN _zip IS NOT NULL AND _zip = ANY(a.target_zips) THEN 0 ELSE 1 END),
    (CASE WHEN _city IS NOT NULL AND _city = ANY(a.target_cities) THEN 0 ELSE 1 END),
    a.priority DESC,
    a.created_at DESC
  LIMIT _limit;
$$;

-- 6) Demo-Anzeigen (nur einfügen, wenn Tabelle leer)
INSERT INTO public.ad_slots (title, subtitle, sponsor_name, image_url, click_url, cta_label, placement, target_kind, priority)
SELECT * FROM (VALUES
  ('Umzug stressfrei buchen', 'Festpreis · versichert · in 48 h', 'MoveEasy', NULL, 'https://example.com/umzug', 'Angebot holen', 'market_grid', 'rent'::text, 10),
  ('Hausratversicherung in 3 Min.', 'Ab 4,90 €/Monat · sofort gültig', 'SecureHome', NULL, 'https://example.com/versicherung', 'Tarif vergleichen', 'market_grid', NULL, 8),
  ('Finanzierung prüfen lassen', 'Top-Konditionen für Eigentum', 'BauFinanz', NULL, 'https://example.com/finanzierung', 'Zinsen checken', 'market_grid', 'sale'::text, 9),
  ('Kostenlose Marktwert-Analyse', 'Wie viel ist deine Wohnung wert?', 'ImmoNIQ', NULL, '/app/valuation', 'Jetzt schätzen', 'market_top', NULL, 5)
) AS v(title, subtitle, sponsor_name, image_url, click_url, cta_label, placement, target_kind, priority)
WHERE NOT EXISTS (SELECT 1 FROM public.ad_slots);