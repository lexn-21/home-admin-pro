import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserPlus, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Play, Pause, RotateCcw, Clock,
  Mail, Lock, Fingerprint, Building2, Calendar, TrendingUp,
} from "lucide-react";

type Step = {
  id: number;
  duration: number;
  icon: any;
  title: string;
  sub: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    id: 1,
    duration: 8,
    icon: UserPlus,
    title: "Konto erstellen",
    sub: "E-Mail, Passwort — fertig. Keine Kreditkarte.",
    bullets: ["E-Mail bestätigen", "Sicheres Passwort", "DSGVO-konform in DE"],
  },
  {
    id: 2,
    duration: 9,
    icon: ShieldCheck,
    title: "Tresor-PIN setzen",
    sub: "Deine PIN verschlüsselt alles. Niemand sonst kommt rein — auch wir nicht.",
    bullets: ["6-stellige PIN", "Ende-zu-Ende verschlüsselt", "Optional Biometrie"],
  },
  {
    id: 3,
    duration: 7,
    icon: Sparkles,
    title: "Persönliches Cockpit",
    sub: "ImmonIQ richtet Module passend zu dir ein.",
    bullets: ["Tresor", "Fristen automatisch", "Marktwert auf Knopfdruck"],
  },
];

const TOTAL = STEPS.reduce((a, s) => a + s.duration, 0);
const EMAIL_TEXT = "anna@beispiel.de";

