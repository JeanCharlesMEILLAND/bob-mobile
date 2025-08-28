// src/types/bob-chat.types.ts - Types pour la messagerie contextuelle Bob

export type BobConversationType = 'pret' | 'emprunt' | 'service' | 'evenement' | 'groupe_local';

export type BobMessageType = 'text' | 'image' | 'system' | 'status_update' | 'location';

export type BobConversationStatus = 'active' | 'terminee' | 'annulee' | 'suspendue';

// === CONTEXTES BOB ===

export interface PretContext {
  pretId: string;
  objet: string;
  duree: string;
  dateEchange: string;
  dateRetour: string;
  lieu: string;
  statut: 'demande' | 'accepte' | 'en_cours' | 'rendu' | 'en_retard';
}

export interface ServiceContext {
  serviceId: string;
  service: string;
  prix?: number;
  dateService: string;
  adresse: string;
  statut: 'negociation' | 'accepte' | 'en_cours' | 'termine' | 'annule';
}

export interface EvenementContext {
  evenementId: string;
  titre: string;
  date: string;
  lieu: string;
  maxParticipants: number;
  participantsCount: number;
  statut: 'planifie' | 'confirme' | 'annule' | 'termine';
}

export interface GroupeLocalContext {
  quartier: string;
  ville: string;
  rayon: number; // en km
  moderateurs: string[]; // IDs des modérateurs
}

// === PARTICIPANTS ===

export interface BobParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'organisateur' | 'participant' | 'moderateur';
  isOnline: boolean;
  lastSeen: string;
  joinedAt: string;
}

// === MESSAGES ===

export interface BobMessage {
  id: string;
  content: string;
  type: BobMessageType;
  conversationId: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  
  // Messages système
  systemType?: 'pret_accepte' | 'service_demande' | 'evenement_annule' | 'nouveau_participant';
  
  // Métadonnées
  metadata?: {
    imageUrl?: string;
    location?: { lat: number; lng: number; address: string };
    replyToId?: string;
    [key: string]: any;
  };
  
  // Statuts de lecture
  readBy: string[];
  isDelivered: boolean;
}

// === CONVERSATIONS BOB ===

export interface BobConversation {
  id: string;
  type: BobConversationType;
  titre: string;
  statut: BobConversationStatus;
  
  // Participants
  participants: BobParticipant[];
  organisateurId: string;
  
  // Contexte (un seul selon le type)
  pretContext?: PretContext;
  serviceContext?: ServiceContext;
  evenementContext?: EvenementContext;
  groupeLocalContext?: GroupeLocalContext;
  
  // Messages
  lastMessage?: BobMessage;
  messagesCount: number;
  unreadCounts: { [userId: string]: number };
  
  // Métadonnées
  localisation?: string; // Quartier/ville
  tags?: string[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastActivity: string;
}

// === DONNÉES POUR L'INTERFACE ===

export interface ConversationListItem {
  conversation: BobConversation;
  unreadCount: number;
  lastMessagePreview: string;
  isOnline: boolean; // Si au moins un participant est en ligne
}

export interface ChatScreenProps {
  conversationId: string;
  conversationType: BobConversationType;
  // Données contextuelles passées depuis l'écran d'origine
  pretData?: any;
  serviceData?: any;
  evenementData?: any;
}

// === SYSTÈME DE NOTIFICATIONS ===

export interface BobNotificationData {
  conversationId: string;
  type: BobConversationType;
  title: string;
  body: string;
  data: {
    action?: 'open_chat' | 'view_pret' | 'view_evenement';
    contextId?: string; // ID du prêt, service, événement
  };
}

// === API RESPONSES ===

export interface BobConversationResponse {
  data: BobConversation;
  meta: {
    participantsCount: number;
    messagesCount: number;
    lastActivity: string;
  };
}

export interface BobMessagesResponse {
  data: BobMessage[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      pageCount: number;
    };
  };
}