// Shared helper: AI quota + auth for AI edge functions.
import { createClient } from "npm:@supabase/supabase-js@2";

export type AiQuotaResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string };

/**
 * Validates the caller JWT and enforces a daily AI call quota per function.
 * Returns either the userId (on success) or a Response-shaped error object.
 *
 * Limits (set in DB function `check_ai_quota`):
 *   - free: 3 / 24h / function
 *   - verwalten_plus: 50 / 24h / function
 *   - pro: 500 / 24h / function
 */
export async function enforceAiQuota(req: Request, functionName: string): Promise<AiQuotaResult> {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, status: 401, error: "Bitte einloggen." };

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: userData, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !userData?.user) {
    return { ok: false, status: 401, error: "Ungültige Sitzung." };
  }
  const userId = userData.user.id;

  const { error: qErr } = await sb.rpc("check_ai_quota", {
    _user_id: userId,
    _function: functionName,
  });
  if (qErr) {
    const msg = qErr.message || "Tageslimit erreicht.";
    if (msg.includes("KI-Tageslimit")) {
      return { ok: false, status: 429, error: msg + " Mit ImmoNIQ Pro hast du 500 Calls pro Tag." };
    }
    return { ok: false, status: 500, error: msg };
  }
  return { ok: true, userId };
}
