import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import {
  Building2, Calculator, Shield, FileText, TrendingUp, Receipt,
  CheckCircle2, ArrowRight, Sparkles, Lock, Zap, Users
} from "lucide-react";

const Index = () => {
  useEffect(() => {
    document.title = "ImmoNIQ — Das Betriebssystem für Privatvermieter";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "ImmoNIQ macht aus 15 Stunden Vermieter-Bürokratie pro Jahr einen 30-Minuten-Job. Verwaltung, Steuer, Belege — alles an einem Ort. Made in Germany.");
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 glass">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#module" className="hover:text-foreground transition">Module</a>
            <a href="#warum" className="hover:text-foreground transition">Warum ImmoNIQ</a>
            <a href="#preise" className="hover:text-foreground transition">Preise</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/markt">Markt</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Anmelden</Link></Button>
            <Button asChild size="sm" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold">
              <Link to="/auth">Kostenlos starten</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="container relative pt-20 pb-24 md:pt-32 md:pb-40">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3 w-3 text-primary" />
              Made in Germany · DSGVO · Bank-Level-Sicherheit
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Schluss mit dem<br />
              <span className="text-gradient-gold">Vermieter-Papierkrieg.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              ImmoNIQ ist das Betriebssystem für Privatvermieter im DACH-Raum.
              Verwaltung, Steuer und Belege — an einem Ort. In 30 Minuten pro Quartal erledigt,
              statt 15 Stunden im Jahr.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 px-8 text-base">
                <Link to="/auth">Jetzt kostenlos starten <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                <a href="#module">Module entdecken</a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              Keine Kreditkarte nötig · Volle Funktionen 14 Tage testen
            </p>
          </div>

          {/* PRODUCT MOCK */}
          <div className="mt-20 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="glass rounded-3xl p-2 shadow-glass">
              <div className="rounded-2xl bg-gradient-dark p-6 md:p-10">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Mieteinnahmen YTD", value: "47.820 €", trend: "+8,2 %", color: "text-success" },
                    { label: "Vermietungsquote", value: "94 %", trend: "11/12 Einheiten", color: "text-primary" },
                    { label: "Steuer-Belege", value: "127", trend: "Bereit zum Export", color: "text-primary" },
                  ].map((kpi) => (
                    <div key={kpi.label} className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
                      <p className="text-xs text-white/60 mb-1">{kpi.label}</p>
                      <p className="text-2xl font-bold text-white mb-1">{kpi.value}</p>
                      <p className={`text-xs ${kpi.color}`}>{kpi.trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 border-t border-border">
        <div className="container max-w-4xl text-center">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Das Problem</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Privatvermieter sind <span className="text-gradient-gold">Selbstausbeuter.</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12 text-left">
            {[
              { stat: "15h", text: "verlieren Vermieter pro Jahr und Wohnung an Verwaltung." },
              { stat: "640€", text: "kostet ein Steuerberater im Schnitt für die Anlage V." },
              { stat: "1 v. 3", text: "macht Fehler bei der Anlage V. Risiko: Nachzahlung." },
            ].map((p) => (
              <div key={p.stat} className="glass rounded-2xl p-6">
                <p className="text-4xl font-bold text-gradient-gold mb-2">{p.stat}</p>
                <p className="text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULE */}
      <section id="module" className="py-24 bg-muted/30 border-y border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Was du heute schon bekommst</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Das Fundament. <span className="text-gradient-gold">Live.</span>
            </h2>
            <p className="text-muted-foreground">
              Drei Module, die ab heute laufen. Bank-Anbindung, OCR und ELSTER folgen.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Verwaltungs-Cockpit", desc: "Multi-Objekt-Dashboard mit Live-Cashflow, Vermietungsquote und Rendite — pro Objekt, in Echtzeit." },
              { icon: Calculator, title: "Steuer-Brücke", desc: "Belege fotografieren, kategorisieren (AfA / sofort / NK), als DATEV-CSV an deinen Steuerberater exportieren." },
              { icon: Shield, title: "Tresor & Compliance", desc: "Verschlüsselte Belegablage. Aufbewahrungsfristen nach §147 AO automatisch überwacht." },
            ].map((m) => (
              <div key={m.title} className="glass rounded-2xl p-8 hover:shadow-gold transition-shadow">
                <div className="h-12 w-12 rounded-2xl bg-gradient-gold flex items-center justify-center mb-5 shadow-gold">
                  <m.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">{m.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Roadmap chips */}
          <div className="mt-16 max-w-3xl mx-auto">
            <p className="text-center text-sm text-muted-foreground mb-4">In Entwicklung:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Bank-Anbindung (FinTS)", "OCR-Belegerkennung", "Mahnwesen automatisiert", "Mietspiegel-Engine", "Vertragswerk-Generator", "ELSTER Anlage V", "Steuerberater-Portal", "Marktplatz"].map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-card border border-border text-muted-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section id="warum" className="py-24">
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
                { icon: Lock, title: "Rechtliche Klarheit", desc: "Bei jedem Feature steht der Paragraph (§ 556 BGB, § 7 EStG). Keine KI-Beratung — nur saubere Quellen." },
                { icon: Users, title: "Dein StB liebt es", desc: "DATEV-CSV-Export mit einem Klick. Deine Partnerin spart Stunden — du sparst das Honorar." },
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
                "Mit ImmoNIQ erledige ich meine Anlage V in 30 Minuten pro Quartal. Mein Steuerberater bekommt den DATEV-Export — fertig."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center text-primary-foreground font-bold">L</div>
                <div>
                  <p className="text-sm font-semibold">Leon B.</p>
                  <p className="text-xs text-muted-foreground">Vermieter, Buchhalter · Ennigerloh</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="preise" className="py-24 bg-muted/30 border-y border-border">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">Preise</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ein Steuerberater-Honorar. <span className="text-gradient-gold">Pro Jahr.</span>
            </h2>
            <p className="text-muted-foreground">14 Tage kostenlos testen. Monatlich kündbar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Starter", price: "4,99", units: "1–3 Wohnungen", features: ["Verwaltungs-Cockpit", "Belegablage", "Basis-Steuerexport"] },
              { name: "Pro", price: "9,99", units: "4–10 Wohnungen", featured: true, features: ["Alles aus Starter", "DATEV-CSV-Export", "Mahnwesen-Vorlagen", "Priorität-Support"] },
              { name: "Business", price: "19,99", units: "10+ Wohnungen", features: ["Alles aus Pro", "Multi-User-Zugang", "API-Zugang", "Eigener Account-Manager"] },
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
                  <Link to="/auth">Starten</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container max-w-3xl text-center">
          <FileText className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Dein nächster Quartals-Abschluss.<br />
            <span className="text-gradient-gold">In 30 Minuten.</span>
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Schließ dich Vermietern an, die ihre Wochenenden zurückgewonnen haben.
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
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ImmoNIQ · Made in Ennigerloh, NRW · DSGVO-konform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
