// src/services/bob-messaging.service.ts - Service de messagerie contextuelle Bob
import { apiClient } from './api';
import { authService } from './auth.service';
import { socketService, SocketMessage } from './socket.service';
import { 
  BobConversation, 
  BobMessage, 
  BobConversationType,
  BobConversationResponse,
  BobMessagesResponse,
  ConversationListItem,
  PretContext,
  ServiceContext,
  EvenementContext
} from '../types/bob-chat.types';

class BobMessagingService {
  private conversations: Map<string, BobConversation> = new Map();
  private messages: Map<string, BobMessage[]> = new Map();
  
  // === CONVERSATIONS ===
  
  /**
   * Récupérer toutes les conversations d'un utilisateur
   */
  async getUserConversations(userId: string): Promise<ConversationListItem[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.get('/bob-conversations', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'filters[participants][id][$eq]': userId,
          'populate': ['participants', 'organisateur', 'messages'],
          'sort': 'lastActivity:desc'
        }
      });

      const conversations: BobConversation[] = response.data.data.map(this.formatConversation);
      
      return conversations.map(conv => ({
        conversation: conv,
        unreadCount: conv.unreadCounts[userId] || 0,
        lastMessagePreview: conv.lastMessage?.content || 'Aucun message',
        isOnline: conv.participants.some(p => p.isOnline && p.id !== userId)
      }));
      
    } catch (error) {
      console.error('Erreur récupération conversations:', error);
      return [];
    }
  }

  /**
   * Récupérer les conversations par catégorie
   */
  async getConversationsByType(userId: string, type: BobConversationType): Promise<ConversationListItem[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.get('/bob-conversations', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'filters[participants][id][$eq]': userId,
          'filters[type][$eq]': type,
          'populate': ['participants', 'organisateur', 'messages'],
          'sort': 'lastActivity:desc'
        }
      });

      const conversations: BobConversation[] = response.data.data.map(this.formatConversation);
      
      return conversations.map(conv => ({
        conversation: conv,
        unreadCount: conv.unreadCounts[userId] || 0,
        lastMessagePreview: conv.lastMessage?.content || 'Aucun message',
        isOnline: conv.participants.some(p => p.isOnline && p.id !== userId)
      }));
      
    } catch (error) {
      console.error(`Erreur récupération conversations ${type}:`, error);
      return [];
    }
  }

  /**
   * Récupérer une conversation spécifique
   */
  async getConversation(conversationId: string): Promise<BobConversation | null> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.get(`/bob-conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'populate': ['participants', 'organisateur', 'pret', 'service', 'evenement']
        }
      });

      return this.formatConversation(response.data.data);
      
    } catch (error) {
      console.error('Erreur récupération conversation:', error);
      return null;
    }
  }

  /**
   * Créer une conversation Bob
   */
  async createConversation(data: {
    type: BobConversationType;
    titre: string;
    participantIds: string[];
    organisateurId: string;
    pretId?: string;
    serviceId?: string;
    evenementId?: string;
    localisation?: string;
    metadata?: any;
  }): Promise<BobConversation | null> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const payload = {
        data: {
          titre: data.titre,
          type: data.type,
          statut: 'active',
          participants: data.participantIds,
          organisateur: data.organisateurId,
          localisation: data.localisation,
          metadata: data.metadata || {},
          messagesCount: 0,
          participantsCount: data.participantIds.length,
          lastActivity: new Date().toISOString(),
          unreadCounts: {},
          ...(data.pretId && { pret: data.pretId }),
          ...(data.serviceId && { service: data.serviceId }),
          ...(data.evenementId && { evenement: data.evenementId })
        }
      };

      const response = await apiClient.post('/bob-conversations', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return this.formatConversation(response.data.data);
      
    } catch (error) {
      console.error('Erreur création conversation:', error);
      return null;
    }
  }

  // === MESSAGES ===

  /**
   * Récupérer les messages d'une conversation
   */
  async getMessages(conversationId: string, page: number = 1, pageSize: number = 50): Promise<BobMessage[]> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const response = await apiClient.get('/bob-messages', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'filters[conversation][id][$eq]': conversationId,
          'populate': ['sender'],
          'sort': 'timestamp:desc',
          'pagination[page]': page,
          'pagination[pageSize]': pageSize
        }
      });

      return response.data.data.map(this.formatMessage).reverse(); // Plus anciens en premier
      
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      return [];
    }
  }

  /**
   * Envoyer un message
   */
  async sendMessage(data: {
    conversationId: string;
    content: string;
    type?: 'text' | 'image' | 'location';
    replyToId?: string;
    metadata?: any;
  }): Promise<BobMessage | null> {
    try {
      const token = await authService.getValidToken();
      const user = await authService.getCurrentUser();
      if (!token || !user) throw new Error('Authentification requise');

      const payload = {
        data: {
          content: data.content,
          type: data.type || 'text',
          conversation: data.conversationId,
          sender: user.id,
          timestamp: new Date().toISOString(),
          metadata: data.metadata || {},
          readBy: [user.id], // Le sender a déjà "lu" son message
          isDelivered: true,
          ...(data.replyToId && { replyTo: data.replyToId })
        }
      };

      const response = await apiClient.post('/bob-messages', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const message = this.formatMessage(response.data.data);
      
      // Mettre à jour l'activité de la conversation
      await this.updateConversationActivity(data.conversationId);
      
      return message;
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      return null;
    }
  }

  /**
   * Envoyer un message système
   */
  async sendSystemMessage(data: {
    conversationId: string;
    systemType: 'pret_accepte' | 'service_demande' | 'evenement_annule' | 'nouveau_participant';
    content: string;
    metadata?: any;
  }): Promise<BobMessage | null> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      const payload = {
        data: {
          content: data.content,
          type: 'system',
          systemType: data.systemType,
          conversation: data.conversationId,
          sender: null, // Messages système sans sender
          timestamp: new Date().toISOString(),
          metadata: data.metadata || {},
          readBy: [], // Personne n'a encore lu
          isDelivered: true
        }
      };

      const response = await apiClient.post('/bob-messages', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return this.formatMessage(response.data.data);
      
    } catch (error) {
      console.error('Erreur envoi message système:', error);
      return null;
    }
  }

  /**
   * Marquer les messages comme lus
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      // Récupérer les messages non lus
      const response = await apiClient.get('/bob-messages', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          'filters[conversation][id][$eq]': conversationId,
          'filters[readBy][$not][$contains]': userId
        }
      });

      // Marquer chaque message comme lu
      for (const message of response.data.data) {
        const readBy = message.attributes.readBy || [];
        if (!readBy.includes(userId)) {
          readBy.push(userId);
          
          await apiClient.put(`/bob-messages/${message.id}`, {
            data: { readBy }
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }

      // Mettre à jour le compteur non lus de la conversation
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        const unreadCounts = { ...conversation.unreadCounts };
        unreadCounts[userId] = 0;
        
        await apiClient.put(`/bob-conversations/${conversationId}`, {
          data: { unreadCounts }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      return true;
      
    } catch (error) {
      console.error('Erreur marquage messages lus:', error);
      return false;
    }
  }

  // === HELPERS PRIVÉS ===

  private formatConversation(data: any): BobConversation {
    const attrs = data.attributes;
    
    return {
      id: data.id,
      type: attrs.type,
      titre: attrs.titre,
      statut: attrs.statut,
      participants: attrs.participants?.data?.map((p: any) => ({
        id: p.id,
        name: p.attributes.username || p.attributes.nom,
        avatar: p.attributes.avatar?.data?.attributes?.url,
        role: p.id === attrs.organisateur?.data?.id ? 'organisateur' : 'participant',
        isOnline: false, // À implémenter plus tard
        lastSeen: new Date().toISOString(),
        joinedAt: attrs.createdAt
      })) || [],
      organisateurId: attrs.organisateur?.data?.id,
      messagesCount: attrs.messagesCount || 0,
      unreadCounts: attrs.unreadCounts || {},
      localisation: attrs.localisation,
      tags: attrs.tags?.split(',') || [],
      createdAt: attrs.createdAt,
      updatedAt: attrs.updatedAt,
      lastActivity: attrs.lastActivity || attrs.updatedAt,
      
      // Contextes
      ...(attrs.pret && {
        pretContext: {
          pretId: attrs.pret.data.id,
          objet: attrs.metadata?.objet || 'Objet',
          duree: attrs.metadata?.duree || '',
          dateEchange: attrs.metadata?.dateEchange || '',
          dateRetour: attrs.metadata?.dateRetour || '',
          lieu: attrs.metadata?.lieu || '',
          statut: attrs.metadata?.statut || 'en_cours'
        }
      }),
      
      ...(attrs.evenement && {
        evenementContext: {
          evenementId: attrs.evenement.data.id,
          titre: attrs.titre,
          date: attrs.metadata?.date || '',
          lieu: attrs.metadata?.lieu || '',
          maxParticipants: attrs.metadata?.maxParticipants || 0,
          participantsCount: attrs.participantsCount || 0,
          statut: attrs.metadata?.statut || 'planifie'
        }
      })
    };
  }

  private formatMessage(data: any): BobMessage {
    const attrs = data.attributes;
    
    return {
      id: data.id,
      content: attrs.content,
      type: attrs.type,
      conversationId: attrs.conversation?.data?.id,
      senderId: attrs.sender?.data?.id,
      senderName: attrs.sender?.data?.attributes?.username || attrs.sender?.data?.attributes?.nom || 'Système',
      timestamp: attrs.timestamp,
      systemType: attrs.systemType,
      metadata: attrs.metadata || {},
      readBy: attrs.readBy || [],
      isDelivered: attrs.isDelivered || false
    };
  }

  private async updateConversationActivity(conversationId: string): Promise<void> {
    try {
      const token = await authService.getValidToken();
      if (!token) return;

      await apiClient.put(`/bob-conversations/${conversationId}`, {
        data: {
          lastActivity: new Date().toISOString()
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
    } catch (error) {
      console.error('Erreur mise à jour activité conversation:', error);
    }
  }

  // === HELPERS POUR CRÉATION AUTOMATIQUE ===

  /**
   * Créer automatiquement une conversation pour un prêt
   */
  async createPretConversation(pretData: {
    pretId: string;
    objet: string;
    preteurId: string;
    emprunteurId: string;
    duree: string;
    dateRetour: string;
    lieu: string;
  }): Promise<BobConversation | null> {
    return this.createConversation({
      type: 'pret',
      titre: `Prêt ${pretData.objet}`,
      participantIds: [pretData.preteurId, pretData.emprunteurId],
      organisateurId: pretData.preteurId,
      pretId: pretData.pretId,
      metadata: {
        objet: pretData.objet,
        duree: pretData.duree,
        dateRetour: pretData.dateRetour,
        lieu: pretData.lieu,
        statut: 'accepte'
      }
    });
  }

  /**
   * Créer automatiquement une conversation pour un événement
   */
  async createEvenementConversation(evenementData: {
    evenementId: string;
    titre: string;
    organisateurId: string;
    date: string;
    lieu: string;
    maxParticipants: number;
  }): Promise<BobConversation | null> {
    return this.createConversation({
      type: 'evenement',
      titre: evenementData.titre,
      participantIds: [evenementData.organisateurId],
      organisateurId: evenementData.organisateurId,
      evenementId: evenementData.evenementId,
      metadata: {
        date: evenementData.date,
        lieu: evenementData.lieu,
        maxParticipants: evenementData.maxParticipants,
        statut: 'planifie'
      }
    });
  }
}

export const bobMessagingService = new BobMessagingService();