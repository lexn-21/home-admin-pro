import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  UserPlus, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Play, Pause, RotateCcw, Clock,
} from "lucide-react";

type Step = {
  id: number;
  duration: number; // seconds
  icon: any;
  title: string;
  sub: string;
  bullets: string[];
};

const STEPS: Step[] = [
  {
    id: 1,
    duration: 15,
    icon: UserPlus,
    title: "Konto erstellen",
    sub: "E-Mail, Passwort — fertig. Keine Kreditkarte, keine Tricks.",
    bullets: ["E-Mail bestätigen", "Sicheres Passwort wählen", "DSGVO-konform in DE"],
  },
  {
    id: 2,
    duration: 25,
    icon: ShieldCheck,
    title: "Tresor-PIN setzen",
    sub: "Deine PIN verschlüsselt deine Dokumente. Niemand sonst kommt rein — auch wir nicht.",
    bullets: ["6-stellige PIN", "Ende-zu-Ende verschlüsselt", "Optional Biometrie"],
  },
  {
    id: 3,
    duration: 20,
    icon: Sparkles,
    title: "Persönliches Cockpit",
    sub: "ImmonIQ richtet Module passend zu dir ein — Tresor, Fristen, Marktwert.",
    bullets: ["Module nach Lebenslage", "Erste Fristen automatisch", "Marktwert auf Knopfdruck"],
  },
];

const TOTAL = STEPS.reduce((a, s) => a + s.duration, 0);

export const QuickStartFlow = () => {
  const [elapsed, setElapsed] = useState(0); // seconds * 10 (deci-seconds for smooth bar)
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<number | null>(null);

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

  // Determine active step
  let cum = 0;
  let activeIdx = 0;
  for (let i = 0; i < STEPS.length; i++) {
    cum += STEPS[i].duration;
    if (seconds < cum) {
      activeIdx = i;
      break;
    }
    activeIdx = i;
  }
  if (done) activeIdx = STEPS.length - 1;

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
    <section id="start" className="py-24 border-t border-border">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-4">
            60-Sekunden-Start
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 font-display">
            Drei Schritte. <span className="text-gradient-gold">Bis zum Login.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Kein Setup-Marathon, kein Excel-Import. Klick auf Play — und sieh, wie schnell du startest.
          </p>
        </div>

        <div className="glass rounded-3xl p-6 md:p-10 shadow-elevated">
          {/* Top bar: timer + controls */}
          <div className="flex items-center justify-between gap-4 mb-8">
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
                  <><RotateCcw className="h-4 w-4 mr-1.5" /> Neu</>
                ) : running ? (
                  <><Pause className="h-4 w-4 mr-1.5" /> Pause</>
                ) : (
                  <><Play className="h-4 w-4 mr-1.5" /> Start-Demo</>
                )}
              </Button>
              {(elapsed > 0 || done) && (
                <Button onClick={handleReset} size="sm" variant="ghost">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="relative h-2 rounded-full bg-muted overflow-hidden mb-10">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-gold shadow-gold transition-[width] duration-100 ease-linear"
              style={{ width: `${overallPct}%` }}
            />
          </div>

          {/* Steps */}
          <ol className="grid md:grid-cols-3 gap-4 md:gap-6">
            {STEPS.map((s, idx) => {
              const isActive = idx === activeIdx && !done;
              const isComplete = stepProgress(idx) >= 100;
              const Icon = s.icon;
              const pct = stepProgress(idx);
              return (
                <li
                  key={s.id}
                  className={`relative rounded-2xl border p-5 transition-all ${
                    isActive
                      ? "border-primary/50 bg-primary/5 shadow-gold scale-[1.01]"
                      : isComplete
                        ? "border-primary/30 bg-primary/[0.03]"
                        : "border-border bg-background/50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isComplete
                          ? "bg-gradient-gold shadow-gold"
                          : isActive
                            ? "bg-primary/10 border border-primary/30"
                            : "bg-muted border border-border"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
                      ) : (
                        <Icon className={`h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Schritt {s.id} · {s.duration}s
                      </p>
                      <h3 className="font-bold leading-tight">{s.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{s.sub}</p>
                  <ul className="space-y-1.5 mb-3">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <CheckCircle2 className={`h-3 w-3 flex-shrink-0 ${isComplete || isActive ? "text-primary" : "text-muted-foreground/40"}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {/* mini progress */}
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
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border">
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
