import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/app/Dashboard";
import Properties from "./pages/app/Properties";
import PropertyDetail from "./pages/app/PropertyDetail";
import Tenants from "./pages/app/Tenants";
import Payments from "./pages/app/Payments";
import Expenses from "./pages/app/Expenses";
import TaxBridge from "./pages/app/TaxBridge";
import Dunning from "./pages/app/Dunning";
import Settings from "./pages/app/Settings";
import Onboarding from "./pages/app/Onboarding";
import Advisor from "./pages/app/Advisor";
import Vault from "./pages/app/Vault";
import Marketplace from "./pages/app/Marketplace";
import Deadlines from "./pages/app/Deadlines";
import LawCorner from "./pages/app/LawCorner";
import AdvisorView from "./pages/AdvisorView";
import AppLayout from "./pages/app/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/advisor/:token" element={<AdvisorView />} />
          <Route
            path="/app/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="properties/:id" element={<PropertyDetail />} />
            <Route path="tenants" element={<Tenants />} />
            <Route path="payments" element={<Payments />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="dunning" element={<Dunning />} />
            <Route path="tax" element={<TaxBridge />} />
            <Route path="advisor" element={<Advisor />} />
            <Route path="vault" element={<Vault />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="deadlines" element={<Deadlines />} />
            <Route path="law" element={<LawCorner />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
