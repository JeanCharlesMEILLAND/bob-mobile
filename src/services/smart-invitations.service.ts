// src/services/smart-invitations.service.ts
import { apiClient } from './api';
import { contactsService } from './contacts.service';
import { invitationsService } from './invitations.service';
import {
  SmartInvitationTarget,
  PostCreationInvitation,
  EventInvitationExtended,
  InvitationType,
  InvitationStatus,
  BulkInvitationResult,
  ContactInvitationState,
  InvitationTrackingData
} from '../types/events.extended.types';
import { Contact } from '../types/contacts.types';

class SmartInvitationsService {
  /**
   * Analyser et préparer les cibles d'invitation intelligentes
   */
  async prepareSmartTargets(eventId: number, token: string): Promise<SmartInvitationTarget[]> {
    console.log('🎯 Préparation des cibles d\'invitation intelligentes pour l\'événement:', eventId);
    
    try {
      // 1. Récupérer tous les contacts
      const allContacts = await contactsService.getMyContacts(token);
      console.log(`📇 ${allContacts.length} contacts trouvés`);

      // 2. Détecter les utilisateurs Bob
      const validPhones = allContacts
        .map(c => c.telephone)
        .filter((phone): phone is string => Boolean(phone));
      
      const bobUsers = await contactsService.checkBobUsers(validPhones, token);
      console.log(`👥 ${Object.keys(bobUsers).length} utilisateurs Bob détectés`);

      // 3. Créer les cibles intelligentes
      const smartTargets: SmartInvitationTarget[] = [];

      for (const contact of allContacts) {
        if (!contact.telephone) continue;

        const estUtilisateurBob = Boolean(bobUsers[contact.telephone]);
        const canalOptimal = this.determineOptimalChannel(contact, estUtilisateurBob);

        const smartTarget: SmartInvitationTarget = {
          id: contact.id,
          nom: contact.nom,
          prenom: contact.prenom,
          telephone: contact.telephone,
          email: contact.email,
          avatar: contact.avatar,
          estUtilisateurBob,
          profilBob: estUtilisateurBob ? bobUsers[contact.telephone] : undefined,
          canalOptimal,
          groupeOrigine: contact.groupes?.[0]?.nom,
          historiqueInvitations: await this.getInvitationHistory(contact.telephone, token),
          preferences: await this.detectPreferences(contact, token)
        };

        smartTargets.push(smartTarget);
      }

      console.log(`✅ ${smartTargets.length} cibles intelligentes préparées`);
      return smartTargets.sort((a, b) => {
        // Prioriser les utilisateurs Bob, puis par historique d'acceptation
        if (a.estUtilisateurBob && !b.estUtilisateurBob) return -1;
        if (!a.estUtilisateurBob && b.estUtilisateurBob) return 1;
        
        const aAcceptation = a.historiqueInvitations?.tauxAcceptation || 0;
        const bAcceptation = b.historiqueInvitations?.tauxAcceptation || 0;
        return bAcceptation - aAcceptation;
      });
    } catch (error: any) {
      console.error('❌ Erreur préparation cibles intelligentes:', error);
      throw new Error('Impossible de préparer les cibles d\'invitation');
    }
  }

  /**
   * Déterminer le canal optimal pour un contact
   */
  private determineOptimalChannel(contact: Contact, estUtilisateurBob: boolean): InvitationType {
    if (estUtilisateurBob) {
      return 'push'; // Notification in-app prioritaire pour les utilisateurs Bob
    }

    // Pour les contacts sans Bob, choisir le meilleur canal
    if (contact.telephone && this.isWhatsAppAvailable(contact.telephone)) {
      return 'whatsapp'; // WhatsApp si disponible
    }

    if (contact.email) {
      return 'email'; // Email comme alternative
    }

    return 'sms'; // SMS par défaut
  }

