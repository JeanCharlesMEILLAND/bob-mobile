// src/types/unified-api.types.ts - Types pour l'API unifiée Bob

import { BobIndividuel } from '../services/events.service';

// =================== RÉPONSES ENDPOINTS UNIFIÉS ===================

/**
 * Réponse de l'endpoint POST /evenements/:id/besoins/:besoinId/position
 */
export interface PositionnementResponse {
  success: true;
  bobIndividuel: BobIndividuel;
  besoin: BesoinMisAJour;
  message: string;
}

/**
 * Réponse de l'endpoint POST /evenements/:id/accept
 */
export interface AcceptationInvitationResponse {
  success: true;
  message: string;
  event: EvenementAvecParticipants;
}

/**
 * Réponse de l'endpoint GET /evenements/:id/bobs
 */
export interface BobsEvenementResponse {
  bobs: BobIndividuel[];
  count: number;
}

// =================== STRUCTURES DE DONNÉES ===================

/**
 * Besoin d'événement après assignation
 */
export interface BesoinMisAJour {
  id: string;
  titre: string;
  description: string;
  type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
  quantite?: {
    demandee: number;
    flexible: boolean;
    min?: number;
    max?: number;
  };
  assignations: AssignationBesoin[];
  statut: 'ouvert' | 'partiellement_comble' | 'complet' | 'ferme';
  bobizRecompense?: number;
}

/**
 * Assignation d'un participant sur un besoin
 */
export interface AssignationBesoin {
  id: string;
  participantId: number;
  participantNom: string;
  quantiteProposee: number;
  dateAssignation: string;
  statut: 'accepte' | 'refuse' | 'attente' | 'termine';
  bobIndividuelId: number; // 🔗 Lien vers le BOB créé !
  commentaire?: string;
  dateMiseAJour?: string;
}

/**
 * Événement avec participants chargés
 */
export interface EvenementAvecParticipants {
  id: number;
  documentId: string;
  titre: string;
  description: string;
  dateDebut: string;
  organisateur: {
    id: number;
    username?: string;
    email?: string;
  };
  participants: Participant[];
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
}

/**
 * Participant à un événement
 */
export interface Participant {
  id: number;
  username?: string;
  email?: string;
  avatar?: string;
  dateParticipation?: string;
}

// =================== PARAMÈTRES REQUÊTES ===================

/**
 * Paramètres pour se positionner sur un besoin
 */
export interface PositionnementParams {
  quantiteProposee: number;
  commentaire?: string;
}

/**
 * Paramètres pour accepter une invitation (optionnel)
 */
export interface AcceptationParams {
  dateAcceptation?: string;
  statut?: 'accepte';
}

// =================== ERREURS API ===================

/**
 * Structure d'erreur standardisée de l'API unifiée
 */
export interface ApiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}

/**
 * Codes d'erreur spécifiques à l'architecture unifiée
 */
export enum UnifiedApiErrorCode {
  UTILISATEUR_NON_AUTHENTIFIE = 'USER_NOT_AUTHENTICATED',
  EVENEMENT_NON_TROUVE = 'EVENT_NOT_FOUND', 
  BESOIN_NON_TROUVE = 'NEED_NOT_FOUND',
  DEJA_POSITIONNE = 'ALREADY_POSITIONED',
  DEJA_PARTICIPANT = 'ALREADY_PARTICIPATING',
  EVENEMENT_COMPLET = 'EVENT_FULL',
  BESOIN_COMPLET = 'NEED_COMPLETE',
  CREATION_BOB_ECHEC = 'BOB_CREATION_FAILED',
  SYNCHRONISATION_ECHEC = 'SYNC_FAILED'
}

// =================== MÉTADONNÉES ÉVÉNEMENT ===================

/**
 * Structure complète des métadonnées d'événement
 */
export interface MetadonneesEvenement {
  // Besoins avec assignations trackées
  besoins: BesoinMisAJour[];
  
  // BOBs individuels créés depuis cet événement
  bobsIndividuelsCreés: number[];
  
  // Ciblage des invitations
  ciblage: {
    type: 'all' | 'groups' | 'contacts';
    groupes?: string[];
    contacts?: string[];
    includeUtilisateursBob: boolean;
    includeContactsSansBob: boolean;
  };
  
  // Chat de groupe automatique
  chatGroupeId?: string;
  
  // Statistiques
  stats?: {
    totalBesoins: number;
    besoinsCombles: number;
    totalBobsCrees: number;
    participantsActifs: number;
  };
}

// =================== HELPERS DE TYPE ===================

/**
 * Type guard pour vérifier si un BOB vient d'un événement
 */
export function isBobFromEvent(bob: BobIndividuel): bob is BobIndividuel & { origine: 'evenement'; evenement: number } {
  return bob.origine === 'evenement' && typeof bob.evenement === 'number';
}

/**
 * Type guard pour vérifier si une réponse est une erreur API
 */
export function isApiError(response: any): response is ApiError {
  return response && response.error && typeof response.error.status === 'number';
}

// =================== CONSTANTS ===================

/**
 * Endpoints de l'API unifiée
 */
export const UNIFIED_API_ENDPOINTS = {
  POSITIONNER_SUR_BESOIN: (eventId: string, besoinId: string) => 
    `/evenements/${eventId}/besoins/${besoinId}/position`,
  ACCEPTER_INVITATION: (eventId: string) => 
    `/evenements/${eventId}/accept`,
  REFUSER_INVITATION: (eventId: string) => 
    `/evenements/${eventId}/decline`,
  BOBS_DEPUIS_EVENEMENT: (eventId: string) => 
    `/evenements/${eventId}/bobs`,
  PARTICIPATION_UTILISATEUR: (eventId: string) => 
    `/evenements/${eventId}/participation`
} as const;