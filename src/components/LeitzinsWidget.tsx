import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { TrendingDown, TrendingUp, Percent, Calculator as CalcIcon } from "lucide-react";

type Rate = { value: number; date: string; source: "ecb" | "fallback" };

// Fallback (Stand Mai 2026 — wird automatisch durch ECB-Live-Daten überschrieben).
const FALLBACK: Rate = { value: 3.40, date: "2026-04-17", source: "fallback" };

async function fetchEcbRate(): Promise<Rate> {
  try {
    const url =
      "https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.MRR_FR.LEV?format=jsondata&lastNObservations=1";
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    clearTimeout(t);
    if (!res.ok) throw new Error("ecb http");
    const j = await res.json();
    const obs = j?.dataSets?.[0]?.series?.["0:0:0:0:0:0:0"]?.observations ?? {};
    const dim = j?.structure?.dimensions?.observation?.[0]?.values ?? [];
    const keys = Object.keys(obs);
    if (!keys.length) throw new Error("empty");
    const lastIdx = Math.max(...keys.map(Number));
    const value = obs[String(lastIdx)][0] as number;
    const date = dim[lastIdx]?.id || "";
    return { value, date, source: "ecb" };
  } catch {
    return FALLBACK;
  }
}

export function LeitzinsWidget() {
  const [rate, setRate] = useState<Rate | null>(null);

  useEffect(() => {
    let alive = true;
    fetchEcbRate().then(r => alive && setRate(r));
    return () => { alive = false; };
  }, []);

  // Trend-Heuristik: > 3 = hoch, < 2 = niedrig
  const tone = !rate ? "default" : rate.value >= 3 ? "warning" : rate.value <= 2 ? "success" : "default";
  const Icon = !rate ? Percent : rate.value >= 3 ? TrendingUp : TrendingDown;

  return (
    <Card className="p-5 glass">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
            EZB-Leitzins (Hauptrefinanzierung)
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-3xl font-bold tabular tracking-tight">
              {rate ? `${rate.value.toFixed(2)} %` : "—"}
            </p>
            {rate && (
              <span className="text-xs text-muted-foreground">
                seit {new Date(rate.date).toLocaleDateString("de-DE")}
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${
            tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-muted-foreground"
          }`}>
            {!rate
              ? "Lade aktuelle Daten…"
              : rate.value >= 3
                ? "Zinsniveau hoch — Anschlussfinanzierung früh prüfen."
                : rate.value <= 2
                  ? "Zinsniveau niedrig — gute Phase für Finanzierung."
                  : "Zinsniveau moderat."}
          </p>
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          tone === "warning" ? "bg-warning/10" : tone === "success" ? "bg-success/10" : "bg-primary/10"
        }`}>
          <Icon className={`h-[18px] w-[18px] ${
            tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-primary"
          }`} />
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
        <span className="text-[10px] text-muted-foreground">
          Quelle: {rate?.source === "ecb" ? "EZB Data Portal" : "Letzter bekannter Stand"}
        </span>
        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
          <Link to="/app/calculator?tab=zins">
            <CalcIcon className="h-3 w-3 mr-1" /> Was-wäre-wenn
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default LeitzinsWidget;
