import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eur, pct } from "@/lib/format";
import { ArrowUpRight, Building2, Wallet, Receipt, TrendingUp, Plus } from "lucide-react";

const KPI = ({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon: React.ElementType }) => (
  <Card className="p-6 glass">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </div>
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => { document.title = "Übersicht · ImmoNIQ"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, u, t, pay, ex, prof] = await Promise.all([
        supabase.from("properties").select("*"),
        supabase.from("units").select("*"),
        supabase.from("tenants").select("*"),
        supabase.from("payments").select("*").order("paid_on", { ascending: false }).limit(50),
        supabase.from("expenses").select("*").order("spent_on", { ascending: false }).limit(50),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
      ]);
      setProperties(p.data ?? []);
      setUnits(u.data ?? []);
      setTenants(t.data ?? []);
      setPayments(pay.data ?? []);
      setExpenses(ex.data ?? []);
      setName(prof.data?.display_name ?? "");
    })();
  }, [user]);

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10);
  const ytdIncome = payments.filter(p => p.paid_on >= yearStart).reduce((s, p) => s + Number(p.amount), 0);
  const ytdExpense = expenses.filter(e => e.spent_on >= yearStart).reduce((s, e) => s + Number(e.amount), 0);
  const cashflow = ytdIncome - ytdExpense;
  const occupied = tenants.filter(t => !t.lease_end || new Date(t.lease_end) >= new Date()).length;
  const occRate = units.length ? (occupied / units.length) * 100 : 0;
  const monthlyTarget = units.reduce((s, u) => s + Number(u.rent_cold ?? 0) + Number(u.utilities ?? 0), 0);

  const isEmpty = properties.length === 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Hallo {name || "👋"}</p>
          <h1 className="text-3xl font-bold tracking-tight">Deine Übersicht</h1>
        </div>
        <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
          <Link to="/app/properties"><Plus className="h-4 w-4 mr-2" /> Objekt hinzufügen</Link>
        </Button>
      </header>

      {isEmpty ? (
        <Card className="p-12 text-center glass">
          <div className="h-16 w-16 rounded-2xl bg-gradient-gold mx-auto mb-4 flex items-center justify-center shadow-gold">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Willkommen bei ImmoNIQ</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Lege dein erstes Objekt an. Danach legst du Wohneinheiten und Mieter an —
            und siehst Cashflow & Vermietungsquote in Echtzeit.
          </p>
          <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
            <Link to="/app/properties">Erstes Objekt anlegen</Link>
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI label="Mieteinnahmen YTD" value={eur(ytdIncome)} hint={`${payments.filter(p => p.paid_on >= yearStart).length} Buchungen`} icon={Wallet} />
            <KPI label="Ausgaben YTD" value={eur(ytdExpense)} hint={`${expenses.filter(e => e.spent_on >= yearStart).length} Belege`} icon={Receipt} />
            <KPI label="Cashflow YTD" value={eur(cashflow)} hint={cashflow >= 0 ? "Positiv" : "Negativ"} icon={TrendingUp} />
            <KPI label="Vermietungsquote" value={pct(occRate, 0)} hint={`${occupied} / ${units.length} Einheiten`} icon={Building2} />
          </div>

          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-lg">Sollmiete pro Monat</h2>
                <p className="text-xs text-muted-foreground">Summe Kaltmiete + Nebenkosten aller Einheiten</p>
              </div>
              <p className="text-2xl font-bold text-gradient-gold">{eur(monthlyTarget)}</p>
            </div>
          </Card>

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Letzte Zahlungen</h2>
                <Link to="/app/payments" className="text-xs text-primary inline-flex items-center gap-1">Alle <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Noch keine Zahlungen erfasst.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {payments.slice(0, 5).map(p => (
                    <li key={p.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{new Date(p.paid_on).toLocaleDateString("de-DE")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.kind.replace("_", " ")}</p>
                      </div>
                      <p className="font-semibold text-success">+{eur(p.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Letzte Belege</h2>
                <Link to="/app/expenses" className="text-xs text-primary inline-flex items-center gap-1">Alle <ArrowUpRight className="h-3 w-3" /></Link>
              </div>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Noch keine Belege erfasst.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {expenses.slice(0, 5).map(e => (
                    <li key={e.id} className="py-2.5 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium truncate">{e.vendor || e.description || "Beleg"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.spent_on).toLocaleDateString("de-DE")}</p>
                      </div>
                      <p className="font-semibold">−{eur(e.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
