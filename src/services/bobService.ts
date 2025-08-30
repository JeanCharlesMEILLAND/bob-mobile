// src/services/bobService.ts - Service principal BOB
export const bobService = {
  getVersion: () => '1.0.0',
  
  getConfig: () => ({
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:1337/api',
    appName: 'BOB',
    version: '1.0.0'
  }),
  
  init: async () => {
    console.log('BOB Service initialized');
    return true;
  }
};

export default bobService;