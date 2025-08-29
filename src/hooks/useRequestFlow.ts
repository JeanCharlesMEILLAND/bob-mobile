// src/hooks/useRequestFlow.ts - Hook pour gérer les flux de demandes
import { useState, useEffect, useCallback } from 'react';
import { requestFlowService, RequestsHub } from '../services/requestFlow.service';
import { bobCreationService, EventCreationData } from '../services/bobCreation.service';
import { BobCreationData, ActiveBob } from '../types/bob.types';
import { Event } from '../types/app.types';
import { useAuth } from './auth/useAuth';

export interface UseRequestFlowResult {
  // États des données
  demandesActions: RequestsHub;
  activeBobs: ActiveBob[];
  myEvents: Event[];
  loading: boolean;
  error: string | null;
  
  // Compteurs pour badges
  totalPendingCount: number;
  activeBobsCount: number;
  myEventsCount: number;
  
  // Actions de gestion des demandes
  acceptDirectRequest: (requestId: string) => Promise<void>;
  acceptEventInvitation: (invitationId: string) => Promise<void>;
  acceptEventNeed: (eventId: string, needId: string) => Promise<void>;
  
  // Actions de création
  createBob: (data: BobCreationData) => Promise<string>;
  createEvent: (data: EventCreationData) => Promise<string>;
  positionOnEventNeed: (eventId: string, needId: string) => Promise<void>;
  
  // Refresh
  refreshData: () => Promise<void>;
  
  // États de loading spécifiques
  isAcceptingRequest: boolean;
  isCreatingBob: boolean;
  isCreatingEvent: boolean;
}

