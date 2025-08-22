// src/types/chat.types.ts - Types pour le système de messagerie
export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'emoji' | 'image' | 'audio' | 'system';
  timestamp: string;
  isRead: boolean;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  reactions?: ChatReaction[];
  edited?: boolean;
  editedAt?: string;
}

export interface ChatReaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  type: 'bob' | 'group' | 'direct';
  name: string;
  description?: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  // Spécifique aux Bobs
  bobId?: string;
  bobType?: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  bobTitle?: string;
  bobStatus?: 'en_attente' | 'actif' | 'termine' | 'annule';
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
  lastSeen?: string;
  isOnline: boolean;
  isTyping: boolean;
}

export interface TypingIndicator {
  chatId: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatNotification {
  id: string;
  chatId: string;
  messageId: string;
  type: 'new_message' | 'mention' | 'reaction' | 'join' | 'leave';
  title: string;
  body: string;
  timestamp: string;
  isRead: boolean;
}

export interface EmojiCategory {
  name: string;
  emojis: string[];
}

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    name: 'Récents',
    emojis: ['😀', '😍', '🤔', '👍', '❤️', '😂', '🎉', '🤖']
  },
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕']
  },
  {
    name: 'Gestes',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤝', '🙏', '✍️', '💅', '🤳']
  },
  {
    name: 'Objets',
    emojis: ['💬', '💭', '💤', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '🗨️', '🗯️', '💭', '💤']
  },
  {
    name: 'Bob',
    emojis: ['🤖', '🏠', '🔧', '📚', '🚗', '⚽', '📱', '🍕', '👕', '💡', '🔑', '💰', '🎁', '📦', '🛠️', '🌱']
  }
];