import { isPaymentsConfigured } from "@/lib/stripe";

export const PaymentTestModeBanner = () => {
  const token = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
  if (!isPaymentsConfigured() || !token?.startsWith("pk_test_")) return null;

  return (
    <div className="w-full bg-amber-100 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-800 px-4 py-1.5 text-center text-xs text-amber-900 dark:text-amber-200">
      🧪 Testmodus — keine echten Zahlungen. Karte: <code className="font-mono">4242 4242 4242 4242</code>
    </div>
  );
};
