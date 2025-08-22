import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const API_BASE = 'http://localhost:1337/api';

export const useNotifications = (): NotificationHook => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuration des notifications Expo
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
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

  // Chargement initial
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
  };
};

export default useNotifications;