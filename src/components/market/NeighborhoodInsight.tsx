import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eur, num } from "@/lib/format";
import { MapPin, Target, Bed, Maximize2, TrendingUp } from "lucide-react";
import { approxLatLngFromZip } from "@/lib/geo";

type Props = {
  zip?: string | null;
  city?: string | null;
  kind?: "rent" | "sale";
  /** label im Anker-Banner im Markt */
  label?: string;
  radiusKm?: number;
};

/**
 * Zeigt im eigenen Objekt:
 * - Marktkennzahlen (Ø Miete/Kauf/m², Renditefaktor) für die PLZ
 * - Top-3 ähnliche Inserate aus dem Umkreis
 * - Button → öffnet Markt mit Anker-Modus
 */
export const NeighborhoodInsight = ({
  zip,
  city,
  kind = "rent",
  label,
  radiusKm = 10,
}: Props) => {
  const [stats, setStats] = useState<any>(null);
  const [nearby, setNearby] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!zip) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      // Marktindex
      const { data: m } = await supabase
        .from("market_index")
        .select("*")
        .eq("zip", zip)
        .maybeSingle();
      setStats(m);

      // Umkreis
      const center = approxLatLngFromZip(zip);
      let list: any[] = [];
      if (center) {
        const { data } = await supabase.rpc("listings_nearby", {
          _lat: center.lat,
          _lng: center.lng,
          _radius_km: radiusKm,
          _kind: kind,
          _exclude_id: null,
          _limit: 3,
        });
        list = data ?? [];
      }
      // Fallback PLZ-Präfix
      if (list.length < 3) {
        const prefix = zip.slice(0, 3);
        const { data } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "published")
          .eq("kind", kind)
          .like("zip", `${prefix}%`)
          .limit(3 - list.length);
        const have = new Set(list.map((l) => l.id));
        (data ?? []).forEach((l: any) => {
          if (!have.has(l.id)) list.push({ ...l, distance_km: null });
        });
      }
      setNearby(list.slice(0, 3));
      setLoading(false);
    })();
  }, [zip, kind, radiusKm]);

  if (!zip) return null;

  const photoUrl = (p?: string) =>
    p ? supabase.storage.from("listing-photos").getPublicUrl(p).data.publicUrl : null;

  const marktHref = `/markt?zip=${encodeURIComponent(zip)}&kind=${kind}&r=${radiusKm}${
    label ? `&label=${encodeURIComponent(label)}` : ""
  }`;

  return (
    <Card className="p-6 glass space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" /> Umgebung & Vergleichswerte
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            PLZ {zip}{city ? ` · ${city}` : ""} · Radius {radiusKm} km
          </p>
        </div>
        <Link to={marktHref}>
          <Button size="sm" variant="outline">
            <Target className="h-4 w-4 mr-2" /> Alle in der Nähe
          </Button>
        </Link>
      </div>

      {/* Vergleichskennzahlen */}
      {stats ? (
        <div className="grid grid-cols-3 gap-3">
          <Stat
            label="Ø Miete"
            value={stats.avg_rent_sqm ? `${num(Number(stats.avg_rent_sqm))} €/m²` : "—"}
          />
          <Stat
            label="Ø Kauf"
            value={stats.avg_purchase_sqm ? `${num(Number(stats.avg_purchase_sqm))} €/m²` : "—"}
          />
          <Stat
            label="Renditefaktor"
            value={stats.yield_factor ? `${num(Number(stats.yield_factor))}×` : "—"}
            icon={<TrendingUp className="h-3 w-3" />}
          />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Für PLZ {zip} liegen aktuell keine Vergleichsdaten vor.
        </p>
      )}

      {/* Top-3 Umkreis */}
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Aktuell {kind === "rent" ? "zur Miete" : "zum Kauf"} in der Nähe
        </p>
        {loading ? (
          <p className="text-sm text-muted-foreground">Lade…</p>
        ) : nearby.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Noch keine Vergleichs-Inserate in der Umgebung.
          </p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {nearby.map((l) => {
              const cover = photoUrl(l.photos?.[0]);
              return (
                <Link to={`/markt/${l.id}`} key={l.id}>
                  <Card className="overflow-hidden hover:shadow-md transition group">
                    <div className="aspect-video bg-muted relative">
                      {cover ? (
                        <img src={cover} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                          Kein Foto
                        </div>
                      )}
                      {typeof l.distance_km === "number" && (
                        <Badge className="absolute top-1.5 right-1.5 bg-primary/90 text-primary-foreground text-[10px]">
                          {l.distance_km < 1 ? "<1" : Math.round(l.distance_km)} km
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold line-clamp-1">{l.title}</p>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <span className="flex items-center gap-0.5"><Bed className="h-2.5 w-2.5" />{l.rooms ?? "—"}</span>
                          <span className="flex items-center gap-0.5"><Maximize2 className="h-2.5 w-2.5" />{l.living_space ?? "—"}m²</span>
                        </span>
                        <span className="font-semibold text-foreground">
                          {eur(l.price)}{l.kind === "rent" ? "/Mo" : ""}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

const Stat = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="rounded-lg border border-border/60 p-3 bg-background/40">
    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
      {icon}{label}
    </p>
    <p className="text-sm font-bold tabular mt-0.5">{value}</p>
  </div>
);
