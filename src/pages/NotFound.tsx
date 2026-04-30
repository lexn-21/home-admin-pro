import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404:", location.pathname);
    document.title = "404 — Seite nicht gefunden | ImmonIQ";
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background px-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-black bg-gradient-to-br from-primary to-primary/40 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold mb-2">Diese Seite gibt's nicht</h1>
        <p className="text-muted-foreground mb-6">
          Vielleicht wurde sie verschoben, oder du hast dich vertippt. Kein Stress.
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="h-4 w-4 mr-2" /> Zur Startseite
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/markt">
              <Search className="h-4 w-4 mr-2" /> Markt durchsuchen
            </Link>
          </Button>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Zurück
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
