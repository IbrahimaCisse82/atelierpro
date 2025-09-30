import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Download, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2,
  Calendar,
  Clock,
  TrendingUp,
  UserCheck,
  FileText,
  Award,
  Shield
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { hrActions } from '@/utils/activateButtons';

export function HRPage() {
  const { user } = useAuth();
  const role = user?.role || 'customer_service';

  // Permissions (toutes activées pour les tests)
  const canViewAll = true;
  const canViewPlanning = true;
  const canViewPersonal = true;

  if (!role) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Ressources Humaines</h1>
        <Badge variant="outline">{role}</Badge>
      </div>
      {canViewAll && (
        <Card>
          <CardHeader>
            <CardTitle>Gestion des employés</CardTitle>
            <CardDescription>
              Accès complet aux fiches, paie, statistiques et documents RH.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold">Employés</h2>
              <Badge variant="outline">
                {'0'} employés
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button onClick={hrActions.addEmployee}>
                <Plus className="h-4 w-4 mr-2" /> Nouvel employé
              </Button>
              <Button variant="outline" onClick={hrActions.exportEmployees}>
                <Download className="h-4 w-4 mr-2" /> Exporter
              </Button>
              <Button variant="outline" onClick={hrActions.remunerations}>
                <DollarSign className="h-4 w-4 mr-2" /> Rémunérations
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Fiches de présence</CardTitle>
                  <CardDescription>
                    Visualisez et gérez les fiches de présence des employés.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">Présence</h3>
                    <Badge variant="outline">
                      {'0'} absences
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => hrActions.viewEmployee('Employé')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.editEmployee('Employé')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.deleteEmployee('Employé')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Bulletins de paie</CardTitle>
                  <CardDescription>
                    Accédez aux bulletins de paie et aux détails de la paie.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">Paie</h3>
                    <Badge variant="outline">
                      {'0'} bulletins
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => hrActions.viewEmployee('Bulletin')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.editEmployee('Bulletin')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.deleteEmployee('Bulletin')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Évaluations</CardTitle>
                  <CardDescription>
                    Suivez et gérez les évaluations des employés.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">Évaluations</h3>
                    <Badge variant="outline">
                      {'0'} évaluations
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => hrActions.viewEmployee('Évaluation')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.editEmployee('Évaluation')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.deleteEmployee('Évaluation')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Documents RH</CardTitle>
                  <CardDescription>
                    Accédez aux documents RH et gérez les fichiers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">Documents</h3>
                    <Badge variant="outline">
                      {'0'} documents
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => hrActions.viewEmployee('Document')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.editEmployee('Document')}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => hrActions.deleteEmployee('Document')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
      {canViewPlanning && !canViewAll && (
        <Card>
          <CardHeader>
            <CardTitle>Planning des tailleurs</CardTitle>
            <CardDescription>
              Accès limité au planning et aux tâches de production.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold">Planning</h2>
              <Badge variant="outline">
                Planning actuel
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button onClick={() => hrActions.viewEmployee('Planning')}>
                <Calendar className="h-4 w-4 mr-2" /> Voir planning
              </Button>
              <Button variant="outline" onClick={() => hrActions.editEmployee('Planning')}>
                <Clock className="h-4 w-4 mr-2" /> Modifier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {canViewPersonal && !canViewAll && !canViewPlanning && (
        <Card>
          <CardHeader>
            <CardTitle>Mon espace personnel</CardTitle>
            <CardDescription>
              Accès à vos informations personnelles et documents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-semibold">Mon profil</h2>
              <Badge variant="outline">
                {user?.firstName} {user?.lastName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Button onClick={() => hrActions.viewEmployee('Profil')}>
                <UserCheck className="h-4 w-4 mr-2" /> Mon profil
              </Button>
              <Button variant="outline" onClick={() => hrActions.viewEmployee('Documents')}>
                <FileText className="h-4 w-4 mr-2" /> Mes documents
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default HRPage;