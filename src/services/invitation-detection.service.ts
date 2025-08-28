// src/services/invitation-detection.service.ts
import { apiClient } from './api';
import { invitationsService } from './invitations.service';
import { eventsService } from './events.service';
import {
  EventInvitationExtended,
  BobEvent
} from '../types/events.extended.types';

interface PendingInvitationData {
  eventInvitations: EventInvitationExtended[];
  events: BobEvent[];
  invitedByUsers: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
}

class InvitationDetectionService {
  /**
   * Détecter les invitations en attente pour un nouveau utilisateur
   */
  async detectPendingInvitations(phoneNumber: string, token: string): Promise<PendingInvitationData> {
    console.log('🔍 Détection invitations en attente pour:', phoneNumber);
    
    try {
      // 1. Récupérer toutes les invitations pour ce numéro
      const allInvitations = await this.getInvitationsByPhone(phoneNumber, token);
      console.log(`📨 ${allInvitations.length} invitations trouvées`);

      // 2. Filtrer les invitations d'événements en attente
      const eventInvitations = allInvitations.filter(inv => 
        inv.evenement && 
        ['envoye', 'vue'].includes(inv.statut) &&
        this.isEventStillValid(inv.evenement.dateDebut)
      );

      console.log(`🎉 ${eventInvitations.length} invitations d'événements valides`);

      // 3. Récupérer les détails des événements
      const events: BobEvent[] = [];
      for (const invitation of eventInvitations) {
        try {
          const event = await eventsService.getEvent(invitation.evenement.id.toString(), token);
          if (event) {
            events.push(event as BobEvent);
          }
        } catch (error) {
          console.warn('⚠️ Impossible de charger l\'événement:', invitation.evenement.id);
        }
      }

      // 4. Récupérer les informations des organisateurs
      const invitedByUsers = await this.getInvitersInfo(eventInvitations, token);

      console.log(`✅ Détection terminée: ${events.length} événements, ${invitedByUsers.length} organisateurs`);

      return {
        eventInvitations,
        events,
        invitedByUsers
      };
    } catch (error: any) {
      console.error('❌ Erreur détection invitations:', error);
      return {
        eventInvitations: [],
        events: [],
        invitedByUsers: []
      };
    }
  }

  /**
   * Récupérer les invitations par numéro de téléphone
   */
  private async getInvitationsByPhone(phoneNumber: string, token: string): Promise<EventInvitationExtended[]> {
    try {
      // Essayer d'abord les invitations d'événements
      const response = await apiClient.get(
        `/event-invitations?filters[destinataire][telephone][$eq]=${encodeURIComponent(phoneNumber)}&populate=*`,
        token
      );

      if (response.ok) {
        const result = await response.json();
        return this.mapToExtendedInvitations(result.data || []);
      }

      // Fallback vers les invitations classiques
      const classicInvitations = await invitationsService.getMyInvitations(token);
      return this.convertClassicToEventInvitations(
        classicInvitations.filter(inv => inv.telephone === phoneNumber)
      );
    } catch (error: any) {
      console.error('❌ Erreur récupération invitations par téléphone:', error);
      return [];
    }
  }

  /**
   * Mapper les données API vers EventInvitationExtended
   */
  private mapToExtendedInvitations(data: any[]): EventInvitationExtended[] {
    return data.map(item => ({
      id: item.documentId || item.id.toString(),
      evenement: {
        id: item.evenement?.id || 0,
        titre: item.evenement?.titre || 'Événement',
        dateDebut: item.evenement?.dateDebut || '',
        adresse: item.evenement?.adresse,
        photo: item.evenement?.photo
      },
      destinataire: {
        id: item.destinataire?.id,
        nom: item.destinataire?.nom || '',
        prenom: item.destinataire?.prenom,
        telephone: item.destinataire?.telephone || '',
        email: item.destinataire?.email,
        estUtilisateurBob: Boolean(item.destinataire?.id),
        groupeOrigine: item.metadata?.groupeOrigine
      },
      statut: item.statut || 'envoye',
      type: item.type || 'sms',
      dateEnvoi: item.dateEnvoi || new Date().toISOString(),
      dateVue: item.dateVue,
      dateReponse: item.dateReponse,
      messagePersonnalise: item.messagePersonnalise,
      metadata: item.metadata
    }));
  }

