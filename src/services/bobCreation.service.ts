// src/services/bobCreation.service.ts - Service de création de BOB et événements
import { BobCreationData, ActiveBob, EventNeed } from '../types/bob.types';
import { User, Event } from '../types/app.types';
import { storageService } from './storage.service';
import { notificationService } from './notification.service';
import { requestFlowService } from './requestFlow.service';

export interface EventCreationData {
  title: string;
  description: string;
  date: Date;
  location: string;
  invitees: User[];
  needs: EventNeedCreationData[];
  category?: string;
  maxParticipants?: number;
}

export interface EventNeedCreationData {
  item: string;
  description: string;
  quantity?: number;
  bobizPoints: number;
}

class BobCreationService {
  private currentUser: User | null = null;

  // =================== INITIALISATION ===================
  
  setCurrentUser(user: User) {
    this.currentUser = user;
  }

  // =================== CRÉATION BOB INDIVIDUEL ===================

  /**
   * Créer un BOB individuel (bouton "Créer un Bob")
   * Notifie le réseau → Apparaît dans "Demandes et Actions" des contacts
   */
  async createIndividualBob(data: BobCreationData): Promise<string> {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    console.log('🏠 Création BOB individuel:', data);

    try {
      // Créer l'ID unique du BOB
      const bobId = `bob_individual_${Date.now()}`;

      // Créer l'objet BOB
      const bob = {
        id: bobId,
        type: data.type,
        creator: this.currentUser,
        item: data.item,
        description: data.description,
        category: data.category,
        location: data.location || 'Non spécifiée',
        availableFrom: data.availableFrom || new Date(),
        availableUntil: data.availableUntil,
        bobizPoints: data.bobizPoints || this.calculateBobizPoints(data),
        createdAt: new Date(),
        status: 'available'
      };

      // Sauvegarder le BOB créé
      await this.saveBobToStorage(bob);

      // Notifier le réseau cible
      const targetUsers = data.targetUsers || await this.getUserNetwork();
      await this.notifyNetworkOfNewBob(bob, targetUsers);

      // Ajouter aux "Demandes et Actions" des contacts
      await this.addToContactsRequests(bob, targetUsers);

      console.log('✅ BOB individuel créé avec succès:', bobId);
      return bobId;

    } catch (error) {
      console.error('❌ Erreur création BOB individuel:', error);
      throw error;
    }
  }

  // =================== CRÉATION ÉVÉNEMENT ===================

  /**
   * Créer un événement (bouton "Créer un événement")  
   * Invite les participants → Génère besoins → Notifie le réseau
   */
  async createEvent(data: EventCreationData): Promise<string> {
    if (!this.currentUser) throw new Error('User not authenticated');
    
    console.log('🎉 Création événement:', data);

    try {
      // Créer l'ID unique de l'événement
      const eventId = `event_${Date.now()}`;

      // Créer l'objet événement
      const event: Event = {
        id: eventId,
        title: data.title,
        description: data.description,
        organizer: this.currentUser,
        date: data.date,
        location: data.location,
        category: data.category || 'social',
        maxParticipants: data.maxParticipants,
        participants: [this.currentUser], // L'organisateur participe automatiquement
        needs: data.needs.map((need, index) => ({
          id: `need_${eventId}_${index}`,
          item: need.item,
          description: need.description,
          quantity: need.quantity || 1,
          status: 'pending' as const,
          bobizPoints: need.bobizPoints
        })),
        createdAt: new Date(),
        status: 'active'
      };

      // Sauvegarder l'événement
      await this.saveEventToStorage(event);

      // Ajouter à mes événements
      await this.addToMyEvents(event);

      // Envoyer les invitations
      await this.sendEventInvitations(event, data.invitees);

      // Si l'événement a des besoins, notifier le réseau potentiel
      if (event.needs && event.needs.length > 0) {
        await this.notifyNetworkOfEventNeeds(event);
      }

      console.log('✅ Événement créé avec succès:', eventId);
      return eventId;

    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      throw error;
    }
  }

  // =================== POSITIONNEMENT SUR BESOINS ===================

  /**
   * Se positionner sur un besoin d'événement existant
   * Utilise le RequestFlowService pour créer automatiquement un BOB
   */
  async positionOnEventNeed(eventId: string, needId: string): Promise<ActiveBob> {
    console.log('🎯 Positionnement sur besoin événement:', { eventId, needId });
    
    // Déléguer au RequestFlowService
    return await requestFlowService.acceptEventNeed(eventId, needId);
  }

  // =================== GESTION DES INVITATIONS ===================

  private async sendEventInvitations(event: Event, invitees: User[]): Promise<void> {
    console.log('📤 Envoi invitations événement:', event.id);

    for (const invitee of invitees) {
      try {
        // Créer l'invitation
        const invitation = {
          id: `invitation_${event.id}_${invitee.id}`,
          type: 'event_invitation' as const,
          from: this.currentUser!,
          event: event,
          invitedAt: new Date(),
          bobizPoints: 5 // Points pour participer
        };

        // Ajouter aux "Demandes et Actions" de l'invité
        await this.addInvitationToPendingRequests(invitee.id, invitation);

        // Notifier l'invité
        await notificationService.notify(invitee.id, {
          type: 'event_invitation',
          message: `${this.currentUser!.username} vous invite à ${event.title}`,
          from: this.currentUser!,
          eventId: event.id,
          createdAt: new Date(),
          read: false
        });

        console.log(`✅ Invitation envoyée à ${invitee.username}`);

      } catch (error) {
        console.error(`❌ Erreur envoi invitation à ${invitee.username}:`, error);
      }
    }
  }

