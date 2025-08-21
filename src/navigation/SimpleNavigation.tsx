// src/navigation/SimpleNavigation.tsx
import React from 'react';

// Context pour gérer la navigation interne
interface NavigationContextType {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
  navigateToTab?: (tab: string) => void;
}

export const NavigationContext = React.createContext<NavigationContextType>({
  navigate: () => {},
  goBack: () => {},
  navigateToTab: () => {},
});

// Hook pour utiliser la navigation simple
export const useSimpleNavigation = () => {
  const context = React.useContext(NavigationContext);
  if (!context) {
    throw new Error('useSimpleNavigation must be used within NavigationContext');
  }
  return context;
};