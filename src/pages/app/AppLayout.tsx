import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Building2, Users, Wallet, Receipt, Calculator, LogOut } from "lucide-react";

const nav = [
  { to: "/app", label: "Übersicht", icon: LayoutDashboard, end: true },
  { to: "/app/properties", label: "Objekte", icon: Building2 },
  { to: "/app/tenants", label: "Mieter", icon: Users },
  { to: "/app/payments", label: "Zahlungen", icon: Wallet },
  { to: "/app/expenses", label: "Belege", icon: Receipt },
  { to: "/app/tax", label: "Steuer-Brücke", icon: Calculator },
];

const AppLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => { await signOut(); navigate("/", { replace: true }); };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-border bg-sidebar">
        <div className="p-6"><Logo /></div>
        <nav className="flex-1 px-3 space-y-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-3">
          <div className="text-xs">
            <p className="text-muted-foreground">Angemeldet als</p>
            <p className="font-medium truncate">{user?.email}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" size="sm" className="w-full">
            <LogOut className="h-3.5 w-3.5 mr-2" /> Abmelden
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 glass border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Logo />
          <Button onClick={handleSignOut} variant="ghost" size="sm"><LogOut className="h-4 w-4" /></Button>
        </div>
        <nav className="flex overflow-x-auto px-2 pb-2 gap-1 no-scrollbar">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`
              }
            >
              <n.icon className="h-3 w-3" />
              {n.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="lg:pl-60">
        <div className="container py-8 max-w-6xl animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
