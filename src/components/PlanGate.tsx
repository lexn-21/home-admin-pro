import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";

type Props = {
  children: ReactNode;
  feature?: string;
  description?: string;
  /** Mindest-Tier. Default: "pro". Setze "verwalten_plus" für Vermieter-Basics. */
  requires?: "verwalten_plus" | "pro";
};

/**
 * PlanGate — verbirgt Inhalt, wenn der Nutzer das geforderte Tier nicht hat.
 * Pro-Trial gilt automatisch als Pro-Zugriff.
 */
export const PlanGate = ({ children, feature = "Diese Funktion", description, requires = "pro" }: Props) => {
  const { loading, isPro, hasManageAccess } = useSubscription();
  if (loading) return null;

  const ok = requires === "pro" ? isPro : hasManageAccess;
  if (ok) return <>{children}</>;

  const targetLabel = requires === "pro" ? "Pro · 9,90 €/Monat" : "Verwalten+ · 4,99 €/Monat";

  return (
    <Card className="p-8 text-center space-y-4 border-dashed">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          {requires === "pro" ? "Pro-Funktion" : "Verwalten+ Funktion"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {description ?? `${feature} ist Teil von ImmonIQ ${requires === "pro" ? "Pro" : "Verwalten+"}.`}
        </p>
      </div>
      <Button asChild>
        <Link to="/pricing">{targetLabel} freischalten</Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        Monatlich kündbar. 30 Tage Pro-Trial automatisch nach Registrierung.
      </p>
    </Card>
  );
};
