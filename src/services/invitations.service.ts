// src/services/invitations.service.ts
import { apiClient } from './api';
import { contactsService } from './contacts.service';

export interface InvitationStrapi {
  id: number;
  telephone: string;
  nom: string;
  email?: string;
  statut: 'envoye' | 'accepte' | 'refuse' | 'expire';
  type: 'sms' | 'whatsapp' | 'email';
  codeParrainage: string;
  dateEnvoi: string;
  nombreRelances: number;
  metadata?: any;
}

// Interface pour les invitations d'événements
export interface EventInvitation {
  id: number;
  evenement: {
    id: number;
    titre: string;
    dateDebut: string;
    adresse?: string;
  };
  destinataire: {
    id?: number;
    nom: string;
    telephone: string;
    email?: string;
  };
  statut: 'envoye' | 'vue' | 'accepte' | 'refuse' | 'expire';
  type: 'sms' | 'whatsapp' | 'email' | 'push';
  dateEnvoi: string;
  dateVue?: string;
  dateReponse?: string;
  nombreRelances: number;
  metadata?: {
    groupeOrigine?: string;
    typeInvitation?: 'directe' | 'groupe' | 'publique';
  };
}

// Types pour le ciblage
export interface TargetingCriteria {
  type: 'all' | 'groups' | 'contacts';
  groupes?: string[];
  contacts?: string[];
}

export interface BulkInvitationResult {
  success: number;
  failed: number;
  invitations: EventInvitation[];
  errors: Array<{
    contact: string;
    error: string;
  }>;
}

