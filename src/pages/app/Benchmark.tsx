import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Page, Stagger, Item } from "@/components/motion/Primitives";
import { eur, num, pct } from "@/lib/format";
import { ArrowDown, ArrowUp, Minus, BarChart3, Shield } from "lucide-react";

type Row = {
  property: string;
  zip: string;
  city: string;
  myRentSqm: number;
  marketRentSqm: number;
  myYield: number;
  marketYield: number;
  vacancy: number;
  sample: number;
};

const Trend = ({ delta }: { delta: number }) => {
  const Icon = delta > 1 ? ArrowUp : delta < -1 ? ArrowDown : Minus;
  const color = delta > 1 ? "text-success" : delta < -1 ? "text-destructive" : "text-muted-foreground";
  return <Icon className={`h-4 w-4 ${color}`} />;
};

const Benchmark = () => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data: props } = await supabase.from("properties").select("id,name,zip,city,purchase_price");
      const { data: units } = await supabase.from("units").select("property_id,living_space,rent_cold");
      const zips = Array.from(new Set((props ?? []).map(p => p.zip).filter(Boolean) as string[]));
      const { data: market } = await supabase.from("market_index").select("*").in("zip", zips.length ? zips : [""]);
      const mMap = new Map((market ?? []).map(m => [m.zip, m]));

      const out: Row[] = (props ?? []).filter(p => p.zip).map(p => {
        const u = (units ?? []).filter(x => x.property_id === p.id);
        const space = u.reduce((s, x) => s + Number(x.living_space ?? 0), 0);
        const rent = u.reduce((s, x) => s + Number(x.rent_cold ?? 0), 0);
        const m = mMap.get(p.zip!);
        const myRentSqm = space > 0 ? rent / space : 0;
        const myYield = p.purchase_price && Number(p.purchase_price) > 0 ? (rent * 12) / Number(p.purchase_price) * 100 : 0;
        return {
          property: p.name,
          zip: p.zip!,
          city: p.city ?? m?.city ?? "—",
          myRentSqm,
          marketRentSqm: Number(m?.avg_rent_sqm ?? 0),
          myYield,
          marketYield: m ? (12 / Number(m.yield_factor)) * 100 : 0,
          vacancy: Number(m?.vacancy_rate ?? 0),
          sample: Number(m?.sample_size ?? 0),
        };
      });
      setRows(out);
    })();
  }, []);

  const totals = useMemo(() => {
    if (!rows.length) return null;
    const avgMy = rows.reduce((s, r) => s + r.myRentSqm, 0) / rows.length;
    const avgMarket = rows.reduce((s, r) => s + r.marketRentSqm, 0) / rows.length;
    const delta = avgMarket > 0 ? ((avgMy - avgMarket) / avgMarket) * 100 : 0;
    return { avgMy, avgMarket, delta };
  }, [rows]);

  return (
    <Page>
      <Stagger className="space-y-6">
        <Item>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary mb-2">
            <BarChart3 className="h-3 w-3" /> ImmonIQ Index · Anonymisiert
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight">Marktvergleich</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Wie schneiden Ihre Objekte gegen den lokalen Markt ab? Daten aus über 5.000 anonymisierten Mietverhältnissen.
          </p>
        </Item>

        {totals && (
          <Item variant="scale">
            <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ihr Schnitt €/m²</p>
                  <p className="font-display text-3xl font-bold mt-1">{eur(totals.avgMy)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Markt €/m²</p>
                  <p className="font-display text-3xl font-bold mt-1 text-muted-foreground">{eur(totals.avgMarket)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Delta zum Markt</p>
                  <p className={`font-display text-3xl font-bold mt-1 ${totals.delta >= 0 ? "text-success" : "text-destructive"}`}>
                    {totals.delta >= 0 ? "+" : ""}{pct(totals.delta)}
                  </p>
                </div>
              </div>
            </Card>
          </Item>
        )}

        <Item>
          <Card className="overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Pro Objekt</h3>
              <Badge variant="secondary" className="font-normal text-[10px]">
                <Shield className="h-3 w-3 mr-1" /> DSGVO-konform anonymisiert
              </Badge>
            </div>
            <div className="divide-y">
              {rows.length === 0 && (
                <div className="p-10 text-center text-muted-foreground text-sm">
                  Noch keine Objekte mit PLZ. Hinterlegen Sie eine Postleitzahl bei Ihren Objekten.
                </div>
              )}
              {rows.map((r) => {
                const dRent = r.marketRentSqm > 0 ? ((r.myRentSqm - r.marketRentSqm) / r.marketRentSqm) * 100 : 0;
                return (
                  <div key={r.property} className="p-4 grid md:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-4 items-center hover:bg-muted/30 transition">
                    <div>
                      <p className="font-medium">{r.property}</p>
                      <p className="text-xs text-muted-foreground">{r.city} · {r.zip} · n={num(r.sample)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Ihre Miete €/m²</p>
                      <p className="font-mono">{eur(r.myRentSqm)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Markt €/m²</p>
                      <p className="font-mono text-muted-foreground">{eur(r.marketRentSqm)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Leerstand PLZ</p>
                      <p className="font-mono">{pct(r.vacancy)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 justify-self-end">
                      <Trend delta={dRent} />
                      <span className={`text-sm font-semibold ${dRent > 1 ? "text-success" : dRent < -1 ? "text-destructive" : "text-muted-foreground"}`}>
                        {dRent >= 0 ? "+" : ""}{pct(dRent)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Item>
      </Stagger>
    </Page>
  );
};

export default Benchmark;
