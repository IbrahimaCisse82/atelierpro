import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  Scissors, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatFCFA } from '@/lib/utils';

interface DashboardWidget {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  roles: string[];
}

interface AlertItem {
  id: string;
  title: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  time: string;
}

const dashboardWidgets: DashboardWidget[] = [
  {
    title: 'Commandes en cours',
    value: 12,
    description: '+2 cette semaine',
    icon: ShoppingCart,
    trend: { value: 15, isPositive: true },
    color: 'text-blue-600',
    roles: ['owner', 'manager', 'orders', 'customer_service']
  },
  {
    title: 'Production active',
    value: 8,
    description: 'En cours de fabrication',
    icon: Scissors,
    trend: { value: 8, isPositive: true },
    color: 'text-green-600',
    roles: ['owner', 'manager', 'tailor']
  },
  {
    title: 'Stock faible',
    value: 3,
    description: 'Produits à réapprovisionner',
    icon: Package,
    trend: { value: -2, isPositive: false },
    color: 'text-orange-600',
    roles: ['owner', 'stocks']
  },
  {
    title: 'Clients actifs',
    value: 45,
    description: '+5 ce mois',
    icon: Users,
    trend: { value: 12, isPositive: true },
    color: 'text-purple-600',
    roles: ['owner', 'orders', 'customer_service']
  },
  {
    title: "Chiffre d'affaires",
    value: 12450, // valeur numérique pour formatage FCFA
    description: '+8% ce mois',
    icon: DollarSign,
    trend: { value: 8, isPositive: true },
    color: 'text-emerald-600',
    roles: ['owner']
  },
  {
    title: 'Factures en attente',
    value: 5,
    description: '3 200 FCFA à encaisser',
    icon: FileText,
    trend: { value: -1, isPositive: false },
    color: 'text-red-600',
    roles: ['owner', 'orders']
  }
];

const mockAlerts: AlertItem[] = [
  {
    id: '1',
    title: 'Commande en retard',
    message: 'Commande #1234 dépasse le délai de livraison',
    level: 'warning',
    time: 'Il y a 2h'
  },
  {
    id: '2',
    title: 'Stock faible',
    message: 'Tissu coton rouge en rupture',
    level: 'error',
    time: 'Il y a 4h'
  },
  {
    id: '3',
    title: 'Réception en attente',
    message: 'Commande fournisseur #5678 à réceptionner',
    level: 'info',
    time: 'Il y a 6h'
  }
];

const productionStatuses = [
  { status: 'En cours de coupe', count: 3, color: 'bg-blue-500' },
  { status: 'En assemblage', count: 4, color: 'bg-yellow-500' },
  { status: 'En finition', count: 2, color: 'bg-orange-500' },
  { status: 'Contrôle qualité', count: 1, color: 'bg-purple-500' },
  { status: 'Prêt à livrer', count: 2, color: 'bg-green-500' }
];

export function DashboardContent() {
  const { user } = useAuth();
  const [tab, setTab] = React.useState('overview');

  const filteredWidgets = dashboardWidgets.filter(widget => 
    widget.roles.includes(user?.role || '')
  );

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Onglets Dashboard */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="mb-6 bg-white/10 backdrop-blur rounded-xl p-1 flex gap-2">
          <TabsTrigger value="overview" className="font-semibold">Vue d’ensemble</TabsTrigger>
          <TabsTrigger value="reports" className="font-semibold">Rapports</TabsTrigger>
          <TabsTrigger value="alerts" className="font-semibold">Alertes</TabsTrigger>
          <TabsTrigger value="audit" className="font-semibold">Journal d’activité</TabsTrigger>
          <TabsTrigger value="export" className="font-semibold">Export & Rapports avancés</TabsTrigger>
        </TabsList>
        {/* Vue d’ensemble */}
        <TabsContent value="overview">
          {/* En-tête */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Tableau de bord</h1>
              <p className="text-muted-foreground">
                Bonjour {user?.firstName}, voici un aperçu de votre atelier
              </p>
            </div>
                     <div className="flex items-center gap-2">
               <Badge variant="outline" className="capitalize">
                 {user?.role || 'Utilisateur'}
               </Badge>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date().toLocaleDateString('fr-FR')}
              </Button>
            </div>
          </div>

          {/* Widgets statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWidgets.map((widget, index) => {
              const Icon = widget.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {widget.title}
                    </CardTitle>
                    <Icon className={cn("h-4 w-4", widget.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {typeof widget.value === 'number' && widget.title === "Chiffre d'affaires"
                        ? formatFCFA(widget.value as number)
                        : widget.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {widget.description}
                    </p>
                    {widget.trend && (
                      <div className="flex items-center mt-2">
                        <TrendingUp 
                          className={cn(
                            "h-3 w-3 mr-1",
                            widget.trend.isPositive ? "text-green-500" : "text-red-500"
                          )} 
                        />
                        <span className={cn(
                          "text-xs",
                          widget.trend.isPositive ? "text-green-500" : "text-red-500"
                        )}>
                          {widget.trend.isPositive ? '+' : ''}{widget.trend.value}%
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Statut de production */}
            {(user?.role === 'owner' || user?.role === 'manager' || user?.role === 'tailor') && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Scissors className="h-5 w-5 mr-2" />
                    Statut de production
                  </CardTitle>
                  <CardDescription>
                    Répartition des commandes par étape de production
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {productionStatuses.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-3 h-3 rounded-full", item.color)} />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{item.count}</span>
                        <Progress 
                          value={(item.count / 12) * 100} 
                          className="w-20" 
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Alertes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Alertes récentes
                </CardTitle>
                <CardDescription>
                  Notifications importantes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.title}</p>
                                             <Badge variant={getAlertBadgeVariant(alert.level)}>
                       {alert.level}
                     </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  Voir toutes les alertes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Graphiques et analyses */}
          {(user?.role === 'owner' || user?.role === 'manager') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Performance mensuelle
                  </CardTitle>
                  <CardDescription>
                    Évolution des commandes et du chiffre d'affaires
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Graphique en cours de développement
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Délais de production
                  </CardTitle>
                  <CardDescription>
                    Temps moyen par étape de production
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Graphique en cours de développement
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        {/* Rapports */}
        <TabsContent value="reports">
          <div className="p-6 text-center text-lg text-muted-foreground">Module Rapports à personnaliser</div>
        </TabsContent>
        {/* Alertes */}
        <TabsContent value="alerts">
          <div className="p-6 text-center text-lg text-muted-foreground">Module Alertes à personnaliser</div>
        </TabsContent>
        {/* Journal d’activité */}
        <TabsContent value="audit">
          <div className="p-6 text-center text-lg text-muted-foreground">Module Journal d’activité à personnaliser</div>
        </TabsContent>
        {/* Export & Rapports avancés */}
        <TabsContent value="export">
          <div className="p-6 text-center text-lg text-muted-foreground">Module Export & Rapports avancés à personnaliser</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}