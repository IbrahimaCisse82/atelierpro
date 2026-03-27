import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";
import { UserProfile } from "./components/dashboard/UserProfile";
import { LoadingPage } from "@/components/ui/loading";
import { useRealtimeAlerts } from "@/hooks/use-realtime-alerts";
import { lazy, Suspense } from 'react';

// Configuration optimisée de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Lazy loading des pages
const DashboardContent = lazy(() => import('./components/dashboard/DashboardContent').then(module => ({ default: module.DashboardContent })));
const ClientsPage = lazy(() => import('./pages/ClientsPage').then(module => ({ default: module.ClientsPage })));
const FinancesPage = lazy(() => import('./pages/FinancesPage').then(module => ({ default: module.FinancesPage })));
const HRPage = lazy(() => import('./pages/HRPage').then(module => ({ default: module.HRPage })));
const RemunerationPage = lazy(() => import('./pages/RemunerationPage').then(module => ({ default: module.RemunerationPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const ProductionPage = lazy(() => import('./pages/ProductionPage').then(module => ({ default: module.ProductionPage })));
const StocksPage = lazy(() => import('./pages/StocksPage').then(module => ({ default: module.StocksPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const ReceptionsPage = lazy(() => import('./pages/ReceptionsPage'));
const FixedAssetsPage = lazy(() => import('./pages/FixedAssetsPage'));
const TreasuryPage = lazy(() => import('./pages/TreasuryPage'));
const CustomerInvoicesDetailPage = lazy(() => import('./pages/CustomerInvoicesDetailPage'));
const PatternsPage = lazy(() => import('./pages/PatternsPage').then(module => ({ default: module.PatternsPage })));
const MeasurementsPage = lazy(() => import('./pages/MeasurementsPage').then(module => ({ default: module.MeasurementsPage })));
const InvoicesPage = lazy(() => import('./pages/InvoicesPage').then(module => ({ default: module.InvoicesPage })));
const PurchasesPage = lazy(() => import('./pages/PurchasesPage').then(module => ({ default: module.PurchasesPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then(module => ({ default: module.ReportsPage })));
const FinancialReportsPage = lazy(() => import('./pages/FinancialReportsPage').then(module => ({ default: module.FinancialReportsPage })));
const BankReconciliationPage = lazy(() => import('./pages/BankReconciliationPage').then(module => ({ default: module.BankReconciliationPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const SyscohadaSettingsPage = lazy(() => import('./pages/SyscohadaSettingsPage').then(module => ({ default: module.SyscohadaSettingsPage })));
const AlertsPage = lazy(() => import('./pages/AlertsPage').then(module => ({ default: module.AlertsPage })));
const AuditTrailPage = lazy(() => import('./pages/AuditTrailPage').then(module => ({ default: module.AuditTrailPage })));
const AdvancedExportPage = lazy(() => import('./pages/AdvancedExportPage').then(module => ({ default: module.AdvancedExportPage })));
const AppsStorePage = lazy(() => import('./pages/AppsStorePage').then(module => ({ default: module.AppsStorePage })));
const InstallPage = lazy(() => import('./pages/InstallPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));

// Composant principal de l'application
function AppContent() {
  const { user, loading } = useAuth();
  useRealtimeAlerts();

  // While loading auth, show public routes (login, register, etc.) instead of blocking
  if (!user) {
    return (
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={loading ? <LoadingPage /> : <LandingPage />} />
          <Route path="/login" element={loading ? <LoadingPage /> : <AuthLayout />} />
          <Route path="/register" element={loading ? <LoadingPage /> : <AuthLayout />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <SidebarProvider>
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<DashboardLayout><RoleSpecificDashboard /></DashboardLayout>} />
          <Route path="/dashboard" element={<DashboardLayout><RoleSpecificDashboard /></DashboardLayout>} />
          <Route path="/dashboard/orders" element={<DashboardLayout><OrdersPage /></DashboardLayout>} />
          <Route path="/dashboard/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
          <Route path="/dashboard/production" element={<DashboardLayout><ProductionPage /></DashboardLayout>} />
          <Route path="/dashboard/stocks" element={<DashboardLayout><StocksPage /></DashboardLayout>} />
          <Route path="/dashboard/purchases" element={<DashboardLayout><PurchasesPage /></DashboardLayout>} />
          <Route path="/dashboard/suppliers" element={<DashboardLayout><SuppliersPage /></DashboardLayout>} />
          <Route path="/dashboard/receptions" element={<DashboardLayout><ReceptionsPage /></DashboardLayout>} />
          <Route path="/dashboard/patterns" element={<DashboardLayout><PatternsPage /></DashboardLayout>} />
          <Route path="/dashboard/measurements" element={<DashboardLayout><MeasurementsPage /></DashboardLayout>} />
          <Route path="/dashboard/invoices" element={<DashboardLayout><InvoicesPage /></DashboardLayout>} />
          <Route path="/dashboard/customer-invoices" element={<DashboardLayout><CustomerInvoicesDetailPage /></DashboardLayout>} />
          <Route path="/dashboard/fixed-assets" element={<DashboardLayout><FixedAssetsPage /></DashboardLayout>} />
          <Route path="/dashboard/treasury" element={<DashboardLayout><TreasuryPage /></DashboardLayout>} />
          <Route path="/dashboard/profile" element={<DashboardLayout><UserProfile /></DashboardLayout>} />
          <Route path="/dashboard/hr" element={<DashboardLayout><HRPage /></DashboardLayout>} />
          <Route path="/dashboard/remunerations" element={<DashboardLayout><RemunerationPage /></DashboardLayout>} />
          <Route path="/dashboard/finances" element={<DashboardLayout><FinancesPage /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/dashboard/syscohada" element={<DashboardLayout><SyscohadaSettingsPage /></DashboardLayout>} />
          <Route path="/dashboard/reports" element={<DashboardLayout><ReportsPage /></DashboardLayout>} />
          <Route path="/dashboard/financial-reports" element={<DashboardLayout><FinancialReportsPage /></DashboardLayout>} />
          <Route path="/dashboard/bank-reconciliation" element={<DashboardLayout><BankReconciliationPage /></DashboardLayout>} />
          <Route path="/dashboard/alerts" element={<DashboardLayout><AlertsPage /></DashboardLayout>} />
          <Route path="/dashboard/audit" element={<DashboardLayout><AuditTrailPage /></DashboardLayout>} />
          <Route path="/dashboard/export" element={<DashboardLayout><AdvancedExportPage /></DashboardLayout>} />
          <Route path="/dashboard/apps" element={<DashboardLayout><AppsStorePage /></DashboardLayout>} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </SidebarProvider>
  );
}

// Composant racine avec tous les providers — QueryClientProvider au niveau racine
function App() {
  const future = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router future={future}>
          <ScrollToTop />
          <AuthProvider>
            <TooltipProvider>
              <AppContent />
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
