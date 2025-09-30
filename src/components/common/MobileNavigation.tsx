import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  Menu, 
  X,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Factory,
  Package,
  Truck,
  ShoppingCart,
  FileText,
  Ruler,
  Scissors,
  Building2,
  Landmark,
  Banknote,
  BarChart3,
  ClipboardList,
  Inbox
} from 'lucide-react';
import { TouchGestures } from './TouchGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import PWAFeatures from './PWAFeatures';

interface MobileNavigationProps {
  className?: string;
}

// Navigation groupée par domaine fonctionnel pour le menu latéral
const navGroups = [
  {
    label: 'Commercial',
    icon: ShoppingBag,
    items: [
      { path: '/dashboard/clients', icon: Users, label: 'Clients' },
      { path: '/dashboard/orders', icon: ShoppingBag, label: 'Commandes' },
      { path: '/dashboard/measurements', icon: Ruler, label: 'Mesures' },
      { path: '/dashboard/patterns', icon: Scissors, label: 'Modèles' },
      { path: '/dashboard/customer-invoices', icon: FileText, label: 'Factures' },
    ]
  },
  {
    label: 'Production',
    icon: Factory,
    items: [
      { path: '/dashboard/production', icon: Factory, label: 'Production' },
      { path: '/dashboard/stocks', icon: Package, label: 'Stocks' },
    ]
  },
  {
    label: 'Achats',
    icon: ShoppingCart,
    items: [
      { path: '/dashboard/suppliers', icon: Truck, label: 'Fournisseurs' },
      { path: '/dashboard/purchases', icon: ShoppingCart, label: 'Achats' },
      { path: '/dashboard/receptions', icon: Inbox, label: 'Réceptions' },
      { path: '/dashboard/invoices', icon: FileText, label: 'Factures' },
    ]
  },
  {
    label: 'Finance',
    icon: DollarSign,
    items: [
      { path: '/dashboard/finances', icon: DollarSign, label: 'Finances' },
      { path: '/dashboard/treasury', icon: Landmark, label: 'Trésorerie' },
      { path: '/dashboard/fixed-assets', icon: Building2, label: 'Immobilisations' },
    ]
  },
  {
    label: 'RH',
    icon: Users,
    items: [
      { path: '/dashboard/hr', icon: Users, label: 'Employés' },
      { path: '/dashboard/remunerations', icon: Banknote, label: 'Rémunérations' },
    ]
  },
  {
    label: 'Rapports',
    icon: BarChart3,
    items: [
      { path: '/dashboard/reports', icon: BarChart3, label: 'Rapports' },
      { path: '/dashboard/alerts', icon: Bell, label: 'Alertes' },
      { path: '/dashboard/audit', icon: ClipboardList, label: 'Journal' },
    ]
  },
];

