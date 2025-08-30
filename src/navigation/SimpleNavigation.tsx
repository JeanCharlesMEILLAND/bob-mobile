// src/navigation/SimpleNavigation.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TabType, ScreenType, ModalType, NavigationContextType, NavigationState, NavigationActions } from '../types/navigation.types';

export const NavigationContext = createContext<NavigationContextType | null>(null);

export const useSimpleNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useSimpleNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('main');
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [currentModal, setCurrentModal] = useState<ModalType>(null);

  const navigateToTab = (tab: TabType) => {
    setCurrentTab(tab);
    setCurrentScreen('main');
  };

  const navigateToScreen = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const openModal = (modal: ModalType) => {
    setCurrentModal(modal);
  };

  const closeModal = () => {
    setCurrentModal(null);
  };

  const goBack = () => {
    if (currentModal) {
      closeModal();
    } else if (currentScreen !== 'main') {
      setCurrentScreen('main');
    }
  };

  const value: NavigationContextType = {
    currentScreen,
    currentTab,
    currentModal,
    navigateToTab,
    navigateToScreen,
    openModal,
    closeModal,
    goBack
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};