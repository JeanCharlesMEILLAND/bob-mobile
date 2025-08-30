// src/services/debug.service.ts - Service de debug
export const debugService = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  testApi: async () => {
    // Test API basic
    return { success: true, message: 'Debug API test OK' };
  }
};

export default debugService;