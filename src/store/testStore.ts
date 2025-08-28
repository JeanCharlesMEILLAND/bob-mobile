// src/store/testStore.ts - Store pour gérer les modes de test
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BobEvent } from '../types/events.extended.types';

export type TestMode = 'normal' | 'newUser' | 'invited' | 'withInvitation';

interface TestState {
  // Mode de test actuel
  testMode: TestMode;
  
  // Nom de la personne qui a invité (pour mode invited)
  invitedBy: string | null;
  
  // Invitation simulée pour démonstration
  mockInvitation: {
    event: BobEvent;
    invitedBy: string;
    invitedByAvatar?: string;
  } | null;

  // Activités créées par positionnement simulé
  createdActivities: any[];
  
  // Actions
  setTestMode: (mode: TestMode) => void;
  setInvitedBy: (name: string | null) => void;
  setMockInvitation: (invitation: any) => void;
  addCreatedActivity: (activity: any) => void;
  resetTest: () => void;
}

// Invitation mock pour démonstration
const createMockInvitation = () => ({
  event: {
    id: 'mock_event_123',
    documentId: 'mock_event_123',
    titre: 'Barbecue de quartier 🍖',
    description: 'Grand barbecue convivial dans le parc avec jeux pour les enfants et petits-fours. Amenez votre bonne humeur !',
    photo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 1 semaine
    dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // 4h plus tard
    lieu: {
      adresse: 'Parc des Buttes Chaumont, 75019 Paris',
      latitude: 48.8799,
      longitude: 2.3828,
      details: 'Proche de l\'entrée principale, sous les grands arbres'
    },
    maxParticipants: 25,
    organisateur: {
      id: 42,
      nom: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=150'
    },
    besoins: [
      {
        id: 'besoin_1',
        type: 'emprunt',
        categorie: 'objet',
        titre: 'Barbecue portable',
        description: 'Un barbecue portable pour griller saucisses et légumes',
        quantite: { demandee: 1, flexible: false },
        organisateurPositionne: false,
        assignations: [],
        statut: 'ouvert'
      },
      {
        id: 'besoin_2',
        type: 'service',
        categorie: 'service_individuel',
        titre: 'Apporter des boissons',
        description: 'Boissons fraîches pour tous les participants (sodas, eau)',
        organisateurPositionne: true,
        assignations: [],
        statut: 'partiellement_comble'
      },
      {
        id: 'besoin_3',
        type: 'service',
        categorie: 'service_collectif',
        titre: 'Aide installation tables',
        description: 'Aide pour installer et démonter les tables et chaises',
        maxPersonnes: 4,
        organisateurPositionne: true,
        assignations: [
          {
            id: 'assign_1',
            participantId: 42,
            participantNom: 'Marie Dubois',
            quantiteProposee: 1,
            dateAssignation: new Date().toISOString(),
            statut: 'accepte'
          }
        ],
        statut: 'partiellement_comble'
      },
      {
        id: 'besoin_4',
        type: 'service',
        categorie: 'service_timing',
        titre: 'Nettoyage final',
        description: 'Aide pour nettoyer le parc après la fête',
        timing: 'apres',
        organisateurPositionne: false,
        assignations: [],
        statut: 'ouvert'
      }
    ],
    statut: 'planifie',
    bobizRecompense: 15,
    dateCreation: new Date().toISOString(),
    metadata: {
      ciblage: {
        type: 'groups',
        groupes: ['voisins', 'famille'],
        includeUtilisateursBob: true,
        includeContactsSansBob: true
      },
      bobsIndividuelsCreés: [],
      chatGroupeId: 'chat_event_123'
    }
  } as BobEvent,
  invitedBy: 'Marie Dubois',
  invitedByAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b372?w=150'
});

// Version simplifiée sans persist pour éviter les erreurs
export const useTestStore = create<TestState>((set, get) => ({
  // État initial
  testMode: 'normal',
  invitedBy: null,
  mockInvitation: null,
  createdActivities: [],
  
  // Actions
  setTestMode: (mode) => {
    set({ 
      testMode: mode,
      mockInvitation: mode === 'withInvitation' ? createMockInvitation() : null
    });
    // Sauvegarde manuelle dans AsyncStorage
    try {
      AsyncStorage.setItem('testMode', mode);
    } catch (error) {
      console.warn('Erreur sauvegarde testMode:', error);
    }
  },
  
  setInvitedBy: (name) => {
    set({ invitedBy: name });
    // Sauvegarde manuelle dans AsyncStorage
    try {
      AsyncStorage.setItem('invitedBy', name || '');
    } catch (error) {
      console.warn('Erreur sauvegarde invitedBy:', error);
    }
  },

  setMockInvitation: (invitation) => {
    set({ mockInvitation: invitation });
  },

  addCreatedActivity: (activity) => {
    set((state) => ({ 
      createdActivities: [activity, ...state.createdActivities] 
    }));
  },
  
  resetTest: () => {
    set({ 
      testMode: 'normal',
      invitedBy: null,
      mockInvitation: null,
      createdActivities: []
    });
    // Nettoyage AsyncStorage
    try {
      AsyncStorage.removeItem('testMode');
      AsyncStorage.removeItem('invitedBy');
    } catch (error) {
      console.warn('Erreur nettoyage AsyncStorage:', error);
    }
  },
}));

// Fonction pour charger l'état depuis AsyncStorage au démarrage
export const initTestStore = async () => {
  try {
    const testMode = await AsyncStorage.getItem('testMode');
    const invitedBy = await AsyncStorage.getItem('invitedBy');
    
    if (testMode) {
      useTestStore.setState({ 
        testMode: testMode as TestMode,
        invitedBy: invitedBy || null
      });
    }
  } catch (error) {
    console.warn('Erreur chargement testStore:', error);
  }
};

// Helper pour debug
export const getTestInfo = () => {
  const state = useTestStore.getState();
  return {
    mode: state.testMode,
    invitedBy: state.invitedBy,
    isNewUser: state.testMode === 'newUser',
    isInvited: state.testMode === 'invited',
    isNormal: state.testMode === 'normal'
  };
};