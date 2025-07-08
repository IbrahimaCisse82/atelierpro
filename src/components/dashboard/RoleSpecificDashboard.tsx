import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Settings,
  UserCheck,
  Truck,
  CreditCard,
  Receipt,
  Scissors,
  Ruler,
  Folder,
  Star,
  MessageSquare,
  Bell,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les métriques
interface DashboardMetric {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
  description?: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'client' | 'production' | 'payment' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

// Données simulées
const mockQuickActions = {
  owner: [
    {
      title: "Nouvelle commande",
      description: "Créer une commande client",
      icon: <Plus className="h-4 w-4" />,
      action: () => console.log("Nouvelle commande"),
      color: "bg-blue-500"
    },
    {
      title: "Rapport financier",
      description: "Voir les performances",
      icon: <BarChart3 className="h-4 w-4" />,
      action: () => console.log("Rapport financier"),
      color: "bg-green-500"
    },
    {
      title: "Gestion RH",
      description: "Gérer les employés",
      icon: <UserCheck className="h-4 w-4" />,
      action: () => console.log("Gestion RH"),
      color: "bg-purple-500"
    }
  ],
  manager: [
    {
      title: "Planifier production",
      description: "Organiser les tâches",
      icon: <Calendar className="h-4 w-4" />,
      action: () => console.log("Planifier production"),
      color: "bg-blue-500"
    },
    {
      title: "Suivi équipe",
      description: "Voir les performances",
      icon: <Target className="h-4 w-4" />,
      action: () => console.log("Suivi équipe"),
      color: "bg-green-500"
    },
    {
      title: "Alertes",
      description: "Gérer les priorités",
      icon: <Bell className="h-4 w-4" />,
      action: () => console.log("Alertes"),
      color: "bg-orange-500"
    }
  ],
  orders: [
    {
      title: "Nouvelle commande",
      description: "Créer une commande",
      icon: <Plus className="h-4 w-4" />,
      action: () => console.log("Nouvelle commande"),
      color: "bg-blue-500"
    },
    {
      title: "Mesures client",
      description: "Prendre des mesures",
      icon: <Ruler className="h-4 w-4" />,
      action: () => console.log("Mesures client"),
      color: "bg-green-500"
    },
    {
      title: "Suivi commandes",
      description: "Voir les statuts",
      icon: <Eye className="h-4 w-4" />,
      action: () => console.log("Suivi commandes"),
      color: "bg-purple-500"
    }
  ],
  production: [
    {
      title: "Tâches du jour",
      description: "Voir mes tâches",
      icon: <Target className="h-4 w-4" />,
      action: () => console.log("Tâches du jour"),
      color: "bg-blue-500"
    },
    {
      title: "Signaler problème",
      description: "Alerter un problème",
      icon: <AlertTriangle className="h-4 w-4" />,
      action: () => console.log("Signaler problème"),
      color: "bg-red-500"
    },
    {
      title: "Terminer tâche",
      description: "Marquer comme terminé",
      icon: <CheckCircle className="h-4 w-4" />,
      action: () => console.log("Terminer tâche"),
      color: "bg-green-500"
    }
  ],
  customer_service: [
    {
      title: "Nouveau client",
      description: "Ajouter un client",
      icon: <Plus className="h-4 w-4" />,
      action: () => console.log("Nouveau client"),
      color: "bg-blue-500"
    },
    {
      title: "Support client",
      description: "Aider les clients",
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => console.log("Support client"),
      color: "bg-green-500"
    },
    {
      title: "Mesures",
      description: "Gérer les mesures",
      icon: <Ruler className="h-4 w-4" />,
      action: () => console.log("Mesures"),
      color: "bg-purple-500"
    }
  ]
};

const mockRecentActivities = [
  {
    id: '1',
    type: 'order' as const,
    title: 'Nouvelle commande créée',
    description: 'Commande #1234 pour Marie Dupont',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'success' as const
  },
  {
    id: '2',
    type: 'production' as const,
    title: 'Production terminée',
    description: 'Commande #1230 livrée',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'success' as const
  },
  {
    id: '3',
    type: 'payment' as const,
    title: 'Paiement reçu',
    description: 'Facture #F2024-001 payée',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    status: 'success' as const
  },
  {
    id: '4',
    type: 'alert' as const,
    title: 'Stock faible',
    description: 'Tissu coton rouge en rupture',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    status: 'warning' as const
  },
  {
    id: '5',
    type: 'client' as const,
    title: 'Nouveau client',
    description: 'Sophie Bernard ajoutée',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    status: 'info' as const
  }
];

const mockMetrics = {
  owner: [
    {
      title: "Chiffre d'affaires",
      value: "€45,230",
      change: 12.5,
      changeType: 'increase' as const,
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-green-600",
      description: "Ce mois"
    },
    {
      title: "Commandes",
      value: 156,
      change: 8.2,
      changeType: 'increase' as const,
      icon: <ShoppingCart className="h-4 w-4" />,
      color: "text-blue-600",
      description: "En cours"
    },
    {
      title: "Clients actifs",
      value: 89,
      change: -2.1,
      changeType: 'decrease' as const,
      icon: <Users className="h-4 w-4" />,
      color: "text-purple-600",
      description: "Ce mois"
    },
    {
      title: "Production",
      value: "78%",
      change: 5.3,
      changeType: 'increase' as const,
      icon: <Package className="h-4 w-4" />,
      color: "text-orange-600",
      description: "Efficacité"
    }
  ],
  manager: [
    {
      title: "Commandes en cours",
      value: 23,
      change: 15.4,
      changeType: 'increase' as const,
      icon: <Clock className="h-4 w-4" />,
      color: "text-blue-600",
      description: "À traiter"
    },
    {
      title: "Production du jour",
      value: 12,
      change: -3.2,
      changeType: 'decrease' as const,
      icon: <Scissors className="h-4 w-4" />,
      color: "text-green-600",
      description: "Pièces terminées"
    },
    {
      title: "Clients satisfaits",
      value: "94%",
      change: 2.1,
      changeType: 'increase' as const,
      icon: <Star className="h-4 w-4" />,
      color: "text-yellow-600",
      description: "Satisfaction"
    },
    {
      title: "Alertes",
      value: 3,
      change: -50,
      changeType: 'decrease' as const,
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-red-600",
      description: "En attente"
    }
  ],
  orders: [
    {
      title: "Nouvelles commandes",
      value: 8,
      change: 25,
      changeType: 'increase' as const,
      icon: <Plus className="h-4 w-4" />,
      color: "text-green-600",
      description: "Aujourd'hui"
    },
    {
      title: "En production",
      value: 15,
      change: 0,
      changeType: 'increase' as const,
      icon: <Package className="h-4 w-4" />,
      color: "text-blue-600",
      description: "En cours"
    },
    {
      title: "À livrer",
      value: 6,
      change: -20,
      changeType: 'decrease' as const,
      icon: <Truck className="h-4 w-4" />,
      color: "text-orange-600",
      description: "Cette semaine"
    },
    {
      title: "Mesures en attente",
      value: 4,
      change: 100,
      changeType: 'increase' as const,
      icon: <Ruler className="h-4 w-4" />,
      color: "text-purple-600",
      description: "À prendre"
    }
  ],
  production: [
    {
      title: "Tâches du jour",
      value: 18,
      change: 0,
      changeType: 'increase' as const,
      icon: <Target className="h-4 w-4" />,
      color: "text-blue-600",
      description: "À réaliser"
    },
    {
      title: "Terminées",
      value: 12,
      change: 20,
      changeType: 'increase' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      description: "Aujourd'hui"
    },
    {
      title: "En retard",
      value: 2,
      change: -50,
      changeType: 'decrease' as const,
      icon: <XCircle className="h-4 w-4" />,
      color: "text-red-600",
      description: "À rattraper"
    },
    {
      title: "Efficacité",
      value: "85%",
      change: 5,
      changeType: 'increase' as const,
      icon: <Activity className="h-4 w-4" />,
      color: "text-purple-600",
      description: "Ce mois"
    }
  ],
  customer_service: [
    {
      title: "Tickets ouverts",
      value: 7,
      change: -12.5,
      changeType: 'decrease' as const,
      icon: <MessageSquare className="h-4 w-4" />,
      color: "text-blue-600",
      description: "En cours"
    },
    {
      title: "Résolus aujourd'hui",
      value: 15,
      change: 25,
      changeType: 'increase' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      color: "text-green-600",
      description: "Tickets fermés"
    },
    {
      title: "Satisfaction client",
      value: "96%",
      change: 2,
      changeType: 'increase' as const,
      icon: <Star className="h-4 w-4" />,
      color: "text-yellow-600",
      description: "Ce mois"
    },
    {
      title: "Temps de réponse",
      value: "2.3h",
      change: -15,
      changeType: 'decrease' as const,
      icon: <Clock className="h-4 w-4" />,
      color: "text-orange-600",
      description: "Moyenne"
    }
  ]
};

export function RoleSpecificDashboard() {
  const { user } = useAuth();
  const userRole = user?.role || 'customer_service';

  const metrics = mockMetrics[userRole as keyof typeof mockMetrics] || mockMetrics.customer_service;
  const quickActions = mockQuickActions[userRole as keyof typeof mockQuickActions] || mockQuickActions.customer_service;

  const getRoleTitle = (role: string) => {
    switch (role) {
      case 'owner': return "Tableau de bord - Direction";
      case 'manager': return "Tableau de bord - Management";
      case 'orders': return "Tableau de bord - Commandes";
      case 'production': return "Tableau de bord - Production";
      case 'customer_service': return "Tableau de bord - Service Client";
      default: return "Tableau de bord";
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'owner': return "Vue d'ensemble de l'entreprise et indicateurs clés";
      case 'manager': return "Gestion des opérations et suivi des équipes";
      case 'orders': return "Gestion des commandes et relation client";
      case 'production': return "Suivi de la production et planification";
      case 'customer_service': return "Support client et gestion des demandes";
      default: return "Tableau de bord personnalisé";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart className="h-4 w-4" />;
      case 'production': return <Package className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'client': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'info': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{getRoleTitle(userRole)}</h1>
          <p className="text-muted-foreground">
            {getRoleDescription(userRole)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            <UserCheck className="h-3 w-3 mr-1" />
            {user?.firstName} {user?.lastName}
          </Badge>
          <Badge variant="secondary">
            {userRole}
          </Badge>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  {metric.change !== undefined && (
                    <div className="flex items-center mt-1">
                      {metric.changeType === 'increase' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span className={cn(
                        "text-xs",
                        metric.changeType === 'increase' ? "text-green-500" : "text-red-500"
                      )}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  )}
                  {metric.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.description}
                    </p>
                  )}
                </div>
                <div className={cn("p-2 rounded-full", metric.color.replace('text-', 'bg-').replace('-600', '-100'))}>
                  <div className={metric.color}>
                    {metric.icon}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Actions rapides */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Actions rapides
            </CardTitle>
            <CardDescription>
              Accès direct aux fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start h-auto p-3"
                onClick={action.action}
              >
                <div className={cn("p-2 rounded-full mr-3", action.color)}>
                  <div className="text-white">
                    {action.icon}
                  </div>
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Activités récentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Activités récentes
            </CardTitle>
            <CardDescription>
              Dernières actions et événements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={cn("p-2 rounded-full", getStatusColor(activity.status))}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs", getStatusColor(activity.status))}
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et analyses spécifiques au rôle */}
      {userRole === 'owner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Évolution du chiffre d'affaires
              </CardTitle>
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
                <PieChart className="h-5 w-5 mr-2" />
                Répartition des commandes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Graphique en cours de développement
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {userRole === 'manager' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Objectifs de production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Production du jour</span>
                  <span>12/15 pièces</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Commandes en cours</span>
                  <span>23/30 traitées</span>
                </div>
                <Progress value={77} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Satisfaction client</span>
                  <span>94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {userRole === 'production' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Planning de production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Commande #1234</p>
                  <p className="text-sm text-muted-foreground">Robe d'été - Marie Dupont</p>
                </div>
                <Badge variant="default">En cours</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Commande #1235</p>
                  <p className="text-sm text-muted-foreground">Costume - Jean Martin</p>
                </div>
                <Badge variant="secondary">En attente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="font-medium">Commande #1236</p>
                  <p className="text-sm text-muted-foreground">Blouse - Sophie Bernard</p>
                </div>
                <Badge variant="outline">Planifiée</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 