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
      // Note: À adapter selon la structure de votre API Strapi
      // Pour l'instant, on récupère via les groupes
      const groupes = await contactsService.getMyGroupes(token);
      
      const allContacts: Contact[] = [];
      
      for (const groupe of groupes) {
        if (groupe.membres) {
          allContacts.push(...groupe.membres);
        }
      }
      
      // Dédupliquer les contacts (un contact peut être dans plusieurs groupes)
      const uniqueContacts = allContacts.filter((contact, index, self) => 
        index === self.findIndex(c => c.id === contact.id)
      );
      
      console.log('✅ Contacts récupérés:', uniqueContacts.length);
      return uniqueContacts;
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
      // Note: À adapter selon votre modèle Strapi
      // Pour l'instant, on simule car le modèle Contact n'existe peut-être pas encore
      const contactData = {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        groupes: data.groupeIds,
        actif: true,
      };
      
      // Simulation de réponse - à remplacer par un vrai appel API
      const newContact: Contact = {
        id: Date.now(), // ID temporaire
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        groupes: [], // À populer avec les vrais groupes
        dateAjout: new Date().toISOString(),
        actif: true,
      };
      
      console.log('✅ Contact créé (simulé):', newContact.nom);
      return newContact;
    } catch (error: any) {
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
      // À implémenter selon votre API
      throw new Error('updateContact: À implémenter');
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
      // À implémenter selon votre API
      throw new Error('deleteContact: À implémenter');
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
};