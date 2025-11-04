import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/ui/logo';

export default function InstallPage() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Écouter l'installation
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="text-center mb-8">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Installer AtelierPro</h1>
          <p className="text-muted-foreground">
            Accédez à votre atelier depuis votre téléphone, comme une vraie application
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Android Installation */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-green-600" />
                Installation Android
              </CardTitle>
              <CardDescription>
                Chrome, Edge, Samsung Internet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInstalled ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <Check className="h-5 w-5" />
                  Application déjà installée
                </div>
              ) : isInstallable ? (
                <Button
                  onClick={handleInstall}
                  className="w-full bg-gradient-primary"
                  size="lg"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Installer Maintenant
                </Button>
              ) : (
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                    <span>Ouvrez le menu du navigateur (⋮ en haut à droite)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                    <span>Appuyez sur "Ajouter à l'écran d'accueil" ou "Installer l'application"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                    <span>Confirmez l'installation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">4</span>
                    <span>L'icône AtelierPro apparaîtra sur votre écran d'accueil</span>
                  </li>
                </ol>
              )}
            </CardContent>
          </Card>

          {/* iOS Installation */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                Installation iOS (iPhone/iPad)
              </CardTitle>
              <CardDescription>
                Safari uniquement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</span>
                  <span>Ouvrez cette page dans Safari (obligatoire)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</span>
                  <span>Appuyez sur le bouton Partager <span className="inline-block">□↑</span> (en bas)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</span>
                  <span>Faites défiler et appuyez sur "Sur l'écran d'accueil"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">4</span>
                  <span>Appuyez sur "Ajouter" en haut à droite</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">5</span>
                  <span>L'icône AtelierPro apparaîtra sur votre écran d'accueil</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Avantages */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Pourquoi installer l'application ?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Accès Rapide</h3>
                <p className="text-sm text-muted-foreground">
                  Icône sur votre écran d'accueil, lancement instantané
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-3">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Fonctionne Hors Ligne</h3>
                <p className="text-sm text-muted-foreground">
                  Continuez à travailler même sans connexion internet
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Expérience Native</h3>
                <p className="text-sm text-muted-foreground">
                  Interface plein écran sans barre de navigation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>L'installation ne prend aucun espace sur votre téléphone</p>
          <p>Vous pouvez désinstaller à tout moment en maintenant l'icône appuyée</p>
        </div>
      </div>
    </div>
  );
}
