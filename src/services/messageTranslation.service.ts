// src/services/messageTranslation.service.ts - Service de traduction de messages
export const generateTranslatedMessageStatic = (template: string, params: any = {}) => {
  // Simple template replacement
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] || match;
  });
};

export default {
  generateTranslatedMessageStatic
};