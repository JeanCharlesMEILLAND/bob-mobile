// src/types/api.types.ts - Types stricts pour les réponses API

/**
 * Structure générique des réponses Strapi v5
 */
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Structure d'une entité Strapi v5 avec documentId
 */
export interface StrapiEntity {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  locale?: string;
}

/**
 * Erreur API standardisée
 */
export interface ApiError {
  status: number;
  name: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Réponse d'erreur Strapi
 */
export interface StrapiErrorResponse {
  data: null;
  error: ApiError;
}

/**
 * Type pour les réponses HTTP
 */
export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
  headers?: Record<string, string>;
}

/**
 * Configuration pour les appels API
 */
export interface ApiConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

/**
 * Types pour les filtres Strapi
 */
export interface StrapiFilter {
  [key: string]: 
    | string 
    | number 
    | boolean 
    | { $eq?: unknown; $ne?: unknown; $in?: unknown[]; $notIn?: unknown[]; $lt?: number; $lte?: number; $gt?: number; $gte?: number; $contains?: string; $notContains?: string; $containsi?: string; $notContainsi?: string; $null?: boolean; $notNull?: boolean; };
}

/**
 * Paramètres de requête Strapi
 */
export interface StrapiParams {
  filters?: StrapiFilter;
  populate?: string | string[] | Record<string, unknown>;
  fields?: string[];
  sort?: string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  locale?: string;
}

/**
 * Types pour l'upload de fichiers
 */
export interface UploadFileData {
  name: string;
  type: string;
  size: number;
  uri: string;
}

export interface UploadResponse {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: Record<string, unknown>;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}