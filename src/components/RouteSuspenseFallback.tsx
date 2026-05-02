/**
 * Schlanker Fallback während Lazy-Routes geladen werden.
 * Bewusst minimal, damit auf Mobile keine zusätzlichen Layout-Shifts entstehen.
 */
export function RouteSuspenseFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="Seite wird geladen"
    >
      <div className="h-8 w-8 rounded-full border-2 border-muted border-t-primary animate-spin" />
    </div>
  );
}
