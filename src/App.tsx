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
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";
import { UserProfile } from "./components/dashboard/UserProfile";
import { LoadingPage } from "@/components/ui/loading";
import { lazy, Suspense } from 'react';

const queryClient = new QueryClient();

// Lazy loading des pages volumineuses
const DashboardContent = lazy(() => import('./components/dashboard/DashboardContent').then(module => ({ default: module.DashboardContent })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(module => ({ default: module.ClientsPage })));
const FinancesPage = lazy(() => import('./pages/FinancesPage').then(module => ({ default: module.FinancesPage })));
const HRPage = lazy(() => import('./pages/HRPage').then(module => ({ default: module.HRPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const ProductionPage = lazy(() => import('./pages/ProductionPage').then(module => ({ default: module.ProductionPage })));
const StocksPage = lazy(() => import('./pages/StocksPage').then(module => ({ default: module.StocksPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then(module => ({ default: module.SuppliersPage })));
const PatternsPage = lazy(() => import('./pages/PatternsPage').then(module => ({ default: module.PatternsPage })));
const MeasurementsPage = lazy(() => import('./pages/MeasurementsPage').then(module => ({ default: module.MeasurementsPage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then(module => ({ default: module.InvoicesPage })));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage').then(module => ({ default: module.PurchasesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(module => ({ default: module.AlertsPage })));
const AuditTrailPage = lazy(() => import('./pages/AuditTrailPage').then(module => ({ default: module.AuditTrailPage })));
const AdvancedExportPage = lazy(() => import('./pages/AdvancedExportPage').then(module => ({ default: module.AdvancedExportPage })));

// Pages légères importées normalement
// import { Index } from './pages/Index';
// import { NotFound } from './pages/NotFound';

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
        <Suspense fallback={<LoadingPage />}>
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
        </Suspense>
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