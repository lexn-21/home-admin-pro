import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Building2, MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { eur } from "@/lib/format";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1, "Name fehlt").max(100),
  street: z.string().trim().max(120).optional().or(z.literal("")),
  zip: z.string().trim().max(10).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  build_year: z.number().int().min(1800).max(2100).optional(),
  purchase_price: z.number().min(0).max(99999999).optional(),
  purchase_date: z.string().optional().or(z.literal("")),
  afa_rate: z.number().min(0).max(20).optional(),
});

const Properties = () => {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", street: "", zip: "", city: "", build_year: "", purchase_price: "", purchase_date: "", afa_rate: "2" });

  useEffect(() => { document.title = "Objekte · ImmoNIQ"; load(); }, []);

  const load = async () => {
    const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };

  const submit = async () => {
    const parsed = schema.safeParse({
      name: form.name,
      street: form.street,
      zip: form.zip,
      city: form.city,
      build_year: form.build_year ? Number(form.build_year) : undefined,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : undefined,
      purchase_date: form.purchase_date,
      afa_rate: form.afa_rate ? Number(form.afa_rate) : undefined,
    });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Nicht angemeldet.");
    const payload: any = { ...parsed.data, user_id: user.id };
    if (!payload.purchase_date) delete payload.purchase_date;
    if (!payload.street) delete payload.street;
    if (!payload.zip) delete payload.zip;
    if (!payload.city) delete payload.city;

    const { error } = await supabase.from("properties").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Objekt angelegt.");
    setOpen(false);
    setForm({ name: "", street: "", zip: "", city: "", build_year: "", purchase_price: "", purchase_date: "", afa_rate: "2" });
    load();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Objekte</h1>
          <p className="text-muted-foreground text-sm mt-1">Deine Immobilien — Stammdaten und AfA.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"><Plus className="h-4 w-4 mr-2" /> Neues Objekt</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Neues Objekt anlegen</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="MFH Hauptstraße" /></div>
              <div className="col-span-2"><Label>Straße & Nr.</Label><Input value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} /></div>
              <div><Label>PLZ</Label><Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
              <div><Label>Ort</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>Baujahr</Label><Input type="number" value={form.build_year} onChange={(e) => setForm({ ...form, build_year: e.target.value })} /></div>
              <div><Label>Kaufpreis (€)</Label><Input type="number" step="0.01" value={form.purchase_price} onChange={(e) => setForm({ ...form, purchase_price: e.target.value })} /></div>
              <div><Label>Kaufdatum</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
              <div><Label>AfA-Satz % (§ 7 EStG)</Label><Input type="number" step="0.01" value={form.afa_rate} onChange={(e) => setForm({ ...form, afa_rate: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-gradient-gold text-primary-foreground shadow-gold">Anlegen</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {items.length === 0 ? (
        <Card className="p-12 text-center glass">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Noch keine Objekte. Lege dein erstes an.</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(p => (
            <Link to={`/app/properties/${p.id}`} key={p.id}>
              <Card className="p-6 glass hover:shadow-gold transition group">
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-gold">
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition" />
                </div>
                <h3 className="font-bold text-lg mb-1">{p.name}</h3>
                {(p.street || p.city) && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                    <MapPin className="h-3 w-3" /> {[p.street, [p.zip, p.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                  </p>
                )}
                <div className="flex justify-between text-xs pt-3 border-t border-border">
                  <span className="text-muted-foreground">Bj. {p.build_year ?? "—"}</span>
                  <span className="font-medium">{p.purchase_price ? eur(p.purchase_price) : "—"}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Properties;
