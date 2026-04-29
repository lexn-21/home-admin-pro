import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Stagger, Item } from "@/components/motion/Primitives";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";
import {
  Wrench, Search, MapPin, Star, Phone, Mail, ShieldCheck, Filter, Crosshair,
  Calculator, Paintbrush, Zap, Droplets, Hammer, HardHat, Building2, X, Globe, Info,
} from "lucide-react";
import { SponsoredSlot } from "@/components/market/SponsoredSlot";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom user-location icon
const userIcon = L.divIcon({
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  html: `<div style="width:20px;height:20px;border-radius:50%;background:hsl(210 80% 55%);border:3px solid white;box-shadow:0 0 0 2px hsl(210 80% 55% / 0.3), 0 2px 8px hsl(0 0% 0% / 0.3);"></div>`,
});

// Premium marker (gold)
const premiumIcon = L.divIcon({
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  html: `<div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,hsl(42 70% 72%),hsl(38 51% 48%));border:3px solid white;box-shadow:0 2px 12px hsl(38 51% 48% / 0.5);display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:14px;">★</div>`,
});

type Category = "all" | "electrician" | "plumber" | "painter" | "handyman" | "tax" | "roofer" | "gardener" | "cleaner";

type Provider = {
  id: string;
  name: string;
  category: Exclude<Category, "all">;
  city: string;
  zip: string;
  rating: number;
  reviews: number;
  phone?: string;
  email?: string;
  website?: string;
  verified: boolean;
  premium?: boolean;
  lat: number;
  lng: number;
  specialties: string[];
};

// Kuratierte Startliste NRW — erweitert
const SEED: Provider[] = [
  { id: "1", name: "Elektro Schröder GmbH", category: "electrician", city: "Ennigerloh", zip: "59320", rating: 4.8, reviews: 127, phone: "+49 2524 12345", website: "https://www.handwerkskammer.de", verified: true, premium: true, lat: 51.8374, lng: 8.0244, specialties: ["Zählertausch", "Smart Home", "E-Check"] },
  { id: "2", name: "Sanitär Müller", category: "plumber", city: "Oelde", zip: "59302", rating: 4.6, reviews: 89, phone: "+49 2522 98765", website: "https://www.zvshk.de", verified: true, lat: 51.8267, lng: 8.1469, specialties: ["Heizung", "Bad", "Notdienst"] },
  { id: "3", name: "Maler Becker", category: "painter", city: "Warendorf", zip: "48231", rating: 4.9, reviews: 203, phone: "+49 2581 44556", verified: true, lat: 51.9544, lng: 7.9869, specialties: ["Innenanstrich", "Fassade", "Tapete"] },
  { id: "4", name: "StB Kerstin Boomgaarden", category: "tax", city: "Ennigerloh", zip: "59320", rating: 5.0, reviews: 34, email: "kanzlei@example.de", website: "https://steuerberater.de", verified: true, premium: true, lat: 51.8394, lng: 8.0264, specialties: ["Anlage V", "GbR", "DATEV"] },
  { id: "5", name: "Dachdeckerei Hülsmann", category: "roofer", city: "Beckum", zip: "59269", rating: 4.7, reviews: 156, phone: "+49 2521 77888", verified: true, lat: 51.7548, lng: 8.0418, specialties: ["Flachdach", "Reparatur", "Dämmung"] },
  { id: "6", name: "Hausmeister-Service König", category: "handyman", city: "Ahlen", zip: "59227", rating: 4.4, reviews: 71, phone: "+49 2382 33221", verified: false, lat: 51.7636, lng: 7.8918, specialties: ["Grünpflege", "Winterdienst", "Kleinreparaturen"] },
  { id: "7", name: "Elektro Westfalen", category: "electrician", city: "Münster", zip: "48143", rating: 4.5, reviews: 312, phone: "+49 251 556677", website: "https://www.handwerkskammer.de", verified: true, lat: 51.9607, lng: 7.6261, specialties: ["Photovoltaik", "Wallbox", "Altbausanierung"] },
  { id: "8", name: "Bad & Heizung Weber", category: "plumber", city: "Bielefeld", zip: "33602", rating: 4.7, reviews: 198, phone: "+49 521 778899", verified: true, premium: true, lat: 52.0302, lng: 8.5325, specialties: ["Wärmepumpe", "Badsanierung", "GEG-Beratung"] },
  { id: "9", name: "Gartenpflege Nowak", category: "gardener", city: "Lippstadt", zip: "59555", rating: 4.6, reviews: 67, phone: "+49 2941 665544", verified: true, lat: 51.6734, lng: 8.3448, specialties: ["Heckenschnitt", "Rasen", "Baumpflege"] },
  { id: "10", name: "Clean & Klar Reinigung", category: "cleaner", city: "Hamm", zip: "59065", rating: 4.3, reviews: 54, phone: "+49 2381 223344", verified: false, lat: 51.6806, lng: 7.8142, specialties: ["Treppenhaus", "Endreinigung", "Fenster"] },
  { id: "11", name: "Steuerkanzlei Rieger", category: "tax", city: "Dortmund", zip: "44137", rating: 4.8, reviews: 211, email: "info@rieger-stb.de", website: "https://steuerberater.de", verified: true, lat: 51.5136, lng: 7.4653, specialties: ["Immobilien", "§15a EStG", "E-Bilanz"] },
  { id: "12", name: "Maler Kowalski", category: "painter", city: "Hamm", zip: "59065", rating: 4.4, reviews: 88, phone: "+49 2381 998877", verified: true, lat: 51.6756, lng: 7.8192, specialties: ["Rauhfaser", "Spachteltechnik", "Außenfassade"] },
];

