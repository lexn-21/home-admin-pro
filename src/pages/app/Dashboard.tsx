import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { eur, pct, num } from "@/lib/format";
import { Stagger, Item, Tappable } from "@/components/motion/Primitives";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Building2, Wallet, Receipt, TrendingUp, Plus,
  Lock, Wrench, CalendarClock, Scale, ShieldCheck, Sparkles,
  BarChart3, Briefcase, Megaphone,
} from "lucide-react";

const KPI = ({ label, value, hint, trend, icon: Icon, tone = "default" }: {
  label: string; value: string; hint?: string; trend?: "up" | "down" | null;
  icon: React.ElementType; tone?: "default" | "success" | "warning";
}) => (
  <Item variant="scale">
    <Card className="p-5 glass hover:shadow-elevated transition-shadow h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl lg:text-3xl font-bold mt-1.5 tracking-tight tabular truncate">{value}</p>
          {hint && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${
              tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-muted-foreground"
            }`}>
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {hint}
            </p>
          )}
        </div>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          tone === "success" ? "bg-success/10" : tone === "warning" ? "bg-warning/10" : "bg-primary/10"
        }`}>
          <Icon className={`h-[18px] w-[18px] ${
            tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-primary"
          }`} />
        </div>
      </div>
    </Card>
  </Item>
);