  /**
   * Vérifier la disponibilité WhatsApp (simulation)
   */
  private isWhatsAppAvailable(telephone: string): boolean {
    // TODO: Implémenter la vraie vérification WhatsApp Business API
    // Pour l'instant, simuler basé sur les préfixes français
    const frenchPrefixes = ['06', '07'];
    const cleanPhone = telephone.replace(/[^0-9]/g, '');
    return frenchPrefixes.some(prefix => cleanPhone.startsWith(prefix));
  }

  /**
   * Récupérer l'historique d'invitations d'un contact
   */
  private async getInvitationHistory(telephone: string, token: string): Promise<{
    nombreInvitations: number;
    tauxAcceptation: number;
    derniereInvitation?: string;
  }> {
    try {
      // Récupérer les invitations passées pour ce numéro
      const response = await apiClient.get(
        `/invitations?filters[telephone][$eq]=${telephone}`,
        token
      );

      if (response.ok) {
        const result = await response.json();
        const invitations = result.data || [];
        
        const acceptees = invitations.filter((inv: any) => inv.statut === 'accepte').length;
        const tauxAcceptation = invitations.length > 0 ? (acceptees / invitations.length) * 100 : 0;

        return {
          nombreInvitations: invitations.length,
          tauxAcceptation: Math.round(tauxAcceptation),
          derniereInvitation: invitations[0]?.dateEnvoi
        };
      }
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer l\'historique pour:', telephone);
    }

