import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Scissors, 
  Package, 
  Clock, 
  DollarSign,
  Heart,
  AlertTriangle,
  CheckCircle,
  Star
} from 'lucide-react';

// Données simulées pour la démonstration
const getStatsForRole = (role: string) => {
  const baseStats = {
    owner: [
      { title: 'Chiffre d\'affaires mensuel', value: '28 450 €', icon: DollarSign, trend: '+12%', color: 'text-green-600' },
      { title: 'Commandes actives', value: '47', icon: ShoppingBag, trend: '+5', color: 'text-blue-600' },
      { title: 'Équipe', value: '8 personnes', icon: Users, trend: '+1', color: 'text-purple-600' },
      { title: 'Délai moyen', value: '12 jours', icon: Clock, trend: '-2j', color: 'text-orange-600' }
    ],
    manager: [
      { title: 'Commandes en production', value: '23', icon: Scissors, trend: '+3', color: 'text-blue-600' },
      { title: 'Tailleurs disponibles', value: '5/8', icon: Users, trend: '2 absents', color: 'text-green-600' },
      { title: 'Délais respectés', value: '89%', icon: CheckCircle, trend: '+5%', color: 'text-green-600' },
      { title: 'Charge de travail', value: '76%', icon: TrendingUp, trend: 'Normal', color: 'text-orange-600' }
    ],
    tailor: [
      { title: 'Mes commandes en cours', value: '4', icon: Scissors, trend: '+1', color: 'text-blue-600' },
      { title: 'Terminées cette semaine', value: '7', icon: CheckCircle, trend: '+2', color: 'text-green-600' },
      { title: 'Délai moyen', value: '3.2 jours', icon: Clock, trend: '-0.5j', color: 'text-orange-600' },
      { title: 'Note moyenne', value: '4.8/5', icon: Star, trend: '+0.2', color: 'text-yellow-600' }
    ],
    orders: [
      { title: 'Nouvelles commandes', value: '12', icon: ShoppingBag, trend: '+4', color: 'text-blue-600' },
      { title: 'Clients actifs', value: '89', icon: Users, trend: '+7', color: 'text-green-600' },
      { title: 'Facturation mensuelle', value: '24 300 €', icon: DollarSign, trend: '+8%', color: 'text-green-600' },
      { title: 'Satisfaction client', value: '92%', icon: Heart, trend: '+3%', color: 'text-red-600' }
    ],
    stocks: [
      { title: 'Articles en stock', value: '342', icon: Package, trend: '+15', color: 'text-blue-600' },
      { title: 'Valeur du stock', value: '8 450 €', icon: DollarSign, trend: '-200€', color: 'text-green-600' },
      { title: 'Alertes stock bas', value: '7', icon: AlertTriangle, trend: '+2', color: 'text-red-600' },
      { title: 'Rotation stock', value: '85%', icon: TrendingUp, trend: '+5%', color: 'text-green-600' }
    ],
    customer_service: [
      { title: 'Tickets ouverts', value: '8', icon: AlertTriangle, trend: '+3', color: 'text-orange-600' },
      { title: 'Satisfaction', value: '94%', icon: Heart, trend: '+2%', color: 'text-green-600' },
      { title: 'Temps de réponse', value: '2.3h', icon: Clock, trend: '-0.5h', color: 'text-blue-600' },
      { title: 'Réclamations résolues', value: '156', icon: CheckCircle, trend: '+12', color: 'text-green-600' }
    ]
  };

  return baseStats[role as keyof typeof baseStats] || baseStats.owner;
};

export function DashboardStats() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const stats = getStatsForRole(user.role);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="shadow-card hover:shadow-elegant transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <Badge 
                variant="secondary" 
                className={`text-xs ${stat.color} bg-transparent border-0 p-0`}
              >
                {stat.trend}
              </Badge>
              <span className="text-xs text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}