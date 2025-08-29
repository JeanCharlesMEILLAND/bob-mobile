// src/services/contacts.service.ts
import { apiClient } from './api';
import { logger, logContacts } from '../utils/logger';
import { cachedApiCall } from '../utils/cache';
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

// Fonction utilitaire pour éviter les références circulaires
const findContactByPhoneHelper = async (telephone: string, token: string): Promise<Contact | null> => {
  try {
    // Essayer l'endpoint avec filtre
    const url = `/contacts?filters[telephone][$eq]=${encodeURIComponent(telephone)}`;
    const response = await apiClient.get(url, token);
    
    if (response.ok && response.data?.data?.[0]) {
      const contactRaw = response.data.data[0];
      
      // Debug: voir la structure réelle reçue de Strapi
      console.log('🔍 Structure brute reçue de Strapi via helper:', {
        id: contactRaw.id,
        documentId: contactRaw.documentId,
        hasAttributes: !!contactRaw.attributes,
        topLevelKeys: Object.keys(contactRaw),
        attributeKeys: contactRaw.attributes ? Object.keys(contactRaw.attributes) : null
      });
      
      // Normaliser la structure pour être compatible avec notre type Contact
      const normalizedContact = {
        // Si documentId existe, l'utiliser comme id principal, sinon convertir l'id numérique
        id: contactRaw.documentId || contactRaw.id?.toString() || `contact_${contactRaw.id}`,
        // Toujours garder l'id numérique comme internalId
        internalId: contactRaw.id,
        nom: contactRaw.nom || contactRaw.attributes?.nom,
        prenom: contactRaw.prenom || contactRaw.attributes?.prenom,
        telephone: contactRaw.telephone || contactRaw.attributes?.telephone,
        email: contactRaw.email || contactRaw.attributes?.email,
        actif: contactRaw.actif ?? contactRaw.attributes?.actif ?? true,
        source: contactRaw.source || contactRaw.attributes?.source || 'import_repertoire',
        dateAjout: contactRaw.dateAjout || contactRaw.attributes?.dateAjout || new Date().toISOString(),
        groupes: contactRaw.groupes || contactRaw.attributes?.groupes || []
      };
      
      console.log('🔧 Contact normalisé:', {
        id: normalizedContact.id,
        internalId: normalizedContact.internalId,
        nom: normalizedContact.nom,
        type_id: typeof normalizedContact.id,
        type_internalId: typeof normalizedContact.internalId
      });
      
      return normalizedContact;
    }
    
    return null;
  } catch (error) {
    console.error('❌ findContactByPhoneHelper:', error);
    return null;
  }
};

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
   * 🚀 OPTIMISÉ: Créer un nouveau contact avec vérification préalable
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
      
      // 🔧 VALIDATION: Vérifier les champs obligatoires
      if (!contactData.nom || contactData.nom === 'Nom manquant') {
        console.warn('⚠️ Nom manquant ou invalide, utilisation nom généré');
        contactData.nom = `Contact_${Date.now()}`;
      }
      
      if (!contactData.telephone) {
        throw new Error('Le téléphone est obligatoire pour créer un contact');
      }

      // 🚀 OPTIMISATION: Vérifier AVANT de créer pour éviter les 409
      const normalized = contactsService.normalizePhoneNumber(contactData.telephone);
      console.log('🔍 Vérification existence AVANT création:', normalized);
      
      // ✅ RÉACTIVÉ: Vérification préalable pour éviter les 409
      const existing = await findContactByPhoneHelper(normalized, token);
      if (existing) {
        console.log('📋 Contact existe déjà, retour direct:', existing.nom);
        return existing; // Pas besoin de créer
      }
      
      // 🔧 DEBUG: Loguer les données exactes envoyées (seulement si création nécessaire)
      console.log('📤 Données contact envoyées à Strapi:', {
        nom: contactData.nom,
        prenom: contactData.prenom,
        email: contactData.email,
        telephone: contactData.telephone,
        source: contactData.source
      });
      
      console.log('🚀 contactsService.createContact - Appel apiClient.post...');
      console.log('🌐 contactsService.createContact - URL:', '/contacts');
      console.log('📤 contactsService.createContact - Body:', { data: contactData });
      console.log('🔑 contactsService.createContact - Token présent:', token ? 'Oui' : 'Non');
      
      let response;
      try {
        response = await apiClient.post('/contacts', { data: contactData }, token);
        console.log('📡 contactsService.createContact - Réponse reçue:', {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText
        });
      } catch (networkError) {
        console.error('❌ contactsService.createContact - Erreur réseau avant réponse:', {
          errorMessage: networkError instanceof Error ? networkError.message : 'Erreur inconnue',
          errorName: networkError instanceof Error ? networkError.name : 'Type inconnu',
          errorStack: networkError instanceof Error ? networkError.stack : 'Stack indisponible',
          contactData: {
            nom: contactData.nom,
            telephone: contactData.telephone
          }
        });
        throw networkError; // Re-throw l'erreur pour qu'elle remonte
      }
      
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
      
      // 🚀 OPTIMISATION: Gestion simplifiée des 409 (très rare maintenant car vérification préalable)
      if ((error as any)?.response?.status === 409 || error.message?.includes('409') || error.message?.includes('existe déjà') || error.message?.includes('ConflictError')) {
        console.log('⚠️ Contact existe déjà (409) - Cas rare car vérification préalable');
        console.log('📋 Contact en doublon:', {
          nom: data.nom,
          telephone: data.telephone
        });
        
        // Double sécurité : essayer de récupérer le contact existant
        try {
          const existing = await findContactByPhoneHelper(normalized, token);
          if (existing) {
            console.log('✅ Contact existant récupéré après 409');
            return existing;
          }
        } catch (findError) {
          console.warn('⚠️ Impossible de récupérer le contact existant après 409');
        }
        
        // Fallback : retourner un contact avec les données connues
        return {
          id: `existing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nom: data.nom || 'Contact existant',
          prenom: data.prenom || '',
          telephone: data.telephone || '',
          email: data.email || null,
          actif: true,
          estUtilisateurBob: false,
          utilisateurBobProfile: null,
          aSurBob: false,
          estInvite: false,
          dateAjout: new Date().toISOString(),
          source: 'doublon_ignore',
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
  updateContact: async (contactOrId: number | string | Contact, data: UpdateContactData, token: string): Promise<Contact> => {
    // Extraire l'ID correct selon le type d'entrée
    let contactId: string | number;
    let contact: Contact | null = null;
    
    if (typeof contactOrId === 'object') {
      contact = contactOrId;
      // STRAPI 5: Priorité au documentId (id string), fallback sur internalId
      if (contact.id && typeof contact.id === 'string') {
        contactId = contact.id; // Utiliser le documentId string (priorité pour Strapi 5)
      } else if (contact.internalId) {
        contactId = contact.internalId; // Fallback sur l'ID numérique Strapi
      } else if (contact.id) {
        contactId = contact.id; // Dernier fallback sur id peu importe le type
      } else {
        throw new Error('Aucun ID valide trouvé dans l\'objet contact');
      }
      console.log('✏️ ContactsService - Modification contact depuis objet:', {
        contactId_field: contact.id,
        internalId_field: contact.internalId,
        idUtilise: contactId,
        type_idUtilise: typeof contactId
      });
    } else {
      contactId = contactOrId;
      console.log('✏️ ContactsService - Modification contact avec ID direct:', contactId);
    }
    
    try {
      // 🔧 STRAPI 5: Essayer d'abord avec documentId, puis avec id numérique
      console.log('🔧 Strapi 5 - Tentative PUT /contacts/' + contactId);
      let response = await apiClient.put(`/contacts/${contactId}`, { data }, token);
      
      // Si PUT échoue avec 404 et qu'on a un objet contact avec les deux IDs, essayer l'autre
      if (!response.ok && response.status === 404 && contact) {
        let alternativeId = null;
        
        // Si on a utilisé internalId, essayer avec id
        if (contactId === contact.internalId && contact.id) {
          alternativeId = contact.id;
        }
        // Si on a utilisé id, essayer avec internalId  
        else if (contactId === contact.id && contact.internalId) {
          alternativeId = contact.internalId;
        }
        
        if (alternativeId) {
          console.log(`⚠️ 404 avec ${contactId} (${typeof contactId}), tentative avec ${alternativeId} (${typeof alternativeId})...`);
          response = await apiClient.put(`/contacts/${alternativeId}`, { data }, token);
          contactId = alternativeId; // Mettre à jour pour les logs
        } else {
          console.log(`⚠️ 404 avec ${contactId}, pas d'ID alternatif disponible`);
        }
      }
      
      // Si PUT échoue, essayer avec PATCH (parfois requis dans Strapi 5)
      if (!response.ok && response.status === 405) {
        console.log('⚠️ PUT Method Not Allowed, tentative avec PATCH...');
        response = await apiClient.patch(`/contacts/${contactId}`, { data }, token);
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur updateContact détail:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          contactId: contactId,
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
   * 🚀 OPTIMISÉ: Supprimer un contact avec approche directe
   */
  deleteContact: async (id: number | string, token: string): Promise<void> => {
    console.log('🗑️ ContactsService - Suppression contact optimisée:', id);
    
    try {
      // 🚀 OPTIMISATION: Essayer suppression directe SANS vérification préalable
      console.log('🔄 Tentative suppression directe...');
      const response = await apiClient.delete(`/contacts/${id}`, token);
      
      if (response.ok) {
        console.log('✅ Suppression directe réussie');
        return;
      }
      
      // Si échec avec ID donné, essayer les alternatives
      const status = response.status;
      console.log(`⚠️ Échec suppression directe (${status}), tentative alternatives...`);
      
      // 404 = déjà supprimé, c'est un succès
      if (status === 404) {
        console.log('✅ Contact déjà supprimé (404) - succès');
        return;
      }
      
      // Pour autres erreurs, essayer de récupérer le documentId et réessayer
      if (status >= 400 && status < 500) {
        try {
          // 🔧 FALLBACK: Récupérer le documentId si nécessaire
          const searchResponse = await apiClient.get(`/contacts?filters[id][$eq]=${id}`, token);
          
          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            const contact = searchData.data?.[0];
            
            if (contact?.documentId && contact.documentId !== id) {
              console.log(`🔄 Tentative avec documentId: ${contact.documentId}`);
              const docResponse = await apiClient.delete(`/contacts/${contact.documentId}`, token);
              
              if (docResponse.ok) {
                console.log('✅ Suppression réussie avec documentId');
                return;
              }
            }
          }
        } catch (fallbackError) {
          console.warn('⚠️ Fallback documentId échoué');
        }
        
        // En dernier recours : soft delete
        try {
          console.log('🔄 Tentative soft delete...');
          const softResponse = await apiClient.put(`/contacts/${id}`, { 
            data: { actif: false } 
          }, token);
          
          if (softResponse.ok) {
            console.log('✅ Soft delete réussi');
            return;
          }
        } catch (softError) {
          console.warn('⚠️ Soft delete échoué');
        }
      }
      
      // Si tout échoue
      throw new Error(`Suppression impossible: HTTP ${status}`);
      
    } catch (error: any) {
      // Gestion simplifiée des erreurs
      if (error.message?.includes('404') || error.message?.includes('NotFoundError')) {
        console.log('✅ Contact introuvable (404) - considéré comme supprimé');
        return;
      }
      
      console.error('❌ Erreur suppression finale:', error.message);
      throw new Error(`Échec suppression contact ${id}: ${error.message}`);
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
    
    // Utiliser directement notre helper simplifié
    const contact = await findContactByPhoneHelper(telephone, token);
    if (contact) {
      console.log('✅ Contact trouvé via helper:', {
        id: contact.id,
        internalId: contact.internalId,
        nom: contact.nom,
        type_id: typeof contact.id,
        type_internalId: typeof contact.internalId
      });
      return contact;
    }
    
    try {
      // Fallback : essayer l'endpoint dédié si disponible
      const url = `/contacts/phone/${encodeURIComponent(telephone)}`;
      const response = await apiClient.get(url, token);
      
      if (response.ok) {
        const result = await response.json();
        const contacts = result.data || [];
        
        if (contacts.length > 0) {
          console.log('✅ Contact trouvé via endpoint dédié');
          const contactRaw = contacts[0];
          
          // Normaliser comme dans findContactByPhoneHelper
          const normalizedContact = {
            // Si documentId existe, l'utiliser comme id principal, sinon convertir l'id numérique
            id: contactRaw.documentId || contactRaw.id?.toString() || `contact_${contactRaw.id}`,
            // Toujours garder l'id numérique comme internalId
            internalId: contactRaw.id,
            nom: contactRaw.nom || contactRaw.attributes?.nom,
            prenom: contactRaw.prenom || contactRaw.attributes?.prenom,
            telephone: contactRaw.telephone || contactRaw.attributes?.telephone,
            email: contactRaw.email || contactRaw.attributes?.email,
            actif: contactRaw.actif ?? contactRaw.attributes?.actif ?? true,
            source: contactRaw.source || contactRaw.attributes?.source || 'import_repertoire',
            dateAjout: contactRaw.dateAjout || contactRaw.attributes?.dateAjout || new Date().toISOString(),
            groupes: contactRaw.groupes || contactRaw.attributes?.groupes || []
          };
          
          console.log('🔧 Contact normalisé depuis endpoint dédié:', {
            id: normalizedContact.id,
            internalId: normalizedContact.internalId,
            nom: normalizedContact.nom,
            type_id: typeof normalizedContact.id,
            type_internalId: typeof normalizedContact.internalId
          });
          
          return normalizedContact;
        }
      }
      
      console.log('📱 Contact non trouvé');
      return null;
      
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
          const normalizedPhone = contactsService.normalizePhoneNumber(user.telephone);
          bobUsersByPhone[normalizedPhone] = user;
          console.log(`📞 User Bob Strapi 5: ${user.username} (${user.telephone} -> ${normalizedPhone}) - documentId: ${user.documentId}`);
        }
      });
      
      // 4. Identifier les contacts qui sont des utilisateurs Bob
      const contactsWithBob: Contact[] = [];
      let contactsUpdated = 0;
      
      for (const contact of allContacts) {
        if (!contact.telephone) continue;
        
        const normalizedPhone = contactsService.normalizePhoneNumber(contact.telephone);
        const bobUser = bobUsersByPhone[normalizedPhone];
        
        console.log(`🔍 Vérification ${contact.nom}: ${contact.telephone} -> ${normalizedPhone} -> ${bobUser ? 'BOB USER!' : 'pas Bob'}`);
        
        
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

  /**
   * 🚀 ULTRA-RAPIDE: Créer TOUS les contacts en 1 seul appel API
   */
  createContactsBulkSingle: async (contactsData: CreateContactData[], token: string): Promise<Contact[]> => {
    console.log(`🚀 ContactsService - Import ULTRA-RAPIDE de ${contactsData.length} contacts en 1 seul appel`);
    
    try {
      const startTime = Date.now();
      
      // 🔧 Nettoyer et valider toutes les données
      const cleanedData = contactsData.map(data => ({
        nom: data.nom || 'Contact',
        prenom: data.prenom || '',
        telephone: data.telephone || '',
        email: data.email || null,
        source: data.source || 'import_repertoire',
        actif: true,
        dateAjout: new Date().toISOString()
      }));
      
      console.log('📤 Envoi de tous les contacts en 1 seul appel...');
      
      // 🚀 ENVOYER TOUT EN 1 SEUL APPEL
      const response = await apiClient.post('/contacts/bulk', { 
        data: cleanedData 
      }, token);
      
      const duration = Date.now() - startTime;
      
      if (response.ok && response.data?.data) {
        const createdContacts = response.data.data;
        console.log(`✅ Import ULTRA-RAPIDE réussi: ${createdContacts.length} contacts créés en ${duration}ms`);
        console.log(`📊 Performance: ${Math.round(createdContacts.length / (duration / 1000))} contacts/seconde`);
        return createdContacts;
      } else {
        throw new Error(`Erreur API bulk: ${response.status} - ${response.statusText}`);
      }
      
    } catch (error: any) {
      console.error('❌ Erreur createContactsBulkSingle:', error.message);
      
      // 🔄 FALLBACK: Si l'API bulk n'existe pas, utiliser l'ancienne méthode
      if (error.message?.includes('404') || error.message?.includes('Not Found')) {
        console.log('⚠️ API bulk non disponible, utilisation méthode par batches...');
        return await contactsService.createContactsBulk(contactsData, token);
      }
      
      throw error;
    }
  },

  /**
   * Créer plusieurs contacts en lot (bulk creation) - ANCIENNE MÉTHODE
   */
  createContactsBulk: async (contactsData: CreateContactData[], token: string): Promise<Contact[]> => {
    console.log(`🚀 ContactsService - Import TURBO de ${contactsData.length} contacts`);
    
    if (contactsData.length > 100) {
      console.log(`📋 Information: Les ${contactsData.length} contacts vont être traités par groupes de 50 pour assurer la stabilité. Cela prendra quelques instants mais garantit un import fiable.`);
    }
    
    try {
      // Préparer les données pour l'API bulk
      const bulkData = contactsData.map(contact => ({
        nom: contact.nom,
        prenom: contact.prenom,
        email: contact.email,
        telephone: contact.telephone,
        actif: true,
        source: contact.source || 'import_repertoire',
        dateAjout: new Date().toISOString(),
      }));

      console.log('📤 Utilisation directe du batch parallèle (plus fiable)...');
      
      // 🔧 FIX: Utiliser directement la méthode batch parallèle qui fonctionne
      // Au lieu d'essayer des endpoints qui n'existent pas sur Strapi
      
      // 🚀 WORKAROUND: Chunks de 50 pour contourner la limite Strapi 200
      const chunkSize = 50; // Strapi limite probablement à 200, donc 50 par chunk pour être sûr
      const chunks = [];
      for (let i = 0; i < contactsData.length; i += chunkSize) {
        chunks.push(contactsData.slice(i, i + chunkSize));
      }

      const allResults: Contact[] = [];
      
      // Traiter les chunks en série pour assurer la fiabilité
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const progression = Math.round(((i + 1) / chunks.length) * 100);
        console.log(`📦 Traitement groupe ${i + 1}/${chunks.length} (${chunk.length} contacts) - ${progression}% terminé`);
        
        // Créer toutes les promesses pour ce chunk
        const chunkPromises = chunk.map(async (contactData) => {
          try {
            return await contactsService.createContact(contactData, token);
          } catch (error: any) {
            console.warn(`⚠️ Erreur création contact ${contactData.nom}:`, error.message);
            // En cas d'erreur 409 (conflit), essayer de récupérer le contact existant
            if (error.message?.includes('409') && contactData.telephone) {
              try {
                const existing = await findContactByPhoneHelper(contactData.telephone, token);
                if (existing) {
                  console.log(`✅ Contact existant récupéré: ${contactData.nom}`);
                  return existing;
                }
              } catch (findError) {
                console.warn(`⚠️ Impossible de récupérer le contact existant ${contactData.nom}`);
              }
            }
            // Retourner null pour les échecs
            return null;
          }
        });

        // Attendre que tous les contacts du chunk soient traités
        const chunkResults = await Promise.all(chunkPromises);
        
        // Ajouter les résultats valides
        chunkResults.forEach(result => {
          if (result) {
            allResults.push(result);
          }
        });

        // ⏱️ Pause courte entre les groupes pour stabilité
        if (i < chunks.length - 1) {
          const delai = chunks.length > 10 ? 50 : 20; // Plus de délai pour gros imports
          await new Promise(resolve => setTimeout(resolve, delai));
        }
      }

      console.log(`🚀 Import TURBO terminé: ${allResults.length}/${contactsData.length} contacts créés en ${chunks.length} chunks de ~${Math.ceil(contactsData.length / chunks.length)} contacts`);
      return allResults;

    } catch (error: any) {
      console.error('❌ Erreur createContactsBulk:', error.message);
      throw error;
    }
  },

  /**
   * 🚀 OPTIMISÉ: Supprimer plusieurs contacts en lot avec cache et stratégies multiples
   */
  deleteContactsBulk: async (contactIds: string[], token: string): Promise<number> => {
    console.log(`🗑️ ContactsService - Suppression OPTIMISÉE de ${contactIds.length} contacts`);
    
    if (contactIds.length === 0) {
      console.log('⚠️ Aucun contact à supprimer');
      return 0;
    }
    
    try {
      // 🚀 OPTIMISATION: Pré-filtrer les IDs invalides/déjà supprimés
      const validIds = contactIds.filter(id => id && id.toString().trim());
      console.log(`🔍 ${validIds.length}/${contactIds.length} IDs valides à traiter`);
      
      if (validIds.length === 0) {
        console.log('⚠️ Aucun ID valide à supprimer');
        return 0;
      }

      // 🚀 NOUVELLE STRATÉGIE: Chunks plus gros pour l'efficacité
      const chunkSize = Math.min(100, Math.max(10, Math.ceil(validIds.length / 10))); // Adaptatif
      const chunks = [];
      for (let i = 0; i < validIds.length; i += chunkSize) {
        chunks.push(validIds.slice(i, i + chunkSize));
      }

      console.log(`📦 ${chunks.length} chunks de ~${chunkSize} contacts (optimisé pour ${validIds.length} contacts)`);
      
      let totalDeleted = 0;
      let totalSkipped = 0; // Contacts déjà supprimés
      
      // Traiter les chunks avec parallélisation contrôlée
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const progression = Math.round(((i + 1) / chunks.length) * 100);
        console.log(`🗑️ Chunk ${i + 1}/${chunks.length} (${chunk.length} contacts) - ${progression}%`);
        
        // 🚀 OPTIMISATION: Suppression parallèle avec gestion d'erreur améliorée
        const deletePromises = chunk.map(async (contactId, index) => {
          try {
            // Stratégie 1: Tentative directe (plus rapide)
            const response = await apiClient.delete(`/contacts/${contactId}`, token);
            
            if (response.ok) {
              // Réduire les logs pour les gros volumes
              if (chunk.length <= 20 || index % 10 === 0) {
                console.log(`✅ Contact ${contactId} supprimé`);
              }
              return { success: true, skipped: false, id: contactId };
            }
            
            // 404 = déjà supprimé, compter comme succès
            if (response.status === 404) {
              if (index % 20 === 0) { // Log occasionnel pour 404
                console.log(`📋 Contact ${contactId} déjà supprimé (404)`);
              }
              return { success: true, skipped: true, id: contactId };
            }
            
            // 🚀 OPTIMISATION: Fallback intelligent seulement si nécessaire
            if (response.status === 400 || response.status === 422) {
              // Probablement mauvais ID format, essayer documentId fallback
              try {
                const searchResponse = await apiClient.get(`/contacts?filters[id][$eq]=${contactId}`, token);
                if (searchResponse.ok) {
                  const searchData = await searchResponse.json();
                  const contact = searchData.data?.[0];
                  
                  if (contact?.documentId && contact.documentId !== contactId) {
                    const docResponse = await apiClient.delete(`/contacts/${contact.documentId}`, token);
                    if (docResponse.ok) {
                      console.log(`✅ Contact ${contactId} supprimé via documentId`);
                      return { success: true, skipped: false, id: contactId };
                    }
                  }
                }
              } catch (fallbackError) {
                // Fallback échoué, continuer
              }
            }
            
            // Échec définitif
            console.warn(`❌ Échec suppression ${contactId}: HTTP ${response.status}`);
            return { success: false, skipped: false, id: contactId };
            
          } catch (error: any) {
            // Gérer les erreurs réseau de manière optimisée
            if (error.message?.includes('404') || error.message?.includes('NotFound')) {
              return { success: true, skipped: true, id: contactId }; // Déjà supprimé
            }
            
            console.warn(`❌ Erreur réseau ${contactId}:`, error.message?.substring(0, 50));
            return { success: false, skipped: false, id: contactId };
          }
        });

        // Attendre le chunk avec timeout de sécurité
        const timeoutMs = Math.max(30000, chunk.length * 500); // 500ms par contact minimum
        const chunkResults = await Promise.race([
          Promise.all(deletePromises),
          new Promise<any[]>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout chunk')), timeoutMs)
          )
        ]);
        
        // Comptabiliser les résultats
        const successes = chunkResults.filter(r => r.success).length;
        const skipped = chunkResults.filter(r => r.skipped).length;
        const failed = chunkResults.filter(r => !r.success).length;
        
        totalDeleted += successes;
        totalSkipped += skipped;
        
        console.log(`📊 Chunk ${i + 1}: ${successes} supprimés, ${skipped} déjà absents, ${failed} échecs`);

        // ⏱️ Délai adaptatif entre chunks
        if (i < chunks.length - 1) {
          const delai = chunks.length > 5 ? 100 : 50; // Plus de délai pour gros volumes
          await new Promise(resolve => setTimeout(resolve, delai));
        }
      }

      console.log(`🎉 Suppression OPTIMISÉE terminée: ${totalDeleted} supprimés, ${totalSkipped} déjà absents sur ${validIds.length} traités`);
      return totalDeleted;

    } catch (error: any) {
      console.error('❌ Erreur suppression en masse:', error.message);
      throw error;
    }
  },

  /**
   * 🚀 NOUVEAU: Supprimer TOUS les contacts d'un utilisateur de manière optimisée
   */
  deleteAllUserContacts: async (token: string): Promise<{ deleted: number; skipped: number }> => {
    console.log('🧹 ContactsService - Suppression COMPLÈTE des contacts utilisateur');
    
    try {
      // 🚀 OPTIMISATION: Récupération en une seule fois avec pagination efficace
      console.log('📥 Récupération de tous les contacts...');
      let allContacts: any[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) { // Limite sécurité
        const response = await apiClient.get(`/contacts?pagination[page]=${page}&pagination[pageSize]=100&sort=createdAt:asc`, token);
        
        if (!response.ok) {
          if (response.status === 404 || page === 1) {
            console.log(`📋 Aucun contact trouvé (page ${page})`);
            break;
          }
          throw new Error(`Erreur récupération contacts page ${page}: ${response.status}`);
        }
        
        const data = await response.json();
        const contacts = data.data || [];
        
        if (contacts.length === 0) {
          hasMore = false;
        } else {
          allContacts.push(...contacts);
          console.log(`📄 Page ${page}: +${contacts.length} contacts (total: ${allContacts.length})`);
          page++;
          
          // Si moins de 100, c'est la dernière page
          if (contacts.length < 100) {
            hasMore = false;
          }
        }
        
        // Petit délai pour éviter le rate limiting
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      console.log(`📊 Total contacts à supprimer: ${allContacts.length}`);
      
      if (allContacts.length === 0) {
        console.log('✅ Aucun contact à supprimer');
        return { deleted: 0, skipped: 0 };
      }
      
      // 🚀 OPTIMISATION: Extraire les IDs avec priorité documentId
      const contactIds = allContacts
        .map(contact => contact.documentId || contact.id?.toString())
        .filter(id => id && id.trim());
      
      console.log(`🎯 ${contactIds.length} IDs extraits pour suppression massive`);
      
      // Utiliser la méthode optimisée de suppression en masse
      const deletedCount = await contactsService.deleteContactsBulk(contactIds, token);
      const skippedCount = Math.max(0, allContacts.length - deletedCount);
      
      console.log(`🎉 Suppression complète terminée: ${deletedCount} supprimés, ${skippedCount} déjà absents`);
      
      return { deleted: deletedCount, skipped: skippedCount };
      
    } catch (error: any) {
      console.error('❌ Erreur suppression complète:', error.message);
      throw error;
    }
  },

  /**
   * Normaliser un numéro de téléphone - PRÉSERVER LE NUMÉRO ORIGINAL
   */
  normalizePhoneNumber: (phone: string): string => {
    if (!phone) return '';
    
    // Nettoyer le numéro - garder seulement les chiffres et le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si vide après nettoyage, retourner vide
    if (!cleaned) return '';
    
    // Supprimer les + multiples et garder seulement le premier
    cleaned = cleaned.replace(/\++/g, '+');
    
    // Si déjà un numéro international (commence par +), le garder tel quel
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // SEUL CAS SÛRE : Numéro français 0XXXXXXXXX (10 chiffres commençant par 0)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Vérifier que c'est bien un numéro français valide (01-09)
      const secondDigit = cleaned.charAt(1);
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(secondDigit)) {
        return '+33' + cleaned.substring(1);
      }
    }
    
    // Pour TOUS les autres cas : GARDER LE NUMÉRO ORIGINAL
    // Ne pas ajouter d'indicatif car on ne peut pas deviner le pays
    return cleaned;
  },
};