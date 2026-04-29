import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { tenant_name, property_name, amount_due, period, days_overdue, level } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const stage = level === 1 ? "Zahlungserinnerung (freundlich)"
      : level === 2 ? "1. Mahnung (bestimmt, mit Verzugszinsen-Hinweis)"
      : "2. Mahnung (letzte vor Räumungsklage, § 543 Abs. 2 BGB Hinweis)";

    const prompt = `Schreibe ein deutsches ${stage}-Schreiben.
Mieter: ${tenant_name}
Objekt: ${property_name}
Offener Betrag: ${amount_due} €
Zeitraum: ${period}
Tage überfällig: ${days_overdue}

Anforderungen:
- Höflich aber bestimmt, formelle Anrede
- Konkrete Zahlungsfrist (14 Tage)
- Bei Level 2/3: § 286 BGB Verzugszinsen erwähnen
- Bei Level 3: Hinweis auf § 543 Abs. 2 BGB (außerordentliche Kündigung bei 2 Monatsmieten Rückstand)
- Keine Beleidigungen, keine Drohungen außerhalb des Rechts
- Briefformat: Anrede, Body, Grußformel
- Antworte NUR den Brieftext, kein Kommentar.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await res.json();
    return new Response(JSON.stringify({ letter: data.choices?.[0]?.message?.content ?? "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
