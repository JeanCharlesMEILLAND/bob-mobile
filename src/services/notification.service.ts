// src/services/notification.service.ts - Service de gestion des notifications
import { BobNotification } from '../types/bob.types';

class NotificationService {
  private notifications: BobNotification[] = [];
  private listeners: Array<(notification: BobNotification) => void> = [];

  // =================== MÉTHODES PRINCIPALES ===================

  /**
   * Envoyer une notification à un utilisateur
   */
  async notify(userId: string, notification: Omit<BobNotification, 'id' | 'read'>): Promise<string> {
    try {
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const fullNotification: BobNotification = {
        id: notificationId,
        read: false,
        ...notification
      };

      // Stocker la notification
      this.notifications.push(fullNotification);
      
      // Notifier les listeners
      this.listeners.forEach(listener => listener(fullNotification));
      
      console.log('🔔 Notification envoyée:', {
        id: notificationId,
        type: notification.type,
        to: userId,
        message: notification.message.substring(0, 50) + '...'
      });
      
      return notificationId;
      
    } catch (error) {
      console.error('❌ Erreur envoi notification:', error);
      throw error;
    }
  }

  /**
   * Envoyer une notification à plusieurs utilisateurs
   */
  async notifyMultiple(userIds: string[], notification: Omit<BobNotification, 'id' | 'read'>): Promise<string[]> {
    try {
      const notificationIds: string[] = [];
      
      for (const userId of userIds) {
        const notificationId = await this.notify(userId, notification);
        notificationIds.push(notificationId);
      }
      
      console.log('🔔 Notifications multiples envoyées:', {
        count: userIds.length,
        type: notification.type
      });
      
      return notificationIds;
      
    } catch (error) {
      console.error('❌ Erreur envoi notifications multiples:', error);
      throw error;
    }
  }

  /**
   * Récupérer les notifications d'un utilisateur
   */
  async getUserNotifications(userId: string): Promise<BobNotification[]> {
    try {
      // Pour l'instant, retourner des notifications mock
      // En production, ça viendrait d'une API ou base de données
      return this.getMockNotifications(userId);
    } catch (error) {
      console.error('❌ Erreur récupération notifications:', error);
      return [];
    }
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
      if (notificationIndex >= 0) {
        this.notifications[notificationIndex].read = true;
        console.log('✅ Notification marquée comme lue:', notificationId);
      }
    } catch (error) {
      console.error('❌ Erreur marquage notification:', error);
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      // En production, filtrer par userId
      this.notifications.forEach(notification => {
        notification.read = true;
      });
      
      console.log('✅ Toutes les notifications marquées comme lues pour:', userId);
    } catch (error) {
      console.error('❌ Erreur marquage toutes notifications:', error);
    }
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
      console.log('🗑️ Notification supprimée:', notificationId);
    } catch (error) {
      console.error('❌ Erreur suppression notification:', error);
    }
  }

  // =================== LISTENERS ===================

  /**
   * S'abonner aux nouvelles notifications
   */
  onNotification(callback: (notification: BobNotification) => void): () => void {
    this.listeners.push(callback);
    
    // Retourner fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // =================== UTILITAIRES ===================

  /**
   * Compter les notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('❌ Erreur comptage non lues:', error);
      return 0;
    }
  }

  /**
   * Nettoyer les anciennes notifications
   */
  async cleanOldNotifications(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const initialCount = this.notifications.length;
      this.notifications = this.notifications.filter(
        n => n.createdAt > cutoffDate
      );
      
      const deletedCount = initialCount - this.notifications.length;
      console.log(`🧹 Notifications nettoyées: ${deletedCount} supprimées`);
      
      return deletedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
      return 0;
    }
  }

  // =================== DONNÉES MOCK ===================

  private getMockNotifications(userId: string): BobNotification[] {
    return [
      {
        id: 'notif_001',
        type: 'bob_request',
        message: 'Pierre Martin souhaite emprunter votre perceuse',
        from: { id: 'user_pierre', username: 'Pierre Martin', email: 'pierre@example.com', createdAt: new Date() },
        bobId: 'bob_001',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        read: false
      },
      {
        id: 'notif_002',
        type: 'event_joined',
        message: 'Marie Dupont a rejoint votre événement "Week-end à Cracovie"',
        from: { id: 'user_marie', username: 'Marie Dupont', email: 'marie@example.com', createdAt: new Date() },
        eventId: 'event_cracovie',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Il y a 1h
        read: false
      },
      {
        id: 'notif_003',
        type: 'bob_completed',
        message: 'Thomas vous a rendu la tondeuse. +15 Bobiz points !',
        from: { id: 'user_thomas', username: 'Thomas', email: 'thomas@example.com', createdAt: new Date() },
        bobId: 'bob_002',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // Il y a 30min
        read: true
      }
    ];
  }

  // =================== PUSH NOTIFICATIONS (STUB) ===================

  /**
   * Configurer les push notifications
   * (Stub pour l'intégration future avec Firebase/APNS)
   */
  async setupPushNotifications(): Promise<void> {
    console.log('📱 Configuration push notifications (stub)');
    // TODO: Intégrer Firebase Cloud Messaging ou équivalent
  }

  /**
   * Envoyer push notification
   * (Stub pour l'intégration future)
   */
  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    console.log('📱 Push notification (stub):', { userId, title, body });
    // TODO: Intégrer l'envoi réel de push notifications
  }
}

export const notificationService = new NotificationService();