import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useDashboardAlerts } from '@/hooks/use-dashboard-alerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Scissors,
  FileText,
  Briefcase,
  Warehouse,
  CreditCard
} from 'lucide-react';

// Configuration des sections du dashboard par domaine fonctionnel
interface StatCard {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

interface DashboardSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  cards: StatCard[];
  requiredRoles?: string[];
}

const formatFCFA = (amount: number) => {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
};

const getDashboardSections = (stats: any): DashboardSection[] => {
  if (!stats) return [];

  return [
    {
      title: 'Gestion Commerciale',
      icon: Briefcase,
      requiredRoles: ['owner', 'manager', 'orders'],
      cards: [
        {
          title: 'Commandes Actives',
          value: stats.activeOrders || 0,
          description: 'En cours de traitement',
          icon: ShoppingCart,
          color: 'text-blue-600',
        },
        {
          title: 'Clients Actifs',
          value: stats.activeClients || 0,
          description: `+${stats.thisMonthClients || 0} ce mois`,
          icon: Users,
          color: 'text-green-600',
          trend: { value: stats.thisMonthClients || 0, isPositive: true },
        },
        {
          title: 'Factures Impayées',
          value: stats.unpaidInvoicesCount || 0,
          description: formatFCFA(stats.unpaidInvoicesTotal || 0),
          icon: FileText,
          color: 'text-orange-600',
        },
      ],
    },
    {
      title: 'Production & Stocks',
      icon: Warehouse,
      requiredRoles: ['owner', 'manager', 'tailor', 'stocks'],
      cards: [
        {
          title: 'Tâches en Production',
          value: stats.productionActive || 0,
          description: 'En cours de fabrication',
          icon: Scissors,
          color: 'text-purple-600',
        },
        {
          title: 'Stock Faible',
          value: stats.lowStockCount || 0,
          description: 'Articles à réapprovisionner',
          icon: Package,
          color: 'text-red-600',
        },
      ],
    },
    {
      title: 'Finance',
      icon: CreditCard,
      requiredRoles: ['owner', 'manager'],
      cards: [
        {
          title: 'Revenu Total',
          value: formatFCFA(stats.totalRevenue || 0),
          description: 'Paiements reçus',
          icon: DollarSign,
          color: 'text-emerald-600',
        },
        {
          title: 'Montant Impayé',
          value: formatFCFA(stats.unpaidInvoicesTotal || 0),
          description: `${stats.unpaidInvoicesCount || 0} factures`,
          icon: AlertCircle,
          color: 'text-amber-600',
        },
      ],
    },
  ];
};

export function DashboardContent() {
  const { user } = useAuth();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: alerts, isLoading: isLoadingAlerts } = useDashboardAlerts();

  const sections = getDashboardSections(stats).filter((section) => {
    if (!section.requiredRoles) return true;
    return section.requiredRoles.some(role => role === user?.role);
  });

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'warning':
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'destructive';
      case 'warning':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* En-tête avec bienvenue */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Tableau de Bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue, {user?.firstName || user?.email?.split('@')[0]}
          </p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {user?.role === 'owner' && '👑 Propriétaire'}
          {user?.role === 'manager' && '👨‍💼 Manager'}
          {user?.role === 'orders' && '📋 Commandes'}
          {user?.role === 'tailor' && '✂️ Tailleur'}
          {user?.role === 'stocks' && '📦 Stocks'}
        </Badge>
      </div>

      {/* Sections par domaine fonctionnel */}
      {sections.map((section, sectionIndex) => {
        const SectionIcon = section.icon;
        return (
          <div key={sectionIndex} className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-2">
              <SectionIcon className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{section.title}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingStats ? (
                Array.from({ length: section.cards.length }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-3 w-40" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                section.cards.map((card, cardIndex) => {
                  const CardIcon = card.icon;
                  return (
                    <Card
                      key={cardIndex}
                      className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {card.title}
                        </CardTitle>
                        <CardIcon className={`h-5 w-5 ${card.color}`} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{card.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {card.description}
                        </p>
                        {card.trend && (
                          <div className="flex items-center mt-2 text-xs">
                            {card.trend.isPositive ? (
                              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                            )}
                            <span
                              className={
                                card.trend.isPositive
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              +{card.trend.value}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </div>
        );
      })}

      {/* Détail Production pour les rôles concernés */}
      {user?.role && ['owner', 'manager', 'tailor'].includes(user.role) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-purple-600" />
              Détail de la Production
            </CardTitle>
            <CardDescription>
              Répartition des tâches par étape de fabrication
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  {
                    label: 'En attente',
                    value: stats?.productionStatuses?.cutting || 0,
                    color: 'bg-blue-500',
                    icon: Clock,
                  },
                  {
                    label: 'En cours',
                    value: stats?.productionStatuses?.sewing || 0,
                    color: 'bg-purple-500',
                    icon: Scissors,
                  },
                  {
                    label: 'Terminées',
                    value: stats?.productionStatuses?.finishing || 0,
                    color: 'bg-green-500',
                    icon: CheckCircle,
                  },
                ].map((status, index) => {
                  const StatusIcon = status.icon;
                  return (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <StatusIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            {status.label}
                          </span>
                          <span className="text-sm font-bold">
                            {status.value} tâches
                          </span>
                        </div>
                        <div className="w-full bg-secondary h-3 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${status.color} transition-all duration-500`}
                            style={{
                              width: `${Math.min(
                                (status.value / Math.max(stats?.productionActive || 1, 10)) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Alertes récentes */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            Alertes Récentes
          </CardTitle>
          <CardDescription>
            Les 5 dernières notifications importantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAlerts ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={getAlertColor(alert.level) as any}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {alert.title}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {alert.level}
                        </Badge>
                      </div>
                      <AlertDescription className="text-xs">
                        {alert.message}
                      </AlertDescription>
                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-16 w-16 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">Aucune alerte active</p>
              <p className="text-xs mt-1">Tout fonctionne correctement</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
