// src/services/events.service.ts
import { apiClient as api } from './api';
import { 
  BobEvent, 
  BesoinEvenement, 
  PostCreationInvitation, 
  SmartInvitationTarget,
  InvitationTrackingData 
} from '../types/events.extended.types';
import { ErrorHandler, withErrorHandling, withRetry } from '../utils/error-handler';

export interface EventNeed {
  id: string;
  type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
  titre: string;
  description: string;
  quantite?: number;
  maxPersonnes?: number;
  timing?: 'avant' | 'pendant' | 'apres';
  isCreatorPositioned?: boolean;
  assignations?: Array<{
    participant: string;
    participant_id: number;
    bob_individuel_id?: number;
    assigné_le: string;
  }>;
}

export interface CreateEventRequest {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  adresse?: string;
  maxParticipants?: number;
  bobizRecompense: number;
  besoins: EventNeed[];
  ciblage: {
    type: 'all' | 'groups' | 'contacts';
    groupes?: string[];
    contacts?: string[];
  };
}

export interface Event {
  id: number;
  documentId: string;
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  adresse?: string;
  maxParticipants?: number;
  bobizRecompense: number;
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  createur: number;
  besoins?: EventNeed[];
  participants?: Array<{
    id: number;
    username: string;
  }>;
  dateCreation: string;
}

export interface BobIndividuel {
  id: number;
  documentId: string;
  titre: string;
  description: string;
  type: 'pret' | 'service_offert' | 'service_demande' | 'emprunt';
  bobizGagnes: number;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  createur: number;
  demandeur?: number;
  dateCreation: string;
  
  // 🔗 Champs Architecture Unifiée
  origine: 'direct' | 'evenement';
  evenement?: number; // ID de l'événement source si origine = 'evenement'
  metadata?: {
    besoinOriginal?: {
      id: string;
      titre: string;
      type: string;
      eventId: number;
    };
    quantiteProposee?: number;
    commentaire?: string;
  };
}

