import { supabase } from "@/integrations/supabase/client";

export type ActivityKind =
  | "tax_saved"
  | "receipts_added"
  | "nka_done"
  | "listing_published"
  | "tenant_added"
  | "milestone"
  | "tip";

/**
 * Records an activity for the current user — bumps streak/level/points
 * and optionally creates an anonymous community win.
 *
 * Fire-and-forget. Errors are silently swallowed (we never block UX for gamification).
 */
export async function recordActivity(
  kind: ActivityKind,
  opts: { amount?: number; message?: string; zip?: string; city?: string } = {}
) {
  try {
    await supabase.rpc("record_user_activity", {
      _kind: kind,
      _amount: opts.amount ?? null,
      _message: opts.message ?? null,
      _zip: opts.zip ?? null,
      _city: opts.city ?? null,
    });
  } catch {
    // ignore — gamification must never break user flow
  }
}
