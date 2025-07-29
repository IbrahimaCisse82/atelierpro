import React from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Ordre harmonisé du menu selon la charte utilisateur
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/clients', label: 'Clients', icon: '👥' },
    { path: '/dashboard/measurements', label: 'Mesures', icon: '📏' },
    { path: '/dashboard/orders', label: 'Commandes', icon: '📋' },
    { path: '/dashboard/patterns', label: 'Modèles/Patrons', icon: '✂️' },
    { path: '/dashboard/suppliers', label: 'Fournisseurs', icon: '🚚' },
    { path: '/dashboard/purchases', label: 'Achats', icon: '🛒' },
    { path: '/dashboard/invoices', label: 'Factures', icon: '🧾' },
    { path: '/dashboard/stocks', label: 'Stocks', icon: '📦' },
    { path: '/dashboard/hr', label: 'RH', icon: '👤' },
    { path: '/dashboard/finances', label: 'Finances', icon: '💳' },
    // Modules complémentaires
    { path: '/dashboard/production', label: 'Production', icon: '🏭' },
    { path: '/dashboard/remunerations', label: 'Rémunérations', icon: '💰' },
    { path: '/dashboard/financial-reports', label: 'Rapports Financiers', icon: '📊' },
    { path: '/dashboard/bank-reconciliation', label: 'Rapprochement Bancaire', icon: '🏦' },
    { path: '/dashboard/reports', label: 'Rapports', icon: '📑' },
    { path: '/dashboard/audit', label: "Journal d'activité", icon: '📝' },
    { path: '/dashboard/alerts', label: 'Alertes', icon: '🔔' },
    { path: '/dashboard/export', label: 'Export avancé', icon: '📤' },
    { path: '/dashboard/syscohada', label: 'SYSCOHADA', icon: '📊' },
    { path: '/dashboard/settings', label: 'Paramètres', icon: '⚙️' },
  ];
  // Plus de restriction de rôle sur l'affichage du menu
  const filteredMenu = menuItems;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">Mon App</h1>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>
        
        <SidebarContent>
          <SidebarMenu>
            {filteredMenu.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  onClick={() => navigate(item.path)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Mobile menu trigger */}
          <div className="md:hidden mb-4">
            <SidebarTrigger />
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}