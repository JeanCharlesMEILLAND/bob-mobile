// src/screens/exchanges/ExchangesScreenMain.tsx - Composant principal
import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { ExchangesScreenMobile } from './ExchangesScreenMobile';
import { ExchangesScreenWeb } from './ExchangesScreen.web';

export const ExchangesScreen: React.FC = () => {
  // Utiliser la version web si on est sur web et que l'écran est assez large
  if (Platform.OS === 'web') {
    const { width } = Dimensions.get('window');
    const isLargeScreen = width > 1024;
    
    if (isLargeScreen) {
      return <ExchangesScreenWeb />;
    }
  }

  return <ExchangesScreenMobile />;
};