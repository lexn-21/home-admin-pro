import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SYSTEM = `Du bist ImmoNIQ-Co-Pilot, ein deutscher Experte für privates Vermieten in Deutschland.
Du kennst BGB (§§ 535-580a), EStG (§ 21, § 7, § 7b, § 6 Abs. 1 Nr. 1a), HeizkostenV, BetrKV, GEG.
Antworte präzise, freundlich, in DEUTSCH. Zitiere immer die Rechtsgrundlage in Klammern.
Bei steuerrechtlichen Themen erinnere am Ende: "Für rechtsverbindliche Auskunft Steuerberater konsultieren."
Maximal 6 Sätze. Keine Floskeln. Konkrete Zahlen und Paragraphen.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: SYSTEM }, ...messages],
        stream: true,
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit. Bitte kurz warten." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "AI-Kontingent aufgebraucht." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