// ───────────────────────── STAGE: Live-Mockups pro Schritt ─────────────────────────
const Stage = ({ activeIdx, stepLocalProgress, done }: { activeIdx: number; stepLocalProgress: number; done: boolean }) => {
  return (
    <div className="relative rounded-2xl border border-border bg-background/80 overflow-hidden mb-8 shadow-elevated">
      {/* fake browser chrome */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-muted/40">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/40" />
        <span className="ml-3 text-[10px] text-muted-foreground font-mono truncate">app.immoniq.xyz</span>
      </div>

      <div className="relative h-[260px] md:h-[280px] overflow-hidden">
        <StageStep1 active={activeIdx === 0 && !done} progress={activeIdx === 0 ? stepLocalProgress : activeIdx > 0 ? 1 : 0} />
        <StageStep2 active={activeIdx === 1 && !done} progress={activeIdx === 1 ? stepLocalProgress : activeIdx > 1 ? 1 : 0} />
        <StageStep3 active={activeIdx === 2 || done} progress={activeIdx === 2 ? stepLocalProgress : done ? 1 : 0} />
      </div>
    </div>
  );
};

const StageStep1 = ({ active, progress }: { active: boolean; progress: number }) => {
  const typedChars = Math.floor(progress * 2.2 * EMAIL_TEXT.length);
  const email = EMAIL_TEXT.slice(0, Math.min(typedChars, EMAIL_TEXT.length));
  const pwDots = Math.min(8, Math.floor(Math.max(0, progress - 0.5) * 2 * 9));
  return (
    <div
      className={`absolute inset-0 p-6 md:p-8 flex flex-col justify-center transition-opacity duration-500 ${active ? "opacity-100" : progress >= 1 ? "opacity-0" : "opacity-0"}`}
    >
      <div className="max-w-sm mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <UserPlus className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="font-bold text-sm">Konto erstellen</p>
        </div>
        <div className="space-y-2.5">
          <div className="rounded-lg border border-border bg-background px-3 py-2.5 flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm font-mono">{email}</span>
            {active && email.length < EMAIL_TEXT.length && (
              <span className="inline-block w-[2px] h-4 bg-primary animate-pulse" />
            )}
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2.5 flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className={`h-2 w-2 rounded-full transition-colors ${i < pwDots ? "bg-primary" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <div
            className={`rounded-lg py-2.5 text-center text-sm font-semibold transition-all ${
              progress >= 0.95 ? "bg-gradient-gold text-primary-foreground shadow-gold" : "bg-muted text-muted-foreground"
            }`}
          >
            {progress >= 0.95 ? "✓ Konto erstellt" : "Konto erstellen"}
          </div>
        </div>
      </div>
    </div>
  );
};

const StageStep2 = ({ active, progress }: { active: boolean; progress: number }) => {
  const dotsFilled = Math.min(6, Math.floor(progress * 8));
  const sealed = progress >= 0.85;
  return (
    <div className={`absolute inset-0 p-6 md:p-8 flex flex-col justify-center transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-sm mx-auto w-full text-center">
        <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-all ${sealed ? "bg-gradient-gold shadow-gold scale-110" : "bg-primary/10 border border-primary/30"}`}>
          {sealed ? <ShieldCheck className="h-7 w-7 text-primary-foreground" /> : <Lock className="h-7 w-7 text-primary" />}
        </div>
        <p className="font-bold text-sm mb-1">{sealed ? "Tresor versiegelt" : "Tresor-PIN festlegen"}</p>
        <p className="text-xs text-muted-foreground mb-5">{sealed ? "Niemand außer dir kommt rein." : "6-stellige PIN — nur du kennst sie."}</p>
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 w-9 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-all ${
                i < dotsFilled
                  ? "border-primary bg-primary/10 text-primary scale-105"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {i < dotsFilled ? "•" : ""}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <Fingerprint className="h-3.5 w-3.5" /> Optional: Biometrie aktivieren
        </div>
      </div>
    </div>
  );
};

const StageStep3 = ({ active, progress }: { active: boolean; progress: number }) => {
  const modules = [
    { icon: Building2, label: "Tresor", color: "from-primary/20 to-primary/5" },
    { icon: Calendar, label: "Fristen", color: "from-primary/20 to-primary/5" },
    { icon: TrendingUp, label: "Marktwert", color: "from-primary/20 to-primary/5" },
  ];
  const visibleCount = Math.min(3, Math.floor(progress * 4));
  return (
    <div className={`absolute inset-0 p-6 md:p-8 flex flex-col justify-center transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
      <div className="max-w-md mx-auto w-full">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <p className="font-bold text-sm">Dein Cockpit wird gebaut…</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {modules.map((m, i) => {
            const Icon = m.icon;
            const visible = i < visibleCount;
            return (
              <div
                key={m.label}
                className={`rounded-xl border p-3 flex flex-col items-center gap-2 transition-all duration-500 ${
                  visible
                    ? "border-primary/40 bg-primary/5 opacity-100 translate-y-0 scale-100"
                    : "border-border bg-muted/30 opacity-0 translate-y-3 scale-95"
                }`}
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <p className="text-xs font-semibold">{m.label}</p>
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              </div>
            );
          })}
        </div>
        <div className={`mt-5 text-center text-xs transition-opacity ${progress >= 0.95 ? "opacity-100 text-primary font-semibold" : "opacity-0"}`}>
          ✓ Bereit. Du kannst loslegen.
        </div>
      </div>
    </div>
  );
};

// ───────────────────────── HAUPT-KOMPONENTE ─────────────────────────
export const QuickStartFlow = () => {
  const [elapsed, setElapsed] = useState(0); // deci-seconds
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const startedOnceRef = useRef(false);

  // Auto-start bei Sichtbarkeit (1×)
  useEffect(() => {
    if (!sectionRef.current || startedOnceRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedOnceRef.current) {
            startedOnceRef.current = true;
            setRunning(true);
          }
        });
      },
      { threshold: 0.35 }
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed((e) => {
        const next = e + 1;
        if (next >= TOTAL * 10) {
          setRunning(false);
          setDone(true);
          return TOTAL * 10;
        }
        return next;
      });
    }, 100);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  const seconds = elapsed / 10;
  const remaining = Math.max(0, TOTAL - seconds);

  const { activeIdx, stepLocalProgress } = useMemo(() => {
    let cum = 0;
    let idx = 0;
    let local = 0;
    for (let i = 0; i < STEPS.length; i++) {
      const start = cum;
      cum += STEPS[i].duration;
      if (seconds < cum) {
        idx = i;
        local = (seconds - start) / STEPS[i].duration;
        break;
      }
      idx = i;
      local = 1;
    }
    if (done) { idx = STEPS.length - 1; local = 1; }
    return { activeIdx: idx, stepLocalProgress: local };
  }, [seconds, done]);

  const stepProgress = (idx: number) => {
    const start = STEPS.slice(0, idx).reduce((a, s) => a + s.duration, 0);
    const end = start + STEPS[idx].duration;
    if (seconds >= end) return 100;
    if (seconds <= start) return 0;
    return ((seconds - start) / STEPS[idx].duration) * 100;
  };

  const handleToggle = () => {
    if (done) {
      setElapsed(0);
      setDone(false);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    setDone(false);
  };

  const overallPct = (seconds / TOTAL) * 100;

  return (
    <section ref={sectionRef} id="start" className="py-24 border-t border-border">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">
            So läuft der Start
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
            Drei Schritte. <span className="text-gradient-gold">Bis zum Login.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Sieh live zu, wie ImmonIQ in unter einer Minute startklar ist — oder klick auf Pause und schau dir jeden Schritt in Ruhe an.
          </p>
        </div>

        <div className="glass rounded-3xl p-5 md:p-8 shadow-elevated">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Verbleibend</p>
                <p className="text-2xl font-bold font-display tabular-nums">
                  {done ? "0" : Math.ceil(remaining)}<span className="text-base text-muted-foreground">s</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleToggle}
                size="sm"
                className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold"
              >
                {done ? (
                  <><RotateCcw className="h-4 w-4 mr-1.5" /> Nochmal</>
                ) : running ? (
                  <><Pause className="h-4 w-4 mr-1.5" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-1.5" /> Demo starten</>
                )}
              </Button>
              {(elapsed > 0 || done) && (
                <Button onClick={handleReset} size="sm" variant="ghost">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="relative h-1.5 rounded-full bg-muted overflow-hidden mb-6">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-gold shadow-gold transition-[width] duration-100 ease-linear"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {/* LIVE STAGE */}
          <Stage activeIdx={activeIdx} stepLocalProgress={stepLocalProgress} done={done} />

          {/* Steps */}
          <ol className="grid md:grid-cols-3 gap-3 md:gap-4">
            {STEPS.map((s, idx) => {
              const isActive = idx === activeIdx && !done;
              const isComplete = stepProgress(idx) >= 100;
              const Icon = s.icon;
              const pct = stepProgress(idx);
              return (
                <li
                  key={s.id}
                  className={`relative rounded-2xl border p-4 transition-all ${
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-gold scale-[1.01]"
                      : isComplete
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border bg-background/50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div
                      className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isComplete
                          ? "bg-gradient-gold shadow-gold"
                          : isActive
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-muted border border-border"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Schritt {s.id} · {s.duration}s
                      </p>
                      <h3 className="font-bold leading-tight text-sm">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">{s.sub}</p>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-gold transition-[width] duration-100 ease-linear"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {done
                ? "Fertig — schneller als ein Espresso. Jetzt für echt loslegen."
                : "Kein Risiko: Privatnutzer kostenlos. Keine Kreditkarte."}
            </div>
            <Button
              asChild
              size="lg"
              className="bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold h-12 px-8"
            >
              <Link to="/auth">
                Jetzt loslegen <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickStartFlow;
