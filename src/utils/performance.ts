// src/utils/performance.ts - Outils d'optimisation des performances
import { logger } from './logger';

interface PerformanceMetrics {
  renderTime: number;
  apiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsage: number;
  lastOptimization: string;
}

interface CacheConfig {
  maxSize: number;
  ttl: number; // Time To Live en millisecondes
  strategy: 'lru' | 'fifo';
}

class PerformanceManager {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    memoryUsage: 0,
    lastOptimization: new Date().toISOString()
  };

  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private cacheConfig: CacheConfig = {
    maxSize: 100,
    ttl: 5 * 60 * 1000, // 5 minutes
    strategy: 'lru'
  };

  private pendingOperations = new Map<string, Promise<any>>();

  // Debouncer intelligent
  private debouncers = new Map<string, NodeJS.Timeout>();

  // Cache intelligent avec TTL et statistiques
  set(key: string, data: any, customTTL?: number): void {
    const ttl = customTTL || this.cacheConfig.ttl;
    
    // Nettoyer le cache si plein
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.cleanCache();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0
    });

    logger.debug('performance', `Cache SET: ${key}`, { 
      cacheSize: this.cache.size,
      ttl: ttl / 1000 + 's'
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.metrics.cacheMisses++;
      logger.debug('performance', `Cache MISS: ${key}`);
      return null;
    }

    // Vérifier TTL
    if (Date.now() - entry.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key);
      this.metrics.cacheMisses++;
      logger.debug('performance', `Cache EXPIRED: ${key}`);
      return null;
    }

    entry.hits++;
    this.metrics.cacheHits++;
    logger.debug('performance', `Cache HIT: ${key}`, { hits: entry.hits });
    
    return entry.data;
  }

  // Nettoyer le cache selon la stratégie
  private cleanCache(): void {
    const entriesToRemove = Math.ceil(this.cacheConfig.maxSize * 0.2); // Retirer 20%
    
    if (this.cacheConfig.strategy === 'lru') {
      // Least Recently Used - trier par hits et timestamp
      const sorted = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => (a.hits + a.timestamp) - (b.hits + b.timestamp));
      
      for (let i = 0; i < entriesToRemove && i < sorted.length; i++) {
        this.cache.delete(sorted[i][0]);
      }
    } else {
      // FIFO - premiers entrés, premiers sortis
      const keys = Array.from(this.cache.keys());
      for (let i = 0; i < entriesToRemove && i < keys.length; i++) {
        this.cache.delete(keys[i]);
      }
    }

    logger.info('performance', `Cache nettoyé: ${entriesToRemove} entrées supprimées`);
  }

  // Debouncer intelligent avec nettoyage automatique
  debounce<T extends (...args: any[]) => any>(
    key: string, 
    func: T, 
    delay: number = 300
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const existingTimer = this.debouncers.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timer = setTimeout(() => {
        func.apply(null, args);
        this.debouncers.delete(key);
      }, delay);

      this.debouncers.set(key, timer);
    };
  }

  // Prévenir les appels API dupliqués
  async deduplicateAPI<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
    // Si un appel est déjà en cours, attendre son résultat
    if (this.pendingOperations.has(key)) {
      logger.debug('performance', `API dédupliquée: ${key}`);
      return this.pendingOperations.get(key)!;
    }

    // Démarrer l'appel et le mettre en cache
    const promise = apiCall()
      .finally(() => {
        this.pendingOperations.delete(key);
      });

    this.pendingOperations.set(key, promise);
    this.metrics.apiCalls++;

    return promise;
  }

  // Mesurer les performances d'une fonction
  async measure<T>(
    operation: string,
    func: () => Promise<T> | T,
    logThreshold: number = 100
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await func();
      const duration = Date.now() - start;

      if (duration > logThreshold) {
        logger.warn('performance', `Opération lente: ${operation}`, {
          duration: `${duration}ms`,
          threshold: `${logThreshold}ms`
        });
      } else {
        logger.debug('performance', `${operation} terminé`, {
          duration: `${duration}ms`
        });
      }

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error('performance', `Erreur dans ${operation}`, {
        duration: `${duration}ms`,
        error: error
      });
      throw error;
    }
  }

  // Batch des opérations similaires
  private batchQueues = new Map<string, {
    items: any[];
    timer: NodeJS.Timeout;
    resolver: (results: any[]) => void;
  }>();

  batchOperation<T, R>(
    batchKey: string,
    item: T,
    batchProcessor: (items: T[]) => Promise<R[]>,
    delay: number = 50
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      let batch = this.batchQueues.get(batchKey);
      
      if (!batch) {
        batch = {
          items: [],
          timer: null as any,
          resolver: null as any
        };
        this.batchQueues.set(batchKey, batch);
      }

      batch.items.push(item);
      
      // Programmer l'exécution du batch
      if (batch.timer) clearTimeout(batch.timer);
      
      batch.timer = setTimeout(async () => {
        const currentBatch = this.batchQueues.get(batchKey)!;
        this.batchQueues.delete(batchKey);

        try {
          const results = await batchProcessor(currentBatch.items);
          currentBatch.items.forEach((_, index) => {
            if (results[index]) {
              resolve(results[index]);
            }
          });
          
          logger.debug('performance', `Batch traité: ${batchKey}`, {
            itemCount: currentBatch.items.length
          });
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  // Statistiques de performance
  getMetrics(): PerformanceMetrics & {
    cacheStats: {
      size: number;
      hitRate: number;
      totalOperations: number;
    };
  } {
    const totalCacheOps = this.metrics.cacheHits + this.metrics.cacheMisses;
    
    return {
      ...this.metrics,
      cacheStats: {
        size: this.cache.size,
        hitRate: totalCacheOps > 0 ? (this.metrics.cacheHits / totalCacheOps) * 100 : 0,
        totalOperations: totalCacheOps
      }
    };
  }

  // Nettoyer tous les timers et caches
  cleanup(): void {
    this.debouncers.forEach(timer => clearTimeout(timer));
    this.debouncers.clear();
    
    this.batchQueues.forEach(batch => {
      if (batch.timer) clearTimeout(batch.timer);
    });
    this.batchQueues.clear();
    
    this.cache.clear();
    this.pendingOperations.clear();
    
    logger.info('performance', 'Nettoyage complet effectué');
  }

  // Optimiser automatiquement selon les métriques
  optimizeIfNeeded(): void {
    const metrics = this.getMetrics();
    
    // Si le hit rate est bas, augmenter la taille du cache
    if (metrics.cacheStats.hitRate < 60 && metrics.cacheStats.totalOperations > 20) {
      this.cacheConfig.maxSize = Math.min(this.cacheConfig.maxSize * 1.5, 200);
      logger.info('performance', 'Cache optimisé', {
        newSize: this.cacheConfig.maxSize,
        reason: `Hit rate faible: ${metrics.cacheStats.hitRate.toFixed(1)}%`
      });
    }

    // Si beaucoup d'appels API, augmenter le TTL du cache
    if (metrics.apiCalls > 50) {
      this.cacheConfig.ttl = Math.min(this.cacheConfig.ttl * 1.2, 10 * 60 * 1000); // Max 10 min
      logger.info('performance', 'TTL du cache augmenté', {
        newTTL: `${this.cacheConfig.ttl / 1000}s`,
        reason: `Nombreux appels API: ${metrics.apiCalls}`
      });
    }

    this.metrics.lastOptimization = new Date().toISOString();
  }
}

// Instance singleton
export const performanceManager = new PerformanceManager();

// Hooks utilitaires
export const usePerformanceCache = () => ({
  set: performanceManager.set.bind(performanceManager),
  get: performanceManager.get.bind(performanceManager),
  clear: () => performanceManager.cleanup()
});

export const useDebounce = (key: string, delay: number = 300) => 
  performanceManager.debounce.bind(performanceManager, key);

export const measurePerformance = performanceManager.measure.bind(performanceManager);

export default performanceManager;