export const useRequestFlow = (): UseRequestFlowResult => {
  // États principaux
  const [demandesActions, setDemandesActions] = useState<RequestsHub>({
    directRequests: [],
    eventInvitations: [],
    eventNeeds: []
  });
  const [activeBobs, setActiveBobs] = useState<ActiveBob[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  
  // États de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAcceptingRequest, setIsAcceptingRequest] = useState(false);
  const [isCreatingBob, setIsCreatingBob] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  
  // Auth
  const { user } = useAuth();
  
  // =================== INITIALISATION ===================
  
  useEffect(() => {
    if (user) {
      // Configurer les services avec l'utilisateur
      requestFlowService.setCurrentUser(user);
      bobCreationService.setCurrentUser(user);
      
      // Charger les données initiales
      refreshData();
    }
  }, [user]);
  
  // =================== CHARGEMENT DES DONNÉES ===================
  
  const refreshData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Refresh des données RequestFlow...');
      
      // Charger toutes les données en parallèle
      const [demandesActionsData, activeBobsData, myEventsData] = await Promise.all([
        requestFlowService.getDemandesActions(),
        requestFlowService.getActiveBobs(),
        requestFlowService.getMyEvents()
      ]);
      
      setDemandesActions(demandesActionsData);
      setActiveBobs(activeBobsData);
      setMyEvents(myEventsData);
      
      console.log('✅ Données RequestFlow chargées:', {
        demandesActions: demandesActionsData,
        activeBobs: activeBobsData.length,
        myEvents: myEventsData.length
      });
      
    } catch (err) {
      console.error('❌ Erreur chargement données RequestFlow:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // =================== ACTIONS D'ACCEPTATION ===================
  
  const acceptDirectRequest = useCallback(async (requestId: string) => {
    try {
      setIsAcceptingRequest(true);
      setError(null);
      
      console.log('🤝 Acceptation demande directe:', requestId);
      
      const newBob = await requestFlowService.acceptDirectRequest(requestId);
      
      // Mettre à jour les états localement
      setDemandesActions(prev => ({
        ...prev,
        directRequests: prev.directRequests.filter(req => req.id !== requestId)
      }));
      
      setActiveBobs(prev => [...prev, newBob]);
      
      console.log('✅ Demande directe acceptée:', newBob);
      
    } catch (err) {
      console.error('❌ Erreur acceptation demande directe:', err);
      setError(err instanceof Error ? err.message : 'Erreur acceptation demande');
    } finally {
      setIsAcceptingRequest(false);
    }
  }, []);
  
  const acceptEventInvitation = useCallback(async (invitationId: string) => {
    try {
      setIsAcceptingRequest(true);
      setError(null);
      
      console.log('🎉 Acceptation invitation événement:', invitationId);
      
      const joinedEvent = await requestFlowService.acceptEventInvitation(invitationId);
      
      // Mettre à jour les états localement
      setDemandesActions(prev => ({
        ...prev,
        eventInvitations: prev.eventInvitations.filter(inv => inv.id !== invitationId)
      }));
      
      setMyEvents(prev => [...prev, joinedEvent]);
      
      console.log('✅ Invitation événement acceptée:', joinedEvent);
      
    } catch (err) {
      console.error('❌ Erreur acceptation invitation:', err);
      setError(err instanceof Error ? err.message : 'Erreur acceptation invitation');
    } finally {
      setIsAcceptingRequest(false);
    }
  }, []);
  
  const acceptEventNeed = useCallback(async (eventId: string, needId: string) => {
    try {
      setIsAcceptingRequest(true);
      setError(null);
      
      console.log('🎯 Acceptation besoin événement:', { eventId, needId });
      
      const newBob = await requestFlowService.acceptEventNeed(eventId, needId);
      
      // Mettre à jour les états localement
      setDemandesActions(prev => ({
        ...prev,
        eventNeeds: prev.eventNeeds.filter(need => need.id !== needId)
      }));
      
      setActiveBobs(prev => [...prev, newBob]);
      
      console.log('✅ Besoin événement accepté:', newBob);
      
    } catch (err) {
      console.error('❌ Erreur acceptation besoin événement:', err);
      setError(err instanceof Error ? err.message : 'Erreur acceptation besoin');
    } finally {
      setIsAcceptingRequest(false);
    }
  }, []);
  
  // =================== ACTIONS DE CRÉATION ===================
  
  const createBob = useCallback(async (data: BobCreationData): Promise<string> => {
    try {
      setIsCreatingBob(true);
      setError(null);
      
      console.log('🏠 Création BOB individuel:', data);
      
      const bobId = await bobCreationService.createIndividualBob(data);
      
      // Refresh pour voir les nouvelles demandes générées
      await refreshData();
      
      console.log('✅ BOB individuel créé:', bobId);
      return bobId;
      
    } catch (err) {
      console.error('❌ Erreur création BOB:', err);
      setError(err instanceof Error ? err.message : 'Erreur création BOB');
      throw err;
    } finally {
      setIsCreatingBob(false);
    }
  }, [refreshData]);
  
  const createEvent = useCallback(async (data: EventCreationData): Promise<string> => {
    try {
      setIsCreatingEvent(true);
      setError(null);
      
      console.log('🎉 Création événement:', data);
      
      const eventId = await bobCreationService.createEvent(data);
      
      // Refresh pour voir le nouvel événement et les invitations générées
      await refreshData();
      
      console.log('✅ Événement créé:', eventId);
      return eventId;
      
    } catch (err) {
      console.error('❌ Erreur création événement:', err);
      setError(err instanceof Error ? err.message : 'Erreur création événement');
      throw err;
    } finally {
      setIsCreatingEvent(false);
    }
  }, [refreshData]);
  
  const positionOnEventNeed = useCallback(async (eventId: string, needId: string) => {
    try {
      setIsAcceptingRequest(true);
      setError(null);
      
      console.log('🎯 Positionnement sur besoin:', { eventId, needId });
      
      const newBob = await bobCreationService.positionOnEventNeed(eventId, needId);
      
      // Mettre à jour les états localement
      setActiveBobs(prev => [...prev, newBob]);
      
      // Optionnel: refresh complet pour synchroniser tout
      await refreshData();
      
      console.log('✅ Positionnement réussi:', newBob);
      
    } catch (err) {
      console.error('❌ Erreur positionnement besoin:', err);
      setError(err instanceof Error ? err.message : 'Erreur positionnement besoin');
    } finally {
      setIsAcceptingRequest(false);
    }
  }, [refreshData]);
  
  // =================== COMPTEURS ===================
  
  const totalPendingCount = 
    demandesActions.directRequests.length + 
    demandesActions.eventInvitations.length + 
    demandesActions.eventNeeds.length;
    
  const activeBobsCount = activeBobs.filter(bob => bob.status === 'active').length;
  const myEventsCount = myEvents.length;
  
  // =================== RETOUR DU HOOK ===================
  
  return {
    // États des données
    demandesActions,
    activeBobs,
    myEvents,
    loading,
    error,
    
    // Compteurs
    totalPendingCount,
    activeBobsCount,
    myEventsCount,
    
    // Actions
    acceptDirectRequest,
    acceptEventInvitation,
    acceptEventNeed,
    createBob,
    createEvent,
    positionOnEventNeed,
    refreshData,
    
    // États de loading
    isAcceptingRequest,
    isCreatingBob,
    isCreatingEvent
  };
};