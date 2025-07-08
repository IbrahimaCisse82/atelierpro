import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";
import { UserProfile } from "./components/dashboard/UserProfile";
import { LoadingPage } from "@/components/ui/loading";
import { OrdersPage } from "@/pages/OrdersPage";
import { ClientsPage } from "@/pages/ClientsPage";
import { StocksPage } from "@/pages/StocksPage";
import { InvoicesPage } from "@/pages/InvoicesPage";
import { MeasurementsPage } from "./pages/MeasurementsPage";
import { PatternsPage } from "./pages/PatternsPage";
import { ProductionPage } from "./pages/ProductionPage";
import { PurchasesPage } from "./pages/PurchasesPage";
import { HRPage } from "./pages/HRPage";
import { FinancesPage } from "./pages/FinancesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AuditTrailPage } from "@/pages/AuditTrailPage";
import { AlertsPage } from "@/pages/AlertsPage";
import { AdvancedExportPage } from "@/pages/AdvancedExportPage";
import { SuppliersPage } from "@/pages/SuppliersPage";

const queryClient = new QueryClient();

// Composant pour protéger les routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Composant principal de l'application
function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <AuthLayout />;
  }

  return (
    <SidebarProvider>
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<RoleSpecificDashboard />} />
          <Route path="/dashboard/orders" element={<OrdersPage />} />
          <Route path="/dashboard/clients" element={<ClientsPage />} />
          <Route path="/dashboard/production" element={<ProductionPage />} />
          <Route path="/dashboard/stocks" element={<StocksPage />} />
          <Route path="/dashboard/purchases" element={<PurchasesPage />} />
          <Route path="/dashboard/patterns" element={<PatternsPage />} />
          <Route path="/dashboard/measurements" element={<MeasurementsPage />} />
          <Route path="/dashboard/invoices" element={<InvoicesPage />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
          <Route path="/dashboard/hr" element={<HRPage />} />
          <Route path="/dashboard/finances" element={<FinancesPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/audit" element={<AuditTrailPage />} />
          <Route path="/dashboard/alerts" element={<AlertsPage />} />
          <Route path="/dashboard/export" element={<AdvancedExportPage />} />
          <Route path="/dashboard/suppliers" element={<SuppliersPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Router>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppContent />
          <AuthDebug />
        </TooltipProvider>
      </Router>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;