// src/types/app.types.ts - Types généraux de l'application
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  phone?: string;
  location?: string;
  bobizPoints?: number;
  niveau?: string; // Niveau BOB (Débutant, Super Bob, etc.)
  createdAt: Date;
  lastActive?: Date;
  isOnline?: boolean;
  // Statistiques
  reliability?: number; // Fiabilité (0-100)
  completedBobs?: number;
  totalBobs?: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizer: User;
  date: Date;
  location: string;
  category?: string;
  maxParticipants?: number;
  participants: User[];
  needs?: EventNeed[];
  createdAt: Date;
  status: 'active' | 'cancelled' | 'completed';
  image?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface EventNeed {
  id: string;
  item: string;
  description: string;
  quantity?: number;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilledBy?: User;
  bobizPoints: number;
  category?: string;
  urgency?: 'low' | 'normal' | 'high';
}

// Interface pour les contacts du répertoire téléphonique
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isRegistered?: boolean; // Si la personne est déjà sur BOB
  bobUser?: User; // Lien vers le profil BOB si registré
}

// Interface pour les statistiques utilisateur
export interface UserStats {
  bobizPoints: number;
  level: string;
  completedBobs: number;
  activeBobs: number;
  eventsParticipated: number;
  eventsOrganized: number;
  reliability: number;
  ranking?: number;
  streak?: number; // Série de BOB réussis
}

// Interface pour les paramètres utilisateur
export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    bobRequests: boolean;
    eventInvitations: boolean;
    reminders: boolean;
  };
  privacy: {
    showLocation: boolean;
    showPhone: boolean;
    publicProfile: boolean;
  };
  language: string;
  currency: string;
}

// Interface pour la géolocalisation
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  accuracy?: number;
}

// Interface pour les catégories de BOB
export interface BobCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
  subcategories?: BobSubcategory[];
}

export interface BobSubcategory {
  id: string;
  name: string;
  parentCategoryId: string;
  icon?: string;
}

// Interface pour les niveaux BOB
export interface BobLevel {
  id: string;
  name: string;
  minPoints: number;
  maxPoints?: number;
  icon: string;
  color: string;
  benefits: string[];
}

// Interface pour les achievements/badges
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: Date;
}

// Interface pour la recherche
export interface SearchFilters {
  category?: string;
  location?: Location;
  radius?: number; // en km
  dateRange?: {
    from: Date;
    to: Date;
  };
  bobizPointsRange?: {
    min: number;
    max: number;
  };
  availability?: 'immediate' | 'scheduled' | 'flexible';
  userRating?: number;
}

// Interface pour les messages/chat
export interface Message {
  id: string;
  chatId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'location' | 'bob_request' | 'event_invitation';
  timestamp: Date;
  read: boolean;
  edited?: boolean;
  editedAt?: Date;
  replyTo?: string; // ID du message auquel on répond
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  lastActivity: Date;
  unreadCount: number;
  type: 'direct' | 'group' | 'bob_related' | 'event_related';
  context?: {
    bobId?: string;
    eventId?: string;
  };
}

// Interface pour les rapports/signalements
export interface Report {
  id: string;
  reporter: User;
  reported: User;
  type: 'inappropriate_behavior' | 'spam' | 'fake_profile' | 'bob_issue' | 'other';
  description: string;
  context?: {
    bobId?: string;
    eventId?: string;
    messageId?: string;
  };
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: Date;
  resolvedAt?: Date;
}

// Interface pour l'historique des actions
export interface ActivityLog {
  id: string;
  user: User;
  action: 'bob_created' | 'bob_completed' | 'event_joined' | 'event_created' | 'user_helped' | 'achievement_unlocked';
  details: string;
  points?: number;
  timestamp: Date;
  context?: {
    bobId?: string;
    eventId?: string;
    targetUserId?: string;
  };
}

// Interface pour les invitations d'amis
export interface FriendInvitation {
  id: string;
  inviter: User;
  inviteeContact: Contact;
  invitationCode?: string;
  sentAt: Date;
  acceptedAt?: Date;
  bobizBonus: number; // Points pour le parrain et le filleul
  status: 'sent' | 'accepted' | 'expired';
}

// Types d'union utiles
export type NotificationType = 
  | 'bob_request' 
  | 'bob_accepted' 
  | 'bob_completed' 
  | 'event_invitation' 
  | 'event_joined'
  | 'event_reminder'
  | 'achievement_unlocked'
  | 'friend_invitation'
  | 'message_received';

export type BobAction = 'lend' | 'borrow' | 'service_offer' | 'service_request';
export type EventStatus = 'draft' | 'active' | 'cancelled' | 'completed';
export type UserRole = 'user' | 'moderator' | 'admin';