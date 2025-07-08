import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  ShoppingCart, 
  Package, 
  Scissors, 
  FileText, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';
import { AlertSystem } from '@/components/alerts/AlertSystem';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  badge?: string;
}

const menuItems: MenuItem[] = [
  {
    title: 'Tableau de bord',
    href: '/dashboard',
    icon: BarChart3,
    roles: ['owner', 'manager', 'tailor', 'orders', 'stocks', 'customer_service']
  },
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: Users,
    roles: ['owner', 'orders', 'customer_service']
  },
  {
    title: 'Commandes',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    roles: ['owner', 'manager', 'tailor', 'orders', 'customer_service']
  },
  {
    title: 'Production',
    href: '/dashboard/production',
    icon: Scissors,
    roles: ['owner', 'manager', 'tailor']
  },
  {
    title: 'Stocks',
    href: '/dashboard/stocks',
    icon: Package,
    roles: ['owner', 'stocks']
  },
  {
    title: 'Achats',
    href: '/dashboard/purchases',
    icon: FileText,
    roles: ['owner', 'stocks']
  },
  {
    title: 'Modèles & Patrons',
    href: '/dashboard/patterns',
    icon: FileText,
    roles: ['owner', 'manager', 'tailor', 'orders']
  },
  {
    title: 'Mesures',
    href: '/dashboard/measurements',
    icon: FileText,
    roles: ['owner', 'orders', 'customer_service']
  },
  {
    title: 'Facturation',
    href: '/dashboard/invoices',
    icon: FileText,
    roles: ['owner', 'orders']
  },
  {
    title: 'RH & Paie',
    href: '/dashboard/hr',
    icon: Users,
    roles: ['owner']
  },
  {
    title: 'Finances',
    href: '/dashboard/finances',
    icon: BarChart3,
    roles: ['owner']
  },
  {
    title: 'Paramètres',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['owner']
  }
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header mobile */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex items-center gap-2">
          <AlertSystem />
          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* Logo et titre */}
            <div className="flex h-16 items-center px-6 border-b">
              <Building2 className="h-8 w-8 mr-3" />
              <div>
                <h1 className="text-lg font-semibold">Atelier Pro</h1>
                <p className="text-xs text-muted-foreground">
                  Entreprise
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => handleNavigation(item.href)}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.title}
                    {item.badge && (
                      <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                );
              })}
            </nav>

            {/* Footer avec infos utilisateur */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Déconnexion
              </Button>
            </div>
          </div>
        </Sidebar>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Contenu principal */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 