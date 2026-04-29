import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Building2, Users, Wallet, Receipt, Calculator,
  LogOut, Settings as SettingsIcon, AlertTriangle, ShieldCheck,
  Lock, Wrench, Bell, Search, CalendarClock, Scale,
  TrendingUp, BarChart3, Briefcase,
} from "lucide-react";

type NavItem = { to: string; label: string; icon: any; end?: boolean; badge?: string };
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: "Übersicht",
    items: [
      { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/app/deadlines", label: "Fristen", icon: CalendarClock, badge: "neu" },
    ],
  },
  {
    title: "Verwaltung",
    items: [
      { to: "/app/properties", label: "Objekte", icon: Building2 },
      { to: "/app/tenants", label: "Mieter", icon: Users },
      { to: "/app/payments", label: "Zahlungen", icon: Wallet },
      { to: "/app/dunning", label: "Mahnwesen", icon: AlertTriangle },
      { to: "/app/expenses", label: "Belege", icon: Receipt },
    ],
  },
  {
    title: "Wert & Markt",
    items: [
      { to: "/app/valuation", label: "Bewertung", icon: TrendingUp, badge: "AVM" },
      { to: "/app/benchmark", label: "Marktindex", icon: BarChart3 },
    ],
  },
  {
    title: "Finanzen & Steuer",
    items: [
      { to: "/app/tax", label: "Steuer-Brücke", icon: Calculator },
      { to: "/app/advisor", label: "Steuerberater", icon: ShieldCheck },
    ],
  },
  {
    title: "Werkzeuge",
    items: [
      { to: "/app/vault", label: "Tresor", icon: Lock, badge: "Zero-Knowledge" },
      { to: "/app/bookings", label: "Aufträge", icon: Briefcase, badge: "neu" },
      { to: "/app/marketplace", label: "Marktplatz", icon: Wrench },
      { to: "/app/law", label: "Rechts-Ecke", icon: Scale },
    ],
  },
];

// Flat list for mobile bottom nav (top 5 most used)
const bottomNav: NavItem[] = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/properties", label: "Objekte", icon: Building2 },
  { to: "/app/tax", label: "Steuer", icon: Calculator },
  { to: "/app/vault", label: "Tresor", icon: Lock },
  { to: "/app/settings", label: "Mehr", icon: SettingsIcon },
];

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = async () => { await signOut(); navigate("/", { replace: true }); };

  return (
    <div className="min-h-screen bg-background">
      {/* Background ambient gradient */}
      <div className="fixed inset-0 pointer-events-none opacity-50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-hero-glow" />
      </div>

      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl z-30">
        <div className="p-6"><Logo /></div>
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          {groups.map((g) => (
            <div key={g.title}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70 mb-2">
                {g.title}
              </p>
              <div className="space-y-0.5">
                {g.items.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.end}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <n.icon className={`h-[18px] w-[18px] transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
                        <span className="flex-1">{n.label}</span>
                        {n.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary tracking-wide">
                            {n.badge}
                          </span>
                        )}
                        {isActive && (
                          <motion.div
                            layoutId="active-nav-pill"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          />
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-border/60 space-y-3">
          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${
                isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
              }`
            }
          >
            <SettingsIcon className="h-[18px] w-[18px]" /> Einstellungen
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40">
            <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
              {(user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
            <div className="text-xs min-w-0 flex-1">
              <p className="font-medium truncate">{user?.email}</p>
              <p className="text-muted-foreground text-[10px]">Free · 14 Tage</p>
            </div>
            <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground p-1" title="Abmelden">
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border/60">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="lg:pl-64 relative">
        <div className="container py-6 lg:py-10 max-w-6xl pb-28 lg:pb-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border/60">
        <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {bottomNav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-[56px] ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <n.icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
                  </motion.div>
                  <span className="text-[10px] font-medium tracking-tight">{n.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
