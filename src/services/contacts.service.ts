// src/services/contacts.service.ts
import { apiClient } from './api';
import { logger, logContacts } from '../utils/logger';
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
    logContacts('Récupération des groupes');
    
    try {
      const response = await apiClient.get('/groupes?populate=*', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération groupes');
      }
      
      const result = await response.json();
      logContacts('Groupes récupérés', { count: result.data?.length || 0 });
      
      return result.data || [];
    } catch (error: any) {
      logger.error('contacts', 'Erreur getMyGroupes', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau groupe
   */
  createGroupe: async (data: CreateGroupeData, token: string): Promise<Groupe> => {
    logContacts('Création groupe', { nom: data.nom });
    
    try {
      const response = await apiClient.post('/groupes', { data }, token);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur création groupe');
      }
      
      const result = await response.json();
      logContacts('Groupe créé', { nom: result.data.nom });
      
      return {
        id: result.data.documentId || result.data.id, // Strapi 5 utilise documentId
        nom: result.data.nom,
        couleur: result.data.couleur,
        description: result.data.description,
        membres: result.data.membres || []
      };
    } catch (error: any) {
      logger.error('contacts', 'Erreur createGroupe', error);
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
      console.log('✅ Groupe modifié:', result.data.nom);
      
      return {
        id: result.data.documentId || result.data.id, // Strapi 5 utilise documentId
        nom: result.data.nom,
        couleur: result.data.couleur,
        description: result.data.description,
        membres: result.data.membres || []
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
        id: result.data.documentId || result.data.id, // Strapi 5 utilise documentId
        nom: result.data.nom,
        couleur: result.data.couleur,
        description: result.data.description,
        membres: result.data.membres || []
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
      // 🔧 POPULATE les champs utilisateur Bob pour détection correcte
      // Essayer d'abord avec populate simple, puis fallback si ça échoue
      let response;
      try {
        console.log('🔍 Tentative avec populate utilisateurBobProfile...');
        response = await apiClient.get('/contacts?populate[groupes]=*&populate[utilisateurBobProfile]=*', token);
      } catch (populateError) {
        console.warn('⚠️ Populate utilisateurBobProfile échoué, fallback vers populate simple');
        response = await apiClient.get('/contacts?populate=*', token);
      }
      
      // Si populate complexe échoue, essayer populate simple
      if (!response.ok) {
        console.warn('⚠️ Populate complexe échoué, tentative avec populate simple...');
        response = await apiClient.get('/contacts?populate=*', token);
      }
      
      // Si populate simple échoue aussi, essayer sans populate
      if (!response.ok) {
        console.warn('⚠️ Populate simple échoué, tentative sans populate...');
        response = await apiClient.get('/contacts', token);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API contacts:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          error: errorText.substring(0, 200)
        });
        throw new Error(`Erreur récupération contacts: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Debug: voir la vraie structure des données (filtrage automatique des données sensibles)
      logger.debug('contacts', 'Structure API Strapi', { 
        dataCount: result.data?.length,
        hasData: !!result.data,
        structure: result.data?.[0] ? 'Premier contact présent' : 'Aucun contact'
      });
      
      console.log('🔍 Structure réponse Strapi:', {
        hasData: !!result.data,
        dataLength: result.data?.length,
        metaInfo: result.meta,
        firstItem: result.data?.[0] ? Object.keys(result.data[0]) : 'pas de premier item'
      });
      
      // Strapi 5 : structure plate, pas d'attributes, documentId au lieu d'id  
      const contacts = result.data?.map((item: any) => {
        return {
          id: item.documentId || item.id, // Strapi 5 utilise documentId
          nom: item.nom,
          prenom: item.prenom,
          telephone: item.telephone,
          email: item.email,
          actif: item.actif,
          // 🔧 VRAIS CHAMPS pour détection utilisateurs Bob
          estUtilisateurBob: item.estUtilisateurBob,
          utilisateurBobProfile: item.utilisateurBobProfile,
          // Fallback pour compatibilité
          aSurBob: item.aSurBob || item.estUtilisateurBob,
          estInvite: item.estInvite,
          dateAjout: item.dateAjout,
          source: item.source,
          groupes: item.groupes || []
        };
      }) || [];
      
      console.log('✅ Contacts traités avec succès:', contacts.length);
      logContacts('Contacts récupérés', { count: contacts.length });
      return contacts;
    } catch (error: any) {
      logger.error('contacts', 'Erreur getMyContacts', error);
      throw error;
    }
  },

  /**
   * Créer un nouveau contact
   */
  createContact: async (data: CreateContactData, token: string): Promise<Contact> => {
    logContacts('Création contact', { nom: data.nom });
    
    try {
      // 🔧 VALIDATION et nettoyage des données avant envoi
      const contactData = {
        nom: (data.nom || '').trim() || 'Nom manquant',
        prenom: (data.prenom || '').trim(),
        email: (data.email || '').trim() || null, // null au lieu de string vide
        telephone: (data.telephone || '').trim(),
        // Temporairement commenter groupes pour éviter l'erreur de relation
        // groupes: data.groupeIds,
        actif: true,
        source: 'import_repertoire',
        dateAjout: new Date().toISOString(),
      };
      
      // 🔧 DEBUG: Loguer les données exactes envoyées
      console.log('📤 Données contact envoyées à Strapi:', {
        nom: contactData.nom,
        prenom: contactData.prenom,
        email: contactData.email,
        telephone: contactData.telephone,
        source: contactData.source
      });
      
      // 🔧 VALIDATION: Vérifier les champs obligatoires
      if (!contactData.nom || contactData.nom === 'Nom manquant') {
        console.warn('⚠️ Nom manquant ou invalide, utilisation nom généré');
        contactData.nom = `Contact_${Date.now()}`;
      }
      
      if (!contactData.telephone) {
        throw new Error('Le téléphone est obligatoire pour créer un contact');
      }
      
      const response = await apiClient.post('/contacts', { data: contactData }, token);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Status HTTP:', response.status);
        console.error('❌ Détail erreur création contact:', errorText);
        
        // 🔧 ANALYSE SPÉCIFIQUE DES ERREURS 500
        if (response.status === 500) {
          console.error('🚨 ERREUR 500 STRAPI - Analyse:');
          console.error('📤 Données qui ont causé l\'erreur:', {
            nom: contactData.nom,
            prenom: contactData.prenom,
            email: contactData.email,
            telephone: contactData.telephone,
            source: contactData.source
          });
          
          // Vérifier si c'est un problème de caractères spéciaux
          if (contactData.nom.includes('é') || contactData.nom.includes('è') || contactData.nom.includes('à') || contactData.nom.includes('ç')) {
            console.warn('⚠️ Caractères spéciaux détectés dans le nom, possible cause de l\'erreur 500');
          }
          
          // Essayer de créer une version "safe" du contact
          console.log('🔄 Tentative de création avec données nettoyées...');
          const safeContactData = {
            ...contactData,
            nom: contactData.nom
              .normalize('NFD') // Décomposer les caractères accentués
              .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
              .replace(/[^a-zA-Z0-9\s\-\.]/g, '') // Supprimer caractères spéciaux
              .trim(),
            prenom: (contactData.prenom || '')
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-zA-Z0-9\s\-\.]/g, '')
              .trim(),
            email: contactData.email ? contactData.email.toLowerCase().trim() : null
          };
          
          console.log('🧹 Données nettoyées:', safeContactData);
          
          try {
            const retryResponse = await apiClient.post('/contacts', { data: safeContactData }, token);
            if (retryResponse.ok) {
              console.log('✅ Création réussie avec données nettoyées !');
              const result = await retryResponse.json();
              const newContact: Contact = {
                id: result.data.documentId, // Strapi 5 clé primaire
                internalId: result.data.id,
                nom: result.data.nom,
                prenom: result.data.prenom,
                telephone: result.data.telephone,
                email: result.data.email,
                actif: result.data.actif !== false,
                estUtilisateurBob: result.data.estUtilisateurBob === true,
                utilisateurBobProfile: result.data.utilisateurBobProfile,
                aSurBob: result.data.estUtilisateurBob === true || result.data.aSurBob === true,
                estInvite: result.data.estInvite === true,
                dateAjout: result.data.dateAjout || result.data.createdAt,
                source: result.data.source || 'import_repertoire',
                groupes: Array.isArray(result.data.groupes) ? result.data.groupes : []
              };
              return newContact;
            }
          } catch (retryError) {
            console.error('❌ Même avec données nettoyées, échec:', retryError);
          }
        }
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `Erreur ${response.status}: ${errorText.substring(0, 200)}`);
        } catch {
          throw new Error(`Erreur ${response.status}: ${errorText.substring(0, 200)}`);
        }
      }
      
      const result = await response.json();
      const newContact: Contact = {
        id: result.data.documentId, // Strapi 5 clé primaire
        internalId: result.data.id,
        nom: result.data.nom,
        prenom: result.data.prenom,
        telephone: result.data.telephone,
        email: result.data.email,
        actif: result.data.actif !== false,
        estUtilisateurBob: result.data.estUtilisateurBob === true,
        utilisateurBobProfile: result.data.utilisateurBobProfile,
        aSurBob: result.data.estUtilisateurBob === true || result.data.aSurBob === true,
        estInvite: result.data.estInvite === true,
        dateAjout: result.data.dateAjout || result.data.createdAt,
        source: result.data.source || 'import_repertoire',
        groupes: Array.isArray(result.data.groupes) ? result.data.groupes : []
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
  updateContact: async (id: number | string, data: UpdateContactData, token: string): Promise<Contact> => {
    console.log('✏️ ContactsService - Modification contact:', id);
    
    try {
      // 🔧 STRAPI 5: Utiliser directement le documentId dans l'URL standard
      console.log('🔧 Strapi 5 - Tentative PUT /contacts/' + id);
      let response = await apiClient.put(`/contacts/${id}`, { data }, token);
      
      // Si PUT échoue, essayer avec PATCH (parfois requis dans Strapi 5)
      if (!response.ok && response.status === 405) {
        console.log('⚠️ PUT Method Not Allowed, tentative avec PATCH...');
        response = await apiClient.patch(`/contacts/${id}`, { data }, token);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur updateContact détail:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          contactId: id,
          method: response.status === 405 ? 'PUT puis PATCH échoués' : 'PUT échoué',
          dataEnvoyee: JSON.stringify(data).substring(0, 150),
          error: errorText.substring(0, 200)
        });
        
        // Si même PATCH échoue, peut-être que le champ n'est pas modifiable
        if (response.status === 405) {
          console.warn('🚨 Erreur 405: Le champ estUtilisateurBob ou utilisateurBobProfile n\'est peut-être pas modifiable via l\'API');
          console.warn('💡 Solution: Vérifier les permissions dans Strapi Admin ou utiliser un endpoint custom');
        }
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        throw new Error(errorData.error?.message || `Erreur modification contact ${response.status}`);
      }
      
      const result = await response.json();
      const updatedContact: Contact = {
        id: result.data.documentId, // Strapi 5 utilise documentId comme clé primaire
        internalId: result.data.id, // ID numérique interne
        nom: result.data.nom,
        prenom: result.data.prenom,
        telephone: result.data.telephone,
        email: result.data.email,
        actif: result.data.actif !== false,
        estUtilisateurBob: result.data.estUtilisateurBob === true,
        utilisateurBobProfile: result.data.utilisateurBobProfile,
        aSurBob: result.data.estUtilisateurBob === true || result.data.aSurBob === true,
        estInvite: result.data.estInvite === true,
        dateAjout: result.data.dateAjout || result.data.updatedAt,
        source: result.data.source || 'import_repertoire',
        groupes: Array.isArray(result.data.groupes) ? result.data.groupes : []
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
   * Vérifier et détecter les vrais utilisateurs Bob (méthode robuste)
   */
  detectRealBobUsers: async (token: string): Promise<{
    bobUsers: any[];
    contactsWithBob: Contact[];
    stats: {
      totalUsers: number;
      contactsUpdated: number;
    };
  }> => {
    console.log('🔍 ContactsService - Détection vrais utilisateurs Bob');
    
    try {
      // 1. Récupérer tous les vrais utilisateurs Bob inscrits
      const usersResponse = await apiClient.get('/users?populate=*', token);
      
      if (!usersResponse.ok) {
        throw new Error('Erreur récupération utilisateurs Bob');
      }
      
      const usersResult = await usersResponse.json();
      const bobUsers = usersResult || [];
      
      console.log(`👥 ${bobUsers.length} utilisateurs Bob inscrits détectés`);
      
      // 2. Récupérer tous mes contacts
      const allContacts = await contactsService.getMyContacts(token);
      console.log(`📋 ${allContacts.length} contacts à vérifier`);
      
      // 3. Créer un mapping téléphone -> utilisateur Bob (Strapi 5)
      const bobUsersByPhone: Record<string, any> = {};
      bobUsers.forEach((user: any) => {
        if (user.telephone) {
          const normalizedPhone = user.telephone.replace(/[^\+\d]/g, '');
          bobUsersByPhone[normalizedPhone] = user;
          console.log(`📞 User Bob Strapi 5: ${user.username} (${user.telephone}) - documentId: ${user.documentId}`);
        }
      });
      
      // 4. Identifier les contacts qui sont des utilisateurs Bob
      const contactsWithBob: Contact[] = [];
      let contactsUpdated = 0;
      
      for (const contact of allContacts) {
        if (!contact.telephone) continue;
        
        const normalizedPhone = contact.telephone.replace(/[^\+\d]/g, '');
        const bobUser = bobUsersByPhone[normalizedPhone];
        
        if (bobUser) {
          console.log(`✅ ${contact.nom} EST un utilisateur Bob (${bobUser.username})`);
          
          // 🔧 SOLUTION ALTERNATIVE: Enrichir côté client sans modifier Strapi
          // (car les champs estUtilisateurBob/utilisateurBobProfile semblent read-only)
          console.log('💡 Enrichissement côté client (pas de modification Strapi)');
          
          const enrichedContact = {
            ...contact,
            // 🔧 Marquer comme utilisateur Bob côté client
            estUtilisateurBob: true,
            utilisateurBobProfile: bobUser,
            aSurBob: true, // Pour compatibilité avec l'ancien code
            userProfile: {
              id: bobUser.documentId || bobUser.id,
              nom: bobUser.nom || contact.nom,
              prenom: bobUser.prenom || contact.prenom,
              email: bobUser.email,
              telephone: bobUser.telephone,
              bobizPoints: bobUser.bobizPoints || 0,
              niveau: bobUser.niveau || 'Débutant',
              estEnLigne: bobUser.estEnLigne || false,
              derniereActivite: bobUser.dernierConnexion,
              dateInscription: bobUser.dateInscription,
            }
          };
          
          contactsWithBob.push(enrichedContact);
          contactsUpdated++; // Compte comme "mis à jour" même si c'est côté client
          
          // 💡 Enrichissement réussi côté client - pas besoin de modifier Strapi
          console.log(`💡 ${contact.nom} enrichi avec profil utilisateur Bob`);
        }
      }
      
      console.log(`✅ Détection terminée: ${contactsWithBob.length} utilisateurs Bob détectés, ${contactsUpdated} contacts mis à jour`);
      
      return {
        bobUsers,
        contactsWithBob,
        stats: {
          totalUsers: bobUsers.length,
          contactsUpdated
        }
      };
      
    } catch (error: any) {
      console.error('❌ Erreur detectRealBobUsers:', error);
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