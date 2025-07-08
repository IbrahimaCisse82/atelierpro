import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/types/auth';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Bell,
  Plus,
  Eye
} from 'lucide-react';

// Données simulées pour différents widgets selon le rôle
const getWidgetsForRole = (role: string) => {
  const widgets = {
    owner: [
      {
        type: 'recent-orders',
        title: 'Commandes Récentes',
        description: 'Dernières commandes créées',
        items: [
          { client: 'Marie Dupont', item: 'Robe de soirée', status: 'En cours', date: '2024-01-15' },
          { client: 'Jean Martin', item: 'Costume 3 pièces', status: 'Terminé', date: '2024-01-14' },
          { client: 'Sophie Bernard', item: 'Retouches veste', status: 'En attente', date: '2024-01-13' }
        ]
      },
      {
        type: 'team-performance',
        title: 'Performance Équipe',
        description: 'Productivité des tailleurs cette semaine',
        items: [
          { name: 'Alice Couture', completed: 8, target: 10, efficiency: 80 },
          { name: 'Marc Tailleur', completed: 12, target: 10, efficiency: 120 },
          { name: 'Emma Style', completed: 9, target: 10, efficiency: 90 }
        ]
      }
    ],
    manager: [
      {
        type: 'production-queue',
        title: 'File de Production',
        description: 'Commandes à attribuer aux tailleurs',
        items: [
          { order: '#2024-001', client: 'Marie Dupont', priority: 'Urgent', deadline: '2024-01-20' },
          { order: '#2024-002', client: 'Paul Durand', priority: 'Normal', deadline: '2024-01-25' },
          { order: '#2024-003', client: 'Lisa Chen', priority: 'Faible', deadline: '2024-01-30' }
        ]
      },
      {
        type: 'tailor-availability',
        title: 'Disponibilité Tailleurs',
        description: 'État de l\'équipe aujourd\'hui',
        items: [
          { name: 'Alice Couture', status: 'Disponible', current: null },
          { name: 'Marc Tailleur', status: 'Occupé', current: 'Costume #2024-001' },
          { name: 'Emma Style', status: 'Congé', current: null }
        ]
      }
    ],
    tailor: [
      {
        type: 'my-tasks',
        title: 'Mes Tâches',
        description: 'Commandes qui me sont assignées',
        items: [
          { order: '#2024-001', client: 'Marie Dupont', task: 'Assemblage', deadline: '2024-01-18', progress: 75 },
          { order: '#2024-004', client: 'Claire Martin', task: 'Finitions', deadline: '2024-01-22', progress: 30 },
          { order: '#2024-007', client: 'Tom Wilson', task: 'Découpe', deadline: '2024-01-25', progress: 0 }
        ]
      }
    ],
    orders: [
      {
        type: 'pending-quotes',
        title: 'Devis en Attente',
        description: 'Devis à confirmer par les clients',
        items: [
          { client: 'Sophie Bernard', item: 'Robe de mariée', amount: '850€', date: '2024-01-10' },
          { client: 'Michel Dubois', item: 'Retouches costume', amount: '120€', date: '2024-01-12' },
          { client: 'Ana Garcia', item: 'Jupe sur mesure', amount: '180€', date: '2024-01-13' }
        ]
      },
      {
        type: 'overdue-payments',
        title: 'Paiements en Retard',
        description: 'Factures échues à relancer',
        items: [
          { client: 'Paul Durand', invoice: 'F-2024-001', amount: '450€', days: 5 },
          { client: 'Marie Legrand', invoice: 'F-2024-003', amount: '320€', days: 12 }
        ]
      }
    ],
    stocks: [
      {
        type: 'low-stock',
        title: 'Stock Faible',
        description: 'Articles nécessitant un réapprovisionnement',
        items: [
          { item: 'Fil polyester noir', current: 5, minimum: 20, unit: 'bobines' },
          { item: 'Tissu coton blanc', current: 2, minimum: 10, unit: 'mètres' },
          { item: 'Boutons nacre 15mm', current: 12, minimum: 50, unit: 'pièces' }
        ]
      },
      {
        type: 'recent-deliveries',
        title: 'Livraisons Récentes',
        description: 'Dernières réceptions fournisseurs',
        items: [
          { supplier: 'Tissus & Co', items: 'Lot tissus hiver', date: '2024-01-14', status: 'Réceptionné' },
          { supplier: 'Mercerie Plus', items: 'Fournitures diverses', date: '2024-01-13', status: 'En attente' }
        ]
      }
    ],
    customer_service: [
      {
        type: 'open-tickets',
        title: 'Tickets Ouverts',
        description: 'Demandes clients en cours',
        items: [
          { client: 'Marie Dupont', subject: 'Modification robe', priority: 'Urgent', date: '2024-01-15' },
          { client: 'Jean Martin', subject: 'Question délai', priority: 'Normal', date: '2024-01-14' },
          { client: 'Sophie Bernard', subject: 'Satisfaction service', priority: 'Faible', date: '2024-01-13' }
        ]
      }
    ]
  };

  return widgets[role as keyof typeof widgets] || [];
};

