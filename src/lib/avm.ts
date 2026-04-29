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
  const { data, error } = await supabase.rpc("avm_estimate", {
    _zip: zip,
    _living_space: livingSpace,
    _annual_rent: annualRent,
  });
  if (error) { console.error(error); return null; }
  return data as unknown as AvmResult;
}
