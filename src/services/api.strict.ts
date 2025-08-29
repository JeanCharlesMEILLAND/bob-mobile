// src/services/api.strict.ts - Service API avec types stricts

import { ApiResponse, ApiError, StrapiParams, UploadFileData, UploadResponse } from '../types/api.types';

/**
 * Configuration de l'API
 */
const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:1337/api',
  timeout: 30000,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Classe d'erreur API typée
 */
export class ApiErrorTyped extends Error {
  constructor(
    public readonly status: number,
    public readonly apiError: ApiError,
    public readonly response?: Response
  ) {
    super(apiError.message);
    this.name = 'ApiErrorTyped';
  }
}

/**
 * Service API strict avec types
 */
export class StrictApiService {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  /**
   * Construire l'URL avec paramètres Strapi
   */
  private buildUrl(endpoint: string, params?: StrapiParams): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      // Filters
      if (params.filters) {
        Object.entries(params.filters).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            Object.entries(value).forEach(([operator, operatorValue]) => {
              url.searchParams.append(`filters[${key}][${operator}]`, String(operatorValue));
            });
          } else {
            url.searchParams.append(`filters[${key}]`, String(value));
          }
        });
      }

      // Populate
      if (params.populate) {
        if (typeof params.populate === 'string') {
          url.searchParams.append('populate', params.populate);
        } else if (Array.isArray(params.populate)) {
          params.populate.forEach(field => {
            url.searchParams.append('populate', field);
          });
        } else {
          Object.entries(params.populate).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
              url.searchParams.append(`populate[${key}]`, String(value));
            } else if (typeof value === 'string') {
              url.searchParams.append(`populate[${key}]`, value);
            } else {
              url.searchParams.append(`populate[${key}]`, JSON.stringify(value));
            }
          });
        }
      }

      // Fields
      if (params.fields) {
        params.fields.forEach(field => {
          url.searchParams.append('fields', field);
        });
      }

      // Sort
      if (params.sort) {
        params.sort.forEach(sortField => {
          url.searchParams.append('sort', sortField);
        });
      }

      // Pagination
      if (params.pagination) {
        Object.entries(params.pagination).forEach(([key, value]) => {
          if (value !== undefined) {
            url.searchParams.append(`pagination[${key}]`, String(value));
          }
        });
      }

      // Locale
      if (params.locale) {
        url.searchParams.append('locale', params.locale);
      }
    }

    return url.toString();
  }

  /**
   * Requête HTTP générique avec types
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    params?: StrapiParams
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, params);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...API_CONFIG.defaultHeaders,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new ApiErrorTyped(
          response.status,
          {
            status: response.status,
            name: data.error?.name || 'ApiError',
            message: data.error?.message || response.statusText,
            details: data.error?.details,
          },
          response
        );
      }

      return {
        ok: true,
        status: response.status,
        data,
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiErrorTyped) {
        throw error;
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiErrorTyped(408, {
          status: 408,
          name: 'TimeoutError',
          message: 'Request timeout',
        });
      }
      
      throw new ApiErrorTyped(500, {
        status: 500,
        name: 'NetworkError',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * GET avec types
   */
  async get<T>(endpoint: string, token?: string, params?: StrapiParams): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }, params);
  }

  /**
   * POST avec types
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    token?: string,
    params?: StrapiParams
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: data ? JSON.stringify({ data }) : undefined,
    }, params);
  }

  /**
   * PUT avec types
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    token?: string,
    params?: StrapiParams
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: data ? JSON.stringify({ data }) : undefined,
    }, params);
  }

  /**
   * DELETE avec types
   */
  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  }

  /**
   * Upload de fichier avec types
   */
  async uploadFile(
    file: UploadFileData,
    token?: string
  ): Promise<ApiResponse<UploadResponse[]>> {
    const formData = new FormData();
    formData.append('files', {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);

    return this.request<UploadResponse[]>('/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
  }
}

// Instance singleton
export const strictApiService = new StrictApiService();