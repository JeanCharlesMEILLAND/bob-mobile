// src/services/bobService.ts - Service complet pour la gestion des BOBs (échanges)

import { apiClient } from './api';
import { ErrorHandler, withErrorHandling, withRetry } from '../utils/error-handler';
import { networkManager } from '../utils/network-manager';
import { ExchangeStrapi } from './exchanges.service';

export interface BobItem extends ExchangeStrapi {}

export interface CreateBobParams {
  titre: string;
  description: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  categorie: string;
  dureeJours?: number;
  conditions?: string;
  bobizRecompense?: number;
  contactsCibles?: Array<{
    nom: string;
    telephone: string;
    email?: string;
  }>;
  origine?: 'direct' | 'evenement';
  evenementId?: number;
  metadata?: {
    localisation?: string;
    urgence?: 'basse' | 'normale' | 'haute';
    images?: string[];
  };
}

export interface UpdateBobParams extends Partial<CreateBobParams> {
  statut?: 'actif' | 'en_cours' | 'termine' | 'annule';
}

export interface BobFilters {
  type?: string[];
  statut?: string[];
  categorie?: string[];
  urgence?: string[];
  origine?: string[];
  search?: string;
  userId?: number;
  dateDebut?: string;
  dateFin?: string;
}

export interface BobPaginatedResponse {
  data: BobItem[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

class BobService {
  private baseEndpoint = '/echanges';

  // =================== CRUD OPERATIONS ===================

  /**
   * Créer un nouveau BOB
   */
  async createBob(params: CreateBobParams, token: string): Promise<BobItem> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(`${this.baseEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            titre: params.titre,
            description: params.description,
            type: params.type,
            categorie: params.categorie,
            dureeJours: params.dureeJours,
            conditions: params.conditions,
            bobizRecompense: params.bobizRecompense || this.calculateDefaultBobiz(params.type),
            statut: 'actif',
            origine: params.origine || 'direct',
            evenement: params.evenementId || null,
            contactsCibles: params.contactsCibles || [],
            metadata: {
              ...params.metadata,
              dateCreation: new Date().toISOString(),
            },
          },
        }),
        cache: false,
        queueOnFailure: true,
        context: 'création BOB',
      });

      console.log('✅ BOB créé:', response.data.titre);
      return response.data;
    }, 'création BOB');
  }

  /**
   * Récupérer la liste des BOBs avec pagination et filtres
   */
  async getBobs(
    options: {
      page?: number;
      pageSize?: number;
      filters?: BobFilters;
      sort?: string;
    } = {},
    token: string
  ): Promise<BobPaginatedResponse> {
    return withErrorHandling(async () => {
      const {
        page = 1,
        pageSize = 10,
        filters = {},
        sort = 'dateCreation:desc',
      } = options;

      // Construire les paramètres de requête
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        populate: '*',
        sort,
      });

      // Ajouter les filtres
      if (filters.type && filters.type.length > 0) {
        filters.type.forEach(type => {
          queryParams.append('filters[type][$in]', type);
        });
      }

      if (filters.statut && filters.statut.length > 0) {
        filters.statut.forEach(statut => {
          queryParams.append('filters[statut][$in]', statut);
        });
      }

      if (filters.categorie && filters.categorie.length > 0) {
        filters.categorie.forEach(cat => {
          queryParams.append('filters[categorie][$in]', cat);
        });
      }

      if (filters.origine && filters.origine.length > 0) {
        filters.origine.forEach(origine => {
          queryParams.append('filters[origine][$in]', origine);
        });
      }

      if (filters.userId) {
        queryParams.append('filters[createur][id][$eq]', filters.userId.toString());
      }

      if (filters.search) {
        queryParams.append('filters[$or][0][titre][$containsi]', filters.search);
        queryParams.append('filters[$or][1][description][$containsi]', filters.search);
      }

      if (filters.dateDebut) {
        queryParams.append('filters[dateCreation][$gte]', filters.dateDebut);
      }

      if (filters.dateFin) {
        queryParams.append('filters[dateCreation][$lte]', filters.dateFin);
      }

      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: true,
          cacheExpiry: 2 * 60 * 1000, // 2 minutes
          context: 'récupération BOBs',
        }
      );

      return {
        data: response.data || [],
        pagination: response.meta?.pagination || {
          page: 1,
          pageSize: 10,
          pageCount: 1,
          total: response.data?.length || 0,
        },
      };
    }, 'récupération BOBs');
  }

  /**
   * Récupérer un BOB par ID
   */
  async getBob(bobId: string | number, token: string): Promise<BobItem> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/${bobId}?populate=*`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: true,
          cacheExpiry: 1 * 60 * 1000, // 1 minute
          context: `récupération BOB ${bobId}`,
        }
      );

      return response.data;
    }, `récupération BOB ${bobId}`);
  }

  /**
   * Mettre à jour un BOB
   */
  async updateBob(
    bobId: string | number,
    updates: UpdateBobParams,
    token: string
  ): Promise<BobItem> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(`${this.baseEndpoint}/${bobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            ...updates,
            dateModification: new Date().toISOString(),
          },
        }),
        cache: false,
        queueOnFailure: true,
        context: `mise à jour BOB ${bobId}`,
      });

      console.log('✅ BOB mis à jour:', response.data.titre);
      return response.data;
    }, `mise à jour BOB ${bobId}`);
  }

  /**
   * Supprimer un BOB
   */
  async deleteBob(bobId: string | number, token: string): Promise<void> {
    return withErrorHandling(async () => {
      await networkManager.smartFetch(`${this.baseEndpoint}/${bobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: false,
        queueOnFailure: true,
        context: `suppression BOB ${bobId}`,
      });

      console.log('🗑️ BOB supprimé:', bobId);
    }, `suppression BOB ${bobId}`);
  }

  // =================== ACTIONS SPÉCIFIQUES ===================

  /**
   * Marquer un BOB comme en cours
   */
  async startBob(bobId: string | number, token: string): Promise<BobItem> {
    return this.updateBob(bobId, { statut: 'en_cours' }, token);
  }

  /**
   * Compléter un BOB (utilise l'endpoint unifié)
   */
  async completeBob(
    bobId: string | number,
    params: {
      evaluation?: number;
      commentaire?: string;
    } = {},
    token: string
  ): Promise<{
    success: boolean;
    bob: BobItem;
    bobizGagnes: number;
    message: string;
  }> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(`${this.baseEndpoint}/${bobId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        cache: false,
        queueOnFailure: true,
        context: `complétion BOB ${bobId}`,
      });

      console.log('🎉 BOB complété:', response.bob.titre, `(+${response.bobizGagnes} bobiz)`);
      return response;
    }, `complétion BOB ${bobId}`);
  }

  /**
   * Annuler un BOB (utilise l'endpoint unifié)
   */
  async cancelBob(
    bobId: string | number,
    params: {
      raison?: string;
    } = {},
    token: string
  ): Promise<{
    success: boolean;
    bob: BobItem;
    message: string;
  }> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(`${this.baseEndpoint}/${bobId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        cache: false,
        queueOnFailure: true,
        context: `annulation BOB ${bobId}`,
      });

      console.log('❌ BOB annulé:', response.bob.titre);
      return response;
    }, `annulation BOB ${bobId}`);
  }

  // =================== RECHERCHE ET FILTRES ===================

  /**
   * Rechercher des BOBs par texte
   */
  async searchBobs(
    query: string,
    options: {
      filters?: Partial<BobFilters>;
      page?: number;
      pageSize?: number;
    } = {},
    token: string
  ): Promise<BobPaginatedResponse> {
    return this.getBobs(
      {
        ...options,
        filters: {
          ...options.filters,
          search: query,
        },
      },
      token
    );
  }

  /**
   * Récupérer les BOBs d'un utilisateur
   */
  async getUserBobs(
    userId: number,
    options: {
      statut?: string[];
      page?: number;
      pageSize?: number;
    } = {},
    token: string
  ): Promise<BobPaginatedResponse> {
    return this.getBobs(
      {
        ...options,
        filters: {
          userId,
          statut: options.statut,
        },
      },
      token
    );
  }

  /**
   * Récupérer les BOBs issus d'un événement
   */
  async getEventBobs(eventId: number, token: string): Promise<BobItem[]> {
    return withErrorHandling(async () => {
      const response = await networkManager.smartFetch(
        `/evenements/${eventId}/bobs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: true,
          cacheExpiry: 1 * 60 * 1000, // 1 minute
          context: `BOBs événement ${eventId}`,
        }
      );

      return response.bobs || [];
    }, `récupération BOBs événement ${eventId}`);
  }

  // =================== STATISTIQUES ===================

  /**
   * Récupérer les statistiques des BOBs
   */
  async getBobStats(userId?: number, token?: string): Promise<{
    total: number;
    actifs: number;
    termines: number;
    bobizGagnes: number;
    byType: Record<string, number>;
    byCategorie: Record<string, number>;
  }> {
    return withErrorHandling(async () => {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId.toString());

      const response = await networkManager.smartFetch(
        `${this.baseEndpoint}/stats${params.toString() ? `?${params}` : ''}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
          } : {},
          cache: true,
          cacheExpiry: 5 * 60 * 1000, // 5 minutes
          context: 'statistiques BOBs',
        }
      );

      return response;
    }, 'récupération statistiques BOBs');
  }

  // =================== HELPERS ===================

  /**
   * Calculer les BOBIZ par défaut selon le type
   */
  private calculateDefaultBobiz(type: string): number {
    const baseValues = {
      'pret': 10,
      'emprunt': 5,
      'service_offert': 15,
      'service_demande': 10,
    };

    return baseValues[type as keyof typeof baseValues] || 10;
  }

  /**
   * Valider les paramètres de création
   */
  validateCreateParams(params: CreateBobParams): string[] {
    const errors: string[] = [];

    if (!params.titre || params.titre.trim().length < 3) {
      errors.push('Le titre doit contenir au moins 3 caractères');
    }

    if (!params.description || params.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }

    if (!params.type) {
      errors.push('Le type est obligatoire');
    }

    if (!params.categorie) {
      errors.push('La catégorie est obligatoire');
    }

    if (params.dureeJours && (params.dureeJours < 1 || params.dureeJours > 365)) {
      errors.push('La durée doit être entre 1 et 365 jours');
    }

    if (params.bobizRecompense && (params.bobizRecompense < 1 || params.bobizRecompense > 100)) {
      errors.push('La récompense doit être entre 1 et 100 bobiz');
    }

    return errors;
  }

  /**
   * Formater un BOB pour l'affichage
   */
  formatBobForDisplay(bob: BobItem): {
    titre: string;
    description: string;
    typeLabel: string;
    statutLabel: string;
    urgenceLabel: string;
    timeAgo: string;
    bobizText: string;
  } {
    const typeLabels = {
      'pret': '📦 Prêt',
      'emprunt': '🙏 Emprunt',
      'service_offert': '💪 Service offert',
      'service_demande': '🆘 Service demandé',
    };

    const statutLabels = {
      'actif': '🟢 Actif',
      'en_cours': '🟡 En cours',
      'termine': '✅ Terminé',
      'annule': '❌ Annulé',
    };

    const urgenceLabels = {
      'basse': '🟢 Basse',
      'normale': '🟡 Normale',
      'haute': '🔴 Haute',
    };

    const timeAgo = this.getTimeAgo(bob.dateCreation);

    return {
      titre: bob.titre,
      description: bob.description,
      typeLabel: typeLabels[bob.type] || bob.type,
      statutLabel: statutLabels[bob.statut] || bob.statut,
      urgenceLabel: urgenceLabels[bob.metadata?.urgence || 'normale'],
      timeAgo,
      bobizText: `${bob.bobizRecompense} bobiz`,
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

export const bobService = new BobService();