export const invitationsService = {
  // === INVITATIONS CLASSIQUES (EXISTANT) ===

  // Récupérer toutes mes invitations
  getMyInvitations: async (token: string): Promise<InvitationStrapi[]> => {
    console.log('📨 Récupération invitations Strapi');
    
    try {
      const response = await apiClient.get('/invitations?populate=*', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération invitations');
      }
      
      const result = await response.json();
      console.log('✅ Invitations récupérées:', result.data?.length || 0);
      
      return result.data?.map((item: any) => ({
        // Strapi 5 : utiliser documentId pour les requêtes, garder id numérique pour référence
        id: item.documentId || item.id,
        documentId: item.documentId,
        numericId: item.id,
        telephone: item.telephone,
        nom: item.nom,
        email: item.email,
        statut: item.statut,
        type: item.type,
        codeParrainage: item.codeParrainage,
        dateEnvoi: item.dateEnvoi,
        dateAcceptation: item.dateAcceptation,
        dateRelance: item.dateRelance,
        nombreRelances: item.nombreRelances,
        metadata: item.metadata
      })) || [];
    } catch (error) {
      console.error('❌ Erreur getMyInvitations:', error);
      throw error;
    }
  },

  // Créer une invitation
  createInvitation: async (data: {
    telephone: string;
    nom: string;
    type: 'sms' | 'whatsapp';
  }, token: string): Promise<InvitationStrapi> => {
    console.log('📤 Création invitation Strapi:', data.nom);
    
    try {
      // Générer un code de parrainage unique
      const codeParrainage = `BOB${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const requestData = {
        data: {
          telephone: data.telephone,
          nom: data.nom,
          type: data.type,
          statut: 'envoye',
          codeParrainage,
          dateEnvoi: new Date().toISOString(),
          nombreRelances: 0,
        }
      };
      
      console.log('📋 Données invitation à créer:', requestData);
      
      const response = await apiClient.post('/invitations', requestData, token);
      console.log('📡 Réponse API status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API création invitation:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        // Si une invitation existe déjà (409), utiliser un code temporaire
        if (response.status === 409) {
          console.log('ℹ️ Invitation existe déjà (409), utilisation d\'un code temporaire');
          return {
            id: 0, // ID temporaire
            telephone: requestData.data.telephone,
            nom: requestData.data.nom,
            type: requestData.data.type,
            statut: 'envoye',
            codeParrainage: codeParrainage, // Utiliser le code généré
            dateEnvoi: requestData.data.dateEnvoi,
            nombreRelances: requestData.data.nombreRelances
          };
        }
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `Erreur ${response.status}: ${errorText}`);
        } catch {
          throw new Error(`Erreur ${response.status}: ${errorText}`);
        }
      }
      
      const result = await response.json();
      console.log('📋 Réponse JSON complète:', JSON.stringify(result, null, 2));
      console.log('✅ Invitation créée dans Strapi:', {
        id: result.data?.id,
        codeParrainage: result.data?.attributes?.codeParrainage || codeParrainage
      });
      
      return {
        id: result.data.id,
        codeParrainage: result.data.attributes?.codeParrainage || codeParrainage,
        ...result.data.attributes
      };
    } catch (error: any) {
      console.error('❌ Erreur création invitation:', error);
      console.error('📋 Détails erreur:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      throw error;
    }
  },

  // Relancer une invitation
  relanceInvitation: async (invitationId: number, token: string): Promise<void> => {
    try {
      const response = await apiClient.put(`/invitations/${invitationId}`, {
        data: {
          nombreRelances: { $inc: 1 }, // Incrémenter
          dateRelance: new Date().toISOString(),
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur relance invitation');
      }
      
      console.log('✅ Invitation relancée');
    } catch (error) {
      console.error('❌ Erreur relance:', error);
      throw error;
    }
  },

  // Marquer comme acceptée (quand un contact s'inscrit)
  acceptInvitation: async (telephone: string, token: string): Promise<void> => {
    try {
      // Trouver l'invitation par téléphone
      const response = await apiClient.get(
        `/invitations?filters[telephone][$eq]=${telephone}`,
        token
      );
      
      if (!response.ok) return;
      
      const result = await response.json();
      if (result.data?.length > 0) {
        const invitation = result.data[0];
        
        await apiClient.put(`/invitations/${invitation.id}`, {
          data: {
            statut: 'accepte',
            dateAcceptation: new Date().toISOString(),
          }
        }, token);
        
        console.log('✅ Invitation marquée acceptée');
      }
    } catch (error) {
      console.error('❌ Erreur acceptation:', error);
    }
  },

  // === INVITATIONS D'ÉVÉNEMENTS ===

  // Récupérer les invitations d'un événement
  getEventInvitations: async (eventId: number, token: string): Promise<EventInvitation[]> => {
    console.log('📨 Récupération invitations événement:', eventId);
    
    try {
      const response = await apiClient.get(
        `/event-invitations?filters[evenement][id][$eq]=${eventId}&populate=*`,
        token
      );
      
      if (!response.ok) {
        throw new Error('Erreur récupération invitations événement');
      }
      
      const result = await response.json();
      console.log('✅ Invitations événement récupérées:', result.data?.length || 0);
      
      return result.data?.map((item: any) => ({
        // Strapi 5 : données directement dans item
        id: item.documentId || item.id,
        telephone: item.telephone,
        nom: item.nom,
        email: item.email,
        statut: item.statut,
        type: item.type,
        codeParrainage: item.codeParrainage,
        dateEnvoi: item.dateEnvoi,
        dateAcceptation: item.dateAcceptation,
        dateRelance: item.dateRelance,
        nombreRelances: item.nombreRelances,
        metadata: item.metadata
      })) || [];
    } catch (error) {
      console.error('❌ Erreur getEventInvitations:', error);
      throw error;
    }
  },

  // Envoyer des invitations pour un événement avec ciblage
  sendEventInvitations: async (eventId: number, targeting: TargetingCriteria, token: string): Promise<BulkInvitationResult> => {
    console.log('📤 Envoi invitations événement:', { eventId, targeting });
    
    try {
      const response = await apiClient.post('/event-invitations/bulk', {
        data: {
          evenementId: eventId,
          ciblage: targeting,
          type: 'push', // Type par défaut, peut être configuré
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur envoi invitations événement');
      }
      
      const result = await response.json();
      console.log(`✅ ${result.success} invitations envoyées, ${result.failed} échecs`);
      
      return {
        success: result.success || 0,
        failed: result.failed || 0,
        invitations: result.invitations || [],
        errors: result.errors || []
      };
    } catch (error) {
      console.error('❌ Erreur sendEventInvitations:', error);
      throw error;
    }
  },

  // Répondre à une invitation d'événement
  respondToEventInvitation: async (
    invitationId: number, 
    response: 'accepte' | 'refuse', 
    token: string
  ): Promise<void> => {
    console.log('📝 Réponse invitation événement:', { invitationId, response });
    
    try {
      const apiResponse = await apiClient.put(`/event-invitations/${invitationId}`, {
        data: {
          statut: response,
          dateReponse: new Date().toISOString(),
        }
      }, token);
      
      if (!apiResponse.ok) {
        throw new Error('Erreur réponse invitation');
      }
      
      console.log('✅ Réponse enregistrée');
    } catch (error) {
      console.error('❌ Erreur respondToEventInvitation:', error);
      throw error;
    }
  },

  // Marquer une invitation comme vue
  markEventInvitationAsSeen: async (invitationId: number, token: string): Promise<void> => {
    try {
      const response = await apiClient.put(`/event-invitations/${invitationId}`, {
        data: {
          statut: 'vue',
          dateVue: new Date().toISOString(),
        }
      }, token);
      
      if (!response.ok) return;
      
      console.log('✅ Invitation marquée comme vue');
    } catch (error) {
      console.error('❌ Erreur markEventInvitationAsSeen:', error);
    }
  },

  // Relancer les invitations non répondues
  remindEventInvitations: async (eventId: number, token: string): Promise<number> => {
    console.log('🔔 Relance invitations événement:', eventId);
    
    try {
      const response = await apiClient.post(`/event-invitations/remind`, {
        data: {
          evenementId: eventId,
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur relance invitations');
      }
      
      const result = await response.json();
      const remindersSent = result.remindersSent || 0;
      
      console.log(`✅ ${remindersSent} rappels envoyés`);
      return remindersSent;
    } catch (error) {
      console.error('❌ Erreur remindEventInvitations:', error);
      throw error;
    }
  },

  // Récupérer mes invitations d'événements reçues
  getMyEventInvitations: async (token: string, filters?: {
    statut?: string[];
    dateApres?: string;
  }): Promise<EventInvitation[]> => {
    console.log('📨 Récupération mes invitations événements');
    
    try {
      let url = '/event-invitations/me?populate=*';
      
      if (filters) {
        const params = new URLSearchParams();
        if (filters.statut) {
          params.append('statut', filters.statut.join(','));
        }
        if (filters.dateApres) {
          params.append('dateApres', filters.dateApres);
        }
        url += `&${params.toString()}`;
      }
      
      const response = await apiClient.get(url, token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération invitations événements');
      }
      
      const result = await response.json();
      console.log('✅ Mes invitations événements récupérées:', result.data?.length || 0);
      
      return result.data?.map((item: any) => ({
        // Strapi 5 : données directement dans item
        id: item.documentId || item.id,
        telephone: item.telephone,
        nom: item.nom,
        email: item.email,
        statut: item.statut,
        type: item.type,
        codeParrainage: item.codeParrainage,
        dateEnvoi: item.dateEnvoi,
        dateAcceptation: item.dateAcceptation,
        dateRelance: item.dateRelance,
        nombreRelances: item.nombreRelances,
        metadata: item.metadata
      })) || [];
    } catch (error) {
      console.error('❌ Erreur getMyEventInvitations:', error);
      throw error;
    }
  },

  // Statistiques des invitations d'un événement
  getEventInvitationStats: async (eventId: number, token: string): Promise<{
    total: number;
    envoye: number;
    vue: number;
    accepte: number;
    refuse: number;
    expire: number;
  }> => {
    try {
      const response = await apiClient.get(
        `/event-invitations/stats/${eventId}`,
        token
      );
      
      if (!response.ok) {
        throw new Error('Erreur récupération statistiques invitations');
      }
      
      const result = await response.json();
      return result.stats || {
        total: 0,
        envoye: 0,
        vue: 0,
        accepte: 0,
        refuse: 0,
        expire: 0
      };
    } catch (error) {
      console.error('❌ Erreur getEventInvitationStats:', error);
      return {
        total: 0,
        envoye: 0,
        vue: 0,
        accepte: 0,
        refuse: 0,
        expire: 0
      };
    }
  },

  // === UTILITAIRES CIBLAGE ===

  // Résoudre les destinataires basé sur les critères de ciblage
  resolveTargetContacts: async (targeting: TargetingCriteria, token: string): Promise<Array<{
    nom: string;
    telephone: string;
    email?: string;
    source: 'groupe' | 'contact' | 'all';
    groupeOrigine?: string;
  }>> => {
    console.log('🎯 Résolution des destinataires:', targeting);
    
    try {
      const destinataires: Array<{
        nom: string;
        telephone: string;
        email?: string;
        source: 'groupe' | 'contact' | 'all';
        groupeOrigine?: string;
      }> = [];

      switch (targeting.type) {
        case 'all': {
          // Tous les contacts avec Bob
          const allContacts = await contactsService.getMyContacts(token);
          const validPhones = allContacts.map(c => c.telephone).filter((phone): phone is string => Boolean(phone));
          const bobUsers = await contactsService.checkBobUsers(validPhones, token);
          
          allContacts.forEach(contact => {
            if (contact.telephone && bobUsers[contact.telephone]) {
              destinataires.push({
                nom: `${contact.prenom || ''} ${contact.nom || ''}`.trim(),
                telephone: contact.telephone,
                email: contact.email,
                source: 'all'
              });
            }
          });
          break;
        }

        case 'groups': {
          if (!targeting.groupes?.length) break;
          
          // Récupérer les contacts des groupes sélectionnés
          for (const groupeId of targeting.groupes) {
            try {
              const groupe = await contactsService.getGroupeWithContacts(parseInt(groupeId), token);
              
              if (groupe.membres?.length) {
                const groupePhones = groupe.membres
                  .map(c => c.telephone)
                  .filter((phone): phone is string => Boolean(phone));
                
                if (groupePhones.length > 0) {
                  const bobUsers = await contactsService.checkBobUsers(groupePhones, token);
                  
                  groupe.membres.forEach(contact => {
                    if (contact.telephone && bobUsers[contact.telephone]) {
                      destinataires.push({
                        nom: `${contact.prenom || ''} ${contact.nom || ''}`.trim(),
                        telephone: contact.telephone,
                        email: contact.email,
                        source: 'groupe',
                        groupeOrigine: groupe.nom
                      });
                    }
                  });
                }
              }
            } catch (error) {
              console.warn(`⚠️ Impossible de charger le groupe ${groupeId}:`, error);
            }
          }
          break;
        }

        case 'contacts': {
          if (!targeting.contacts?.length) break;
          
          // Récupérer les contacts spécifiques
          const allContacts = await contactsService.getMyContacts(token);
          const selectedContacts = allContacts.filter(c => 
            targeting.contacts?.includes(c.id.toString())
          );
          
          if (selectedContacts.length > 0) {
            const contactPhones = selectedContacts
              .map(c => c.telephone)
              .filter((phone): phone is string => Boolean(phone));
            
            if (contactPhones.length > 0) {
              const bobUsers = await contactsService.checkBobUsers(contactPhones, token);
              
              selectedContacts.forEach(contact => {
                if (contact.telephone && bobUsers[contact.telephone]) {
                  destinataires.push({
                    nom: `${contact.prenom || ''} ${contact.nom || ''}`.trim(),
                    telephone: contact.telephone,
                    email: contact.email,
                    source: 'contact'
                  });
                }
              });
            }
          }
          break;
        }
      }

      // Dédupliquer par téléphone
      const uniqueDestinataires = destinataires.reduce((acc, current) => {
        const existing = acc.find(d => d.telephone === current.telephone);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, [] as typeof destinataires);

      console.log(`✅ ${uniqueDestinataires.length} destinataires résolus`);
      return uniqueDestinataires;
    } catch (error) {
      console.error('❌ Erreur resolveTargetContacts:', error);
      throw error;
    }
  },

  // Prévisualiser le ciblage (sans envoyer)
  previewTargeting: async (targeting: TargetingCriteria, token: string): Promise<{
    totalContacts: number;
    contacts: Array<{
      nom: string;
      telephone: string;
      source: string;
      groupeOrigine?: string;
    }>;
    groupesSummary?: Record<string, number>;
  }> => {
    try {
      const contacts = await invitationsService.resolveTargetContacts(targeting, token);
      
      const groupesSummary: Record<string, number> = {};
      contacts.forEach(contact => {
        if (contact.groupeOrigine) {
          groupesSummary[contact.groupeOrigine] = (groupesSummary[contact.groupeOrigine] || 0) + 1;
        }
      });

      return {
        totalContacts: contacts.length,
        contacts: contacts.map(c => ({
          nom: c.nom,
          telephone: c.telephone,
          source: c.source,
          groupeOrigine: c.groupeOrigine
        })),
        groupesSummary
      };
    } catch (error) {
      console.error('❌ Erreur previewTargeting:', error);
      throw error;
    }
  },

  // Valider les critères de ciblage
  validateTargeting: (targeting: TargetingCriteria): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];

    if (!targeting.type) {
      errors.push('Type de ciblage requis');
    }

    if (targeting.type === 'groups' && (!targeting.groupes || targeting.groupes.length === 0)) {
      errors.push('Au moins un groupe doit être sélectionné');
    }

    if (targeting.type === 'contacts' && (!targeting.contacts || targeting.contacts.length === 0)) {
      errors.push('Au moins un contact doit être sélectionné');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Supprimer une invitation
  deleteInvitation: async (id: number, token: string): Promise<void> => {
    console.log('🗑️ Suppression invitation:', id);
    
    try {
      // Tester différents endpoints Strapi 5
      const endpoints = [
        `/api/invitations/${id}`,
        `/invitations/${id}`,
        `/api/invitations/document/${id}`,
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
        throw new Error(`Impossible de supprimer l'invitation: ${lastError}`);
      }
      
      console.log('✅ Invitation supprimée:', id);
    } catch (error: any) {
      console.error('❌ Erreur deleteInvitation:', error.message);
      throw error;
    }
  },

  // Simuler l'acceptation d'une invitation (pour les tests)
  simulateAcceptInvitation: async (id: string | number, token: string): Promise<void> => {
    console.log('🎭 Simulation acceptation invitation:', id);
    
    try {
      // 1. Trouver le bon ID numérique si on a un documentId
      console.log('🔍 Recherche du bon ID pour la simulation...');
      const listResponse = await apiClient.get('/invitations', token);
      if (listResponse.ok) {
        const listData = await listResponse.json();
        const matchingInvitation = listData.data?.find(i => i.documentId === id || i.id === id);
        if (matchingInvitation) {
          console.log('🎯 Invitation trouvée pour simulation:', matchingInvitation);
          id = matchingInvitation.id; // Utiliser l'ID numérique
          console.log('🔄 ID final pour simulation:', id);
        }
      }

      // 2. Utiliser la route spécialisée pour la simulation
      const response = await apiClient.post(`/invitations/${id}/simulate-accept`, {}, token);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️ Erreur simulation - Status: ${response.status} - ${errorText}`);
        throw new Error(`Erreur simulation: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Simulation réussie:', result);
      
    } catch (error: any) {
      console.error('❌ Erreur simulateAcceptInvitation:', error.message);
      throw error;
    }
  },
};