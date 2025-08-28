// src/hooks/useEventInvitations.ts
import { useState, useEffect, useCallback } from 'react';
import { invitationsService } from '../services/invitations.service';
import { authService } from '../services/auth.service';
import {
  EventInvitationExtended,
  InvitationTrackingData
} from '../types/events.extended.types';

interface UseEventInvitationsProps {
  eventId: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // en millisecondes
}

interface EventInvitationStats {
  total: number;
  envoye: number;
  vue: number;
  accepte: number;
  refuse: number;
  expire: number;
  bobTelecharge: number;
}

export const useEventInvitations = ({ 
  eventId, 
  autoRefresh = false,
  refreshInterval = 30000 // 30 secondes par défaut
}: UseEventInvitationsProps) => {
  // États principaux
  const [invitations, setInvitations] = useState<EventInvitationExtended[]>([]);
  const [stats, setStats] = useState<EventInvitationStats | null>(null);
  const [tracking, setTracking] = useState<InvitationTrackingData | null>(null);
  
  // États de chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  
  // Erreurs
  const [error, setError] = useState<string | null>(null);

  /**
   * Charger les invitations de l'événement
   */
  const loadInvitations = useCallback(async () => {
    try {
      setError(null);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('📨 Chargement invitations événement:', eventId);
      
      // Charger les invitations via le service existant
      const eventInvitations = await invitationsService.getEventInvitations(eventId, token);
      
      // Convertir vers le format étendu si nécessaire
      const extendedInvitations: EventInvitationExtended[] = eventInvitations.map(inv => ({
        id: inv.id.toString(),
        evenement: inv.evenement,
        destinataire: {
          ...inv.destinataire,
          estUtilisateurBob: Boolean(inv.destinataire.id), // Si on a un ID utilisateur, c'est un utilisateur Bob
          groupeOrigine: inv.metadata?.groupeOrigine
        },
        statut: inv.statut,
        type: inv.type,
        dateEnvoi: inv.dateEnvoi,
        dateVue: inv.dateVue,
        dateReponse: inv.dateReponse,
        metadata: inv.metadata
      }));

      setInvitations(extendedInvitations);
      console.log(`✅ ${extendedInvitations.length} invitations chargées`);
    } catch (err: any) {
      console.error('❌ Erreur chargement invitations:', err);
      setError(err.message || 'Erreur de chargement');
    }
  }, [eventId]);

  /**
   * Charger les statistiques
   */
  const loadStats = useCallback(async () => {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('📊 Chargement statistiques invitations...');
      
      const eventStats = await invitationsService.getEventInvitationStats(eventId, token);
      
      const stats: EventInvitationStats = {
        total: eventStats.total,
        envoye: eventStats.envoye,
        vue: eventStats.vue,
        accepte: eventStats.accepte,
        refuse: eventStats.refuse,
        expire: eventStats.expire,
        bobTelecharge: 0 // TODO: À calculer depuis les invitations étendues
      };

      setStats(stats);
      console.log('✅ Statistiques chargées:', stats);
    } catch (err: any) {
      console.warn('⚠️ Impossible de charger les statistiques:', err);
      // Calculer les stats manuellement depuis les invitations
      if (invitations.length > 0) {
        const manualStats = calculateStatsFromInvitations(invitations);
        setStats(manualStats);
      }
    }
  }, [eventId, invitations]);

  /**
   * Calculer les statistiques manuellement
   */
  const calculateStatsFromInvitations = (invitationsList: EventInvitationExtended[]): EventInvitationStats => {
    return {
      total: invitationsList.length,
      envoye: invitationsList.filter(inv => inv.statut === 'envoye').length,
      vue: invitationsList.filter(inv => inv.statut === 'vue').length,
      accepte: invitationsList.filter(inv => inv.statut === 'accepte').length,
      refuse: invitationsList.filter(inv => inv.statut === 'refuse').length,
      expire: invitationsList.filter(inv => inv.statut === 'expire').length,
      bobTelecharge: invitationsList.filter(inv => inv.statut === 'bob_telecharge').length
    };
  };

  /**
   * Actualiser les données
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      loadInvitations(),
      loadStats()
    ]);
    setIsRefreshing(false);
  }, [loadInvitations, loadStats]);

  /**
   * Chargement initial
   */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadInvitations();
      await loadStats();
      setIsLoading(false);
    };
    
    init();
  }, [loadInvitations, loadStats]);

  /**
   * Auto-refresh périodique
   */
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!isLoading && !isRefreshing) {
        refresh();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, isLoading, isRefreshing, refresh]);

  /**
   * Envoyer des rappels
   */
  const sendReminders = useCallback(async (): Promise<number> => {
    try {
      setIsSendingReminders(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('🔔 Envoi de rappels...');
      const remindersSent = await invitationsService.remindEventInvitations(eventId, token);
      
      // Actualiser les données après l'envoi
      await refresh();
      
      console.log(`✅ ${remindersSent} rappels envoyés`);
      return remindersSent;
    } catch (err: any) {
      console.error('❌ Erreur envoi rappels:', err);
      throw err;
    } finally {
      setIsSendingReminders(false);
    }
  }, [eventId, refresh]);

  /**
   * Répondre à une invitation (pour test)
   */
  const respondToInvitation = useCallback(async (
    invitationId: string, 
    response: 'accepte' | 'refuse'
  ): Promise<void> => {
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token d\'authentification requis');

      console.log('📝 Réponse à invitation:', { invitationId, response });
      
      await invitationsService.respondToEventInvitation(
        parseInt(invitationId), 
        response, 
        token
      );
      
      // Mettre à jour localement
      setInvitations(prev => prev.map(inv => 
        inv.id === invitationId 
          ? { 
              ...inv, 
              statut: response, 
              dateReponse: new Date().toISOString() 
            }
          : inv
      ));

      // Actualiser les stats
      await loadStats();
      
      console.log('✅ Réponse enregistrée');
    } catch (err: any) {
      console.error('❌ Erreur réponse invitation:', err);
      throw err;
    }
  }, [loadStats]);

  // Filtres et calculateurs
  const getInvitationsByStatus = useCallback((status: string) => {
    return invitations.filter(inv => inv.statut === status);
  }, [invitations]);

  const getInvitationsByChannel = useCallback((channel: string) => {
    return invitations.filter(inv => inv.type === channel);
  }, [invitations]);

  const getBobUsersInvitations = useCallback(() => {
    return invitations.filter(inv => inv.destinataire.estUtilisateurBob);
  }, [invitations]);

  const getNonBobUsersInvitations = useCallback(() => {
    return invitations.filter(inv => !inv.destinataire.estUtilisateurBob);
  }, [invitations]);

  const getPendingInvitations = useCallback(() => {
    return invitations.filter(inv => 
      inv.statut === 'envoye' || inv.statut === 'vue'
    );
  }, [invitations]);

  const getAcceptanceRate = useCallback(() => {
    if (stats && stats.total > 0) {
      return Math.round((stats.accepte / stats.total) * 100);
    }
    return 0;
  }, [stats]);

  const getResponseRate = useCallback(() => {
    if (stats && stats.total > 0) {
      const responded = stats.accepte + stats.refuse;
      return Math.round((responded / stats.total) * 100);
    }
    return 0;
  }, [stats]);

  return {
    // Données
    invitations,
    stats,
    tracking,
    
    // États
    isLoading,
    isRefreshing,
    isSendingReminders,
    error,
    
    // Actions
    refresh,
    sendReminders,
    respondToInvitation,
    
    // Filtres et calculateurs
    getInvitationsByStatus,
    getInvitationsByChannel,
    getBobUsersInvitations,
    getNonBobUsersInvitations,
    getPendingInvitations,
    getAcceptanceRate,
    getResponseRate,
    
    // Helpers
    pendingInvitations: getPendingInvitations(),
    acceptedInvitations: getInvitationsByStatus('accepte'),
    refusedInvitations: getInvitationsByStatus('refuse'),
    bobInvitations: getBobUsersInvitations(),
    nonBobInvitations: getNonBobUsersInvitations()
  };
};