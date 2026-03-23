import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardHeader } from './DashboardHeader';
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  Users,
  ClipboardList,
  Ruler,
  Scissors,
  Factory,
  Package,
  FileText,
  Truck,
  ShoppingCart,
  PackageCheck,
  Receipt,
  Wallet,
  Landmark,
  Building,
  BarChart3,
  RefreshCw,
  BookOpen,
  UserCog,
  Banknote,
  FileBarChart,
  Bell,
  ScrollText,
  Download,
  Puzzle,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCompanyModules } from '@/hooks/use-company-modules';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  moduleKey?: string;
}

interface MenuGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  key: string;
}

export const DashboardLayout = React.memo(function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, company } = useAuth();
  const { open: sidebarOpen, toggleSidebar } = useSidebar();
  const { isModuleInstalled, installedModules } = useCompanyModules();

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    commercial: true,
    production: false,
    achats: false,
    finance: false,
    rh: false,
    rapports: false,
  });

  const allMenuGroups: MenuGroup[] = React.useMemo(() => [
    {
      key: 'commercial',
      label: 'Commercial',
      icon: ClipboardList,
      items: [
        { path: '/dashboard/clients', label: 'Clients', icon: Users, moduleKey: 'clients' },
        { path: '/dashboard/orders', label: 'Commandes', icon: ClipboardList, moduleKey: 'orders' },
        { path: '/dashboard/measurements', label: 'Mensurations', icon: Ruler, moduleKey: 'measurements' },
        { path: '/dashboard/patterns', label: 'Modèles & Patrons', icon: Scissors, moduleKey: 'patterns' },
        { path: '/dashboard/customer-invoices', label: 'Factures Clients', icon: FileText, moduleKey: 'customer_invoices' },
      ],
    },
    {
      key: 'production',
      label: 'Production',
      icon: Factory,
      items: [
        { path: '/dashboard/production', label: 'Fabrication', icon: Factory, moduleKey: 'production' },
        { path: '/dashboard/stocks', label: 'Stocks', icon: Package, moduleKey: 'stocks' },
      ],
    },
    {
      key: 'achats',
      label: 'Achats',
      icon: ShoppingCart,
      items: [
        { path: '/dashboard/suppliers', label: 'Fournisseurs', icon: Truck, moduleKey: 'suppliers' },
        { path: '/dashboard/purchases', label: 'Bons de commande', icon: ShoppingCart, moduleKey: 'purchases' },
        { path: '/dashboard/receptions', label: 'Réceptions', icon: PackageCheck, moduleKey: 'receptions' },
        { path: '/dashboard/invoices', label: 'Factures', icon: Receipt, moduleKey: 'supplier_invoices' },
      ],
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: Wallet,
      items: [
        { path: '/dashboard/finances', label: 'Tableau de bord', icon: Wallet, moduleKey: 'finance_dashboard' },
        { path: '/dashboard/treasury', label: 'Trésorerie', icon: Landmark, moduleKey: 'treasury' },
        { path: '/dashboard/fixed-assets', label: 'Immobilisations', icon: Building, moduleKey: 'fixed_assets' },
        { path: '/dashboard/financial-reports', label: 'Rapports', icon: BarChart3, moduleKey: 'financial_reports' },
        { path: '/dashboard/bank-reconciliation', label: 'Rapprochement', icon: RefreshCw, moduleKey: 'bank_reconciliation' },
        { path: '/dashboard/syscohada', label: 'SYSCOHADA', icon: BookOpen, moduleKey: 'syscohada' },
      ],
    },
    {
      key: 'rh',
      label: 'Ressources Humaines',
      icon: UserCog,
      items: [
        { path: '/dashboard/hr', label: 'Employés', icon: UserCog, moduleKey: 'employees' },
        { path: '/dashboard/remunerations', label: 'Paie', icon: Banknote, moduleKey: 'remunerations' },
      ],
    },
    {
      key: 'rapports',
      label: 'Rapports',
      icon: FileBarChart,
      items: [
        { path: '/dashboard/reports', label: 'Rapports', icon: FileBarChart, moduleKey: 'reports' },
        { path: '/dashboard/alerts', label: 'Alertes', icon: Bell, moduleKey: 'alerts' },
        { path: '/dashboard/audit', label: 'Journal', icon: ScrollText, moduleKey: 'audit' },
        { path: '/dashboard/export', label: 'Export', icon: Download, moduleKey: 'export' },
      ],
    },
  ], []);

  const menuGroups = React.useMemo(() => allMenuGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item =>
        !item.moduleKey || isModuleInstalled(item.moduleKey)
      ),
    }))
    .filter(group => group.items.length > 0), [allMenuGroups, installedModules]);

  const toggleGroup = React.useCallback((groupKey: string) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar collapsible="icon" className="border-r-0">
        {/* Header */}
        <SidebarHeader className="px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-sidebar-foreground">AteliérPro</span>
                <span className="text-[10px] text-sidebar-foreground/50 font-medium uppercase tracking-widest">Gestion d'atelier</span>
              </div>
            )}
            {sidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="ml-auto h-7 w-7 text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            )}
          </div>
        </SidebarHeader>

        <Separator className="bg-sidebar-border" />

        <SidebarContent className="px-2 py-2">
          {/* Dashboard link */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isDashboard}
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "h-9 gap-3 rounded-md font-medium transition-colors",
                  isDashboard
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>Tableau de bord</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          {/* Module groups */}
          {menuGroups.map((group) => {
            const GroupIcon = group.icon;
            const isGroupOpen = openGroups[group.key] ?? false;
            const hasActiveItem = group.items.some(item => isActive(item.path));

            return (
              <SidebarGroup key={group.key} className="py-0">
                <SidebarGroupLabel
                  className="px-0"
                >
                  <button
                    onClick={() => toggleGroup(group.key)}
                    className={cn(
                      "w-full flex items-center gap-3 h-9 px-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors",
                      hasActiveItem
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    )}
                  >
                    <GroupIcon className="h-3.5 w-3.5 shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left">{group.label}</span>
                        {isGroupOpen
                          ? <ChevronDown className="h-3 w-3 opacity-50" />
                          : <ChevronRight className="h-3 w-3 opacity-50" />
                        }
                      </>
                    )}
                  </button>
                </SidebarGroupLabel>

                {(sidebarOpen ? isGroupOpen : true) && (
                  <SidebarGroupContent className={sidebarOpen ? "ml-2 border-l border-sidebar-border pl-2" : ""}>
                    <SidebarMenu>
                      {group.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <SidebarMenuItem key={item.path}>
                            <SidebarMenuButton
                              isActive={active}
                              onClick={() => navigate(item.path)}
                              className={cn(
                                "h-8 gap-3 rounded-md text-sm transition-colors",
                                active
                                  ? "bg-sidebar-primary/15 text-sidebar-primary font-medium"
                                  : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <ItemIcon className="h-4 w-4 shrink-0" />
                              {sidebarOpen && <span>{item.label}</span>}
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })}

          <Separator className="bg-sidebar-border my-2" />

          {/* Admin links */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive('/dashboard/apps')}
                onClick={() => navigate('/dashboard/apps')}
                className={cn(
                  "h-9 gap-3 rounded-md font-medium transition-colors",
                  isActive('/dashboard/apps')
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Puzzle className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>Applications</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isActive('/dashboard/settings')}
                onClick={() => navigate('/dashboard/settings')}
                className={cn(
                  "h-9 gap-3 rounded-md font-medium transition-colors",
                  isActive('/dashboard/settings')
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>Paramètres</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>

        {/* Footer - User info */}
        <SidebarFooter className="px-3 py-3 border-t border-sidebar-border">
          {sidebarOpen ? (
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center gap-3 w-full rounded-md p-2 hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-sm font-medium text-sidebar-foreground truncate w-full">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-sidebar-foreground/50 truncate w-full">
                  {company?.name}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="flex items-center justify-center rounded-md p-1 hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </button>
          )}
        </SidebarFooter>
      </Sidebar>

      {/* Collapse trigger when sidebar is closed */}
      {!sidebarOpen && (
        <div className="fixed left-2 top-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 shadow-md bg-card border-border"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto">
          {/* Mobile header */}
          <div className="md:hidden sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
              <PanelLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold">AteliérPro</span>
            <div className="w-8" />
          </div>

          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});
