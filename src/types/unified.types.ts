// src/types/unified.types.ts - Types unifiés BOB avec Strapi v5
import { StrapiEntity, UploadResponse } from './api.types';

/**
 * ========================================
 * CORE ENTITIES - Basées sur Strapi v5
 * ========================================
 */

/**
 * Utilisateur BOB avec extension des permissions Strapi
 */
export interface User extends StrapiEntity {
  // Champs Strapi de base
  username: string;
  email: string;
  provider?: string;
  confirmed: boolean;
  blocked: boolean;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };

  // Extensions BOB
  nom?: string;
  prenom?: string;
  telephone?: string;
  avatar?: UploadResponse;
  dateInscription?: string;
  dernierConnexion?: string;
  estEnLigne: boolean;

  // Système BOBIZ
  bobizPoints: number;
  niveau: 'Débutant' | 'Ami fidèle' | 'Super Bob' | 'Légende';

  // Stats calculées (non stockées)
  reliability?: number; // 0-100
  completedExchanges?: number;
  totalExchanges?: number;

  // Relations
  bob_conversations?: Conversation[];
}

/**
 * Contact avec détection utilisateur BOB
 */
export interface Contact extends StrapiEntity {
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  actif: boolean;
  source: 'import_repertoire' | 'ajout_manuel' | 'invitation';
  dateAjout: string;
  
  // Relation vers utilisateur BOB si inscrit
  utilisateurBob?: User;
  groupes?: Groupe[];
}

/**
 * Groupe de contacts
 */
export interface Groupe extends StrapiEntity {
  nom: string;
  couleur: string;
  description?: string;
  membres: Contact[];
}

/**
 * ========================================
 * ÉCHANGES & SERVICES
 * ========================================
 */

export type ExchangeType = 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
export type ExchangeStatus = 'actif' | 'en_cours' | 'termine' | 'annule' | 'expire';
export type ExchangeOrigin = 'direct' | 'evenement';

/**
 * Échange BOB (prêt/emprunt/service)
 */
export interface Exchange extends StrapiEntity {
  type: ExchangeType;
  titre: string;
  description: string;
  conditions?: string;
  statut: ExchangeStatus;
  origine: ExchangeOrigin;

  // Durée et dates
  dureeJours?: number;
  dateExpiration?: string;
  dateCreation?: string;
  dateDebut?: string;
  dateFin?: string;

  // Géolocalisation
  adresse?: string;
  latitude?: number;
  longitude?: number;

  // BOBIZ
  bobizGagnes: number;

  // Relations
  createur: User;
  demandeur?: User;
  evenement?: Event;
  groupeCible?: Groupe;

  // Médias et métadonnées
  images?: UploadResponse[];
  metadata?: Record<string, any>;
}

/**
 * ========================================
 * ÉVÉNEMENTS
 * ========================================
 */

export type EventStatus = 'planifie' | 'en_cours' | 'termine' | 'annule';

/**
 * Événement collaboratif
 */
export interface Event extends StrapiEntity {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  statut: EventStatus;

  // Lieu
  adresse?: string;
  latitude?: number;
  longitude?: number;

  // Paramètres
  maxParticipants?: number;
  bobizRecompense: number;
  recurrent: boolean;

  // Relations
  createur: User;
  participants: User[];
  groupeCible?: Groupe;

  // Rappels
  deadlineRappel?: string;
  rappelsEnvoyes?: Record<string, any>;

  // Médias et métadonnées
  images?: UploadResponse[];
  metadata?: Record<string, any>;

  // Besoins liés (calculé)
  besoins?: Besoin[];
}

/**
 * ========================================
 * BESOINS & RÉPONSES
 * ========================================
 */

export type BesoinType = 'objet_demande' | 'service_demande' | 'competence_demande' | 'transport' | 'hebergement' | 'materiel' | 'autre';
export type BesoinUrgence = 'faible' | 'normale' | 'haute' | 'urgente';
export type BesoinStatus = 'ouvert' | 'en_cours' | 'resolu' | 'ferme' | 'expire';

/**
 * Besoin exprimé (lié à un événement ou indépendant)
 */
export interface Besoin extends StrapiEntity {
  titre: string;
  description: string;
  type: BesoinType;
  urgence: BesoinUrgence;
  statut: BesoinStatus;
  
  // Timing
  dateEcheance?: string;
  
  // Lieu
  adresse?: string;
  latitude?: number;
  longitude?: number;
  
  // Quantité et récompense
  quantite: number;
  bobizOfferts: number;
  
  // Relations
  createur: User;
  evenement?: Event;
  groupeCible?: Groupe;
  
  // Réponses reçues
  reponses?: ReponseBesoin[];
  
