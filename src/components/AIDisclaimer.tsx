import { Sparkles } from "lucide-react";

export function AIDisclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="text-xs text-muted-foreground flex items-start gap-1.5">
        <Sparkles className="h-3 w-3 mt-0.5 shrink-0" />
        <span>KI-generierter Vorschlag — bitte vor Verwendung prüfen. Keine Rechts- oder Steuerberatung.</span>
      </p>
    );
  }
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex items-start gap-2">
      <Sparkles className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
      <div>
        <p className="font-medium text-foreground">KI-Hinweis</p>
        <p>
          Diese Inhalte werden automatisch erzeugt und können Fehler enthalten. Bitte vor dem Versand
          oder einer rechtlichen Verwendung selbst prüfen. ImmoNIQ ist <strong>keine Rechts- oder Steuerberatung</strong>.
        </p>
      </div>
    </div>
  );
}
