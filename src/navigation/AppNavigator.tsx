import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Ã‰crans
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ExchangesScreen } from '../screens/exchanges/ExchangesScreen';
import { CreateExchangeScreen } from '../screens/exchanges/CreateExchangeScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { ContactsScreen } from '../screens/contacts/ContactsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

// Store
import { useAuthStore } from '../store/authStore';

const RootStack = createStackNavigator();
const AuthStack = createStackNavigator();
const MainTab = createBottomTabNavigator();
const ExchangesStack = createStackNavigator();

// Stack Authentification
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// Stack Échanges
function ExchangesNavigator() {
  return (
    <ExchangesStack.Navigator screenOptions={{ headerShown: false }}>
      <ExchangesStack.Screen name="ExchangesList" component={ExchangesScreen} />
      <ExchangesStack.Screen name="CreateExchange" component={CreateExchangeScreen} />
    </ExchangesStack.Navigator>
  );
}

// Tabs principales
function MainNavigator() {
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          // TODO: Ajouter les vraies icÃ´nes plus tard
          return null;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <MainTab.Screen 
        name="Exchanges" 
        component={ExchangesNavigator}
        options={{ tabBarLabel: 'Ã‰changes' }}
      />
      <MainTab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{ tabBarLabel: 'Ã‰vÃ©nements' }}
      />
      <MainTab.Screen 
        name="Contacts" 
        component={ContactsScreen}
        options={{ tabBarLabel: 'Contacts' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil' }}
      />
    </MainTab.Navigator>
  );
}

// Navigation principale
export default function AppNavigator() {
  const { isAuthenticated, loadStoredAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, []);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
