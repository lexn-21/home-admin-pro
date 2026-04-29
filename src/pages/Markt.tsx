import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { eur, num } from "@/lib/format";
import { Search, MapPin, Bed, Maximize2, Filter } from "lucide-react";

const Markt = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("rent");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRooms, setMinRooms] = useState("");

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

        {loading ? (
          <div className="text-muted-foreground">Lade…</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center glass">
            <p className="text-muted-foreground">Noch keine Treffer. Speichere einen Suchauftrag, sobald du angemeldet bist.</p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((l) => {
              const cover = photoUrl(l.photos?.[0]);
              return (
                <Link to={`/markt/${l.id}`} key={l.id}>
                  <Card className="overflow-hidden glass hover:shadow-gold transition group">
                    <div className="aspect-video bg-muted relative">
                      {cover ? (
                        <img src={cover} alt={l.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Kein Foto</div>
                      )}
                      <Badge className="absolute top-2 left-2 bg-background/80 backdrop-blur text-foreground">
                        {l.kind === "rent" ? "Miete" : "Kauf"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold leading-tight line-clamp-2">{l.title}</h3>
                      </div>
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
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Markt;
