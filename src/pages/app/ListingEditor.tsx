import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, ImagePlus, Sparkles, Scale, X, Wand2, Loader2 } from "lucide-react";

const ListingEditor = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [search] = useSearchParams();
  const presetProperty = search.get("property") ?? "";
  const editing = id && id !== "new";

  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>({
    kind: "rent", title: "", description: "",
    property_id: "", unit_id: "",
    price: "", deposit: "", utilities: "",
    available_from: "", min_term_months: "",
    living_space: "", rooms: "",
    zip: "", city: "", street_public: "",
    energy_class: "", energy_value: "",
    features: { balkon: false, ebk: false, garten: false, garage: false, keller: false, aufzug: false, haustiere_ok: false, moebliert: false },
  });

  useEffect(() => {
    document.title = editing ? "Inserat bearbeiten · ImmonIQ" : "Neues Inserat · ImmonIQ";
    (async () => {
      const [p, u] = await Promise.all([
        supabase.from("properties").select("*").order("name"),
        supabase.from("units").select("*").order("label"),
      ]);
      setProperties(p.data ?? []);
      setUnits(u.data ?? []);
      if (editing) {
        const { data } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();
        if (data) {
          setForm({
            ...form, ...data,
            property_id: data.property_id ?? "",
            unit_id: data.unit_id ?? "",
            available_from: data.available_from ?? "",
            description: data.description ?? "",
            features: data.features ?? form.features,
          });
          setPhotos(data.photos ?? []);
        }
      } else if (presetProperty) {
        const prop = (p.data ?? []).find((x: any) => x.id === presetProperty);
        if (prop) {
          setForm((f: any) => ({
            ...f,
            property_id: prop.id,
            living_space: prop.area_sqm ?? f.living_space,
            rooms: prop.rooms ?? f.rooms,
            price: f.price || prop.cold_rent || "",
            utilities: f.utilities || prop.utilities || "",
            deposit: f.deposit || prop.deposit || "",
            zip: f.zip || prop.zip || "",
            city: f.city || prop.city || "",
            street_public: f.street_public || prop.street || "",
            title: f.title || `${prop.rooms ? prop.rooms + "-Zi-" : ""}Wohnung in ${prop.city ?? ""}`.trim(),
          }));
        }
      }
    })();
  }, [id]);

  const filteredUnits = form.property_id ? units.filter((u) => u.property_id === form.property_id) : units;

  const prefillFromUnit = (unitId: string) => {
    const u = units.find((x) => x.id === unitId);
    if (!u) return;
    const p = properties.find((x) => x.id === u.property_id);
    setForm((f: any) => ({
      ...f,
      unit_id: unitId,
      property_id: u.property_id,
      living_space: u.living_space ?? f.living_space,
      rooms: u.rooms ?? f.rooms,
      price: f.price || u.rent_cold,
      utilities: f.utilities || u.utilities,
      zip: f.zip || p?.zip || "",
      city: f.city || p?.city || "",
      street_public: f.street_public || p?.street || "",
      title: f.title || (p ? `${u.rooms ?? ""}-Zi-Wohnung in ${p.city ?? ""}`.trim() : f.title),
    }));
  };

  const suggestPrice = async () => {
    if (!form.zip || !form.living_space) return toast.error("PLZ und Wohnfläche nötig.");
    const annual = (Number(form.price) || 0) * 12;
    const { data, error } = await supabase.rpc("avm_estimate", {
      _zip: form.zip, _living_space: Number(form.living_space), _annual_rent: annual || 0,
    });
    if (error) return toast.error(error.message);
    const d = data as any;
    if (form.kind === "rent" && d?.avg_rent_sqm) {
      const sug = Math.round(Number(form.living_space) * Number(d.avg_rent_sqm));
      setForm((f: any) => ({ ...f, price: sug }));
      toast.success(`Marktmiete-Vorschlag: ${sug} €`);
    } else if (d?.value_blended) {
      setForm((f: any) => ({ ...f, price: Math.round(Number(d.value_blended)) }));
      toast.success("Marktwert-Vorschlag übernommen");
    }
  };

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUploading(true);
    const next = [...photos];
    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name}: max 5 MB`); continue; }
      const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("listing-photos").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); continue; }
      next.push(path);
    }
    setPhotos(next);
    setUploading(false);
  };

  const [aiLoading, setAiLoading] = useState(false);
  const aiGenerate = async () => {
    if (photos.length === 0) return toast.error("Mindestens 1 Foto hochladen.");
    setAiLoading(true);
    try {
      const urls = photos.map((p) => supabase.storage.from("listing-photos").getPublicUrl(p).data.publicUrl);
      const { data, error } = await supabase.functions.invoke("ai-listing-from-photos", {
        body: {
          photo_urls: urls,
          context: {
            rooms: form.rooms, living_space: form.living_space,
            city: form.city, build_year: properties.find((p) => p.id === form.property_id)?.build_year,
            cold_rent: form.price,
          },
        },
      });
      if (error) throw error;
      setForm((f: any) => ({
        ...f,
        title: data.title || f.title,
        description: data.description || f.description,
        price: f.price || data.suggested_rent_cold || f.price,
        features: { ...f.features, ...(data.detected_features ?? {}) },
      }));
      toast.success("✨ KI-Vorschlag übernommen", { description: data.highlights?.join(" · ") });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const photoUrl = (p: string) => supabase.storage.from("listing-photos").getPublicUrl(p).data.publicUrl;

  const save = async (publish = false) => {
    if (!form.title) return toast.error("Titel fehlt.");
    if (!form.price) return toast.error("Preis fehlt.");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload: any = {
      user_id: user.id,
      kind: form.kind,
      property_id: form.property_id || null,
      unit_id: form.unit_id || null,
      title: form.title,
      description: form.description || null,
      photos,
      price: Number(form.price),
      deposit: form.deposit ? Number(form.deposit) : null,
      utilities: form.utilities ? Number(form.utilities) : null,
      available_from: form.available_from || null,
      min_term_months: form.min_term_months ? Number(form.min_term_months) : null,
      living_space: form.living_space ? Number(form.living_space) : null,
      rooms: form.rooms ? Number(form.rooms) : null,
      zip: form.zip || null,
      city: form.city || null,
      street_public: form.street_public || null,
      energy_class: form.energy_class || null,
      energy_value: form.energy_value ? Number(form.energy_value) : null,
      features: form.features,
      status: publish ? "published" : (editing ? form.status : "draft"),
      published_at: publish ? new Date().toISOString() : (form.published_at ?? null),
    };

    if (publish && !form.energy_class) {
      if (!confirm("Hinweis: Nach GEG ist der Energieausweis bei Vermietung Pflicht. Trotzdem veröffentlichen?")) return;
    }

    const q = editing
      ? supabase.from("listings").update(payload).eq("id", id!)
      : supabase.from("listings").insert(payload);
    const { error } = await q;
    if (error) return toast.error(error.message);
    toast.success(publish ? "🚀 Live geschaltet!" : "Gespeichert");
    nav("/app/listings");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => nav("/app/listings")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Inserate
      </button>

      <header>
        <h1 className="text-3xl font-bold">{editing ? "Inserat bearbeiten" : "Neues Inserat"}</h1>
        <p className="text-muted-foreground text-sm mt-1">Aus deinen Daten in 60 Sek. live — keine 30-Min-Formulare.</p>
      </header>

      <Card className="p-6 glass space-y-4">
        <h2 className="font-bold">Aus bestehenden Daten</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Objekt</Label>
            <Select value={form.property_id || "_"} onValueChange={(v) => setForm({ ...form, property_id: v === "_" ? "" : v, unit_id: "" })}>
              <SelectTrigger><SelectValue placeholder="— wählen —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">— ohne —</SelectItem>
                {properties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Einheit</Label>
            <Select value={form.unit_id || "_"} onValueChange={(v) => v !== "_" && prefillFromUnit(v)}>
              <SelectTrigger><SelectValue placeholder="— wählen —" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_">— ohne —</SelectItem>
                {filteredUnits.map((u) => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">Auswahl füllt Daten automatisch vor.</p>
      </Card>

      <Card className="p-6 glass space-y-4">
        <h2 className="font-bold">Eckdaten</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Art</Label>
            <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rent">Vermieten</SelectItem>
                <SelectItem value="sale">Verkaufen</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{form.kind === "rent" ? "Kaltmiete (€/Mo)" : "Kaufpreis (€)"}</Label>
            <div className="flex gap-2">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <Button type="button" variant="outline" size="icon" title="Marktwert vorschlagen" onClick={suggestPrice}>
                <Sparkles className="h-4 w-4 text-primary" />
              </Button>
            </div>
          </div>
          {form.kind === "rent" && <>
            <div><Label>Nebenkosten (€)</Label>
              <Input type="number" value={form.utilities} onChange={(e) => setForm({ ...form, utilities: e.target.value })} /></div>
            <div><Label>Kaution (€)</Label>
              <Input type="number" value={form.deposit} onChange={(e) => setForm({ ...form, deposit: e.target.value })} /></div>
            <div><Label>Mindestlaufzeit (Monate)</Label>
              <Input type="number" value={form.min_term_months} onChange={(e) => setForm({ ...form, min_term_months: e.target.value })} /></div>
          </>}
          <div><Label>Wohnfläche (m²)</Label>
            <Input type="number" value={form.living_space} onChange={(e) => setForm({ ...form, living_space: e.target.value })} /></div>
          <div><Label>Zimmer</Label>
            <Input type="number" step="0.5" value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} /></div>
          <div><Label>Verfügbar ab</Label>
            <Input type="date" value={form.available_from} onChange={(e) => setForm({ ...form, available_from: e.target.value })} /></div>
        </div>
      </Card>

      <Card className="p-6 glass space-y-4">
        <h2 className="font-bold">Adresse (öffentlich)</h2>
        <div className="grid grid-cols-3 gap-3">
          <div><Label>PLZ</Label><Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} /></div>
          <div className="col-span-2"><Label>Ort</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
          <div className="col-span-3"><Label>Straße (optional)</Label>
            <Input value={form.street_public} onChange={(e) => setForm({ ...form, street_public: e.target.value })} placeholder="z. B. Hauptstraße (ohne Hausnr. möglich)" /></div>
        </div>
      </Card>

      <Card className="p-6 glass space-y-4">
        <h2 className="font-bold">Beschreibung</h2>
        <Input placeholder="Titel — z. B. „Helle 3-Zi-Whg mit Balkon, Au-Haidhausen"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Textarea rows={6} placeholder="Beschreibung für Interessenten…"
          value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div>
          <Label className="mb-2 block">Ausstattung</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(form.features).map((k) => {
              const on = form.features[k];
              return (
                <button key={k} type="button"
                  onClick={() => setForm({ ...form, features: { ...form.features, [k]: !on } })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${on ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {k.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-6 glass space-y-4">
        <h2 className="font-bold">Energieausweis (GEG-Pflicht)</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Energieklasse (A+ bis H)</Label>
            <Input value={form.energy_class} onChange={(e) => setForm({ ...form, energy_class: e.target.value.toUpperCase().slice(0, 2) })} placeholder="z. B. C" /></div>
          <div><Label>Endenergiebedarf (kWh/m²·a)</Label>
            <Input type="number" value={form.energy_value} onChange={(e) => setForm({ ...form, energy_value: e.target.value })} /></div>
        </div>
        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Scale className="h-3 w-3" />
          Pflichtangabe nach <a className="underline" href="https://www.gesetze-im-internet.de/geg/" target="_blank" rel="noreferrer">GEG § 87</a>.
        </p>
      </Card>

      <Card className="p-6 glass space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-bold">Fotos</h2>
          <Button type="button" size="sm" variant="outline" onClick={aiGenerate}
            disabled={aiLoading || photos.length === 0}
            className="border-primary/40 text-primary hover:bg-primary/5">
            {aiLoading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 mr-1.5" />}
            KI: Beschreibung & Miete vorschlagen
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground -mt-1">KI-generiert — bitte vor Veröffentlichung prüfen. Keine Mietpreisberatung.</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div key={p} className="relative aspect-video rounded-lg overflow-hidden bg-muted group">
              <img src={photoUrl(p)} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setPhotos(photos.filter((x) => x !== p))}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition">
            <ImagePlus className="h-5 w-5" />
            <span>{uploading ? "Lädt…" : "Foto"}</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => upload(e.target.files)} />
          </label>
        </div>
      </Card>

      <Card className="p-4 glass border-primary/40">
        <p className="text-xs text-muted-foreground">
          <Badge variant="outline" className="mr-2">Hinweis</Badge>
          Bei Wohnraumvermietung gilt das <a className="underline" href="https://www.gesetze-im-internet.de/wovermrg/" target="_blank" rel="noreferrer">Bestellerprinzip (§ 2 WoVermRG)</a> — keine Maklercourtage vom Mieter, wenn er den Auftrag nicht erteilt hat.
        </p>
      </Card>

      <div className="flex gap-3 justify-end sticky bottom-4">
        <Button variant="outline" onClick={() => save(false)}>Als Entwurf speichern</Button>
        <Button onClick={() => save(true)} className="bg-gradient-gold text-primary-foreground shadow-gold">
          🚀 Veröffentlichen
        </Button>
      </div>
    </div>
  );
};

export default ListingEditor;
