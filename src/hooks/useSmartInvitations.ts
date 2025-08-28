// src/hooks/useSmartInvitations.ts
import { useState, useEffect, useCallback } from 'react';
import { smartInvitationsService } from '../services/smart-invitations.service';
import { authService } from '../services/auth.service';
import {
  SmartInvitationTarget,
  ContactInvitationState,
  BulkInvitationResult,
  InvitationTrackingData,
  InvitationType
} from '../types/events.extended.types';

interface UseSmartInvitationsProps {
  eventId: number;
}

export const useSmartInvitations = ({ eventId }: UseSmartInvitationsProps) => {
  // États principaux
  const [smartTargets, setSmartTargets] = useState<SmartInvitationTarget[]>([]);
  const [contactStates, setContactStates] = useState<ContactInvitationState[]>([]);
  const [tracking, setTracking] = useState<InvitationTrackingData | null>(null);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTracking, setIsLoadingTracking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Erreurs
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les cibles intelligentes
   */
  const loadSmartTargets = useCallback(async () => {
    try {
      setError(null);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('🎯 Chargement des cibles intelligentes...');
      const targets = await smartInvitationsService.prepareSmartTargets(eventId, token);
      
      // Initialiser les états des contacts
      const initialStates: ContactInvitationState[] = targets.map(target => ({
        target,
        selected: target.estUtilisateurBob, // Pré-sélectionner les utilisateurs Bob
        invitationSent: false,
        canal: target.canalOptimal,
        customMessage: undefined
      }));

      setSmartTargets(targets);
      setContactStates(initialStates);
      
      console.log(`✅ ${targets.length} cibles chargées`);
    } catch (err: any) {
      console.error('❌ Erreur chargement cibles:', err);
      setError(err.message || 'Erreur de chargement');
    }
  }, [eventId]);

  /**
   * Charger le tracking des invitations
   */
  const loadTracking = useCallback(async () => {
    try {
      setIsLoadingTracking(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      const trackingData = await smartInvitationsService.trackInvitations(eventId, token);
      setTracking(trackingData);
    } catch (err: any) {
      console.warn('⚠️ Impossible de charger le tracking:', err);
    } finally {
      setIsLoadingTracking(false);
    }
  }, [eventId]);

  /**
   * Actualiser les données
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadSmartTargets(),
      loadTracking()
    ]);
    setIsRefreshing(false);
  }, [loadSmartTargets, loadTracking]);

  /**
   * Chargement initial
   */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadSmartTargets();
      await loadTracking();
      setIsLoading(false);
    };
    
    init();
  }, [loadSmartTargets, loadTracking]);

  /**
   * Basculer la sélection d'un contact
   */
  const toggleContactSelection = useCallback((contactId: string) => {
    setContactStates(prev => prev.map(contact => 
      contact.target.id === contactId
        ? { ...contact, selected: !contact.selected }
        : contact
    ));
  }, []);

  /**
   * Changer le canal d'un contact
   */
  const changeContactChannel = useCallback((contactId: string, canal: InvitationType) => {
    setContactStates(prev => prev.map(contact => 
      contact.target.id === contactId
        ? { ...contact, canal }
        : contact
    ));
  }, []);

  /**
   * Définir un message personnalisé pour un contact
   */
  const setCustomMessage = useCallback((contactId: string, message: string) => {
    setContactStates(prev => prev.map(contact => 
      contact.target.id === contactId
        ? { ...contact, customMessage: message.trim() || undefined }
        : contact
    ));
  }, []);

  /**
   * Sélectionner tous les utilisateurs Bob
   */
  const selectAllBobUsers = useCallback(() => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: contact.target.estUtilisateurBob ? true : contact.selected
    })));
  }, []);

  /**
   * Sélectionner tous les contacts sans Bob
   */
  const selectAllNonBobUsers = useCallback(() => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: !contact.target.estUtilisateurBob ? true : contact.selected
    })));
  }, []);

  /**
   * Tout désélectionner
   */
  const deselectAll = useCallback(() => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: false
    })));
  }, []);

  /**
   * Sélectionner tous
   */
  const selectAll = useCallback(() => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: true
    })));
  }, []);

  /**
   * Envoyer les invitations
   */
  const sendInvitations = useCallback(async (options: {
    messagePersonnalise?: string;
    envoyerImmediatement?: boolean;
    respecterPreferences?: boolean;
  } = {}): Promise<BulkInvitationResult> => {
    try {
      setIsSending(true);
      setError(null);
      
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('📤 Envoi des invitations intelligentes...');
      
      const result = await smartInvitationsService.sendSmartInvitations(
        eventId,
        contactStates,
        {
          envoyerImmediatement: options.envoyerImmediatement ?? true,
          respecterPreferences: options.respecterPreferences ?? true,
          messagePersonnalise: options.messagePersonnalise
        },
        token
      );

      // Mettre à jour les états locaux
      setContactStates(prev => prev.map(contact => {
        const wasSent = result.invitations.some(
          inv => inv.destinataire.telephone === contact.target.telephone
        );
        return wasSent 
          ? { ...contact, invitationSent: true, selected: false }
          : contact;
      }));

      // Actualiser le tracking
      setTracking(result.tracking);

      console.log(`✅ ${result.success} invitations envoyées`);
      return result;
    } catch (err: any) {
      console.error('❌ Erreur envoi invitations:', err);
      setError(err.message || 'Erreur d\'envoi');
      throw err;
    } finally {
      setIsSending(false);
    }
  }, [eventId, contactStates]);

  /**
   * Envoyer des rappels intelligents
   */
  const sendReminders = useCallback(async (): Promise<number> => {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('🔔 Envoi de rappels intelligents...');
      const remindersSent = await smartInvitationsService.sendSmartReminders(eventId, token);
      
      // Actualiser le tracking après les rappels
      await loadTracking();
      
      console.log(`✅ ${remindersSent} rappels envoyés`);
      return remindersSent;
    } catch (err: any) {
      console.error('❌ Erreur envoi rappels:', err);
      throw err;
    }
  }, [eventId, loadTracking]);

  // Calculateurs
  const getSelectedCount = useCallback(() => {
    return contactStates.filter(c => c.selected && !c.invitationSent).length;
  }, [contactStates]);

  const getBobUsersCount = useCallback(() => {
    const selected = contactStates.filter(c => c.selected && !c.invitationSent);
    return {
      bob: selected.filter(c => c.target.estUtilisateurBob).length,
      noBob: selected.filter(c => !c.target.estUtilisateurBob).length
    };
  }, [contactStates]);

  const getChannelStats = useCallback(() => {
    const selected = contactStates.filter(c => c.selected && !c.invitationSent);
    const stats: Record<InvitationType, number> = {
      push: 0,
      sms: 0,
      whatsapp: 0,
      email: 0,
      mixte: 0
    };

    selected.forEach(contact => {
      stats[contact.canal]++;
    });

    return stats;
  }, [contactStates]);

  const getInvitationsSentCount = useCallback(() => {
    return contactStates.filter(c => c.invitationSent).length;
  }, [contactStates]);

  // Filtres
  const getContactsByFilter = useCallback((filter: 'all' | 'bob' | 'no-bob' | 'sent' | 'pending') => {
    return contactStates.filter(contact => {
      switch (filter) {
        case 'bob':
          return contact.target.estUtilisateurBob && !contact.invitationSent;
        case 'no-bob':
          return !contact.target.estUtilisateurBob && !contact.invitationSent;
        case 'sent':
          return contact.invitationSent;
        case 'pending':
          return !contact.invitationSent;
        case 'all':
        default:
          return true;
      }
    });
  }, [contactStates]);

  return {
    // Données
    smartTargets,
    contactStates,
    tracking,
    
    // États
    isLoading,
    isLoadingTracking,
    isSending,
    isRefreshing,
    error,
    
    // Actions
    refresh,
    toggleContactSelection,
    changeContactChannel,
    setCustomMessage,
    selectAllBobUsers,
    selectAllNonBobUsers,
    selectAll,
    deselectAll,
    sendInvitations,
    sendReminders,
    
    // Calculateurs
    getSelectedCount,
    getBobUsersCount,
    getChannelStats,
    getInvitationsSentCount,
    getContactsByFilter,
    
    // Helpers
    selectedContacts: contactStates.filter(c => c.selected && !c.invitationSent),
    invitationsSent: contactStates.filter(c => c.invitationSent)
  };
};