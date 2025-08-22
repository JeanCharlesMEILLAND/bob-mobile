// src/services/contacts.service.ts
import { apiClient } from './api';
import { 
  Groupe, 
  Contact, 
  CreateGroupeData, 
  UpdateGroupeData, 
  CreateContactData, 
  UpdateContactData,
  GroupeWithContactCount,
  ContactsByGroupe,
} from '../types';

export const contactsService = {
  // =================== GROUPES ===================
  
  /**
   * Récupérer tous mes groupes
   */
  getMyGroupes: async (token: string): Promise<Groupe[]> => {
    console.log('📋 ContactsService - Récupération des groupes');
    
    try {
      const response = await apiClient.get('/groupes?populate=*', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération groupes');
      }
      
      const result = await response.json();
      console.log('✅ Groupes récupérés:', result.data?.length || 0);
      
      return result.data || [];
    } catch (error: any) {
      console.error('❌ Erreur getMyGroupes:', error.message);
      throw error;
    }
  },

  /**
   * Créer un nouveau groupe
   */
  createGroupe: async (data: CreateGroupeData, token: string): Promise<Groupe> => {
    console.log('📝 ContactsService - Création groupe:', data.nom);
    
    try {
      const response = await apiClient.post('/groupes', { data }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur création groupe');
      }
      
      const result = await response.json();
      console.log('✅ Groupe créé:', result.data.attributes.nom);
      
      return {
        id: result.data.id,
        ...result.data.attributes,
      };
    } catch (error: any) {
      console.error('❌ Erreur createGroupe:', error.message);
      throw error;
    }
  },

  /**
   * Modifier un groupe
   */
  updateGroupe: async (id: number, data: UpdateGroupeData, token: string): Promise<Groupe> => {
    console.log('✏️ ContactsService - Modification groupe:', id);
    
    try {
      const response = await apiClient.put(`/groupes/${id}`, { data }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur modification groupe');
      }
      
      const result = await response.json();
      console.log('✅ Groupe modifié:', result.data.attributes.nom);
      
      return {
        id: result.data.id,
        ...result.data.attributes,
      };
    } catch (error: any) {
      console.error('❌ Erreur updateGroupe:', error.message);
      throw error;
    }
  },

  /**
   * Supprimer un groupe
   */
  deleteGroupe: async (id: number, token: string): Promise<void> => {
    console.log('🗑️ ContactsService - Suppression groupe:', id);
    
    try {
      const response = await apiClient.delete(`/groupes/${id}`, token);
      
      if (!response.ok) {
        throw new Error('Erreur suppression groupe');
      }
      
      console.log('✅ Groupe supprimé');
    } catch (error: any) {
      console.error('❌ Erreur deleteGroupe:', error.message);
      throw error;
    }
  },

  /**
   * Récupérer un groupe avec ses contacts
   */
  getGroupeWithContacts: async (id: number, token: string): Promise<Groupe> => {
    console.log('📋 ContactsService - Récupération groupe avec contacts:', id);
    
    try {
      const response = await apiClient.get(`/groupes/${id}?populate[membres][populate]=*`, token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération groupe');
      }
      
      const result = await response.json();
      console.log('✅ Groupe avec contacts récupéré');
      
      return {
        id: result.data.id,
        ...result.data.attributes,
      };
    } catch (error: any) {
      console.error('❌ Erreur getGroupeWithContacts:', error.message);
      throw error;
    }
  },

  // =================== CONTACTS ===================
  
  /**
   * Récupérer tous mes contacts
   */
  getMyContacts: async (token: string): Promise<Contact[]> => {
    console.log('👥 ContactsService - Récupération des contacts');
    
    try {
      const response = await apiClient.get('/contacts?populate=groupes', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération contacts');
      }
      
      const result = await response.json();
      const contacts = result.data?.map((item: any) => ({
        id: item.id,
        ...item.attributes
      })) || [];
      
      console.log('✅ Contacts récupérés:', contacts.length);
      return contacts;
    } catch (error: any) {
      console.error('❌ Erreur getMyContacts:', error.message);
      throw error;
    }
  },

  /**
   * Créer un nouveau contact
   */
  createContact: async (data: CreateContactData, token: string): Promise<Contact> => {
    console.log('👤 ContactsService - Création contact:', data.nom);
    
    try {
      const contactData = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        // Temporairement commenter groupes pour éviter l'erreur de relation
        // groupes: data.groupeIds,
        actif: true,
        source: 'import_repertoire',
        dateAjout: new Date().toISOString(),
      };
      
      const response = await apiClient.post('/contacts', { data: contactData }, token);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Détail erreur création contact:', errorText);
        console.error('❌ Status:', response.status);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `Erreur ${response.status}: ${errorText}`);
        } catch {
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      const newContact: Contact = {
        id: result.data.id,
        ...result.data.attributes,
      };
      
      console.log('✅ Contact créé:', newContact.nom);
      return newContact;
    } catch (error: any) {
      // Gestion spécifique des doublons (409 Conflict)
      if (error.message.includes('409') || error.message.includes('existe déjà')) {
        console.log('⚠️ Contact existe déjà, tentative de récupération...');
        try {
          console.log('🔍 Recherche contact existant pour téléphone:', data.telephone);
          
          // Utiliser la méthode dédiée pour rechercher par téléphone
          const existingContact = await contactsService.findContactByPhone(data.telephone, token);
          if (existingContact) {
            console.log('✅ Contact existant récupéré via findContactByPhone:', existingContact.nom, 'ID:', existingContact.id);
            return existingContact;
          } else {
            console.log('⚠️ Contact non trouvé par recherche téléphone, tentative avec liste complète...');
            // Fallback: récupérer tous les contacts et chercher
            const allContacts = await contactsService.getMyContacts(token);
            console.log(`📊 ${allContacts.length} contacts trouvés au total`);
            
            // Chercher avec différentes stratégies
            let foundContact = allContacts.find(c => c.telephone === data.telephone);
            if (!foundContact) {
              // Essayer sans espaces/caractères spéciaux
              const normalizedPhone = data.telephone.replace(/[\s\-\(\)]/g, '');
              foundContact = allContacts.find(c => c.telephone && c.telephone.replace(/[\s\-\(\)]/g, '') === normalizedPhone);
            }
            
            if (foundContact) {
              console.log('✅ Contact trouvé via liste complète:', foundContact.nom, 'ID:', foundContact.id);
              return foundContact;
            } else {
              console.log('❌ Contact vraiment introuvable - téléphones disponibles:', 
                allContacts.slice(0, 5).map(c => c.telephone));
            }
          }
        } catch (getError) {
          console.log('⚠️ Impossible de récupérer le contact existant:', getError);
        }
      }
      
      console.error('❌ Erreur createContact:', error.message);
      throw error;
    }
  },

  /**
   * Modifier un contact
   */
  updateContact: async (id: number, data: UpdateContactData, token: string): Promise<Contact> => {
    console.log('✏️ ContactsService - Modification contact:', id);
    
    try {
      const response = await apiClient.put(`/contacts/${id}`, { data }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur modification contact');
      }
      
      const result = await response.json();
      const updatedContact: Contact = {
        id: result.data.id,
        ...result.data.attributes,
      };
      
      console.log('✅ Contact modifié:', updatedContact.nom);
      return updatedContact;
    } catch (error: any) {
      console.error('❌ Erreur updateContact:', error.message);
      throw error;
    }
  },

  /**
   * Supprimer un contact
   */
  deleteContact: async (id: number, token: string): Promise<void> => {
    console.log('🗑️ ContactsService - Suppression contact:', id);
    
    try {
      const response = await apiClient.delete(`/contacts/${id}`, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur suppression contact');
      }
      
      console.log('✅ Contact supprimé');
    } catch (error: any) {
      console.error('❌ Erreur deleteContact:', error.message);
      throw error;
    }
  },

  // =================== HELPERS ===================
  
  /**
   * Récupérer les groupes avec nombre de contacts
   */
  getGroupesWithContactCount: async (token: string): Promise<GroupeWithContactCount[]> => {
    console.log('📊 ContactsService - Groupes avec comptage');
    
    try {
      const groupes = await contactsService.getMyGroupes(token);
      
      const groupesWithCount: GroupeWithContactCount[] = groupes.map(groupe => ({
        ...groupe,
        contactCount: groupe.membres?.length || 0,
      }));
      
      console.log('✅ Groupes avec comptage récupérés');
      return groupesWithCount;
    } catch (error: any) {
      console.error('❌ Erreur getGroupesWithContactCount:', error.message);
      throw error;
    }
  },

  /**
   * Organiser les contacts par groupe
   */
  getContactsByGroupe: async (token: string): Promise<ContactsByGroupe> => {
    console.log('📂 ContactsService - Contacts par groupe');
    
    try {
      const groupes = await contactsService.getMyGroupes(token);
      
      const contactsByGroupe: ContactsByGroupe = {};
      
      for (const groupe of groupes) {
        contactsByGroupe[groupe.id] = {
          groupe,
          contacts: groupe.membres || [],
        };
      }
      
      console.log('✅ Contacts organisés par groupe');
      return contactsByGroupe;
    } catch (error: any) {
      console.error('❌ Erreur getContactsByGroupe:', error.message);
      throw error;
    }
  },

  // =================== CONTACTS AVANCÉS ===================

  /**
   * Rechercher des contacts par téléphone
   */
  findContactByPhone: async (telephone: string, token: string): Promise<Contact | null> => {
    console.log('🔍 ContactsService - Recherche par téléphone:', telephone);
    
    try {
      const response = await apiClient.get(`/contacts/phone/${encodeURIComponent(telephone)}`, token);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Erreur recherche contact');
      }
      
      const result = await response.json();
      const contacts = result.data || [];
      
      if (contacts.length === 0) {
        return null;
      }
      
      // Handle both Strapi v4 format (with attributes) and direct format
      const contact = contacts[0];
      return {
        id: contact.id,
        ...contact.attributes || contact,
      };
    } catch (error: any) {
      console.error('❌ Erreur findContactByPhone:', error.message);
      return null;
    }
  },

  /**
   * Vérifier quels contacts ont Bob
   */
  checkBobUsers: async (telephones: string[], token: string): Promise<Record<string, boolean>> => {
    console.log('🔍 ContactsService - Vérification utilisateurs Bob:', telephones.length);
    
    try {
      const response = await apiClient.post('/contacts/check-bob-users', {
        telephones,
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur vérification utilisateurs Bob');
      }
      
      const result = await response.json();
      console.log('✅ Vérification Bob terminée');
      
      return result.data?.results || {};
    } catch (error: any) {
      console.error('❌ Erreur checkBobUsers:', error.message);
      
      // Fallback: marquer tous comme non Bob
      const fallback: Record<string, boolean> = {};
      telephones.forEach(tel => {
        fallback[tel] = false;
      });
      return fallback;
    }
  },

  /**
   * Import en masse de contacts
   */
  bulkCreateContacts: async (contacts: CreateContactData[], token: string): Promise<{
    created: Contact[];
    errors: any[];
    duplicates: any[];
  }> => {
    console.log('📥 ContactsService - Import en masse:', contacts.length, 'contacts');
    
    try {
      const response = await apiClient.post('/contacts/bulk-create', {
        contacts,
      }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur import en masse');
      }
      
      const result = await response.json();
      console.log('✅ Import en masse terminé');
      
      return result.data;
    } catch (error: any) {
      console.error('❌ Erreur bulkCreateContacts:', error.message);
      throw error;
    }
  },

  /**
   * Synchroniser les contacts avec les utilisateurs Bob
   */
  syncWithBobUsers: async (token: string): Promise<{
    totalChecked: number;
    updated: number;
  }> => {
    console.log('🔄 ContactsService - Synchronisation avec utilisateurs Bob');
    
    try {
      const response = await apiClient.post('/contacts/sync-bob-users', {}, token);
      
      if (!response.ok) {
        throw new Error('Erreur synchronisation Bob');
      }
      
      const result = await response.json();
      console.log('✅ Synchronisation Bob terminée');
      
      return result.data;
    } catch (error: any) {
      console.error('❌ Erreur syncWithBobUsers:', error.message);
      throw error;
    }
  },
};