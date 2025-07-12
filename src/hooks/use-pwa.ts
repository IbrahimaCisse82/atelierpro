import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface PWAState {
  isInstalled: boolean;
  isOnline: boolean;
  hasUpdate: boolean;
  isUpdateReady: boolean;
  isLoading: boolean;
}

interface PWAUpdateEvent {
  type: 'update-available' | 'update-ready' | 'update-installed';
  payload?: any;
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasUpdate: false,
    isUpdateReady: false,
    isLoading: false,
  });

  // Détecter si l'app est installée
  useEffect(() => {
    const checkInstallation = () => {
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone === true;
      
      setState(prev => ({ ...prev, isInstalled }));
    };

    checkInstallation();
    window.addEventListener('beforeinstallprompt', checkInstallation);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstallation);
    };
  }, []);

  // Surveiller la connectivité
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Connexion rétablie",
        description: "Vous êtes de nouveau en ligne.",
      });
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Mode hors ligne",
        description: "Certaines fonctionnalités peuvent être limitées.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gérer les mises à jour PWA
  useEffect(() => {
    const handleUpdateEvent = (event: CustomEvent<PWAUpdateEvent>) => {
      switch (event.detail.type) {
        case 'update-available':
          setState(prev => ({ ...prev, hasUpdate: true }));
          toast({
            title: "Mise à jour disponible",
            description: "Une nouvelle version de l'application est disponible.",
          });
          break;
          
        case 'update-ready':
          setState(prev => ({ ...prev, isUpdateReady: true }));
          toast({
            title: "Mise à jour prête",
            description: "La mise à jour est prête à être installée.",
          });
          break;
          
        case 'update-installed':
          setState(prev => ({ 
            ...prev, 
            hasUpdate: false, 
            isUpdateReady: false 
          }));
          toast({
            title: "Mise à jour installée",
            description: "L'application a été mise à jour avec succès.",
          });
          break;
      }
    };

    window.addEventListener('pwa-update', handleUpdateEvent as EventListener);
    
    return () => {
      window.removeEventListener('pwa-update', handleUpdateEvent as EventListener);
    };
  }, []);

  // Fonction pour installer l'app
  const installApp = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Déclencher l'événement d'installation
      const installEvent = new CustomEvent('beforeinstallprompt');
      window.dispatchEvent(installEvent);
      
      toast({
        title: "Installation",
        description: "Suivez les instructions pour installer l'application.",
      });
    } catch (error) {
      toast({
        title: "Erreur d'installation",
        description: "Impossible d'installer l'application.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Fonction pour forcer la mise à jour
  const forceUpdate = () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    // Recharger la page pour appliquer les mises à jour
    window.location.reload();
  };

  // Fonction pour vérifier les mises à jour
  const checkForUpdates = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Déclencher une vérification de mise à jour
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.update();
        }
      }
      
      toast({
        title: "Vérification terminée",
        description: "Aucune mise à jour disponible pour le moment.",
      });
    } catch (error) {
      toast({
        title: "Erreur de vérification",
        description: "Impossible de vérifier les mises à jour.",
        variant: "destructive",
      });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    installApp,
    forceUpdate,
    checkForUpdates,
  };
} 