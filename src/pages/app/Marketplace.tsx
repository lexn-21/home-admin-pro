import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ExternalLink, Wrench, Calculator, Paintbrush, Zap,
  Droplets, Hammer, Building2, Sparkles, Phone, MapPin, Globe,
  ShieldCheck, Loader2, Trees, Key, Sprout, Mail,
} from "lucide-react";
import { toast } from "sonner";
import { searchProviders, type OsmPlace } from "@/lib/overpass";

type Category = {
  id: string;
  label: string;
  icon: any;
  description: string;
};

const CATEGORIES: Category[] = [
  { id: "electrician", label: "Elektriker", icon: Zap, description: "Zähler, Smart Home, E-Check, Wallbox." },
  { id: "plumber", label: "Sanitär & Heizung", icon: Droplets, description: "Heizung, Bad, Wärmepumpe, GEG-Beratung." },
  { id: "painter", label: "Maler & Lackierer", icon: Paintbrush, description: "Innenanstrich, Fassade, Tapete, Putz." },
  { id: "roofer", label: "Dachdecker", icon: Building2, description: "Dachsanierung, Flachdach, Dämmung." },
  { id: "carpenter", label: "Tischler & Schreiner", icon: Hammer, description: "Möbelbau, Türen, Einbauten." },
  { id: "handyman", label: "Hausmeister", icon: Wrench, description: "Kleinreparaturen, Treppenhaus, Winterdienst." },
  { id: "tax", label: "Steuerberater", icon: Calculator, description: "V&V, Anlage V, GbR, Immobilien." },
  { id: "lawyer", label: "Anwalt für Mietrecht", icon: ShieldCheck, description: "Mietrecht, WEG, Räumung." },
  { id: "cleaner", label: "Reinigung", icon: Sparkles, description: "Treppenhaus, Endreinigung, Fenster." },
  { id: "gardener", label: "Gartenpflege", icon: Sprout, description: "Hecke, Rasen, Baumschnitt." },
  { id: "locksmith", label: "Schlüsseldienst", icon: Key, description: "Notöffnung, Schloss tauschen." },
];

const Marketplace = () => {
  const [zip, setZip] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [results, setResults] = useState<OsmPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(15);

  useEffect(() => {
    document.title = "Handwerker & Steuerberater · ImmonIQ";
  }, []);

  const activeMeta = useMemo(() => CATEGORIES.find((c) => c.id === activeCat), [activeCat]);

  const runSearch = async (catId: string) => {
    if (!/^\d{5}$/.test(zip)) {
      toast.error("Bitte erst eine 5-stellige PLZ eingeben.");
      return;
    }
    setActiveCat(catId);
    setLoading(true);
    setResults([]);
    try {
      const items = await searchProviders(catId, zip, radius);
      setResults(items);
      if (items.length === 0) {
        toast.info("Keine Anbieter im Umkreis gefunden. Erhöhe den Radius oder probiere eine andere Kategorie.");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Suche fehlgeschlagen: " + (e?.message ?? "unbekannt"));
    } finally {
      setLoading(false);
    }
  };

  const formatAddr = (p: OsmPlace) => {
    const parts = [
      [p.street, p.housenumber].filter(Boolean).join(" "),
      [p.zip, p.city].filter(Boolean).join(" "),
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Handwerker & Steuerberater finden</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Echte Anbieter aus deiner Region — Live-Daten aus OpenStreetMap. Name, Adresse, Telefon,
          Website. Kostenlos, ohne Anmeldung, ohne Werbung.
        </p>
      </header>

      {/* PLZ + Radius */}
      <Card className="p-4 md:p-5">
        <div className="grid sm:grid-cols-[1fr,160px] gap-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Deine Postleitzahl
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={5}
                placeholder="z. B. 59320"
                className="pl-9"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Radius</label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mt-2 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Kategorien */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = activeCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => runSearch(c.id)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{c.label}</div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{c.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Ergebnisse */}
      {activeCat && (
        <Card className="p-5 space-y-4 border-primary/30">
          <div className="flex items-center gap-2 flex-wrap">
            {activeMeta && <activeMeta.icon className="h-5 w-5 text-primary" />}
            <h2 className="font-bold">{activeMeta?.label}</h2>
            <Badge variant="outline" className="ml-auto">
              {loading ? "Suche…" : `${results.length} Treffer · ${radius} km`}
            </Badge>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Suche läuft…
            </div>
          ) : results.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Keine Anbieter in {radius} km Umkreis gefunden. Versuche einen größeren Radius.
            </p>
          ) : (
            <div className="space-y-2">
              {results.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 p-3 rounded-md bg-accent/20 border border-border"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{p.name}</span>
                      {typeof p.distance_km === "number" && (
                        <Badge variant="outline" className="text-[10px]">
                          {p.distance_km < 1 ? "< 1" : Math.round(p.distance_km)} km
                        </Badge>
                      )}
                    </div>
                    {formatAddr(p) && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 shrink-0" /> {formatAddr(p)}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {p.phone && (
                        <a href={`tel:${p.phone}`} className="flex items-center gap-1 hover:text-foreground">
                          <Phone className="h-3 w-3" /> {p.phone}
                        </a>
                      )}
                      {p.website && (
                        <a
                          href={p.website.startsWith("http") ? p.website : `https://${p.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-foreground"
                        >
                          <Globe className="h-3 w-3" /> Website
                        </a>
                      )}
                      {p.email && (
                        <a href={`mailto:${p.email}`} className="flex items-center gap-1 hover:text-foreground">
                          <Mail className="h-3 w-3" /> {p.email}
                        </a>
                      )}
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="shrink-0 w-full sm:w-auto"
                  >
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${p.name} ${formatAddr(p)}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Auf Karte <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-md">
            Daten von <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap-Mitwirkenden</a>.
            Vollständigkeit hängt davon ab, ob Anbieter in OSM eingetragen sind.
          </p>
        </Card>
      )}

      {/* Anbieter-Anmeldung */}
      <Card className="p-5 border-dashed">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Du bist Handwerker oder Steuerberater?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Bald: verifizierte ImmonIQ-Profile mit Bewertungen, Direktbuchung und transparenten Preisen.
              Schreib uns für Early Access.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 gap-1.5">
              <a href="mailto:partner@immoniq.xyz?subject=Anbieter-Anmeldung%20ImmonIQ">
                <Mail className="h-3.5 w-3.5" /> partner@immoniq.xyz
              </a>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Marketplace;