class EventsService {
  /**
   * Mettre à jour un événement complet
   */
  async updateEvent(eventId: string, eventData: Partial<CreateEventRequest>, token: string): Promise<Event> {
    try {
      console.log('🔄 Mise à jour événement:', eventId);
      
      const response = await api.put(`/evenements/${eventId}`, {
        data: {
          titre: eventData.titre,
          description: eventData.description,
          dateDebut: eventData.dateDebut,
          dateFin: eventData.dateFin,
          adresse: eventData.adresse,
          maxParticipants: eventData.maxParticipants,
          bobizRecompense: eventData.bobizRecompense,
          metadata: {
            besoins: eventData.besoins,
            ciblage: eventData.ciblage
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const event = response.data.data;
      console.log('✅ Événement mis à jour:', event.id);
      
      return {
        ...event,
        besoins: eventData.besoins
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour événement:', error.response?.data || error.message);
      throw new Error('Impossible de mettre à jour l\'événement');
    }
  }

  /**
   * Supprimer un événement
   */
  async deleteEvent(eventId: string, token: string): Promise<void> {
    try {
      console.log('🗑️ Suppression événement:', eventId);
      
      await api.delete(`/evenements/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('✅ Événement supprimé avec succès');
    } catch (error: any) {
      console.error('❌ Erreur suppression événement:', error.response?.data || error.message);
      throw new Error('Impossible de supprimer l\'événement');
    }
  }

  /**
   * Accepter une invitation à un événement
   */
  async acceptInvitation(eventId: string, token: string): Promise<void> {
    try {
      console.log('✅ Acceptation invitation événement:', eventId);
      
      await api.post(`/evenements/${eventId}/accept`, {
        data: {
          dateAcceptation: new Date().toISOString(),
          statut: 'accepte'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Invitation acceptée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur acceptation invitation:', error.response?.data || error.message);
      throw new Error('Impossible d\'accepter l\'invitation');
    }
  }

  /**
   * Récupérer les événements auxquels l'utilisateur participe
   */
  async getParticipatingEvents(token: string): Promise<Event[]> {
    try {
      console.log('📋 Récupération événements participation...');
      
      const response = await api.get('/evenements/participating?populate=*', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const events = response.data?.data || response.data || [];
      return events.map((event: any) => ({
        ...event,
        besoins: (event as any).metadata?.besoins || []
      }));
    } catch (error: any) {
      console.error('❌ Erreur récupération événements participation:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Refuser une invitation à un événement
   */
  async declineInvitation(eventId: string, token: string, raison?: string): Promise<void> {
    try {
      console.log('❌ Refus invitation événement:', eventId);
      
      await api.post(`/evenements/${eventId}/decline`, {
        data: {
          dateRefus: new Date().toISOString(),
          statut: 'refuse',
          raison: raison || ''
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Invitation refusée avec succès');
    } catch (error: any) {
      console.error('❌ Erreur refus invitation:', error.response?.data || error.message);
      throw new Error('Impossible de refuser l\'invitation');
    }
  }

  /**
   * Vérifier si l'utilisateur actuel est l'organisateur
   */
  async isOrganisateur(event: Event, token: string): Promise<boolean> {
    try {
      // Récupérer les données utilisateur depuis l'API
      const userResponse = await api.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return event.createur === userResponse.data.id;
    } catch (error) {
      console.error('❌ Erreur vérification organisateur:', error);
      return false;
    }
  }

  /**
   * Vérifier si l'utilisateur a déjà accepté l'événement
   */
  async hasAcceptedEvent(eventId: string, token: string): Promise<boolean> {
    try {
      const response = await api.get(`/evenements/${eventId}/participation`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data?.statut === 'accepte';
    } catch (error) {
      console.error('❌ Erreur vérification acceptation:', error);
      return false;
    }
  }
  /**
   * Créer un événement BOB Collectif
   */
  async createEvent(eventData: CreateEventRequest, token: string): Promise<Event> {
    try {
      console.log('🎯 Création événement BOB Collectif:', eventData.titre);
      
      const response = await api.post('/evenements', {
        data: {
          titre: eventData.titre,
          description: eventData.description,
          dateDebut: eventData.dateDebut,
          dateFin: eventData.dateFin,
          adresse: eventData.adresse,
          maxParticipants: eventData.maxParticipants,
          bobizRecompense: eventData.bobizRecompense,
          statut: 'planifie',
          dateCreation: new Date().toISOString(),
          metadata: {
            besoins: eventData.besoins,
            ciblage: eventData.ciblage,
            bobsIndividuelsCreés: [],
            type: 'bob_collectif'
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const event = response.data.data;
      console.log('✅ Événement créé:', event.id);
      
      return {
        ...event,
        besoins: eventData.besoins
      };
    } catch (error: any) {
      console.error('❌ Erreur création événement:', error.response?.data || error.message);
      const bobError = ErrorHandler.handleApiError(error, 'création événement');
      throw bobError;
    }
  }

  /**
   * Récupérer les événements à venir
   */
  async getUpcomingEvents(token: string): Promise<Event[]> {
    try {
      const allEvents = await this.getEvents(token);
      const now = new Date();
      return allEvents.filter(event => 
        event.statut === 'planifie' && new Date(event.dateDebut) >= now
      );
    } catch (error: any) {
      console.error('❌ Erreur récupération événements à venir:', error.message);
      return [];
    }
  }

  /**
   * Récupérer la liste des événements
   */
  async getEvents(token: string): Promise<Event[]> {
    try {
      const response = await api.get('/evenements?populate=*', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const events = response.data?.data || response.data || [];
      return events.map((event: any) => ({
        ...event,
        besoins: (event as any).metadata?.besoins || []
      }));
    } catch (error: any) {
      console.error('❌ Erreur récupération événements:', error.response?.data || error.message);
      const bobError = ErrorHandler.handleApiError(error, 'récupération événements');
      throw bobError;
    }
  }

  /**
   * Récupérer un événement par ID
   */
  async getEvent(eventId: string, token: string): Promise<Event | null> {
    try {
      const response = await api.get(`/evenements/${eventId}?populate=*`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const event = response.data.data;
      return {
        ...event,
        besoins: (event as any).metadata?.besoins || []
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération événement:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Se positionner sur un besoin (créer BOB individuel)
   */
  async positionnerSurBesoin(
    eventId: string, 
    besoinId: string, 
    token: string,
    quantiteProposee: number = 1,
    commentaire: string = ""
  ): Promise<{ bobIndividuel: any; message: string; activityData?: any }> {
    try {
      console.log('🎯 Positionnement sur besoin via API unifiée:', besoinId);
      
      // Utiliser l'endpoint unifié Strapi qui gère tout automatiquement
      const response = await api.post(`/evenements/${eventId}/besoins/${besoinId}/position`, {
        quantiteProposee,
        commentaire
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = response.data;
      const { bobIndividuel, besoin } = result;

      console.log('✅ Positionnement confirmé via API unifiée:', bobIndividuel.id);

      // Récupérer l'événement pour générer les données d'activité
      const event = await this.getEvent(eventId, token);

      // 🎯 Envoyer message automatique dans le chat de groupe
      try {
        const { chatService } = await import('./chat.service');
        const userResponse = await api.get('/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        await chatService.sendEventAutoMessage(`event_${eventId}`, 'positioning', {
          participantName: userResponse.data.username || 'Un participant',
          besoinTitre: besoin?.titre || 'Un besoin',
          bobizGagnes: bobIndividuel.bobizGagnes || 0
        });
      } catch (chatError) {
        console.log('⚠️ Message chat non envoyé:', chatError);
      }
      
      return {
        bobIndividuel,
        message: result.message || `Positionnement confirmé sur "${besoin?.titre}"`,
        activityData: event ? {
          id: bobIndividuel.id,
          emoji: this.getBesoinIcon(besoin?.type || 'objet'),
          title: `${besoin?.titre || 'Besoin'} - ${event.titre}`,
          person: event.organisateur?.nom || 'Organisateur',
          personColor: '#EC4899',
          date: new Date().toLocaleDateString(),
          type: besoin?.type === 'objet' ? 'pret' : 'service',
          typeColor: besoin?.type === 'objet' ? '#F59E0B' : '#059669',
          badge: 'actif',
          badgeColor: '#10B981',
          isFromEvent: true,
          eventId: event.id,
          eventTitle: event.titre
        } : undefined
      };
    } catch (error: any) {
      console.error('❌ Erreur positionnement API unifiée:', error.response?.data || error.message);
      const bobError = ErrorHandler.handleApiError(error, 'positionnement sur besoin');
      throw bobError;
    }
  }

  /**
   * Récupérer les BOB individuels créés depuis un événement
   * Utilise l'endpoint unifié Strapi
   */
  async getBobsFromEvent(eventId: string, token: string): Promise<any[]> {
    try {
      console.log('🔍 Récupération BOBs événement via API unifiée:', eventId);
      
      // Utiliser l'endpoint unifié Strapi 
      const response = await api.get(`/evenements/${eventId}/bobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = response.data;
      console.log(`✅ ${result.count} BOB(s) récupérés depuis l'événement ${eventId}`);
      
      return result.bobs || [];
    } catch (error: any) {
      console.error('❌ Erreur récupération BOBs événement:', error.response?.data || error.message);
      const bobError = ErrorHandler.handleApiError(error, 'récupération BOBs événement');
      // Pour cette méthode, on retourne un tableau vide plutôt que de throw
      ErrorHandler.logError(bobError, { eventId });
      return [];
    }
  }

  private getBesoinIcon(type: EventNeed['type']): string {
    switch (type) {
      case 'objet': return '📦';
      case 'service_individuel': return '👤';
      case 'service_collectif': return '👥';
      case 'service_timing': return '⏰';
      default: return '📦';
    }
  }

  private calculateBobizForBesoin(besoin: EventNeed): number {
    // Calcul intelligent des BOBIZ selon le type et complexité
    let baseBobiz = 10;
    
    if (besoin.type === 'service_collectif') baseBobiz = 15;
    if (besoin.type === 'service_timing') baseBobiz = 20;
    if (besoin.quantite && besoin.quantite > 1) baseBobiz += besoin.quantite * 2;
    if (besoin.maxPersonnes && besoin.maxPersonnes > 2) baseBobiz += (besoin.maxPersonnes - 2) * 5;
    
    return baseBobiz;
  }

  /**
   * Uploader une photo pour l'événement
   */
  async uploadEventPhoto(photoUri: string, token: string): Promise<string> {
    try {
      console.log('📸 Upload photo événement:', photoUri);
      
      const formData = new FormData();
      formData.append('files', {
        uri: photoUri,
        type: 'image/jpeg',
        name: `event_${Date.now()}.jpg`
      } as any);

      const response = await api.post('/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const uploadedFiles = response.data;
      const photoUrl = uploadedFiles[0]?.url;
      
      console.log('✅ Photo uploadée:', photoUrl);
      return photoUrl;
    } catch (error: any) {
      console.error('❌ Erreur upload photo:', error);
      const bobError = ErrorHandler.handleApiError(error, 'upload photo événement');
      throw bobError;
    }
  }

  /**
   * Créer un événement BOB complet avec photo et lieu
   */
  async createBobEvent(eventData: Partial<BobEvent>, token: string): Promise<BobEvent> {
    try {
      console.log('🎯 Création événement BOB complet:', eventData.titre);
      
      const response = await api.post('/evenements', {
        data: {
          titre: eventData.titre,
          description: eventData.description,
          photo: eventData.photo,
          dateDebut: eventData.dateDebut,
          dateFin: eventData.dateFin,
          lieu: eventData.lieu,
          maxParticipants: eventData.maxParticipants,
          bobizRecompense: eventData.bobizRecompense,
          statut: 'planifie',
          dateCreation: new Date().toISOString(),
          metadata: {
            besoins: eventData.besoins || [],
            ciblage: eventData.metadata?.ciblage,
            bobsIndividuelsCreés: [],
            type: 'bob_collectif'
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const event = response.data.data;
      console.log('✅ Événement BOB complet créé:', event.id);
      
      return {
        ...event,
        besoins: eventData.besoins || []
      };
    } catch (error: any) {
      console.error('❌ Erreur création événement BOB:', error.response?.data || error.message);
      const bobError = ErrorHandler.handleApiError(error, 'création événement BOB');
      throw bobError;
    }
  }

  /**
   * Mettre à jour un besoin d'événement
   */
  async updateBesoinEvenement(
    eventId: string, 
    besoinId: string, 
    updates: Partial<BesoinEvenement>,
    token: string
  ): Promise<BesoinEvenement> {
    try {
      console.log('🔄 Mise à jour besoin:', besoinId);
      
      // Récupérer l'événement actuel
      const event = await this.getEvent(eventId, token);
      if (!event) {
        throw new Error('Événement non trouvé');
      }

      // Mettre à jour le besoin dans la liste
      const updatedBesoins = event.besoins?.map(besoin => {
        if (besoin.id === besoinId) {
          return { ...besoin, ...updates };
        }
        return besoin;
      }) || [];

      // Sauvegarder l'événement
      await api.put(`/evenements/${event.documentId}`, {
        data: {
          metadata: {
            ...(event as any).metadata,
            besoins: updatedBesoins
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const updatedBesoin = updatedBesoins.find(b => b.id === besoinId);
      if (!updatedBesoin) {
        throw new Error('Besoin non trouvé après mise à jour');
      }

      console.log('✅ Besoin mis à jour');
      return updatedBesoin;
    } catch (error: any) {
      console.error('❌ Erreur mise à jour besoin:', error);
      const bobError = ErrorHandler.handleApiError(error, 'mise à jour besoin');
      throw bobError;
    }
  }

  /**
   * Gérer les quantités flexibles d'un besoin
   */
  async gererQuantiteFlexible(
    eventId: string,
    besoinId: string,
    quantiteProposee: number,
    participantId: number,
    token: string
  ): Promise<{ accepte: boolean; quantiteAcceptee: number; message: string }> {
    try {
      const event = await this.getEvent(eventId, token);
      if (!event) {
        throw new Error('Événement non trouvé');
      }

      const besoin = event.besoins?.find(b => b.id === besoinId);
      if (!besoin) {
        throw new Error('Besoin non trouvé');
      }

      let quantiteAcceptee = quantiteProposee;
      let accepte = true;
      let message = '';

      if (besoin.quantite) {
        const { demandee, flexible, min, max } = besoin.quantite;
        
        if (flexible) {
          // Vérifier les limites si définies
          if (min && quantiteProposee < min) {
            quantiteAcceptee = min;
            message = `Quantité ajustée au minimum requis: ${min}`;
          } else if (max && quantiteProposee > max) {
            quantiteAcceptee = max;
            message = `Quantité ajustée au maximum accepté: ${max}`;
          } else {
            message = `Quantité flexible acceptée: ${quantiteProposee}`;
          }
        } else {
          // Quantité fixe
          if (quantiteProposee !== demandee) {
            accepte = false;
            message = `Quantité exacte requise: ${demandee}`;
            quantiteAcceptee = demandee;
          } else {
            message = `Quantité exacte acceptée: ${demandee}`;
          }
        }
      }

      return { accepte, quantiteAcceptee, message };
    } catch (error: any) {
      console.error('❌ Erreur gestion quantité flexible:', error);
      throw error;
    }
  }

  // =================== NOUVEAUX ENDPOINTS UNIFIÉS ===================

  /**
   * Se positionner sur un besoin d'événement (création automatique BOB)
   */
  async positionnerSurBesoin(
    eventId: string, 
    besoinId: string, 
    params: { quantiteProposee: number; commentaire?: string },
    token: string
  ): Promise<{ success: boolean; bobIndividuel: BobIndividuel; besoin: any; message: string }> {
    try {
      console.log('🎯 Positionnement sur besoin:', { eventId, besoinId, params });

      const response = await api.post(`/evenements/${eventId}/besoins/${besoinId}/position`, {
        besoinId,
        quantiteProposee: params.quantiteProposee,
        commentaire: params.commentaire || ''
      }, token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors du positionnement');
      }

      const result = await response.json();
      
      console.log('✅ Positionnement réussi:', {
        bobId: result.bobIndividuel?.id,
        titre: result.bobIndividuel?.titre,
        message: result.message
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur positionnement sur besoin:', error);
      const bobError = ErrorHandler.handleApiError(error, 'positionnement sur besoin');
      throw bobError;
    }
  }

  /**
   * Accepter une invitation à un événement
   */
  async accepterInvitation(eventId: string, token: string): Promise<{ success: boolean; message: string; event: any }> {
    try {
      console.log('📨 Acceptation invitation événement:', eventId);

      const response = await api.post(`/evenements/${eventId}/accept`, {}, token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'acceptation');
      }

      const result = await response.json();
      
      console.log('✅ Invitation acceptée:', result.message);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur acceptation invitation:', error);
      const bobError = ErrorHandler.handleApiError(error, 'acceptation invitation');
      throw bobError;
    }
  }

  /**
   * Récupérer tous les BOBs créés depuis un événement
   */
  async getBobsFromEvent(eventId: string, token: string): Promise<{ bobs: BobIndividuel[]; count: number }> {
    try {
      console.log('🔍 Récupération BOBs événement:', eventId);

      const response = await api.get(`/evenements/${eventId}/bobs`, token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la récupération des BOBs');
      }

      const result = await response.json();
      
      console.log('✅ BOBs récupérés:', {
        count: result.count,
        bobs: result.bobs?.map((bob: BobIndividuel) => ({
          id: bob.id,
          titre: bob.titre,
          origine: bob.origine
        }))
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur récupération BOBs événement:', error);
      const bobError = ErrorHandler.handleApiError(error, 'récupération BOBs événement');
      throw bobError;
    }
  }

  /**
   * Compléter un BOB (marquer comme terminé)
   */
  async completerBob(
    bobId: string,
    params: { evaluation?: number; commentaire?: string },
    token: string
  ): Promise<{ success: boolean; bob: BobIndividuel; bobizGagnes: number; message: string }> {
    try {
      console.log('✅ Complétion BOB:', { bobId, params });

      const response = await api.put(`/echanges/${bobId}/complete`, {
        evaluation: params.evaluation || 5,
        commentaire: params.commentaire || ''
      }, token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de la complétion');
      }

      const result = await response.json();
      
      console.log('🎉 BOB complété avec succès:', {
        bobizGagnes: result.bobizGagnes,
        message: result.message
      });

      return result;
    } catch (error: any) {
      console.error('❌ Erreur complétion BOB:', error);
      const bobError = ErrorHandler.handleApiError(error, 'complétion BOB');
      throw bobError;
    }
  }

  /**
   * Annuler un BOB
   */
  async annulerBob(
    bobId: string, 
    params: { raison?: string },
    token: string
  ): Promise<{ success: boolean; bob: BobIndividuel; message: string }> {
    try {
      console.log('❌ Annulation BOB:', { bobId, params });

      const response = await api.put(`/echanges/${bobId}/cancel`, {
        raison: params.raison || 'Annulation utilisateur'
      }, token);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erreur lors de l\'annulation');
      }

      const result = await response.json();
      
      console.log('✅ BOB annulé:', result.message);
      return result;
    } catch (error: any) {
      console.error('❌ Erreur annulation BOB:', error);
      const bobError = ErrorHandler.handleApiError(error, 'annulation BOB');
      throw bobError;
    }
  }

  /**
   * Méthode helper pour traiter les erreurs d'API de façon unifiée
   * @deprecated Utiliser ErrorHandler.handleApiError à la place
   */
  private handleApiError(error: any, context: string): never {
    const bobError = ErrorHandler.handleApiError(error, context);
    throw bobError;
  }
}

export const eventsService = new EventsService();