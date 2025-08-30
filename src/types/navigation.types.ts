// src/types/navigation.types.ts - Types pour la navigation
export type TabType = 'home' | 'contacts' | 'exchanges' | 'events' | 'profile';
export type ScreenType = 'login' | 'main' | 'modal';
export type ModalType = 'createExchange' | 'createEvent' | 'createBober' | null;

export interface NavigationState {
  currentScreen: ScreenType;
  currentTab: TabType;
  currentModal: ModalType;
}

export interface NavigationActions {
  navigateToTab: (tab: TabType) => void;
  navigateToScreen: (screen: ScreenType) => void;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  goBack: () => void;
}

export type NavigationContextType = NavigationState & NavigationActions;