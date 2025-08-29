// src/services/bobiz.service.ts - Service pour la gestion des transactions BOBIZ
import { apiClient, tokenStorage } from './api';
import { ErrorHandler, withErrorHandling } from '../utils/error-handler';
import { networkManager } from '../utils/network-manager';

export interface BobizTransaction {
  id: number;
  points: number;
  type: 'gain' | 'depense' | 'bonus' | 'penalite';
  source: 'echange_complete' | 'evenement_participe' | 'parrainage' | 'bonus_niveau' | 'profil_complete';
  description: string;
  dateTransaction: string;
  user: {
    id: number;
    username: string;
    nom?: string;
    prenom?: string;
  };
  echange?: {
    id: number;
    titre: string;
  };
  evenement?: {
    id: number;
    titre: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserBalance {
  userId: number;
  balance: number;
  transactionCount: number;
}

export interface BobizStats {
  totalTransactions: number;
  totalBobizGained: number;
  totalBobizSpent: number;
  totalBobizCirculating: number;
  activeUsers: number;
  averageBalance: number;
}

export interface SpendBobizParams {
  points: number;
  description: string;
  source?: string;
}

export interface RewardUserParams {
  userId: number;
  points: number;
  description: string;
  source?: string;
}

export interface TransactionFilters {
  page?: number;
  pageSize?: number;
  type?: 'gain' | 'depense' | 'bonus' | 'penalite';
}

class BobizService {
  private baseEndpoint = '/bobiz-transactions';

  // =================== BALANCE ET STATISTIQUES ===================

  /**
   * Récupérer le solde BOBIZ d'un utilisateur
   */
  async getUserBalance(userId: number): Promise<UserBalance> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/user/${userId}/balance`,
        {
          cache: true,
          cacheExpiry: 30 * 1000, // 30 secondes
          context: `solde utilisateur ${userId}`,
        }
      );

      return response;
    }, `récupération solde utilisateur ${userId}`);
  }

  /**
   * Récupérer le solde de l'utilisateur connecté
   */
  async getMyBalance(): Promise<UserBalance> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Token non disponible');

      const tokenInfo = tokenStorage.getTokenInfo(token);
      if (!tokenInfo || !tokenInfo.userId) {
        throw new Error('Informations utilisateur non disponibles');
      }

      return this.getUserBalance(tokenInfo.userId);
    }, 'récupération de mon solde');
  }

  /**
   * Récupérer les statistiques globales BOBIZ
   */
  async getGlobalStats(): Promise<BobizStats> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/stats`,
        {
          cache: true,
          cacheExpiry: 5 * 60 * 1000, // 5 minutes
          context: 'statistiques globales BOBIZ',
        }
      );

      return response;
    }, 'récupération statistiques globales BOBIZ');
  }

  // =================== TRANSACTIONS ===================

  /**
   * Dépenser des BOBIZ
   */
  async spendBobiz(params: SpendBobizParams): Promise<{
    transaction: BobizTransaction;
    message: string;
  }> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/spend`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          cache: false,
          queueOnFailure: true,
          context: 'dépense BOBIZ',
        }
      );

      console.log('💰 BOBIZ dépensés:', params.points);
      return response;
    }, 'dépense BOBIZ');
  }

  /**
   * Récompenser un utilisateur (admin/système uniquement)
   */
  async rewardUser(params: RewardUserParams): Promise<{
    transaction: BobizTransaction;
    message: string;
  }> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/reward`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          cache: false,
          queueOnFailure: true,
          context: 'récompense BOBIZ',
        }
      );

      console.log('🎁 BOBIZ récompensés:', params.points, 'à l\'utilisateur', params.userId);
      return response;
    }, 'récompense BOBIZ');
  }

  /**
   * Récupérer l'historique des transactions d'un utilisateur
   */
  async getUserTransactions(
    userId: number,
    filters: TransactionFilters = {}
  ): Promise<{
    transactions: BobizTransaction[];
    pagination: {
      page: number;
      pageSize: number;
    };
  }> {
    return withErrorHandling(async () => {
      const {
        page = 1,
        pageSize = 20,
        type,
      } = filters;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (type) {
        queryParams.append('type', type);
      }

      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/user/${userId}/transactions?${queryParams.toString()}`,
        {
          cache: true,
          cacheExpiry: 1 * 60 * 1000, // 1 minute
          context: `historique utilisateur ${userId}`,
        }
      );

      return response;
    }, `récupération historique utilisateur ${userId}`);
  }

  /**
   * Récupérer l'historique de l'utilisateur connecté
   */
  async getMyTransactions(filters: TransactionFilters = {}): Promise<{
    transactions: BobizTransaction[];
    pagination: {
      page: number;
      pageSize: number;
    };
  }> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Token non disponible');

      const tokenInfo = tokenStorage.getTokenInfo(token);
      if (!tokenInfo || !tokenInfo.userId) {
        throw new Error('Informations utilisateur non disponibles');
      }

      return this.getUserTransactions(tokenInfo.userId, filters);
    }, 'récupération de mon historique');
  }

  // =================== CRUD STANDARD ===================

  /**
   * Récupérer toutes les transactions (avec pagination)
   */
  async getAllTransactions(options: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<{
    data: BobizTransaction[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }> {
    return withErrorHandling(async () => {
      const { page = 1, pageSize = 20 } = options;
      
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        populate: 'user,echange,evenement',
        sort: 'dateTransaction:desc',
      });

      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}?${queryParams.toString()}`,
        {
          cache: true,
          cacheExpiry: 30 * 1000, // 30 secondes
          context: 'toutes les transactions',
        }
      );

      return response;
    }, 'récupération toutes les transactions');
  }

  /**
   * Créer une transaction BOBIZ via l'API standard
   */
  async createTransaction(data: {
    points: number;
    type: 'gain' | 'depense' | 'bonus' | 'penalite';
    source: string;
    description: string;
    userId: number;
  }): Promise<BobizTransaction> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Authentification requise');

      const response = await networkManager.smartFetch(
        this.baseEndpoint,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              points: data.points,
              type: data.type,
              source: data.source,
              description: data.description,
              user: data.userId,
              dateTransaction: new Date().toISOString(),
            },
          }),
          cache: false,
          queueOnFailure: true,
          context: 'création transaction',
        }
      );

      console.log('✅ Transaction BOBIZ créée:', data.points, data.type);
      return response.data;
    }, 'création transaction BOBIZ');
  }

  // =================== HELPERS ===================

  /**
   * Calculer les BOBIZ à récompenser selon la source
   */
  calculateRewardPoints(source: string, metadata?: any): number {
    const baseRewards = {
      'echange_complete': 15,
      'evenement_participe': 10,
      'parrainage': 20,
      'bonus_niveau': 25,
      'profil_complete': 5,
    };

    let points = baseRewards[source as keyof typeof baseRewards] || 10;

    // Bonus selon le type d'échange
    if (source === 'echange_complete' && metadata?.exchangeType) {
      const bonuses = {
        'service_offert': 5,
        'pret': 3,
        'service_demande': 2,
        'emprunt': 1,
      };
      points += bonuses[metadata.exchangeType as keyof typeof bonuses] || 0;
    }

    // Bonus selon l'urgence
    if (metadata?.urgence === 'haute') {
      points += 5;
    }

    return points;
  }

  /**
   * Récompenser automatiquement un utilisateur pour un échange complété
   */
  async rewardForExchange(
    userId: number,
    exchangeId: number,
    exchangeType: string,
    urgence?: string
  ): Promise<BobizTransaction | null> {
    try {
      const points = this.calculateRewardPoints('echange_complete', {
        exchangeType,
        urgence,
      });

      const result = await this.rewardUser({
        userId,
        points,
        description: `Récompense pour échange complété`,
        source: 'echange_complete',
      });

      return result.transaction;
    } catch (error) {
      console.error('❌ Erreur récompense échange:', error);
      return null;
    }
  }

  /**
   * Récompenser automatiquement un utilisateur pour participation à un événement
   */
  async rewardForEvent(userId: number, eventId: number): Promise<BobizTransaction | null> {
    try {
      const points = this.calculateRewardPoints('evenement_participe');

      const result = await this.rewardUser({
        userId,
        points,
        description: `Récompense pour participation à un événement`,
        source: 'evenement_participe',
      });

      return result.transaction;
    } catch (error) {
      console.error('❌ Erreur récompense événement:', error);
      return null;
    }
  }

  /**
   * Formater une transaction pour l'affichage
   */
  formatTransaction(transaction: BobizTransaction): {
    title: string;
    description: string;
    points: string;
    icon: string;
    color: string;
    timeAgo: string;
  } {
    const typeConfig = {
      'gain': {
        icon: '⬆️',
        color: '#22C55E',
        prefix: '+',
      },
      'bonus': {
        icon: '🎁',
        color: '#3B82F6',
        prefix: '+',
      },
      'depense': {
        icon: '⬇️',
        color: '#EF4444',
        prefix: '-',
      },
      'penalite': {
        icon: '⚠️',
        color: '#F59E0B',
        prefix: '-',
      },
    };

    const config = typeConfig[transaction.type];
    const timeAgo = this.getTimeAgo(transaction.dateTransaction);

    return {
      title: transaction.description,
      description: `${transaction.source} • ${timeAgo}`,
      points: `${config.prefix}${transaction.points} BOBIZ`,
      icon: config.icon,
      color: config.color,
      timeAgo,
    };
  }

  /**
   * Calculer le temps écoulé
   */
  private getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return date.toLocaleDateString('fr-FR');
  }
}

export const bobizService = new BobizService();