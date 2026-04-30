import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Logo } from "@/components/Logo";
import { eur, date } from "@/lib/format";
import { Home, AlertTriangle, Plus, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Resolved = {
  tenant: { full_name: string; email: string | null; phone: string | null };
  unit: { label: string; rent_cold: number; utilities: number; living_space: number };
  property: { name: string; street: string; zip: string; city: string };
  issues: Array<{ id: string; title: string; description: string; severity: string; status: string; reported_at: string; category: string }>;
};

const SEV_TONE: Record<string, string> = {
  info: "bg-muted text-muted-foreground",
  minor: "bg-info/15 text-info",
  major: "bg-warning/15 text-warning",
  urgent: "bg-destructive/15 text-destructive",
};
const STATUS_LABEL: Record<string, string> = {
  open: "Offen", acknowledged: "Erhalten", in_progress: "In Bearbeitung", resolved: "Gelöst", closed: "Geschlossen"
};

const TenantPortal = () => {
  const { token } = useParams();
  const [data, setData] = useState<Resolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "sanitaer", severity: "minor", title: "", description: "" });

  const load = async () => {
    if (!token) return;
    setLoading(true);
    const { data: r } = await supabase.rpc("tenant_portal_resolve", { _token: token });
    setData(r as unknown as Resolved);
    setLoading(false);
  };
  useEffect(() => { load(); }, [token]);

  const submit = async () => {
    const { error } = await supabase.rpc("tenant_portal_report_issue", {
      _token: token!, _category: form.category, _severity: form.severity as any,
      _title: form.title, _description: form.description,
    });
    if (error) { toast.error("Fehler: " + error.message); return; }
    toast.success("Schaden gemeldet — Ihr Vermieter wurde informiert");
    setOpen(false);
    setForm({ category: "sanitaer", severity: "minor", title: "", description: "" });
    load();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
  if (!data) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 text-center max-w-md">
        <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-warning" />
        <h2 className="font-display text-xl font-semibold mb-2">Link ungültig</h2>
        <p className="text-sm text-muted-foreground">Dieser Mieter-Link ist abgelaufen oder wurde widerrufen.</p>
      </Card>
    </div>
  );

  const total = Number(data.unit.rent_cold ?? 0) + Number(data.unit.utilities ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="container max-w-4xl py-4 flex items-center justify-between">
          <Logo />
          <Badge variant="secondary" className="text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" />Mieter-Portal</Badge>
        </div>
      </header>

      <main className="container max-w-4xl py-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-sm text-muted-foreground">Hallo</p>
          <h1 className="font-display text-4xl font-bold tracking-tight">{data.tenant.full_name}</h1>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{data.property.name} · {data.unit.label}</p>
                <p className="text-sm text-muted-foreground">{data.property.street}, {data.property.zip} {data.property.city}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Kaltmiete</p>
                <p className="font-mono font-semibold mt-1">{eur(data.unit.rent_cold)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Nebenkosten</p>
                <p className="font-mono font-semibold mt-1">{eur(data.unit.utilities)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Warmmiete</p>
                <p className="font-mono font-semibold mt-1 text-primary">{eur(total)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Schadensmeldungen</h2>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Schaden melden</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Neuer Schaden</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Kategorie</Label>
                    <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sanitaer">Sanitär / Wasser</SelectItem>
                        <SelectItem value="elektrik">Elektrik</SelectItem>
                        <SelectItem value="heizung">Heizung</SelectItem>
                        <SelectItem value="fenster">Fenster / Türen</SelectItem>
                        <SelectItem value="schimmel">Schimmel</SelectItem>
                        <SelectItem value="laerm">Lärm / Nachbarn</SelectItem>
                        <SelectItem value="sonstiges">Sonstiges</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Dringlichkeit</Label>
                    <Select value={form.severity} onValueChange={(v) => setForm({...form, severity: v})}>
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="minor">Klein</SelectItem>
                        <SelectItem value="major">Groß</SelectItem>
                        <SelectItem value="urgent">Dringend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titel</Label>
                  <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="z. B. Heizung im Wohnzimmer kalt" />
                </div>
                <div className="space-y-2">
                  <Label>Beschreibung</Label>
                  <Textarea rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
                </div>
                <Button onClick={submit} disabled={!form.title} className="w-full h-11">Senden</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          {data.issues.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              Keine offenen Meldungen. Alles in Ordnung. ✨
            </div>
          ) : (
            <div className="divide-y">
              {data.issues.map(i => (
                <div key={i.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="font-medium">{i.title}</p>
                    <div className="flex gap-1.5">
                      <Badge className={SEV_TONE[i.severity]}>{i.severity}</Badge>
                      <Badge variant="outline">{STATUS_LABEL[i.status]}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{date(i.reported_at)} · {i.category}</p>
                  {i.description && <p className="text-sm text-muted-foreground mt-2">{i.description}</p>}
                </div>
              ))}
            </div>
          )}
        </Card>

        <p className="text-xs text-center text-muted-foreground py-4">
          Sicher · DSGVO · End-to-End verschlüsselt · ImmonIQ
        </p>
      </main>
    </div>
  );
};

export default TenantPortal;
