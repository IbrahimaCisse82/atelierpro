import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  X,
  Package,
  ShoppingCart,
  Scissors,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types pour les alertes
interface Alert {
  id: string;
  type: 'stock_low' | 'order_delay' | 'payment_due' | 'supplier_delivery' | 'quality_issue' | 'system_alert';
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  isRead: boolean;
  readAt?: string;
  readBy?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy?: string;
}

// Configuration des alertes par rôle
const alertConfig = {
  owner: [
    'stock_low',
    'order_delay', 
    'payment_due',
    'supplier_delivery',
    'quality_issue',
    'system_alert'
  ],
  manager: [
    'order_delay',
    'quality_issue',
    'stock_low'
  ],
  tailor: [
    'order_delay'
  ],
  orders: [
    'payment_due',
    'order_delay'
  ],
  stocks: [
    'stock_low',
    'supplier_delivery'
  ],
  customer_service: [
    'order_delay'
  ]
};

// Données simulées d'alertes
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'stock_low',
    level: 'warning',
    title: 'Stock faible - Fil polyester noir',
    message: 'Le stock de fil polyester noir est en dessous du seuil minimum (12 bobines restantes)',
    relatedEntityType: 'product',
    relatedEntityId: '2',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // Il y a 2h
  },
  {
    id: '2',
    type: 'order_delay',
    level: 'error',
    title: 'Commande en retard - CMD-2024-003',
    message: 'La commande CMD-2024-003 dépasse le délai de livraison prévu',
    relatedEntityType: 'order',
    relatedEntityId: '3',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // Il y a 4h
  },
  {
    id: '3',
    type: 'payment_due',
    level: 'warning',
    title: 'Facture en retard - FACT-2024-003',
    message: 'La facture FACT-2024-003 est en retard de paiement',
    relatedEntityType: 'invoice',
    relatedEntityId: '3',
    isRead: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // Il y a 6h
  },
  {
    id: '4',
    type: 'supplier_delivery',
    level: 'info',
    title: 'Réception en attente - ACH-2024-002',
    message: 'La commande fournisseur ACH-2024-002 est livrée et en attente de réception',
    relatedEntityType: 'purchase_order',
    relatedEntityId: '2',
    isRead: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // Il y a 8h
  },
  {
    id: '5',
    type: 'quality_issue',
    level: 'error',
    title: 'Problème qualité - Réception #1',
    message: 'Défaut détecté lors de la réception de tissu coton blanc',
    relatedEntityType: 'reception',
    relatedEntityId: '1',
    isRead: true,
    readAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    readBy: 'Jean Stocks',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // Il y a 12h
  }
];

