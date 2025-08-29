// src/services/storage.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

// Clés de stockage
const STORAGE_KEYS = {
  JWT_TOKEN: '@bob_jwt_token',
  USER_DATA: '@bob_user_data',
  SESSION_TIMESTAMP: '@bob_session_timestamp',
} as const;

export const storageService = {
  // =================== JWT TOKEN ===================
  
  /**
   * Sauvegarder le token JWT
   */
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
      // Sauvegarder aussi le timestamp de la session
      await AsyncStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, Date.now().toString());
      console.log('💾 Token sauvegardé');
    } catch (error) {
      console.error('❌ Erreur sauvegarde token:', error);
      throw error;
    }
  },

  /**
   * Récupérer le token JWT
   */
  getToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
      console.log('🔑 Token récupéré:', token ? 'PRÉSENT' : 'ABSENT');
      return token;
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  },

  /**
   * Supprimer le token JWT
   */
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
      console.log('🗑️ Token supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression token:', error);
    }
  },

  // =================== USER DATA ===================
  
  /**
   * Sauvegarder les données utilisateur
   */
  saveUser: async (user: User): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      console.log('💾 Données utilisateur sauvegardées:', user.username);
    } catch (error) {
      console.error('❌ Erreur sauvegarde utilisateur:', error);
      throw error;
    }
  },

  /**
   * Récupérer les données utilisateur
   */
  getUser: async (): Promise<User | null> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        console.log('👤 Utilisateur récupéré:', user.username);
        return user;
      }
      console.log('👤 Aucun utilisateur en cache');
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  },

  /**
   * Supprimer les données utilisateur
   */
  removeUser: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      console.log('🗑️ Données utilisateur supprimées');
    } catch (error) {
      console.error('❌ Erreur suppression utilisateur:', error);
    }
  },

  // =================== SESSION MANAGEMENT ===================
  
  /**
   * Vérifier si la session est encore valide (7 jours max)
   */
  isSessionValid: async (): Promise<boolean> => {
    try {
      const timestampStr = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);
      if (!timestampStr) return false;

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const sessionAge = now - timestamp;
      
      // Session valide pendant 7 jours (7 * 24 * 60 * 60 * 1000 ms)
      const maxSessionAge = 7 * 24 * 60 * 60 * 1000;
      
      const isValid = sessionAge < maxSessionAge;
      console.log('⏰ Session valide:', isValid, `(âge: ${Math.round(sessionAge / (1000 * 60 * 60))}h)`);
      
      return isValid;
    } catch (error) {
      console.error('❌ Erreur vérification session:', error);
      return false;
    }
  },

  /**
   * Nettoyer complètement le stockage (logout complet)
   */
  clearAll: async (): Promise<void> => {
    try {
      await Promise.all([
        storageService.removeToken(),
        storageService.removeUser(),
      ]);
      console.log('🧹 Stockage nettoyé complètement');
    } catch (error) {
      console.error('❌ Erreur nettoyage stockage:', error);
    }
  },

  /**
   * Sauvegarder session complète (token + user)
   */
  saveSession: async (token: string, user: User): Promise<void> => {
    try {
      await Promise.all([
        storageService.saveToken(token),
        storageService.saveUser(user),
      ]);
      console.log('💾 Session complète sauvegardée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
      throw error;
    }
  },

  /**
   * Récupérer session complète
   */
  getSession: async (): Promise<{ token: string; user: User } | null> => {
    try {
      const [token, user, isValid] = await Promise.all([
        storageService.getToken(),
        storageService.getUser(),
        storageService.isSessionValid(),
      ]);

      if (token && user && isValid) {
        console.log('✅ Session complète récupérée:', user.username);
        return { token, user };
      }

      console.log('❌ Session incomplète ou expirée');
      // Nettoyer si session invalide
      if (!isValid) {
        await storageService.clearAll();
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération session:', error);
      return null;
    }
  },

  // =================== DEBUG UTILITIES ===================
  
  /**
   * Afficher toutes les données stockées (debug)
   */
  debugStorage: async (): Promise<void> => {
    try {
      const [token, user, timestamp] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.JWT_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP),
      ]);

      console.log('🔍 Debug Storage:');
      console.log('  Token:', token ? `${token.substring(0, 20)}...` : 'ABSENT');
      console.log('  User:', user ? JSON.parse(user).username : 'ABSENT');
      console.log('  Timestamp:', timestamp ? new Date(parseInt(timestamp)).toLocaleString() : 'ABSENT');
    } catch (error) {
      console.error('❌ Erreur debug storage:', error);
    }
  },

  // =================== BOB ECOSYSTEM STORAGE ===================

  /**
   * Stocker une valeur générique avec préfixe BOB
   */
  set: async (key: string, value: any): Promise<void> => {
    try {
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(`@bob_${key}`, serializedValue);
    } catch (error) {
      console.error('❌ Erreur storage SET:', error);
      throw error;
    }
  },

  /**
   * Récupérer une valeur générique
   */
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(`@bob_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('❌ Erreur storage GET:', error);
      return null;
    }
  },
};