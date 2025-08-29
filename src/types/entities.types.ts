// src/types/entities.types.ts - Types stricts pour les entités BOB

import { StrapiEntity, UploadResponse } from './api.types';

/**
 * ========================================
 * UTILISATEURS
 * ========================================
 */

export interface User extends StrapiEntity {
  username: string;
  email: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  avatar?: UploadResponse;
  bobizPoints: number;
  niveau: number;
  dateInscription: string;
  actif: boolean;
  verified?: boolean;
  blocked?: boolean;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}

/**
 * ========================================
 * CONTACTS & GROUPES
 * ========================================
 */

export interface Contact extends StrapiEntity {
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  actif: boolean;
  source: 'import_repertoire' | 'ajout_manuel' | 'invitation';
  dateAjout: string;
  utilisateurBob?: User;
  groupes?: Groupe[];
}

export interface Groupe extends StrapiEntity {
  nom: string;
  couleur: string;
  description?: string;
  membres: Contact[];
}

/**
 * ========================================
 * ÉCHANGES
 * ========================================
 */

export type ExchangeType = 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
export type ExchangeStatus = 'actif' | 'en_cours' | 'termine' | 'annule' | 'expire';

export interface Exchange extends StrapiEntity {
  type: ExchangeType;
  titre: string;
  description: string;
  conditions?: string;
  dureeJours?: number;
  bobizGagnes: number;
  statut: ExchangeStatus;
  dateEcheance?: string;
  latitude?: number;
  longitude?: number;
  adresse?: string;
  createur: User;
  images?: UploadResponse[];
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * ========================================
 * ÉVÉNEMENTS
 * ========================================
 */

export type EventStatus = 'planifie' | 'en_cours' | 'termine' | 'annule';

export interface Event extends StrapiEntity {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  statut: EventStatus;
  bobizRecompense: number;
  recurrent: boolean;
  maxParticipants?: number;
  createur: User;
  participants: User[];
  groupeCible?: Groupe;
  images?: UploadResponse[];
  metadata?: Record<string, unknown>;
  deadlineRappel?: string;
  rappelsEnvoyes?: Record<string, unknown>;
}

/**
 * ========================================
 * BESOINS
 * ========================================
 */

export type BesoinType = 'objet_demande' | 'service_demande' | 'competence_demande' | 'transport' | 'hebergement' | 'materiel' | 'autre';
export type BesoinUrgence = 'faible' | 'normale' | 'haute' | 'urgente';
export type BesoinStatus = 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'expire';

export interface Besoin extends StrapiEntity {
  titre: string;
  description: string;
  type: BesoinType;
  urgence: BesoinUrgence;
  statut: BesoinStatus;
  dateEcheance?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  bobizOfferts: number;
  quantite: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createur: User;
  evenement?: Event;
  groupeCible?: Groupe;
  images?: UploadResponse[];
}

/**
 * ========================================
 * RÉPONSES AUX BESOINS
 * ========================================
 */

export type ReponseBesoinType = 'proposition' | 'interet' | 'question' | 'contre_proposition';
export type ReponseBesoinStatus = 'en_attente' | 'acceptee' | 'refusee' | 'retiree';

export interface ReponseBesoin extends StrapiEntity {
  type: ReponseBesoinType;
  message?: string;
  conditions?: string;
  statut: ReponseBesoinStatus;
  propositionPrix?: number;
  repondeur: User;
  besoin: Besoin;
}

/**
 * ========================================
 * TRANSACTIONS BOBIZ
 * ========================================
 */

export type TransactionBobizType = 'gain' | 'depense' | 'bonus' | 'penalite' | 'transfert';
export type TransactionBobizStatus = 'en_attente' | 'validee' | 'refusee' | 'annulee';

export interface TransactionBobiz extends StrapiEntity {
  type: TransactionBobizType;
  montant: number;
  description: string;
  statut: TransactionBobizStatus;
  utilisateur: User;
  echange?: Exchange;
  evenement?: Event;
  besoin?: Besoin;
  metadata?: Record<string, unknown>;
}

/**
 * ========================================
 * CONVERSATIONS & MESSAGES
 * ========================================
 */

export type ConversationType = 'pret' | 'emprunt' | 'service' | 'evenement' | 'groupe_local';
export type MessageType = 'text' | 'image' | 'media' | 'system' | 'status_update' | 'location';

export interface Conversation extends StrapiEntity {
  titre: string;
  type: ConversationType;
  actif: boolean;
  lastActivity: string;
  organisateur: User;
  participants: User[];
  metadata?: Record<string, unknown>;
}

export interface Message extends StrapiEntity {
  contenu: string;
  type: MessageType;
  lu: boolean;
  conversation: Conversation;
  expediteur?: User;
  attachments?: UploadResponse[];
  replyTo?: Message;
  metadata?: Record<string, unknown>;
}

/**
 * ========================================
 * INVITATIONS
 * ========================================
 */

export type InvitationType = 'sms' | 'whatsapp' | 'email' | 'push';
export type InvitationStatus = 'envoye' | 'vue' | 'accepte' | 'refuse' | 'expire';

export interface Invitation extends StrapiEntity {
  telephone: string;
  nom: string;
  email?: string;
  statut: InvitationStatus;
  type: InvitationType;
  codeParrainage: string;
  dateEnvoi: string;
  dateVue?: string;
  dateReponse?: string;
  nombreRelances: number;
  expediteur: User;
  evenement?: Event;
  metadata?: Record<string, unknown>;
}

/**
 * ========================================
 * NOTIFICATIONS
 * ========================================
 */

export type NotificationType = 
  | 'contact_nouveau' 
  | 'invitation_reçue' 
  | 'invitation_acceptée' 
  | 'invitation_refusée' 
  | 'message_reçu'
  | 'echange_nouveau' 
  | 'echange_accepté' 
  | 'echange_terminé'
  | 'evenement_nouveau' 
  | 'evenement_rappel'
  | 'groupe_invitation'
  | 'système_info' 
  | 'bienvenue';

export interface Notification extends StrapiEntity {
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  utilisateur: User;
  metadata?: Record<string, unknown>;
}