import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Download, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PWAFeaturesProps {
  className?: string;
}

export const PWAFeatures: React.FC<PWAFeaturesProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission>('default');
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Vérifier le statut des notifications
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission);
    }

    // Gérer les événements de connexion
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "🌐 Connexion rétablie",
        description: "Synchronisation des données en cours...",
        duration: 3000,
      });
      
            // Déclencher une synchronisation
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        navigator.serviceWorker.ready.then(registration => {
          return (registration as any).sync.register('background-sync');
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Mode hors ligne",
        description: "L'application continue de fonctionner avec les données locales.",
        duration: 5000,
      });
    };

    // Gérer l'événement d'installation PWA
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setCanInstall(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Enregistrer le service worker si disponible
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('[PWA] Service Worker enregistré:', registration);

      // Écouter les mises à jour du SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              toast({
                title: "🔄 Mise à jour disponible",
                description: "Une nouvelle version de l'application est prête.",
                action: (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    }}
                  >
                    Actualiser
                  </Button>
                ),
                duration: 10000,
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('[PWA] Erreur enregistrement SW:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast({
        title: "❌ Notifications non supportées",
        description: "Votre navigateur ne supporte pas les notifications.",
        variant: "destructive",
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "🔔 Notifications activées",
          description: "Vous recevrez des notifications pour les événements importants.",
        });

        // Envoyer une notification de test
        showTestNotification();
        
        // S'inscrire aux notifications push si possible
        subscribeToPush();
      } else {
        toast({
          title: "🔕 Notifications refusées",
          description: "Vous pouvez les activer plus tard dans les paramètres du navigateur.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[PWA] Erreur demande permission:', error);
    }
  };

  const showTestNotification = () => {
    if (notificationsPermission === 'granted') {
      new Notification('AtelierPro', {
        body: 'Notifications activées avec succès ! 🎉',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'test-notification',
      });
    }
  };

  const subscribeToPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Vérifier si les notifications push sont supportées
      if (!('PushManager' in window)) {
        console.warn('[PWA] Push notifications non supportées');
        return;
      }

      // Clé publique VAPID (à remplacer par votre vraie clé)
      const applicationServerKey = 'BOxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey)
      });

      console.log('[PWA] Subscription push créée:', subscription);
      
      // Envoyer la subscription au serveur
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });

    } catch (error) {
      console.error('[PWA] Erreur subscription push:', error);
    }
  };

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      const result = await deferredPrompt.prompt();
      console.log('[PWA] Résultat installation:', result);

      if (result.outcome === 'accepted') {
        toast({
          title: "📱 Application installée",
          description: "AtelierPro est maintenant disponible sur votre écran d'accueil.",
        });
      }

      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('[PWA] Erreur installation:', error);
    }
  };

  const clearCache = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.active) {
          registration.active.postMessage({ type: 'CLEAR_CACHE' });
          
          toast({
            title: "🗑️ Cache vidé",
            description: "Les données en cache ont été supprimées.",
          });
          
          // Recharger la page après un délai
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (error) {
      console.error('[PWA] Erreur vidage cache:', error);
    }
  };

  // Utilitaire pour convertir la clé VAPID
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Statut de connexion */}
      <div className="flex items-center space-x-2 p-3 rounded-lg bg-muted">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5 text-green-500" />
            <span className="text-sm text-green-700">En ligne</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5 text-orange-500" />
            <span className="text-sm text-orange-700">Mode hors ligne</span>
          </>
        )}
      </div>

      {/* Boutons d'actions PWA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Installation de l'app */}
        {canInstall && (
          <Button 
            onClick={installApp}
            className="flex items-center space-x-2"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            <span>Installer l'app</span>
          </Button>
        )}

        {/* Notifications */}
        <Button 
          onClick={requestNotificationPermission}
          className="flex items-center space-x-2"
          variant={notificationsPermission === 'granted' ? 'default' : 'outline'}
          disabled={notificationsPermission === 'granted'}
        >
          <Bell className="h-4 w-4" />
          <span>
            {notificationsPermission === 'granted' ? 'Notifications ON' : 'Activer notifications'}
          </span>
        </Button>

        {/* Actions de développement */}
        <Button 
          onClick={clearCache}
          variant="outline"
          size="sm"
        >
          Vider le cache
        </Button>

        <Button 
          onClick={showTestNotification}
          variant="outline"
          size="sm"
          disabled={notificationsPermission !== 'granted'}
        >
          Test notification
        </Button>
      </div>

      {/* Informations PWA */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>Service Worker: {('serviceWorker' in navigator) ? '✅ Supporté' : '❌ Non supporté'}</div>
        <div>Notifications: {notificationsPermission}</div>
        <div>Cache API: {('caches' in window) ? '✅ Supporté' : '❌ Non supporté'}</div>
        <div>Background Sync: {('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) ? '✅ Supporté' : '❌ Non supporté'}</div>
      </div>
    </div>
  );
};

export default PWAFeatures;
