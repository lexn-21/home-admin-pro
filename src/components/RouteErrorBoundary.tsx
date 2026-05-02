import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Fängt Render- und Chunk-Load-Fehler ab. Bei Chunk-Load-Fehlern
 * (typisch auf Mobile/instabilem Netz nach einem Deploy) wird die Seite
 * einmalig neu geladen, statt einen leeren Bildschirm zu zeigen.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    const msg = String(error?.message || "");
    const isChunkError =
      /Loading chunk [\d]+ failed/i.test(msg) ||
      /Failed to fetch dynamically imported module/i.test(msg) ||
      /error loading dynamically imported module/i.test(msg) ||
      /ChunkLoadError/i.test(msg) ||
      error?.name === "ChunkLoadError";

    if (isChunkError) {
      const key = "__chunk_reload__";
      const last = Number(sessionStorage.getItem(key) || 0);
      // Verhindert Reload-Loops: max. 1× alle 30 s
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(key, String(Date.now()));
        window.location.reload();
      }
    }
    // eslint-disable-next-line no-console
    console.error("[RouteErrorBoundary]", error);
  }

  handleRetry = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              Seite konnte nicht geladen werden
            </h1>
            <p className="text-muted-foreground text-sm">
              Das passiert manchmal auf wackeligem Mobilfunk oder direkt nach
              einem Update. Lade die Seite neu, um es erneut zu versuchen.
            </p>
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Neu laden
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
