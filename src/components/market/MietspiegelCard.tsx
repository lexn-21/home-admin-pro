import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, BookOpen, TrendingUp, Info } from "lucide-react";
import { num } from "@/lib/format";

type Props = {
  zip?: string | null;
  city?: string | null;
};

/** Direktlinks zu offiziellen kommunalen Mietspiegeln. Fallback: Google-Suche. */
const OFFICIAL_MIETSPIEGEL: Record<string, { name: string; url: string }> = {
  berlin: {
    name: "Mietspiegel Berlin (offiziell)",
    url: "https://www.berlin.de/sen/wohnen/mieten/mietspiegel/",
  },
  münchen: {
    name: "Mietspiegel München (offiziell)",
    url: "https://www.muenchen.de/rathaus/wohnen/mietspiegel",
  },
  munchen: {
    name: "Mietspiegel München (offiziell)",
    url: "https://www.muenchen.de/rathaus/wohnen/mietspiegel",
  },
  hamburg: {
    name: "Mietenspiegel Hamburg (offiziell)",
    url: "https://www.hamburg.de/mietenspiegel/",
  },
  köln: { name: "Mietspiegel Köln (offiziell)", url: "https://www.stadt-koeln.de/leben-in-koeln/wohnen/mietspiegel/" },
  koln: { name: "Mietspiegel Köln (offiziell)", url: "https://www.stadt-koeln.de/leben-in-koeln/wohnen/mietspiegel/" },
  frankfurt: {
    name: "Mietspiegel Frankfurt (offiziell)",
    url: "https://frankfurt.de/themen/wohnen-und-bauen/mietspiegel",
  },
  stuttgart: {
    name: "Mietspiegel Stuttgart (offiziell)",
    url: "https://www.stuttgart.de/leben/wohnen/mietspiegel.php",
  },
  düsseldorf: { name: "Mietspiegel Düsseldorf (offiziell)", url: "https://www.duesseldorf.de/wohnen/mietspiegel" },
  dusseldorf: { name: "Mietspiegel Düsseldorf (offiziell)", url: "https://www.duesseldorf.de/wohnen/mietspiegel" },
  leipzig: { name: "Mietspiegel Leipzig (offiziell)", url: "https://www.leipzig.de/buergerservice-und-verwaltung/unsere-stadt/wohnen/mietspiegel" },
  dresden: { name: "Mietspiegel Dresden (offiziell)", url: "https://www.dresden.de/de/leben/stadtleben/wohnen/mietspiegel.php" },
  bremen: { name: "Mietspiegel Bremen (offiziell)", url: "https://www.bauumwelt.bremen.de/wohnen/mietspiegel-30298" },
  hannover: { name: "Mietspiegel Hannover (offiziell)", url: "https://www.hannover.de/Leben-in-der-Region-Hannover/Planen,-Bauen,-Wohnen/Wohnen/Mietspiegel" },
  nürnberg: { name: "Mietspiegel Nürnberg (offiziell)", url: "https://www.nuernberg.de/internet/wohnen/mietspiegel.html" },
  nurnberg: { name: "Mietspiegel Nürnberg (offiziell)", url: "https://www.nuernberg.de/internet/wohnen/mietspiegel.html" },
};

function officialLink(city?: string | null): { name: string; url: string } {
  const key = (city ?? "").trim().toLowerCase();
  if (key && OFFICIAL_MIETSPIEGEL[key]) return OFFICIAL_MIETSPIEGEL[key];
  // Fallback: Google-Suche nach offiziellem Mietspiegel
  const q = encodeURIComponent(`Mietspiegel ${city ?? "Deutschland"} offiziell site:.de`);
  return {
    name: `Offiziellen Mietspiegel für ${city ?? "deine Stadt"} suchen`,
    url: `https://www.google.com/search?q=${q}`,
  };
}

export const MietspiegelCard = ({ zip, city }: Props) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!zip) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("market_index")
        .select("*")
        .eq("zip", zip)
        .maybeSingle();
      setStats(data);
      setLoading(false);
    })();
  }, [zip]);

  const off = officialLink(city);

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" /> Mietspiegel & Vergleichswerte
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {city ?? zip ?? "—"}
            {zip && city ? ` · PLZ ${zip}` : ""}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px]">ImmonIQ-Daten + offizielle Quelle</Badge>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Lade Vergleichswerte…</p>
      ) : stats ? (
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Ø Miete" value={stats.avg_rent_sqm ? `${num(Number(stats.avg_rent_sqm), 2)} €/m²` : "—"} />
          <Stat label="Ø Kauf" value={stats.avg_purchase_sqm ? `${num(Number(stats.avg_purchase_sqm), 0)} €/m²` : "—"} />
          <Stat
            label="Renditefaktor"
            value={stats.yield_factor ? `${num(Number(stats.yield_factor), 1)}×` : "—"}
            icon={<TrendingUp className="h-3 w-3" />}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Für PLZ {zip ?? "—"} liegen aktuell keine ImmonIQ-Vergleichswerte vor. Nutze den offiziellen Mietspiegel ↓
        </p>
      )}

      <a href={off.url} target="_blank" rel="noopener noreferrer" className="block">
        <Button variant="outline" className="w-full justify-between">
          <span className="text-sm">{off.name}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </a>

      <div className="flex items-start gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-md">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <span>
          ImmonIQ-Werte basieren auf aggregierten Marktdaten. Der offizielle Mietspiegel ist rechtlich
          maßgeblich (§ 558c BGB).
        </span>
      </div>
    </Card>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-lg border border-border/60 p-2.5 bg-background/40">
    <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
      {icon}{label}
    </p>
    <p className="text-sm font-bold tabular-nums mt-0.5">{value}</p>
  </div>
);

export default MietspiegelCard;
