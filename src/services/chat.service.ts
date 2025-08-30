// src/services/chat.service.ts - Service de chat
export const chatService = {
  sendMessage: async (groupId: string, message: string) => {
    // Simulation d'envoi de message
    console.log(`Envoi message au groupe ${groupId}:`, message);
    return { success: true, messageId: Date.now().toString() };
  },
  
  getMessages: async (groupId: string) => {
    // Simulation récupération messages
    return { success: true, messages: [] };
  }
};

export default chatService;