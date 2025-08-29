// src/types/navigation.types.ts
// =============================================================================
// 1. src/types/navigation.types.ts - Types de navigation mis à jour
// =============================================================================

export type ScreenType = 
  | 'home'               // Nouvelle structure - ExchangesScreen
  | 'contacts'           // Gestion des contacts
  | 'chat'               // Chat style WhatsApp
  | 'profile'            // Profil utilisateur
  | 'events'             // Gardé pour compatibilité
  | 'invite-contacts'    // Gardé pour compatibilité
  | 'contacts-groups'    // Gardé pour compatibilité
  | 'repertoire';        // Gardé pour compatibilité

export interface BottomNavigationProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export interface TabItem {
  id: ScreenType;
  label: string;
  icon: string;
  subtitle?: string;
}