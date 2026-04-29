import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Building2, Calculator, Shield, FileText, TrendingUp, Receipt,
  CheckCircle2, ArrowRight, Sparkles, Lock, Zap, Users,
  Home, Search, KeyRound, Wrench, Bell, FolderLock, Wallet,
} from "lucide-react";

type PersonaKey = "owner" | "landlord" | "buyer" | "tenant";

const PERSONAS: Record<PersonaKey, {
  label: string;
  icon: any;
  headline: string;
  sub: string;
  bullets: { icon: any; text: string }[];
  primary: { label: string; to: string };
  secondary?: { label: string; to: string };
}> = {
  owner: {
    label: "Ich wohne selbst",
    icon: Home,
    headline: "Alles zu deiner Wohnung — sicher an einem Ort.",
    sub: "Kaufvertrag, Grundbuch, Versicherungen, Handwerker-Rechnungen, Energieausweis. Verschlüsselt im Tresor. Fristen werden für dich überwacht.",
    bullets: [
      { icon: FolderLock, text: "Verschlüsselter Dokumenten-Tresor" },
      { icon: Bell, text: "Erinnerungen für Versicherung, Wartung, Steuer" },
      { icon: TrendingUp, text: "Aktueller Marktwert deiner Immobilie" },
    ],
    primary: { label: "Kostenlos starten", to: "/auth" },
    secondary: { label: "Marktwert ansehen", to: "/markt" },
  },
  landlord: {
    label: "Ich vermiete",
    icon: Building2,
    headline: "Schluss mit dem Vermieter-Papierkrieg.",
    sub: "Mieten, Nebenkosten, Belege, Anlage V — in 30 Minuten pro Quartal statt 15 Stunden im Jahr. Ohne Steuerberater-Honorar.",
    bullets: [
      { icon: Wallet, text: "Mietkonto & Mahnwesen automatisch" },
      { icon: Calculator, text: "DATEV-CSV für deinen Steuerberater" },
      { icon: Users, text: "Inserieren ohne Maklerprovision" },
    ],
    primary: { label: "Vermieter werden", to: "/auth" },
    secondary: { label: "Inserate ansehen", to: "/markt" },
  },
  buyer: {
    label: "Ich kaufe / verkaufe",
    icon: KeyRound,
    headline: "Klar entscheiden. Fair handeln.",
    sub: "Echte Marktwerte aus dem Mietspiegel + Vergleichsobjekten. Inserate direkt von Eigentümer zu Eigentümer — ohne Maklerprovision.",
    bullets: [
      { icon: TrendingUp, text: "Marktwert-Analyse für jede PLZ" },
      { icon: Search, text: "Privater Markt mit Umkreissuche" },
      { icon: Calculator, text: "Finanzierungs- & Renditerechner" },
    ],
    primary: { label: "Marktwert prüfen", to: "/auth" },
    secondary: { label: "Markt entdecken", to: "/markt" },
  },
  tenant: {
    label: "Ich miete / suche",
    icon: Search,
    headline: "Wohnung finden — direkt vom Eigentümer.",
    sub: "Keine Maklerprovision nach Bestellerprinzip. Eigenes Mieter-Profil, das du einmal pflegst und bei jeder Bewerbung sicher teilst.",
    bullets: [
      { icon: Search, text: "Markt mit Umkreissuche & Filter" },
      { icon: Shield, text: "Mieter-Profil sicher & DSGVO-konform" },
      { icon: FolderLock, text: "Mietvertrag, Nebenkosten, SCHUFA im Tresor" },
    ],
    primary: { label: "Wohnung suchen", to: "/markt" },
    secondary: { label: "Mieter-Profil anlegen", to: "/auth" },
  },
};

