// src/hooks/useLoadingState.ts - Hook pour gérer les states de loading

import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: any;
}

export interface UseLoadingStateReturn<T = any> {
  // States
  isLoading: boolean;
  error: string | null;
  data: T | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setData: (data: T | null) => void;
  clearError: () => void;
  reset: () => void;
  
  // Helpers
  execute: <R = T>(
    asyncFn: () => Promise<R>,
    options?: {
      onSuccess?: (data: R) => void;
      onError?: (error: any) => void;
      setDataOnSuccess?: boolean;
    }
  ) => Promise<R | null>;
}

/**
 * Hook pour gérer les états de loading de façon cohérente
 */
export function useLoadingState<T = any>(
  initialData: T | null = null
): UseLoadingStateReturn<T> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(initialData);
  
  // Ref pour éviter les race conditions
  const currentRequestRef = useRef<symbol | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  const setDataState = useCallback((newData: T | null) => {
    setData(newData);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(initialData);
    currentRequestRef.current = null;
  }, [initialData]);

  const execute = useCallback(async <R = T>(
    asyncFn: () => Promise<R>,
    options: {
      onSuccess?: (data: R) => void;
      onError?: (error: any) => void;
      setDataOnSuccess?: boolean;
    } = {}
  ): Promise<R | null> => {
    const {
      onSuccess,
      onError,
      setDataOnSuccess = true
    } = options;

    // Créer un ID unique pour cette requête
    const requestId = Symbol('request');
    currentRequestRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      
      // Vérifier si cette requête est toujours la plus récente
      if (currentRequestRef.current !== requestId) {
        return null; // Requête obsolète, ignorer
      }

      if (setDataOnSuccess) {
        setData(result as any);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      setIsLoading(false);
      return result;
    } catch (err: any) {
      // Vérifier si cette requête est toujours la plus récente
      if (currentRequestRef.current !== requestId) {
        return null; // Requête obsolète, ignorer
      }

      const errorMessage = err?.message || 'Une erreur est survenue';
      setError(errorMessage);
      setIsLoading(false);

      if (onError) {
        onError(err);
      }

      return null;
    }
  }, []);

  return {
    isLoading,
    error,
    data,
    setLoading,
    setError: setErrorState,
    setData: setDataState,
    clearError,
    reset,
    execute,
  };
}

/**
 * Hook pour gérer plusieurs états de loading simultanés
 */
export function useMultipleLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const setError = useCallback((key: string, error: string | null) => {
    setErrors(prev => {
      if (error === null) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [key]: error
      };
    });
  }, []);

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);
  const hasAnyError = Object.keys(errors).length > 0;

  const execute = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: any) => void;
    } = {}
  ): Promise<T | null> => {
    const { onSuccess, onError } = options;

    setLoading(key, true);
    setError(key, null);

    try {
      const result = await asyncFn();
      
      if (onSuccess) {
        onSuccess(result);
      }

      setLoading(key, false);
      return result;
    } catch (err: any) {
      const errorMessage = err?.message || 'Une erreur est survenue';
      setError(key, errorMessage);
      setLoading(key, false);

      if (onError) {
        onError(err);
      }

      return null;
    }
  }, [setLoading, setError]);

  const reset = useCallback((key?: string) => {
    if (key) {
      setLoadingStates(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      setError(key, null);
    } else {
      setLoadingStates({});
      setErrors({});
    }
  }, [setError]);

  return {
    loadingStates,
    errors,
    isAnyLoading,
    hasAnyError,
    setLoading,
    setError,
    execute,
    reset,
    isLoading: (key: string) => loadingStates[key] || false,
    getError: (key: string) => errors[key] || null,
  };
}

/**
 * Hook pour paginated loading (infinite scroll)
 */
export function usePaginatedLoading<T>(
  fetchFn: (page: number) => Promise<{ data: T[]; hasMore: boolean }>
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadInitial = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setPage(1);

    try {
      const result = await fetchFn(1);
      setData(result.data);
      setHasMore(result.hasMore);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement');
      setIsLoading(false);
    }
  }, [fetchFn, isLoading]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const result = await fetchFn(nextPage);
      setData(prev => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      setIsLoadingMore(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur de chargement');
      setIsLoadingMore(false);
    }
  }, [fetchFn, page, hasMore, isLoadingMore]);

  const refresh = useCallback(async () => {
    await loadInitial();
  }, [loadInitial]);

  const reset = useCallback(() => {
    setData([]);
    setIsLoading(false);
    setIsLoadingMore(false);
    setError(null);
    setHasMore(true);
    setPage(1);
  }, []);

  return {
    data,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
    reset,
  };
}

/**
 * Hook pour optimistic updates avec rollback
 */
export function useOptimisticUpdate<T>() {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousDataRef = useRef<T | null>(null);

  const executeOptimistic = useCallback(async (
    optimisticData: T,
    asyncFn: () => Promise<T>,
    options: {
      onSuccess?: (data: T) => void;
      onError?: (error: any, rollbackData: T | null) => void;
    } = {}
  ): Promise<T | null> => {
    const { onSuccess, onError } = options;

    // Sauvegarder l'état actuel pour rollback
    previousDataRef.current = data;
    
    // Appliquer immédiatement la mise à jour optimiste
    setData(optimisticData);
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      setData(result);
      setIsLoading(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err: any) {
      // Rollback vers l'état précédent
      const rollbackData = previousDataRef.current;
      setData(rollbackData);
      setError(err?.message || 'Une erreur est survenue');
      setIsLoading(false);
      
      if (onError) {
        onError(err, rollbackData);
      }
      
      return null;
    }
  }, [data]);

  return {
    data,
    isLoading,
    error,
    setData,
    executeOptimistic,
  };
}