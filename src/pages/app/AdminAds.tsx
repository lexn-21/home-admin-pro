import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type AdSlot = {
  id: string;
  title: string;
  subtitle: string | null;
  sponsor_name: string | null;
  click_url: string;
  cta_label: string | null;
  placement: string;
  advertiser_user_id: string | null;
  moderation_status: string;
  rejection_reason: string | null;
  created_at: string;
};

export default function AdminAds() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pending, setPending] = useState<AdSlot[]>([]);
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("app_admins").select("user_id").eq("user_id", user.id).maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [user]);

  const load = async () => {
    const { data } = await supabase
      .from("ad_slots")
      .select("*")
      .eq("moderation_status", "pending")
      .order("created_at", { ascending: false });
    setPending((data as AdSlot[]) ?? []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const decide = async (id: string, status: "approved" | "rejected") => {
    const update: any = { moderation_status: status, updated_at: new Date().toISOString() };
    if (status === "rejected") update.rejection_reason = reasons[id] || "Inhalt entspricht nicht den Richtlinien";
    const { error } = await supabase.from("ad_slots").update(update).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(status === "approved" ? "Freigegeben" : "Abgelehnt");
    load();
  };

  if (isAdmin === null) return <p className="text-muted-foreground">Lädt...</p>;
  if (!isAdmin) return (
    <Card className="p-8 text-center">
      <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
      <p className="font-medium">Keine Admin-Rechte</p>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-primary" /> Werbe-Moderation
        </h1>
        <p className="text-muted-foreground mt-1">{pending.length} Werbeplätze warten auf Prüfung</p>
      </div>

      {pending.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">Keine offenen Anfragen</Card>
      ) : (
        <div className="space-y-3">
          {pending.map(slot => (
            <Card key={slot.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{slot.title}</p>
                  {slot.subtitle && <p className="text-sm text-muted-foreground">{slot.subtitle}</p>}
                  {slot.sponsor_name && <p className="text-xs text-muted-foreground mt-1">Anbieter: {slot.sponsor_name}</p>}
                  <a href={slot.click_url} target="_blank" rel="noreferrer" className="text-xs text-primary inline-flex items-center gap-1 mt-1">
                    {slot.click_url} <ExternalLink className="h-3 w-3" />
                  </a>
                  <div className="mt-2"><Badge variant="outline">{slot.placement}</Badge></div>
                </div>
              </div>
              <Textarea
                placeholder="Ablehnungsgrund (optional)"
                value={reasons[slot.id] || ""}
                onChange={e => setReasons({ ...reasons, [slot.id]: e.target.value })}
                rows={2}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => decide(slot.id, "approved")}>Freigeben</Button>
                <Button size="sm" variant="destructive" onClick={() => decide(slot.id, "rejected")}>Ablehnen</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
