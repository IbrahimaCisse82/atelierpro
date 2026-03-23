import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/use-dashboard-stats';
import { useDashboardAlerts } from '@/hooks/use-dashboard-alerts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Users, Package, ShoppingCart, DollarSign,
  AlertCircle, CheckCircle, Clock, Scissors, FileText, Briefcase,
  Warehouse, CreditCard, Truck
} from 'lucide-react';
import { formatFCFA } from '@/lib/utils';

const COLORS = ['hsl(220,60%,35%)', 'hsl(35,65%,55%)', 'hsl(145,60%,35%)', 'hsl(0,75%,55%)', 'hsl(280,50%,50%)'];

export function DashboardContent() {
  const { user } = useAuth();
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { data: alerts, isLoading: isLoadingAlerts } = useDashboardAlerts();

  const productionChartData = stats ? [
    { name: 'En attente', value: stats.productionStatuses?.cutting || 0 },
    { name: 'En cours', value: stats.productionStatuses?.sewing || 0 },
    { name: 'Terminées', value: stats.productionStatuses?.finishing || 0 },
  ] : [];

  const kpiCards = [
    { title: 'Chiffre d\'affaires', value: formatFCFA(stats?.totalRevenue || 0), icon: DollarSign, color: 'text-success', desc: 'Encaissé' },
    { title: 'Commandes actives', value: stats?.activeOrders || 0, icon: ShoppingCart, color: 'text-primary', desc: `${stats?.urgentDeliveries || 0} livraison(s) urgente(s)` },
    { title: 'Clients actifs', value: stats?.activeClients || 0, icon: Users, color: 'text-accent', desc: `+${stats?.thisMonthClients || 0} ce mois` },
    { title: 'Stock faible', value: stats?.lowStockCount || 0, icon: Package, color: stats?.lowStockCount ? 'text-destructive' : 'text-muted-foreground', desc: 'Alertes réapprovisionnement' },
    { title: 'Factures impayées', value: stats?.unpaidInvoicesCount || 0, icon: FileText, color: 'text-warning', desc: formatFCFA(stats?.unpaidInvoicesTotal || 0) },
    { title: 'Production', value: stats?.productionActive || 0, icon: Scissors, color: 'text-primary', desc: 'Tâches en cours' },
  ];

  const getAlertIcon = (level: string) => {
    if (level === 'critical' || level === 'error') return <AlertCircle className="h-4 w-4" />;
    if (level === 'warning') return <Clock className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tableau de Bord</h1>
          <p className="text-muted-foreground mt-1">Bienvenue, {user?.firstName || user?.email?.split('@')[0]}</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {user?.role === 'owner' && '👑 Propriétaire'}
          {user?.role === 'manager' && '👨‍💼 Manager'}
          {user?.role === 'orders' && '📋 Commandes'}
          {user?.role === 'tailor' && '✂️ Tailleur'}
          {user?.role === 'stocks' && '📦 Stocks'}
        </Badge>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        {isLoadingStats ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))
        ) : (
          kpiCards.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                      <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{kpi.desc}</p>
                    </div>
                    <Icon className={`h-8 w-8 ${kpi.color} opacity-80`} />
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Production Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scissors className="h-4 w-4 text-primary" /> Répartition Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={productionChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={4}>
                    {productionChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v} tâche(s)`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Revenue Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" /> Revenus vs Créances
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? <Skeleton className="h-48 w-full" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Encaissé', montant: stats?.totalRevenue || 0 },
                  { name: 'Impayé', montant: stats?.unpaidInvoicesTotal || 0 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,85%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatFCFA(v)} />
                  <Bar dataKey="montant" fill="hsl(220,60%,35%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-warning" /> Alertes Récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingAlerts ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : alerts && alerts.length > 0 ? (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <Alert key={alert.id} variant={alert.level === 'critical' || alert.level === 'error' ? 'destructive' : 'default'}>
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.level)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <Badge variant="outline" className="text-xs">{alert.level}</Badge>
                      </div>
                      <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Aucune alerte active</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
