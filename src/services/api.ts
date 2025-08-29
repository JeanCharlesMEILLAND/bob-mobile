// src/services/api.ts
// Configuration multi-environnement avec variables d'environnement
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isDev = __DEV__ || process.env.NODE_ENV === 'development';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (isDev 
    ? 'http://localhost:1337/api' 
    : 'https://bobv2.strapi-pro.com/api');

export const STAGING_API_URL = process.env.EXPO_PUBLIC_STAGING_API_URL || 'https://staging.bobv2.strapi-pro.com/api';
export const WEB_APP_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://web-bobv2.strapi-pro.com';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 
  (isDev 
    ? 'http://localhost:1338' 
    : 'https://bobv2.strapi-pro.com');

console.log('🔗 Configuration BOB v2:');
console.log('   API_BASE_URL:', API_BASE_URL);
console.log('   SOCKET_URL:', SOCKET_URL);
console.log('   Environment:', isDev ? 'DEVELOPMENT' : 'PRODUCTION');
console.log('   App Version:', Constants.expoConfig?.version || '2.0.0');

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    return response;
  },
  
  post: async (endpoint: string, data: any, token?: string) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🔗 POST Request:', {
      url: fullUrl,
      endpoint,
      hasToken: !!token,
      dataSize: JSON.stringify(data).length,
      data: data
    });
    
    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(data),
      });
      
      console.log('✅ POST Response:', {
        url: fullUrl,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      return response;
    } catch (error) {
      console.error('❌ POST Error:', {
        url: fullUrl,
        error: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },

  put: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        'Accept': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify(data),
    });
    return response;
  },

  patch: async (endpoint: string, data: any, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });
    return response;
  },

  delete: async (endpoint: string, token?: string) => {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('🗑️ DELETE Request:', {
      endpoint,
      hasToken: !!token,
      url: fullUrl,
      API_BASE_URL,
      endpointLength: endpoint.length,
      fullUrlLength: fullUrl.length
    });
    
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      console.log('✅ DELETE Response:', {
        url: fullUrl,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });
      
      return response;
    } catch (error) {
      console.error('❌ DELETE Error:', {
        url: fullUrl,
        error: error.message,
        name: error.name,
        stack: error.stack
      });
      throw error;
    }
  },
};

// TokenStorage - Gestion sécurisée des tokens d'authentification

const TOKEN_KEY = '@bob_auth_token';

export const tokenStorage = {
  getToken: async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token && token.length > 10) {
        console.log('🔐 Token récupéré:', token.substring(0, 20) + '...');
        return token;
      }
      return null;
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  },
  
  setToken: async (token: string): Promise<void> => {
    try {
      if (!token || token.length < 10) {
        console.warn('⚠️ Token invalide fourni pour sauvegarde');
        return;
      }
      await AsyncStorage.setItem(TOKEN_KEY, token);
      console.log('✅ Token sauvegardé:', token.substring(0, 20) + '...');
    } catch (error) {
      console.error('❌ Erreur sauvegarde token:', error);
      throw error;
    }
  },
  
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token supprimé');
    } catch (error) {
      console.error('❌ Erreur suppression token:', error);
      throw error;
    }
  },
  
  // Fonction utilitaire pour vérifier la validité d'un token
  isValidToken: (token: string | null): boolean => {
    if (!token) return false;
    if (token.length < 10) return false;
    // Vérification basique du format JWT
    if (token.split('.').length !== 3) return false;
    return true;
  },
  
  // Fonction pour extraire les infos du token (sans validation cryptographique)
  getTokenInfo: (token: string | null): any => {
    if (!token || !tokenStorage.isValidToken(token)) return null;
    
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      return {
        userId: decoded.id || decoded.sub,
        email: decoded.email,
        exp: decoded.exp,
        iat: decoded.iat,
        isExpired: decoded.exp ? (decoded.exp * 1000 < Date.now()) : false
      };
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
      return null;
    }
  }
};