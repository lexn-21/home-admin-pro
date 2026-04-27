import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Copy, Trash2, Eye, Calendar, Mail, Link as LinkIcon, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { date } from "@/lib/format";

const Advisor = () => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ advisor_name: "", advisor_email: "" });

  useEffect(() => { document.title = "Steuerberater · ImmoNIQ"; load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("advisor_links").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  const submit = async () => {
    if (!form.advisor_name.trim()) return toast.error("Name fehlt");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const payload: any = { user_id: user.id, advisor_name: form.advisor_name.trim() };
    if (form.advisor_email.trim()) payload.advisor_email = form.advisor_email.trim();
    const { error } = await supabase.from("advisor_links").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Steuerberater-Link erstellt.");
    setOpen(false);
    setForm({ advisor_name: "", advisor_email: "" });
    load();
  };

  const linkFor = (token: string) => `${window.location.origin}/advisor/${token}`;

  const copyLink = async (token: string) => {
    await navigator.clipboard.writeText(linkFor(token));
    toast.success("Link kopiert.");
  };

  const revoke = async (id: string) => {
    if (!confirm("Zugriff wirklich widerrufen? Der Link funktioniert dann nicht mehr.")) return;
    const { error } = await supabase.from("advisor_links").update({ revoked: true }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Zugriff widerrufen.");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Eintrag wirklich löschen?")) return;
    await supabase.from("advisor_links").delete().eq("id", id);
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> Steuerberater-Zugang</h1>
          <p className="text-muted-foreground text-sm mt-1">Read-only Link für deinen Steuerberater · 90 Tage gültig · jederzeit widerrufbar</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground shadow-gold">
              <UserPlus className="h-4 w-4 mr-2" /> Steuerberater einladen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Neuen Lese-Zugang erstellen</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.advisor_name} onChange={(e) => setForm({ ...form, advisor_name: e.target.value })} placeholder="z. B. StB Müller" /></div>
              <div><Label>E-Mail (optional)</Label><Input type="email" value={form.advisor_email} onChange={(e) => setForm({ ...form, advisor_email: e.target.value })} placeholder="kanzlei@example.de" /></div>
              <p className="text-xs text-muted-foreground">Es wird ein eindeutiger Link erzeugt. Du teilst diesen Link manuell (E-Mail/WhatsApp). Der Steuerberater braucht keinen Account.</p>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gradient-gold text-primary-foreground shadow-gold">Link erstellen</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="p-5 glass bg-gradient-to-br from-primary/5 to-transparent">
        <h2 className="font-bold mb-2 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> So funktioniert's</h2>
        <ul className="text-sm text-muted-foreground space-y-1 leading-relaxed">
          <li>• Du erstellst einen Link für deinen Steuerberater (z. B. deine Partnerin 😉)</li>
          <li>• Dein Steuerberater öffnet den Link — <strong>kein Account, kein Login</strong> nötig</li>
          <li>• Er sieht alle Objekte, Mieter, Zahlungen, Belege, Steuer-Brücke <strong>nur lesend</strong></li>
          <li>• Link läuft nach <strong>90 Tagen automatisch ab</strong>. Du kannst ihn jederzeit widerrufen.</li>
          <li>• Jeder Zugriff wird protokolliert (Anzahl Aufrufe, letzter Zugriff)</li>
        </ul>
      </Card>

      {items.length === 0 ? (
        <Card className="p-10 text-center glass">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Noch keine Steuerberater eingeladen.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const expired = new Date(it.expires_at) < new Date();
            const status = it.revoked ? "revoked" : expired ? "expired" : "active";
            return (
              <Card key={it.id} className="p-5 glass">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{it.advisor_name}</h3>
                      {status === "active" && <Badge className="bg-success/15 text-success border-success/30">Aktiv</Badge>}
                      {status === "revoked" && <Badge variant="destructive">Widerrufen</Badge>}
                      {status === "expired" && <Badge variant="secondary">Abgelaufen</Badge>}
                    </div>
                    {it.advisor_email && <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" />{it.advisor_email}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Läuft ab: {date(it.expires_at)}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{it.access_count} Zugriffe</span>
                      {it.last_accessed_at && <span>Zuletzt: {date(it.last_accessed_at)}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {status === "active" && (
                      <Button size="sm" variant="outline" onClick={() => copyLink(it.token)}>
                        <Copy className="h-3.5 w-3.5 mr-1.5" /> Link
                      </Button>
                    )}
                    {!it.revoked && (
                      <Button size="sm" variant="outline" onClick={() => revoke(it.id)}>
                        Widerrufen
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(it.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {status === "active" && (
                  <div className="mt-3 p-2.5 bg-muted/40 rounded-lg flex items-center gap-2 text-xs font-mono break-all">
                    <LinkIcon className="h-3 w-3 flex-shrink-0 text-primary" />
                    <span className="truncate">{linkFor(it.token)}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Advisor;
