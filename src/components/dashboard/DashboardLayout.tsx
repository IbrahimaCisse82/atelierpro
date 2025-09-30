import React, { useState } from 'react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronRight, Home, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: string;
}

interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItem[];
  key: string;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { open: sidebarOpen, toggleSidebar } = useSidebar();
  
  // État pour gérer l'ouverture/fermeture des groupes
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    commercial: true,
    production: false,
    achats: false,
    finance: false,
    rh: false,
    rapports: false,
  });

  // Structure de navigation organisée par domaine fonctionnel
  const menuGroups: MenuGroup[] = [
    {
      key: 'commercial',
      label: 'Gestion Commerciale',
      icon: '📊',
      items: [
        { path: '/dashboard/clients', label: 'Clients', icon: '👥' },
        { path: '/dashboard/orders', label: 'Commandes', icon: '📋' },
        { path: '/dashboard/measurements', label: 'Mesures', icon: '📏' },
        { path: '/dashboard/patterns', label: 'Modèles/Patrons', icon: '✂️' },
        { path: '/dashboard/customer-invoices', label: 'Factures Clients', icon: '🧾' },
      ],
    },
    {
      key: 'production',
      label: 'Production & Stocks',
      icon: '🏭',
      items: [
        { path: '/dashboard/production', label: 'Production', icon: '🏭' },
        { path: '/dashboard/stocks', label: 'Stocks', icon: '📦' },
      ],
    },
    {
      key: 'achats',
      label: 'Achats & Fournisseurs',
      icon: '🛒',
      items: [
        { path: '/dashboard/suppliers', label: 'Fournisseurs', icon: '🚚' },
        { path: '/dashboard/purchases', label: 'Achats', icon: '🛒' },
        { path: '/dashboard/receptions', label: 'Réceptions', icon: '📥' },
        { path: '/dashboard/invoices', label: 'Factures Fournisseurs', icon: '🧾' },
      ],
    },
    {
      key: 'finance',
      label: 'Finance & Comptabilité',
      icon: '💰',
      items: [
        { path: '/dashboard/finances', label: 'Tableau de Bord', icon: '💳' },
        { path: '/dashboard/treasury', label: 'Trésorerie', icon: '🏦' },
        { path: '/dashboard/fixed-assets', label: 'Immobilisations', icon: '🏢' },
        { path: '/dashboard/financial-reports', label: 'Rapports Financiers', icon: '📊' },
        { path: '/dashboard/bank-reconciliation', label: 'Rapprochement Bancaire', icon: '🔄' },
        { path: '/dashboard/syscohada', label: 'SYSCOHADA', icon: '📚' },
      ],
    },
    {
      key: 'rh',
      label: 'Ressources Humaines',
      icon: '👥',
      items: [
        { path: '/dashboard/hr', label: 'Employés', icon: '👤' },
        { path: '/dashboard/remunerations', label: 'Rémunérations', icon: '💰' },
      ],
    },
    {
      key: 'rapports',
      label: 'Rapports & Analyses',
      icon: '📈',
      items: [
        { path: '/dashboard/reports', label: 'Rapports Généraux', icon: '📑' },
        { path: '/dashboard/alerts', label: 'Alertes', icon: '🔔' },
        { path: '/dashboard/audit', label: "Journal d'Activité", icon: '📝' },
        { path: '/dashboard/export', label: 'Export Avancé', icon: '📤' },
      ],
    },
  ];

  const toggleGroup = (groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const isActive = (path: string) => location.pathname === path;
  
  // Vérifie si un groupe contient la route active
  const isGroupActive = (items: MenuItem[]) => {
    return items.some(item => isActive(item.path));
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar className="border-r" collapsible="icon">
        {/* Bande noire pour les icônes */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-black z-0" />
        
        <SidebarHeader className="border-b relative z-10">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <span className="text-2xl">👔</span>
              </div>
              {sidebarOpen && <h1 className="text-lg font-bold">AteliérPro</h1>}
            </div>
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>
        
        <SidebarContent className="relative z-10">
          {/* Dashboard principal */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={location.pathname === '/dashboard' || location.pathname === '/'}
                onClick={() => navigate('/dashboard')}
                className="flex items-center"
              >
                <div className="w-12 flex items-center justify-center text-white">
                  <Home className="h-5 w-5" />
                </div>
                {sidebarOpen && <span className="ml-2">Tableau de Bord</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Groupes de navigation */}
          {menuGroups.map((group) => (
            <SidebarGroup key={group.key}>
              <button
                onClick={() => toggleGroup(group.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-12 flex items-center justify-center text-white -ml-3">
                    <span>{group.icon}</span>
                  </div>
                  {sidebarOpen && <span>{group.label}</span>}
                </div>
                {sidebarOpen && (
                  openGroups[group.key] ? 
                    <ChevronDown className="h-3 w-3" /> : 
                    <ChevronRight className="h-3 w-3" />
                )}
              </button>
              
              {sidebarOpen && openGroups[group.key] && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.path}>
                        <SidebarMenuButton
                          isActive={isActive(item.path)}
                          onClick={() => navigate(item.path)}
                        >
                          <div className="w-12 flex items-center justify-center text-white">
                            <span>{item.icon}</span>
                          </div>
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          ))}

          {/* Administration */}
          <SidebarGroup>
            <SidebarGroupLabel>
              <div className="flex items-center space-x-2">
                <div className="w-12 flex items-center justify-center text-white -ml-3">
                  <span>⚙️</span>
                </div>
                {sidebarOpen && <span>Administration</span>}
              </div>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive('/dashboard/settings')}
                    onClick={() => navigate('/dashboard/settings')}
                  >
                    <div className="w-12 flex items-center justify-center text-white">
                      <span>⚙️</span>
                    </div>
                    {sidebarOpen && <span>Paramètres</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Bouton toggle quand sidebar est fermé */}
      {!sidebarOpen && (
        <div className="fixed left-2 top-4 z-50">
          <Button
            variant="default"
            size="icon"
            onClick={toggleSidebar}
            className="shadow-lg"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {/* Header mobile avec trigger */}
        <div className="md:hidden sticky top-0 z-10 bg-background border-b p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">AteliérPro</h2>
          <div className="w-8" /> {/* Spacer pour centrage */}
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}