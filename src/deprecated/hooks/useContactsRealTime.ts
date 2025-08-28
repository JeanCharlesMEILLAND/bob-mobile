// src/hooks/useContactsRealTime.ts - Redirection vers nouveau système
// 🚨 DÉPRÉCIÉ: Utilisez useContacts() depuis hooks/contacts/useContacts.ts directement
import { useContacts } from './contacts/useContacts';

export const useContactsRealTime = () => {
  // 🚀 REDIRECTION vers le nouveau système optimisé
  console.log('⚠️ useContactsRealTime est déprécié - utilisez useContacts() directement');
  return useContacts();
};