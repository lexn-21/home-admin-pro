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
  const [kind, setKind] = useState("rent");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRooms, setMinRooms] = useState("");

  // Anker für Umkreissuche
  const anchorId = params.get("near");
  const [anchor, setAnchor] = useState<any>(null);
  const [radiusKm, setRadiusKm] = useState<number>(Number(params.get("r") ?? 10));
  const [nearbyResults, setNearbyResults] = useState<any[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);

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
    if (!anchorId) {
      setAnchor(null);
      setNearbyResults(null);
      return;
    }
    (async () => {
      setNearbyLoading(true);
      const { data: a } = await supabase.from("listings").select("*").eq("id", anchorId).maybeSingle();
      setAnchor(a);
      if (!a) {
        setNearbyResults([]);
        setNearbyLoading(false);
        return;
      }
      // 1) Echter Radius via lat/lng (am Anker oder via PLZ-Fallback)
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
      // 2) PLZ-Fallback ergänzen (falls Listings keine lat/lng haben)
      const have = new Set(nearby.map((n: any) => n.id));
      const prefix = a.zip ? a.zip.slice(0, 3) : null;
      if (prefix) {
        const { data: byZip } = await supabase
          .from("listings")
          .select("*")
          .eq("status", "published")
          .eq("kind", a.kind)
          .neq("id", a.id)
          .like("zip", `${prefix}%`)
          .limit(40);
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
  }, [anchorId, radiusKm]);

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

  const setNear = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set("near", id);
    else next.delete("near");
    setParams(next, { replace: true });
  };

  const setRadiusParam = (v: number) => {
    setRadiusKm(v);
    const next = new URLSearchParams(params);
    next.set("r", String(v));
    setParams(next, { replace: true });
  };

  // Anzeigen alle 6 Karten einstreuen
  const interleaved = useMemo(() => {
    const out: Array<{ type: "listing"; data: any } | { type: "ad"; key: string }> = [];
    displayList.forEach((l, i) => {
      out.push({ type: "listing", data: l });
      if ((i + 1) % 6 === 0) out.push({ type: "ad", key: `ad-${i}` });
    });
    return out;
  }, [displayList]);

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
          <p className="text-muted-foreground mt-2">Direkt vom Eigentümer. Keine Maklergebühr nach Bestellerprinzip.</p>
        </div>

        {/* Top-Banner Anzeige */}
        <SponsoredSlot placement="market_top" zip={adZip} city={adCity} kind={adKind} variant="banner" limit={1} />

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
            <Button variant="ghost" size="sm" onClick={() => setNear(null)} className="shrink-0">
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
              <Select value={kind} onValueChange={setKind}>
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {interleaved.map((entry) => {
                if (entry.type === "ad") {
                  return (
                    <SponsoredSlot
                      key={entry.key}
                      placement="market_grid"
                      zip={adZip}
                      city={adCity}
                      kind={adKind}
                      limit={1}
                    />
                  );
                }
                const l = entry.data;
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
          </>
        )}
      </section>
    </div>
  );
};

export default Markt;
