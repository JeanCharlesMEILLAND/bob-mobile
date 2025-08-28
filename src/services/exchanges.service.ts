// src/services/exchanges.service.ts
import { apiClient } from './api';
import { realtimeChatService } from './realtime-chat.service';

export interface ExchangeStrapi {
  id: number;
  titre: string;
  description: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  categorie: string;
  dureeJours?: number;
  conditions?: string;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  bobizRecompense: number;
  
  // Relations
  createur: {
    id: number;
    username: string;
    email: string;
  };
  
  // Contacts ciblés (à qui on veut emprunter/prêter)
  contactsCibles?: Array<{
    id: number;
    nom: string;
    prenom?: string;
    telephone: string;
    email?: string;
  }>;

  // 🔗 ARCHITECTURE UNIFIÉE - Origine et lien événement
  origine?: 'direct' | 'evenement';
  evenement?: {
    id: number;
    titre: string;
    dateDebut: string;
  } | null;
  evenementId?: number; // ID simple pour les créations
  
  // Métadonnées
  dateCreation: string;
  dateModification: string;
  metadata?: {
    localisation?: string;
    urgence?: 'basse' | 'normale' | 'haute';
    images?: string[];
    // Métadonnées événement
    besoinOriginal?: {
      id: string;
      titre: string;
      type: string;
    };
  };
}

export interface CreateExchangeData {
  titre: string;
  description: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  dureeJours?: number;
  conditions?: string;
  bobizRecompense?: number; // Sera mappé vers bobizGagnes
  statut?: 'actif' | 'en_cours' | 'termine' | 'annule';
  contactsCibles?: number[]; // IDs des contacts ciblés (legacy)
  contactsCiblesTelephones?: string[]; // Téléphones des contacts ciblés (nouveau)

  // 🔗 ARCHITECTURE UNIFIÉE - Support création depuis événement
  origine?: 'direct' | 'evenement';
  evenementId?: number; // ID de l'événement parent
  metadata?: {
    localisation?: string;
    urgence?: 'basse' | 'normale' | 'haute';
    images?: string[];
    // Métadonnées événement
    besoinOriginal?: {
      id: string;
      titre: string;
      type: string;
    };
  };
}

export interface UpdateExchangeData {
  titre?: string;
  description?: string;
  statut?: 'actif' | 'en_cours' | 'termine' | 'annule';
  conditions?: string;
  contactsCibles?: number[];
}

export interface ExchangeFilters {
  type?: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  statut?: 'actif' | 'en_cours' | 'termine' | 'annule';
  createur?: number;
  contactCible?: number;
  dateApres?: string;
  search?: string;
  // Retiré: categorie (n'existe pas dans Strapi)
}

