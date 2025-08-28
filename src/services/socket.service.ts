// src/services/socket.service.ts - Service Socket.io temps réel
import { io, Socket } from 'socket.io-client';
import { authService } from './auth.service';

export interface SocketMessage {
  id: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'system' | 'status_update' | 'location';
  sender: {
    id: number;
    username: string;
    nom?: string;
    prenom?: string;
  };
  timestamp: string;
  readBy: { [userId: string]: string };
  replyTo?: any;
}

export interface TypingUser {
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: number;
  isOnline: boolean;
  timestamp: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private messageListeners: Map<string, Function[]> = new Map();
  private statusListeners: Function[] = [];
  private typingListeners: Map<string, Function[]> = new Map();
  private connectionListeners: Function[] = [];

  constructor() {
    this.connect();
  }

  /**
   * Connexion au serveur Socket.io
   */
  async connect(): Promise<boolean> {
    if (this.socket?.connected || this.isConnecting) {
      return true;
    }

    this.isConnecting = true;

    try {
      const token = await authService.getValidToken();
      if (!token) {
        console.log('❌ Pas de token pour Socket.io');
        this.isConnecting = false;
        return false;
      }

      // URL du serveur Socket.io avec variables d'environnement
      const { SOCKET_URL } = await import('./api');
      const socketUrl = SOCKET_URL;

      console.log('🔄 Connexion Socket.io à:', socketUrl);

      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000
      });

      // Événements de connexion
      this.socket.on('connect', () => {
        console.log('✅ Socket.io connecté !');
        this.isConnecting = false;
        this.notifyConnectionListeners(true);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Socket.io déconnecté:', reason);
        this.notifyConnectionListeners(false);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Erreur connexion Socket.io:', error);
        this.isConnecting = false;
        this.notifyConnectionListeners(false);
      });

      // Événements chat
      this.socket.on('new_message', (message: SocketMessage) => {
        this.notifyMessageListeners(message.conversationId, message);
      });

      this.socket.on('message_sent', (data) => {
        console.log('✅ Message envoyé confirmé:', data.messageId);
      });

      this.socket.on('messages_read', (data) => {
        console.log('👀 Messages lus par:', data.userName);
      });

      this.socket.on('user_typing', (data: TypingUser) => {
        this.notifyTypingListeners(data.conversationId, data);
      });

      this.socket.on('user_status_changed', (status: UserStatus) => {
        this.notifyStatusListeners(status);
      });

      this.socket.on('error', (error) => {
        console.error('❌ Erreur Socket.io:', error);
      });

      return true;

    } catch (error) {
      console.error('❌ Erreur init Socket.io:', error);
      this.isConnecting = false;
      return false;
    }
  }

  /**
   * Déconnexion du serveur
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
  }

  /**
   * Vérifier le statut de connexion
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Rejoindre une conversation
   */
  joinConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join_conversation', conversationId);
      console.log(`👥 Rejoindre conversation: ${conversationId}`);
    }
  }

  /**
   * Quitter une conversation
   */
  leaveConversation(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave_conversation', conversationId);
      console.log(`👋 Quitter conversation: ${conversationId}`);
    }
  }

  /**
   * Envoyer un message
   */
  sendMessage(conversationId: string, content: string, type: string = 'text', replyToId?: string) {
    if (this.socket?.connected) {
      this.socket.emit('send_message', {
        conversationId,
        content,
        type,
        replyToId
      });
      console.log(`📤 Message envoyé vers conversation: ${conversationId}`);
    } else {
      console.log('❌ Socket non connecté, impossible d\'envoyer le message');
    }
  }

  /**
   * Marquer des messages comme lus
   */
  markAsRead(conversationId: string, messageIds: string[]) {
    if (this.socket?.connected) {
      this.socket.emit('mark_as_read', {
        conversationId,
        messageIds
      });
    }
  }

  /**
   * Indicateur de saisie - Début
   */
  startTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', { conversationId });
    }
  }

  /**
   * Indicateur de saisie - Fin
   */
  stopTyping(conversationId: string) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', { conversationId });
    }
  }

  // === LISTENERS ===

  /**
   * Écouter les nouveaux messages d'une conversation
   */
  onNewMessage(conversationId: string, callback: (message: SocketMessage) => void) {
    if (!this.messageListeners.has(conversationId)) {
      this.messageListeners.set(conversationId, []);
    }
    this.messageListeners.get(conversationId)!.push(callback);
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
  }

  /**
   * Écouter les changements de statut utilisateur
   */
  onUserStatusChange(callback: (status: UserStatus) => void) {
    this.statusListeners.push(callback);
  }

  /**
   * Arrêter d'écouter les changements de statut
   */
  offUserStatusChange(callback: Function) {
    const index = this.statusListeners.indexOf(callback);
    if (index > -1) {
      this.statusListeners.splice(index, 1);
    }
  }

  /**
   * Écouter les indicateurs de saisie
   */
  onTyping(conversationId: string, callback: (typing: TypingUser) => void) {
    if (!this.typingListeners.has(conversationId)) {
      this.typingListeners.set(conversationId, []);
    }
    this.typingListeners.get(conversationId)!.push(callback);
  }

  /**
   * Arrêter d'écouter les indicateurs de saisie
   */
  offTyping(conversationId: string, callback?: Function) {
    if (callback) {
      const listeners = this.typingListeners.get(conversationId) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.typingListeners.delete(conversationId);
    }
  }

  /**
   * Écouter les changements de connexion
   */
  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
  }

  /**
   * Arrêter d'écouter les changements de connexion
   */
  offConnectionChange(callback: Function) {
    const index = this.connectionListeners.indexOf(callback);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  // === MÉTHODES PRIVÉES ===

  private notifyMessageListeners(conversationId: string, message: SocketMessage) {
    const listeners = this.messageListeners.get(conversationId) || [];
    listeners.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Erreur callback message:', error);
      }
    });
  }

  private notifyStatusListeners(status: UserStatus) {
    this.statusListeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Erreur callback status:', error);
      }
    });
  }

  private notifyTypingListeners(conversationId: string, typing: TypingUser) {
    const listeners = this.typingListeners.get(conversationId) || [];
    listeners.forEach(callback => {
      try {
        callback(typing);
      } catch (error) {
        console.error('Erreur callback typing:', error);
      }
    });
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Erreur callback connexion:', error);
      }
    });
  }

  /**
   * Reconnecter si nécessaire
   */
  async reconnect() {
    if (!this.isConnected()) {
      console.log('🔄 Tentative de reconnexion Socket.io...');
      await this.connect();
    }
  }
}

// Instance singleton
export const socketService = new SocketService();

// Hook React pour utiliser Socket.io
import { useState, useEffect } from 'react';

export const useSocket = () => {
  const [connected, setConnected] = useState(socketService.isConnected());

  useEffect(() => {
    const handleConnectionChange = (isConnected: boolean) => {
      setConnected(isConnected);
    };

    socketService.onConnectionChange(handleConnectionChange);

    return () => {
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, []);

  return {
    connected,
    socket: socketService,
    reconnect: () => socketService.reconnect()
  };
};