// src/hooks/useErrorHandler.ts - Hook React pour gestion d'erreurs

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { BobError, ErrorHandler } from '../utils/error-handler';

export interface UseErrorHandlerReturn {
  error: BobError | null;
  isLoading: boolean;
  showError: (error: BobError | Error | any) => void;
  clearError: () => void;
  executeWithErrorHandling: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      showAlert?: boolean;
      context?: string;
      onError?: (error: BobError) => void;
    }
  ) => Promise<T | null>;
}

/**
 * Hook pour gérer les erreurs de façon consistante dans l'app
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<BobError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showError = useCallback((error: BobError | Error | any) => {
    const bobError = error instanceof BobError 
      ? error 
      : ErrorHandler.handleApiError(error, 'useErrorHandler');
    
    setError(bobError);
    ErrorHandler.logError(bobError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      showAlert?: boolean;
      context?: string;
      onError?: (error: BobError) => void;
    } = {}
  ): Promise<T | null> => {
    const { 
      showAlert = true, 
      context = 'opération', 
      onError 
    } = options;

    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFn();
      setIsLoading(false);
      return result;
    } catch (error: any) {
      setIsLoading(false);
      
      const bobError = error instanceof BobError 
        ? error 
        : ErrorHandler.handleApiError(error, context);

      setError(bobError);
      ErrorHandler.logError(bobError, { context });

      if (onError) {
        onError(bobError);
      }

      if (showAlert) {
        const userMessage = ErrorHandler.getUserFriendlyMessage(bobError);
        
        Alert.alert(
          'Erreur',
          userMessage,
          [
            {
              text: ErrorHandler.isRetryable(bobError) ? 'Réessayer' : 'OK',
              onPress: clearError
            }
          ]
        );
      }

      return null;
    }
  }, [clearError]);

  return {
    error,
    isLoading,
    showError,
    clearError,
    executeWithErrorHandling
  };
}

/**
 * Hook spécialisé pour les opérations nécessitant une authentification
 */
export function useAuthErrorHandler() {
  const { executeWithErrorHandling, ...rest } = useErrorHandler();

  const executeWithAuth = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: Parameters<typeof executeWithErrorHandling>[1] & {
      onAuthRequired?: () => void;
    } = {}
  ): Promise<T | null> => {
    const { onAuthRequired, ...otherOptions } = options;

    return executeWithErrorHandling(
      asyncFn,
      {
        ...otherOptions,
        onError: (error) => {
          if (ErrorHandler.requiresReauth(error)) {
            if (onAuthRequired) {
              onAuthRequired();
            }
          }
          if (options.onError) {
            options.onError(error);
          }
        }
      }
    );
  }, [executeWithErrorHandling]);

  return {
    ...rest,
    executeWithAuth
  };
}

/**
 * Hook pour retry automatique avec gestion d'erreurs
 */
export function useRetryErrorHandler() {
  const { executeWithErrorHandling, ...rest } = useErrorHandler();

  const executeWithRetry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      showAlert?: boolean;
      context?: string;
      onError?: (error: BobError) => void;
    } = {}
  ): Promise<T | null> => {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      ...executeOptions
    } = options;

    let lastError: BobError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await executeWithErrorHandling(
          asyncFn,
          {
            ...executeOptions,
            showAlert: false, // On gère l'alert nous-mêmes
          }
        );
        return result;
      } catch (error: any) {
        lastError = error instanceof BobError 
          ? error 
          : ErrorHandler.handleApiError(error, options.context);

        // Ne pas retenter si ce n'est pas une erreur temporaire
        if (!ErrorHandler.isRetryable(lastError)) {
          break;
        }

        // Dernière tentative échouée
        if (attempt === maxRetries) {
          break;
        }

        // Attendre avant la prochaine tentative
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Afficher l'erreur finale
    if (options.showAlert !== false) {
      const userMessage = ErrorHandler.getUserFriendlyMessage(lastError!);
      Alert.alert('Erreur', userMessage, [{ text: 'OK' }]);
    }

    if (options.onError) {
      options.onError(lastError!);
    }

    return null;
  }, [executeWithErrorHandling]);

  return {
    ...rest,
    executeWithRetry
  };
}