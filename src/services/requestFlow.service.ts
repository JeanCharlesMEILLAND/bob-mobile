// src/services/requestFlow.service.ts - Service de gestion des flux de demandes
import { BobRequest, DirectBobRequest, EventInvitation, EventNeedRequest, ActiveBob } from '../types/bob.types';
import { User, Event } from '../types/app.types';
import { storageService } from './storage.service';
import { notificationService } from './notification.service';

export interface RequestsHub {
  directRequests: DirectBobRequest[];
  eventInvitations: EventInvitation[];
  eventNeeds: EventNeedRequest[];
}

class RequestFlowService {
  private currentUser: User | null = null;

  // =================== INITIALISATION ===================
  
  setCurrentUser(user: User) {
    this.currentUser = user;
  }

  // =================== RÉCUPÉRATION DES DEMANDES ===================

  async getDemandesActions(): Promise<RequestsHub> {
    if (!this.currentUser) throw new Error('User not authenticated');

    try {
      // Récupérer les demandes depuis le storage/API
      const [directRequests, eventInvitations, eventNeeds] = await Promise.all([
        this.getDirectRequests(),
        this.getEventInvitations(), 
        this.getEventNeeds()
      ]);

      return {
        directRequests,
        eventInvitations,
        eventNeeds
      };
    } catch (error) {
      console.error('❌ Erreur récupération demandes:', error);
      return { directRequests: [], eventInvitations: [], eventNeeds: [] };
    }
  }

  private async getDirectRequests(): Promise<DirectBobRequest[]> {
    // Récupérer demandes directes depuis l'API/storage
    const stored = await storageService.get(`direct_requests_${this.currentUser!.id}`);
    return stored || this.getMockDirectRequests();
  }

  private async getEventInvitations(): Promise<EventInvitation[]> {
    // Récupérer invitations événements depuis l'API/storage
    const stored = await storageService.get(`event_invitations_${this.currentUser!.id}`);
    return stored || this.getMockEventInvitations();
  }

  private async getEventNeeds(): Promise<EventNeedRequest[]> {
    // Récupérer besoins événements depuis l'API/storage
    const stored = await storageService.get(`event_needs_${this.currentUser!.id}`);
    return stored || this.getMockEventNeeds();
  }

  // =================== ACCEPTATION DES DEMANDES ===================

  /**
   * Accepter une demande directe de BOB
   * Supprime de "Demandes et Actions" → Ajoute à "Vos Bob en cours"
   */
  async acceptDirectRequest(requestId: string): Promise<ActiveBob> {
    console.log('🤝 Acceptation demande directe:', requestId);

    try {
      // Récupérer la demande
      const request = await this.getDirectRequestById(requestId);
      if (!request) throw new Error('Demande introuvable');

      // Créer le BOB actif
      const activeBob: ActiveBob = {
        id: `bob_${Date.now()}`,
        type: 'individual',
        item: request.item,
        description: request.description,
        borrower: request.requester,
        lender: this.currentUser!,
        status: 'active',
        createdAt: new Date(),
        eventContext: null,
        bobizPoints: request.bobizPoints || 10
      };

      // Sauvegarder le BOB actif
      await this.addToActiveBobs(activeBob);

      // Supprimer de "Demandes et Actions"
      await this.removeFromPendingRequests(requestId, 'direct');

      // Notifier le demandeur
      await notificationService.notify(request.requester.id, {
        type: 'bob_accepted',
        message: `${this.currentUser!.username} a accepté de vous prêter ${request.item}`,
        bobId: activeBob.id
      });

      console.log('✅ BOB direct créé:', activeBob);
      return activeBob;

    } catch (error) {
      console.error('❌ Erreur acceptation demande directe:', error);
      throw error;
    }
  }

