import * as Sentry from '@sentry/react';

// Configuration Sentry
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (import.meta.env.PROD && dsn && !dsn.includes('your-sentry-dsn')) {
    Sentry.init({
      dsn,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% des transactions
      // Error monitoring
      replaysSessionSampleRate: 0.1, // 10% des sessions
      replaysOnErrorSampleRate: 1.0, // 100% des erreurs
      
      // Environnement
      environment: import.meta.env.MODE,
      
      // Filtrage des erreurs
      beforeSend(event, hint) {
        // Ignorer les erreurs de réseau communes
        if (hint.originalException instanceof Error) {
          const message = hint.originalException.message;
          if (
            message.includes('Failed to fetch') ||
            message.includes('NetworkError') ||
            message.includes('timeout') ||
            message.includes('Supabase')
          ) {
            return null; // Ne pas envoyer ces erreurs
          }
        }
        return event;
      },
      
      // Tags personnalisés
      initialScope: {
        tags: {
          app: 'atelierpro',
          version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        },
      },
    });
  }
}

// Fonction pour capturer les erreurs Supabase
export function captureSupabaseError(error: any, context?: string) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      tags: {
        source: 'supabase',
        context: context || 'unknown',
      },
      extra: {
        error_code: error?.code,
        error_message: error?.message,
        error_details: error?.details,
        error_hint: error?.hint,
      },
    });
  }
  
  // Log en développement
  if (import.meta.env.DEV) {
    console.error(`[Sentry] ${context || 'Supabase error'}:`, error);
  }
}

// Fonction pour mesurer les performances
export function measurePerformance(name: string, fn: () => any) {
  if (import.meta.env.PROD) {
    const transaction = Sentry.startTransaction({
      name,
      op: 'function',
    });
    
    try {
      const result = fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  } else {
    return fn();
  }
}

// Fonction pour mesurer les performances async
export async function measureAsyncPerformance(name: string, fn: () => Promise<any>) {
  if (import.meta.env.PROD) {
    const transaction = Sentry.startTransaction({
      name,
      op: 'function',
    });
    
    try {
      const result = await fn();
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      throw error;
    } finally {
      transaction.finish();
    }
  } else {
    return fn();
  }
}

// Fonction pour ajouter des métriques personnalisées
export function addCustomMetric(name: string, value: number, tags?: Record<string, string>) {
  if (import.meta.env.PROD) {
    Sentry.metrics.increment(name, value, tags);
  }
}

// Fonction pour capturer les erreurs React
export function captureReactError(error: Error, errorInfo: React.ErrorInfo) {
  if (import.meta.env.PROD) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }
  
  if (import.meta.env.DEV) {
    console.error('[Sentry] React error:', error, errorInfo);
  }
} 