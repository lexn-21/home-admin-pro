import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Scale, ArrowRight, Sparkles } from "lucide-react";

type Update = {
  id: string;
  summary: string;
  impact: string | null;
  detected_at: string;
  legal_sources: { paragraph: string; title: string; url: string } | null;
};

export const LegalUpdatesWidget = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("legal_updates")
        .select("id,summary,impact,detected_at,legal_sources(paragraph,title,url)")
        .order("detected_at", { ascending: false })
        .limit(3);
      setUpdates((data || []) as any);
      setLoading(false);
    })();
  }, []);

  if (loading || updates.length === 0) return null;

  return (
    <Card className="p-4 glass">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary flex items-center gap-1.5">
          <Scale className="h-3 w-3" /> Rechts-Updates
          <Sparkles className="h-3 w-3 ml-0.5 text-amber-500" />
        </p>
        <Link to="/app/law-corner" className="text-xs text-primary hover:underline flex items-center gap-1">
          Alle <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {updates.map(u => (
          <a
            key={u.id}
            href={u.legal_sources?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <p className="text-[10px] font-medium text-primary mb-0.5">
              {u.legal_sources?.paragraph}
            </p>
            <p className="text-xs font-medium leading-snug mb-1">{u.summary}</p>
            {u.impact && (
              <p className="text-[11px] text-muted-foreground leading-snug">{u.impact}</p>
            )}
          </a>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Wöchentlich automatisch aktualisiert · keine Rechtsberatung
      </p>
    </Card>
  );
};