  /**
   * Accepter une invitation à un événement
   * Supprime de "Demandes et Actions" → Ajoute à "Mes Événements"
   */
  async acceptEventInvitation(invitationId: string): Promise<Event> {
    console.log('🎉 Acceptation invitation événement:', invitationId);

    try {
      // Récupérer l'invitation
      const invitation = await this.getEventInvitationById(invitationId);
      if (!invitation) throw new Error('Invitation introuvable');

      // Ajouter à mes événements
      await this.addToMyEvents({
        ...invitation.event,
        status: 'participating',
        joinedAt: new Date()
      });

      // Supprimer de "Demandes et Actions"
      await this.removeFromPendingRequests(invitationId, 'invitation');

      // Notifier l'organisateur
      await notificationService.notify(invitation.from.id, {
        type: 'event_joined',
        message: `${this.currentUser!.username} a rejoint votre événement ${invitation.event.title}`,
        eventId: invitation.event.id
      });

      console.log('✅ Événement rejoint:', invitation.event);
      return invitation.event;

    } catch (error) {
      console.error('❌ Erreur acceptation invitation:', error);
      throw error;
    }
  }

  /**
   * Se positionner sur un besoin d'événement
   * Supprime de "Demandes et Actions" → Crée BOB + Ajoute à "Vos Bob en cours"
   */
  async acceptEventNeed(eventId: string, needId: string): Promise<ActiveBob> {
    console.log('🎯 Positionnement sur besoin événement:', { eventId, needId });

    try {
      // Récupérer le besoin d'événement
      const eventNeed = await this.getEventNeedById(needId);
      if (!eventNeed) throw new Error('Besoin événement introuvable');

      // Créer BOB automatiquement
      const activeBob: ActiveBob = {
        id: `bob_event_${Date.now()}`,
        type: 'event_related',
        item: eventNeed.item,
        description: `Prêt pour ${eventNeed.event.title}`,
        borrower: eventNeed.event.organizer, // L'événement/organisateur comme "emprunteur"
        lender: this.currentUser!,
        status: 'active',
        createdAt: new Date(),
        eventContext: eventId,
        bobizPoints: eventNeed.bobizPoints || 15
      };

      // Sauvegarder le BOB actif
      await this.addToActiveBobs(activeBob);

      // Marquer le besoin comme résolu dans l'événement
      await this.markEventNeedFulfilled(eventId, needId, this.currentUser!);

      // Supprimer de "Demandes et Actions"
      await this.removeFromPendingRequests(needId, 'eventNeed');

      // Notifier l'organisateur
      await notificationService.notify(eventNeed.event.organizer.id, {
        type: 'event_need_fulfilled',
        message: `${this.currentUser!.username} peut fournir ${eventNeed.item} pour ${eventNeed.event.title}`,
        bobId: activeBob.id,
        eventId: eventId
      });

      console.log('✅ BOB événement créé:', activeBob);
      return activeBob;

    } catch (error) {
      console.error('❌ Erreur positionnement besoin événement:', error);
      throw error;
    }
  }

  // =================== GESTION DES ÉTATS ===================

  private async addToActiveBobs(bob: ActiveBob): Promise<void> {
    const currentBobs = await storageService.get(`active_bobs_${this.currentUser!.id}`) || [];
    currentBobs.push(bob);
    await storageService.set(`active_bobs_${this.currentUser!.id}`, currentBobs);
  }

  private async addToMyEvents(event: Event & { status: string; joinedAt: Date }): Promise<void> {
    const currentEvents = await storageService.get(`my_events_${this.currentUser!.id}`) || [];
    currentEvents.push(event);
    await storageService.set(`my_events_${this.currentUser!.id}`, currentEvents);
  }

  private async removeFromPendingRequests(requestId: string, type: 'direct' | 'invitation' | 'eventNeed'): Promise<void> {
    const key = `${type}_requests_${this.currentUser!.id}`;
    const requests = await storageService.get(key) || [];
    const filtered = requests.filter((req: any) => req.id !== requestId);
    await storageService.set(key, filtered);
  }

