// src/utils/error-handler.ts - Gestion d'erreurs robuste pour l'architecture unifiée

import { ApiError, UnifiedApiErrorCode, isApiError } from '../types/unified-api.types';

export class BobError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'BobError';
  }
}

/**
 * Classe principale de gestion d'erreurs pour l'app Bob
 */
export class ErrorHandler {
  
  /**
   * Traite une erreur de réponse API et la convertit en BobError
   */
  static handleApiError(error: any, context?: string): BobError {
    // Si c'est déjà une BobError, la retourner
    if (error instanceof BobError) {
      return error;
    }

    // Erreur réseau/fetch
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new BobError(
        'Connexion impossible au serveur. Vérifiez votre connexion internet.',
        'NETWORK_ERROR',
        0,
        { originalError: error.message, context }
      );
    }

    // Réponse API avec structure d'erreur Strapi
    if (isApiError(error)) {
      return this.handleStrapiError(error, context);
    }

    // Erreur HTTP basique
    if (error.status) {
      return this.handleHttpError(error.status, error.message || 'Erreur inconnue', context);
    }

    // Erreur JavaScript générique
    return new BobError(
      error.message || 'Une erreur inattendue s\'est produite',
      'UNKNOWN_ERROR',
      undefined,
      { originalError: error, context }
    );
  }

  /**
   * Traite les erreurs spécifiques à Strapi 5
   */
  private static handleStrapiError(apiError: ApiError, context?: string): BobError {
    const { error } = apiError;
    
    switch (error.status) {
      case 400:
        return new BobError(
          error.message || 'Données invalides',
          'VALIDATION_ERROR',
          400,
          { details: error.details, context }
        );
        
      case 401:
        return new BobError(
          'Vous devez vous connecter pour accéder à cette fonctionnalité',
          UnifiedApiErrorCode.UTILISATEUR_NON_AUTHENTIFIE,
          401,
          { context }
        );
        
      case 403:
        return new BobError(
          'Vous n\'avez pas les permissions nécessaires',
          'INSUFFICIENT_PERMISSIONS',
          403,
          { context }
        );
        
      case 404:
        if (context?.includes('evenement')) {
          return new BobError(
            'Cet événement n\'existe pas ou a été supprimé',
            UnifiedApiErrorCode.EVENEMENT_NON_TROUVE,
            404,
            { context }
          );
        }
        if (context?.includes('besoin')) {
          return new BobError(
            'Ce besoin n\'existe pas ou a été supprimé',
            UnifiedApiErrorCode.BESOIN_NON_TROUVE,
            404,
            { context }
          );
        }
        return new BobError(
          'Ressource non trouvée',
          'NOT_FOUND',
          404,
          { context }
        );
        
      case 409:
        if (error.message?.includes('déjà positionné')) {
          return new BobError(
            'Vous êtes déjà positionné sur ce besoin',
            UnifiedApiErrorCode.DEJA_POSITIONNE,
            409,
            { context }
          );
        }
        if (error.message?.includes('déjà participant')) {
          return new BobError(
            'Vous participez déjà à cet événement',
            UnifiedApiErrorCode.DEJA_PARTICIPANT,
            409,
            { context }
          );
        }
        return new BobError(
          error.message || 'Conflit de données',
          'CONFLICT',
          409,
          { context }
        );
        
      case 422:
        if (error.message?.includes('complet')) {
          return new BobError(
            'Ce besoin est déjà complet, vous ne pouvez plus vous positionner',
            UnifiedApiErrorCode.BESOIN_COMPLET,
            422,
            { context }
          );
        }
        return new BobError(
          error.message || 'Impossible de traiter cette demande',
          'UNPROCESSABLE_ENTITY',
          422,
          { details: error.details, context }
        );
        
      case 500:
        return new BobError(
          'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.',
          'INTERNAL_SERVER_ERROR',
          500,
          { context }
        );
        
      default:
        return new BobError(
          error.message || 'Erreur API inconnue',
          'API_ERROR',
          error.status,
          { details: error.details, context }
        );
    }
  }

  /**
   * Traite les erreurs HTTP simples
   */
  private static handleHttpError(status: number, message: string, context?: string): BobError {
    switch (status) {
      case 0:
        return new BobError(
          'Impossible de contacter le serveur',
          'NETWORK_ERROR',
          0,
          { context }
        );
        
      case 408:
        return new BobError(
          'La requête a pris trop de temps. Veuillez réessayer.',
          'REQUEST_TIMEOUT',
          408,
          { context }
        );
        
      case 429:
        return new BobError(
          'Trop de requêtes. Veuillez patienter avant de réessayer.',
          'TOO_MANY_REQUESTS',
          429,
          { context }
        );
        
      case 502:
      case 503:
      case 504:
        return new BobError(
          'Le serveur est temporairement indisponible. Réessayez dans quelques minutes.',
          'SERVER_UNAVAILABLE',
          status,
          { context }
        );
        
      default:
        return new BobError(
          message || `Erreur HTTP ${status}`,
          'HTTP_ERROR',
          status,
          { context }
        );
    }
  }

  /**
   * Obtient un message d'erreur user-friendly
   */
  static getUserFriendlyMessage(error: BobError): string {
    // Messages spécifiques aux codes d'erreur Bob
    switch (error.code) {
      case UnifiedApiErrorCode.UTILISATEUR_NON_AUTHENTIFIE:
        return 'Veuillez vous reconnecter à votre compte';
        
      case UnifiedApiErrorCode.EVENEMENT_NON_TROUVE:
        return 'Cet événement n\'est plus disponible';
        
      case UnifiedApiErrorCode.BESOIN_NON_TROUVE:
        return 'Ce besoin n\'est plus disponible';
        
      case UnifiedApiErrorCode.DEJA_POSITIONNE:
        return 'Vous êtes déjà inscrit pour ce besoin';
        
      case UnifiedApiErrorCode.DEJA_PARTICIPANT:
        return 'Vous participez déjà à cet événement';
        
      case UnifiedApiErrorCode.EVENEMENT_COMPLET:
        return 'Cet événement est complet';
        
      case UnifiedApiErrorCode.BESOIN_COMPLET:
        return 'Ce besoin est déjà pourvu';
        
      case UnifiedApiErrorCode.CREATION_BOB_ECHEC:
        return 'Impossible de créer le BOB. Réessayez plus tard.';
        
      case UnifiedApiErrorCode.SYNCHRONISATION_ECHEC:
        return 'Erreur de synchronisation. Vos données seront mises à jour automatiquement.';
        
      case 'NETWORK_ERROR':
        return 'Vérifiez votre connexion internet et réessayez';
        
      case 'VALIDATION_ERROR':
        return 'Certaines informations sont invalides';
        
      case 'SERVER_UNAVAILABLE':
        return 'Le service Bob est temporairement indisponible';
        
      default:
        return error.message || 'Une erreur s\'est produite';
    }
  }

  /**
   * Détermine si l'erreur nécessite une reconnexion
   */
  static requiresReauth(error: BobError): boolean {
    return error.status === 401 || error.code === UnifiedApiErrorCode.UTILISATEUR_NON_AUTHENTIFIE;
  }

  /**
   * Détermine si l'erreur est temporaire et peut être retentée
   */
  static isRetryable(error: BobError): boolean {
    const retryableCodes = [
      'NETWORK_ERROR',
      'REQUEST_TIMEOUT', 
      'TOO_MANY_REQUESTS',
      'SERVER_UNAVAILABLE',
      'INTERNAL_SERVER_ERROR'
    ];
    
    return retryableCodes.includes(error.code) || 
           (!!error.status && error.status >= 500 && error.status < 600);
  }

  /**
   * Log l'erreur pour le debugging
   */
  static logError(error: BobError, additionalContext?: any): void {
    console.error('BobError:', {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
      context: additionalContext,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Helper function pour wrapper les appels API avec gestion d'erreurs
 */
export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    const bobError = ErrorHandler.handleApiError(error, context);
    ErrorHandler.logError(bobError, { apiCall: apiCall.name });
    throw bobError;
  }
}

/**
 * Helper pour retry automatique avec backoff exponentiel
 */
export async function withRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: string
): Promise<T> {
  let lastError: BobError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await withErrorHandling(apiCall, context);
    } catch (error) {
      lastError = error as BobError;
      
      // Ne pas retenter si ce n'est pas une erreur temporaire
      if (!ErrorHandler.isRetryable(lastError)) {
        throw lastError;
      }
      
      // Dernière tentative échouée
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Attendre avant la prochaine tentative (backoff exponentiel)
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}