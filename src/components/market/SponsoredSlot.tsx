import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ExternalLink, Info } from "lucide-react";

type Ad = {
  id: string;
  title: string;
  subtitle: string | null;
  sponsor_name: string | null;
  image_url: string | null;
  click_url: string;
  cta_label: string | null;
};

type Props = {
  placement: "market_grid" | "market_top" | "listing_detail" | "listing_sidebar" | "marketplace_category";
  zip?: string | null;
  city?: string | null;
  kind?: "rent" | "sale" | null;
  contextListingId?: string | null;
  limit?: number;
};

/**
 * Honest Sponsored Slot
 * - Immer als „Anzeige" gelabelt
 * - Dezent (kein Sparkle-Bling, keine Gold-Aura)
 * - Nur Banner-Variante — wir mischen Anzeigen NICHT mehr in organische Grids
 * - Klick & Impression werden getrackt (intern, für Qualitätskontrolle)
 */
export const SponsoredSlot = ({
  placement,
  zip,
  city,
  kind,
  contextListingId,
  limit = 1,
}: Props) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const tracked = useRef<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("ad_slots_for", {
        _placement: placement,
        _zip: zip ?? null,
        _city: city ?? null,
        _kind: kind ?? null,
        _limit: limit,
      });
      setAds((data as Ad[]) ?? []);
    })();
  }, [placement, zip, city, kind, limit]);

  useEffect(() => {
    ads.forEach((ad) => {
      if (tracked.current.has(ad.id)) return;
      tracked.current.add(ad.id);
      supabase.from("ad_events").insert({
        ad_id: ad.id,
        event_type: "impression",
        context_listing_id: contextListingId ?? null,
        context_zip: zip ?? null,
        context_city: city ?? null,
      });
    });
  }, [ads, contextListingId, zip, city]);

  const handleClick = (ad: Ad) => {
    supabase.from("ad_events").insert({
      ad_id: ad.id,
      event_type: "click",
      context_listing_id: contextListingId ?? null,
      context_zip: zip ?? null,
      context_city: city ?? null,
    });
  };

  if (!ads.length) return null;

  return (
    <div className="space-y-2">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.click_url}
          target={ad.click_url.startsWith("/") ? "_self" : "_blank"}
          rel="noreferrer sponsored nofollow"
          onClick={() => handleClick(ad)}
          className="block group"
        >
          <Card className="p-3 border border-dashed border-border/70 bg-muted/20 hover:bg-muted/40 transition flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium text-sm truncate">{ad.title}</p>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                  Anzeige
                </span>
                {ad.sponsor_name && (
                  <span className="text-[11px] text-muted-foreground truncate">· {ad.sponsor_name}</span>
                )}
              </div>
              {ad.subtitle && (
                <p className="text-xs text-muted-foreground truncate">{ad.subtitle}</p>
              )}
            </div>
            <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground flex items-center gap-1 shrink-0">
              {ad.cta_label ?? "Ansehen"} <ExternalLink className="h-3 w-3" />
            </span>
          </Card>
        </a>
      ))}
    </div>
  );
};