// Navigation rapide pour la barre du bas (5 items max)
const quickNavItems = [
  { path: '/dashboard', icon: Home, label: 'Accueil', color: 'text-primary' },
  { path: '/dashboard/orders', icon: ShoppingBag, label: 'Commandes', color: 'text-blue-600' },
  { path: '/dashboard/production', icon: Factory, label: 'Production', color: 'text-orange-600' },
  { path: '/dashboard/stocks', icon: Package, label: 'Stocks', color: 'text-green-600' },
  { path: '/dashboard/finances', icon: DollarSign, label: 'Finances', color: 'text-yellow-600' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  // Détection du scroll pour masquer/afficher la navigation
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollState = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Gestion des gestes de navigation
  const handleSwipeLeft = () => {
    const currentIndex = quickNavItems.findIndex(item => item.path === location.pathname);
    if (currentIndex < quickNavItems.length - 1) {
      navigate(quickNavItems[currentIndex + 1].path);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = quickNavItems.findIndex(item => item.path === location.pathname);
    if (currentIndex > 0) {
      navigate(quickNavItems[currentIndex - 1].path);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/dashboard');
    }
  };

  // Trouver le label de la page actuelle
  const getCurrentPageLabel = () => {
    for (const group of navGroups) {
      const item = group.items.find(item => item.path === location.pathname);
      if (item) return item.label;
    }
    if (location.pathname === '/dashboard' || location.pathname === '/') return 'Tableau de Bord';
    return 'AtelierPro';
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Header mobile */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b transition-all duration-300",
        isScrolled ? "shadow-sm" : "",
        className
      )}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Bouton retour ou menu */}
          <Button
            variant="ghost"
            size="sm"
            onClick={location.pathname === '/' ? () => setIsMenuOpen(!isMenuOpen) : handleBack}
            className="p-2"
          >
            {location.pathname === '/' ? (
              isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          {/* Titre de la page */}
          <h1 className="text-lg font-semibold truncate flex-1 text-center">
            {getCurrentPageLabel()}
          </h1>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="p-2 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </header>

      {/* Menu latéral */}
      <div className={cn(
        "fixed inset-0 z-40 transition-all duration-300",
        isMenuOpen ? "visible" : "invisible"
      )}>
        {/* Overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            isMenuOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Menu content */}
        <div className={cn(
          "absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-300",
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">AtelierPro</h2>
                <p className="text-sm text-muted-foreground">Gestion d'atelier</p>
              </div>
            </div>
          </div>

          {/* Dashboard principal */}
          <div className="p-4">
            <Button
              variant={location.pathname === '/dashboard' || location.pathname === '/' ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start h-12 text-left",
                (location.pathname === '/dashboard' || location.pathname === '/') && "bg-primary/10 text-primary"
              )}
              onClick={() => {
                navigate('/dashboard');
                setIsMenuOpen(false);
              }}
            >
              <Home className="h-5 w-5 mr-3" />
              <span>Tableau de Bord</span>
            </Button>
          </div>

          {/* Navigation groupée */}
          <div className="px-4 pb-4 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const isGroupOpen = openGroups[group.label];
              const hasActiveItem = group.items.some(item => item.path === location.pathname);
              
              return (
                <div key={group.label} className="space-y-1">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-10 text-left font-semibold",
                      hasActiveItem && "text-primary"
                    )}
                    onClick={() => toggleGroup(group.label)}
                  >
                    <div className="flex items-center">
                      <GroupIcon className="h-4 w-4 mr-3" />
                      <span>{group.label}</span>
                    </div>
                    {isGroupOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  
                  {isGroupOpen && (
                    <div className="pl-4 space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        
                        return (
                          <Button
                            key={item.path}
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start h-10 text-left",
                              isActive && "bg-primary/10 text-primary"
                            )}
                            onClick={() => {
                              navigate(item.path);
                              setIsMenuOpen(false);
                            }}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="text-sm">{item.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Fonctionnalités PWA */}
          <div className="p-4 border-t mt-auto">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">App mobile</h3>
            <PWAFeatures className="space-y-2" />
          </div>
        </div>
      </div>

      {/* Navigation avec gestes tactiles */}
      <TouchGestures
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        className="fixed inset-0 pointer-events-none z-10"
      >
        <div className="h-full w-full" />
      </TouchGestures>

      {/* Bottom navigation - Navigation rapide */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t transition-all duration-300",
        isScrolled ? "translate-y-full" : "translate-y-0"
      )}>
        <div className="flex items-center justify-around py-2">
          {quickNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                className={cn(
                  "flex-1 flex flex-col items-center space-y-1 py-3 px-2 rounded-none",
                  isActive && "text-primary"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className={cn("h-5 w-5", item.color, isActive && "text-primary")} />
                <span className="text-xs truncate">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Bouton d'action flottant */}
      <Button
        className={cn(
          "fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-300",
          isScrolled && "scale-90 opacity-80"
        )}
        onClick={() => {
          // Action basée sur la page courante - Ouvre le menu pour ajouter une nouvelle ressource
          setIsMenuOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Spacer pour éviter que le contenu soit masqué */}
      <div className="h-16" />
      <div className="h-20" />
    </>
  );
};

export default MobileNavigation;
