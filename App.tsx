// App.tsx - Version avec navigation interne simple + ContactsRepertoireScreen
import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './src/context';
import { useAuth } from './src/hooks';
import { LoadingScreen } from './src/components/common';
import { 
  LoginScreen, 
  ExchangesScreen, 
  EventsScreen, 
  ProfileScreen 
} from './src/screens';
import { CreateExchangeScreen, CreateBoberScreen, BoberCardScreen, BobTestScenario, DataInjectionScreen, VerifyStrapi } from './src/screens/exchanges';
import { ContactsRepertoireScreen } from './src/screens/contacts/ContactsRepertoireScreen';
import { BottomNavigation } from './src/components/navigation';
import { GlobalStyles, Colors } from './src/styles';
import { ScreenType } from './src/types';

import { NavigationContext } from './src/navigation/SimpleNavigation';

// Import i18n
import './src/i18n';

const AppContentSimple: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState<ScreenType>('home');
  const [navigationStack, setNavigationStack] = React.useState<Array<{screen: string, params?: any}>>([]);

  if (!isInitialized || isLoading) {
    return <LoadingScreen message={t('common.sessionCheck')} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const navigate = (screen: string, params?: any) => {
    console.log('🧭 Navigation vers:', screen, params);
    if (screen === 'CreateExchange' || screen === 'CreateBober' || screen === 'BoberCard' || screen === 'BobTest' || screen === 'DataInjection' || screen === 'VerifyStrapi') {
      setNavigationStack(prev => [...prev, { screen, params }]);
    }
  };

  const goBack = () => {
    console.log('⬅️ Retour navigation');
    setNavigationStack(prev => prev.slice(0, -1));
  };

  const renderScreen = () => {
    // Si on a un écran dans la pile, l'afficher
    if (navigationStack.length > 0) {
      const currentStackItem = navigationStack[navigationStack.length - 1];
      console.log('📱 Écran stack actuel:', currentStackItem);
      
      if (currentStackItem.screen === 'CreateExchange') {
        return <CreateExchangeScreen />;
      }
      
      if (currentStackItem.screen === 'CreateBober') {
        return <CreateBoberScreen boberType={currentStackItem.params?.boberType || 'pret'} />;
      }
      
      if (currentStackItem.screen === 'BoberCard') {
        return <BoberCardScreen 
          boberId={currentStackItem.params?.boberId}
          boberData={currentStackItem.params?.boberData}
        />;
      }

      if (currentStackItem.screen === 'BobTest') {
        return <BobTestScenario />;
      }

      if (currentStackItem.screen === 'DataInjection') {
        return <DataInjectionScreen />;
      }

      if (currentStackItem.screen === 'VerifyStrapi') {
        return <VerifyStrapi />;
      }
    }
    
    // Sinon, afficher l'écran principal selon l'onglet actif
    console.log('📱 Écran principal:', currentScreen);
    switch (currentScreen) {
      case 'events':
        return <EventsScreen />;
      case 'contacts':
        // 🎯 NOUVELLE INTERFACE: ContactsRepertoireScreen
        // Gère tout: scan, sélection, répertoire, invitations
        return <ContactsRepertoireScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <ExchangesScreen />;
    }
  };

  const navigateToTab = (tab: string) => {
    console.log('📱 Navigation vers onglet:', tab);
    setCurrentScreen(tab as ScreenType);
  };

  const navigationValue = {
    navigate,
    goBack,
    navigateToTab,
  };

  return (
    <NavigationContext.Provider value={navigationValue}>
      <View style={GlobalStyles.container}>
        {renderScreen()}
        {/* Masquer la navigation si on est sur un écran modal/secondaire */}
        {navigationStack.length === 0 && (
          <BottomNavigation
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
          />
        )}
      </View>
    </NavigationContext.Provider>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={GlobalStyles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <AppContentSimple />
      </SafeAreaView>
    </AuthProvider>
  );
}