// src/types/navigation.types.ts
// =============================================================================
// 1. src/types/navigation.types.ts - Types de navigation mis à jour
// =============================================================================

export type ScreenType = 
  | 'home' 
  | 'events' 
  | 'contacts' 
  | 'profile'
  | 'invite-contacts'
  | 'contacts-groups'    // Optionnel - pour vos écrans existants
  | 'repertoire';        // Optionnel - pour vos écrans existants

export interface BottomNavigationProps {
  currentScreen: ScreenType;
  onScreenChange: (screen: ScreenType) => void;
}

export interface TabItem {
  id: ScreenType;
  label: string;
  icon: string;
}