// src/types/bob.types.ts - Types pour le système BOB
import { User, Event } from './app.types';

// =================== TYPES DE BASE ===================

export type BobType = 'individual' | 'event_related';
export type RequestType = 'direct_request' | 'event_invitation' | 'event_need';
export type BobStatus = 'pending' | 'active' | 'completed' | 'cancelled';

// =================== BOB ACTIF ===================

export interface ActiveBob {
  id: string;
  type: BobType;
  item: string;
  description: string;
  borrower: User; // Celui qui emprunte/reçoit le service
  lender: User;   // Celui qui prête/fournit le service
  status: BobStatus;
  createdAt: Date;
  completedAt?: Date;
  eventContext?: string | null; // ID de l'événement si BOB lié à un événement
  bobizPoints: number;
  location?: string;
  returnDate?: Date;
}

// =================== DEMANDES ===================

export interface BaseBobRequest {
  id: string;
  type: RequestType;
  createdAt: Date;
  bobizPoints: number;
  distance?: string;
}

// Demande directe de BOB (Pierre → moi : "Prête-moi ta perceuse")
export interface DirectBobRequest extends BaseBobRequest {
  type: 'direct_request';
  requester: User;
  item: string;
  description: string;
  urgency: 'low' | 'normal' | 'high' | 'urgent';
}

// Invitation à un événement (Marie → moi : "Viens au week-end Cracovie")
export interface EventInvitation extends BaseBobRequest {
  type: 'event_invitation';
  from: User;
  event: Event;
  invitedAt: Date;
  message?: string;
}

// Besoin d'un événement (Événement Zaky → participants : "Qui a des enceintes ?")
export interface EventNeedRequest extends BaseBobRequest {
  type: 'event_need';
  event: Event;
  item: string;
  description: string;
  postedAt: Date;
  urgency?: 'low' | 'normal' | 'high';
}

// Union type pour toutes les demandes
export type BobRequest = DirectBobRequest | EventInvitation | EventNeedRequest;

// =================== CRÉATION DE BOB ===================

export interface BobCreationData {
  type: 'lend' | 'borrow' | 'service_offer' | 'service_request';
  item: string;
  description: string;
  category: string;
  location?: string;
  availableFrom?: Date;
  availableUntil?: Date;
  bobizPoints?: number;
  targetUsers?: User[]; // Utilisateurs spécifiques à notifier
}

// =================== ÉVÉNEMENT AVEC BESOINS ===================

export interface EventNeed {
  id: string;
  item: string;
  description: string;
  quantity?: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilledBy?: User;
  bobizPoints: number;
}

// =================== STATISTIQUES ===================

export interface BobizStats {
  totalPoints: number;
  level: string;
  bobsCompleted: number;
  bobsActive: number;
  eventsParticipated: number;
  reliability: number; // Pourcentage de BOB menés à terme
}

// =================== NOTIFICATIONS ===================

export interface BobNotification {
  id: string;
  type: 'bob_request' | 'bob_accepted' | 'bob_completed' | 'event_joined' | 'event_need_fulfilled';
  message: string;
  from: User;
  bobId?: string;
  eventId?: string;
  createdAt: Date;
  read: boolean;
}