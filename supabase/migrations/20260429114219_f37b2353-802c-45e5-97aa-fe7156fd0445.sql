
-- ENUMS
CREATE TYPE public.listing_kind AS ENUM ('rent', 'sale');
CREATE TYPE public.listing_status AS ENUM ('draft', 'published', 'paused', 'closed');
CREATE TYPE public.application_status AS ENUM ('sent', 'shortlisted', 'rejected', 'accepted', 'withdrawn');
CREATE TYPE public.schufa_status AS ENUM ('unverified', 'self_declared', 'document_uploaded');
CREATE TYPE public.employment_type AS ENUM ('unbefristet', 'befristet', 'selbststaendig', 'beamter', 'rentner', 'student', 'arbeitslos', 'sonstiges');

-- LISTINGS
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  property_id UUID,
  unit_id UUID,
  kind listing_kind NOT NULL DEFAULT 'rent',
  status listing_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  description TEXT,
  photos TEXT[] NOT NULL DEFAULT '{}',
  price NUMERIC NOT NULL DEFAULT 0,
  deposit NUMERIC,
  utilities NUMERIC,
  available_from DATE,
  min_term_months INTEGER,
  living_space NUMERIC,
  rooms NUMERIC,
  zip TEXT,
  city TEXT,
  street_public TEXT,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  energy_class TEXT,
  energy_value NUMERIC,
  views_count INTEGER NOT NULL DEFAULT 0,
  applications_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_listings_status ON public.listings(status) WHERE status = 'published';
CREATE INDEX idx_listings_zip ON public.listings(zip);
CREATE INDEX idx_listings_user ON public.listings(user_id);
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "listings public read published" ON public.listings FOR SELECT USING (status = 'published');
CREATE POLICY "listings owner read all" ON public.listings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "listings owner insert" ON public.listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings owner update" ON public.listings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "listings owner delete" ON public.listings FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_listings_updated BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEEKER PROFILES
CREATE TABLE public.seeker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  profile_photo TEXT,
  household_size INTEGER DEFAULT 1,
  has_pets BOOLEAN DEFAULT false,
  smoker BOOLEAN DEFAULT false,
  net_income_monthly NUMERIC,
  employment_type employment_type,
  employer TEXT,
  schufa_status schufa_status NOT NULL DEFAULT 'unverified',
  move_in_from DATE,
  max_rent NUMERIC,
  preferred_zips TEXT[] DEFAULT '{}',
  about_me TEXT,
  completeness_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seeker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seeker own all" ON public.seeker_profiles FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_seeker_updated BEFORE UPDATE ON public.seeker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- APPLICATIONS
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  seeker_user_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  status application_status NOT NULL DEFAULT 'sent',
  cover_message TEXT,
  snapshot_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
  owner_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (listing_id, seeker_user_id)
);
CREATE INDEX idx_apps_listing ON public.applications(listing_id);
CREATE INDEX idx_apps_seeker ON public.applications(seeker_user_id);
CREATE INDEX idx_apps_owner ON public.applications(owner_user_id);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apps seeker read own" ON public.applications FOR SELECT
  USING (auth.uid() = seeker_user_id);
CREATE POLICY "apps owner read own" ON public.applications FOR SELECT
  USING (auth.uid() = owner_user_id);
CREATE POLICY "apps seeker insert" ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = seeker_user_id);
CREATE POLICY "apps seeker update own" ON public.applications FOR UPDATE
  USING (auth.uid() = seeker_user_id);
CREATE POLICY "apps owner update own" ON public.applications FOR UPDATE
  USING (auth.uid() = owner_user_id);
CREATE POLICY "apps seeker delete own" ON public.applications FOR DELETE
  USING (auth.uid() = seeker_user_id);

CREATE TRIGGER trg_apps_updated BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Allow owner to view seeker profile when application exists
CREATE OR REPLACE FUNCTION public.can_view_seeker_profile(_seeker UUID, _viewer UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE seeker_user_id = _seeker AND owner_user_id = _viewer
  );
$$;

CREATE POLICY "seeker visible to owner via app" ON public.seeker_profiles FOR SELECT
  USING (public.can_view_seeker_profile(user_id, auth.uid()));

-- Increment applications_count
CREATE OR REPLACE FUNCTION public.tg_inc_app_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.listings SET applications_count = applications_count + 1 WHERE id = NEW.listing_id;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_inc_app_count AFTER INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.tg_inc_app_count();

-- LISTING MESSAGES
CREATE TABLE public.listing_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_msgs_app ON public.listing_messages(application_id);
ALTER TABLE public.listing_messages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_app_participant(_app_id UUID, _user UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE id = _app_id AND (seeker_user_id = _user OR owner_user_id = _user)
  );
$$;

CREATE POLICY "msgs participant read" ON public.listing_messages FOR SELECT
  USING (public.is_app_participant(application_id, auth.uid()));
CREATE POLICY "msgs participant insert" ON public.listing_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_user_id AND public.is_app_participant(application_id, auth.uid()));
CREATE POLICY "msgs sender update" ON public.listing_messages FOR UPDATE
  USING (public.is_app_participant(application_id, auth.uid()));

-- SAVES (Wishlist)
CREATE TABLE public.listing_saves (
  user_id UUID NOT NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, listing_id)
);
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saves own all" ON public.listing_saves FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ALERTS (Suchaufträge)
CREATE TABLE public.listing_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind listing_kind NOT NULL DEFAULT 'rent',
  zips TEXT[] DEFAULT '{}',
  max_price NUMERIC,
  min_rooms NUMERIC,
  min_space NUMERIC,
  active BOOLEAN NOT NULL DEFAULT true,
  last_notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.listing_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts own all" ON public.listing_alerts FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- View counter RPC (avoid RLS update issues)
CREATE OR REPLACE FUNCTION public.listing_inc_view(_listing_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.listings SET views_count = views_count + 1
  WHERE id = _listing_id AND status = 'published';
END; $$;

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-photos', 'listing-photos', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "listing photos public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-photos');
CREATE POLICY "listing photos owner insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "listing photos owner update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "listing photos owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'listing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
