import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Page, Stagger, Item } from "@/components/motion/Primitives";
import { eur, date } from "@/lib/format";
import { Briefcase, Star, Phone, Plus, ShieldCheck, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type Provider = {
  id: string; name: string; category: string; city: string; zip: string;
  phone: string; rating: number; reviews_count: number; premium: boolean;
  hourly_rate: number; response_time_hours: number; verified: boolean;
};
type Booking = {
  id: string; title: string; description: string | null; status: string;
  category: string; quoted_amount: number | null; final_amount: number | null;
  commission_amount: number | null; commission_rate: number;
  scheduled_at: string | null; created_at: string;
  provider_id: string | null;
};

const CATS = [
  { v: "sanitaer", l: "Sanitär" }, { v: "elektrik", l: "Elektrik" },
  { v: "heizung", l: "Heizung" }, { v: "dach", l: "Dach" },
  { v: "maler", l: "Maler" }, { v: "garten", l: "Garten" },
  { v: "reinigung", l: "Reinigung" }, { v: "schluessel", l: "Schlüssel" },
  { v: "schaedling", l: "Schädlinge" },
];

const STATUS_TONE: Record<string, string> = {
  requested: "bg-muted text-muted-foreground",
  quoted: "bg-info/15 text-info",
  accepted: "bg-primary/15 text-primary",
  in_progress: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/15 text-destructive",
  disputed: "bg-destructive/15 text-destructive",
};
const STATUS_LABEL: Record<string, string> = {
  requested: "Angefragt", quoted: "Angebot da", accepted: "Beauftragt",
  in_progress: "In Arbeit", completed: "Erledigt", cancelled: "Storniert", disputed: "In Klärung",
};

const Bookings = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ provider_id: "", category: "sanitaer", title: "", description: "", urgency: "normal" });

  const load = async () => {
    const [{ data: p }, { data: b }] = await Promise.all([
      supabase.from("providers").select("*").order("premium", { ascending: false }).order("rating", { ascending: false }),
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    ]);
    setProviders((p ?? []) as Provider[]);
    setBookings((b ?? []) as Booking[]);
  };
  useEffect(() => { load(); }, []);

  const filteredProviders = useMemo(
    () => filter === "all" ? providers : providers.filter(p => p.category === filter),
    [providers, filter]
  );

  const submit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const provider = providers.find(p => p.id === form.provider_id);
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      provider_id: form.provider_id || null,
      category: (provider?.category ?? form.category) as any,
      title: form.title,
      description: form.description,
      urgency: form.urgency,
      commission_rate: 10,
    });
    if (error) { toast.error("Fehler: " + error.message); return; }
    toast.success("Anfrage gesendet — Sie erhalten ein Angebot innerhalb 24 h");
    setOpen(false);
    setForm({ provider_id: "", category: "sanitaer", title: "", description: "", urgency: "normal" });
    load();
  };

  const totalCommission = bookings.reduce((s, b) => s + Number(b.commission_amount ?? 0), 0);
  const activeCount = bookings.filter(b => !["completed","cancelled"].includes(b.status)).length;

  return (
    <Page>
      <Stagger className="space-y-6">
        <Item>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary mb-2">
                <Sparkles className="h-3 w-3" /> Marktplatz · Verifizierte Profis
              </span>
              <h1 className="font-display text-4xl font-bold tracking-tight">Handwerker buchen</h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Geprüfte Dienstleister, transparente Preise, Festpreis-Angebote in 24 h.
                Bezahlung über ImmonIQ-Treuhand — sicher für Sie und den Profi.
              </p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="h-11"><Plus className="h-4 w-4 mr-2" />Auftrag erstellen</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Neuer Auftrag</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profi (optional — sonst Ausschreibung)</Label>
                    <Select value={form.provider_id} onValueChange={(v) => setForm({...form, provider_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Frei ausschreiben"/></SelectTrigger>
                      <SelectContent>
                        {providers.map(p => <SelectItem key={p.id} value={p.id}>{p.name} · {p.city}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        {CATS.map(c => <SelectItem key={c.v} value={c.v}>{c.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Titel</Label>
                    <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="z. B. Wasserhahn Küche tropft" />
                  </div>
                  <div className="space-y-2">
                    <Label>Beschreibung</Label>
                    <Textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Dringlichkeit</Label>
                    <Select value={form.urgency} onValueChange={(v) => setForm({...form, urgency: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Niedrig (innerhalb 4 Wochen)</SelectItem>
                        <SelectItem value="normal">Normal (innerhalb 1 Woche)</SelectItem>
                        <SelectItem value="high">Hoch (innerhalb 48 h)</SelectItem>
                        <SelectItem value="emergency">Notfall (sofort)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted/40 p-3 rounded-xl">
                    <strong>Provision: 10 %</strong> auf den Endbetrag — wird erst bei erfolgreicher Erledigung fällig.
                  </div>
                  <Button onClick={submit} className="w-full h-11" disabled={!form.title}>Anfrage senden</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Item>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: "Aktive Aufträge", v: activeCount, icon: Clock },
            { l: "Erledigt", v: bookings.filter(b => b.status === "completed").length, icon: CheckCircle2 },
            { l: "Gesamtvolumen", v: eur(bookings.reduce((s,b) => s + Number(b.final_amount ?? b.quoted_amount ?? 0), 0)), icon: Briefcase },
            { l: "Verifizierte Profis", v: providers.filter(p => p.verified).length, icon: ShieldCheck },
          ].map((k) => (
            <Item key={k.l} variant="scale">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.l}</p>
                  <k.icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="font-display text-2xl font-bold">{k.v}</p>
              </Card>
            </Item>
          ))}
        </div>

        {/* Bookings */}
        {bookings.length > 0 && (
          <Item>
            <Card className="overflow-hidden">
              <div className="p-4 border-b"><h3 className="font-semibold">Meine Aufträge</h3></div>
              <div className="divide-y">
                <AnimatePresence>
                  {bookings.map(b => {
                    const provider = providers.find(p => p.id === b.provider_id);
                    return (
                      <motion.div key={b.id} layout
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="p-4 hover:bg-muted/30 transition">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{b.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {provider?.name ?? "Ausschreibung"} · {date(b.created_at)}
                            </p>
                            {b.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{b.description}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge className={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                            {b.quoted_amount && <p className="text-sm font-semibold mt-2">{eur(b.quoted_amount)}</p>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </Card>
          </Item>
        )}

        {/* Provider grid */}
        <Item>
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <button onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === "all" ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
              Alle ({providers.length})
            </button>
            {CATS.map(c => {
              const n = providers.filter(p => p.category === c.v).length;
              if (!n) return null;
              return (
                <button key={c.v} onClick={() => setFilter(c.v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${filter === c.v ? "bg-foreground text-background" : "bg-muted text-muted-foreground"}`}>
                  {c.l} ({n})
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProviders.map((p) => (
              <motion.div key={p.id} whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className={`p-4 h-full ${p.premium ? "border-primary/40 bg-gradient-to-br from-primary/[0.04] to-transparent" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.city} · {p.zip}</p>
                    </div>
                    {p.premium && <Badge className="bg-primary text-primary-foreground text-[9px]">Premium</Badge>}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <strong className="text-foreground">{p.rating.toFixed(1)}</strong>
                    <span>· {p.reviews_count} Bewertungen</span>
                    {p.verified && <ShieldCheck className="h-3 w-3 text-success ml-auto" />}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <div className="flex justify-between"><span>Stundensatz</span><strong className="text-foreground">{eur(p.hourly_rate)}</strong></div>
                    <div className="flex justify-between"><span>Reaktionszeit</span><strong className="text-foreground">≤ {p.response_time_hours} h</strong></div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full"
                    onClick={() => { setForm({...form, provider_id: p.id, category: p.category}); setOpen(true); }}>
                    Anfragen
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </Item>
      </Stagger>
    </Page>
  );
};

export default Bookings;