export function AlertSystem() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [isOpen, setIsOpen] = useState(false);

  // Filtrer les alertes selon le rôle de l'utilisateur
  const userRole = user?.role || 'owner'; // Valeur par défaut si le rôle n'est pas défini
  const allowedAlertTypes = alertConfig[userRole as keyof typeof alertConfig] || [];
  const filteredAlerts = alerts.filter(alert => allowedAlertTypes.includes(alert.type));

  // Alertes non lues
  const unreadAlerts = filteredAlerts.filter(alert => !alert.isRead);
  const unreadCount = unreadAlerts.length;

  // Grouper les alertes par niveau
  const criticalAlerts = filteredAlerts.filter(a => a.level === 'critical' && !a.isRead);
  const errorAlerts = filteredAlerts.filter(a => a.level === 'error' && !a.isRead);
  const warningAlerts = filteredAlerts.filter(a => a.level === 'warning' && !a.isRead);
  const infoAlerts = filteredAlerts.filter(a => a.level === 'info' && !a.isRead);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stock_low':
        return <Package className="h-4 w-4" />;
      case 'order_delay':
        return <ShoppingCart className="h-4 w-4" />;
      case 'payment_due':
        return <DollarSign className="h-4 w-4" />;
      case 'supplier_delivery':
        return <Package className="h-4 w-4" />;
      case 'quality_issue':
        return <AlertTriangle className="h-4 w-4" />;
      case 'system_alert':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical':
      case 'error':
        return 'destructive' as const;
      case 'warning':
        return 'secondary' as const;
      default:
        return 'default' as const;
    }
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            isRead: true, 
            readAt: new Date().toISOString(),
            readBy: `${user?.firstName} ${user?.lastName}`
          }
        : alert
    ));
  };

  const handleMarkAllAsRead = () => {
    setAlerts(prev => prev.map(alert => 
      !alert.isRead 
        ? { 
            ...alert, 
            isRead: true, 
            readAt: new Date().toISOString(),
            readBy: `${user?.firstName} ${user?.lastName}`
          }
        : alert
    ));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours === 1) return 'Il y a 1 heure';
    if (diffInHours < 24) return `Il y a ${diffInHours} heures`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Il y a 1 jour';
    return `Il y a ${diffInDays} jours`;
  };

  return (
    <>
      {/* Bouton de notification avec badge */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Tout marquer comme lu
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {unreadCount} notification(s) non lue(s)
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Alertes critiques */}
            {criticalAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Critiques ({criticalAlerts.length})
                </h4>
                {criticalAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getAlertIcon={getAlertIcon}
                    getAlertLevelIcon={getAlertLevelIcon}
                    getAlertBadgeVariant={getAlertBadgeVariant}
                  />
                ))}
              </div>
            )}

            {/* Alertes d'erreur */}
            {errorAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Erreurs ({errorAlerts.length})
                </h4>
                {errorAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getAlertIcon={getAlertIcon}
                    getAlertLevelIcon={getAlertLevelIcon}
                    getAlertBadgeVariant={getAlertBadgeVariant}
                  />
                ))}
              </div>
            )}

            {/* Alertes d'avertissement */}
            {warningAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-yellow-600 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Avertissements ({warningAlerts.length})
                </h4>
                {warningAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getAlertIcon={getAlertIcon}
                    getAlertLevelIcon={getAlertLevelIcon}
                    getAlertBadgeVariant={getAlertBadgeVariant}
                  />
                ))}
              </div>
            )}

            {/* Alertes d'information */}
            {infoAlerts.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-blue-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Informations ({infoAlerts.length})
                </h4>
                {infoAlerts.map(alert => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert} 
                    onMarkAsRead={handleMarkAsRead}
                    formatTimeAgo={formatTimeAgo}
                    getAlertIcon={getAlertIcon}
                    getAlertLevelIcon={getAlertLevelIcon}
                    getAlertBadgeVariant={getAlertBadgeVariant}
                  />
                ))}
              </div>
            )}

            {/* Alertes lues récemment */}
            {filteredAlerts.filter(a => a.isRead).slice(0, 3).map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onMarkAsRead={handleMarkAsRead}
                formatTimeAgo={formatTimeAgo}
                getAlertIcon={getAlertIcon}
                getAlertLevelIcon={getAlertLevelIcon}
                getAlertBadgeVariant={getAlertBadgeVariant}
                isRead
              />
            ))}

            {filteredAlerts.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune alerte</h3>
                <p className="text-muted-foreground">
                  Tout fonctionne correctement !
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Composant carte d'alerte
function AlertCard({ 
  alert, 
  onMarkAsRead, 
  formatTimeAgo, 
  getAlertIcon, 
  getAlertLevelIcon, 
  getAlertBadgeVariant,
  isRead = false 
}: { 
  alert: Alert; 
  onMarkAsRead: (id: string) => void; 
  formatTimeAgo: (date: string) => string;
  getAlertIcon: (type: string) => React.ReactNode;
  getAlertLevelIcon: (level: string) => React.ReactNode;
  getAlertBadgeVariant: (level: string) => any;
  isRead?: boolean;
}) {
  return (
    <Card className={cn(
      "transition-all duration-200",
      isRead ? "opacity-60" : "border-l-4 border-l-red-500"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {getAlertLevelIcon(alert.level)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                {getAlertIcon(alert.type)}
                <h4 className="text-sm font-medium">{alert.title}</h4>
                <Badge variant={getAlertBadgeVariant(alert.level)}>
                  {alert.level}
                </Badge>
              </div>
              {!isRead && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsRead(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {alert.message}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(alert.createdAt)}
              </span>
              {alert.relatedEntityType && (
                <Button variant="outline" size="sm" className="h-6 text-xs">
                  Voir détails
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 