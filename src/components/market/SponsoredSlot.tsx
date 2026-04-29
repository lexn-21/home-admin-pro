import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Sparkles, ExternalLink } from "lucide-react";

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
  placement: "market_grid" | "market_top" | "listing_detail" | "listing_sidebar";
  zip?: string | null;
  city?: string | null;
  kind?: "rent" | "sale" | null;
  contextListingId?: string | null;
  limit?: number;
  variant?: "card" | "banner" | "compact";
};

export const SponsoredSlot = ({
  placement,
  zip,
  city,
  kind,
  contextListingId,
  limit = 1,
  variant = "card",
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

  if (variant === "banner") {
    const ad = ads[0];
    return (
      <a
        href={ad.click_url}
        target={ad.click_url.startsWith("/") ? "_self" : "_blank"}
        rel="noreferrer sponsored"
        onClick={() => handleClick(ad)}
        className="block"
      >
        <Card className="p-4 glass border-primary/30 bg-gradient-to-r from-primary/10 via-transparent to-transparent hover:shadow-gold transition flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-gold flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold truncate">{ad.title}</p>
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                Anzeige
              </span>
            </div>
            {ad.subtitle && <p className="text-xs text-muted-foreground truncate">{ad.subtitle}</p>}
          </div>
          <span className="text-xs font-medium text-primary flex items-center gap-1 shrink-0">
            {ad.cta_label ?? "Mehr"} <ExternalLink className="h-3 w-3" />
          </span>
        </Card>
      </a>
    );
  }

  return (
    <>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.click_url}
          target={ad.click_url.startsWith("/") ? "_self" : "_blank"}
          rel="noreferrer sponsored"
          onClick={() => handleClick(ad)}
        >
          <Card className="overflow-hidden glass border-primary/30 hover:shadow-gold transition group h-full flex flex-col">
            <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/5 to-background relative flex items-center justify-center">
              {ad.image_url ? (
                <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
              ) : (
                <Sparkles className="h-10 w-10 text-primary/60" />
              )}
              <span className="absolute top-2 left-2 text-[10px] uppercase tracking-wide bg-background/80 backdrop-blur px-2 py-0.5 rounded">
                Anzeige
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-semibold leading-tight line-clamp-2">{ad.title}</h3>
              {ad.subtitle && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ad.subtitle}</p>}
              <div className="mt-auto pt-3 flex items-center justify-between text-xs">
                {ad.sponsor_name && <span className="text-muted-foreground truncate">{ad.sponsor_name}</span>}
                <span className="font-medium text-primary flex items-center gap-1 shrink-0">
                  {ad.cta_label ?? "Mehr"} <ExternalLink className="h-3 w-3" />
                </span>
              </div>
            </div>
          </Card>
        </a>
      ))}
    </>
  );
};
