import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  Edit, 
  Save, 
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { cn } from '@/lib/utils';

export function UserProfile() {
  const { user, company, switchRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'owner');

  if (!user || !company) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profil non disponible</h3>
          <p className="text-muted-foreground">
            Impossible de charger les informations du profil.
          </p>
        </div>
      </div>
    );
  }

  const roleInfo = ROLE_PERMISSIONS[user.role];
  const isActive = user.isActive && company.isActive;

  const handleRoleChange = async () => {
    try {
      await switchRole(selectedRole as 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* En-tête du profil */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et paramètres
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2"
        >
          {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {isEditing ? 'Annuler' : 'Modifier'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Personnelles
            </CardTitle>
            <CardDescription>
              Vos données personnelles et informations de contact
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant={isActive ? "default" : "secondary"} className="mt-1">
                  {isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Actif
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Inactif
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Membre depuis</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>

              {user.lastLogin && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dernière connexion</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(user.lastLogin)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Informations de l'entreprise */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l'Entreprise
            </CardTitle>
            <CardDescription>
              Détails de votre atelier de couture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
                <Building2 className="h-8 w-8 text-secondary-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
                <p className="text-muted-foreground">{company.email}</p>
                <Badge variant={company.isActive ? "default" : "secondary"} className="mt-1">
                  {company.isActive ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Entreprise active
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Entreprise inactive
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Créée le</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(company.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rôle et permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rôle et Permissions
            </CardTitle>
            <CardDescription>
              Votre rôle dans l'entreprise et les permissions associées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Changer de rôle</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                      <option key={role} value={role}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRoleChange} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedRole(user.role);
                      setIsEditing(false);
                    }}
                    size="sm"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <Badge variant="outline" className="text-sm">
                    {roleInfo.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {roleInfo.description}
                </p>
                
                <div>
                  <p className="text-sm font-medium mb-2">Modules accessibles :</p>
                  <div className="flex flex-wrap gap-1">
                    {roleInfo.modules.map((module) => (
                      <Badge key={module} variant="secondary" className="text-xs">
                        {module === 'all' ? 'Tous les modules' : module}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      roleInfo.canManageUsers ? "text-green-500" : "text-gray-300"
                    )} />
                    <span className="text-sm">Gestion des utilisateurs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      roleInfo.canViewFinancial ? "text-green-500" : "text-gray-300"
                    )} />
                    <span className="text-sm">Accès aux données financières</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={cn(
                      "h-4 w-4",
                      roleInfo.canManageCompany ? "text-green-500" : "text-gray-300"
                    )} />
                    <span className="text-sm">Gestion de l'entreprise</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistiques d'activité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activité Récente
            </CardTitle>
            <CardDescription>
              Votre activité dans l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Dernière connexion</span>
                <span className="text-sm font-medium">
                  {user.lastLogin ? formatDate(user.lastLogin) : 'Aucune'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Membre depuis</span>
                <span className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm">Statut du compte</span>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 