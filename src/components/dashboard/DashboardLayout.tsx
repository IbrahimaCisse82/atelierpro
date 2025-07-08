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

  // Définition des droits d'accès par rôle
  const role = user?.role;
  // Par défaut, tout le monde voit Dashboard, Clients, Commandes
  // Les modules avancés sont réservés à owner/manager
  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['owner','manager','tailor','orders','stocks','customer_service'] },
    { path: '/dashboard/orders', label: 'Commandes', icon: '📋', roles: ['owner','manager','orders'] },
    { path: '/dashboard/clients', label: 'Clients', icon: '👥', roles: ['owner','manager','customer_service'] },
    { path: '/dashboard/production', label: 'Production', icon: '⚙️', roles: ['owner','manager'] },
    { path: '/dashboard/stocks', label: 'Stocks', icon: '📦', roles: ['owner','manager','stocks'] },
    { path: '/dashboard/purchases', label: 'Achats', icon: '🛒', roles: ['owner','manager'] },
    { path: '/dashboard/suppliers', label: 'Fournisseurs', icon: '🏢', roles: ['owner','manager','purchases','admin','suppliers'] },
    { path: '/dashboard/patterns', label: 'Patrons', icon: '✂️', roles: ['owner','manager'] },
    { path: '/dashboard/measurements', label: 'Mesures', icon: '📏', roles: ['owner','manager'] },
    { path: '/dashboard/invoices', label: 'Factures', icon: '💰', roles: ['owner','manager'] },
    { path: '/dashboard/hr', label: 'RH', icon: '👤', roles: ['owner','manager'] },
    { path: '/dashboard/finances', label: 'Finances', icon: '💳', roles: ['owner','manager'] },
    { path: '/dashboard/settings', label: 'Paramètres', icon: '⚙️', roles: ['owner','manager','settings','admin'] },
    { path: '/dashboard/reports', label: 'Rapports', icon: '📑', roles: ['owner','manager','reports','finance','admin'] },
    { path: '/dashboard/audit', label: "Journal d'activité", icon: '📝', roles: ['owner','manager','admin','audit'] },
    { path: '/dashboard/alerts', label: 'Alertes', icon: '🔔', roles: ['owner','manager','admin','alerts'] },
    { path: '/dashboard/export', label: 'Export avancé', icon: '📤', roles: ['owner','manager','admin','reports','finance'] },
  ];
  const filteredMenu = menuItems.filter(item => !role || item.roles.includes(role));

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