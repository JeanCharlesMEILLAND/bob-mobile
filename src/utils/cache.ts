// src/utils/cache.ts - Cache simple pour améliorer les performances

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time To Live en millisecondes
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupérer une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Définir une valeur dans le cache
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Supprimer une entrée du cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Vider tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Nettoyer les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtenir les statistiques du cache
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired
    };
  }
}

export const apiCache = new SimpleCache();

/**
 * Wrapper pour les appels API avec cache automatique
 */
export async function cachedApiCall<T>(
  key: string,
  apiCall: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Vérifier le cache d'abord
  const cached = apiCache.get<T>(key);
  if (cached !== null) {
    console.log('🚀 Cache hit:', key);
    return cached;
  }

  // Appel API et mise en cache
  console.log('📡 Cache miss, appel API:', key);
  const result = await apiCall();
  apiCache.set(key, result, ttl);
  
  return result;
}

// Nettoyer le cache toutes les 10 minutes
setInterval(() => {
  apiCache.cleanup();
  console.log('🧹 Cache nettoyé:', apiCache.getStats());
}, 10 * 60 * 1000);