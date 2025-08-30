import { useState, useEffect, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  lue: boolean;
  dateCreation: string;
  dateLecture?: string;
  actionUrl?: string;
  metadata?: any;
  expediteur?: {
    id: number;
    username: string;
    email: string;
  };
}

interface NotificationHook {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => Promise<number>;
  requestPermissions: () => Promise<boolean>;
  // Nouvelles fonctions push
  pushToken: string | null;
  isPushReady: boolean;
  initializePush: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

const API_BASE = 'http://localhost:1337/api';

export const useNotifications = (): NotificationHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour push notifications
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [isPushReady, setIsPushReady] = useState(false);

  // Configuration des notifications Expo
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('bob_auth_token');
    } catch {
      return null;
    }
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiCall('/notifications?sort=dateCreation:desc&pagination[limit]=50');
      const notifs = result.data || [];
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.lue).length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      console.error('Erreur fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const result = await apiCall('/notifications/unread-count');
      const count = result.data?.count || 0;
      setUnreadCount(count);
      return count;
    } catch (err) {
      console.error('Erreur compteur non lues:', err);
      return 0;
    }
  }, []);

  const markAsRead = useCallback(async (id: number) => {
    try {
      await apiCall(`/notifications/${id}/mark-as-read`, {
        method: 'PUT',
      });

      // Mise à jour locale
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id 
            ? { ...notif, lue: true, dateLecture: new Date().toISOString() }
            : notif
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur marquage lu:', err);
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiCall('/notifications/mark-all-as-read', {
        method: 'PUT',
      });

      // Mise à jour locale
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          lue: true, 
          dateLecture: new Date().toISOString() 
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur marquage toutes lues:', err);
      throw err;
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return true; // Pas de permissions nécessaires sur web
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Permissions notifications refusées');
        return false;
      }

      // Configuration du canal de notifications Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('bob-notifications', {
          name: 'Notifications Bob',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Erreur permissions notifications:', error);
      return false;
    }
  }, []);

  // Initialisation des push notifications
  const initializePush = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔔 [USE_NOTIFICATIONS] Initialisation push...');
      
      const success = await notificationService.initialize();
      const token = notificationService.getToken();
      
      setPushToken(token);
      setIsPushReady(success);
      
      if (success && token) {
        console.log('✅ [USE_NOTIFICATIONS] Push initialisé avec succès');
        
        // Synchroniser le token avec Strapi si nécessaire
        await syncPushTokenWithServer(token);
      }
      
      return success;
    } catch (error) {
      console.error('❌ [USE_NOTIFICATIONS] Erreur init push:', error);
      setError('Erreur initialisation push notifications');
      return false;
    }
  }, []);

  // Synchroniser le token push avec le serveur
  const syncPushTokenWithServer = useCallback(async (token: string) => {
    try {
      await apiCall('/users/me/push-token', {
        method: 'PUT',
        body: JSON.stringify({
          pushToken: token,
          platform: Platform.OS,
          deviceInfo: {
            os: Platform.OS,
            version: Platform.Version,
          }
        })
      });
      
      console.log('✅ [USE_NOTIFICATIONS] Token push synchronisé avec serveur');
    } catch (error) {
      console.error('❌ [USE_NOTIFICATIONS] Erreur sync token:', error);
    }
  }, []);

  // Envoyer une notification de test
  const sendTestNotification = useCallback(async () => {
    try {
      if (!isPushReady) {
        throw new Error('Service push non initialisé');
      }

      // Créer une notification de test dans Strapi
      const response = await apiCall('/notifications', {
        method: 'POST',
        body: JSON.stringify({
          data: {
            titre: '🔔 Test Notification',
            message: 'Les notifications push BOB fonctionnent parfaitement !',
            type: 'système_info',
            priorite: 'haute',
            canaux: ['push', 'inapp'],
            dateCreation: new Date().toISOString(),
            statut: 'envoyée',
            metadata: {
              isTest: true,
              source: 'mobile_app'
            }
          }
        })
      });

      if (response.data) {
        // Déclencher la notification push locale
        await Notifications.scheduleNotificationAsync({
          content: {
            title: response.data.titre,
            body: response.data.message,
            data: {
              notificationId: response.data.id,
              type: response.data.type,
              ...response.data.metadata
            },
          },
          trigger: null, // Immédiat
        });

        // Rafraîchir la liste
        await fetchNotifications();
        
        console.log('✅ [USE_NOTIFICATIONS] Notification de test envoyée');
      }
    } catch (error) {
      console.error('❌ [USE_NOTIFICATIONS] Erreur test notification:', error);
      setError('Erreur envoi notification de test');
    }
  }, [isPushReady, fetchNotifications]);

  // Écouter les changements d'état de l'app pour synchroniser
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App revient en premier plan, synchroniser
        fetchNotifications();
        getUnreadCount();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [fetchNotifications, getUnreadCount]);

  // Initialisation globale
  useEffect(() => {
    const initialize = async () => {
      // Charger les notifications depuis Strapi
      await fetchNotifications();
      
      // Initialiser les push notifications
      await initializePush();
    };
    
    initialize();
  }, [fetchNotifications, initializePush]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    requestPermissions,
    // Nouvelles fonctions push
    pushToken,
    isPushReady,
    initializePush,
    sendTestNotification,
  };
};

export default useNotifications;