    return {
      nombreInvitations: 0,
      tauxAcceptation: 0
    };
  }

  /**
   * Détecter les préférences d'un contact
   */
  private async detectPreferences(contact: Contact, token: string): Promise<{
    langue: 'fr' | 'en' | 'pl';
    horairePreferentiel?: 'matin' | 'apres-midi' | 'soir';
    frequenceInvitations: 'haute' | 'normale' | 'faible';
  }> {
    // TODO: Implémenter la détection basée sur l'historique
    // Pour l'instant, valeurs par défaut
    return {
      langue: 'fr',
      frequenceInvitations: 'normale'
    };
  }

  /**
   * Envoyer des invitations intelligentes en masse
   */
  async sendSmartInvitations(
    eventId: number,
    targets: ContactInvitationState[],
    options: {
      messagePersonnalise?: string;
      envoyerImmediatement?: boolean;
      respecterPreferences?: boolean;
    },
    token: string
  ): Promise<BulkInvitationResult> {
    console.log(`📤 Envoi d'invitations intelligentes pour ${targets.length} cibles`);
    
    try {
      const results: EventInvitationExtended[] = [];
      const errors: Array<{ contact: string; error: string }> = [];
      let success = 0;
      let failed = 0;

      // Grouper par canal pour optimiser l'envoi
      const groupedByChannel = this.groupByChannel(targets.filter(t => t.selected));

      // Envoyer par canal
      for (const [canal, channelTargets] of Object.entries(groupedByChannel)) {
        console.log(`📬 Envoi via ${canal} pour ${channelTargets.length} contacts`);
        
        try {
          const channelResults = await this.sendByChannel(
            eventId,
            channelTargets,
            canal as InvitationType,
            options,
            token
          );

          results.push(...channelResults.invitations);
          success += channelResults.success;
          failed += channelResults.failed;
          errors.push(...channelResults.errors);
        } catch (error: any) {
          console.error(`❌ Erreur envoi canal ${canal}:`, error);
          channelTargets.forEach(target => {
            errors.push({
              contact: target.target.nom,
              error: `Erreur canal ${canal}: ${error.message}`
            });
            failed++;
          });
        }
      }

      // Générer le tracking
      const tracking = this.generateTrackingData(results);

      console.log(`✅ Invitations envoyées: ${success} réussies, ${failed} échouées`);

      return {
        success,
        failed,
        invitations: results,
        errors,
        tracking
      };
    } catch (error: any) {
      console.error('❌ Erreur envoi invitations intelligentes:', error);
      throw new Error('Impossible d\'envoyer les invitations');
    }
  }

  /**
   * Grouper les cibles par canal d'envoi
   */
  private groupByChannel(targets: ContactInvitationState[]): Record<string, ContactInvitationState[]> {
    return targets.reduce((acc, target) => {
      const canal = target.canal;
      if (!acc[canal]) {
        acc[canal] = [];
      }
      acc[canal].push(target);
      return acc;
    }, {} as Record<string, ContactInvitationState[]>);
  }

  /**
   * Envoyer des invitations par canal spécifique
   */
  private async sendByChannel(
    eventId: number,
    targets: ContactInvitationState[],
    canal: InvitationType,
    options: any,
    token: string
  ): Promise<BulkInvitationResult> {
    const results: EventInvitationExtended[] = [];
    const errors: Array<{ contact: string; error: string }> = [];
    let success = 0;
    let failed = 0;

    for (const target of targets) {
      try {
        const invitation = await this.sendSingleInvitation(
          eventId,
          target,
          canal,
          options,
          token
        );
        
        results.push(invitation);
        success++;
      } catch (error: any) {
        console.error(`❌ Erreur envoi ${target.target.nom}:`, error);
        errors.push({
          contact: target.target.nom,
          error: error.message
        });
        failed++;
      }
    }

    return {
      success,
      failed,
      invitations: results,
      errors,
      tracking: this.generateTrackingData(results)
    };
  }

  /**
   * Envoyer une invitation individuelle
   */
  private async sendSingleInvitation(
    eventId: number,
    target: ContactInvitationState,
    canal: InvitationType,
    options: any,
    token: string
  ): Promise<EventInvitationExtended> {
    // Récupérer les détails de l'événement
    const eventResponse = await apiClient.get(`/evenements/${eventId}`, token);
    if (!eventResponse.ok) {
      throw new Error('Événement non trouvé');
    }
    const eventData = await eventResponse.json();

    // Créer l'invitation selon le canal
    const invitationData = {
      evenementId: eventId,
      destinataire: {
        nom: target.target.nom,
        prenom: target.target.prenom,
        telephone: target.target.telephone,
        email: target.target.email,
        estUtilisateurBob: target.target.estUtilisateurBob
      },
      type: canal,
      statut: 'envoye' as InvitationStatus,
      messagePersonnalise: target.customMessage || options.messagePersonnalise,
      metadata: {
        groupeOrigine: target.target.groupeOrigine,
        typeInvitation: 'directe' as const,
        canalPreferentiel: canal
      }
    };

    // Envoyer via l'API appropriée selon le canal
    const response = await this.sendViaChannel(canal, invitationData, token);

    return {
      id: response.id,
      evenement: {
        id: eventData.data.id,
        titre: eventData.data.titre,
        dateDebut: eventData.data.dateDebut,
        adresse: eventData.data.adresse,
        photo: eventData.data.photo
      },
      destinataire: {
        id: target.target.profilBob?.id,
        nom: target.target.nom,
        prenom: target.target.prenom,
        telephone: target.target.telephone,
        email: target.target.email,
        estUtilisateurBob: target.target.estUtilisateurBob,
        groupeOrigine: target.target.groupeOrigine
      },
      statut: 'envoye',
      type: canal,
      dateEnvoi: new Date().toISOString(),
      messagePersonnalise: invitationData.messagePersonnalise,
      metadata: invitationData.metadata
    };
  }

  /**
   * Envoyer via le canal spécifique
   */
  private async sendViaChannel(canal: InvitationType, invitationData: any, token: string) {
    switch (canal) {
      case 'push':
        // Notification in-app pour utilisateurs Bob
        return await apiClient.post('/event-invitations/push', { data: invitationData }, token);
      
      case 'sms':
        // SMS via service externe
        return await apiClient.post('/event-invitations/sms', { data: invitationData }, token);
      
      case 'whatsapp':
        // WhatsApp Business API
        return await apiClient.post('/event-invitations/whatsapp', { data: invitationData }, token);
      
      case 'email':
        // Email avec template HTML
        return await apiClient.post('/event-invitations/email', { data: invitationData }, token);
      
      default:
        throw new Error(`Canal non supporté: ${canal}`);
    }
  }

  /**
   * Générer les données de tracking
   */
  private generateTrackingData(invitations: EventInvitationExtended[]): InvitationTrackingData {
    const utilisateursBob = invitations.filter(inv => inv.destinataire.estUtilisateurBob);
    const contactsSansBob = invitations.filter(inv => !inv.destinataire.estUtilisateurBob);

    const canaux: Record<InvitationType, number> = {
      push: 0,
      sms: 0,
      whatsapp: 0,
      email: 0,
      mixte: 0
    };

    invitations.forEach(inv => {
      canaux[inv.type]++;
    });

    return {
      total: invitations.length,
      utilisateursBob: {
        envoye: utilisateursBob.length,
        vue: utilisateursBob.filter(inv => inv.statut === 'vue').length,
        accepte: utilisateursBob.filter(inv => inv.statut === 'accepte').length
      },
      contactsSansBob: {
        envoye: contactsSansBob.length,
        bobTelecharge: contactsSansBob.filter(inv => inv.statut === 'bob_telecharge').length,
        inscrit: 0, // TODO: À calculer selon les inscriptions
        accepteApresInscription: 0 // TODO: À calculer
      },
      canaux
    };
  }

  /**
   * Suivre les invitations en temps réel
   */
  async trackInvitations(eventId: number, token: string): Promise<InvitationTrackingData> {
    try {
      const response = await apiClient.get(
        `/event-invitations/tracking/${eventId}`,
        token
      );

      if (response.ok) {
        const result = await response.json();
        return result.tracking;
      }

      throw new Error('Impossible de récupérer le tracking');
    } catch (error: any) {
      console.error('❌ Erreur tracking invitations:', error);
      throw error;
    }
  }

  /**
   * Envoyer des rappels intelligents
   */
  async sendSmartReminders(eventId: number, token: string): Promise<number> {
    console.log('🔔 Envoi de rappels intelligents pour l\'événement:', eventId);
    
    try {
      // Récupérer les invitations non répondues
      const response = await apiClient.get(
        `/event-invitations?filters[evenement][id][$eq]=${eventId}&filters[statut][$eq]=envoye`,
        token
      );

      if (!response.ok) {
        throw new Error('Impossible de récupérer les invitations');
      }

      const result = await response.json();
      const invitationsNonRepondues = result.data || [];

      let rappelsEnvoyes = 0;

      for (const invitation of invitationsNonRepondues) {
        // Logique intelligente : ne pas spammer, respecter les préférences
        const shouldSendReminder = this.shouldSendReminder(invitation);
        
        if (shouldSendReminder) {
          try {
            await apiClient.post('/event-invitations/remind', {
              data: { invitationId: invitation.id }
            }, token);
            rappelsEnvoyes++;
          } catch (error) {
            console.warn('⚠️ Erreur rappel pour:', invitation.destinataire.nom);
          }
        }
      }

      console.log(`✅ ${rappelsEnvoyes} rappels envoyés`);
      return rappelsEnvoyes;
    } catch (error: any) {
      console.error('❌ Erreur rappels intelligents:', error);
      throw error;
    }
  }

  /**
   * Déterminer si on doit envoyer un rappel
   */
  private shouldSendReminder(invitation: any): boolean {
    // TODO: Implémenter la logique intelligente
    // - Pas plus d'un rappel par jour
    // - Respecter les préférences horaires
    // - Éviter de spammer les contacts peu réactifs
    
    const maintenant = new Date();
    const dateEnvoi = new Date(invitation.dateEnvoi);
    const heuresEcoulees = (maintenant.getTime() - dateEnvoi.getTime()) / (1000 * 60 * 60);
    
    // Rappel après 24h minimum
    return heuresEcoulees >= 24 && invitation.nombreRelances < 2;
  }
}

export const smartInvitationsService = new SmartInvitationsService();