  // Médias
  images?: UploadResponse[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export type ReponseBesoinType = 'proposition' | 'interet' | 'question' | 'contre_proposition';
export type ReponseBesoinStatus = 'en_attente' | 'acceptee' | 'refusee' | 'retiree';

/**
 * Réponse à un besoin
 */
export interface ReponseBesoin extends StrapiEntity {
  type: ReponseBesoinType;
  message?: string;
  conditions?: string;
  statut: ReponseBesoinStatus;
  propositionPrix?: number;
  
  // Relations
  repondeur: User;
  besoin: Besoin;
}

/**
 * ========================================
 * SYSTÈME BOBIZ
 * ========================================
 */

export type TransactionBobizType = 'gain' | 'depense' | 'bonus' | 'penalite';
export type TransactionBobizSource = 'echange_complete' | 'evenement_participe' | 'parrainage' | 'bonus_niveau' | 'profil_complete';

/**
 * Transaction BOBIZ
 */
export interface BobizTransaction extends StrapiEntity {
  type: TransactionBobizType;
  source: TransactionBobizSource;
  points: number;
  description: string;
  dateTransaction: string;
  
  // Relations
  user: User;
  echange?: Exchange;
  evenement?: Event;
}

/**
 * ========================================
 * COMMUNICATIONS
 * ========================================
 */

export type ConversationType = 'pret' | 'emprunt' | 'service' | 'evenement' | 'groupe_local';

/**
 * Conversation temps réel
 */
export interface Conversation extends StrapiEntity {
  titre: string;
  type: ConversationType;
  actif: boolean;
  lastActivity: string;
  
  // Relations
  organisateur?: User;
  participants: User[];
  
  // Messages (calculé)
  messages?: Message[];
  metadata?: Record<string, any>;
}

export type MessageType = 'text' | 'image' | 'media' | 'system' | 'status_update' | 'location';

/**
 * Message dans une conversation
 */
export interface Message extends StrapiEntity {
  contenu: string;
  type: MessageType;
  lu: boolean;
  
  // Relations
  conversation: Conversation;
  expediteur?: User;
  replyTo?: Message;
  
  // Pièces jointes
  attachments?: UploadResponse[];
  metadata?: Record<string, any>;
}

/**
 * ========================================
 * INVITATIONS & NOTIFICATIONS
 * ========================================
 */

export type InvitationType = 'sms' | 'whatsapp' | 'email' | 'push';
export type InvitationStatus = 'envoye' | 'vue' | 'accepte' | 'refuse' | 'expire';

/**
 * Invitation à rejoindre BOB
 */
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
  
  // Relations
  expediteur: User;
  evenement?: Event;
  metadata?: Record<string, any>;
}

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

/**
 * Notification utilisateur
 */
export interface Notification extends StrapiEntity {
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  
  // Relation
  utilisateur: User;
  metadata?: Record<string, any>;
}

/**
 * ========================================
 * TYPES DÉRIVÉS & UTILITAIRES
 * ========================================
 */

/**
 * Données pour créer un nouvel échange
 */
export interface CreateExchangeData {
  type: ExchangeType;
  titre: string;
  description: string;
  conditions?: string;
  dureeJours?: number;
  bobizGagnes: number;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  evenementId?: string;
  groupeCibleId?: string;
  contactsCibles?: string[];
  metadata?: Record<string, any>;
}

/**
 * Données pour créer un événement
 */
export interface CreateEventData {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  adresse?: string;
  latitude?: number;
  longitude?: number;
  maxParticipants?: number;
  bobizRecompense: number;
  recurrent: boolean;
  groupeCibleId?: string;
  metadata?: Record<string, any>;
}

/**
 * Statistiques utilisateur calculées
 */
export interface UserStats {
  totalExchanges: number;
  completedExchanges: number;
  activeExchanges: number;
  totalEvents: number;
  totalBobizEarned: number;
  totalBobizSpent: number;
  reliability: number; // 0-100
  averageRating?: number;
  responseTime?: number; // en heures
}

/**
 * Préférences utilisateur
 */
export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    showPhone: boolean;
    showEmail: boolean;
    showLocation: boolean;
  };
  language: 'fr' | 'en' | 'pl';
  theme: 'light' | 'dark' | 'auto';
}

/**
 * État de recherche pour les échanges
 */
export interface ExchangeSearchParams {
  type?: ExchangeType;
  statut?: ExchangeStatus;
  search?: string;
  location?: {
    lat: number;
    lon: number;
    radius: number; // en km
  };
  bobizRange?: {
    min: number;
    max: number;
  };
  sortBy?: 'date' | 'bobiz' | 'distance' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Réponse paginée générique
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}