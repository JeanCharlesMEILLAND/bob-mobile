// App.tsx - Version avec navigation interne simple + ContactsRepertoireScreen
import React from 'react';
import { SafeAreaView, StatusBar, View, Text, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './src/context';
import { useAuth } from './src/hooks';
import { LoadingScreen, SmartNotifications } from './src/components/common';
import { 
  LoginScreen, 
  EventsScreen, 
  ProfileScreen 
} from './src/screens';
// Écrans principaux
import { HomeScreen, ContactsScreen, ChatListScreen } from './src/screens/main';
import { ExchangesScreenWeb } from './src/screens/exchanges';

// Écrans modaux
import { CreateExchangeScreen, CreateBoberScreen, CreateEventScreen } from './src/screens/modals';

// Écrans de flux (legacy)
import { BoberCardScreen, BobTestScenario, DataInjectionScreen, VerifyStrapi } from './src/screens/exchanges';
// import { ContactsSelectionScreen } from './src/screens/contacts/ContactsSelectionScreen'; // 🔧 DÉSACTIVÉ - Utiliser l'interface locale
// import { InvitationContactsScreen } from './src/screens/contacts/InvitationContactsScreen'; // ⚠️ MOVED TO deprecated/
import { ChatScreen } from './src/screens/chat';
import { BottomNavigation } from './src/components/navigation';
import { GlobalStyles, Colors } from './src/styles';
import { WebStyles, isWebDesktop } from './src/styles/web';
import { ScreenType } from './src/types';
import './src/utils/webCSS';

import { NavigationContext } from './src/navigation/SimpleNavigation';

// Import i18n
import './src/i18n';

// Fonction d'urgence pour déconnexion (dev uniquement)
const forceLogout = async () => {
  try {
    const { authService } = await import('./src/services');
    await authService.logout();
    console.log('🚪 Déconnexion forcée réussie');
    // Recharger l'app
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Erreur déconnexion forcée:', error);
  }
};

// Exposer globalement pour debug console
if (typeof window !== 'undefined') {
  (window as any).forceLogout = forceLogout;
}

const AppContentSimple: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, isInitialized, logout } = useAuth();
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
    
    // 🔧 FIX: Bloquer la navigation vers les écrans de sélection de contacts (utiliser l'interface locale)
    if (screen === 'ContactsSelection' || screen === 'SelectionContactsScreen') {
      console.log('⚠️ Navigation vers écran de sélection bloquée - Activation interface locale');
      
      // 🔧 SOLUTION REACT NATIVE: Utiliser une notification globale via DeviceEventEmitter
      const { DeviceEventEmitter } = require('react-native');
      setTimeout(() => {
        DeviceEventEmitter.emit('forceShowSelectionInterface');
        console.log('📡 Événement global émis via DeviceEventEmitter');
      }, 100);
      
      return;
    }
    
    if (screen === 'CreateExchange' || screen === 'CreateBober' || screen === 'BoberCard' || screen === 'BobTest' || screen === 'DataInjection' || screen === 'VerifyStrapi' || screen === 'CreateEvent' || screen === 'Chat' || screen === 'ContactsList') { // InvitationContactsScreen removed (deprecated)
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
        if (!VerifyStrapi) {
          console.error('❌ VerifyStrapi est undefined ! Problème d\'import');
          return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' }}>
              <Text style={{ fontSize: 18, color: '#DC2626', textAlign: 'center', margin: 20 }}>
                Erreur: Composant VerifyStrapi non trouvé
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                Problème d'import/export du composant
              </Text>
            </View>
          );
        }
        return <VerifyStrapi />;
      }

      if (currentStackItem.screen === 'CreateEvent') {
        return <CreateEventScreen />;
      }

      if (currentStackItem.screen === 'ContactsList') {
        return <ContactsScreen />; // Using main ContactsScreen instead
      }

      if (currentStackItem.screen === 'Chat') {
        return <ChatScreen 
          chatId={currentStackItem.params?.chatId || 'bob_chat_001'}
          chatTitle={currentStackItem.params?.chatTitle}
          contactId={currentStackItem.params?.contactId}
          contactName={currentStackItem.params?.contactName}
          contactPhone={currentStackItem.params?.contactPhone}
          isOnline={currentStackItem.params?.isOnline}
        />;
      }

      // 🔧 ContactsSelection désactivé - Utiliser l'interface locale dans ContactsScreen

      // InvitationContactsScreen moved to deprecated/ - functionality integrated elsewhere
    }
    
    // Sinon, afficher l'écran principal selon l'onglet actif
    console.log('📱 Écran principal:', currentScreen);
    switch (currentScreen) {
      case 'home':
        return <HomeScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'chat':
        return <ChatListScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'events':  // Gardé pour compatibilité
        return <EventsScreen />;
      default:
        return <HomeScreen />; // Fallback sur home
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

  const isDesktop = isWebDesktop();

  return (
    <NavigationContext.Provider value={navigationValue}>
      <View style={[GlobalStyles.container, isDesktop && { flexDirection: 'row' }]}>
        
        {/* Contenu principal */}
        <View style={[
          { flex: 1 },
          isDesktop && { 
            marginLeft: 280, 
            minHeight: '100vh',
            backgroundColor: '#F8FAFC',
            ...(Platform.OS === 'web' && {
              transition: 'margin-left 0.3s ease-in-out',
            }),
          }
        ]}>
          <View style={[
            { flex: 1 },
            isDesktop && {
              padding: 24,
              maxWidth: 1200,
              alignSelf: 'center',
              width: '100%',
            }
          ]}>
            {renderScreen()}
          </View>
        </View>

        {/* Navigation - Toujours visible */}
        <BottomNavigation
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
        
        {/* Notifications intelligentes - TEMPORAIREMENT DÉSACTIVÉES */}
        {/* <SmartNotifications position="bottom" maxVisible={3} /> */}
        
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