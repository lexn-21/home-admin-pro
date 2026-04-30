import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { Megaphone, Plus, Eye, MousePointerClick, Calendar, AlertCircle, CheckCircle2, Clock, XCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

type AdSlot = {
  id: string;
  title: string;
  subtitle: string | null;
  sponsor_name: string | null;
  click_url: string;
  cta_label: string | null;
  placement: string;
  target_zips: string[];
  target_cities: string[];
  target_kind: string | null;
  active: boolean;
  moderation_status: "pending" | "approved" | "rejected" | "paused";
  paid_until: string | null;
  impressions_count: number;
  clicks_count: number;
  rejection_reason: string | null;
  created_at: string;
};

const PLACEMENTS = [
  { value: "market_top", label: "Markt – Banner oben" },
  { value: "market_grid", label: "Markt – im Grid" },
  { value: "marketplace_category", label: "Handwerker-Kategorie" },
];

const PRICE_PER_WEEK = 49;

export default function MyAds() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [bookSlot, setBookSlot] = useState<AdSlot | null>(null);
  const [weeks, setWeeks] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    sponsor_name: "",
    click_url: "",
    cta_label: "Mehr erfahren",
    placement: "market_grid",
    target_zips: "",
    target_cities: "",
    target_kind: "any",
  });

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("ad_slots")
      .select("*")
      .eq("advertiser_user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Fehler beim Laden");
    } else {
      setSlots((data as AdSlot[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user) return;
    if (!form.title.trim()) return toast.error("Titel ist Pflicht");
    if (!form.click_url.match(/^https?:\/\//)) return toast.error("Link muss mit https:// beginnen");

    const zips = form.target_zips.split(",").map(s => s.trim()).filter(Boolean);
    const cities = form.target_cities.split(",").map(s => s.trim()).filter(Boolean);

    const { error } = await supabase.from("ad_slots").insert({
      advertiser_user_id: user.id,
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      sponsor_name: form.sponsor_name.trim() || null,
      click_url: form.click_url.trim(),
      cta_label: form.cta_label.trim() || "Mehr erfahren",
      placement: form.placement,
      target_zips: zips,
      target_cities: cities,
      target_kind: form.target_kind === "any" ? null : form.target_kind,
      active: false,
      moderation_status: "pending",
    });
    if (error) {
      toast.error("Fehler: " + error.message);
      return;
    }
    toast.success("Werbeplatz erstellt — wartet auf Freigabe");
    setCreateOpen(false);
    setForm({ ...form, title: "", subtitle: "", sponsor_name: "", click_url: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Werbeplatz löschen?")) return;
    const { error } = await supabase.from("ad_slots").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Gelöscht");
    load();
  };

  const statusBadge = (slot: AdSlot) => {
    const paid = slot.paid_until && new Date(slot.paid_until) > new Date();
    if (slot.moderation_status === "pending") return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Wartet auf Freigabe</Badge>;
    if (slot.moderation_status === "rejected") return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Abgelehnt</Badge>;
    if (slot.moderation_status === "paused") return <Badge variant="outline">Pausiert</Badge>;
    if (slot.moderation_status === "approved" && !paid) return <Badge variant="outline" className="border-amber-500 text-amber-600"><AlertCircle className="h-3 w-3 mr-1" />Bezahlung ausstehend</Badge>;
    if (slot.moderation_status === "approved" && paid) return <Badge className="bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Live</Badge>;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Megaphone className="h-7 w-7 text-primary" /> Werbeplätze
          </h1>
          <p className="text-muted-foreground mt-1">
            Erreiche Eigentümer, Mieter und Käufer in der ImmoNIQ-App. {PRICE_PER_WEEK} € pro Woche pro Slot.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Neuer Werbeplatz</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Werbeplatz anlegen</DialogTitle>
              <DialogDescription>
                Nach dem Erstellen prüfen wir den Inhalt (i.d.R. innerhalb 24h). Erst dann buchbar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Titel *</Label>
                <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="z.B. Kostenlose Marktwert-Analyse" maxLength={80} />
              </div>
              <div>
                <Label>Untertitel</Label>
                <Input value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} placeholder="kurzer Zusatz" maxLength={120} />
              </div>
              <div>
                <Label>Anbieter-Name</Label>
                <Input value={form.sponsor_name} onChange={e => setForm({...form, sponsor_name: e.target.value})} placeholder="dein Firmenname" maxLength={60} />
              </div>
              <div>
                <Label>Ziel-Link (https://...) *</Label>
                <Input value={form.click_url} onChange={e => setForm({...form, click_url: e.target.value})} placeholder="https://example.com" />
              </div>
              <div>
                <Label>Button-Text</Label>
                <Input value={form.cta_label} onChange={e => setForm({...form, cta_label: e.target.value})} maxLength={30} />
              </div>
              <div>
                <Label>Platzierung</Label>
                <Select value={form.placement} onValueChange={v => setForm({...form, placement: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLACEMENTS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ziel-PLZ (kommagetrennt, optional)</Label>
                <Input value={form.target_zips} onChange={e => setForm({...form, target_zips: e.target.value})} placeholder="10115, 10117, 80331" />
              </div>
              <div>
                <Label>Ziel-Städte (kommagetrennt, optional)</Label>
                <Input value={form.target_cities} onChange={e => setForm({...form, target_cities: e.target.value})} placeholder="Berlin, München" />
              </div>
              <div>
                <Label>Ziel-Typ</Label>
                <Select value={form.target_kind} onValueChange={v => setForm({...form, target_kind: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Alle</SelectItem>
                    <SelectItem value="rent">Nur Miete</SelectItem>
                    <SelectItem value="sale">Nur Kauf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={submit} className="w-full">Zur Prüfung einreichen</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Lädt...</p>
      ) : slots.length === 0 ? (
        <Card className="p-8 text-center">
          <Megaphone className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="font-medium">Noch keine Werbeplätze</p>
          <p className="text-sm text-muted-foreground mt-1">Lege deinen ersten Werbeplatz an und erreiche zielgenau die richtigen Nutzer.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => {
            const paid = slot.paid_until && new Date(slot.paid_until) > new Date();
            const ctr = slot.impressions_count > 0
              ? ((slot.clicks_count / slot.impressions_count) * 100).toFixed(2)
              : "0";
            return (
              <Card key={slot.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{slot.title}</p>
                      {statusBadge(slot)}
                    </div>
                    {slot.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{slot.subtitle}</p>}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      <span>📍 {PLACEMENTS.find(p => p.value === slot.placement)?.label}</span>
                      {slot.target_zips.length > 0 && <span>PLZ: {slot.target_zips.join(", ")}</span>}
                      {slot.target_cities.length > 0 && <span>Städte: {slot.target_cities.join(", ")}</span>}
                    </div>
                    {slot.rejection_reason && (
                      <p className="text-xs text-destructive mt-2">Ablehnungsgrund: {slot.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {slot.impressions_count}</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> {slot.clicks_count}</span>
                      <span className="text-muted-foreground">CTR {ctr}%</span>
                    </div>
                    {paid && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" /> bis {new Date(slot.paid_until!).toLocaleDateString("de-DE")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {slot.moderation_status === "approved" && (
                    <Button size="sm" onClick={() => { setBookSlot(slot); setWeeks(1); }} className="gap-1">
                      <CreditCard className="h-3 w-3" /> {paid ? "Verlängern" : "Buchen"}
                    </Button>
                  )}
                  {!paid && <Button size="sm" variant="outline" onClick={() => remove(slot.id)}>Löschen</Button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Buchungs-Dialog */}
      <Dialog open={!!bookSlot && !showCheckout} onOpenChange={() => { setBookSlot(null); setShowCheckout(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Werbeplatz buchen</DialogTitle>
            <DialogDescription>{bookSlot?.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Laufzeit (Wochen)</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={weeks}
                onChange={e => setWeeks(Math.max(1, Math.min(52, Number(e.target.value) || 1)))}
              />
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between"><span>{weeks} × 7 Tage</span><span>{weeks * PRICE_PER_WEEK},00 €</span></div>
              <div className="text-xs text-muted-foreground mt-1">inkl. MwSt., einmalige Zahlung</div>
            </div>
            <Button className="w-full" onClick={() => setShowCheckout(true)}>
              Jetzt {weeks * PRICE_PER_WEEK},00 € bezahlen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCheckout} onOpenChange={(o) => { if (!o) { setShowCheckout(false); setBookSlot(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bezahlung</DialogTitle>
          </DialogHeader>
          {bookSlot && showCheckout && (
            <AdCheckout
              adSlotId={bookSlot.id}
              weeks={weeks}
              onDone={() => { setShowCheckout(false); setBookSlot(null); load(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdCheckout({ adSlotId, weeks, onDone }: { adSlotId: string; weeks: number; onDone: () => void }) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const env = (import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string)?.startsWith("pk_test_") ? "sandbox" : "live";
      const { data, error } = await supabase.functions.invoke("create-ad-checkout", {
        body: {
          adSlotId,
          weeks,
          environment: env,
          returnUrl: `${window.location.origin}/app/ads?paid=1&session_id={CHECKOUT_SESSION_ID}`,
        },
      });
      if (error || !data?.clientSecret) {
        setError(error?.message || "Checkout konnte nicht erstellt werden");
        return;
      }
      setClientSecret(data.clientSecret);
    })();
  }, [adSlotId, weeks]);

  if (error) return <p className="text-destructive text-sm">{error}</p>;
  if (!clientSecret) return <p className="text-muted-foreground text-sm">Lädt Bezahlung...</p>;

  return <StripeEmbeddedCheckoutInline clientSecret={clientSecret} />;
}

import { EmbeddedCheckoutProvider, EmbeddedCheckout as StripeEC } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe";

function StripeEmbeddedCheckoutInline({ clientSecret }: { clientSecret: string }) {
  const fetchClientSecret = async () => clientSecret;
  return (
    <div id="ad-checkout">
      <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
        <StripeEC />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
