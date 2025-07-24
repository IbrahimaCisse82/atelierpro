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
  Bell,
  Search,
  Plus
} from 'lucide-react';
import { TouchGestures } from './TouchGestures';
import { useIsMobile } from '@/hooks/use-mobile';
import PWAFeatures from './PWAFeatures';

interface MobileNavigationProps {
  className?: string;
}

const navigationItems = [
  { 
    path: '/', 
    icon: Home, 
    label: 'Accueil',
    color: 'text-blue-600'
  },
  { 
    path: '/clients', 
    icon: Users, 
    label: 'Clients',
    color: 'text-green-600'
  },
  { 
    path: '/orders', 
    icon: ShoppingBag, 
    label: 'Commandes',
    color: 'text-purple-600'
  },
  { 
    path: '/finances', 
    icon: DollarSign, 
    label: 'Finances',
    color: 'text-orange-600'
  }
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ className }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

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
    const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);
    if (currentIndex < navigationItems.length - 1) {
      navigate(navigationItems[currentIndex + 1].path);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = navigationItems.findIndex(item => item.path === location.pathname);
    if (currentIndex > 0) {
      navigate(navigationItems[currentIndex - 1].path);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate('/');
    }
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
            {navigationItems.find(item => item.path === location.pathname)?.label || 'AtelierPro'}
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

          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start h-12 text-left",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  onClick={() => {
                    navigate(item.path);
                    setIsMenuOpen(false);
                  }}
                >
                  <Icon className={cn("h-5 w-5 mr-3", item.color)} />
                  <span>{item.label}</span>
                </Button>
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

      {/* Bottom navigation */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t transition-all duration-300",
        isScrolled ? "translate-y-full" : "translate-y-0"
      )}>
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
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
          // Action basée sur la page courante
          const currentPage = location.pathname;
          if (currentPage === '/clients') navigate('/clients/new');
          else if (currentPage === '/orders') navigate('/orders/new');
          else navigate('/');
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
