// src/services/api.ts
export const API_BASE_URL = 'http://46.202.153.43:1337/api'; // VPS - PRODUCTION
// export const API_BASE_URL = 'http://localhost:1337/api'; // Local backend - DEV

console.log('🔗 API_BASE_URL configuré pour:', API_BASE_URL);

export const apiClient = {
  get: async (endpoint: string, token?: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
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
        },
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
      },
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