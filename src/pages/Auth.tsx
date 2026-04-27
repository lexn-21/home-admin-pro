import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { z } from "zod";

const emailSchema = z.string().trim().email("Ungültige E-Mail").max(255);
const passSchema = z.string().min(8, "Mindestens 8 Zeichen").max(72);
const nameSchema = z.string().trim().min(1, "Name fehlt").max(80);

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    document.title = "Anmelden · ImmoNIQ";
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/app", { replace: true });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const ev = emailSchema.safeParse(email);
    const pv = passSchema.safeParse(password);
    if (!ev.success) return toast.error(ev.error.issues[0].message);
    if (!pv.success) return toast.error(pv.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: ev.data, password: pv.data });
    setLoading(false);
    if (error) return toast.error(error.message === "Invalid login credentials" ? "E-Mail oder Passwort falsch." : error.message);
    toast.success("Willkommen zurück.");
    navigate("/app", { replace: true });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const nv = nameSchema.safeParse(name);
    const ev = emailSchema.safeParse(email);
    const pv = passSchema.safeParse(password);
    if (!nv.success) return toast.error(nv.error.issues[0].message);
    if (!ev.success) return toast.error(ev.error.issues[0].message);
    if (!pv.success) return toast.error(pv.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: ev.data,
      password: pv.data,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: { display_name: nv.data },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("already")) return toast.error("Diese E-Mail ist bereits registriert.");
      if (error.message.toLowerCase().includes("pwned") || error.message.toLowerCase().includes("compromised"))
        return toast.error("Dieses Passwort wurde in Datenlecks gefunden. Bitte ein neues wählen.");
      return toast.error(error.message);
    }
    toast.success("Konto erstellt. Willkommen bei ImmoNIQ.");
    navigate("/app", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative container py-8">
        <Link to="/"><Logo /></Link>
      </div>
      <div className="relative container flex items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md p-8 glass shadow-glass">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Willkommen</h1>
            <p className="text-sm text-muted-foreground mt-1">Dein Vermieter-Cockpit wartet.</p>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <Label htmlFor="si-email">E-Mail</Label>
                  <Input id="si-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="si-pw">Passwort</Label>
                  <Input id="si-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
                  {loading ? "Anmelden…" : "Anmelden"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <Label htmlFor="su-name">Anzeigename</Label>
                  <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Leon Boomgaarden" required />
                </div>
                <div>
                  <Label htmlFor="su-email">E-Mail</Label>
                  <Input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="su-pw">Passwort</Label>
                  <Input id="su-pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <p className="text-[11px] text-muted-foreground mt-1">Mind. 8 Zeichen. Wird gegen Datenlecks geprüft.</p>
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
                  {loading ? "Erstellen…" : "Konto erstellen"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          <p className="text-[11px] text-center text-muted-foreground mt-6">
            Mit der Registrierung akzeptierst du die Nutzungsbedingungen. DSGVO-konform, Server in der EU.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
