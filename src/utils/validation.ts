// src/utils/validation.ts - Validation runtime des types

/**
 * Utilitaires de validation runtime pour s'assurer de la cohérence des types
 */

/**
 * Vérifier si une valeur est un objet non-null
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Vérifier si une valeur est une chaîne non vide
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Vérifier si une valeur est un nombre valide
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Vérifier si une valeur est une date ISO valide
 */
export function isValidISODate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !isNaN(date.getTime()) && value === date.toISOString();
}

/**
 * Vérifier si une valeur fait partie d'un enum
 */
export function isInEnum<T extends Record<string, string | number>>(
  value: unknown,
  enumObject: T
): value is T[keyof T] {
  return Object.values(enumObject).includes(value as T[keyof T]);
}

/**
 * Validation d'une entité Strapi de base
 */
export function validateStrapiEntity(data: unknown): data is {
  id: number;
  documentId: string;
  createdAt: string;
  updatedAt: string;
} {
  if (!isObject(data)) return false;
  
  return (
    isValidNumber(data.id) &&
    isNonEmptyString(data.documentId) &&
    isValidISODate(data.createdAt) &&
    isValidISODate(data.updatedAt)
  );
}

/**
 * Nettoyer et valider les données d'un utilisateur
 */
export function validateUser(data: unknown): data is {
  id: number;
  documentId: string;
  username: string;
  email: string;
  nom?: string;
  prenom?: string;
  bobizPoints: number;
  niveau: number;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
} {
  if (!validateStrapiEntity(data) || !isObject(data)) return false;
  
  return (
    isNonEmptyString(data.username) &&
    isNonEmptyString(data.email) &&
    isValidNumber(data.bobizPoints) &&
    isValidNumber(data.niveau) &&
    typeof data.actif === 'boolean' &&
    (data.nom === undefined || typeof data.nom === 'string') &&
    (data.prenom === undefined || typeof data.prenom === 'string')
  );
}

/**
 * Nettoyer et valider les données d'un contact
 */
export function validateContact(data: unknown): data is {
  id: number;
  documentId: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  actif: boolean;
  source: 'import_repertoire' | 'ajout_manuel' | 'invitation';
  dateAjout: string;
  createdAt: string;
  updatedAt: string;
} {
  if (!validateStrapiEntity(data) || !isObject(data)) return false;
  
  const validSources = ['import_repertoire', 'ajout_manuel', 'invitation'];
  
  return (
    isNonEmptyString(data.nom) &&
    isNonEmptyString(data.telephone) &&
    typeof data.actif === 'boolean' &&
    validSources.includes(data.source as string) &&
    isValidISODate(data.dateAjout) &&
    (data.prenom === undefined || typeof data.prenom === 'string') &&
    (data.email === undefined || typeof data.email === 'string')
  );
}

/**
 * Nettoyer et valider les données d'un échange
 */
export function validateExchange(data: unknown): data is {
  id: number;
  documentId: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  bobizGagnes: number;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule' | 'expire';
  createdAt: string;
  updatedAt: string;
} {
  if (!validateStrapiEntity(data) || !isObject(data)) return false;
  
  const validTypes = ['pret', 'emprunt', 'service_offert', 'service_demande'];
  const validStatuses = ['actif', 'en_cours', 'termine', 'annule', 'expire'];
  
  return (
    validTypes.includes(data.type as string) &&
    isNonEmptyString(data.titre) &&
    isNonEmptyString(data.description) &&
    isValidNumber(data.bobizGagnes) &&
    validStatuses.includes(data.statut as string)
  );
}

/**
 * Type guard générique pour les tableaux
 */
export function isArrayOf<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is T[] {
  return Array.isArray(value) && value.every(itemValidator);
}

/**
 * Type guard pour les réponses Strapi
 */
export function isStrapiResponse<T>(
  value: unknown,
  dataValidator: (data: unknown) => data is T
): value is { data: T; meta: Record<string, unknown> } {
  if (!isObject(value)) return false;
  if (!isObject(value.meta)) return false;
  
  return dataValidator(value.data);
}

/**
 * Type guard pour les réponses Strapi avec tableau
 */
export function isStrapiArrayResponse<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is { data: T[]; meta: Record<string, unknown> } {
  if (!isObject(value)) return false;
  if (!isObject(value.meta)) return false;
  
  return isArrayOf(value.data, itemValidator);
}

/**
 * Sanitiser les données en supprimant les propriétés undefined
 */
export function sanitizeData<T extends Record<string, unknown>>(data: T): Partial<T> {
  const sanitized: Partial<T> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Logger d'erreurs de validation
 */
export function logValidationError(
  context: string,
  data: unknown,
  expectedType: string
): void {
  console.error(`❌ Validation error in ${context}:`, {
    expectedType,
    receivedType: typeof data,
    receivedData: data,
    timestamp: new Date().toISOString(),
  });
}