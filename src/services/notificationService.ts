// src/services/notificationService.ts - Service push notifications pour BOB
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api.service';

/**
 * Configuration des notifications Expo
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Types de notifications BOB
 */
export enum NotificationType {
  NEW_EXCHANGE = 'new_exchange',
  EXCHANGE_REQUEST = 'exchange_request',
  EXCHANGE_ACCEPTED = 'exchange_accepted',
  NEW_MESSAGE = 'new_message',
  NEW_EVENT = 'new_event',
  EVENT_REMINDER = 'event_reminder',
  BOBIZ_REWARD = 'bobiz_reward',
  CONTACT_INVITATION = 'contact_invitation',
  SYSTEM_ALERT = 'system_alert'
}

/**
 * Interface pour les données de notification
 */
interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  priority?: 'default' | 'high' | 'max';
}

/**
 * Service de gestion des notifications push
 */
class NotificationService {
  private expoPushToken: string | null = null;
  private isInitialized: boolean = false;
  private notificationListener: any = null;
  private responseListener: any = null;

  /**
   * Initialiser le service de notifications
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('🔔 [NOTIFICATIONS] Initialisation...');

      // Vérifier si c'est un device physique
      if (!Device.isDevice) {
        console.warn('⚠️ [NOTIFICATIONS] Les notifications ne fonctionnent que sur un appareil physique');
        return false;
      }

      // Demander les permissions
      const permissionResult = await this.requestPermissions();
      if (!permissionResult) {
        console.warn('⚠️ [NOTIFICATIONS] Permissions refusées');
        return false;
      }

      // Obtenir le token Expo
      const token = await this.getExpoPushToken();
      if (!token) {
        console.error('❌ [NOTIFICATIONS] Impossible d\'obtenir le token Expo');
        return false;
      }

      this.expoPushToken = token;

      // Enregistrer le token sur le serveur
      await this.registerTokenOnServer(token);

      // Configurer les listeners
      this.setupNotificationListeners();

      this.isInitialized = true;
      console.log('✅ [NOTIFICATIONS] Service initialisé avec succès');
      return true;

    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur initialisation:', error);
      return false;
    }
  }

  /**
   * Demander les permissions de notification
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ [NOTIFICATIONS] Permission refusée par l\'utilisateur');
        return false;
      }

      // Permissions Android spécifiques
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'BOB Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });

        // Canal pour les messages
        await Notifications.setNotificationChannelAsync('messages', {
          name: 'Messages BOB',
          importance: Notifications.AndroidImportance.HIGH,
          sound: 'default',
          enableVibrate: true,
        });

        // Canal pour les échanges
        await Notifications.setNotificationChannelAsync('exchanges', {
          name: 'Échanges BOB',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        });
      }

      return true;

    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur permissions:', error);
      return false;
    }
  }

  /**
   * Obtenir le token Expo Push
   */
  private async getExpoPushToken(): Promise<string | null> {
    try {
      // Vérifier le cache local d'abord
      const cachedToken = await AsyncStorage.getItem('@expo_push_token');
      if (cachedToken) {
        console.log('🎯 [NOTIFICATIONS] Token récupéré du cache');
        return cachedToken;
      }

      // Générer un nouveau token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      
      if (!projectId) {
        console.error('❌ [NOTIFICATIONS] Project ID Expo manquant');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      const token = tokenData.data;

      // Sauvegarder en cache
      await AsyncStorage.setItem('@expo_push_token', token);
      
      console.log('✅ [NOTIFICATIONS] Nouveau token généré:', token.substring(0, 20) + '...');
      return token;

    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur génération token:', error);
      return null;
    }
  }

  /**
   * Enregistrer le token sur le serveur BOB
   */
  private async registerTokenOnServer(token: string): Promise<void> {
    try {
      await apiService.post('/users/me/push-token', {
        pushToken: token,
        platform: Platform.OS,
        deviceId: Constants.installationId,
      });

      console.log('✅ [NOTIFICATIONS] Token enregistré sur le serveur');

    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur enregistrement token:', error);
    }
  }

  /**
   * Configurer les listeners de notifications
   */
  private setupNotificationListeners(): void {
    // Listener pour les notifications reçues en foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('🔔 [NOTIFICATIONS] Notification reçue:', notification.request.content.title);
      this.handleNotificationReceived(notification);
    });

