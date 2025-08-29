// src/services/exchanges.strict.service.ts - Service d'échanges avec types stricts

import { strictApiService, ApiErrorTyped } from './api.strict';
import { Exchange, ExchangeType, ExchangeStatus, User } from '../types/entities.types';
import { StrapiResponse, StrapiParams } from '../types/api.types';
import { validateExchange, isArrayOf, isStrapiResponse, isStrapiArrayResponse, logValidationError } from '../utils/validation';
import { cachedApiCall } from '../utils/cache';

/**
 * Interface pour créer un nouvel échange
 */
export interface CreateExchangeData {
  readonly type: ExchangeType;
  readonly titre: string;
  readonly description: string;
  readonly conditions?: string;
  readonly dureeJours?: number;
  readonly bobizGagnes: number;
  readonly adresse?: string;
  readonly latitude?: number;
  readonly longitude?: number;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Interface pour mettre à jour un échange
 */
export interface UpdateExchangeData extends Partial<CreateExchangeData> {
  readonly statut?: ExchangeStatus;
}

/**
 * Paramètres de recherche d'échanges
 */
export interface ExchangeSearchParams {
  readonly type?: ExchangeType;
  readonly statut?: ExchangeStatus;
  readonly createur?: number;
  readonly search?: string;
  readonly page?: number;
  readonly pageSize?: number;
  readonly sortBy?: 'createdAt' | 'updatedAt' | 'titre' | 'bobizGagnes';
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Service d'échanges avec validation stricte des types
 */
class ExchangesStrictService {
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Récupérer tous les échanges avec paramètres de recherche
   */
  async getExchanges(
    token: string,
    searchParams: ExchangeSearchParams = {}
  ): Promise<readonly Exchange[]> {
    const cacheKey = `exchanges-${JSON.stringify(searchParams)}-${token.slice(-10)}`;
    
    return cachedApiCall(
      cacheKey,
      async () => {
        try {
          const params: StrapiParams = {
            populate: ['createur', 'images'],
            pagination: {
              page: searchParams.page ?? 1,
              pageSize: searchParams.pageSize ?? 25,
            },
            sort: [`${searchParams.sortBy ?? 'createdAt'}:${searchParams.sortOrder ?? 'desc'}`],
          };

          // Filtres
          if (searchParams.type) {
            params.filters = { ...params.filters, type: { $eq: searchParams.type } };
          }
          
          if (searchParams.statut) {
            params.filters = { ...params.filters, statut: { $eq: searchParams.statut } };
          }
          
          if (searchParams.createur) {
            params.filters = { ...params.filters, createur: { id: { $eq: searchParams.createur } } };
          }

          if (searchParams.search) {
            params.filters = {
              ...params.filters,
              $or: [
                { titre: { $containsi: searchParams.search } },
                { description: { $containsi: searchParams.search } },
              ],
            };
          }

          const response = await strictApiService.get<StrapiResponse<Exchange[]>>('/echanges', token, params);

          if (!isStrapiArrayResponse(response.data, validateExchange)) {
            logValidationError('getExchanges', response.data, 'StrapiResponse<Exchange[]>');
            throw new ApiErrorTyped(422, {
              status: 422,
              name: 'ValidationError',
              message: 'Invalid exchange data received from server',
            });
          }

          return response.data.data;
        } catch (error) {
          if (error instanceof ApiErrorTyped) {
            throw error;
          }
          throw new ApiErrorTyped(500, {
            status: 500,
            name: 'ServiceError',
            message: `Failed to fetch exchanges: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      },
      this.CACHE_TTL
    );
  }

  /**
   * Récupérer un échange par ID
   */
  async getExchangeById(id: string, token: string): Promise<Exchange> {
    const cacheKey = `exchange-${id}-${token.slice(-10)}`;
    
    return cachedApiCall(
      cacheKey,
      async () => {
        try {
          const params: StrapiParams = {
            populate: ['createur', 'images', 'evenement'],
          };

          const response = await strictApiService.get<StrapiResponse<Exchange>>(`/echanges/${id}`, token, params);

          if (!isStrapiResponse(response.data, validateExchange)) {
            logValidationError('getExchangeById', response.data, 'StrapiResponse<Exchange>');
            throw new ApiErrorTyped(422, {
              status: 422,
              name: 'ValidationError',
              message: 'Invalid exchange data received from server',
            });
          }

          return response.data.data;
        } catch (error) {
          if (error instanceof ApiErrorTyped) {
            throw error;
          }
          throw new ApiErrorTyped(500, {
            status: 500,
            name: 'ServiceError',
            message: `Failed to fetch exchange ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          });
        }
      },
      this.CACHE_TTL
    );
  }

  /**
   * Créer un nouvel échange
   */
  async createExchange(data: CreateExchangeData, token: string): Promise<Exchange> {
    try {
      // Validation des données d'entrée
      if (!data.titre.trim()) {
        throw new ApiErrorTyped(400, {
          status: 400,
          name: 'ValidationError',
          message: 'Le titre est obligatoire',
        });
      }

      if (!data.description.trim()) {
        throw new ApiErrorTyped(400, {
          status: 400,
          name: 'ValidationError',
          message: 'La description est obligatoire',
        });
      }

      if (data.bobizGagnes < 1 || data.bobizGagnes > 100) {
        throw new ApiErrorTyped(400, {
          status: 400,
          name: 'ValidationError',
          message: 'Les BOBIZ doivent être entre 1 et 100',
        });
      }

      const response = await strictApiService.post<StrapiResponse<Exchange>>('/echanges', data, token);

      if (!isStrapiResponse(response.data, validateExchange)) {
        logValidationError('createExchange', response.data, 'StrapiResponse<Exchange>');
        throw new ApiErrorTyped(422, {
          status: 422,
          name: 'ValidationError',
          message: 'Invalid exchange data received from server after creation',
        });
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof ApiErrorTyped) {
        throw error;
      }
      throw new ApiErrorTyped(500, {
        status: 500,
        name: 'ServiceError',
        message: `Failed to create exchange: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Mettre à jour un échange
   */
  async updateExchange(id: string, data: UpdateExchangeData, token: string): Promise<Exchange> {
    try {
      const response = await strictApiService.put<StrapiResponse<Exchange>>(`/echanges/${id}`, data, token);

      if (!isStrapiResponse(response.data, validateExchange)) {
        logValidationError('updateExchange', response.data, 'StrapiResponse<Exchange>');
        throw new ApiErrorTyped(422, {
          status: 422,
          name: 'ValidationError',
          message: 'Invalid exchange data received from server after update',
        });
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof ApiErrorTyped) {
        throw error;
      }
      throw new ApiErrorTyped(500, {
        status: 500,
        name: 'ServiceError',
        message: `Failed to update exchange ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Supprimer un échange
   */
  async deleteExchange(id: string, token: string): Promise<void> {
    try {
      await strictApiService.delete(`/echanges/${id}`, token);
    } catch (error) {
      if (error instanceof ApiErrorTyped) {
        throw error;
      }
      throw new ApiErrorTyped(500, {
        status: 500,
        name: 'ServiceError',
        message: `Failed to delete exchange ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Récupérer les échanges d'un utilisateur
   */
  async getUserExchanges(userId: number, token: string): Promise<readonly Exchange[]> {
    return this.getExchanges(token, { createur: userId });
  }

  /**
   * Récupérer les échanges actifs
   */
  async getActiveExchanges(token: string): Promise<readonly Exchange[]> {
    return this.getExchanges(token, { statut: 'actif' });
  }
}

// Instance singleton
export const exchangesStrictService = new ExchangesStrictService();