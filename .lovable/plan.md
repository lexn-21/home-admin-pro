# Plan: Echte Anbieter-Suche (Google Places) + Zahlenformat

## Problem
1. **Marketplace** nutzt aktuell OpenStreetMap (Overpass). Für Steuerberater/Handwerker in DE ist OSM zu lückenhaft → Treffer sind weit weg oder fehlen ganz. Damit ist auch das Werbepaket wertlos.
2. **Zahlen**: Tausenderpunkt soll konsequent überall greifen (1.000 statt 1000).

## Lösung Teil 1 — Google Places API (New)

Google Places liefert die "Maps-Qualität" die du willst: vollständige Branchen, Bewertungen, Öffnungszeiten, Telefon, Website, exakte Distanz.

### Kosten — ehrliche Zahlen
Google gibt **200 USD Gratis-Guthaben pro Monat**. Danach:
- **Nearby Search (New)**: ~32 USD pro 1.000 Anfragen
- **Place Details (Advanced)**: ~17 USD pro 1.000 Anfragen

Mit 200 USD frei = ca. **6.000 Suchen/Monat gratis**. Für eine Beta reicht das locker. Wir bauen zusätzlich serverseitiges **Caching** (24 h pro PLZ+Kategorie) und ein **Tageslimit pro User** (Free 5, Verwalten+ 30, Pro 200), damit keine Kostenexplosion möglich ist.

### Architektur
```text
Frontend (Marketplace.tsx)
   │ supabase.functions.invoke("places-search", {category, zip, radius})
   ▼
Edge Function "places-search"
   ├─ Auth-Check (JWT)
   ├─ Quota-Check (ai_usage_log-Pattern wiederverwenden)
   ├─ Cache-Lookup in neuer Tabelle places_cache (PLZ+Cat+Radius, TTL 24 h)
   ├─ Cache miss → Google Places "searchNearby"
   │     POST https://places.googleapis.com/v1/places:searchNearby
   │     Header: X-Goog-Api-Key, X-Goog-FieldMask
   ├─ Distanz berechnen, sortieren
   └─ Cache schreiben + zurückgeben
```

### Neue/geänderte Dateien
- **DB-Migration**: `places_cache` (zip, category, radius_km, payload jsonb, expires_at) + `places_search` Eintrag in `ai_usage_log` Quota-Logik (oder eigenes `places_usage_log`).
- **Edge Function**: `supabase/functions/places-search/index.ts`
- **Frontend**: `src/lib/places.ts` (neuer Client, ersetzt `overpass.ts`-Aufruf), `src/pages/app/Marketplace.tsx` ruft jetzt Edge Function auf.
- **OSM-Fallback**: `overpass.ts` bleibt als 2. Versuch falls Google-Key fehlt oder Quota voll.

### Was du tun musst
1. Bei [Google Cloud Console](https://console.cloud.google.com/) → neues Projekt → "Places API (New)" aktivieren → **API-Key** erzeugen → Key auf "Places API (New)" beschränken + auf deine Domain `*.lovable.app` und `immoniq.xyz`.
2. **Billing aktivieren** (Pflicht, sonst kein Free-Tier). Kreditkarte hinterlegen.
3. Key mir geben — ich speichere ihn als Secret `GOOGLE_PLACES_API_KEY` in Lovable Cloud.

## Lösung Teil 2 — Tausenderpunkte konsequent

`src/lib/format.ts` (`eur`, `num`, `pct`) nutzen bereits `Intl.NumberFormat("de-DE")` → korrekt.
Problem: an manchen Stellen wird direkt `value.toString()`, `${n}` oder `toFixed()` ausgegeben statt `num()`/`eur()`. Ich grepe alle Komponenten durch und ersetze rohe Number-Ausgaben mit Geld/Mengen-Bezug auf `eur()` bzw. `num()`. Schwerpunkte:

- `src/pages/app/Dashboard.tsx`
- `src/pages/app/Properties.tsx` / `PropertyDetail.tsx`
- `src/pages/app/Payments.tsx`, `Expenses.tsx`, `TaxBridge.tsx`
- `src/pages/app/Calculator.tsx`, `Valuation.tsx`, `Benchmark.tsx`
- `src/pages/Markt.tsx`, `MarktDetail.tsx`, `MarktVergleich.tsx`
- `src/components/market/MietspiegelCard.tsx`

Input-Felder bleiben als rohe Zahlen (sonst bricht Parsing) — nur Anzeige wird formatiert.

## Reihenfolge
1. DB-Migration `places_cache` + Quota-Helper.
2. Edge Function `places-search` (Google Places + Cache + Quota).
3. Frontend-Umstellung Marketplace auf neue Function, OSM als Fallback.
4. Number-Format-Audit über alle Anzeige-Seiten.

## Frage an dich
- **Google Places ist kostenpflichtig** (mit Free-Tier). Alternative: bei OSM bleiben + Bundesweite Steuerberaterkammer-/Handwerkskammer-Listen scrapen (langsam, rechtlich grau). Ich empfehle klar **Google Places** — willst du das so?
- API-Key besorgst du, oder soll ich dir eine Klick-für-Klick-Anleitung schreiben?
