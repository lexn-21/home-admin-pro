import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stagger, Item } from "@/components/motion/Primitives";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Wrench, Search, MapPin, Star, Phone, Mail, ShieldCheck, Filter,
  Calculator, Paintbrush, Zap, Droplets, Hammer, HardHat, Building2,
} from "lucide-react";

// Fix default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Category = "all" | "electrician" | "plumber" | "painter" | "handyman" | "tax" | "roofer";

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
  verified: boolean;
  premium?: boolean;
  lat: number;
  lng: number;
  specialties: string[];
};

// Kuratierte Startliste NRW — du ersetzt durch echte Daten wenn ready
const SEED: Provider[] = [
  { id: "1", name: "Elektro Schröder GmbH", category: "electrician", city: "Ennigerloh", zip: "59320", rating: 4.8, reviews: 127, phone: "+49 2524 12345", verified: true, premium: true, lat: 51.8374, lng: 8.0244, specialties: ["Zählertausch", "Smart Home", "E-Check"] },
  { id: "2", name: "Sanitär Müller", category: "plumber", city: "Oelde", zip: "59302", rating: 4.6, reviews: 89, phone: "+49 2522 98765", verified: true, lat: 51.8267, lng: 8.1469, specialties: ["Heizung", "Bad", "Notdienst"] },
  { id: "3", name: "Maler Becker", category: "painter", city: "Warendorf", zip: "48231", rating: 4.9, reviews: 203, phone: "+49 2581 44556", verified: true, lat: 51.9544, lng: 7.9869, specialties: ["Innenanstrich", "Fassade", "Tapete"] },
  { id: "4", name: "StB Kerstin Boomgaarden", category: "tax", city: "Ennigerloh", zip: "59320", rating: 5.0, reviews: 34, email: "kanzlei@example.de", verified: true, premium: true, lat: 51.8394, lng: 8.0264, specialties: ["Anlage V", "GbR", "DATEV"] },
  { id: "5", name: "Dachdeckerei Hülsmann", category: "roofer", city: "Beckum", zip: "59269", rating: 4.7, reviews: 156, phone: "+49 2521 77888", verified: true, lat: 51.7548, lng: 8.0418, specialties: ["Flachdach", "Reparatur", "Dämmung"] },
  { id: "6", name: "Hausmeister-Service König", category: "handyman", city: "Ahlen", zip: "59227", rating: 4.4, reviews: 71, phone: "+49 2382 33221", verified: false, lat: 51.7636, lng: 7.8918, specialties: ["Grünpflege", "Winterdienst", "Kleinreparaturen"] },
];

const CATS: { value: Category; label: string; icon: any }[] = [
  { value: "all", label: "Alle", icon: HardHat },
  { value: "electrician", label: "Elektriker", icon: Zap },
  { value: "plumber", label: "SHK / Sanitär", icon: Droplets },
  { value: "painter", label: "Maler", icon: Paintbrush },
  { value: "roofer", label: "Dachdecker", icon: Building2 },
  { value: "handyman", label: "Hausmeister", icon: Hammer },
  { value: "tax", label: "Steuerberater", icon: Calculator },
];

const Marketplace = () => {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<Category>("all");

  useEffect(() => { document.title = "Marktplatz · ImmoNIQ"; }, []);

  const filtered = useMemo(() => {
    return SEED.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (query && !`${p.name} ${p.city} ${p.zip} ${p.specialties.join(" ")}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    }).sort((a, b) => (b.premium ? 1 : 0) - (a.premium ? 1 : 0) || b.rating - a.rating);
  }, [query, cat]);

  const center: [number, number] = [51.84, 8.05]; // NRW zentriert auf Ennigerloh

  return (
    <Stagger className="space-y-6">
      <Item>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">Marktplatz</p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
              Handwerker & <span className="text-gradient-gold">Steuerberater</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Geprüfte Profis in deiner Region. Kostenlos für dich als Vermieter.
            </p>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 px-3 py-1.5 rounded-full glass">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {filtered.filter(f => f.verified).length} verifiziert
          </div>
        </div>
      </Item>

      {/* Filter bar */}
      <Item>
        <Card className="p-4 glass space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Name, PLZ, Spezialisierung …"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
            {CATS.map((c) => (
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
              </button>
            ))}
          </div>
        </Card>
      </Item>

      {/* Map */}
      <Item variant="scale">
        <Card className="glass overflow-hidden">
          <div className="h-[320px] relative">
            <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((p) => (
                <Marker key={p.id} position={[p.lat, p.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.zip} {p.city}</p>
                      <p className="text-xs mt-1">⭐ {p.rating.toFixed(1)} ({p.reviews})</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      </Item>

      {/* Providers */}
      <Item>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">
            {filtered.length} {filtered.length === 1 ? "Ergebnis" : "Ergebnisse"}
          </h2>
          <button className="text-xs text-muted-foreground flex items-center gap-1">
            <Filter className="h-3 w-3" /> Sortieren
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map((p) => {
            const CatIcon = CATS.find(c => c.value === p.category)?.icon ?? HardHat;
            return (
              <Card key={p.id} className="p-5 glass interactive-card">
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
                        </p>
                      </div>
                      {p.premium && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground tracking-wider uppercase flex-shrink-0">
                          Premium
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-2 text-xs">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="font-semibold tabular">{p.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({new Intl.NumberFormat("de-DE").format(p.reviews)})</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.specialties.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{s}</span>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-3">
                      {p.phone && (
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                          <a href={`tel:${p.phone.replace(/\s/g, "")}`}><Phone className="h-3 w-3 mr-1.5" /> Anrufen</a>
                        </Button>
                      )}
                      {p.email && (
                        <Button asChild size="sm" variant="outline" className="h-8 text-xs">
                          <a href={`mailto:${p.email}`}><Mail className="h-3 w-3 mr-1.5" /> E-Mail</a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Item>

      <Item>
        <Card className="p-5 glass text-center">
          <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-60" />
          <p className="text-sm font-medium">Bist du Handwerker oder Steuerberater?</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Kostenlos gelistet werden · Bezahlte Premium-Platzierung verfügbar
          </p>
          <Button variant="outline" size="sm">Jetzt bewerben</Button>
        </Card>
      </Item>
    </Stagger>
  );
};

export default Marketplace;
