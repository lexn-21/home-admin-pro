import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

const STORAGE_KEY = "immoniq.cookie.consent.v1";

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export function getConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    if (!getConsent()) setOpen(true);
  }, []);

  const save = (c: Omit<Consent, "necessary" | "ts">) => {
    const consent: Consent = { necessary: true, ...c, ts: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    setOpen(false);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: consent }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-4 animate-in slide-in-from-bottom-4">
      <div className="mx-auto max-w-3xl rounded-2xl border bg-background/95 backdrop-blur shadow-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 shrink-0">
            <Cookie className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base mb-1">Wir respektieren deine Privatsphäre 🍪</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Wir nutzen technisch notwendige Cookies, damit die App funktioniert. Mit deiner
              Erlaubnis verwenden wir auch Cookies für Analyse & Marketing — dadurch wird ImmoNIQ
              besser. Mehr Infos in der{" "}
              <Link to="/datenschutz" className="underline">
                Datenschutzerklärung
              </Link>
              .
            </p>

            {showDetails && (
              <div className="space-y-2 mb-3 text-sm border rounded-lg p-3 bg-muted/30">
                <label className="flex items-center justify-between opacity-60">
                  <span>
                    <strong>Notwendig</strong> — Login, Sicherheit
                  </span>
                  <input type="checkbox" checked disabled />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>
                    <strong>Analyse</strong> — Nutzungsstatistiken
                  </span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span>
                    <strong>Marketing</strong> — Personalisierte Inhalte
                  </span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                  />
                </label>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => save({ analytics: true, marketing: true })}
                className="flex-1 sm:flex-initial"
              >
                Alle akzeptieren
              </Button>
              {showDetails ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => save({ analytics, marketing })}
                >
                  Auswahl speichern
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setShowDetails(true)}>
                  Anpassen
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Nur notwendige
              </Button>
            </div>
          </div>
          <button
            onClick={() => save({ analytics: false, marketing: false })}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
