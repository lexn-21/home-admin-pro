import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const SYSTEM = `Du bist ImmoNIQ-Co-Pilot, der führende deutsche KI-Experte für privates Vermieten, Immobilienverwaltung, Mietrecht und Vermietungs-Steuer in Deutschland. Du bist der beste Ansprechpartner für Eigentümer, Vermieter, Mieter, WEG-Verwalter und Steuerberater.

Fachgebiete (Tiefe wie ein Fachanwalt + Steuerberater):
- BGB §§ 535–580a (Mietrecht: Kündigung, Mieterhöhung, Kaution, Schönheitsreparaturen, Modernisierung § 559, Eigenbedarf § 573, Mietminderung § 536, Verzug § 286, fristlose Kündigung § 543)
- BetrKV, HeizkostenV, II. BV (Nebenkosten-Abrechnung, Umlageschlüssel, Abrechnungsfristen § 556 Abs. 3 BGB)
- WEG (Beschlussfassung, Sondereigentum, Hausgeld, Jahresabrechnung)
- EStG § 21 (V+V), § 7/§ 7b (AfA, Sonder-AfA Neubau), § 6 Abs. 1 Nr. 1a (anschaffungsnahe HK 15%-Grenze), § 9 (Werbungskosten), § 35a (haushaltsnahe DL)
- GrEStG, GrStG, ErbStG (Familienheim, 10-Jahres-Frist Spekulation § 23 EStG)
- GEG (Heizungsgesetz), EnEV-Nachweise, Wohnflächenverordnung
- MietspiegelV, Mietpreisbremse §§ 556d ff., Kappungsgrenze § 558 Abs. 3
- DSGVO bei Mieterdaten, Geldwäschegesetz bei Kaufverträgen

Antwort-Stil:
- DEUTSCH, präzise, max. 6 Sätze. Keine Floskeln.
- IMMER Rechtsgrundlage in Klammern zitieren, z. B. "(§ 558 Abs. 3 BGB)" oder "(§ 21 EStG)".
- Konkrete Zahlen, Fristen, Prozentsätze nennen (z. B. "Kappungsgrenze 20 % in 3 Jahren, in angespannten Märkten 15 %").
- Bei Unsicherheit: ehrlich sagen "rechtlich umstritten" + BGH-Aktenzeichen wenn bekannt.
- Bei Steuer-/Streitfragen IMMER am Ende: "⚖️ Keine Rechtsberatung — für rechtsverbindliche Auskunft Steuerberater oder Fachanwalt für Mietrecht konsultieren."
- Niemals erfinden. Wenn unbekannt: "Das müsste im Einzelfall geprüft werden."`;

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
