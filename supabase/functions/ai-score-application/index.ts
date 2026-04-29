import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { application_id } = await req.json();
    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("unauthorized", { status: 401, headers: corsHeaders });

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response("unauthorized", { status: 401, headers: corsHeaders });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: app } = await admin.from("applications")
      .select("*, listings(price, deposit, utilities, rooms, living_space, city)")
      .eq("id", application_id).maybeSingle();
    if (!app) return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: corsHeaders });
    if (app.owner_user_id !== user.id) return new Response("forbidden", { status: 403, headers: corsHeaders });

    const { data: seeker } = await admin.from("seeker_profiles").select("*").eq("user_id", app.seeker_user_id).maybeSingle();

    const userPrompt = `Bewerte diese Wohnungsbewerbung neutral und fair für den Vermieter.

INSERAT:
- Kaltmiete: ${app.listings?.price} €
- Nebenkosten: ${app.listings?.utilities ?? "?"} €
- Größe: ${app.listings?.living_space ?? "?"} m², ${app.listings?.rooms ?? "?"} Zi
- Stadt: ${app.listings?.city ?? "?"}

BEWERBER-PROFIL:
- Name: ${seeker?.full_name ?? "n/a"}
- Beschäftigung: ${seeker?.employment_type ?? "?"} bei ${seeker?.employer ?? "?"}
- Netto-Einkommen/Monat: ${seeker?.net_income_monthly ?? "?"} €
- Haushaltsgröße: ${seeker?.household_size ?? "?"}
- Schufa: ${seeker?.schufa_status ?? "ungeprüft"}
- Raucher: ${seeker?.smoker ? "ja" : "nein"} · Tiere: ${seeker?.has_pets ? "ja" : "nein"}
- Einzug ab: ${seeker?.move_in_from ?? "?"}
- Über mich: ${seeker?.about_me?.slice(0, 500) ?? "—"}

ANSCHREIBEN: ${app.cover_message?.slice(0, 600) ?? "—"}

Antworte STRIKT als JSON:
{
  "score": Zahl 0-100 (40er-Regel: Kaltmiete*3 ≤ Netto = +Punkte),
  "summary": "1 Satz Empfehlung",
  "strengths": ["max 3 Stichpunkte"],
  "concerns": ["max 3 Stichpunkte oder leeres Array"]
}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: userPrompt }],
        response_format: { type: "json_object" },
      }),
    });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: t }), { status: aiRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiData = await aiRes.json();
    const parsed = JSON.parse(aiData.choices?.[0]?.message?.content ?? "{}");

    await admin.from("applications").update({
      ai_score: parsed.score ?? null,
      ai_summary: parsed.summary ?? null,
      ai_strengths: parsed.strengths ?? null,
      ai_concerns: parsed.concerns ?? null,
      ai_scored_at: new Date().toISOString(),
    }).eq("id", application_id);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
