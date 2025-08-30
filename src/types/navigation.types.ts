// src/types/navigation.types.ts - Types pour la navigation
export type TabType = 'home' | 'contacts' | 'exchanges' | 'events' | 'profile';
export type ScreenType = 'home' | 'contacts' | 'chat' | 'profile' | 'events' | 'login' | 'main' | 'modal';
export type ModalType = 'createExchange' | 'createEvent' | 'createBober' | null;

export interface NavigationState {
  currentScreen: ScreenType;
  currentTab: TabType;
  currentModal: ModalType;
}

export interface NavigationActions {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  navigateToTab: (tab: string) => void;
  navigateToScreen?: (screen: ScreenType) => void;
  openModal?: (modal: ModalType) => void;
  closeModal?: () => void;
}

export type NavigationContextType = {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  navigateToTab: (tab: string) => void;
  currentScreen?: ScreenType;
  currentTab?: TabType;
  currentModal?: ModalType;
};