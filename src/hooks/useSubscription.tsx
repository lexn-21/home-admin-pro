import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";

export type SubscriptionRow = {
  id: string;
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
};

export type PlanState = {
  loading: boolean;
  isPro: boolean;       // hat Pro-Zugriff (Abo ODER Trial)
  isTrial: boolean;     // ist im 30-Tage-Trial-Fenster
  trialDaysLeft: number;
  hasActiveSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string | null;
  subscription: SubscriptionRow | null;
};

export const useSubscription = (): PlanState => {
  const { user } = useAuth();
  const [state, setState] = useState<PlanState>({
    loading: true,
    isPro: false,
    isTrial: false,
    trialDaysLeft: 0,
    hasActiveSubscription: false,
    cancelAtPeriodEnd: false,
    periodEnd: null,
    subscription: null,
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const load = async () => {
      const env = getStripeEnvironment();

      const [{ data: sub }, { data: trialDays }, { data: hasPro }] = await Promise.all([
        supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("environment", env)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.rpc("trial_days_left", { _user_id: user.id }),
        supabase.rpc("has_pro_access", { _user_id: user.id, _env: env }),
      ]);

      const days = (trialDays as number | null) ?? 0;
      const active = !!sub && (
        (["active", "trialing", "past_due"].includes(sub.status) &&
          (!sub.current_period_end || new Date(sub.current_period_end) > new Date())) ||
        (sub.status === "canceled" && sub.current_period_end && new Date(sub.current_period_end) > new Date())
      );

      setState({
        loading: false,
        isPro: !!hasPro,
        isTrial: days > 0 && !active,
        trialDaysLeft: days,
        hasActiveSubscription: active,
        cancelAtPeriodEnd: sub?.cancel_at_period_end ?? false,
        periodEnd: sub?.current_period_end ?? null,
        subscription: (sub as SubscriptionRow | null) ?? null,
      });
    };

    load();

    const channel = supabase
      .channel(`sub-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return state;
};
