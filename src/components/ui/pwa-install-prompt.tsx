import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  X,
  Wifi,
  WifiOff,
  Smartphone
} from 'lucide-react';
import { usePWA } from '@/hooks/use-pwa';
import { useOfflineStorage } from '@/hooks/use-offline-storage';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const { isInstalled, isOnline, hasUpdate, isUpdateReady, isLoading, installApp, forceUpdate, checkForUpdates } = usePWA();
  const { pendingActions, isSyncing, syncPendingActions } = useOfflineStorage();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);

  // Écouter l'événement d'installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as InstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Gérer l'installation
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  };

  // Masquer le prompt
  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  // Si l'app est installée et qu'il n'y a pas de mises à jour, ne rien afficher
  if (isInstalled && !hasUpdate && !isUpdateReady && pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      {/* Prompt d'installation */}
      {showInstallPrompt && !isInstalled && (
        <Card className="mb-4 shadow-lg border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Installer AtelierPro</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription>
              Installez l'application pour un accès rapide et le mode hors ligne
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Accès rapide depuis l'écran d'accueil
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Fonctionnement hors ligne
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Mises à jour automatiques
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleInstall} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Installer
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Plus tard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification de mise à jour */}
      {hasUpdate && (
        <Card className="mb-4 shadow-lg border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-lg text-orange-800">Mise à jour disponible</CardTitle>
              </div>
            </div>
            <CardDescription className="text-orange-700">
              Une nouvelle version d'AtelierPro est disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={forceUpdate} 
              variant="outline" 
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mettre à jour maintenant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification de synchronisation */}
      {pendingActions.length > 0 && (
        <Card className="mb-4 shadow-lg border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi className="h-5 w-5 text-blue-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-blue-600" />
                )}
                <CardTitle className="text-lg text-blue-800">
                  {isOnline ? 'Synchronisation' : 'Mode hors ligne'}
                </CardTitle>
              </div>
              <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                {pendingActions.length}
              </Badge>
            </div>
            <CardDescription className="text-blue-700">
              {isOnline 
                ? `${pendingActions.length} action(s) en attente de synchronisation`
                : `${pendingActions.length} action(s) enregistrée(s) hors ligne`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isSyncing && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Synchronisation en cours...</span>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                </div>
                <Progress value={50} className="h-2" />
              </div>
            )}
            {isOnline && !isSyncing && (
              <Button 
                onClick={syncPendingActions} 
                variant="outline" 
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Wifi className="h-4 w-4 mr-2" />
                Synchroniser maintenant
              </Button>
            )}
            {!isOnline && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <WifiOff className="h-4 w-4" />
                Les actions seront synchronisées quand vous serez en ligne
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Barre de statut générale */}
      <Card className="shadow-lg">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isInstalled && (
                <Badge variant="outline" className="text-xs">
                  <Smartphone className="h-3 w-3 mr-1" />
                  Installée
                </Badge>
              )}
              {hasUpdate && (
                <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Mise à jour
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 