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
      
      // Debug: voir la vraie structure des données
      console.log('🔍 DEBUG Structure API Strapi:', JSON.stringify(result, null, 2));
      if (result.data && result.data[0]) {
        console.log('🔍 DEBUG Premier contact:', JSON.stringify(result.data[0], null, 2));
      }
      
      // Strapi 5 : structure plate, pas d'attributes, documentId au lieu d'id  
      const contacts = result.data?.map((item: any) => ({
        id: item.documentId || item.id, // Strapi 5 utilise documentId
        nom: item.nom,
        prenom: item.prenom,
        telephone: item.telephone,
        email: item.email,
        actif: item.actif,
        aSurBob: item.aSurBob,
        estInvite: item.estInvite,
        dateAjout: item.dateAjout,
        source: item.source,
        groupes: item.groupes || []
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
      console.error('❌ Détail erreur création contact:', error);
      // Status déjà loggé plus haut dans le if (!response.ok)
      
      // Gestion spécifique des doublons (409 Conflict) 
      if (error.response?.status === 409 || error.message?.includes('409') || error.message?.includes('existe déjà') || error.message?.includes('ConflictError')) {
        console.log('⚠️ Contact existe déjà (409), tentative de récupération...');
        console.log('📋 Données du contact à créer:', {
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone
        });
        
        try {
          console.log('🔍 Recherche contact existant pour téléphone:', data.telephone);
          
          // Utiliser la méthode améliorée pour rechercher par téléphone
          const existingContact = await contactsService.findContactByPhone(data.telephone, token);
          if (existingContact) {
            console.log('✅ Contact existant récupéré:', {
              id: existingContact.id,
              nom: existingContact.nom,
              prenom: existingContact.prenom,
              telephone: existingContact.telephone
            });
            return existingContact;
          }
          
          console.log('❌ Aucune méthode n\'a pu récupérer le contact existant');
          
        } catch (getError: any) {
          console.log('⚠️ Erreur lors de la récupération du contact existant:', getError.message);
        }
        
        // Si on arrive ici, on ne peut pas récupérer le contact existant
        // mais on sait qu'il existe (409), donc on crée un contact temporaire
        // avec les données fournies mais un ID factice
        console.log('🔄 Création d\'un contact temporaire car récupération impossible');
        return {
          id: Date.now(), // ID temporaire unique
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone,
          actif: true,
          source: 'import_repertoire',
          dateAjout: new Date().toISOString(),
          groupes: []
        };
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
      // Tester différents endpoints Strapi 5
      const endpoints = [
        `/api/contacts/${id}`,
        `/contacts/${id}`,
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Tentative suppression ${endpoint}...`);
          response = await apiClient.delete(endpoint, token);
          
          if (response.ok) {
            console.log(`✅ Suppression réussie avec ${endpoint}`);
            break;
          } else {
            const errorText = await response.text();
            console.log(`⚠️ ${endpoint} - Status: ${response.status} - ${errorText.substring(0, 100)}`);
            lastError = `${endpoint}: ${response.status}`;
          }
        } catch (error: any) {
          console.log(`❌ ${endpoint} - Erreur:`, error.message);
          lastError = `${endpoint}: ${error.message}`;
          continue;
        }
      }

      if (!response || !response.ok) {
        console.error('❌ Tous les endpoints de suppression ont échoué');
        console.error('❌ Dernière erreur:', lastError);
        throw new Error(`Impossible de supprimer le contact: ${lastError}`);
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
      // D'abord essayer l'endpoint dédié
      const url = `/contacts/phone/${encodeURIComponent(telephone)}`;
      console.log('🌐 URL recherche:', url);
      
      const response = await apiClient.get(url, token);
      
      console.log('📡 Réponse recherche:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });
      
      if (response.ok) {
        const result = await response.json();
        const contacts = result.data || [];
        
        if (contacts.length > 0) {
          const contact = contacts[0];
          return {
            id: contact.id,
            ...contact.attributes || contact,
          };
        }
      }
      
      // Si l'endpoint dédié ne fonctionne pas (404 ou autre erreur), 
      // utiliser la méthode de fallback avec filtres Strapi
      console.log('⚠️ Endpoint dédié non disponible, utilisation du fallback avec filtres');
      
      // Essayer avec filtres Strapi
      const fallbackUrl = `/contacts?filters[telephone][$eq]=${encodeURIComponent(telephone)}`;
      console.log('🔄 URL fallback:', fallbackUrl);
      
      const fallbackResponse = await apiClient.get(fallbackUrl, token);
      
      if (!fallbackResponse.ok) {
        console.log('❌ Fallback aussi échoué, retour null');
        return null;
      }
      
      const fallbackResult = await fallbackResponse.json();
      const fallbackContacts = fallbackResult.data || [];
      
      if (fallbackContacts.length > 0) {
        console.log('✅ Contact trouvé via fallback');
        const contact = fallbackContacts[0];
        return {
          id: contact.id,
          ...contact.attributes || contact,
        };
      }
      
      console.log('📱 Contact non trouvé par aucune méthode');
      return null;
      
    } catch (error: any) {
      console.error('❌ Erreur findContactByPhone:', error.message);
      
      // En dernier recours, essayer de récupérer tous les contacts et filtrer localement
      console.log('🚨 Dernier recours: recherche manuelle dans tous les contacts');
      try {
        const allContacts = await contactsService.getMyContacts(token);
        console.log(`📊 Recherche manuelle dans ${allContacts.length} contacts`);
        
        // Normaliser les numéros pour la comparaison
        const normalizePhone = (phone: string) => phone.replace(/[^\+\d]/g, '');
        const normalizedSearch = normalizePhone(telephone);
        
        const foundContact = allContacts.find(c => {
          if (!c.telephone) return false;
          const normalizedContact = normalizePhone(c.telephone);
          return normalizedContact === normalizedSearch;
        });
        
        if (foundContact) {
          console.log('✅ Contact trouvé via recherche manuelle:', foundContact.nom);
          return foundContact;
        }
        
        console.log('❌ Contact vraiment introuvable');
        return null;
      } catch (manualError) {
        console.error('❌ Échec recherche manuelle:', manualError);
        return null;
      }
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