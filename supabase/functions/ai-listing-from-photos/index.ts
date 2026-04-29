import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { photo_urls, context } = await req.json();
    if (!Array.isArray(photo_urls) || photo_urls.length === 0) {
      return new Response(JSON.stringify({ error: "photo_urls required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const ctx = context ?? {};
    const userPrompt = `Erstelle ein deutsches Wohnungsinserat aus den Fotos.
Kontext: ${ctx.rooms ?? "?"} Zimmer, ${ctx.living_space ?? "?"} m², in ${ctx.city ?? "?"}, Baujahr ${ctx.build_year ?? "?"}.
Aktuelle Kaltmiete laut Eigentümer: ${ctx.cold_rent ?? "unbekannt"} €/Monat.

Antworte als JSON mit:
{
  "title": "max 60 Zeichen, prägnant",
  "description": "300-500 Wörter, professionell, Eigenschaften aus den Fotos hervorheben",
  "suggested_rent_cold": Zahl in EUR/Monat (realistisch für Deutschland 2026),
  "highlights": ["max 5 Stichpunkte"],
  "detected_features": { "balkon": bool, "ebk": bool, "parkett": bool, "fliesen": bool, "modernisiert": bool }
}`;

    const content: any[] = [{ type: "text", text: userPrompt }];
    for (const url of photo_urls.slice(0, 6)) {
      content.push({ type: "image_url", image_url: { url } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const data = await res.json();
    const txt = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(txt); } catch { parsed = { raw: txt }; }
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