export function DashboardContent() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const roleInfo = ROLE_PERMISSIONS[user.role];
  const widgets = getWidgetsForRole(user.role);

  return (
    <div className="p-6 space-y-6">
      {/* En-tête du dashboard */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard {roleInfo.label}
          </h1>
          <p className="text-muted-foreground mt-1">
            {roleInfo.description}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          {user.role !== 'tailor' && (
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle action
            </Button>
          )}
        </div>
      </div>

      {/* Statistiques */}
      <DashboardStats />

      {/* Widgets adaptatifs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {widgets.map((widget, index) => (
          <Card key={index} className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{widget.title}</CardTitle>
                  <CardDescription>{widget.description}</CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {widget.type === 'recent-orders' && (
                <div className="space-y-3">
                  {widget.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.client}</p>
                        <p className="text-sm text-muted-foreground">{item.item}</p>
                      </div>
                      <Badge variant={item.status === 'Terminé' ? 'default' : 'secondary'}>
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {widget.type === 'team-performance' && (
                <div className="space-y-4">
                  {widget.items.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {item.completed}/{item.target}
                        </span>
                      </div>
                      <Progress value={item.efficiency} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {widget.type === 'production-queue' && (
                <div className="space-y-3">
                  {widget.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.order}</p>
                        <p className="text-sm text-muted-foreground">{item.client}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={item.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                          {item.priority}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{item.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {widget.type === 'my-tasks' && (
                <div className="space-y-4">
                  {widget.items.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.order} - {item.task}</p>
                          <p className="text-sm text-muted-foreground">{item.client}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.deadline}</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              )}

              {widget.type === 'low-stock' && (
                <div className="space-y-3">
                  {widget.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.current} {item.unit} restant(s)
                        </p>
                      </div>
                      <Badge variant="destructive">Stock faible</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Autres types de widgets... */}
              {(widget.type === 'pending-quotes' || widget.type === 'overdue-payments' || 
                widget.type === 'tailor-availability' || widget.type === 'recent-deliveries' || 
                widget.type === 'open-tickets') && (
                <div className="space-y-3">
                  {widget.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">
                          {item.client || item.name || item.supplier || 'N/A'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.item || item.current || item.items || item.subject || 'Détails'}
                        </p>
                      </div>
                      <div className="text-right">
                        {item.status && (
                          <Badge variant={item.status === 'Disponible' ? 'default' : 'secondary'}>
                            {item.status}
                          </Badge>
                        )}
                        {item.priority && (
                          <Badge variant={item.priority === 'Urgent' ? 'destructive' : 'secondary'}>
                            {item.priority}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Widget d'accès rapide selon le rôle */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Accès Rapide</CardTitle>
          <CardDescription>Actions fréquentes pour votre rôle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.role === 'owner' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Gérer l'équipe
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Rapports financiers
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  Toutes les commandes
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <AlertTriangle className="h-6 w-6 mb-2" />
                  Alertes système
                </Button>
              </>
            )}
            
            {user.role === 'manager' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Planning
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="h-6 w-6 mb-2" />
                  Attribuer tâches
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Clock className="h-6 w-6 mb-2" />
                  Suivi délais
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Validation qualité
                </Button>
              </>
            )}

            {user.role === 'tailor' && (
              <>
                <Button variant="outline" className="h-20 flex-col">
                  <ShoppingBag className="h-6 w-6 mb-2" />
                  Mes commandes
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Clock className="h-6 w-6 mb-2" />
                  Pointer temps
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <CheckCircle className="h-6 w-6 mb-2" />
                  Marquer terminé
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="h-6 w-6 mb-2" />
                  Mon planning
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}