// src/navigation/NavigationContainer.tsx - Navigation principale avec React Navigation

import React from 'react';
import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { useAuth } from '../hooks';
import { LoadingScreen } from '../components/common';
import { LoginScreen } from '../screens';
import { navigationRef, navigationService } from './NavigationService';

// Écrans principaux
import { HomeScreen, ContactsScreen, ChatListScreen } from '../screens/main';
import { ProfileScreen } from '../screens';

// Écrans modaux
import { CreateExchangeScreen, CreateBoberScreen, CreateEventScreen } from '../screens/modals';

// Écrans de flux
import { BoberCardScreen, BobTestScenario, DataInjectionScreen, VerifyStrapi } from '../screens/exchanges';
import { ChatScreen } from '../screens/chat';

// Types de navigation
export type RootStackParamList = {
  // Auth
  Login: undefined;
  
  // Main app
  MainApp: undefined;
  
  // Écrans modaux
  CreateExchange: undefined;
  CreateBober: { boberType?: string };
  CreateEvent: undefined;
  
  // Détails
  BoberCard: { boberId?: string; boberData?: any };
  Chat: {
    chatId: string;
    chatTitle?: string;
    contactId?: string;
    contactName?: string;
    contactPhone?: string;
    isOnline?: boolean;
  };
  
  // Debug/Test
  BobTest: undefined;
  DataInjection: undefined;
  VerifyStrapi: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  ChatList: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// =================== TAB NAVIGATOR ===================

const TabBarIcon = ({ focused, name }: { focused: boolean; name: string }) => {
  const icons = {
    Home: focused ? '🏠' : '🏡',
    Contacts: focused ? '👥' : '👤',
    ChatList: focused ? '💬' : '💭',
    Profile: focused ? '👤' : '👨',
  };

  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {icons[name as keyof typeof icons]}
    </Text>
  );
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabBarIcon focused={focused} name={route.name} />
        ),
        tabBarActiveTintColor: '#EC4899',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <Tab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ title: 'Contacts' }}
      />
      <Tab.Screen 
        name="ChatList" 
        component={ChatListScreen}
        options={{ title: 'Messages' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

// =================== STACK NAVIGATOR ===================

function AuthenticatedStack() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="MainApp"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      {/* App principal avec tabs */}
      <Stack.Screen 
        name="MainApp" 
        component={MainTabNavigator}
      />
      
      {/* Écrans modaux */}
      <Stack.Screen 
        name="CreateExchange" 
        component={CreateExchangeScreen}
        options={{
          headerShown: true,
          title: 'Créer un BOB',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="CreateBober" 
        component={CreateBoberScreen}
        options={{
          headerShown: true,
          title: 'Nouveau BOB',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen 
        name="CreateEvent" 
        component={CreateEventScreen}
        options={{
          headerShown: true,
          title: 'Créer un événement',
          presentation: 'modal',
        }}
      />
      
      {/* Écrans de détail */}
      <Stack.Screen 
        name="BoberCard" 
        component={BoberCardScreen}
        options={{
          headerShown: true,
          title: 'Détail BOB',
        }}
      />
      
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.chatTitle || 'Discussion',
        })}
      />
      
      {/* Écrans debug/test */}
      <Stack.Screen 
        name="BobTest" 
        component={BobTestScenario}
        options={{
          headerShown: true,
          title: 'Tests BOB',
        }}
      />
      
      <Stack.Screen 
        name="DataInjection" 
        component={DataInjectionScreen}
        options={{
          headerShown: true,
          title: 'Injection données',
        }}
      />
      
      <Stack.Screen 
        name="VerifyStrapi" 
        component={VerifyStrapi}
        options={{
          headerShown: true,
          title: 'Vérification Strapi',
        }}
      />
    </Stack.Navigator>
  );
}

// =================== ROOT NAVIGATOR ===================

function RootNavigator() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingScreen message="Initialisation..." />;
  }

  return (
    <Stack.Navigator id={undefined} screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="MainApp" component={AuthenticatedStack} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}

// =================== NAVIGATION CONTAINER ===================

const linking = {
  prefixes: ['bobapp://', 'https://bobapp.fr', 'https://bob.local'],
  config: {
    screens: {
      Login: 'login',
      MainApp: {
        screens: {
          Home: 'home',
          Contacts: 'contacts',
          ChatList: 'messages',
          Profile: 'profile',
        },
      },
      CreateExchange: 'create-exchange',
      CreateBober: {
        path: 'create-bob/:boberType?',
        parse: {
          boberType: (boberType: string) => boberType || 'pret',
        },
      },
      CreateEvent: 'create-event',
      BoberCard: {
        path: 'bob/:boberId',
        parse: {
          boberId: (boberId: string) => boberId,
        },
      },
      Chat: {
        path: 'chat/:chatId',
        parse: {
          chatId: (chatId: string) => chatId,
        },
        stringify: {
          chatId: (chatId: string) => chatId,
        },
      },
      BobTest: 'test',
      DataInjection: 'data-injection',
      VerifyStrapi: 'verify-strapi',
    },
  },
};

export default function NavigationContainer() {
  return (
    <RNNavigationContainer 
      ref={navigationRef}
      linking={linking}
      fallback={<LoadingScreen message="Navigation..." />}
      onReady={() => {
        console.log('🧭 Navigation prête avec deep linking');
        navigationService.logNavigation('AppReady');
      }}
      onStateChange={(state) => {
        const currentRoute = state?.routes?.[state.index];
        if (currentRoute) {
          console.log('🧭 Navigation state:', currentRoute.name);
          navigationService.logNavigation(currentRoute.name, currentRoute.params);
        }
      }}
    >
      <RootNavigator />
    </RNNavigationContainer>
  );
}

// =================== STYLES ===================

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    height: 80,
    paddingBottom: 12,
    paddingTop: 18,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
});