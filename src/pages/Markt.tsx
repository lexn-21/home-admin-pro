import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Logo } from "@/components/Logo";
import { eur, num } from "@/lib/format";
import { Search, MapPin, Bed, Maximize2, Filter, Target, X } from "lucide-react";
import { SponsoredSlot } from "@/components/market/SponsoredSlot";
import { approxLatLngFromZip } from "@/lib/geo";

const Markt = () => {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"rent" | "sale">("rent");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRooms, setMinRooms] = useState("");

  // Anker für Umkreissuche — entweder Listing-ID, oder PLZ+kind (z.B. eigenes Property)
  const anchorId = params.get("near");
  const anchorZip = params.get("zip");
  const anchorKindParam = (params.get("kind") as "rent" | "sale" | null) ?? null;
  const anchorLabel = params.get("label");
  const [anchor, setAnchor] = useState<any>(null);
  const [radiusKm, setRadiusKm] = useState<number>(Number(params.get("r") ?? 10));
  const [nearbyResults, setNearbyResults] = useState<any[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const hasAnchor = !!anchorId || !!anchorZip;

  useEffect(() => {
    document.title = "Markt — Wohnen & Kaufen · ImmoNIQ";
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(200);
      setItems(data ?? []);
      setLoading(false);
    })();
  }, []);

  // Anker laden + Umkreissuche
  useEffect(() => {
    if (!hasAnchor) {
      setAnchor(null);
      setNearbyResults(null);
      return;
    }
    (async () => {
      setNearbyLoading(true);
      let a: any = null;
      if (anchorId) {
        const { data } = await supabase.from("listings").select("*").eq("id", anchorId).maybeSingle();
        a = data;
      } else if (anchorZip) {
        a = {
          id: null,
          title: anchorLabel || `Umgebung ${anchorZip}`,
          zip: anchorZip,
          city: null,
          kind: anchorKindParam ?? "rent",
          lat: null,
          lng: null,
        };
      }
      setAnchor(a);
      if (!a) {
        setNearbyResults([]);
        setNearbyLoading(false);
        return;
      }

      const center =
        a.lat && a.lng
          ? { lat: Number(a.lat), lng: Number(a.lng) }
          : approxLatLngFromZip(a.zip);

      let nearby: any[] = [];
      if (center) {
        const { data: rpc } = await supabase.rpc("listings_nearby", {
          _lat: center.lat,
          _lng: center.lng,
          _radius_km: radiusKm,
          _kind: a.kind,
          _exclude_id: a.id,
          _limit: 60,
        });
        nearby = rpc ?? [];
      }
      // PLZ-Fallback ergänzen
      const have = new Set(nearby.map((n: any) => n.id));
      const prefix = a.zip ? a.zip.slice(0, 3) : null;
      if (prefix) {
        let qb = supabase
          .from("listings")
          .select("*")
          .eq("status", "published")
          .eq("kind", a.kind)
          .like("zip", `${prefix}%`)
          .limit(40);
        if (a.id) qb = qb.neq("id", a.id);
        const { data: byZip } = await qb;
        (byZip ?? []).forEach((l: any) => {
          if (!have.has(l.id)) {
            nearby.push({ ...l, distance_km: null });
            have.add(l.id);
          }
        });
      }
      setNearbyResults(nearby);
      setNearbyLoading(false);
    })();
  }, [anchorId, anchorZip, anchorKindParam, anchorLabel, radiusKm, hasAnchor]);

  const filtered = useMemo(() => {
    return items.filter((l) => {
      if (l.kind !== kind) return false;
      if (maxPrice && Number(l.price) > Number(maxPrice)) return false;
      if (minRooms && Number(l.rooms ?? 0) < Number(minRooms)) return false;
      if (q) {
        const hay = `${l.title} ${l.city} ${l.zip} ${l.description ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, q, kind, maxPrice, minRooms]);

  const photoUrl = (p?: string) =>
    p ? supabase.storage.from("listing-photos").getPublicUrl(p).data.publicUrl : null;

  const showNearby = !!anchor;
  const displayList = showNearby ? nearbyResults ?? [] : filtered;
  const adZip = anchor?.zip ?? null;
  const adCity = anchor?.city ?? null;
  const adKind = (anchor?.kind ?? kind) as "rent" | "sale";

  const clearAnchor = () => {
    const next = new URLSearchParams(params);
    next.delete("near");
    next.delete("zip");
    next.delete("kind");
    next.delete("label");
    setParams(next, { replace: true });
  };

  const setNear = (id: string) => {
    const next = new URLSearchParams(params);
    next.set("near", id);
    next.delete("zip");
    next.delete("kind");
    next.delete("label");
    setParams(next, { replace: true });
  };

  const setRadiusParam = (v: number) => {
    setRadiusKm(v);
    const next = new URLSearchParams(params);
    next.set("r", String(v));
    setParams(next, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 glass border-b border-border/60">
        <div className="container max-w-6xl flex items-center justify-between h-14">
          <Link to="/"><Logo /></Link>
          <div className="flex gap-2">
            <Link to="/auth"><Button variant="ghost" size="sm">Anmelden</Button></Link>
            <Link to="/app"><Button size="sm" className="bg-gradient-gold text-primary-foreground shadow-gold">Inserieren</Button></Link>
          </div>
        </div>
      </header>

      <section className="container max-w-6xl py-8 space-y-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Der Markt für ehrliches Wohnen.</h1>
          <p className="text-muted-foreground mt-2">
            Direkt vom Eigentümer. Keine Maklergebühr nach Bestellerprinzip. Keine bezahlten Plätze in den Ergebnissen.
          </p>
        </div>

        {/* Anker-Banner */}
        {anchor && (
          <Card className="p-4 glass border-primary/40 flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Umkreissuche um</p>
              <p className="font-semibold truncate">{anchor.title}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {[anchor.zip, anchor.city].filter(Boolean).join(" ")}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-12 shrink-0">Radius</span>
                <Slider
                  min={1}
                  max={50}
                  step={1}
                  value={[radiusKm]}
                  onValueChange={(v) => setRadiusParam(v[0])}
                  className="flex-1"
                />
                <span className="text-xs font-semibold w-12 text-right">{radiusKm} km</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearAnchor} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </Card>
        )}

        {/* Filter (nur ohne Anker) */}
        {!anchor && (
          <Card className="p-4 glass">
            <div className="grid md:grid-cols-5 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Stadt, PLZ oder Stichwort" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <Select value={kind} onValueChange={(v) => setKind(v as "rent" | "sale")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">Mieten</SelectItem>
                  <SelectItem value="sale">Kaufen</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder={`Max. ${kind === "rent" ? "Miete" : "Preis"}`} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              <Input type="number" step="0.5" placeholder="Min. Zimmer" value={minRooms} onChange={(e) => setMinRooms(e.target.value)} />
            </div>
            <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Filter className="h-3 w-3" /> {num(filtered.length)} Treffer
            </div>
          </Card>
        )}

        {(loading || nearbyLoading) ? (
          <div className="text-muted-foreground">Lade…</div>
        ) : displayList.length === 0 ? (
          <Card className="p-12 text-center glass">
            <p className="text-muted-foreground">
              {anchor
                ? "Keine Treffer im Umkreis. Erhöhe den Radius."
                : "Noch keine Treffer. Speichere einen Suchauftrag, sobald du angemeldet bist."}
            </p>
          </Card>
        ) : (
          <>
            {anchor && (
              <p className="text-sm text-muted-foreground">
                {num(displayList.length)} Objekte in der Umgebung ({anchor.kind === "rent" ? "Miete" : "Kauf"})
              </p>
            )}
            {/* Organische Treffer — KEINE Anzeigen mehr im Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayList.map((l) => {
                const cover = photoUrl(l.photos?.[0]);
                return (
                  <div key={l.id} className="relative group">
                    <Link to={`/markt/${l.id}`}>
                      <Card className="overflow-hidden glass hover:shadow-gold transition">
                        <div className="aspect-video bg-muted relative">
                          {cover ? (
                            <img src={cover} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Kein Foto</div>
                          )}
                          <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur text-foreground">
                            {l.kind === "rent" ? "Miete" : "Kauf"}
                          </Badge>
                          {typeof l.distance_km === "number" && (
                            <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground">
                              {l.distance_km < 1 ? "<1" : Math.round(l.distance_km)} km
                            </Badge>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold leading-tight line-clamp-2 mb-1">{l.title}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                            <MapPin className="h-3 w-3" /> {[l.zip, l.city].filter(Boolean).join(" ") || "—"}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex gap-3 text-muted-foreground">
                              <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {l.rooms ?? "—"}</span>
                              <span className="flex items-center gap-1"><Maximize2 className="h-3 w-3" /> {l.living_space ?? "—"} m²</span>
                            </div>
                            <span className="font-bold text-gradient-gold">{eur(l.price)}{l.kind === "rent" ? "/Mo" : ""}</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                    {!anchor && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => { e.preventDefault(); setNear(l.id); }}
                        className="absolute bottom-2 right-2 h-7 px-2 text-[11px] opacity-0 group-hover:opacity-100 transition"
                      >
                        <Target className="h-3 w-3 mr-1" /> Umkreis
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Genau EIN, klar gelabelter Hilfe-Hinweis unter den Treffern.
                Nicht in den organischen Ergebnissen vermischt. */}
            <div className="pt-2">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                Hilfe in deiner Nähe
              </p>
              <SponsoredSlot
                placement="market_top"
                zip={adZip}
                city={adCity}
                kind={adKind}
                limit={1}
              />
              <p className="text-[11px] text-muted-foreground mt-2">
                Anzeigen sind klar gekennzeichnet und beeinflussen nie die Reihenfolge der Wohnungs-Treffer oben.
              </p>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Markt;
