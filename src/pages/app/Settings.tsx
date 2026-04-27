import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield, User as UserIcon } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { document.title = "Einstellungen · ImmoNIQ"; }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setName(data?.display_name ?? ""));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("user_id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Profil gespeichert.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground text-sm mt-1">Profil und Sicherheit.</p>
      </header>

      <Card className="p-6 glass">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon className="h-5 w-5 text-primary" />
          <h2 className="font-bold">Profil</h2>
        </div>
        <div className="space-y-3">
          <div><Label>E-Mail</Label><Input value={user?.email ?? ""} disabled /></div>
          <div><Label>Anzeigename</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        </div>
        <Button onClick={save} disabled={loading} className="mt-5 bg-gradient-gold text-primary-foreground shadow-gold">
          {loading ? "Speichern…" : "Speichern"}
        </Button>
      </Card>

      <Card className="p-6 glass">
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-bold">Sicherheit & Datenschutz</h2>
        </div>
        <ul className="text-sm text-muted-foreground space-y-2">
          <li>✓ Server in der EU (Frankfurt / Irland)</li>
          <li>✓ DSGVO-konform — Auftragsverarbeitungsvertrag auf Anfrage</li>
          <li>✓ Passwörter werden gegen die Have-I-Been-Pwned-Datenbank geprüft</li>
          <li>✓ Belege liegen in einem privaten Bucket — nur du hast Zugriff</li>
          <li>✓ Aufbewahrungsfristen nach § 147 AO werden überwacht</li>
        </ul>
      </Card>
    </div>
  );
};

export default Settings;
