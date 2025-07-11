import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { captureSupabaseError, addCustomMetric } from '@/lib/sentry';

interface PerformanceMetrics {
  authTime: number;
  dataLoadTime: number;
  renderTime: number;
  totalTime: number;
  errors: string[];
  warnings: string[];
  lastUpdate: Date;
}

interface NetworkMetrics {
  latency: number;
  status: 'good' | 'warning' | 'error';
  lastCheck: Date;
}

export function PerformanceMonitor() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    authTime: 0,
    dataLoadTime: 0,
    renderTime: 0,
    totalTime: 0,
    errors: [],
    warnings: [],
    lastUpdate: new Date()
  });
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    latency: 0,
    status: 'good',
    lastCheck: new Date()
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Mesurer la latence réseau
  const measureNetworkLatency = async () => {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);
      
      const end = performance.now();
      const latency = end - start;
      
      let status: 'good' | 'warning' | 'error' = 'good';
      if (latency > 2000) status = 'error';
      else if (latency > 1000) status = 'warning';
      
      setNetworkMetrics({
        latency: Math.round(latency),
        status,
        lastCheck: new Date()
      });
      
      // Envoyer les métriques à Sentry
      addCustomMetric('network_latency', latency, { status });
      
      if (error) {
        captureSupabaseError(error, 'network_latency_check');
      }
    } catch (error) {
      setNetworkMetrics(prev => ({
        ...prev,
        status: 'error',
        lastCheck: new Date()
      }));
      captureSupabaseError(error, 'network_latency_check');
    }
  };

  // Mesurer les performances de l'application
  const measureAppPerformance = () => {
    const start = performance.now();
    
    // Mesurer le temps d'authentification
    const authStart = performance.now();
    const authTime = authStart - start;
    
    // Mesurer le temps de chargement des données
    const dataStart = performance.now();
    const dataLoadTime = dataStart - authStart;
    
    // Mesurer le temps de rendu
    const renderStart = performance.now();
    const renderTime = renderStart - dataStart;
    
    const totalTime = performance.now() - start;
    
    setMetrics({
      authTime: Math.round(authTime),
      dataLoadTime: Math.round(dataLoadTime),
      renderTime: Math.round(renderTime),
      totalTime: Math.round(totalTime),
      errors: [],
      warnings: [],
      lastUpdate: new Date()
    });
    
    // Envoyer les métriques à Sentry
    addCustomMetric('app_performance', totalTime, {
      component: 'performance_monitor',
      auth_time: authTime.toString(),
      data_load_time: dataLoadTime.toString(),
      render_time: renderTime.toString()
    });
  };

  // Monitoring automatique
  useEffect(() => {
    if (!isMonitoring) return;
    
    const interval = setInterval(() => {
      measureNetworkLatency();
      measureAppPerformance();
    }, 30000); // Toutes les 30 secondes
    
    return () => clearInterval(interval);
  }, [isMonitoring]);

  // Mesurer les performances au montage
  useEffect(() => {
    const timer = setTimeout(() => {
      measureAppPerformance();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Raccourci clavier pour afficher/masquer le moniteur
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible && !import.meta.env.DEV) {
    return null;
  }

  const getStatusColor = (status: 'good' | 'warning' | 'error') => {
    switch (status) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
    }
  };

  const getPerformanceScore = () => {
    const score = Math.max(0, 100 - (metrics.totalTime / 10));
    return Math.round(score);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Performance</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={networkMetrics.status === 'good' ? 'default' : networkMetrics.status === 'warning' ? 'secondary' : 'destructive'}>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(networkMetrics.status)} mr-1`} />
                {networkMetrics.latency}ms
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
          <CardDescription>
            Monitoring en temps réel
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Score de performance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score Performance</span>
              <span className="text-sm text-muted-foreground">{getPerformanceScore()}/100</span>
            </div>
            <Progress value={getPerformanceScore()} className="h-2" />
          </div>
          
          {/* Métriques détaillées */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span>Auth</span>
              </div>
              <div className="font-mono">{metrics.authTime}ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-muted-foreground" />
                <span>Data</span>
              </div>
              <div className="font-mono">{metrics.dataLoadTime}ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-muted-foreground" />
                <span>Render</span>
              </div>
              <div className="font-mono">{metrics.renderTime}ms</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span>Total</span>
              </div>
              <div className="font-mono font-semibold">{metrics.totalTime}ms</div>
            </div>
          </div>
          
          {/* Statut réseau */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Réseau</span>
              <span className="text-xs text-muted-foreground">
                {networkMetrics.lastCheck.toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(networkMetrics.status)}`} />
              <span className="text-sm">
                {networkMetrics.status === 'good' && 'Connexion stable'}
                {networkMetrics.status === 'warning' && 'Connexion lente'}
                {networkMetrics.status === 'error' && 'Problème de connexion'}
              </span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                measureNetworkLatency();
                measureAppPerformance();
              }}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualiser
            </Button>
            <Button
              variant={isMonitoring ? "default" : "outline"}
              size="sm"
              onClick={() => setIsMonitoring(!isMonitoring)}
              className="flex-1"
            >
              {isMonitoring ? 'Arrêter' : 'Démarrer'} Auto
            </Button>
          </div>
          
          {/* Informations utilisateur */}
          {user && (
            <div className="pt-2 border-t text-xs text-muted-foreground">
              <div>Utilisateur: {user.email}</div>
              <div>Rôle: {user.role}</div>
              <div>Entreprise: {user.companyId}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 