  private async markEventNeedFulfilled(eventId: string, needId: string, fulfilledBy: User): Promise<void> {
    // Marquer dans l'événement que ce besoin est résolu
    const events = await storageService.get('all_events') || [];
    const eventIndex = events.findIndex((e: Event) => e.id === eventId);
    
    if (eventIndex >= 0 && events[eventIndex].needs) {
      const needIndex = events[eventIndex].needs.findIndex((n: any) => n.id === needId);
      if (needIndex >= 0) {
        events[eventIndex].needs[needIndex].status = 'fulfilled';
        events[eventIndex].needs[needIndex].fulfilledBy = fulfilledBy;
        await storageService.set('all_events', events);
      }
    }
  }

  // =================== RÉCUPÉRATION INDIVIDUELLE ===================

  private async getDirectRequestById(requestId: string): Promise<DirectBobRequest | null> {
    const requests = await this.getDirectRequests();
    return requests.find(r => r.id === requestId) || null;
  }

  private async getEventInvitationById(invitationId: string): Promise<EventInvitation | null> {
    const invitations = await this.getEventInvitations();
    return invitations.find(i => i.id === invitationId) || null;
  }

  private async getEventNeedById(needId: string): Promise<EventNeedRequest | null> {
    const needs = await this.getEventNeeds();
    return needs.find(n => n.id === needId) || null;
  }

  // =================== DONNÉES MOCK ===================

  private getMockDirectRequests(): DirectBobRequest[] {
    return [
      {
        id: 'direct_001',
        type: 'direct_request',
        requester: { id: 'user_pierre', username: 'Pierre Martin', avatar: null },
        item: 'Perceuse sans fil',
        description: 'J\'aurais besoin d\'une perceuse pour accrocher des tableaux',
        distance: '800m',
        bobizPoints: 12,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2h
        urgency: 'normal'
      }
    ];
  }

  private getMockEventInvitations(): EventInvitation[] {
    return [
      {
        id: 'invitation_001',
        type: 'event_invitation',
        from: { id: 'user_marie', username: 'Marie Dupont', avatar: null },
        event: {
          id: 'event_cracovie',
          title: 'Week-end à Cracovie',
          description: 'Voyage organisé de 3 jours dans la magnifique ville de Cracovie',
          organizer: { id: 'user_marie', username: 'Marie Dupont', avatar: null },
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
          location: 'Cracovie, Pologne',
          needs: []
        },
        invitedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // Il y a 1h
      }
    ];
  }

  private getMockEventNeeds(): EventNeedRequest[] {
    return [
      {
        id: 'need_001',
        type: 'event_need',
        event: {
          id: 'event_zaky',
          title: 'Anniversaire de Zaky',
          description: 'Fête d\'anniversaire surprise pour les 25 ans de Zaky',
          organizer: { id: 'user_lisa', username: 'Lisa Cohen', avatar: null },
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
          location: 'Chez Zaky',
          needs: []
        },
        item: 'Enceintes bluetooth',
        description: 'Besoin d\'enceintes puissantes pour la musique',
        bobizPoints: 18,
        distance: '1.2km',
        postedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // Il y a 4h
      }
    ];
  }

  // =================== UTILITAIRES ===================

  async getActiveBobs(): Promise<ActiveBob[]> {
    if (!this.currentUser) return [];
    return await storageService.get(`active_bobs_${this.currentUser.id}`) || [];
  }

  async getMyEvents(): Promise<Event[]> {
    if (!this.currentUser) return [];
    return await storageService.get(`my_events_${this.currentUser.id}`) || [];
  }

  async getTotalPendingCount(): Promise<number> {
    const hub = await this.getDemandesActions();
    return hub.directRequests.length + hub.eventInvitations.length + hub.eventNeeds.length;
  }
}

export const requestFlowService = new RequestFlowService();