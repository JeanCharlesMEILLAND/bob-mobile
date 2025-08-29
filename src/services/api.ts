// src/services/api.ts
// Configuration multi-environnement avec variables d'environnement
import Constants from 'expo-constants';

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

// Export tokenStorage for compatibility
export const tokenStorage = {
  getToken: async () => {
    // Implementation would go here
    return null;
  },
  setToken: async (token: string) => {
    // Implementation would go here
  },
  removeToken: async () => {
    // Implementation would go here
  }
};