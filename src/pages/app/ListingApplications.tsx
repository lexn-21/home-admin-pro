import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eur } from "@/lib/format";
import { toast } from "sonner";
import { ArrowLeft, Star, X, Check, MessageSquare, ShieldCheck } from "lucide-react";
import ChatDialog from "@/components/market/ChatDialog";

const labelStatus: Record<string, string> = {
  sent: "Neu", shortlisted: "Favorit", rejected: "Abgelehnt", accepted: "Angenommen", withdrawn: "Zurückgezogen",
};

const ListingApplications = () => {
  const { id } = useParams();
  const nav = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [apps, setApps] = useState<any[]>([]);
  const [chatApp, setChatApp] = useState<any>(null);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    const [l, a] = await Promise.all([
      supabase.from("listings").select("*").eq("id", id).maybeSingle(),
      supabase.from("applications").select("*").eq("listing_id", id).order("created_at", { ascending: false }),
    ]);
    setListing(l.data);
    setApps(a.data ?? []);
    if (l.data) document.title = `Bewerbungen · ${l.data.title}`;
  };

  const setStatus = async (appId: string, status: "sent" | "shortlisted" | "rejected" | "accepted" | "withdrawn") => {
    const { error } = await supabase.from("applications").update({ status }).eq("id", appId);
    if (error) return toast.error(error.message);

    if (status === "accepted") {
      const app = apps.find((x) => x.id === appId);
      if (app && listing?.unit_id) {
        const sp = app.snapshot_profile ?? {};
        await supabase.from("tenants").insert({
          user_id: app.owner_user_id,
          unit_id: listing.unit_id,
          full_name: sp.full_name ?? "Neuer Mieter",
          email: sp.email ?? null,
          phone: sp.phone ?? null,
          deposit: listing.deposit ?? null,
          lease_start: listing.available_from ?? new Date().toISOString().slice(0, 10),
        });
        await supabase.from("listings").update({ status: "closed" }).eq("id", listing.id);
        toast.success("Mieter angelegt & Inserat geschlossen.");
      } else {
        toast.success("Angenommen.");
      }
    } else {
      toast.success("Status aktualisiert.");
    }
    load();
  };

  if (!listing) return <div className="text-muted-foreground">Lade…</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => nav("/app/listings")} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Inserate
      </button>
      <header>
        <h1 className="text-3xl font-bold">{listing.title}</h1>
        <p className="text-muted-foreground text-sm mt-1">{apps.length} Bewerbungen</p>
      </header>

      {apps.length === 0 ? (
        <Card className="p-10 glass text-center text-muted-foreground">Noch keine Bewerbungen.</Card>
      ) : (
        <div className="space-y-3">
          {apps.map((a) => {
            const sp = a.snapshot_profile ?? {};
            const matchOk = listing.kind === "rent" && sp.net_income_monthly && sp.net_income_monthly >= 3 * Number(listing.price);
            return (
              <Card key={a.id} className="p-5 glass">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={a.status === "accepted" ? "default" : a.status === "rejected" ? "destructive" : "secondary"}>
                        {labelStatus[a.status]}
                      </Badge>
                      {sp.schufa_status === "self_declared" && <Badge variant="outline" className="text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" />SCHUFA Eigenauskunft</Badge>}
                      {sp.schufa_status === "document_uploaded" && <Badge variant="outline" className="text-[10px]"><ShieldCheck className="h-3 w-3 mr-1" />SCHUFA verfügbar</Badge>}
                      {matchOk && <Badge variant="outline" className="text-[10px] border-primary text-primary">3× Miete ✓</Badge>}
                    </div>
                    <h3 className="font-bold">{sp.full_name ?? "Bewerber"}</h3>
                    <div className="text-xs text-muted-foreground mt-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
                      <span>Einkommen: <strong>{sp.net_income_monthly ? eur(sp.net_income_monthly) : "—"}</strong></span>
                      <span>Haushalt: <strong>{sp.household_size ?? "—"}</strong></span>
                      <span>Job: <strong>{sp.employment_type ?? "—"}</strong></span>
                      <span>Einzug: <strong>{sp.move_in_from ? new Date(sp.move_in_from).toLocaleDateString("de-DE") : "flex."}</strong></span>
                    </div>
                    {a.cover_message && <p className="text-sm mt-3 p-3 bg-muted/40 rounded-lg italic">„{a.cover_message}"</p>}
                    {sp.about_me && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{sp.about_me}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5 sm:w-40">
                    <Button size="sm" variant="outline" onClick={() => setChatApp(a)}>
                      <MessageSquare className="h-3 w-3 mr-1" /> Chat
                    </Button>
                    {a.status !== "shortlisted" && <Button size="sm" variant="outline" onClick={() => setStatus(a.id, "shortlisted")}>
                      <Star className="h-3 w-3 mr-1" /> Favorit
                    </Button>}
                    {a.status !== "accepted" && <Button size="sm" onClick={() => setStatus(a.id, "accepted")} className="bg-gradient-gold text-primary-foreground shadow-gold">
                      <Check className="h-3 w-3 mr-1" /> Annehmen
                    </Button>}
                    {a.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "rejected")} className="text-destructive">
                      <X className="h-3 w-3 mr-1" /> Ablehnen
                    </Button>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {chatApp && <ChatDialog app={chatApp} onClose={() => setChatApp(null)} />}
    </div>
  );
};

export default ListingApplications;
