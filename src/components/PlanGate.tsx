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
};

/**
 * PlanGate — verbirgt Inhalt, wenn der Nutzer keinen Pro-Zugriff hat
 * (also weder aktives Abo noch laufenden 30-Tage-Trial).
 */
export const PlanGate = ({ children, feature = "Diese Funktion", description }: Props) => {
  const { loading, isPro } = useSubscription();
  if (loading) return null;
  if (isPro) return <>{children}</>;

  return (
    <Card className="p-8 text-center space-y-4 border-dashed">
      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> Pro-Funktion
        </h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
          {description ?? `${feature} ist Teil von ImmoNIQ Pro.`}
        </p>
      </div>
      <Button asChild>
        <Link to="/pricing">Pro freischalten — 9,90 €/Monat</Link>
      </Button>
      <p className="text-xs text-muted-foreground">
        Monatlich kündbar. 30 Tage Trial automatisch nach Registrierung.
      </p>
    </Card>
  );
};
