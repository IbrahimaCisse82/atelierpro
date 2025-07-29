import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthDebug } from "@/components/debug/AuthDebug";
import { PerformanceMonitor } from "@/components/debug/PerformanceMonitor";
import { PWAInstallPrompt } from "@/components/ui/pwa-install-prompt";
import MobileNavigation from "@/components/common/MobileNavigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { RoleSpecificDashboard } from "./components/dashboard/RoleSpecificDashboard";
import { UserProfile } from "./components/dashboard/UserProfile";
import { LoadingPage } from "@/components/ui/loading";
import { lazy, Suspense, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { unstable_HistoryRouter as HistoryRouter } from "react-router-dom";
import Index from './pages/Index';

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
const RemunerationPage = lazy(() => import('./pages/RemunerationPage').then(module => ({ default: module.RemunerationPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({ default: module.OrdersPage })));
const ProductionPage = lazy(() => import('./pages/ProductionPage').then(module => ({ default: module.ProductionPage })));
const StocksPage = lazy(() => import('./pages/StocksPage').then(module => ({ default: module.StocksPage })));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage').then(module => ({ default: module.SuppliersPage })));
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
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.default })));

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
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // Debug pour voir l'état de l'authentification
  console.log("[AppContent] État auth:", { user: !!user, loading, userEmail: user?.email });

  if (loading) {
    console.log("[AppContent] Chargement en cours...");
    return <LoadingPage />;
  }

  // Affiche la landing page si l'utilisateur n'est pas connecté
  if (!user) {
    console.log("[AppContent] Aucun utilisateur connecté, redirection vers Index");
    return (
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard/*" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    );
  }

  console.log("[AppContent] Utilisateur connecté, affichage du dashboard");

  return (
    <SidebarProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            <Route path="/" element={
              <DashboardLayout>
                <RoleSpecificDashboard />
              </DashboardLayout>
            } />
            <Route path="/dashboard" element={
              <DashboardLayout>
                <RoleSpecificDashboard />
              </DashboardLayout>
            } />
            <Route path="/dashboard/orders" element={
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/clients" element={
              <DashboardLayout>
                <ClientsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/production" element={
              <DashboardLayout>
                <ProductionPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/stocks" element={
              <DashboardLayout>
                <StocksPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/purchases" element={
              <DashboardLayout>
                <PurchasesPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/patterns" element={
              <DashboardLayout>
                <PatternsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/measurements" element={
              <DashboardLayout>
                <MeasurementsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/invoices" element={
              <DashboardLayout>
                <InvoicesPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/profile" element={
              <DashboardLayout>
                <UserProfile />
              </DashboardLayout>
            } />
            <Route path="/dashboard/hr" element={
              <DashboardLayout>
                <HRPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/remunerations" element={
              <DashboardLayout>
                <RemunerationPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/finances" element={
              <DashboardLayout>
                <FinancesPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/suppliers" element={
              <DashboardLayout>
                <SuppliersPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/settings" element={
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/syscohada" element={
              <DashboardLayout>
                <SyscohadaSettingsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/reports" element={
              <DashboardLayout>
                <ReportsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/financial-reports" element={
              <DashboardLayout>
                <FinancialReportsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/bank-reconciliation" element={
              <DashboardLayout>
                <BankReconciliationPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/alerts" element={
              <DashboardLayout>
                <AlertsPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/audit" element={
              <DashboardLayout>
                <AuditTrailPage />
              </DashboardLayout>
            } />
            <Route path="/dashboard/export" element={
              <DashboardLayout>
                <AdvancedExportPage />
              </DashboardLayout>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        
        {/* Devtools React Query en développement */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        
        {/* Composants PWA */}
        <PWAInstallPrompt />
        
        {/* Navigation mobile */}
        <MobileNavigation />
        
        {/* Debug et monitoring uniquement en dev */}
        {import.meta.env.DEV && (
          <>
            {/* Bouton flottant pour afficher/masquer le panneau de performance */}
            <button
              className="fixed bottom-6 right-6 z-50 bg-white border shadow-lg rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-100 transition"
              onClick={() => setShowPerformanceMonitor((v) => !v)}
            >
              {showPerformanceMonitor ? 'Masquer' : 'Performance'}
            </button>
            {showPerformanceMonitor && (
              <PerformanceMonitor onClose={() => setShowPerformanceMonitor(false)} />
            )}
            
            {/* Bouton flottant pour tester les boutons */}
            <button
              className="fixed bottom-6 left-6 z-50 bg-green-500 text-white border shadow-lg rounded-full px-4 py-2 text-sm font-semibold hover:bg-green-600 transition"
              onClick={() => {
                toast({
                  title: "Tous les boutons activés !",
                  description: "Vérifiez que tous les boutons sont maintenant fonctionnels.",
                });
              }}
            >
              Test Boutons
            </button>
          </>
        )}
      </QueryClientProvider>
    </SidebarProvider>
  );
}

// Composant racine avec tous les providers
function App() {
  // Ajout des flags React Router v7 pour anticiper la migration
  const future = {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  };
  return (
    <Router future={future}>
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