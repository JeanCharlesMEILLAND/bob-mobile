// src/services/events.service.ts
import { apiClient as api } from './api';

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
  demandeur: number;
  dateCreation: string;
}

class EventsService {
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
      throw new Error('Impossible de créer l\'événement');
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

      return response.data.data.map((event: any) => ({
        ...event,
        besoins: event.metadata?.besoins || []
      }));
    } catch (error: any) {
      console.error('❌ Erreur récupération événements:', error.response?.data || error.message);
      throw new Error('Impossible de récupérer les événements');
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
        besoins: event.metadata?.besoins || []
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
    token: string
  ): Promise<{ bobIndividuel: BobIndividuel; message: string }> {
    try {
      console.log('🎯 Positionnement sur besoin:', besoinId);
      
      // 1. Récupérer l'événement
      const event = await this.getEvent(eventId, token);
      if (!event) {
        throw new Error('Événement non trouvé');
      }

      // 2. Trouver le besoin
      const besoin = event.besoins?.find(b => b.id === besoinId);
      if (!besoin) {
        throw new Error('Besoin non trouvé');
      }

      // 3. Créer le BOB individuel automatiquement
      const bobType = besoin.type === 'objet' ? 'pret' : 'service_offert';
      
      const bobResponse = await api.post('/echanges', {
        data: {
          titre: `${this.getBesoinIcon(besoin.type)} ${besoin.titre} - ${event.titre}`,
          description: `${besoin.description}\n\n🎯 Issu du BOB Collectif "${event.titre}"\n\n📅 Événement: ${new Date(event.dateDebut).toLocaleDateString()}`,
          type: bobType,
          bobizGagnes: this.calculateBobizForBesoin(besoin),
          statut: 'actif'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const bobIndividuel = bobResponse.data.data;

      // 4. Mettre à jour l'événement avec l'assignation
      const updatedBesoins = event.besoins?.map(b => {
        if (b.id === besoinId) {
          return {
            ...b,
            assignations: [
              ...(b.assignations || []),
              {
                participant: 'current_user', // TODO: récupérer vraie info user
                participant_id: 0, // TODO: récupérer vrai user ID
                bob_individuel_id: bobIndividuel.id,
                assigné_le: new Date().toISOString()
              }
            ]
          };
        }
        return b;
      }) || [];

      await api.put(`/evenements/${event.documentId}`, {
        data: {
          metadata: {
            ...event.metadata,
            besoins: updatedBesoins
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // 5. Ajouter message dans la conversation événement
      await api.post('/messages', {
        data: {
          contenu: `🎯 POSITIONNEMENT CONFIRMÉ !\n\nJe me positionne sur "${besoin.titre}"\n\n✅ BOB individuel créé automatiquement (ID: ${bobIndividuel.id})\n💎 ${bobIndividuel.bobizGagnes} BOBIZ\n\n👀 Visible par tous les participants !`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          evenement: event.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Positionnement réussi, BOB créé:', bobIndividuel.id);

      return {
        bobIndividuel,
        message: `Positionnement confirmé ! BOB individuel créé pour "${besoin.titre}"`
      };
    } catch (error: any) {
      console.error('❌ Erreur positionnement:', error.response?.data || error.message);
      throw new Error('Impossible de se positionner sur ce besoin');
    }
  }

  /**
   * Récupérer les BOB individuels créés depuis un événement
   */
  async getBobsFromEvent(eventId: string, token: string): Promise<BobIndividuel[]> {
    try {
      // Récupérer tous les échanges et filtrer ceux liés à cet événement
      const response = await api.get('/echanges?populate=*', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Filtrer les BOB qui mentionnent cet événement dans leur description
      return response.data.data.filter((bob: any) => 
        bob.description && bob.description.includes(`BOB Collectif`) && 
        bob.description.includes(eventId)
      );
    } catch (error: any) {
      console.error('❌ Erreur récupération BOB événement:', error.response?.data || error.message);
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
}

export const eventsService = new EventsService();