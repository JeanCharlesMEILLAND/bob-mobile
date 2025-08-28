// src/services/realtime-chat.service.ts - Service de chat temps réel avec Socket.io
import { apiClient } from './api';
import { authService } from './auth.service';
import { socketService, SocketMessage } from './socket.service';

export interface RealtimeChatMessage {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'status_update' | 'location';
  sender: {
    id: number;
    username: string;
    nom?: string;
    prenom?: string;
  } | null; // null pour messages système
  timestamp: string;
  readBy: { [userId: string]: string };
  replyTo?: RealtimeChatMessage;
  isTemporary?: boolean; // Pour les messages en cours d'envoi
}

export interface RealtimeConversation {
  id: string;
  titre: string;
  type: 'pret' | 'emprunt' | 'service' | 'evenement' | 'groupe_local';
  participants: {
    id: number;
    username: string;
    nom?: string;
    prenom?: string;
    isOnline: boolean;
  }[];
  lastActivity: string;
  unreadCount: number;
  lastMessage?: RealtimeChatMessage;
}

class RealtimeChatService {
  private conversations: Map<string, RealtimeConversation> = new Map();
  private messages: Map<string, RealtimeChatMessage[]> = new Map();
  private conversationListeners: Function[] = [];
  private messageListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSocketListeners();
  }

  /**
   * Initialiser les listeners Socket.io
   */
  private initializeSocketListeners() {
    // Reconnecter si nécessaire
    socketService.reconnect();
  }

  /**
   * Récupérer les conversations de l'utilisateur
   */
  async getUserConversations(): Promise<RealtimeConversation[]> {
    try {
      const token = await authService.getValidToken();
      const user = await authService.getCurrentUser();
      if (!token || !user) throw new Error('Authentification requise');

      const response = await apiClient.get('/bob-conversations', token);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur récupération conversations');
      }

      const conversations = data.data.map((conv: any) => this.formatConversation(conv, user.id));
      
      // Mettre en cache
      conversations.forEach(conv => {
        this.conversations.set(conv.id, conv);
      });

      return conversations;

    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      return [];
    }
  }

  /**
   * Récupérer les messages d'une conversation
   */
  async getConversationMessages(conversationId: string): Promise<RealtimeChatMessage[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      // Rejoindre la conversation via Socket.io
      socketService.joinConversation(conversationId);

      const response = await apiClient.get(`/bob-messages?filters[bob_conversation][id][$eq]=${conversationId}&populate=*&sort=timestamp:asc`, token);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur récupération messages');
      }

      const messages = data.data.map((msg: any) => this.formatMessage(msg));
      
      // Mettre en cache
      this.messages.set(conversationId, messages);

      return messages;

    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  /**
   * Envoyer un message via Socket.io
   */
  async sendMessage(conversationId: string, content: string, type: string = 'text', replyToId?: string): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer un message temporaire pour l'UI
      const tempMessage: RealtimeChatMessage = {
        id: `temp_${Date.now()}`,
        conversationId,
        content,
        type: type as any,
        sender: {
          id: user.id,
          username: user.username || user.email,
          nom: user.nom,
          prenom: user.prenom
        },
        timestamp: new Date().toISOString(),
        readBy: { [user.id]: new Date().toISOString() },
        isTemporary: true
      };

      // Ajouter le message temporaire à la liste locale
      this.addMessageToConversation(conversationId, tempMessage);

      // Envoyer via Socket.io
      socketService.sendMessage(conversationId, content, type, replyToId);

      return true;

    } catch (error) {
      console.error('Erreur envoi message:', error);
      return false;
    }
  }

  /**
   * Marquer des messages comme lus
   */
  async markAsRead(conversationId: string, messageIds: string[]) {
    socketService.markAsRead(conversationId, messageIds);
    
    // Mettre à jour localement
    const messages = this.messages.get(conversationId) || [];
    const userId = (await authService.getCurrentUser())?.id.toString();
    
    if (userId) {
      messages.forEach(message => {
        if (messageIds.includes(message.id)) {
          message.readBy[userId] = new Date().toISOString();
        }
      });

      this.notifyMessageListeners(conversationId, messages);
    }
  }

  /**
   * Démarrer l'indicateur de saisie
   */
  startTyping(conversationId: string) {
    socketService.startTyping(conversationId);
  }

  /**
   * Arrêter l'indicateur de saisie
   */
  stopTyping(conversationId: string) {
    socketService.stopTyping(conversationId);
  }

  /**
   * Créer une conversation pour un échange
   */
  async createExchangeConversation(exchangeId: string, exchangeTitle: string, exchangeType: 'pret' | 'emprunt' | 'service_offert' | 'service_demande', participantIds: number[]): Promise<string | null> {
    try {
      const token = await authService.getValidToken();
      const user = await authService.getCurrentUser();
      if (!token || !user) throw new Error('Authentification requise');

      const conversationType = exchangeType === 'pret' ? 'pret' : 
                              exchangeType === 'emprunt' ? 'emprunt' : 'service';

      const payload = {
        data: {
          titre: `💬 ${exchangeTitle}`,
          type: conversationType,
          statut: 'active',
          organisateur: user.id,
          participants: participantIds,
          metadata: {
            exchangeId,
            exchangeType,
            createdAt: new Date().toISOString()
          },
          lastActivity: new Date().toISOString(),
          participantsCount: participantIds.length
        }
      };

      const response = await apiClient.post('/bob-conversations', payload, token);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur création conversation');
      }

      const conversationId = data.data.id;

      // Envoyer un message système de bienvenue
      await this.sendSystemMessage(conversationId, 'nouveau_participant', `Conversation créée pour "${exchangeTitle}"`);

      return conversationId;

    } catch (error) {
      console.error('Erreur création conversation échange:', error);
      return null;
    }
  }

  /**
   * Créer une conversation pour un événement
   */
  async createEventConversation(eventId: string, eventTitle: string, organizerId: number, participantIds: number[]): Promise<string | null> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const payload = {
        data: {
          titre: `🎉 ${eventTitle}`,
          type: 'evenement',
          statut: 'active',
          organisateur: organizerId,
          participants: participantIds,
          evenement: eventId,
          metadata: {
            eventId,
            createdAt: new Date().toISOString()
          },
          lastActivity: new Date().toISOString(),
          participantsCount: participantIds.length
        }
      };

      const response = await apiClient.post('/bob-conversations', payload, token);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erreur création conversation événement');
      }

      const conversationId = data.data.id;

      // Envoyer un message système de bienvenue
      await this.sendSystemMessage(conversationId, 'evenement_cree', `Événement "${eventTitle}" créé ! Discutons de l'organisation 🎯`);

      return conversationId;

    } catch (error) {
      console.error('Erreur création conversation événement:', error);
      return null;
    }
  }

  /**
   * Envoyer un message système
   */
  async sendSystemMessage(conversationId: string, systemType: string, content: string) {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const payload = {
        data: {
          content,
          type: 'system',
          systemType,
          bob_conversation: conversationId,
          sender: null,
          timestamp: new Date().toISOString(),
          readBy: {},
          isDelivered: true
        }
      };

      await apiClient.post('/bob-messages', payload, token);

    } catch (error) {
      console.error('Erreur envoi message système:', error);
    }
  }

  // === LISTENERS ET ÉVÉNEMENTS ===

  /**
   * Écouter les nouveaux messages d'une conversation
   */
  onNewMessage(conversationId: string, callback: (messages: RealtimeChatMessage[]) => void) {
    if (!this.messageListeners.has(conversationId)) {
      this.messageListeners.set(conversationId, []);
    }
    this.messageListeners.get(conversationId)!.push(callback);

    // Écouter via Socket.io
    socketService.onNewMessage(conversationId, (socketMessage: SocketMessage) => {
      const message = this.formatSocketMessage(socketMessage);
      this.addMessageToConversation(conversationId, message);
    });
  }

  /**
   * Arrêter d'écouter les messages d'une conversation
   */
  offNewMessage(conversationId: string, callback?: Function) {
    if (callback) {
      const listeners = this.messageListeners.get(conversationId) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.messageListeners.delete(conversationId);
    }

    // Arrêter d'écouter via Socket.io
    socketService.offNewMessage(conversationId);
    socketService.leaveConversation(conversationId);
  }

  // === MÉTHODES PRIVÉES ===

  private formatConversation(convData: any, currentUserId: number): RealtimeConversation {
    const attributes = convData.attributes || convData;
    
    return {
      id: convData.id || convData.documentId,
      titre: attributes.titre,
      type: attributes.type,
      participants: (attributes.participants?.data || attributes.participants || []).map((p: any) => ({
        id: p.id,
        username: p.attributes?.username || p.username,
        nom: p.attributes?.nom || p.nom,
        prenom: p.attributes?.prenom || p.prenom,
        isOnline: p.attributes?.estEnLigne || p.estEnLigne || false
      })),
      lastActivity: attributes.lastActivity || attributes.updatedAt,
      unreadCount: attributes.unreadCounts?.[currentUserId] || 0,
      lastMessage: undefined // À charger séparément si besoin
    };
  }

  private formatMessage(msgData: any): RealtimeChatMessage {
    const attributes = msgData.attributes || msgData;
    
    return {
      id: msgData.id || msgData.documentId,
      conversationId: attributes.bob_conversation?.id || attributes.conversationId,
      content: attributes.content,
      type: attributes.type,
      sender: attributes.sender ? {
        id: attributes.sender.id,
        username: attributes.sender.username,
        nom: attributes.sender.nom,
        prenom: attributes.sender.prenom
      } : null,
      timestamp: attributes.timestamp,
      readBy: attributes.readBy || {}
    };
  }

  private formatSocketMessage(socketMsg: SocketMessage): RealtimeChatMessage {
    return {
      id: socketMsg.id,
      conversationId: socketMsg.conversationId,
      content: socketMsg.content,
      type: socketMsg.type,
      sender: socketMsg.sender,
      timestamp: socketMsg.timestamp,
      readBy: socketMsg.readBy || {}
    };
  }

  private addMessageToConversation(conversationId: string, message: RealtimeChatMessage) {
    const messages = this.messages.get(conversationId) || [];
    
    // Retirer le message temporaire s'il existe
    const filteredMessages = messages.filter(m => !m.isTemporary || m.id !== message.id);
    
    // Ajouter le nouveau message
    filteredMessages.push(message);
    
    // Trier par timestamp
    filteredMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    this.messages.set(conversationId, filteredMessages);
    this.notifyMessageListeners(conversationId, filteredMessages);
  }

  private notifyMessageListeners(conversationId: string, messages: RealtimeChatMessage[]) {
    const listeners = this.messageListeners.get(conversationId) || [];
    listeners.forEach(callback => {
      try {
        callback(messages);
      } catch (error) {
        console.error('Erreur callback message listener:', error);
      }
    });
  }
}

export const realtimeChatService = new RealtimeChatService();