// src/utils/debug.ts - Utilities pour diagnostiquer les problèmes d'authentification
import { Platform } from 'react-native';
import { apiClient } from '../services/api';

export interface DebugInfo {
  platform: string;
  isWeb: boolean;
  environment: string;
  apiUrl: string;
  userAgent: string;
  timestamp: string;
  apiTests: {
    healthCheck?: { status: number; ok: boolean; error?: string };
    authEndpoint?: { status: number; ok: boolean; error?: string };
    usersEndpoint?: { status: number; ok: boolean; error?: string };
  };
}

export const collectDebugInfo = async (): Promise<DebugInfo> => {
  const info: DebugInfo = {
    platform: Platform.OS,
    isWeb: Platform.OS === 'web',
    environment: process.env.NODE_ENV || 'unknown',
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'undefined',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    timestamp: new Date().toISOString(),
    apiTests: {}
  };

  // Test différents endpoints
  const endpoints = [
    { name: 'healthCheck', url: '/health' },
    { name: 'authEndpoint', url: '/auth/local' },
    { name: 'usersEndpoint', url: '/users/me' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🧪 Testing ${endpoint.name} at ${endpoint.url}`);
      const response = await apiClient.get(endpoint.url);
      
      info.apiTests[endpoint.name as keyof typeof info.apiTests] = {
        status: response.status,
        ok: response.ok
      };
      
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.ok ? 'OK' : 'Error'}`);
    } catch (error: any) {
      console.error(`❌ ${endpoint.name} error:`, error.message);
      info.apiTests[endpoint.name as keyof typeof info.apiTests] = {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  }

  return info;
};

export const logDebugInfo = (info: DebugInfo) => {
  console.group('🔧 DEBUG AUTHENTICATION');
  console.log('Platform Info:', {
    platform: info.platform,
    isWeb: info.isWeb,
    environment: info.environment
  });
  
  console.log('API Configuration:', {
    apiUrl: info.apiUrl,
    userAgent: info.userAgent.substring(0, 100) + '...'
  });
  
  console.log('API Tests Results:', info.apiTests);
  
  console.log('Potential Issues:');
  if (info.platform === 'web' && info.environment !== 'development') {
    console.warn('⚠️ Running on web in non-development mode');
  }
  
  if (!info.apiTests.authEndpoint?.ok) {
    console.error('❌ Auth endpoint not accessible - will fallback to MockAuthService');
  }
  
  if (info.apiUrl === 'undefined') {
    console.error('❌ API URL not configured properly');
  }
  
  console.groupEnd();
};

export const testCredentialsOnDifferentPlatforms = async (identifier: string, password: string) => {
  console.group(`🔐 Testing credentials: ${identifier}`);
  
  // Test 1: Direct API call
  console.log('1️⃣ Testing direct API call');
  try {
    const response = await apiClient.post('/auth/local', { identifier, password });
    const responseText = await response.text();
    console.log('Direct API result:', {
      status: response.status,
      ok: response.ok,
      response: responseText.substring(0, 200)
    });
  } catch (error: any) {
    console.error('Direct API error:', error.message);
  }
  
  // Test 2: Différences de headers selon la plateforme
  console.log('2️⃣ Testing platform-specific headers');
  console.log('Current platform headers will be:', {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'User-Agent': Platform.OS === 'web' ? 'Web Browser' : 'React Native App'
  });
  
  console.groupEnd();
};

export const getMockCredentialsSuggestions = () => {
  return [
    { identifier: 'test@bob.com', password: 'password123', description: 'Utilisateur de test principal' },
    { identifier: 'testuser', password: 'password123', description: 'Même utilisateur avec username' },
    { identifier: 'alice@bob.com', password: 'alice123', description: 'Utilisateur Alice' },
    { identifier: 'alice', password: 'alice123', description: 'Alice avec username' }
  ];
};