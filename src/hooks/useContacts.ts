// src/hooks/useContacts.ts - Version simple pour test
import { useState, useCallback } from 'react';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ContactSimple {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  isSelected: boolean;
}

const STORAGE_KEY = '@bob_selected_contacts';

export const useContacts = () => {
  const [contacts, setContacts] = useState<ContactSimple[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<ContactSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Nettoyer numéro de téléphone
  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+') && /^[67]/.test(cleaned)) {
      cleaned = '+33' + cleaned;
    }
    
    return cleaned.length >= 8 ? cleaned : '';
  };

  // Demander permission et scanner contacts
  const scanContacts = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Demande permission contacts...');
      
      // Demander permission
      const { status } = await Contacts.requestPermissionsAsync();
      console.log('📋 Status permission:', status);
      
      if (status !== 'granted') {
        setError('Permission d\'accès aux contacts refusée');
        setHasPermission(false);
        return false;
      }

      setHasPermission(true);
      console.log('✅ Permission accordée');

      // Récupérer contacts
      console.log('📱 Récupération des contacts...');
      const { data: rawContacts } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
        pageSize: 100, // Limiter pour le test
      });

      console.log(`📊 ${rawContacts.length} contacts récupérés`);

      // Nettoyer et formater
      const cleanedContacts: ContactSimple[] = [];
      
      for (const contact of rawContacts) {
        // Filtres de base
        if (!contact.phoneNumbers?.length || !contact.name?.trim()) {
          continue;
        }
        
        const telephone = cleanPhoneNumber(contact.phoneNumbers[0].number || '');
        if (!telephone || telephone.length < 8) {
          continue;
        }

        // Éviter doublons
        if (cleanedContacts.some(c => c.telephone === telephone)) {
          continue;
        }

        cleanedContacts.push({
          id: contact.id || `contact_${Date.now()}_${Math.random()}`,
          nom: contact.name.trim(),
          telephone,
          email: contact.emails?.[0]?.email?.trim(),
          isSelected: false,
        });
      }

      console.log(`✅ ${cleanedContacts.length} contacts valides traités`);
      setContacts(cleanedContacts);
      
      return true;
    } catch (err: any) {
      console.error('❌ Erreur scan contacts:', err);
      setError(err.message || 'Erreur lors du scan des contacts');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sélectionner un contact
  const toggleContactSelection = useCallback((contactId: string) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isSelected: !contact.isSelected }
        : contact
    ));
  }, []);

  // Obtenir les contacts sélectionnés
  const getSelectedContacts = useCallback((): ContactSimple[] => {
    return contacts.filter(c => c.isSelected);
  }, [contacts]);

  // Sauvegarder la sélection
  const saveSelection = useCallback(async (): Promise<boolean> => {
    try {
      const selected = getSelectedContacts();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
      setSelectedContacts(selected);
      
      console.log(`💾 ${selected.length} contacts sauvegardés`);
      return true;
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      setError('Erreur lors de la sauvegarde');
      return false;
    }
  }, [getSelectedContacts]);

  // Charger la sélection sauvegardée
  const loadSavedContacts = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSelectedContacts(parsed);
        console.log(`📂 ${parsed.length} contacts chargés depuis le storage`);
      }
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
    }
  }, []);

  // Stats simples
  const getStats = useCallback(() => ({
    totalContacts: contacts.length,
    selectedCount: contacts.filter(c => c.isSelected).length,
    savedCount: selectedContacts.length,
  }), [contacts, selectedContacts]);

  return {
    // État
    contacts,
    selectedContacts,
    isLoading,
    hasPermission,
    error,
    
    // Actions
    scanContacts,
    toggleContactSelection,
    saveSelection,
    loadSavedContacts,
    
    // Helpers
    getSelectedContacts,
    getStats,
    clearError: () => setError(null),
  };
};