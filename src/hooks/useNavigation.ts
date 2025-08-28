// src/hooks/useNavigation.ts - Hooks de navigation avec deep linking

import { useNavigation as useRNNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useCallback } from 'react';
import { RootStackParamList, MainTabParamList } from '../navigation/NavigationContainer';

type RootNavigationProp = NavigationProp<RootStackParamList>;
type TabNavigationProp = NavigationProp<MainTabParamList>;

// =================== NAVIGATION HOOKS ===================

/**
 * Hook principal de navigation
 */
export function useNavigation() {
  const navigation = useRNNavigation<RootNavigationProp>();

  const navigateTo = useCallback((screen: keyof RootStackParamList, params?: any) => {
    console.log('🧭 Navigation vers:', screen, params);
    navigation.navigate(screen as any, params);
  }, [navigation]);

  const navigateToTab = useCallback((tab: keyof MainTabParamList) => {
    console.log('🧭 Navigation vers onglet:', tab);
    // Pour naviguer vers un onglet, on va vers MainApp puis l'onglet
    navigation.navigate('MainApp' as any);
    // Puis on navigue vers l'onglet spécifique
    setTimeout(() => {
      navigation.navigate('MainApp' as any, { 
        screen: tab as any 
      });
    }, 100);
  }, [navigation]);

  const goBack = useCallback(() => {
    console.log('⬅️ Navigation retour');
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const resetToHome = useCallback(() => {
    console.log('🏠 Reset vers accueil');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  }, [navigation]);

  const openModal = useCallback((modal: 'CreateExchange' | 'CreateBober' | 'CreateEvent', params?: any) => {
    console.log('📱 Ouverture modal:', modal, params);
    navigation.navigate(modal, params);
  }, [navigation]);

  return {
    // Navigation de base
    navigate: navigateTo,
    navigateToTab,
    goBack,
    resetToHome,
    
    // Actions spécifiques
    openModal,
    
    // Navigation React Navigation native
    navigation,
  };
}

/**
 * Hook pour la navigation dans les tabs
 */
export function useTabNavigation() {
  const navigation = useRNNavigation<TabNavigationProp>();
  
  const navigateToTab = useCallback((tab: keyof MainTabParamList) => {
    console.log('📱 Navigation tab:', tab);
    navigation.navigate(tab);
  }, [navigation]);

  return {
    navigateToTab,
    navigation,
  };
}

/**
 * Hook pour récupérer les paramètres de route
 */
export function useRouteParams<T extends keyof RootStackParamList>() {
  const route = useRoute<RouteProp<RootStackParamList, T>>();
  return route.params;
}

// =================== NAVIGATION UTILITIES ===================

/**
 * Hook pour les actions de navigation courantes
 */
export function useNavigationActions() {
  const { navigate, openModal } = useNavigation();

  // Actions BOB
  const createBob = useCallback((type: string = 'pret') => {
    openModal('CreateBober', { boberType: type });
  }, [openModal]);

  const viewBob = useCallback((bobId: string, boberData?: any) => {
    navigate('BoberCard', { boberId: bobId, boberData });
  }, [navigate]);

  // Actions Event
  const createEvent = useCallback(() => {
    openModal('CreateEvent');
  }, [openModal]);

  // Actions Chat
  const openChat = useCallback((chatId: string, options: {
    chatTitle?: string;
    contactId?: string;
    contactName?: string;
    contactPhone?: string;
    isOnline?: boolean;
  } = {}) => {
    navigate('Chat', {
      chatId,
      ...options,
    });
  }, [navigate]);

  // Actions Debug
  const openDebugTools = useCallback(() => {
    navigate('BobTest');
  }, [navigate]);

  const openDataInjection = useCallback(() => {
    navigate('DataInjection');
  }, [navigate]);

  const verifyStrapi = useCallback(() => {
    navigate('VerifyStrapi');
  }, [navigate]);

  return {
    // BOB actions
    createBob,
    viewBob,
    
    // Event actions
    createEvent,
    
    // Chat actions
    openChat,
    
    // Debug actions
    openDebugTools,
    openDataInjection,
    verifyStrapi,
  };
}

/**
 * Hook pour deep linking et URL handling
 */
export function useDeepLinking() {
  const { navigate } = useNavigation();

  const handleDeepLink = useCallback((url: string) => {
    console.log('🔗 Handling deep link:', url);

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = new URLSearchParams(urlObj.search);

      // Parse different URL patterns
      if (path.startsWith('/bob/')) {
        const bobId = path.split('/')[2];
        if (bobId) {
          navigate('BoberCard', { boberId: bobId });
          return true;
        }
      }

      if (path.startsWith('/chat/')) {
        const chatId = path.split('/')[2];
        if (chatId) {
          navigate('Chat', { 
            chatId,
            chatTitle: searchParams.get('title') || undefined,
            contactName: searchParams.get('name') || undefined,
          });
          return true;
        }
      }

      if (path === '/create-bob' || path === '/create-exchange') {
        const type = searchParams.get('type') || 'pret';
        navigate('CreateBober', { boberType: type });
        return true;
      }

      if (path === '/create-event') {
        navigate('CreateEvent');
        return true;
      }

      // Tabs
      const tabRoutes: Record<string, keyof MainTabParamList> = {
        '/home': 'Home',
        '/contacts': 'Contacts',
        '/messages': 'ChatList',
        '/profile': 'Profile',
      };

      if (tabRoutes[path]) {
        navigate('MainApp');
        setTimeout(() => {
          // Navigate to specific tab
        }, 100);
        return true;
      }

      console.warn('🔗 URL non reconnue:', url);
      return false;
    } catch (error) {
      console.error('🔗 Erreur parsing deep link:', error);
      return false;
    }
  }, [navigate]);

  const generateDeepLink = useCallback((screen: string, params?: Record<string, string>) => {
    const baseUrl = 'bobapp://';
    const queryParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    
    const routes: Record<string, string> = {
      'Home': 'home',
      'Contacts': 'contacts',
      'ChatList': 'messages',
      'Profile': 'profile',
      'CreateBober': 'create-bob',
      'CreateEvent': 'create-event',
      'BoberCard': params?.boberId ? `bob/${params.boberId}` : 'bob',
      'Chat': params?.chatId ? `chat/${params.chatId}` : 'chat',
    };

    const route = routes[screen] || screen.toLowerCase();
    return `${baseUrl}${route}${queryParams}`;
  }, []);

  return {
    handleDeepLink,
    generateDeepLink,
  };
}

/**
 * Hook pour partager des liens
 */
export function useShareLinks() {
  const { generateDeepLink } = useDeepLinking();

  const shareBob = useCallback(async (bobId: string, bobTitle: string) => {
    const url = generateDeepLink('BoberCard', { boberId: bobId });
    
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Découvre ce BOB : ${bobTitle}`,
        url,
        title: `BOB : ${bobTitle}`,
      });
    } catch (error) {
      console.error('Erreur partage BOB:', error);
    }
  }, [generateDeepLink]);

  const shareEvent = useCallback(async (eventId: string, eventTitle: string) => {
    const url = generateDeepLink('Event', { eventId });
    
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Rejoins cet événement : ${eventTitle}`,
        url,
        title: `Événement : ${eventTitle}`,
      });
    } catch (error) {
      console.error('Erreur partage événement:', error);
    }
  }, [generateDeepLink]);

  const shareChat = useCallback(async (chatId: string, contactName: string) => {
    const url = generateDeepLink('Chat', { chatId, name: contactName });
    
    try {
      const { Share } = await import('react-native');
      await Share.share({
        message: `Discussion avec ${contactName}`,
        url,
        title: `Chat : ${contactName}`,
      });
    } catch (error) {
      console.error('Erreur partage chat:', error);
    }
  }, [generateDeepLink]);

  return {
    shareBob,
    shareEvent,
    shareChat,
  };
}

export default useNavigation;