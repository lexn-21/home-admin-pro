-- Backfill default tasks für bestehende Properties (die noch keine haben)
INSERT INTO public.tasks (user_id, property_id, title, description, category, due_date, legal_ref, legal_url)
SELECT p.user_id, p.id,
  'NK-Abrechnung ' || (EXTRACT(YEAR FROM CURRENT_DATE)::int) || ' erstellen',
  'Nebenkostenabrechnung für ' || p.name || ' erstellen und an Mieter verschicken.',
  'Abrechnung',
  make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int + 1, 12, 31),
  '§ 556 Abs. 3 BGB',
  'https://www.gesetze-im-internet.de/bgb/__556.html'
FROM public.properties p
WHERE NOT EXISTS (SELECT 1 FROM public.tasks t WHERE t.property_id = p.id);

-- Trigger anbinden (falls noch nicht aktiv)
DROP TRIGGER IF EXISTS trg_create_default_tasks ON public.properties;
CREATE TRIGGER trg_create_default_tasks
AFTER INSERT ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.tg_create_default_tasks();

-- Helper-Funktion: Default-Unit für eine Property holen oder erzeugen
CREATE OR REPLACE FUNCTION public.ensure_default_unit(_property_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _unit_id uuid;
  _user_id uuid;
  _name text;
  _area numeric;
  _rooms numeric;
  _rent numeric;
  _util numeric;
BEGIN
  SELECT id INTO _unit_id FROM public.units WHERE property_id = _property_id ORDER BY created_at LIMIT 1;
  IF _unit_id IS NOT NULL THEN
    RETURN _unit_id;
  END IF;
  SELECT user_id, name, area_sqm, rooms, cold_rent, utilities
    INTO _user_id, _name, _area, _rooms, _rent, _util
    FROM public.properties WHERE id = _property_id;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Property not found';
  END IF;
  INSERT INTO public.units (user_id, property_id, label, living_space, rooms, rent_cold, utilities)
  VALUES (_user_id, _property_id, COALESCE(_name, 'Wohnung'), _area, _rooms, COALESCE(_rent, 0), COALESCE(_util, 0))
  RETURNING id INTO _unit_id;
  RETURN _unit_id;
END;
$$;