    // Listener pour les interactions avec les notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 [NOTIFICATIONS] Notification cliquée:', response.notification.request.content.data);
      this.handleNotificationResponse(response);
    });
  }

  /**
   * Gérer une notification reçue
   */
  private handleNotificationReceived(notification: Notifications.Notification): void {
    const { title, body, data } = notification.request.content;
    
    // Mettre à jour le badge
    if (data?.badge) {
      Notifications.setBadgeCountAsync(data.badge as number);
    }

    // Log pour debug
    console.log('📨 [NOTIFICATIONS] Contenu:', { title, body, data });
  }

  /**
   * Gérer la réponse à une notification (clic)
   */
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
    const data = response.notification.request.content.data;
    
    if (!data?.type) return;

    // Navigation basée sur le type de notification
    switch (data.type as NotificationType) {
      case NotificationType.NEW_MESSAGE:
        // Naviguer vers le chat
        this.navigateToChat(data.chatId, data.contactName);
        break;

      case NotificationType.EXCHANGE_REQUEST:
      case NotificationType.EXCHANGE_ACCEPTED:
        // Naviguer vers l'échange
        this.navigateToExchange(data.exchangeId);
        break;

      case NotificationType.NEW_EVENT:
      case NotificationType.EVENT_REMINDER:
        // Naviguer vers l'événement
        this.navigateToEvent(data.eventId);
        break;

      case NotificationType.BOBIZ_REWARD:
        // Naviguer vers le profil/BOBIZ
        this.navigateToProfile();
        break;

      default:
        console.log('🔔 [NOTIFICATIONS] Type non géré:', data.type);
    }
  }

  /**
   * Navigations spécifiques
   */
  private navigateToChat(chatId: string, contactName?: string): void {
    // TODO: Implémenter la navigation vers le chat
    console.log('🧭 [NOTIFICATIONS] Navigation vers chat:', chatId);
  }

  private navigateToExchange(exchangeId: string): void {
    // TODO: Implémenter la navigation vers l'échange
    console.log('🧭 [NOTIFICATIONS] Navigation vers échange:', exchangeId);
  }

  private navigateToEvent(eventId: string): void {
    // TODO: Implémenter la navigation vers l'événement
    console.log('🧭 [NOTIFICATIONS] Navigation vers événement:', eventId);
  }

  private navigateToProfile(): void {
    // TODO: Implémenter la navigation vers le profil
    console.log('🧭 [NOTIFICATIONS] Navigation vers profil');
  }

  /**
   * Envoyer une notification locale (pour test/demo)
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    try {
      const { title, body, data, badge, sound, priority } = notificationData;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          badge: badge || 0,
          sound: sound || 'default',
          priority: priority === 'high' ? Notifications.AndroidNotificationPriority.HIGH : 
                   priority === 'max' ? Notifications.AndroidNotificationPriority.MAX :
                   Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // Immédiat
      });

      console.log('✅ [NOTIFICATIONS] Notification locale envoyée:', title);

    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur notification locale:', error);
    }
  }

  /**
   * Nettoyer les listeners
   */
  cleanup(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
    this.isInitialized = false;
  }

  /**
   * Obtenir le statut d'initialisation
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtenir le token actuel
   */
  getToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Mettre à jour le badge de l'app
   */
  async setBadge(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur badge:', error);
    }
  }

  /**
   * Effacer toutes les notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadge(0);
      console.log('🧹 [NOTIFICATIONS] Toutes les notifications effacées');
    } catch (error) {
      console.error('❌ [NOTIFICATIONS] Erreur effacement:', error);
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();

export default notificationService;