const CATS: { value: Category; label: string; icon: any }[] = [
  { value: "all", label: "Alle", icon: HardHat },
  { value: "electrician", label: "Elektriker", icon: Zap },
  { value: "plumber", label: "SHK / Sanitär", icon: Droplets },
  { value: "painter", label: "Maler", icon: Paintbrush },
  { value: "roofer", label: "Dachdecker", icon: Building2 },
  { value: "handyman", label: "Hausmeister", icon: Hammer },
  { value: "gardener", label: "Gärtner", icon: Wrench },
  { value: "cleaner", label: "Reinigung", icon: Wrench },
  { value: "tax", label: "Steuerberater", icon: Calculator },
];

// Haversine-Distanz in km
const haversine = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
};

// Karte automatisch an Bounds anpassen
const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 11);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }, [map, JSON.stringify(points)]);
  return null;
};

const DEFAULT_CENTER: [number, number] = [51.8374, 8.0244]; // Ennigerloh

const Marketplace = () => {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("all");
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [origin, setOrigin] = useState<[number, number]>(DEFAULT_CENTER);
  const [originLabel, setOriginLabel] = useState<string>("Ennigerloh (Standard)");
  const [geoLoading, setGeoLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = "Marktplatz · ImmoNIQ"; }, []);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation wird nicht unterstützt.");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigin([pos.coords.latitude, pos.coords.longitude]);
        setOriginLabel("Dein Standort");
        setGeoLoading(false);
        toast.success("Standort übernommen.");
      },
      (err) => {
        setGeoLoading(false);
        toast.error(err.code === 1 ? "Standort-Zugriff verweigert." : "Standort konnte nicht ermittelt werden.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // PLZ-Suche via Nominatim (OpenStreetMap, DSGVO-ok)
  const geocodeZip = async (zip: string) => {
    if (!/^\d{5}$/.test(zip)) return;
    setGeoLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&country=de&postalcode=${zip}&limit=1`,
        { headers: { "Accept-Language": "de" } },
      );
      const data = await res.json();
      if (data?.[0]) {
        setOrigin([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setOriginLabel(`PLZ ${zip}`);
        toast.success(`Umkreis um ${zip} gesetzt.`);
      } else {
        toast.error("PLZ nicht gefunden.");
      }
    } catch {
      toast.error("Fehler bei PLZ-Suche.");
    } finally {
      setGeoLoading(false);
    }
  };

  const enriched = useMemo(() => {
    return SEED.map((p) => ({
      ...p,
      distance: haversine(origin, [p.lat, p.lng]),
    }));
  }, [origin]);

  const filtered = useMemo(() => {
    return enriched
      .filter((p) => {
        if (cat !== "all" && p.category !== cat) return false;
        if (p.distance > radiusKm) return false;
        if (query) {
          const q = query.toLowerCase();
          const hay = `${p.name} ${p.city} ${p.zip} ${p.specialties.join(" ")}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          // Organisch: erst Bewertung (gewichtet mit Reviews), dann Nähe.
          // KEINE Premium-Bevorzugung mehr.
          (b.rating * Math.log10(b.reviews + 10)) - (a.rating * Math.log10(a.reviews + 10)) ||
          a.distance - b.distance,
      );
  }, [enriched, cat, query, radiusKm]);

  const handleQueryChange = (v: string) => {
    setQuery(v);
    // Wenn rein numerisch + 5 Stellen → als PLZ-Origin setzen
    if (/^\d{5}$/.test(v.trim())) geocodeZip(v.trim());
  };

  const resetOrigin = () => {
    setOrigin(DEFAULT_CENTER);
    setOriginLabel("Ennigerloh (Standard)");
  };

  const mapPoints: [number, number][] = [origin, ...filtered.map((p): [number, number] => [p.lat, p.lng])];

  return (
    <Stagger className="space-y-6">
      <Item>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Hilfe & Profis</p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Ehrlich gelistete <span className="text-gradient-gold">Profis</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl text-sm">
              Strikt nach Kategorie getrennt. Reihenfolge nach Bewertung und Nähe — nicht nach Geld.
              Anzeigen sind klar gekennzeichnet und maximal eine pro Kategorie.
            </p>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {filtered.filter((f) => f.verified).length} verifiziert
          </div>
        </div>
      </Item>

      {/* Filter bar */}
      <Item>
        <Card className="p-4 glass space-y-4">
          {/* Suchfeld + "Mein Standort" */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Name, PLZ, Spezialisierung … (z.B. 59320 für Umkreis)"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="pl-9 h-11"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              variant="outline"
              onClick={useMyLocation}
              disabled={geoLoading}
              className="h-11 gap-2 flex-shrink-0"
              title="Meinen Standort verwenden"
            >
              <Crosshair className={`h-4 w-4 ${geoLoading ? "animate-pulse" : ""}`} />
              <span className="hidden sm:inline">Standort</span>
            </Button>
          </div>

          {/* Kategorien-Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {CATS.map((c) => {
              const count =
                c.value === "all"
                  ? enriched.filter((p) => p.distance <= radiusKm).length
                  : enriched.filter((p) => p.category === c.value && p.distance <= radiusKm).length;
              return (
                <button
                  key={c.value}
                  onClick={() => setCat(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    cat === c.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <c.icon className="h-3.5 w-3.5" />
                  {c.label}
                  <span className={`text-[10px] tabular ${cat === c.value ? "opacity-80" : "opacity-60"}`}>
                    {new Intl.NumberFormat("de-DE").format(count)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Umkreis-Slider */}
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Umkreis um <span className="font-semibold text-foreground">{originLabel}</span>
                {originLabel !== "Ennigerloh (Standard)" && (
                  <button onClick={resetOrigin} className="ml-1 text-primary hover:underline">
                    zurücksetzen
                  </button>
                )}
              </div>
              <span className="font-bold text-foreground tabular">
                {new Intl.NumberFormat("de-DE").format(radiusKm)} km
              </span>
            </div>
            <Slider
              value={[radiusKm]}
              min={5}
              max={150}
              step={5}
              onValueChange={(v) => setRadiusKm(v[0])}
              className="w-full"
            />
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground tabular">
              <span>5 km</span>
              <span>50 km</span>
              <span>150 km</span>
            </div>
          </div>
        </Card>
      </Item>

      {/* Map */}
      <Item variant="scale">
        <Card className="glass overflow-hidden">
          <div className="h-[360px] relative">
            <MapContainer
              center={origin}
              zoom={10}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Umkreis-Kreis */}
              <Circle
                center={origin}
                radius={radiusKm * 1000}
                pathOptions={{
                  color: "hsl(38, 51%, 52%)",
                  fillColor: "hsl(38, 51%, 62%)",
                  fillOpacity: 0.08,
                  weight: 1.5,
                }}
              />
              {/* User-Marker */}
              <Marker position={origin} icon={userIcon}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{originLabel}</p>
                    <p className="text-xs text-gray-500">Suchzentrum</p>
                  </div>
                </Popup>
              </Marker>
              {/* Provider-Marker */}
              {filtered.map((p) => (
                <Marker
                  key={p.id}
                  position={[p.lat, p.lng]}
                  icon={new L.Icon.Default()}
                  eventHandlers={{
                    click: () => {
                      const el = document.getElementById(`provider-${p.id}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      el?.classList.add("ring-2", "ring-primary");
                      setTimeout(() => el?.classList.remove("ring-2", "ring-primary"), 1500);
                    },
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.zip} {p.city} · {p.distance.toFixed(1).replace(".", ",")} km
                      </p>
                      <p className="text-xs mt-1">
                        ⭐ {p.rating.toFixed(1).replace(".", ",")} (
                        {new Intl.NumberFormat("de-DE").format(p.reviews)})
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              <FitBounds points={mapPoints} />
            </MapContainer>
          </div>
        </Card>
      </Item>

      {/* Providers */}
      <div ref={listRef}>
        <Item>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">
              {new Intl.NumberFormat("de-DE").format(filtered.length)}{" "}
              {filtered.length === 1 ? "Ergebnis" : "Ergebnisse"}
              <span className="text-xs text-muted-foreground font-normal ml-2">
                innerhalb {new Intl.NumberFormat("de-DE").format(radiusKm)} km
              </span>
            </h2>
            <button className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3" /> Nähe
            </button>
          </div>
        </Item>

        {cat !== "all" && (
          <Item>
            <div className="mb-3">
              <SponsoredSlot placement="marketplace_category" kind={null} limit={1} />
            </div>
          </Item>
        )}


        {filtered.length === 0 ? (
          <Item>
            <Card className="p-10 glass text-center">
              <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="font-medium mb-1">Keine Ergebnisse im Umkreis</p>
              <p className="text-sm text-muted-foreground mb-4">
                Vergrößere den Suchradius oder ändere die Kategorie.
              </p>
              <Button variant="outline" size="sm" onClick={() => setRadiusKm(Math.min(150, radiusKm + 25))}>
                Umkreis auf {new Intl.NumberFormat("de-DE").format(Math.min(150, radiusKm + 25))} km erweitern
              </Button>
            </Card>
          </Item>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((p) => {
              const CatIcon = CATS.find((c) => c.value === p.category)?.icon ?? HardHat;
              return (
                <Item key={p.id}>
                  <Card id={`provider-${p.id}`} className="p-5 glass interactive-card transition-all">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-gold-soft border border-primary/15 flex items-center justify-center flex-shrink-0">
                        <CatIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold truncate">{p.name}</p>
                              {p.verified && <ShieldCheck className="h-3.5 w-3.5 text-success flex-shrink-0" />}
                            </div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" /> {p.zip} {p.city}
                              <span className="text-primary font-semibold tabular ml-1">
                                · {p.distance.toFixed(1).replace(".", ",")} km
                              </span>
                            </p>
                          </div>
                          {p.premium && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-border text-muted-foreground tracking-wider uppercase flex-shrink-0">
                              Anzeige
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-2 text-xs">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          <span className="font-semibold tabular">
                            {p.rating.toFixed(1).replace(".", ",")}
                          </span>
                          <span className="text-muted-foreground">
                            ({new Intl.NumberFormat("de-DE").format(p.reviews)})
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.specialties.map((s) => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2 mt-3">
                          {p.phone && (
                            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                              <a href={`tel:${p.phone.replace(/\s/g, "")}`}>
                                <Phone className="h-3 w-3 mr-1.5" /> Anrufen
                              </a>
                            </Button>
                          )}
                          {p.email && (
                            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                              <a href={`mailto:${p.email}`}>
                                <Mail className="h-3 w-3 mr-1.5" /> E-Mail
                              </a>
                            </Button>
                          )}
                          <Button asChild size="sm" variant="ghost" className="h-8 text-xs ml-auto">
                            <a
                              href={`https://www.openstreetmap.org/directions?from=${origin[0]},${origin[1]}&to=${p.lat},${p.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Route
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Item>
              );
            })}
          </div>
        )}
      </div>

      <Item>
        <Card className="p-5 border border-dashed border-border/70 bg-muted/20 text-center">
          <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
          <p className="text-sm font-medium">Bist du Profi?</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3 max-w-md mx-auto">
            Eintrag &amp; Verifizierung sind kostenlos. Reihenfolge richtet sich nach Bewertung und Nähe — keine bezahlten Spitzenplätze. Anzeigen sind klar als „Anzeige" gekennzeichnet.
          </p>
          <Button variant="outline" size="sm">
            Jetzt eintragen
          </Button>
        </Card>
      </Item>
    </Stagger>
  );
};

export default Marketplace;
