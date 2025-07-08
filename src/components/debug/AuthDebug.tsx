import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Building2, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export function AuthDebug() {
  const { user, company, loading, error, isAuthenticated } = useAuth();
  const [showDebug, setShowDebug] = React.useState(false);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDebug(true)}
          className="bg-background/80 backdrop-blur-sm"
        >
          <Eye className="h-4 w-4 mr-2" />
          Debug Auth
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-y-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Authentification</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebug(false)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            État en temps réel de l'authentification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* État général */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">État général:</span>
              <Badge variant={isAuthenticated ? "default" : "secondary"}>
                {isAuthenticated ? "Connecté" : "Déconnecté"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Chargement:</span>
              <div className="flex items-center gap-1">
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>En cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Terminé</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Erreurs */}
          {error && (
            <div className="p-2 bg-destructive/10 border border-destructive/20 rounded">
              <div className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">Erreur:</span>
              </div>
              <p className="text-xs mt-1">{error}</p>
            </div>
          )}

          {/* Utilisateur */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium">Utilisateur:</span>
              </div>
              <div className="pl-4 space-y-1 text-xs">
                <div><span className="text-muted-foreground">ID:</span> {user.id}</div>
                <div><span className="text-muted-foreground">Nom:</span> {user.firstName} {user.lastName}</div>
                <div><span className="text-muted-foreground">Email:</span> {user.email}</div>
                <div><span className="text-muted-foreground">Rôle:</span> {user.role}</div>
                <div><span className="text-muted-foreground">Actif:</span> {user.isActive ? "Oui" : "Non"}</div>
                <div><span className="text-muted-foreground">Créé:</span> {user.createdAt.toLocaleDateString()}</div>
                {user.lastLogin && (
                  <div><span className="text-muted-foreground">Dernière connexion:</span> {user.lastLogin.toLocaleDateString()}</div>
                )}
              </div>
            </div>
          )}

          {/* Entreprise */}
          {company && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                <span className="font-medium">Entreprise:</span>
              </div>
              <div className="pl-4 space-y-1 text-xs">
                <div><span className="text-muted-foreground">ID:</span> {company.id}</div>
                <div><span className="text-muted-foreground">Nom:</span> {company.name}</div>
                <div><span className="text-muted-foreground">Email:</span> {company.email}</div>
                <div><span className="text-muted-foreground">Actif:</span> {company.isActive ? "Oui" : "Non"}</div>
                <div><span className="text-muted-foreground">Créée:</span> {company.createdAt.toLocaleDateString()}</div>
              </div>
            </div>
          )}

          {/* État vide */}
          {!user && !company && !loading && (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>Aucune donnée utilisateur</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 