const QuickAction = ({ to, icon: Icon, label, desc, badge }: {
  to: string; icon: React.ElementType; label: string; desc: string; badge?: string;
}) => (
  <Item>
    <Tappable>
      <Link to={to}>
        <Card className="p-5 glass h-full group cursor-pointer interactive-card">
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-gold-soft border border-primary/15 flex items-center justify-center">
              <Icon className="h-[18px] w-[18px] text-primary" />
            </div>
            {badge && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary tracking-wider uppercase">
                {badge}
              </span>
            )}
          </div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-3 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Card>
      </Link>
    </Tappable>
  </Item>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [appsIn, setAppsIn] = useState<number>(0);
  const [appsOut, setAppsOut] = useState<number>(0);

  useEffect(() => { document.title = "Übersicht · ImmoNIQ"; }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [p, u, t, pay, ex, prof, li, ai, ao] = await Promise.all([
        supabase.from("properties").select("*"),
        supabase.from("units").select("*"),
        supabase.from("tenants").select("*"),
        supabase.from("payments").select("*").order("paid_on", { ascending: false }).limit(50),
        supabase.from("expenses").select("*").order("spent_on", { ascending: false }).limit(50),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
        supabase.from("listings").select("id,status,views_count,applications_count").eq("user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("owner_user_id", user.id),
        supabase.from("applications").select("id", { count: "exact", head: true }).eq("seeker_user_id", user.id),
      ]);
      setProperties(p.data ?? []);
      setUnits(u.data ?? []);
      setTenants(t.data ?? []);
      setPayments(pay.data ?? []);
      setExpenses(ex.data ?? []);
      setName(prof.data?.display_name ?? "");
      setListings(li.data ?? []);
      setAppsIn(ai.count ?? 0);
      setAppsOut(ao.count ?? 0);
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
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return "Guten Morgen";
    if (h < 18) return "Hallo";
    return "Guten Abend";
  })();

  return (
    <Stagger className="space-y-8">
      <Item>
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">
              {greeting}{name ? `, ${name.split(" ")[0]}` : ""} 👋
            </p>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mt-1">
              Deine <span className="text-gradient-gold">Übersicht</span>
            </h1>
          </div>
          <Button asChild className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-10">
            <Link to="/app/properties"><Plus className="h-4 w-4 mr-2" /> Objekt hinzufügen</Link>
          </Button>
        </header>
      </Item>

      {isEmpty ? (
        <Item variant="scale">
          <Card className="p-8 lg:p-12 text-center glass relative overflow-hidden">
            <motion.div
              className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-gradient-gold mx-auto mb-5 flex items-center justify-center shadow-gold">
                <Building2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">Willkommen bei ImmoNIQ</h2>
              <p className="text-muted-foreground mb-7 max-w-md mx-auto leading-relaxed">
                Leg dein erstes Objekt an — danach Wohneinheiten und Mieter. Du siehst
                Cashflow & Vermietungsquote in Echtzeit.
              </p>
              <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 px-8">
                <Link to="/app/properties"><Sparkles className="h-4 w-4 mr-2" />Erstes Objekt anlegen</Link>
              </Button>
            </div>
          </Card>
        </Item>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <KPI
              label="Mieteinnahmen YTD"
              value={eur(ytdIncome)}
              hint={`${num(payments.filter(p => p.paid_on >= yearStart).length)} Buchungen`}
              trend="up" tone="success" icon={Wallet}
            />
            <KPI
              label="Ausgaben YTD"
              value={eur(ytdExpense)}
              hint={`${num(expenses.filter(e => e.spent_on >= yearStart).length)} Belege`}
              icon={Receipt}
            />
            <KPI
              label="Cashflow YTD"
              value={eur(cashflow)}
              hint={cashflow >= 0 ? "Positiv" : "Negativ"}
              tone={cashflow >= 0 ? "success" : "warning"}
              icon={TrendingUp}
            />
            <KPI
              label="Vermietungsquote"
              value={pct(occRate, 0)}
              hint={`${num(occupied)} / ${num(units.length)} Einheiten`}
              icon={Building2}
            />
          </div>

          <Item>
            <Card className="p-6 glass relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-gold-soft pointer-events-none" />
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-bold text-lg">Sollmiete pro Monat</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kaltmiete + Nebenkosten über alle {num(units.length)} Einheiten
                  </p>
                </div>
                <p className="text-3xl font-bold text-gradient-gold tabular">{eur(monthlyTarget)}</p>
              </div>
            </Card>
          </Item>
        </>
      )}

      {/* Markt-Stats Streifen */}
      {(listings.length > 0 || appsIn > 0 || appsOut > 0) && (
        <Item>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4 glass">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Aktive Inserate</p>
              <p className="text-2xl font-bold tabular mt-1">{listings.filter(l => l.status === "published").length}</p>
              <Link to="/app/listings" className="text-xs text-primary mt-1 inline-flex items-center gap-1">Verwalten →</Link>
            </Card>
            <Card className="p-4 glass">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Profil-Aufrufe</p>
              <p className="text-2xl font-bold tabular mt-1">{listings.reduce((s, l) => s + Number(l.views_count ?? 0), 0)}</p>
              <p className="text-xs text-muted-foreground mt-1">Letzte 30 Tage</p>
            </Card>
            <Card className="p-4 glass border-primary/30">
              <p className="text-[10px] uppercase tracking-wider text-primary font-bold">Bewerbungen offen</p>
              <p className="text-2xl font-bold tabular mt-1">{appsIn}</p>
              <Link to="/app/applications" className="text-xs text-primary mt-1 inline-flex items-center gap-1">Sichten →</Link>
            </Card>
            <Card className="p-4 glass">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Eigene Bewerbungen</p>
              <p className="text-2xl font-bold tabular mt-1">{appsOut}</p>
              <Link to="/app/applications" className="text-xs text-primary mt-1 inline-flex items-center gap-1">Status →</Link>
            </Card>
          </div>
        </Item>
      )}

      {/* Markt-CTA */}
      <Item variant="scale">
        <Tappable>
          <Link to="/app/listings/new">
            <Card className="p-6 glass relative overflow-hidden cursor-pointer border-primary/30">
              <motion.div
                className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 6, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold flex-shrink-0">
                  <Megaphone className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Neu · Markt</p>
                  <h2 className="text-xl lg:text-2xl font-bold">Leerstand? In 60 Sekunden veröffentlicht.</h2>
                  <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                    Direkt aus deinen Daten. Bewerbungen kommen strukturiert in deine Inbox — wie Indeed für Mieter.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              </div>
            </Card>
          </Link>
        </Tappable>
      </Item>

      {/* Tresor Hero — der Magnet */}
      <Item variant="scale">
        <Tappable>
          <Link to="/app/vault">
            <Card className="vault-surface text-white p-6 lg:p-8 relative overflow-hidden cursor-pointer">
              <motion.div
                className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none"
                animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="relative flex items-center gap-5">
                <motion.div
                  className="h-14 w-14 rounded-2xl bg-gradient-gold flex items-center justify-center shadow-gold flex-shrink-0 vault-lock"
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <Lock className="h-7 w-7 text-black" strokeWidth={2.5} />
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Zero-Knowledge · AES-256</p>
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-white">Dein Eigentum. Sicher verwahrt.</h2>
                  <p className="text-sm text-white/70 mt-1 hidden sm:block">
                    Kaufverträge, Mietverträge, Steuerbescheide — verschlüsselt auf deinem Gerät, in Sekunden findbar.
                  </p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-white/60 flex-shrink-0" />
              </div>
            </Card>
          </Link>
        </Tappable>
      </Item>

      {/* Schnellaktionen */}
      <div>
        <Item>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Werkzeuge</h2>
            <p className="text-xs text-muted-foreground">Alles, was du brauchst</p>
          </div>
        </Item>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction to="/app/listings" icon={Megaphone} badge="USP"
            label="Inserate"
            desc="Vermieten/verkaufen — direkt." />
          <QuickAction to="/app/valuation" icon={TrendingUp} badge="AVM"
            label="Live-Bewertung"
            desc="Was ist mein Objekt heute wert?" />
          <QuickAction to="/app/benchmark" icon={BarChart3}
            label="Marktindex"
            desc="Vergleich gegen anonyme Marktdaten." />
          <QuickAction to="/app/bookings" icon={Briefcase} badge="10 % Take"
            label="Handwerker buchen"
            desc="Festpreis-Angebote in 24 h." />
          <QuickAction to="/app/vault" icon={Lock}
            label="Dokumenten-Tresor"
            desc="Zero-Knowledge verschlüsselt." />
          <QuickAction to="/app/deadlines" icon={CalendarClock}
            label="Fristen"
            desc="NK-Abrechnung, § 147 AO." />
          <QuickAction to="/app/marketplace" icon={Wrench}
            label="Marktplatz"
            desc="Profis in deiner Region." />
          <QuickAction to="/app/law" icon={Scale}
            label="Rechts-Ecke"
            desc="BGB, EStG — original verlinkt." />
          <QuickAction to="/app/advisor" icon={ShieldCheck}
            label="Steuerberater-Link"
            desc="Sicherer Read-only-Zugang." />
        </div>
      </div>

      {!isEmpty && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Item>
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Letzte Zahlungen</h2>
                <Link to="/app/payments" className="text-xs text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Alle <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Noch keine Zahlungen erfasst.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {payments.slice(0, 5).map(p => (
                    <li key={p.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{new Date(p.paid_on).toLocaleDateString("de-DE")}</p>
                        <p className="text-xs text-muted-foreground capitalize">{p.kind.replace("_", " ")}</p>
                      </div>
                      <p className="font-semibold text-success tabular">+{eur(p.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Item>
          <Item>
            <Card className="p-6 glass">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">Letzte Belege</h2>
                <Link to="/app/expenses" className="text-xs text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Alle <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              {expenses.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Noch keine Belege erfasst.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {expenses.slice(0, 5).map(e => (
                    <li key={e.id} className="py-3 flex items-center justify-between text-sm">
                      <div className="min-w-0 pr-2">
                        <p className="font-medium truncate">{e.vendor || e.description || "Beleg"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(e.spent_on).toLocaleDateString("de-DE")}</p>
                      </div>
                      <p className="font-semibold tabular">−{eur(e.amount)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </Item>
        </div>
      )}

      {/* Trust bar */}
      <Item>
        <Card className="p-5 glass">
          <div className="flex items-center gap-3 flex-wrap">
            <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="text-xs text-muted-foreground flex-1 min-w-[200px]">
              Server in Frankfurt · DSGVO · AES-256-Verschlüsselung at-rest · Audit-Log aktiv
            </div>
            <Link to="/app/settings" className="text-xs text-primary font-medium">Sicherheits-Status →</Link>
          </div>
        </Card>
      </Item>
    </Stagger>
  );
};

export default Dashboard;