  private async notifyNetworkOfEventNeeds(event: Event): Promise<void> {
    console.log('📢 Notification besoins événement:', event.id);

    // Récupérer le réseau étendu (pas seulement les invités)
    const network = await this.getUserNetwork();

    for (const need of event.needs || []) {
      // Créer la demande de besoin
      const needRequest = {
        id: `need_req_${need.id}`,
        type: 'event_need' as const,
        event: event,
        item: need.item,
        description: need.description,
        bobizPoints: need.bobizPoints,
        distance: 'Calculer', // À implémenter avec géolocalisation
        postedAt: new Date()
      };

      // Ajouter aux "Demandes et Actions" du réseau
      for (const contact of network) {
        await this.addEventNeedToPendingRequests(contact.id, needRequest);
      }

      // Notification globale
      await notificationService.notifyMultiple(
        network.map(u => u.id),
        {
          type: 'event_need',
          message: `Événement "${event.title}" cherche: ${need.item}`,
          from: this.currentUser!,
          eventId: event.id,
          createdAt: new Date(),
          read: false
        }
      );
    }
  }

  // =================== GESTION DES BOB ===================

  private async notifyNetworkOfNewBob(bob: any, targetUsers: User[]): Promise<void> {
    console.log('📢 Notification nouveau BOB:', bob.id);

    for (const user of targetUsers) {
      try {
        // Créer la demande directe
        const directRequest = {
          id: `direct_req_${bob.id}_${user.id}`,
          type: 'direct_request' as const,
          requester: this.currentUser!, // Créateur du BOB
          item: bob.item,
          description: bob.description,
          distance: 'À calculer', // Géolocalisation
          bobizPoints: bob.bobizPoints,
          createdAt: new Date(),
          urgency: 'normal' as const
        };

        // Ajouter aux "Demandes et Actions" du contact
        await this.addDirectRequestToPendingRequests(user.id, directRequest);

        // Notifier le contact
        await notificationService.notify(user.id, {
          type: 'bob_request',
          message: `${this.currentUser!.username} ${this.getBobActionText(bob.type)} ${bob.item}`,
          from: this.currentUser!,
          bobId: bob.id,
          createdAt: new Date(),
          read: false
        });

      } catch (error) {
        console.error(`❌ Erreur notification BOB à ${user.username}:`, error);
      }
    }
  }

  private getBobActionText(bobType: string): string {
    switch (bobType) {
      case 'lend': return 'propose de prêter';
      case 'borrow': return 'cherche à emprunter';
      case 'service_offer': return 'propose le service';
      case 'service_request': return 'demande le service';
      default: return 'partage';
    }
  }

  // =================== STOCKAGE ===================

  private async saveBobToStorage(bob: any): Promise<void> {
    const allBobs = await storageService.get('all_bobs') || [];
    allBobs.push(bob);
    await storageService.set('all_bobs', allBobs);
  }

  private async saveEventToStorage(event: Event): Promise<void> {
    const allEvents = await storageService.get('all_events') || [];
    allEvents.push(event);
    await storageService.set('all_events', allEvents);
  }

  private async addToMyEvents(event: Event): Promise<void> {
    const myEvents = await storageService.get(`my_events_${this.currentUser!.id}`) || [];
    myEvents.push(event);
    await storageService.set(`my_events_${this.currentUser!.id}`, myEvents);
  }

  // =================== GESTION DES DEMANDES PENDANTES ===================

  private async addToContactsRequests(bob: any, contacts: User[]): Promise<void> {
    // Cette méthode est maintenant gérée par notifyNetworkOfNewBob
  }

  private async addDirectRequestToPendingRequests(userId: string, request: any): Promise<void> {
    const key = `direct_requests_${userId}`;
    const requests = await storageService.get(key) || [];
    requests.push(request);
    await storageService.set(key, requests);
  }

  private async addInvitationToPendingRequests(userId: string, invitation: any): Promise<void> {
    const key = `event_invitations_${userId}`;
    const invitations = await storageService.get(key) || [];
    invitations.push(invitation);
    await storageService.set(key, invitations);
  }

  private async addEventNeedToPendingRequests(userId: string, needRequest: any): Promise<void> {
    const key = `event_needs_${userId}`;
    const needs = await storageService.get(key) || [];
    needs.push(needRequest);
    await storageService.set(key, needs);
  }

  // =================== UTILITAIRES ===================

  private async getUserNetwork(): Promise<User[]> {
    // Récupérer les contacts/réseau de l'utilisateur
    const contacts = await storageService.get(`contacts_${this.currentUser!.id}`) || [];
    return contacts;
  }

  private calculateBobizPoints(data: BobCreationData): number {
    // Algorithme de calcul des points Bobiz selon le type et la valeur
    let basePoints = 10;
    
    switch (data.type) {
      case 'lend': basePoints = 15; break;
      case 'service_offer': basePoints = 20; break;
      case 'borrow': basePoints = 10; break;
      case 'service_request': basePoints = 12; break;
    }

    // Bonus selon la catégorie
    const categoryMultiplier = data.category === 'urgent' ? 1.5 : 1.0;
    
    return Math.round(basePoints * categoryMultiplier);
  }

  // =================== API PUBLIQUES ===================

  async getCreatedBobs(): Promise<any[]> {
    if (!this.currentUser) return [];
    const allBobs = await storageService.get('all_bobs') || [];
    return allBobs.filter((bob: any) => bob.creator.id === this.currentUser!.id);
  }

  async getCreatedEvents(): Promise<Event[]> {
    if (!this.currentUser) return [];
    const allEvents = await storageService.get('all_events') || [];
    return allEvents.filter((event: Event) => event.organizer.id === this.currentUser!.id);
  }
}

export const bobCreationService = new BobCreationService();