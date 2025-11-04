// Service centralisé de gestion d'erreurs
import { toast } from '@/hooks/use-toast';

export type ErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
  originalError?: any;
}

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Catégorise une erreur selon son type
   */
  categorizeError(error: any): AppError {
    // Erreur réseau
    if (error?.message?.includes('fetch') || error?.message?.includes('Network')) {
      return {
        type: 'network',
        message: 'Erreur de connexion réseau. Vérifiez votre connexion internet.',
        originalError: error
      };
    }

    // Erreur d'authentification
    if (error?.message?.includes('auth') || error?.message?.includes('Invalid login')) {
      return {
        type: 'authentication',
        message: 'Erreur d\'authentification. Veuillez vous reconnecter.',
        originalError: error
      };
    }

    // Erreur d'autorisation
    if (error?.message?.includes('permission') || error?.message?.includes('RLS')) {
      return {
        type: 'authorization',
        message: 'Vous n\'avez pas les droits nécessaires pour cette action.',
        originalError: error
      };
    }

    // Erreur de validation
    if (error?.message?.includes('validation') || error?.message?.includes('violates')) {
      return {
        type: 'validation',
        message: 'Données invalides. Vérifiez les informations saisies.',
        details: error,
        originalError: error
      };
    }

    // Erreur 404
    if (error?.message?.includes('not found') || error?.status === 404) {
      return {
        type: 'not_found',
        message: 'Ressource introuvable.',
        originalError: error
      };
    }

    // Erreur de conflit (409)
    if (error?.message?.includes('already exists') || error?.status === 409) {
      return {
        type: 'conflict',
        message: 'Cette ressource existe déjà.',
        originalError: error
      };
    }

    // Erreur serveur
    if (error?.status >= 500) {
      return {
        type: 'server',
        message: 'Erreur du serveur. Réessayez dans quelques instants.',
        originalError: error
      };
    }

    // Erreur inconnue
    return {
      type: 'unknown',
      message: error?.message || 'Une erreur inattendue s\'est produite.',
      originalError: error
    };
  }

  /**
   * Affiche un toast d'erreur approprié
   */
  showError(error: any, customMessage?: string) {
    const appError = this.categorizeError(error);

    toast({
      title: "❌ Erreur",
      description: customMessage || appError.message,
      variant: "destructive",
    });

    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorHandler]', {
        type: appError.type,
        message: appError.message,
        originalError: appError.originalError
      });
    }

    return appError;
  }

  /**
   * Gère une erreur de manière silencieuse (log uniquement)
   */
  logError(error: any, context?: string) {
    const appError = this.categorizeError(error);

    if (process.env.NODE_ENV === 'development') {
      console.error(`[ErrorHandler] ${context || 'Error'}:`, {
        type: appError.type,
        message: appError.message,
        originalError: appError.originalError
      });
    }

    // TODO: Envoyer à Sentry en production
    // Sentry.captureException(appError.originalError);

    return appError;
  }

  /**
   * Wrapper pour les fonctions async avec gestion d'erreur automatique
   */
  async handleAsync<T>(
    fn: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> {
    try {
      return await fn();
    } catch (error) {
      this.showError(error, errorMessage);
      return null;
    }
  }
}

// Export singleton
export const errorHandler = ErrorHandler.getInstance();

// Helpers
export function showError(error: any, customMessage?: string) {
  return errorHandler.showError(error, customMessage);
}

export function logError(error: any, context?: string) {
  return errorHandler.logError(error, context);
}

export function handleAsync<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  return errorHandler.handleAsync(fn, errorMessage);
}
