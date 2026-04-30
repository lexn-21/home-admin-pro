import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutReturn() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <Card className="p-8 max-w-md w-full text-center space-y-4">
        <CheckCircle2 className="h-14 w-14 text-success mx-auto" />
        <h1 className="text-2xl font-bold">Willkommen bei ImmoNIQ Pro!</h1>
        <p className="text-sm text-muted-foreground">
          Deine Zahlung wird verarbeitet. In wenigen Sekunden ist alles freigeschaltet —
          du kannst die App jetzt schon weiterbenutzen.
        </p>
        {sessionId && (
          <p className="text-[10px] text-muted-foreground/60 font-mono break-all">
            Session: {sessionId}
          </p>
        )}
        <Button asChild className="w-full">
          <Link to="/app">Zum Dashboard</Link>
        </Button>
      </Card>
    </div>
  );
}