const Index = () => {
  const [persona, setPersona] = useState<PersonaKey>("owner");

  useEffect(() => {
    document.title = "ImmoNIQ — Alles rund um deine Immobilie. An einem Ort.";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "Die All-in-One App für alles rund um deine Immobilie: Tresor, Fristen, Marktwert, Mieten, Suchen — für Eigennutzer, Vermieter, Käufer und Mieter. Made in Germany.");
  }, []);

  const p = PERSONAS[persona];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between gap-2">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#fuer-wen" className="hover:text-foreground transition">Für wen</a>
            <a href="#module" className="hover:text-foreground transition">Module</a>
            <a href="#warum" className="hover:text-foreground transition">Warum</a>
            <a href="#preise" className="hover:text-foreground transition">Preise</a>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex"><Link to="/markt">Markt</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Anmelden</Link></Button>
            <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
              <Link to="/auth"><span className="hidden sm:inline">Kostenlos starten</span><span className="sm:hidden">Starten</span></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="container relative pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3 w-3 text-primary" />
              All-in-One für deine Immobilie · Made in Germany · DSGVO
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Alles rund um deine<br />
              <span className="text-gradient-gold">Immobilie.</span> An einem Ort.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Ob du selbst wohnst, vermietest, kaufst oder suchst — ImmoNIQ bündelt Dokumente,
              Fristen, Marktwert, Steuer und Markt in einer einzigen, sicheren App.
            </p>

            {/* Persona-Switch */}
            <div className="flex flex-wrap justify-center gap-2 mb-8" id="fuer-wen">
              {(Object.keys(PERSONAS) as PersonaKey[]).map((k) => {
                const P = PERSONAS[k];
                const active = persona === k;
                return (
                  <button
                    key={k}
                    onClick={() => setPersona(k)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active
                        ? "bg-primary text-primary-foreground shadow-gold"
                        : "glass text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <P.icon className="h-4 w-4" />
                    {P.label}
                  </button>
                );
              })}
            </div>

            {/* Persona-spezifischer Block */}
            <div key={persona} className="glass rounded-3xl p-6 md:p-8 text-left animate-fade-in-up">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{p.headline}</h2>
              <p className="text-muted-foreground mb-6">{p.sub}</p>
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                {p.bullets.map((b) => (
                  <div key={b.text} className="flex items-start gap-2 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <b.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="pt-1.5">{b.text}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 px-8 text-base">
                  <Link to={p.primary.to}>{p.primary.label} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                {p.secondary && (
                  <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                    <Link to={p.secondary.to}>{p.secondary.label}</Link>
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Kostenloser Plan für private Nutzer · Keine Kreditkarte · Wechsel jederzeit
            </p>
          </div>
        </div>
      </section>

      {/* WAS DRIN IST — universelle Module */}
      <section id="module" className="py-24 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Was drin ist</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Sechs Bausteine. <span className="text-gradient-gold">Du nutzt, was du brauchst.</span>
            </h2>
            <p className="text-muted-foreground">
              Jedes Modul funktioniert allein — und alle zusammen ergeben dein persönliches Immobilien-Cockpit.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FolderLock, title: "Dokumenten-Tresor", desc: "Kaufvertrag, Grundbuch, Versicherung, Energieausweis — verschlüsselt mit deiner PIN. Niemand außer dir kann es öffnen." },
              { icon: Bell, title: "Fristen & Plan", desc: "Nebenkosten, Wartung, Versicherung, Steuer. ImmoNIQ erinnert dich rechtzeitig — mit Paragraph dazu." },
              { icon: TrendingUp, title: "Marktwert & Mietspiegel", desc: "Aktueller Wert deiner Immobilie und Vergleichsmieten für jede PLZ. Jederzeit auf Knopfdruck." },
              { icon: Building2, title: "Vermieter-Cockpit", desc: "Mieten, Nebenkosten, Mahnwesen, Anlage V. Optional, wenn du vermietest." },
              { icon: Search, title: "Privater Markt", desc: "Inserieren oder suchen — direkt zwischen Eigentümern und Mietern. Keine Maklerprovision nach Bestellerprinzip." },
              { icon: Wrench, title: "Profis in deiner Nähe", desc: "Handwerker, Steuerberater, Versicherung — strikt getrennt nach Kategorie. Reihenfolge nach Bewertung, nicht nach Geld." },
            ].map((m) => (
              <div key={m.title} className="glass rounded-2xl p-7 hover:shadow-gold transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center mb-5 shadow-gold">
                  <m.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold mb-2">{m.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM / WARUM ÜBERHAUPT */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Warum überhaupt</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Deine Immobilien-Sachen liegen in <span className="text-gradient-gold">10 Ordnern, 4 Apps und 1 Schuhkarton.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Egal ob Eigenheim, vermietete Wohnung oder Kaufabsicht — die Unterlagen, Fristen und Zahlen
              sind verstreut. ImmoNIQ ist der eine Ort, an dem alles zusammenkommt — sicher, ehrlich, deutsch.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { stat: "1 App", text: "statt 4. Tresor, Fristen, Markt, Steuer — gebündelt." },
              { stat: "0 €", text: "kostet der private Plan für deine eigene Wohnung." },
              { stat: "DSGVO", text: "Server in der EU. Dokumente Ende-zu-Ende verschlüsselt." },
            ].map((p) => (
              <div key={p.stat} className="glass rounded-2xl p-6">
                <p className="text-4xl font-bold text-gradient-gold mb-2">{p.stat}</p>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="warum" className="py-24 bg-muted/30 border-y border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Warum ImmoNIQ</p>
            <h2 className="text-4xl md:text-5xl font-bold">
              Andere verwalten. <span className="text-gradient-gold">Wir denken mit.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                { icon: Zap, title: "Null Lernkurve", desc: "Wenn dein Vater es nicht in 3 Minuten versteht, ist es zu komplex. Apple-Ästhetik, deutsche Klarheit." },
                { icon: Lock, title: "Rechtliche Klarheit", desc: "Bei jedem Feature steht der Paragraph (§ 556 BGB, § 7 EStG, § 147 AO). Keine KI-Beratung — nur saubere Quellen." },
                { icon: Shield, title: "Ehrlich finanziert", desc: "Privatnutzer kostenlos. Anzeigen klar gekennzeichnet, niemals in den Treffern. Keine bezahlten Spitzenplätze." },
                { icon: TrendingUp, title: "Eingebauter Vorteil", desc: "Renditebenchmarks, Förderhinweise, Mietspiegel-Vergleich. Du siehst, was andere übersehen." },
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-3xl p-8 bg-gradient-to-br from-primary/5 to-transparent">
              <Receipt className="h-8 w-8 text-primary mb-4" />
              <p className="text-lg font-medium leading-relaxed mb-6">
                "Endlich liegen mein Kaufvertrag, die Versicherung und die Handwerker-Rechnungen
                an einem Ort. Und ich werde rechtzeitig erinnert, wenn etwas fällig wird."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">L</div>
                <div>
                  <p className="text-sm font-semibold">Leon B.</p>
                  <p className="text-xs text-muted-foreground">Eigentümer · Ennigerloh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="preise" className="py-24">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Preise</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Privat <span className="text-gradient-gold">kostenlos.</span> Vermieten ab 4,99 €.
            </h2>
            <p className="text-muted-foreground">14 Tage volle Funktionen testen. Monatlich kündbar. Keine versteckten Kosten.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Privat",
                price: "0",
                units: "Für deine eigene Wohnung",
                features: [
                  "Dokumenten-Tresor (verschlüsselt)",
                  "Fristen & Erinnerungen",
                  "Marktwert-Schätzung",
                  "Wohnung suchen & bewerben",
                ],
                cta: "Kostenlos starten",
              },
              {
                name: "Vermieten",
                price: "4,99",
                units: "1–3 vermietete Wohnungen",
                featured: true,
                features: [
                  "Alles aus Privat",
                  "Mietkonto & Mahnwesen",
                  "Belege & Steuer-Export",
                  "Inserieren ohne Provision",
                ],
                cta: "Vermieten starten",
              },
              {
                name: "Pro",
                price: "9,99",
                units: "4+ Wohnungen oder Profi-Nutzung",
                features: [
                  "Alles aus Vermieten",
                  "DATEV-CSV für StB",
                  "Steuerberater-Portal",
                  "Priorität-Support",
                ],
                cta: "Pro starten",
              },
            ].map((p) => (
              <div key={p.name} className={`relative rounded-2xl p-8 ${p.featured ? "glass shadow-gold border-2 border-primary" : "glass"}`}>
                {p.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    Beliebt
                  </div>
                )}
                <p className="text-sm text-muted-foreground mb-1">{p.name}</p>
                <p className="text-xs text-muted-foreground mb-4">{p.units}</p>
                <p className="mb-6">
                  <span className="text-4xl font-bold">{p.price}</span>
                  <span className="text-muted-foreground"> €/Monat</span>
                </p>
                <ul className="space-y-2 mb-8">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className={`w-full ${p.featured ? "bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90" : ""}`} variant={p.featured ? "default" : "outline"}>
                  <Link to="/auth">{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container max-w-3xl text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Deine Immobilie verdient<br />
            <span className="text-gradient-gold">eine ehrliche App.</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Egal ob du wohnst, vermietest, kaufst oder suchst — leg in 2 Minuten los.
          </p>
          <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 px-10 text-base">
            <Link to="/auth">Kostenlos starten <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-12">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <nav className="flex gap-5 text-xs text-muted-foreground">
            <Link to="/impressum" className="hover:text-foreground">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-foreground">Datenschutz</Link>
            <Link to="/agb" className="hover:text-foreground">AGB</Link>
            <a href="mailto:leonboomgaarden@gmail.com" className="hover:text-foreground">Kontakt</a>
          </nav>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ImmoNIQ · Made in Ennigerloh, NRW · DSGVO-konform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
