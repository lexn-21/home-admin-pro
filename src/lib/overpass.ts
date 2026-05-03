// OpenStreetMap Overpass API — kostenlos, kein Key nötig.
// Findet echte Handwerker, Steuerberater etc. mit Adresse, Telefon, Website.

import { approxLatLngFromZip } from "@/lib/geo";

export type OsmPlace = {
  id: number;
  name: string;
  category: string;
  lat: number;
  lon: number;
  street?: string;
  housenumber?: string;
  zip?: string;
  city?: string;
  phone?: string;
  website?: string;
  email?: string;
  opening_hours?: string;
  distance_km?: number;
};

/** Mapping Kategorie → Overpass-Filter (OSM-Tags) */
const QUERY_BY_CAT: Record<string, string> = {
  electrician: 'nwr["craft"="electrician"](around:{R},{LAT},{LNG});',
  plumber:
    'nwr["craft"~"plumber|hvac|heating_engineer"](around:{R},{LAT},{LNG});' +
    'nwr["shop"="bathroom_furnishing"](around:{R},{LAT},{LNG});',
  painter: 'nwr["craft"~"painter|plasterer"](around:{R},{LAT},{LNG});',
  roofer: 'nwr["craft"="roofer"](around:{R},{LAT},{LNG});',
  carpenter: 'nwr["craft"~"carpenter|joiner"](around:{R},{LAT},{LNG});',
  handyman:
    'nwr["craft"="handyman"](around:{R},{LAT},{LNG});' +
    'nwr["office"="caretaker"](around:{R},{LAT},{LNG});',
  tax: 'nwr["office"~"tax_advisor|accountant"](around:{R},{LAT},{LNG});',
  lawyer: 'nwr["office"="lawyer"](around:{R},{LAT},{LNG});',
  cleaner:
    'nwr["shop"="dry_cleaning"](around:{R},{LAT},{LNG});' +
    'nwr["craft"="cleaning"](around:{R},{LAT},{LNG});' +
    'nwr["office"="cleaning"](around:{R},{LAT},{LNG});',
  gardener: 'nwr["craft"~"gardener|landscaping"](around:{R},{LAT},{LNG});',
  locksmith: 'nwr["shop"="locksmith"](around:{R},{LAT},{LNG});nwr["craft"="locksmith"](around:{R},{LAT},{LNG});',
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

function distKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export async function searchProviders(
  category: string,
  zip: string,
  radiusKm = 15,
): Promise<OsmPlace[]> {
  const center = approxLatLngFromZip(zip);
  if (!center) throw new Error("PLZ nicht erkannt");

  const tmpl = QUERY_BY_CAT[category];
  if (!tmpl) throw new Error("Kategorie nicht unterstützt");

  const radiusM = Math.round(radiusKm * 1000);
  const filled = tmpl
    .replace(/\{R\}/g, String(radiusM))
    .replace(/\{LAT\}/g, String(center.lat))
    .replace(/\{LNG\}/g, String(center.lng));

  const query = `[out:json][timeout:25];(${filled});out tags center 60;`;

  let lastErr: any;
  for (const ep of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error("Overpass " + res.status);
      const data = await res.json();
      const items: OsmPlace[] = (data.elements ?? [])
        .map((el: any) => {
          const t = el.tags || {};
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          if (!lat || !lon || !t.name) return null;
          return {
            id: el.id,
            name: t.name,
            category,
            lat,
            lon,
            street: t["addr:street"],
            housenumber: t["addr:housenumber"],
            zip: t["addr:postcode"],
            city: t["addr:city"],
            phone: t.phone || t["contact:phone"],
            website: t.website || t["contact:website"],
            email: t.email || t["contact:email"],
            opening_hours: t.opening_hours,
            distance_km: distKm(center, { lat, lng: lon }),
          } as OsmPlace;
        })
        .filter(Boolean) as OsmPlace[];

      // Dedupe by name+street, sort by distance
      const seen = new Set<string>();
      const unique = items.filter((p) => {
        const k = `${p.name}|${p.street ?? ""}|${p.housenumber ?? ""}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      unique.sort((a, b) => (a.distance_km ?? 999) - (b.distance_km ?? 999));
      return unique.slice(0, 50);
    } catch (e) {
      lastErr = e;
      continue;
    }
  }
  throw lastErr ?? new Error("Overpass-Suche fehlgeschlagen");
}
