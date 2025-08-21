// App.tsx - Version avec navigation interne simple + ContactsRepertoireScreen
import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/context';
import { useAuth } from './src/hooks';
import { LoadingScreen } from './src/components/common';
import { 
  LoginScreen, 
  ExchangesScreen, 
  EventsScreen, 
  ProfileScreen 
} from './src/screens';
import { ContactsRepertoireScreen } from './src/screens/contacts/ContactsRepertoireScreen';
import { BottomNavigation } from './src/components/navigation';
import { GlobalStyles, Colors } from './src/styles';
import { ScreenType } from './src/types';

const AppContentSimple: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const [currentScreen, setCurrentScreen] = React.useState<ScreenType>('home');

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Vérification de la session..." />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const renderScreen = () => {
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

  return (
    <View style={GlobalStyles.container}>
      {renderScreen()}
      <BottomNavigation
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </View>
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