  /**
   * Convertir les invitations classiques en invitations d'événements (fallback)
   */
  private convertClassicToEventInvitations(invitations: any[]): EventInvitationExtended[] {
    return invitations
      .filter(inv => inv.metadata?.eventId) // Seulement celles avec un événement
      .map(inv => ({
        id: inv.id.toString(),
        evenement: {
          id: inv.metadata.eventId,
          titre: inv.metadata.eventTitle || 'Événement',
          dateDebut: inv.metadata.eventDate || '',
          adresse: inv.metadata.eventAddress,
          photo: inv.metadata.eventPhoto
        },
        destinataire: {
          nom: inv.nom,
          telephone: inv.telephone,
          email: inv.email,
          estUtilisateurBob: false,
        },
        statut: inv.statut,
        type: inv.type,
        dateEnvoi: inv.dateEnvoi,
        metadata: inv.metadata
      }));
  }

  /**
   * Vérifier si un événement est encore valide
   */
  private isEventStillValid(eventDate: string): boolean {
    const eventDateTime = new Date(eventDate);
    const now = new Date();
    
    // L'événement est valide s'il n'a pas encore commencé (avec 1h de marge)
    const marginMs = 60 * 60 * 1000; // 1 heure en millisecondes
    return eventDateTime.getTime() > (now.getTime() - marginMs);
  }

  /**
   * Récupérer les informations des organisateurs
   */
  private async getInvitersInfo(
    invitations: EventInvitationExtended[], 
    token: string
  ): Promise<Array<{ id: string; name: string; avatar?: string }>> {
    const organizers: Array<{ id: string; name: string; avatar?: string }> = [];
    const seenIds = new Set<string>();

    for (const invitation of invitations) {
      if (invitation.metadata?.organizerId && !seenIds.has(invitation.metadata.organizerId)) {
        seenIds.add(invitation.metadata.organizerId);
        
        try {
          // Récupérer les infos de l'organisateur
          const response = await apiClient.get(
            `/users/${invitation.metadata.organizerId}`,
            token
          );

          if (response.ok) {
            const user = await response.json();
            organizers.push({
              id: user.id.toString(),
              name: user.username || user.nom || 'Organisateur',
              avatar: user.avatar
            });
          }
        } catch (error) {
          console.warn('⚠️ Impossible de charger l\'organisateur:', invitation.metadata.organizerId);
          
          // Fallback avec le nom depuis les métadonnées
          if (invitation.metadata?.organizerName) {
            organizers.push({
              id: invitation.metadata.organizerId,
              name: invitation.metadata.organizerName,
            });
          }
        }
      }
    }

    return organizers;
  }

  /**
   * Marquer une invitation comme vue
   */
  async markInvitationAsSeen(invitationId: string, token: string): Promise<void> {
    try {
      console.log('👀 Marquer invitation comme vue:', invitationId);
      
      await invitationsService.markEventInvitationAsSeen(parseInt(invitationId), token);
      
      console.log('✅ Invitation marquée comme vue');
    } catch (error: any) {
      console.error('❌ Erreur marquage vue:', error);
    }
  }

  /**
   * Accepter une invitation d'événement
   */
  async acceptEventInvitation(invitationId: string, token: string): Promise<void> {
    try {
      console.log('✅ Acceptation invitation:', invitationId);
      
      await invitationsService.respondToEventInvitation(
        parseInt(invitationId), 
        'accepte', 
        token
      );
      
      console.log('✅ Invitation acceptée');
    } catch (error: any) {
      console.error('❌ Erreur acceptation invitation:', error);
      throw error;
    }
  }

  /**
   * Refuser une invitation d'événement
   */
  async declineEventInvitation(invitationId: string, token: string): Promise<void> {
    try {
      console.log('❌ Refus invitation:', invitationId);
      
      await invitationsService.respondToEventInvitation(
        parseInt(invitationId), 
        'refuse', 
        token
      );
      
      console.log('✅ Invitation refusée');
    } catch (error: any) {
      console.error('❌ Erreur refus invitation:', error);
      throw error;
    }
  }

  /**
   * Récupérer le statut de toutes les invitations d'un utilisateur
   */
  async getMyInvitationStatus(token: string): Promise<{
    pending: number;
    accepted: number;
    declined: number;
    total: number;
  }> {
    try {
      const response = await apiClient.get('/event-invitations/me/stats', token);
      
      if (response.ok) {
        return await response.json();
      }

      // Fallback : calculer manuellement
      const invitations = await this.getInvitationsByPhone('', token); // TODO: récupérer le téléphone de l'utilisateur
      
      return {
        pending: invitations.filter(inv => ['envoye', 'vue'].includes(inv.statut)).length,
        accepted: invitations.filter(inv => inv.statut === 'accepte').length,
        declined: invitations.filter(inv => inv.statut === 'refuse').length,
        total: invitations.length
      };
    } catch (error: any) {
      console.error('❌ Erreur récupération statut invitations:', error);
      return { pending: 0, accepted: 0, declined: 0, total: 0 };
    }
  }
}

export const invitationDetectionService = new InvitationDetectionService();