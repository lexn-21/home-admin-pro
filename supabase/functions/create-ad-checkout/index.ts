import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const PRICE_PER_WEEK_CENTS = 4900;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing auth");
    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: userRes } = await supabase.auth.getUser(token);
    const user = userRes?.user;
    if (!user) throw new Error("Unauthorized");

    const body = await req.json();
    const { adSlotId, weeks, returnUrl, environment } = body as {
      adSlotId: string;
      weeks: number;
      returnUrl: string;
      environment: StripeEnv;
    };

    if (!adSlotId) throw new Error("Missing adSlotId");
    const w = Math.max(1, Math.min(52, Number(weeks) || 1));
    if (!returnUrl) throw new Error("Missing returnUrl");
    if (environment !== "sandbox" && environment !== "live") throw new Error("Invalid environment");

    // Slot prüfen: gehört dem User, ist approved oder pending
    const { data: slot, error: slotErr } = await supabase
      .from("ad_slots")
      .select("id, advertiser_user_id, title, moderation_status")
      .eq("id", adSlotId)
      .single();
    if (slotErr || !slot) throw new Error("Slot not found");
    if (slot.advertiser_user_id !== user.id) throw new Error("Not your slot");

    const totalCents = PRICE_PER_WEEK_CENTS * w;
    const stripe = createStripeClient(environment);

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: `ImmoNIQ Werbeplatz – ${w} Woche${w > 1 ? "n" : ""}: ${slot.title}` },
          unit_amount: totalCents,
        },
        quantity: 1,
      }],
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      managed_payments: { enabled: true } as any,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        adSlotId,
        weeks: String(w),
        type: "ad_order",
      },
    });

    // Order anlegen (pending)
    await supabase.from("ad_orders").insert({
      user_id: user.id,
      ad_slot_id: adSlotId,
      stripe_session_id: session.id,
      status: "pending",
      amount_cents: totalCents,
      currency: "eur",
      duration_days: w * 7,
      environment,
    });

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-ad-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