export const exchangesService = {
  // === CRUD PRINCIPAL ===

  // Créer un échange
  createExchange: async (data: CreateExchangeData, token: string): Promise<ExchangeStrapi> => {
    console.log('📝 Création échange Strapi:', data.titre);
    console.log('🔑 Token utilisé:', token ? `${token.substring(0, 20)}...` : 'AUCUN');
    console.log('📤 Données envoyées:', JSON.stringify(data, null, 2));
    
    try {
      // Préparer les données compatibles avec le modèle Strapi
      const exchangePayload = {
        titre: data.titre,
        description: data.description,
        type: data.type,
        statut: data.statut || 'actif', // Utiliser statut fourni ou 'actif' par défaut
        dureeJours: data.dureeJours || null,
        conditions: data.conditions || null,
        bobizGagnes: data.bobizRecompense || 10, // Mapping: bobizRecompense → bobizGagnes
        // Retirer les champs non supportés: categorie, dateCreation, dateModification
      };

      // Si on a des téléphones, les envoyer aussi (si supporté par Strapi)
      if (data.contactsCiblesTelephones) {
        // exchangePayload.contactsCiblesTelephones = data.contactsCiblesTelephones;
        console.log('📞 Contacts ciblés par téléphone (non envoyés pour l\'instant):', data.contactsCiblesTelephones);
      }

      console.log('📦 Payload final compatible Strapi:', JSON.stringify(exchangePayload, null, 2));

      // Utiliser directement l'endpoint qui fonctionne
      console.log('🔄 Envoi vers /api/echanges...');
      
      const response = await apiClient.post('/api/echanges', {
        data: exchangePayload
      }, token);

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`❌ Erreur ${response.status}:`, errorText);
        throw new Error(`Erreur création Bob: ${response.status} - ${errorText}`);
      }

      
      const result = await response.json();
      console.log('✅ Bob créé avec succès dans Strapi!');
      console.log('📄 Détails:', JSON.stringify(result, null, 2));
      
      // Format standard Strapi v4
      if (result.data) {
        return {
          id: result.data.id,
          documentId: result.data.documentId,
          ...result.data,
          // Mapper de retour bobizGagnes → bobizRecompense pour compatibilité
          bobizRecompense: result.data.bobizGagnes
        };
      } else {
        // Format inattendu mais on tente de l'utiliser
        console.warn('⚠️ Format de réponse inattendu, adaptation...');
        return {
          id: result.id || Date.now(),
          ...result
        };
      }
    } catch (error: any) {
      console.error('❌ Erreur création échange:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  },

  // Récupérer mes échanges
  getMyExchanges: async (token: string, filters?: ExchangeFilters): Promise<ExchangeStrapi[]> => {
    console.log('📊 Récupération mes échanges');
    console.log('🔑 Token pour récupération:', token ? `${token.substring(0, 20)}...` : 'AUCUN');
    
    try {
      // Tester différents endpoints pour récupérer les échanges
      const endpoints = [
        '/api/echanges?populate=*',
        '/echanges?populate=*',
        '/api/exchanges?populate=*',
        '/exchanges?populate=*',
        '/api/echanges',
        '/echanges'
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Tentative récupération ${endpoint}...`);
          
          response = await apiClient.get(endpoint, token);
          
          if (response.ok) {
            console.log(`✅ Succès récupération avec ${endpoint}`);
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
        console.error('❌ Tous les endpoints de récupération ont échoué');
        console.error('❌ Dernière erreur:', lastError);
        throw new Error(`Impossible de récupérer les échanges: ${lastError}`);
      }
      
      const result = await response.json();
      console.log('✅ Réponse brute récupérée:', JSON.stringify(result, null, 2));
      
      let exchanges = [];
      
      // Gérer différents formats de réponse
      if (result.data && Array.isArray(result.data)) {
        // Format Strapi v4 standard
        exchanges = result.data.map((item: any) => ({
          // Strapi 5 : données directement dans item
          id: item.documentId || item.id,
          titre: item.titre,
          description: item.description,
          type: item.type,
          statut: item.statut,
          dateCreation: item.dateCreation,
          dateExpiration: item.dateExpiration,
          localisation: item.localisation,
          images: item.images,
          tags: item.tags,
          valeur: item.valeur,
          devise: item.devise,
          auteur: item.auteur,
          participants: item.participants
        }));
      } else if (Array.isArray(result)) {
        // Format direct array
        exchanges = result;
      } else if (result.data && !Array.isArray(result.data)) {
        // Format avec data mais pas array
        exchanges = [result.data];
      } else {
        // Format inattendu
        console.warn('⚠️ Format de réponse inattendu pour getMyExchanges:', result);
        exchanges = [];
      }
      
      console.log('✅ Échanges récupérés et formatés:', exchanges.length);
      console.log('📋 Liste des échanges:', exchanges.map((e: any) => ({ id: e.id, titre: e.titre, type: e.type })));
      
      return exchanges;
    } catch (error: any) {
      console.error('❌ Erreur getMyExchanges:', error);
      console.error('❌ Stack trace:', error.stack);
      return []; // Retourner array vide plutôt que throw pour éviter crash
    }
  },

  // Récupérer les échanges disponibles (où je suis ciblé)
  getAvailableExchanges: async (token: string, filters?: ExchangeFilters): Promise<ExchangeStrapi[]> => {
    console.log('🔍 Récupération échanges disponibles');
    
    try {
      let url = '/exchanges/available?populate=*';
      
      if (filters) {
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if ((filters as any).categorie) params.append('categorie', (filters as any).categorie);
        if (filters.search) params.append('search', filters.search);
        
        if (params.toString()) {
          url += `&${params.toString()}`;
        }
      }
      
      const response = await apiClient.get(url, token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération échanges disponibles');
      }
      
      const result = await response.json();
      console.log('✅ Échanges disponibles:', result.data?.length || 0);
      
      return result.data?.map((item: any) => ({
        id: item.documentId || item.id,
        titre: item.titre,
        description: item.description,
        type: item.type,
        categorie: item.categorie,
        dureeJours: item.dureeJours,
        conditions: item.conditions,
        statut: item.statut,
        bobizRecompense: item.bobizGagnes || item.bobizRecompense,
        createur: item.createur,
        contactsCibles: item.contactsCibles,
        dateCreation: item.dateCreation,
        dateModification: item.dateModification,
        metadata: item.metadata
      })) || [];
    } catch (error: any) {
      console.error('❌ Erreur getAvailableExchanges:', error);
      throw error;
    }
  },

  // Mettre à jour un échange
  updateExchange: async (exchangeId: number, data: UpdateExchangeData, token: string): Promise<ExchangeStrapi> => {
    console.log('✏️ Mise à jour échange:', exchangeId);
    
    try {
      const response = await apiClient.put(`/exchanges/${exchangeId}`, {
        data: {
          ...data,
          dateModification: new Date().toISOString(),
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur mise à jour échange');
      }
      
      const result = await response.json();
      console.log('✅ Échange mis à jour');
      
      return {
        id: result.data.id,
        ...result.data.attributes
      };
    } catch (error: any) {
      console.error('❌ Erreur updateExchange:', error);
      throw error;
    }
  },

  // Supprimer un échange
  deleteExchange: async (exchangeId: number, token: string): Promise<void> => {
    console.log('🗑️ Suppression échange:', exchangeId);
    
    try {
      // Tester différents endpoints Strapi 5
      const endpoints = [
        `/api/echanges/${exchangeId}`,
        `/echanges/${exchangeId}`,
        `/api/exchanges/${exchangeId}`,
        `/exchanges/${exchangeId}`,
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
        throw new Error(`Impossible de supprimer l'échange: ${lastError}`);
      }
      
      console.log('✅ Échange supprimé');
    } catch (error: any) {
      console.error('❌ Erreur deleteExchange:', error);
      throw error;
    }
  },

  // === INTERACTIONS ===

  // Répondre à un échange (accepter/refuser)
  respondToExchange: async (
    exchangeId: number, 
    response: 'accepte' | 'refuse', 
    token: string,
    message?: string
  ): Promise<void> => {
    console.log('💬 Réponse à échange:', { exchangeId, response });
    
    try {
      const apiResponse = await apiClient.post(`/exchanges/${exchangeId}/respond`, {
        data: {
          response,
          message,
          dateReponse: new Date().toISOString(),
        }
      }, token);
      
      if (!apiResponse.ok) {
        throw new Error('Erreur réponse échange');
      }
      
      console.log('✅ Réponse enregistrée');
    } catch (error: any) {
      console.error('❌ Erreur respondToExchange:', error);
      throw error;
    }
  },

  // Marquer un échange comme terminé
  completeExchange: async (exchangeId: number, token: string, rating?: number, comment?: string): Promise<void> => {
    console.log('✅ Finalisation échange:', exchangeId);
    
    try {
      const response = await apiClient.post(`/exchanges/${exchangeId}/complete`, {
        data: {
          statut: 'termine',
          dateTerminaison: new Date().toISOString(),
          evaluation: rating ? {
            note: rating,
            commentaire: comment
          } : undefined
        }
      }, token);
      
      if (!response.ok) {
        throw new Error('Erreur finalisation échange');
      }
      
      console.log('✅ Échange finalisé');
    } catch (error: any) {
      console.error('❌ Erreur completeExchange:', error);
      throw error;
    }
  },

  // === STATISTIQUES ===

  // Récupérer les statistiques d'échanges
  getExchangeStats: async (token: string): Promise<{
    totalExchanges: number;
    activeExchanges: number;
    completedExchanges: number;
    totalBobizEarned: number;
    myOffers: number;
    myRequests: number;
    successRate: number;
  }> => {
    try {
      const response = await apiClient.get('/exchanges/stats', token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération statistiques');
      }
      
      const result = await response.json();
      return result.stats || {
        totalExchanges: 0,
        activeExchanges: 0,
        completedExchanges: 0,
        totalBobizEarned: 0,
        myOffers: 0,
        myRequests: 0,
        successRate: 0
      };
    } catch (error: any) {
      console.error('❌ Erreur getExchangeStats:', error);
      return {
        totalExchanges: 0,
        activeExchanges: 0,
        completedExchanges: 0,
        totalBobizEarned: 0,
        myOffers: 0,
        myRequests: 0,
        successRate: 0
      };
    }
  },

  // === ARCHITECTURE UNIFIÉE - SUPPORT ÉVÉNEMENTS ===

  /**
   * Créer un BOB depuis un besoin d'événement
   */
  createFromEventNeed: async (
    besoinData: {
      id: string;
      titre: string;
      description: string;
      type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
    },
    eventData: {
      id: string;
      titre: string;
      dateDebut: string;
    },
    token: string
  ): Promise<ExchangeStrapi> => {
    console.log('🎯 Création BOB depuis besoin événement:', besoinData.titre);

    const bobType = besoinData.type === 'objet' ? 'pret' : 'service_offert';
    
    const createData: CreateExchangeData = {
      titre: `${besoinData.titre} - ${eventData.titre}`,
      description: `${besoinData.description}\n\n🎯 Issu de l'événement "${eventData.titre}"\n📅 ${new Date(eventData.dateDebut).toLocaleDateString('fr-FR')}`,
      type: bobType,
      bobizRecompense: exchangesService.calculateBobizForNeed(besoinData),
      statut: 'actif',
      origine: 'evenement',
      evenementId: parseInt(eventData.id),
      metadata: {
        besoinOriginal: {
          id: besoinData.id,
          titre: besoinData.titre,
          type: besoinData.type
        }
      }
    };

    return exchangesService.createExchange(createData, token);
  },

  /**
   * Récupérer tous les BOB issus d'événements
   */
  getEventRelatedExchanges: async (token: string, eventId?: string): Promise<ExchangeStrapi[]> => {
    console.log('📋 Récupération BOB liés aux événements');
    
    try {
      let url = '/echanges?populate=*&filters[origine][$eq]=evenement';
      if (eventId) {
        url += `&filters[evenementId][$eq]=${eventId}`;
      }

      const response = await apiClient.get(url, token);
      
      if (!response.ok) {
        throw new Error('Erreur récupération BOB événements');
      }

      const result = await response.json();
      const exchanges = result.data || [];

      console.log(`✅ ${exchanges.length} BOB liés aux événements récupérés`);
      return exchanges.map((item: any) => ({
        ...item,
        id: item.id || item.documentId,
        origine: item.origine || 'evenement',
        evenement: item.evenement,
        metadata: item.metadata
      }));
    } catch (error: any) {
      console.error('❌ Erreur getEventRelatedExchanges:', error);
      return [];
    }
  },

  /**
   * Synchroniser le statut d'un BOB avec le besoin d'événement correspondant
   */
  syncBobStatusToBesoin: async (
    bobId: number, 
    newStatus: 'actif' | 'en_cours' | 'termine' | 'annule',
    token: string
  ): Promise<void> => {
    console.log('🔄 Synchronisation BOB → Besoin événement:', bobId);

    try {
      // 1. Récupérer le BOB pour vérifier s'il vient d'un événement
      const bob = await exchangesService.getExchange(bobId, token);
      
      if (!bob.evenementId || bob.origine !== 'evenement') {
        console.log('ℹ️ BOB non lié à un événement, pas de synchronisation');
        return;
      }

      // 2. Appeler l'API événements pour synchroniser
      await apiClient.post(`/evenements/${bob.evenementId}/sync-besoin`, {
        data: {
          bobId: bobId,
          besoinId: bob.metadata?.besoinOriginal?.id,
          newStatus: newStatus
        }
      }, token);

      console.log('✅ Synchronisation BOB → Événement réussie');
    } catch (error: any) {
      console.error('❌ Erreur synchronisation BOB → Événement:', error);
      // Ne pas faire échouer l'opération principale
    }
  },

  /**
   * Calculer les BOBIZ pour un besoin d'événement
   */
  calculateBobizForNeed: (besoin: { type: string; quantite?: any; maxPersonnes?: number }): number => {
    let baseBobiz = 10;
    
    if (besoin.type === 'service_collectif') baseBobiz = 15;
    if (besoin.type === 'service_timing') baseBobiz = 20;
    if (besoin.quantite && besoin.quantite.demandee > 1) baseBobiz += besoin.quantite.demandee * 2;
    if (besoin.maxPersonnes && besoin.maxPersonnes > 2) baseBobiz += (besoin.maxPersonnes - 2) * 5;
    
    return baseBobiz;
  },

  /**
   * Obtenir l'icône pour un type de besoin
   */
  getBesoinIcon: (type: string): string => {
    switch (type) {
      case 'objet': return '📦';
      case 'service_individuel': return '👤';
      case 'service_collectif': return '👥';
      case 'service_timing': return '⏰';
      default: return '📦';
    }
  },
};