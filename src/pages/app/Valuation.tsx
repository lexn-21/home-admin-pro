import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Page, Stagger, Item, Counter } from "@/components/motion/Primitives";
import { eur, num, pct } from "@/lib/format";
import { estimateValue, AvmResult } from "@/lib/avm";
import { TrendingUp, MapPin, Home, Sparkles, Info } from "lucide-react";

type Prop = { id: string; name: string; zip: string | null; city: string | null };

const Valuation = () => {
  const [props, setProps] = useState<Prop[]>([]);
  const [zip, setZip] = useState("");
  const [livingSpace, setLivingSpace] = useState<number>(75);
  const [monthlyRent, setMonthlyRent] = useState<number>(950);
  const [result, setResult] = useState<AvmResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("properties").select("id,name,zip,city").then(({ data }) => {
      setProps(data ?? []);
    });
  }, []);

  const annualRent = useMemo(() => monthlyRent * 12, [monthlyRent]);

  const calc = async () => {
    if (!zip || zip.length < 4) {
      setError("Bitte gültige PLZ eingeben (mind. 4 Ziffern).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await estimateValue(zip, livingSpace, annualRent);
      setResult(r);
    } catch (e: any) {
      setError(e.message || "Bewertung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  const grossYield = result && result.value_blended ? (annualRent / result.value_blended) * 100 : 0;

  return (
    <Page>
      <Stagger className="space-y-6">
        <Item>
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              <Sparkles className="h-3 w-3" /> AVM · Live-Bewertung
            </span>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight">Was ist Ihre Immobilie heute wert?</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Sofort-Bewertung nach Sachwert- und Ertragswertverfahren auf Basis von ImmonIQ-Marktdaten pro PLZ.
            Aktualisiert monatlich, anonymisiert aus über 5.000 Objekten.
          </p>
        </Item>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <Item>
            <Card className="p-6 space-y-5 border-border/60">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Postleitzahl</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))} placeholder="z. B. 10115" className="pl-9 text-lg font-mono" />
                </div>
                {props.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {props.filter(p => p.zip).slice(0, 4).map(p => (
                      <button key={p.id} onClick={() => setZip(p.zip!)}
                        className="text-[11px] px-2 py-1 rounded-full bg-muted hover:bg-muted/70 text-muted-foreground transition">
                        {p.name} · {p.zip}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Wohnfläche (m²)</Label>
                <Input type="number" value={livingSpace} onChange={(e) => setLivingSpace(+e.target.value)} className="text-lg" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Kaltmiete pro Monat</Label>
                <Input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(+e.target.value)} className="text-lg" />
                <p className="text-xs text-muted-foreground">Jahresnettomiete: <strong className="text-foreground">{eur(annualRent)}</strong></p>
              </div>

              <Button onClick={calc} disabled={loading} className="w-full h-11">
                {loading ? "Berechne …" : "Neu bewerten"}
              </Button>
            </Card>
          </Item>

          <Item variant="scale">
            {loading ? (
              <Card className="p-8 h-full flex flex-col items-center justify-center border-dashed gap-3 min-h-[280px]">
                <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-muted-foreground">Berechne Sachwert &amp; Ertragswert …</p>
                <p className="text-xs text-muted-foreground/70">Marktdaten für PLZ {zip} werden abgerufen</p>
              </Card>
            ) : error ? (
              <Card className="p-8 h-full flex flex-col items-center justify-center border-destructive/40 bg-destructive/5 gap-3 min-h-[280px] text-center">
                <Info className="h-8 w-8 text-destructive" />
                <p className="font-semibold">Bewertung nicht möglich</p>
                <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
                <Button onClick={calc} variant="outline" size="sm">Erneut versuchen</Button>
              </Card>
            ) : result ? (
              <Card className="relative overflow-hidden p-8 border-primary/20" style={{ background: "var(--gradient-card, hsl(var(--card)))" }}>
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="relative space-y-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Home className="h-3 w-3" /> Geschätzter Marktwert
                    </p>
                    <motion.div
                      key={result.value_blended}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      className="font-display text-5xl md:text-6xl font-bold tracking-tight bg-gradient-gold bg-clip-text text-transparent"
                    >
                      <Counter value={result.value_blended} suffix=" €" />
                    </motion.div>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="font-normal">
                        Bruttorendite {pct(grossYield)}
                      </Badge>
                      <Badge variant="secondary" className="font-normal">
                        Faktor {num(result.yield_factor ?? 0, 1)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sachwert (40 %)</p>
                      <p className="text-xl font-semibold mt-1">{eur(result.value_sqm_method)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{eur(result.avg_purchase_sqm)}/m² · PLZ {result.zip}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ertragswert (60 %)</p>
                      <p className="text-xl font-semibold mt-1">{eur(result.value_income_method)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{num(result.yield_factor ?? 0, 1)}× Jahresmiete</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                    <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <p>
                      Indikative Bewertung nach <strong>ImmoWertV § 17/§ 27</strong>. Ersetzt kein Verkehrswertgutachten.
                      Datengrundlage: anonymisierter ImmonIQ-Marktindex.
                    </p>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 h-full flex items-center justify-center border-dashed">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p>PLZ eingeben für Live-Bewertung</p>
                </div>
              </Card>
            )}
          </Item>
        </div>
      </Stagger>
    </Page>
  );
};

export default Valuation;
