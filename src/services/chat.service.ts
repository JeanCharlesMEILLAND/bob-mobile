// src/services/chat.service.ts - Service de messagerie temps réel
import { ChatMessage, ChatRoom, ChatParticipant, TypingIndicator } from '../types/chat.types';

class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();
  private rooms: Map<string, ChatRoom> = new Map();
  private listeners: Map<string, Function[]> = new Map();
  private typingUsers: Map<string, TypingIndicator[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Créer une conversation exemple pour un Bob de prêt
    const mockRoom: ChatRoom = {
      id: 'bob_chat_001',
      type: 'bob',
      name: 'Bob de prêt - Perceuse Bosch',
      participants: [
        {
          id: 'user_1',
          name: 'Marie Dupont',
          role: 'owner',
          joinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
          isTyping: false
        },
        {
          id: 'user_2', 
          name: 'Thomas Martin',
          role: 'member',
          joinedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isOnline: true,
          isTyping: false
        }
      ],
      unreadCount: 2,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      bobId: 'bob_001',
      bobType: 'pret',
      bobTitle: 'Perceuse sans fil Bosch',
      bobStatus: 'actif'
    };

    const mockMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        chatId: 'bob_chat_001',
        senderId: 'system',
        senderName: 'Système',
        content: '🤖 Bob créé ! Marie propose de prêter sa perceuse à Thomas.',
        type: 'system',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: true
      },
      {
        id: 'msg_2',
        chatId: 'bob_chat_001',
        senderId: 'user_1',
        senderName: 'Marie Dupont',
        content: 'Salut Thomas ! 👋 Ma perceuse est prête, elle a 2 batteries chargées et un coffret de mèches.',
        type: 'text',
        timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
        isRead: true
      },
      {
        id: 'msg_3',
        chatId: 'bob_chat_001',
        senderId: 'user_2',
        senderName: 'Thomas Martin',
        content: 'Super ! Merci beaucoup Marie 😊 À quelle heure je peux passer la récupérer ?',
        type: 'text',
        timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
        isRead: true
      },
      {
        id: 'msg_4',
        chatId: 'bob_chat_001',
        senderId: 'user_1',
        senderName: 'Marie Dupont',
        content: 'Tu peux venir à partir de 18h, je serai à la maison. Tu as mon adresse ?',
        type: 'text',
        timestamp: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
        isRead: true
      },
      {
        id: 'msg_5',
        chatId: 'bob_chat_001',
        senderId: 'user_2',
        senderName: 'Thomas Martin',
        content: 'Oui j\'ai ton adresse ! Je serai là vers 18h30. Au fait, tu veux que je ramène quelque chose ? 🍺',
        type: 'text',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isRead: true
      },
      {
        id: 'msg_6',
        chatId: 'bob_chat_001',
        senderId: 'user_1',
        senderName: 'Marie Dupont',
        content: 'Haha c\'est gentil mais pas besoin ! 😄 On se voit à 18h30 alors !',
        type: 'text',
        timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
        isRead: true,
        reactions: [
          {
            emoji: '👍',
            userId: 'user_2',
            userName: 'Thomas Martin',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'msg_7',
        chatId: 'bob_chat_001',
        senderId: 'user_2',
        senderName: 'Thomas Martin',
        content: 'Parfait ! Merci encore 🙏',
        type: 'text',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: 'msg_8',
        chatId: 'bob_chat_001',
        senderId: 'user_2',
        senderName: 'Thomas Martin',
        content: 'J\'arrive dans 10 minutes ! 🚗',
        type: 'text',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        isRead: false
      }
    ];

    this.rooms.set('bob_chat_001', mockRoom);
    this.messages.set('bob_chat_001', mockMessages);
  }

  // Récupérer les conversations
  async getChatRooms(userId: string): Promise<ChatRoom[]> {
    return Array.from(this.rooms.values()).filter(room =>
      room.participants.some(p => p.id === userId)
    );
  }

  // Récupérer les messages d'une conversation
  async getMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<ChatMessage[]> {
    const messages = this.messages.get(chatId) || [];
    return messages
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(offset, offset + limit);
  }

  // Envoyer un message
  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: 'text' | 'emoji' = 'text',
    replyTo?: { messageId: string; content: string; senderName: string }
  ): Promise<ChatMessage> {
    const room = this.rooms.get(chatId);
    if (!room) throw new Error('Chat room not found');

    const sender = room.participants.find(p => p.id === senderId);
    if (!sender) throw new Error('User not in chat room');

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId,
      senderName: sender.name,
      senderAvatar: sender.avatar,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: false,
      replyTo
    };

    // Ajouter le message
    const messages = this.messages.get(chatId) || [];
    messages.push(message);
    this.messages.set(chatId, messages);

    // Mettre à jour la room
    room.lastMessage = message;
    room.updatedAt = new Date().toISOString();
    
    // Incrémenter unreadCount pour les autres participants
    room.participants.forEach(participant => {
      if (participant.id !== senderId) {
        room.unreadCount++;
      }
    });

    // Notifier les listeners
    this.notifyListeners(`messages_${chatId}`, message);
    this.notifyListeners('rooms_update', room);

    return message;
  }

  // Réagir à un message
  async addReaction(messageId: string, chatId: string, userId: string, emoji: string): Promise<void> {
    const messages = this.messages.get(chatId) || [];
    const message = messages.find(m => m.id === messageId);
    
    if (message) {
      const room = this.rooms.get(chatId);
      const user = room?.participants.find(p => p.id === userId);
      
      if (user) {
        if (!message.reactions) message.reactions = [];
        
        // Retirer la réaction existante de ce user pour ce emoji
        message.reactions = message.reactions.filter(r => 
          !(r.userId === userId && r.emoji === emoji)
        );
        
        // Ajouter la nouvelle réaction
        message.reactions.push({
          emoji,
          userId,
          userName: user.name,
          timestamp: new Date().toISOString()
        });

        this.notifyListeners(`messages_${chatId}`, message);
      }
    }
  }

  // Marquer les messages comme lus
  async markAsRead(chatId: string, userId: string, messageIds: string[]): Promise<void> {
    const messages = this.messages.get(chatId) || [];
    const room = this.rooms.get(chatId);
    
    messages.forEach(message => {
      if (messageIds.includes(message.id) && message.senderId !== userId) {
        message.isRead = true;
      }
    });

    // Reset unread count
    if (room) {
      room.unreadCount = 0;
      this.notifyListeners('rooms_update', room);
    }
  }

  // Indicateur de frappe
  async setTyping(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    const room = this.rooms.get(chatId);
    if (!room) return;

    const participant = room.participants.find(p => p.id === userId);
    if (participant) {
      participant.isTyping = isTyping;
    }

    if (isTyping) {
      const typingIndicators = this.typingUsers.get(chatId) || [];
      const existingIndex = typingIndicators.findIndex(t => t.userId === userId);
      
      const indicator: TypingIndicator = {
        chatId,
        userId,
        userName: participant?.name || 'Utilisateur',
        timestamp: new Date().toISOString()
      };

      if (existingIndex >= 0) {
        typingIndicators[existingIndex] = indicator;
      } else {
        typingIndicators.push(indicator);
      }

      this.typingUsers.set(chatId, typingIndicators);

      // Auto-remove après 3 secondes
      setTimeout(() => {
        this.setTyping(chatId, userId, false);
      }, 3000);
    } else {
      const typingIndicators = this.typingUsers.get(chatId) || [];
      this.typingUsers.set(chatId, typingIndicators.filter(t => t.userId !== userId));
    }

    this.notifyListeners(`typing_${chatId}`, this.typingUsers.get(chatId) || []);
  }

  // Récupérer les utilisateurs en train de taper
  getTypingUsers(chatId: string): TypingIndicator[] {
    return this.typingUsers.get(chatId) || [];
  }

  // Écouter les changements
  subscribe(event: string, callback: Function): () => void {
    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);

    // Retourner une fonction de désabonnement
    return () => {
      const updatedListeners = this.listeners.get(event) || [];
      const index = updatedListeners.indexOf(callback);
      if (index > -1) {
        updatedListeners.splice(index, 1);
        this.listeners.set(event, updatedListeners);
      }
    };
  }

  private notifyListeners(event: string, data: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  // Créer une nouvelle conversation pour un Bob
  async createBobChat(bobId: string, bobTitle: string, bobType: string, participants: { id: string, name: string }[]): Promise<ChatRoom> {
    const chatId = `bob_chat_${bobId}`;
    
    const room: ChatRoom = {
      id: chatId,
      type: 'bob',
      name: `Bob de ${bobType} - ${bobTitle}`,
      participants: participants.map((p, index) => ({
        id: p.id,
        name: p.name,
        role: index === 0 ? 'owner' : 'member',
        joinedAt: new Date().toISOString(),
        isOnline: true,
        isTyping: false
      })),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bobId,
      bobType: bobType as any,
      bobTitle,
      bobStatus: 'en_attente'
    };

    this.rooms.set(chatId, room);
    this.messages.set(chatId, []);

    // Message système de création
    await this.sendMessage(
      chatId,
      'system',
      `🤖 Bob créé ! ${participants[0].name} propose un ${bobType} : ${bobTitle}`,
      'text'
    );

    return room;
  }
}

export const chatService = new ChatService();