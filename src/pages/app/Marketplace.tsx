import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, ExternalLink, ShieldCheck, Wrench, Calculator, Paintbrush, Zap,
  Droplets, Hammer, Building2, Sparkles, Info, Mail,
} from "lucide-react";
import { toast } from "sonner";

type Category = {
  id: string;
  label: string;
  icon: any;
  description: string;
  /** Quellen für die offizielle Suche. URL bekommt PLZ als Suffix per Template. */
  sources: { name: string; url: (zip: string) => string; note?: string }[];
};

// Echte, offizielle Verzeichnisse — keine erfundenen Anbieter.
const CATEGORIES: Category[] = [
  {
    id: "electrician",
    label: "Elektriker",
    icon: Zap,
    description: "Geprüfte Innungsbetriebe — Zähler, Smart Home, E-Check, Wallbox.",
    sources: [
      {
        name: "ZVEH-Innungsbetrieb finden",
        url: (zip) => `https://www.zveh.de/fachbetriebssuche.html?q=${encodeURIComponent(zip)}`,
      },
      {
        name: "Handwerkskammer-Suche",
        url: (zip) => `https://www.handwerkskammer.de/?q=elektriker+${encodeURIComponent(zip)}`,
      },
    ],
  },
  {
    id: "plumber",
    label: "Sanitär & Heizung (SHK)",
    icon: Droplets,
    description: "Heizungsbau, Bad, Wärmepumpe, GEG-Beratung — über den ZVSHK-Fachverband.",
    sources: [
      {
        name: "ZVSHK Innungsfachbetrieb-Suche",
        url: (zip) => `https://www.wasserwaermeluft.de/installateursuche.html?q=${encodeURIComponent(zip)}`,
        note: "Bundesweites offizielles Verzeichnis aller Innungsbetriebe.",
      },
    ],
  },
  {
    id: "painter",
    label: "Maler & Lackierer",
    icon: Paintbrush,
    description: "Innenanstrich, Fassade, Tapete — geprüfte Innungsmitglieder.",
    sources: [
      {
        name: "Maler & Lackierer Innung",
        url: (zip) => `https://www.farbe.de/maler-suchen?plz=${encodeURIComponent(zip)}`,
      },
    ],
  },
  {
    id: "roofer",
    label: "Dachdecker",
    icon: Building2,
    description: "Dachsanierung, Flachdach, Dämmung — Zentralverband des Dachdeckerhandwerks.",
    sources: [
      {
        name: "Dachdecker.de Betriebssuche",
        url: (zip) => `https://www.dachdecker.de/Inhalte/Betriebssuche?plz=${encodeURIComponent(zip)}`,
      },
    ],
  },
  {
    id: "handyman",
    label: "Hausmeister-Service",
    icon: Hammer,
    description: "Kleinreparaturen, Winterdienst, Treppenhausreinigung — gewerblich gemeldet.",
    sources: [
      {
        name: "Handwerkskammer (Gewerk: Hausmeister)",
        url: (zip) => `https://www.handwerkskammer.de/?q=hausmeister+${encodeURIComponent(zip)}`,
      },
      {
        name: "Gelbe Seiten",
        url: (zip) => `https://www.gelbeseiten.de/Suche/Hausmeister/${encodeURIComponent(zip)}`,
      },
    ],
  },
  {
    id: "tax",
    label: "Steuerberater (Immobilien)",
    icon: Calculator,
    description: "V&V, Anlage V, §15a EStG, GbR — über die offiziellen Steuerberaterkammern.",
    sources: [
      {
        name: "Steuerberater-Suchdienst (BStBK)",
        url: (zip) =>
          `https://steuerberater.de/?ort=${encodeURIComponent(zip)}&taetigkeitsschwerpunkt=Vermietung+und+Verpachtung`,
        note: "Offizielles Verzeichnis aller bestellten Steuerberater in Deutschland.",
      },
    ],
  },
  {
    id: "lawyer",
    label: "Anwalt für Mietrecht",
    icon: ShieldCheck,
    description: "Fachanwalt für Miet- & WEG-Recht — über die Bundesrechtsanwaltskammer.",
    sources: [
      {
        name: "Anwaltsverzeichnis (BRAK)",
        url: (zip) => `https://brak-suche.de/?q=mietrecht+${encodeURIComponent(zip)}`,
      },
    ],
  },
  {
    id: "other",
    label: "Sonstige Gewerke",
    icon: Wrench,
    description: "Gärtner, Reinigung, Schädling, Schlüsseldienst — über die HWK-Suche.",
    sources: [
      {
        name: "Handwerkskammer-Suche (alle Gewerke)",
        url: (zip) => `https://www.handwerkskammer.de/?q=${encodeURIComponent(zip)}`,
      },
    ],
  },
];

const Marketplace = () => {
  const [zip, setZip] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Handwerker & Steuerberater · ImmonIQ";
  }, []);

  const openSource = (url: string) => {
    if (!/^\d{5}$/.test(zip)) {
      toast.error("Bitte erst eine 5-stellige PLZ eingeben.");
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const active = CATEGORIES.find((c) => c.id === activeCat);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Handwerker & Steuerberater</h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Wir geben dir den schnellsten Weg zu echten, geprüften Anbietern in deiner Region —
          direkt aus den offiziellen Verzeichnissen der Innungen, Handwerkskammern und
          Steuerberaterkammern. Keine erfundenen Profile, keine Werbeplatzierungen.
        </p>
      </header>

      {/* PLZ-Eingabe */}
      <Card className="p-4 md:p-5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Deine Postleitzahl
        </label>
        <div className="flex gap-2 mt-2">
          <div className="relative flex-1">
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
        <p className="text-[11px] text-muted-foreground mt-2">
          Wir leiten dich an die offizielle Suche der jeweiligen Kammer / des Verbandes weiter.
          ImmonIQ speichert nichts.
        </p>
      </Card>

      {/* Kategorien */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = activeCat === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCat(isActive ? null : c.id)}
              className={`text-left p-4 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    {c.label}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">
                    {c.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quellen für aktive Kategorie */}
      {active && (
        <Card className="p-5 space-y-4 border-primary/30">
          <div className="flex items-center gap-2">
            <active.icon className="h-5 w-5 text-primary" />
            <h2 className="font-bold">{active.label}</h2>
            <Badge variant="outline" className="ml-auto">Offizielle Quellen</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{active.description}</p>

          <div className="space-y-2">
            {active.sources.map((s) => (
              <div
                key={s.name}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-md bg-accent/30 border border-border"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium">{s.name}</div>
                  {s.note && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.note}</div>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => openSource(s.url(zip))}
                  className="gap-1.5 shrink-0 w-full sm:w-auto"
                >
                  Suchen <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 p-3 rounded-md">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span>
              Die Suchergebnisse stammen direkt von der jeweiligen Kammer bzw. dem Verband.
              ImmonIQ hat keinen Einfluss auf die angezeigten Anbieter und erhält keine Provision.
            </span>
          </div>
        </Card>
      )}

      {/* Anbieter-Anmeldung */}
      <Card className="p-5 border-dashed">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Du bist Handwerker oder Steuerberater?</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Wir bauen unser eigenes, kuratiertes Verzeichnis auf — mit verifizierten Profilen,
              Bewertungen und transparenten Preisen. Schreib uns, wenn du dabei sein willst.
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
