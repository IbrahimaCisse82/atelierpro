import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { OrdersPage } from "@/pages/OrdersPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { StocksPage } from "@/pages/StocksPage";
import { InvoicesPage } from "@/pages/InvoicesPage";
import { MeasurementsPage } from "./pages/MeasurementsPage";
import { PatternsPage } from "./pages/PatternsPage";
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";

const queryClient = new QueryClient();

// Composant pour protéger les routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Composant principal de l'application
function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AuthLayout />;
  }

  return (
    <Router>
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<RoleSpecificDashboard />} />
          <Route path="/dashboard/orders" element={<OrdersPage />} />
          <Route path="/dashboard/clients" element={<ClientsPage />} />
          <Route path="/dashboard/production" element={<div>Page Production (en développement)</div>} />
          <Route path="/dashboard/stocks" element={<StocksPage />} />
          <Route path="/dashboard/purchases" element={<div>Page Achats (en développement)</div>} />
          <Route path="/dashboard/patterns" element={<PatternsPage />} />
          <Route path="/dashboard/measurements" element={<MeasurementsPage />} />
          <Route path="/dashboard/invoices" element={<InvoicesPage />} />
          <Route path="/dashboard/hr" element={<div>Page RH (en développement)</div>} />
          <Route path="/dashboard/finances" element={<div>Page Finances (en développement)</div>} />
          <Route path="/dashboard/settings" element={<div>Page Paramètres (en développement)</div>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </Router>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
