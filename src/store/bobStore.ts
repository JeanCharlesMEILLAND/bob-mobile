import { create } from 'zustand';
import { bobService } from '../services/bobService';
import { Groupe, Echange, Evenement, Message, BobizTransaction } from '../types';

interface BobStore {
  // Ã‰tat
  groupes: Groupe[];
  echanges: Echange[];
  evenements: Evenement[];
  messages: Message[];
  bobizTransactions: BobizTransaction[];
  isLoading: boolean;
  
  // Actions Groupes
  loadGroupes: () => Promise<void>;
  createGroupe: (data: Partial<Groupe>) => Promise<void>;
  
  // Actions Ã‰changes
  loadEchanges: () => Promise<void>;
  createEchange: (data: Partial<Echange>) => Promise<void>;
  
  // Actions Ã‰vÃ©nements
  loadEvenements: () => Promise<void>;
  createEvenement: (data: Partial<Evenement>) => Promise<void>;
  
  // Actions Messages
  loadMessages: (type: string, id: number) => Promise<void>;
  sendMessage: (data: Partial<Message>) => Promise<void>;
  
  // Actions Bobiz
  loadBobizTransactions: () => Promise<void>;
}

export const useBobStore = create<BobStore>((set, get) => ({
  // Ã‰tat initial
  groupes: [],
  echanges: [],
  evenements: [],
  messages: [],
  bobizTransactions: [],
  isLoading: false,

  // === GROUPES ===
  loadGroupes: async () => {
    try {
      set({ isLoading: true });
      const groupes = await bobService.getGroupes();
      set({ groupes, isLoading: false });
    } catch (error: any) {
      console.error('Erreur chargement groupes:', error);
      set({ isLoading: false });
    }
  },

  createGroupe: async (data) => {
    try {
      const newGroupe = await bobService.createGroupe(data);
      const groupes = [...get().groupes, newGroupe];
      set({ groupes });
    } catch (error: any) {
      console.error('Erreur crÃ©ation groupe:', error);
      throw error;
    }
  },

  // === Ã‰CHANGES ===
  loadEchanges: async () => {
    try {
      set({ isLoading: true });
      const echanges = await bobService.getEchanges();
      set({ echanges, isLoading: false });
    } catch (error: any) {
      console.error('Erreur chargement Ã©changes:', error);
      set({ isLoading: false });
    }
  },

  createEchange: async (data) => {
    try {
      const newEchange = await bobService.createEchange(data);
      const echanges = [...get().echanges, newEchange];
      set({ echanges });
    } catch (error: any) {
      console.error('Erreur crÃ©ation Ã©change:', error);
      throw error;
    }
  },

  // === Ã‰VÃ‰NEMENTS ===
  loadEvenements: async () => {
    try {
      set({ isLoading: true });
      const evenements = await bobService.getEvenements();
      set({ evenements, isLoading: false });
    } catch (error: any) {
      console.error('Erreur chargement Ã©vÃ©nements:', error);
      set({ isLoading: false });
    }
  },

  createEvenement: async (data) => {
    try {
      const newEvenement = await bobService.createEvenement(data);
      const evenements = [...get().evenements, newEvenement];
      set({ evenements });
    } catch (error: any) {
      console.error('Erreur crÃ©ation Ã©vÃ©nement:', error);
      throw error;
    }
  },

  // === MESSAGES ===
  loadMessages: async (type, id) => {
    try {
      const messages = await bobService.getMessages(type, id);
      set({ messages });
    } catch (error: any) {
      console.error('Erreur chargement messages:', error);
    }
  },

  sendMessage: async (data) => {
    try {
      const newMessage = await bobService.sendMessage(data);
      const messages = [...get().messages, newMessage];
      set({ messages });
    } catch (error: any) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  },

  // === BOBIZ ===
  loadBobizTransactions: async () => {
    try {
      const bobizTransactions = await bobService.getBobizTransactions();
      set({ bobizTransactions });
    } catch (error: any) {
      console.error('Erreur chargement transactions Bobiz:', error);
    }
  },
}));
