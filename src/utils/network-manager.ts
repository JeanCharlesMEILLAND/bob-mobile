// src/utils/network-manager.ts - Gestionnaire réseau et mode offline

// import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  expiry: number;
}

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  context?: string;
}

const CACHE_PREFIX = '@BobCache_';
const QUEUE_KEY = '@BobRequestQueue';
const DEFAULT_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Nombre max d'entrées en cache
const MAX_QUEUE_SIZE = 50; // Nombre max de requêtes en queue

class NetworkManager extends EventEmitter {
  private networkState: NetworkState;
  private requestQueue: QueuedRequest[] = [];
  private isProcessingQueue = false;

  constructor() {
    super();
    this.networkState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
      isWifi: false,
      isCellular: false,
    };

    this.initialize();
  }

  private async initialize() {
    // Charger la queue depuis le storage
    await this.loadRequestQueue();

    // TODO: Activer NetInfo une fois la compatibilité web résolue
    // Écouter les changements de réseau
    // NetInfo.addEventListener(this.handleNetworkChange.bind(this));
    
    // État initial du réseau (mode web par défaut)
    // const initialState = await NetInfo.fetch();
    // this.handleNetworkChange(initialState);
    
    // Simuler état connecté pour le web
    this.handleNetworkChange({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {}
    } as any);
  }

  private handleNetworkChange(state: any) {
    const previouslyConnected = this.networkState.isConnected;
    
    this.networkState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
    };

    console.log('🌐 Changement réseau:', this.networkState);
    
    this.emit('networkStateChanged', this.networkState);

    // Si on vient de se reconnecter, traiter la queue
    if (!previouslyConnected && this.networkState.isConnected) {
      console.log('📶 Reconnexion détectée, traitement de la queue...');
      this.processQueue();
    }
  }

  // =================== GETTERS ===================

  get isOnline(): boolean {
    return this.networkState.isConnected && this.networkState.isInternetReachable;
  }

  get isOffline(): boolean {
    return !this.isOnline;
  }

  get connectionType(): string {
    return this.networkState.type;
  }

  get isWifiConnected(): boolean {
    return this.networkState.isWifi && this.isOnline;
  }

  get isCellularConnected(): boolean {
    return this.networkState.isCellular && this.isOnline;
  }

  getCurrentState(): NetworkState {
    return { ...this.networkState };
  }

  // =================== CACHE MANAGEMENT ===================

  private getCacheKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  async setCache<T>(key: string, data: T, expiryMs: number = DEFAULT_CACHE_EXPIRY): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + expiryMs,
      };

      await AsyncStorage.setItem(
        this.getCacheKey(key),
        JSON.stringify(cacheItem)
      );

      // Nettoyer le cache si nécessaire
      this.cleanupCache();
    } catch (error) {
      console.warn('Erreur cache setCache:', error);
    }
  }

  async getCache<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const cacheItem: CacheItem<T> = JSON.parse(cached);
      
      // Vérifier l'expiration
      if (Date.now() > cacheItem.expiry) {
        await this.removeCache(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('Erreur cache getCache:', error);
      return null;
    }
  }

  async removeCache(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getCacheKey(key));
    } catch (error) {
      console.warn('Erreur cache removeCache:', error);
    }
  }

  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('🗑️ Cache vidé:', cacheKeys.length, 'entrées supprimées');
    } catch (error) {
      console.warn('Erreur cache clearCache:', error);
    }
  }

  private async cleanupCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      if (cacheKeys.length <= MAX_CACHE_SIZE) return;

      // Récupérer tous les items du cache avec leurs timestamps
      const cacheItems = await Promise.all(
        cacheKeys.map(async (key) => {
          try {
            const item = await AsyncStorage.getItem(key);
            if (!item) return null;
            const parsed: CacheItem = JSON.parse(item);
            return { key, timestamp: parsed.timestamp, expiry: parsed.expiry };
          } catch {
            return null;
          }
        })
      );

      const validItems = cacheItems.filter(Boolean) as Array<{
        key: string;
        timestamp: number;
        expiry: number;
      }>;

      // Supprimer les éléments expirés
      const now = Date.now();
      const expiredKeys = validItems
        .filter(item => now > item.expiry)
        .map(item => item.key);

      if (expiredKeys.length > 0) {
        await AsyncStorage.multiRemove(expiredKeys);
        console.log('🧹 Cache nettoyé:', expiredKeys.length, 'entrées expirées supprimées');
      }

      // Si encore trop d'éléments, supprimer les plus anciens
      const remainingItems = validItems.filter(item => now <= item.expiry);
      if (remainingItems.length > MAX_CACHE_SIZE) {
        const itemsToRemove = remainingItems
          .sort((a, b) => a.timestamp - b.timestamp)
          .slice(0, remainingItems.length - MAX_CACHE_SIZE)
          .map(item => item.key);

        await AsyncStorage.multiRemove(itemsToRemove);
        console.log('🗂️ Cache réduit:', itemsToRemove.length, 'anciennes entrées supprimées');
      }
    } catch (error) {
      console.warn('Erreur nettoyage cache:', error);
    }
  }

  // =================== REQUEST QUEUE ===================

  async queueRequest(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>): Promise<string> {
    if (this.requestQueue.length >= MAX_QUEUE_SIZE) {
      // Supprimer la plus ancienne requête
      this.requestQueue.shift();
      console.warn('⚠️ Queue pleine, suppression de la plus ancienne requête');
    }

    const queuedRequest: QueuedRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };

    this.requestQueue.push(queuedRequest);
    await this.saveRequestQueue();
    
    console.log('📝 Requête ajoutée à la queue:', queuedRequest.context || queuedRequest.url);
    
    // Tenter de traiter la queue immédiatement si en ligne
    if (this.isOnline) {
      this.processQueue();
    }

    return queuedRequest.id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0 || this.isOffline) {
      return;
    }

    this.isProcessingQueue = true;
    console.log('🔄 Traitement queue:', this.requestQueue.length, 'requêtes');

    const requestsToProcess = [...this.requestQueue];
    
    for (const request of requestsToProcess) {
      if (this.isOffline) {
        console.log('📵 Hors ligne, arrêt du traitement de la queue');
        break;
      }

      try {
        await this.executeQueuedRequest(request);
        
        // Supprimer de la queue après succès
        this.requestQueue = this.requestQueue.filter(r => r.id !== request.id);
        console.log('✅ Requête traitée avec succès:', request.context || request.url);
        
      } catch (error) {
        request.retries++;
        console.warn(`❌ Échec requête (tentative ${request.retries}):`, error);
        
        if (request.retries >= request.maxRetries) {
          // Supprimer après échec définitif
          this.requestQueue = this.requestQueue.filter(r => r.id !== request.id);
          console.error('💀 Requête abandonnée après', request.maxRetries, 'tentatives');
          
          this.emit('requestFailed', {
            request,
            error: error instanceof Error ? error.message : 'Erreur inconnue'
          });
        }
      }
    }

    await this.saveRequestQueue();
    this.isProcessingQueue = false;
    
    console.log('✅ Traitement queue terminé, reste:', this.requestQueue.length, 'requêtes');
  }

  private async executeQueuedRequest(request: QueuedRequest): Promise<any> {
    const { url, method, body, headers } = request;
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async loadRequestQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(QUEUE_KEY);
      if (queueData) {
        this.requestQueue = JSON.parse(queueData);
        console.log('📂 Queue chargée:', this.requestQueue.length, 'requêtes en attente');
      }
    } catch (error) {
      console.warn('Erreur chargement queue:', error);
      this.requestQueue = [];
    }
  }

  private async saveRequestQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.requestQueue));
    } catch (error) {
      console.warn('Erreur sauvegarde queue:', error);
    }
  }

  getQueueInfo() {
    return {
      count: this.requestQueue.length,
      isProcessing: this.isProcessingQueue,
      requests: this.requestQueue.map(r => ({
        id: r.id,
        url: r.url,
        method: r.method,
        context: r.context,
        retries: r.retries,
        timestamp: r.timestamp,
      }))
    };
  }

  async clearQueue(): Promise<void> {
    this.requestQueue = [];
    await this.saveRequestQueue();
    console.log('🗑️ Queue vidée');
  }

  // =================== SMART FETCH ===================

  async smartFetch<T = any>(
    url: string,
    options: RequestInit & {
      cache?: boolean;
      cacheKey?: string;
      cacheExpiry?: number;
      queueOnFailure?: boolean;
      maxRetries?: number;
      context?: string;
    } = {}
  ): Promise<T> {
    const {
      cache = false,
      cacheKey,
      cacheExpiry = DEFAULT_CACHE_EXPIRY,
      queueOnFailure = true,
      maxRetries = 3,
      context,
      ...fetchOptions
    } = options;

    const finalCacheKey = cacheKey || `${options.method || 'GET'}_${url}`;

    // Essayer le cache si demandé
    if (cache && (options.method === 'GET' || !options.method)) {
      const cachedData = await this.getCache<T>(finalCacheKey);
      if (cachedData) {
        console.log('💾 Données servies depuis le cache:', finalCacheKey);
        return cachedData;
      }
    }

    // Si hors ligne et que c'est une mutation, ajouter à la queue
    if (this.isOffline && queueOnFailure && options.method && options.method !== 'GET') {
      await this.queueRequest({
        url,
        method: options.method,
        body: options.body ? JSON.parse(options.body as string) : undefined,
        headers: options.headers as Record<string, string>,
        maxRetries,
        context,
      });
      
      throw new Error('Hors ligne - Requête mise en queue pour traitement ultérieur');
    }

    // Si hors ligne pour une lecture, lancer une erreur spécifique
    if (this.isOffline) {
      throw new Error('Aucune connexion internet disponible');
    }

    try {
      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: T = await response.json();

      // Mettre en cache si demandé et si c'est un GET
      if (cache && (options.method === 'GET' || !options.method)) {
        await this.setCache(finalCacheKey, data, cacheExpiry);
      }

      return data;
    } catch (error) {
      // Si échec et que c'est une mutation, ajouter à la queue
      if (queueOnFailure && options.method && options.method !== 'GET') {
        await this.queueRequest({
          url,
          method: options.method,
          body: options.body ? JSON.parse(options.body as string) : undefined,
          headers: options.headers as Record<string, string>,
          maxRetries,
          context,
        });
      }
      
      throw error;
    }
  }
}

// Instance singleton
export const networkManager = new NetworkManager();

// Hook React pour utiliser le network manager
export { default as useNetworkState } from './useNetworkState';