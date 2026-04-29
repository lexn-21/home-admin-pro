import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, FileText, AlertCircle } from "lucide-react";

interface Template {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  source: string | null;
  url: string | null;
  format: string | null;
  is_free: boolean;
}

export default function Templates() {
  const [items, setItems] = useState<Template[]>([]);

  useEffect(() => {
    supabase.from("contract_templates").select("*").order("sort_order").then(({ data }) => {
      setItems((data as Template[]) || []);
    });
  }, []);

  const grouped = items.reduce<Record<string, Template[]>>((acc, t) => {
    const k = t.category || "Sonstige";
    (acc[k] = acc[k] || []).push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Vertragsvorlagen</h1>
        <p className="text-muted-foreground mt-1">Geprüfte Vorlagen direkt von vertrauenswürdigen Quellen.</p>
      </div>

      <div className="rounded-xl border border-border/60 bg-muted/40 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-muted-foreground">
          Wir verlinken zu geprüften Quellen wie <strong className="text-foreground">Haus &amp; Grund</strong> und{" "}
          <strong className="text-foreground">Mieterbund</strong> statt eigene Vorlagen zu generieren — wegen
          BGH-Updates und Haftungsrisiko. So bleiben deine Verträge immer aktuell und rechtssicher.
        </div>
      </div>

      {Object.entries(grouped).map(([cat, list]) => (
        <div key={cat} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {list.map(t => (
              <Card key={t.id} className="glass hover:border-primary/40 transition">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{t.title}</p>
                      {t.description && <p className="text-sm text-muted-foreground mt-1">{t.description}</p>}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {t.source && <Badge variant="secondary">{t.source}</Badge>}
                        {t.format && <Badge variant="outline">{t.format}</Badge>}
                        <Badge className={t.is_free ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" : "bg-amber-500/15 text-amber-600 border-amber-500/30"}>
                          {t.is_free ? "Kostenlos" : "Kostenpflichtig"}
                        </Badge>
                      </div>
                      {t.url && (
                        <a href={t.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3">
                          Öffnen <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
