import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Sparkles, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

const FREE_FEATURES = [
  "1 Objekt",
  "Mieter & Zahlungen erfassen",
  "Belege ablegen",
  "Rechtskonforme PDF-Exporte",
];

const PRO_FEATURES = [
  "Unbegrenzt Objekte",
  "KI-Copilot (Steuer, Recht, Mahnungen)",
  "Verschlüsselter Tresor",
  "Markt: Inserieren & Bewerber-Scoring",
  "Dokumenten-Scanner",
  "Berater-Zugriff & Mieter-Portal",
  "Wert-Schätzung & Benchmark",
  "Priorisierter Support",
];

export default function Pricing() {
  const { user } = useAuth();
  const { isPro, isTrial, trialDaysLeft, hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleStart = () => {
    if (!user) {
      navigate("/auth?next=/pricing");
      return;
    }
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Einfache Preise. Ehrlich.</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            30 Tage kostenlos volle Pro-Funktionen. Danach automatisch zurück auf Free — keine Abbuchung ohne deine aktive Zustimmung.
          </p>
          {isTrial && (
            <p className="mt-4 inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              🎁 Du bist im Pro-Trial · noch {trialDaysLeft} Tag{trialDaysLeft === 1 ? "" : "e"}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* FREE */}
          <Card className="p-7 flex flex-col">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Free</h2>
              <p className="text-sm text-muted-foreground">Für den Einstieg</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold">0 €</span>
              <span className="text-muted-foreground">/Monat</span>
            </div>
            <ul className="space-y-2.5 mb-7 text-sm flex-1">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" disabled className="w-full">
              {user ? "Aktueller Plan" : "Mit Free starten"}
            </Button>
          </Card>

          {/* PRO */}
          <Card className="p-7 flex flex-col border-primary/40 ring-1 ring-primary/20 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              Empfohlen
            </span>
            <div className="mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Pro
              </h2>
              <p className="text-sm text-muted-foreground">Alles für deine Immobilien</p>
            </div>
            <div className="mb-5">
              <span className="text-4xl font-bold">9,90 €</span>
              <span className="text-muted-foreground">/Monat · inkl. MwSt</span>
            </div>
            <ul className="space-y-2.5 mb-7 text-sm flex-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {f}
                </li>
              ))}
            </ul>
            {hasActiveSubscription ? (
              <Button variant="outline" className="w-full" onClick={() => navigate("/app/settings")}>
                Abo verwalten
              </Button>
            ) : (
              <Button onClick={handleStart} className="w-full">
                {isPro ? "Jetzt Pro abonnieren" : "Pro abonnieren"}
              </Button>
            )}
          </Card>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-8 max-w-xl mx-auto">
          Monatlich kündbar. Kein automatischer Übergang vom Trial in ein bezahltes Abo —
          du musst aktiv abonnieren. Steuern werden automatisch berechnet und abgeführt.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>ImmoNIQ Pro abonnieren</DialogTitle>
          </DialogHeader>
          <div className="px-2 pb-4">
            {open && user && (
              <StripeEmbeddedCheckout
                priceId="pro_monthly"
                customerEmail={user.email ?? undefined}
                userId={user.id}
                returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
