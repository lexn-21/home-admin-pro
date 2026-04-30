import { supabase } from "@/integrations/supabase/client";

export type AvmResult = {
  zip: string;
  value_sqm_method: number;
  value_income_method: number;
  value_blended: number;
  avg_purchase_sqm: number | null;
  avg_rent_sqm: number | null;
  yield_factor: number | null;
};

export async function estimateValue(zip: string, livingSpace: number, annualRent: number): Promise<AvmResult | null> {
  const call = supabase.rpc("avm_estimate", {
    _zip: zip,
    _living_space: livingSpace,
    _annual_rent: annualRent,
  });
  // 15s Timeout
  const timeout = new Promise<{ data: null; error: Error }>((resolve) =>
    setTimeout(() => resolve({ data: null, error: new Error("Server reagiert nicht. Bitte erneut versuchen.") }), 15000),
  );
  const { data, error } = (await Promise.race([call, timeout])) as any;
  if (error) { console.error(error); throw error; }
  return data as unknown as AvmResult;
}
