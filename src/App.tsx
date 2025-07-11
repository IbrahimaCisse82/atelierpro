import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { PerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";
import { UserProfile } from "./components/dashboard/UserProfile";
import { LoadingPage } from "@/components/ui/loading";
import { lazy, Suspense } from 'react';

// Configuration optimisée de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garder en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry automatique en cas d'échec
      retry: (failureCount, error: any) => {
        // Ne pas retry sur les erreurs 4xx (sauf 408, 429)
        if (error?.status >= 400 && error?.status < 500 && ![408, 429].includes(error?.status)) {
          return false;
        }
        // Max 3 retries avec backoff exponentiel
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automatique quand la fenêtre redevient active
      refetchOnWindowFocus: true,
      // Refetch automatique quand la connexion revient
      refetchOnReconnect: true,
      // Timeout de 10 secondes
      networkMode: 'online',
    },
    mutations: {
      // Retry les mutations en cas d'échec réseau
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

// Lazy loading des pages volumineuses avec prefetch
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
      <QueryClientProvider client={queryClient}>
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
            <Route path="/dashboard/suppliers" element={<SuppliersPage />} />
            <Route path="/dashboard/reports" element={<ReportsPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
            <Route path="/dashboard/alerts" element={<AlertsPage />} />
            <Route path="/dashboard/audit" element={<AuditTrailPage />} />
            <Route path="/dashboard/export" element={<AdvancedExportPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        
        {/* Devtools React Query en développement */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        
        {/* Moniteur de performance */}
        <PerformanceMonitor />
      </QueryClientProvider>
    </SidebarProvider>
  );
}

// Composant racine avec tous les providers
function App() {
  return (
    <Router>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
          <Sonner />
          {import.meta.env.DEV && <AuthDebug />}
        </TooltipProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;