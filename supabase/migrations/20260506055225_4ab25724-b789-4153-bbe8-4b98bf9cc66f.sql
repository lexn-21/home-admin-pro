
-- Achievements (Trophäen)
CREATE TABLE public.achievements (
  code text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  tier text NOT NULL DEFAULT 'bronze', -- bronze|silber|gold|platin
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements public read" ON public.achievements FOR SELECT USING (true);

CREATE TABLE public.user_achievements (
  user_id uuid NOT NULL,
  code text NOT NULL REFERENCES public.achievements(code) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, code)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ua own read" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Seed achievements
INSERT INTO public.achievements(code, title, description, icon, tier, sort_order) VALUES
  ('first_property',  'Erste Immobilie',       'Erste Immobilie angelegt.',                'home',     'bronze', 10),
  ('first_tenant',    'Erster Mieter',         'Ersten Mieter erfasst.',                   'users',    'bronze', 20),
  ('ten_receipts',    '10 Belege',             '10 Belege hochgeladen.',                   'receipt',  'bronze', 30),
  ('hundred_receipts','100 Belege',            '100 Belege hochgeladen — Buchhaltungs-Profi.', 'receipt','silber', 31),
  ('first_nka',       'Erste NK-Abrechnung',   'Erste Nebenkostenabrechnung abgeschlossen.','file-check','silber', 40),
  ('first_listing',   'Erstes Inserat',        'Erstes Inserat veröffentlicht.',           'megaphone','bronze', 50),
  ('tax_done',        'Steuer abgeschlossen',  'Anlage V Daten exportiert.',               'calculator','gold',  60),
  ('streak_4w',       '4 Wochen aktiv',        'Vier Wochen in Folge gepflegt.',           'flame',    'silber', 70),
  ('streak_12w',      'Quartals-Streak',       '12 Wochen in Folge aktiv.',                'flame',    'gold',   71),
  ('score_80',        'Top-Vermieter',         'Vermieter-Score 80+ erreicht.',            'shield-check','gold',80);

-- Quests (monatlich rotierend, gemeinsam für alle)
CREATE TABLE public.quests (
  code text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  metric text NOT NULL,          -- receipts_added | nka_done | listing_published | tenants_added
  target int NOT NULL DEFAULT 1,
  reward_points int NOT NULL DEFAULT 50,
  active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quests public read" ON public.quests FOR SELECT USING (active = true);

INSERT INTO public.quests(code, title, description, metric, target, reward_points, sort_order) VALUES
  ('q_receipts_5',  '5 Belege diese Woche',     '5 Belege scannen oder hochladen.',                'receipts_added',   5, 25, 10),
  ('q_receipts_20', '20 Belege diesen Monat',   'Bleib am Ball — Belege gesammelt = Steuer entspannt.', 'receipts_added',20, 75, 11),
  ('q_nka_done',    'NK-Abrechnung erstellen',  'Schließe eine Nebenkostenabrechnung ab.',         'nka_done',         1, 100, 20),
  ('q_listing',     'Inserat veröffentlichen',  'Veröffentliche ein neues Inserat.',               'listing_published',1, 50, 30);

-- Helper: Vermieter-Score (0-100), Breakdown als JSON
CREATE OR REPLACE FUNCTION public.calc_landlord_score(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _props int; _tenants int; _receipts_90d int; _payments_90d int;
  _nka_done int; _stats record;
  _completeness int; _activity int; _accounting int; _nka int; _streak int;
  _total int;
BEGIN
  SELECT count(*) INTO _props FROM properties WHERE user_id = _user_id;
  SELECT count(*) INTO _tenants FROM tenants WHERE user_id = _user_id;
  SELECT count(*) INTO _receipts_90d FROM expenses
    WHERE user_id = _user_id AND receipt_path IS NOT NULL AND created_at > now() - interval '90 days';
  SELECT count(*) INTO _payments_90d FROM payments
    WHERE user_id = _user_id AND created_at > now() - interval '90 days';
  SELECT count(*) INTO _nka_done FROM nka_periods
    WHERE user_id = _user_id AND status = 'done';
  SELECT weekly_streak INTO _streak FROM user_stats WHERE user_id = _user_id;
  _streak := COALESCE(_streak, 0);

  -- Completeness (Stammdaten): bis 25
  _completeness := LEAST(25, (_props * 8) + (_tenants * 4));
  -- Activity (Zahlungen erfasst): bis 25
  _activity := LEAST(25, _payments_90d * 3);
  -- Accounting (Belege): bis 25
  _accounting := LEAST(25, _receipts_90d);
  -- NKA + Streak: bis 25
  _nka := LEAST(15, _nka_done * 8);
  _total := _completeness + _activity + _accounting + _nka + LEAST(10, _streak * 2);

  RETURN jsonb_build_object(
    'score', LEAST(100, _total),
    'completeness', _completeness,
    'activity', _activity,
    'accounting', _accounting,
    'nka', _nka,
    'streak_bonus', LEAST(10, _streak * 2)
  );
END $$;

-- Achievement-Auto-Unlock (in record_user_activity einhängen ist invasiv;
-- stattdessen eine eigene RPC, die der Client periodisch aufruft).
CREATE OR REPLACE FUNCTION public.evaluate_achievements()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _new text[] := ARRAY[]::text[];
  _cnt int;
  _score int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;

  -- first_property
  IF EXISTS(SELECT 1 FROM properties WHERE user_id = _uid) THEN
    INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'first_property')
    ON CONFLICT DO NOTHING;
  END IF;

  -- first_tenant
  IF EXISTS(SELECT 1 FROM tenants WHERE user_id = _uid) THEN
    INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'first_tenant')
    ON CONFLICT DO NOTHING;
  END IF;

  -- receipts
  SELECT count(*) INTO _cnt FROM expenses WHERE user_id = _uid AND receipt_path IS NOT NULL;
  IF _cnt >= 10  THEN INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'ten_receipts')     ON CONFLICT DO NOTHING; END IF;
  IF _cnt >= 100 THEN INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'hundred_receipts') ON CONFLICT DO NOTHING; END IF;

  -- first_nka
  IF EXISTS(SELECT 1 FROM nka_periods WHERE user_id = _uid AND status = 'done') THEN
    INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'first_nka') ON CONFLICT DO NOTHING;
  END IF;

  -- first_listing
  IF EXISTS(SELECT 1 FROM listings WHERE user_id = _uid AND status = 'published') THEN
    INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'first_listing') ON CONFLICT DO NOTHING;
  END IF;

  -- streak
  SELECT weekly_streak INTO _cnt FROM user_stats WHERE user_id = _uid;
  IF COALESCE(_cnt,0) >= 4  THEN INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'streak_4w')  ON CONFLICT DO NOTHING; END IF;
  IF COALESCE(_cnt,0) >= 12 THEN INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'streak_12w') ON CONFLICT DO NOTHING; END IF;

  -- score 80+
  SELECT (calc_landlord_score(_uid)->>'score')::int INTO _score;
  IF _score >= 80 THEN
    INSERT INTO user_achievements(user_id, code) VALUES (_uid, 'score_80') ON CONFLICT DO NOTHING;
  END IF;

  RETURN jsonb_build_object('score', _score);
END $$;
