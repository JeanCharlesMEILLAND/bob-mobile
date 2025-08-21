// src/services/notifications.service.ts
import { apiClient } from './api';

export interface NotificationData {
  type: 'borrow_request' | 'request_accepted' | 'request_declined' | 'exchange_reminder' | 'exchange_complete';
  recipientId: string;
  senderId: string;
  exchangeId?: string;
  title: string;
  message: string;
  data?: any;
}

export interface SMSNotification {
  telephone: string;
  message: string;
  type: 'sms' | 'whatsapp';
}

export const notificationsService = {
  // Envoyer notification push
  sendPushNotification: async (notification: NotificationData, token: string): Promise<void> => {
    console.log('📱 Envoi push notification:', notification.type);
    
    try {
      const response = await apiClient.post('/notifications/push', {
        data: {
          recipient: notification.recipientId,
          sender: notification.senderId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          exchangeId: notification.exchangeId,
          metadata: notification.data,
          dateEnvoi: new Date().toISOString()
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur envoi push notification');
      }
      
      console.log('✅ Push notification envoyée');
    } catch (error) {
      console.error('❌ Erreur push notification:', error);
      throw error;
    }
  },

  // Envoyer SMS
  sendSMSNotification: async (sms: SMSNotification, token: string): Promise<void> => {
    console.log('📟 Envoi SMS:', sms.type);
    
    try {
      const response = await apiClient.post('/notifications/sms', {
        data: {
          telephone: sms.telephone,
          message: sms.message,
          type: sms.type,
          dateEnvoi: new Date().toISOString()
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur envoi SMS');
      }
      
      console.log('✅ SMS envoyé');
    } catch (error) {
      console.error('❌ Erreur envoi SMS:', error);
      throw error;
    }
  },

  // Notification pour nouvelle demande d'emprunt
  notifyBorrowRequest: async (params: {
    recipientIds: string[];
    requestId: string;
    requestTitle: string;
    requesterName: string;
    duration: string;
  }, token: string): Promise<void> => {
    console.log('📤 Notification demande emprunt à', params.recipientIds.length, 'contacts');

    const promises = params.recipientIds.map(async (recipientId) => {
      try {
        // Récupérer les infos du contact
        const contactResponse = await apiClient.get(`/users/${recipientId}`, token);
        if (!contactResponse.ok) return;
        
        const contact = await contactResponse.json();

        // Push notification
        const pushNotification: NotificationData = {
          type: 'borrow_request',
          recipientId,
          senderId: params.requesterName,
          exchangeId: params.requestId,
          title: '📥 Nouvelle demande d\'emprunt',
          message: `${params.requesterName} cherche "${params.requestTitle}" pour ${params.duration}`,
          data: { requestId: params.requestId }
        };

        await notificationsService.sendPushNotification(pushNotification, token);

        // SMS si pas sur Bob ou si notification push échoue
        if (contact.telephone) {
          const smsMessage = `📱 Bob: ${params.requesterName} cherche "${params.requestTitle}" (${params.duration}). Consultez l'app pour répondre: ${process.env.EXPO_PUBLIC_APP_URL || 'https://bob.app'}/request/${params.requestId}`;
          
          const sms: SMSNotification = {
            telephone: contact.telephone,
            message: smsMessage,
            type: 'sms'
          };

          await notificationsService.sendSMSNotification(sms, token);
        }
      } catch (error) {
        console.error(`❌ Erreur notification pour ${recipientId}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('✅ Notifications demande emprunt envoyées');
  },

  // Notification acceptation de demande
  notifyRequestAccepted: async (params: {
    requesterId: string;
    accepterName: string;
    requestTitle: string;
    requestId: string;
  }, token: string): Promise<void> => {
    console.log('✅ Notification acceptation demande');

    try {
      const pushNotification: NotificationData = {
        type: 'request_accepted',
        recipientId: params.requesterId,
        senderId: params.accepterName,
        exchangeId: params.requestId,
        title: '🎉 Demande acceptée !',
        message: `${params.accepterName} peut vous prêter "${params.requestTitle}"`,
        data: { requestId: params.requestId }
      };

      await notificationsService.sendPushNotification(pushNotification, token);
    } catch (error) {
      console.error('❌ Erreur notification acceptation:', error);
      throw error;
    }
  },

  // Notification refus de demande
  notifyRequestDeclined: async (params: {
    requesterId: string;
    declinerName: string;
    requestTitle: string;
    requestId: string;
  }, token: string): Promise<void> => {
    console.log('❌ Notification refus demande');

    try {
      const pushNotification: NotificationData = {
        type: 'request_declined',
        recipientId: params.requesterId,
        senderId: params.declinerName,
        exchangeId: params.requestId,
        title: 'Demande non disponible',
        message: `${params.declinerName} ne peut pas prêter "${params.requestTitle}"`,
        data: { requestId: params.requestId }
      };

      await notificationsService.sendPushNotification(pushNotification, token);
    } catch (error) {
      console.error('❌ Erreur notification refus:', error);
      throw error;
    }
  },

  // Rappel pour échange en cours
  notifyExchangeReminder: async (params: {
    recipientId: string;
    exchangeTitle: string;
    exchangeId: string;
    daysRemaining: number;
    isOwner: boolean;
  }, token: string): Promise<void> => {
    console.log('🔔 Rappel échange');

    const reminderType = params.isOwner ? 'récupération' : 'retour';
    const message = params.daysRemaining > 0 
      ? `Plus que ${params.daysRemaining} jour${params.daysRemaining > 1 ? 's' : ''} pour le ${reminderType} de "${params.exchangeTitle}"`
      : `Le délai de ${reminderType} pour "${params.exchangeTitle}" est dépassé`;

    try {
      const pushNotification: NotificationData = {
        type: 'exchange_reminder',
        recipientId: params.recipientId,
        senderId: 'system',
        exchangeId: params.exchangeId,
        title: '⏰ Rappel échange',
        message,
        data: { exchangeId: params.exchangeId }
      };

      await notificationsService.sendPushNotification(pushNotification, token);
    } catch (error) {
      console.error('❌ Erreur rappel échange:', error);
    }
  },

  // Notification échange terminé
  notifyExchangeComplete: async (params: {
    recipientIds: string[];
    exchangeTitle: string;
    exchangeId: string;
    bobizEarned: number;
  }, token: string): Promise<void> => {
    console.log('🎉 Notification échange terminé');

    const promises = params.recipientIds.map(async (recipientId) => {
      try {
        const pushNotification: NotificationData = {
          type: 'exchange_complete',
          recipientId,
          senderId: 'system',
          exchangeId: params.exchangeId,
          title: '🎉 Échange terminé !',
          message: `Vous avez gagné +${params.bobizEarned} Bobiz pour "${params.exchangeTitle}"`,
          data: { exchangeId: params.exchangeId, bobizEarned: params.bobizEarned }
        };

        await notificationsService.sendPushNotification(pushNotification, token);
      } catch (error) {
        console.error(`❌ Erreur notification terminé pour ${recipientId}:`, error);
      }
    });

    await Promise.allSettled(promises);
  },

  // Générer message SMS personnalisé selon le groupe
  generateSMSMessage: (requesterName: string, requestTitle: string, duration: string, groupType?: string): string => {
    const baseUrl = process.env.EXPO_PUBLIC_APP_URL || 'https://bob.app';
    
    const templates = {
      famille: `👨‍👩‍👧 Bob: ${requesterName} cherche "${requestTitle}" (${duration}). La famille s'entraide ! Répondez sur Bob: ${baseUrl}`,
      amis: `😄 Bob: Ton pote ${requesterName} cherche "${requestTitle}" (${duration}). Tu peux l'aider ? ${baseUrl}`,
      voisins: `🏠 Bob: Votre voisin ${requesterName} cherche "${requestTitle}" (${duration}). Voisins solidaires ! ${baseUrl}`,
      bricoleurs: `🔧 Bob: ${requesterName} cherche "${requestTitle}" (${duration}). Entre bricoleurs, on se serre les coudes ! ${baseUrl}`,
      default: `📱 Bob: ${requesterName} cherche "${requestTitle}" (${duration}). Consultez l'app pour répondre: ${baseUrl}`
    };

    return templates[groupType as keyof typeof templates] || templates.default;
  },

  // Tester les notifications
  testNotifications: async (token: string): Promise<void> => {
    console.log('🧪 Test notifications');

    try {
      const testNotification: NotificationData = {
        type: 'borrow_request',
        recipientId: 'test',
        senderId: 'test',
        title: '🧪 Test notification',
        message: 'Ceci est un test de notification push',
      };

      await notificationsService.sendPushNotification(testNotification, token);
      console.log('✅ Test notification réussi');
    } catch (error) {
      console.error('❌ Test notification échoué:', error);
    }
  }
};