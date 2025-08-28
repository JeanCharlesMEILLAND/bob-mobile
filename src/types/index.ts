// src/types/index.ts
export * from './auth.types';
export * from './navigation.types';
export * from './contacts.types';
export * from './events.extended.types';

// Temporary types for compatibility
export interface Echange {
  id: string;
  titre: string;
  description: string;
  type: string;
}

export interface Evenement {
  id: string;
  titre: string;
  description: string;
  date: string;
}

export interface Message {
  id: string;
  contenu: string;
  auteur: string;
  date: string;
}

export interface BobizTransaction {
  id: string;
  montant: number;
  type: string;
  date: string;
}