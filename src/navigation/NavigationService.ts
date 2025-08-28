// src/navigation/NavigationService.ts - Service de navigation globale

import { createRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './NavigationContainer';

// Référence globale vers le NavigationContainer
export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

/**
 * Service de navigation globale pour naviguer depuis n'importe où dans l'app
 */
class NavigationService {
  /**
   * Naviguer vers un écran
   */
  navigate(name: keyof RootStackParamList, params?: any) {
    if (navigationRef.current?.isReady()) {
      navigationRef.current.navigate(name as any, params);
    } else {
      console.warn('Navigation non prête pour:', name);
    }
  }

  /**
   * Revenir en arrière
   */
  goBack() {
    if (navigationRef.current?.isReady() && navigationRef.current.canGoBack()) {
      navigationRef.current.goBack();
    } else {
      console.warn('Impossible de revenir en arrière');
    }
  }

  /**
   * Reset de la navigation
   */
  reset(routes: Array<{ name: keyof RootStackParamList; params?: any }>) {
    if (navigationRef.current?.isReady()) {
      navigationRef.current.reset({
        index: routes.length - 1,
        routes,
      });
    }
  }

  /**
   * Obtenir la route actuelle
   */
  getCurrentRoute() {
    if (navigationRef.current?.isReady()) {
      return navigationRef.current.getCurrentRoute();
    }
    return null;
  }

  /**
   * Obtenir l'état de navigation actuel
   */
  getState() {
    if (navigationRef.current?.isReady()) {
      return navigationRef.current.getRootState();
    }
    return null;
  }

  /**
   * Vérifier si la navigation est prête
   */
  isReady() {
    return navigationRef.current?.isReady() || false;
  }

  // =================== ACTIONS SPÉCIFIQUES ===================

  /**
   * Aller vers l'accueil
   */
  goToHome() {
    this.navigate('MainApp');
  }

  /**
   * Ouvrir un BOB
   */
  openBob(bobId: string, boberData?: any) {
    this.navigate('BoberCard', { boberId: bobId, boberData });
  }

  /**
   * Créer un BOB
   */
  createBob(type: string = 'pret') {
    this.navigate('CreateBober', { boberType: type });
  }

  /**
   * Ouvrir un chat
   */
  openChat(chatId: string, options: {
    chatTitle?: string;
    contactId?: string;
    contactName?: string;
    contactPhone?: string;
    isOnline?: boolean;
  } = {}) {
    this.navigate('Chat', {
      chatId,
      ...options,
    });
  }

  /**
   * Créer un événement
   */
  createEvent() {
    this.navigate('CreateEvent');
  }

  /**
   * Ouvrir les outils de debug
   */
  openDebug() {
    this.navigate('BobTest');
  }

  // =================== DEEP LINKING ===================

  /**
   * Handler pour deep linking
   */
  handleDeepLink(url: string): boolean {
    console.log('🔗 Navigation service handling deep link:', url);

    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const searchParams = new URLSearchParams(urlObj.search);

      // BOB links
      if (path.startsWith('/bob/')) {
        const bobId = path.split('/')[2];
        if (bobId) {
          this.openBob(bobId);
          return true;
        }
      }

      // Chat links
      if (path.startsWith('/chat/')) {
        const chatId = path.split('/')[2];
        if (chatId) {
          this.openChat(chatId, {
            chatTitle: searchParams.get('title') || undefined,
            contactName: searchParams.get('name') || undefined,
          });
          return true;
        }
      }

      // Create actions
      if (path === '/create-bob') {
        const type = searchParams.get('type') || 'pret';
        this.createBob(type);
        return true;
      }

      if (path === '/create-event') {
        this.createEvent();
        return true;
      }

      // Tab navigation
      const tabMap: Record<string, void> = {
        '/home': this.goToHome(),
        '/contacts': this.navigate('MainApp'),
        '/messages': this.navigate('MainApp'),
        '/profile': this.navigate('MainApp'),
      };

      if (tabMap[path] !== undefined) {
        this.navigate('MainApp');
        return true;
      }

      console.warn('🔗 URL non reconnue par NavigationService:', url);
      return false;
    } catch (error) {
      console.error('🔗 Erreur NavigationService deep link:', error);
      return false;
    }
  }

  // =================== NOTIFICATIONS ===================

  /**
   * Handler pour navigation depuis notifications
   */
  handleNotificationPress(notification: {
    type: 'bob' | 'chat' | 'event' | 'general';
    id?: string;
    data?: any;
  }) {
    console.log('📱 Navigation depuis notification:', notification);

    switch (notification.type) {
      case 'bob':
        if (notification.id) {
          this.openBob(notification.id, notification.data);
        }
        break;

      case 'chat':
        if (notification.id) {
          this.openChat(notification.id, {
            contactName: notification.data?.contactName,
            chatTitle: notification.data?.chatTitle,
          });
        }
        break;

      case 'event':
        // Pour l'instant, aller vers l'accueil
        this.goToHome();
        break;

      default:
        this.goToHome();
        break;
    }
  }

  // =================== ANALYTICS ===================

  /**
   * Logger pour analytics de navigation
   */
  logNavigation(screenName: string, params?: any) {
    console.log('📊 Navigation vers:', screenName, params);
    
    // Ici on pourrait intégrer avec un service d'analytics
    // comme Firebase Analytics, Mixpanel, etc.
    
    // Exemple pour le futur:
    // analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
  }

  /**
   * Tracker le temps passé sur un écran
   */
  private screenStartTime: Record<string, number> = {};

  startScreenTimer(screenName: string) {
    this.screenStartTime[screenName] = Date.now();
  }

  endScreenTimer(screenName: string) {
    const startTime = this.screenStartTime[screenName];
    if (startTime) {
      const duration = Date.now() - startTime;
      console.log(`📊 Temps sur ${screenName}: ${duration}ms`);
      delete this.screenStartTime[screenName];
      
      // Ici on pourrait envoyer à un service d'analytics
      // analytics().logEvent('screen_time', { screen: screenName, duration });
    }
  }
}

export const navigationService = new NavigationService();

// Helper functions pour utiliser depuis n'importe où
export const navigate = (name: keyof RootStackParamList, params?: any) => {
  navigationService.navigate(name, params);
};

export const goBack = () => {
  navigationService.goBack();
};

export const resetNavigation = (routes: Array<{ name: keyof RootStackParamList; params?: any }>) => {
  navigationService.reset(routes);
};

export default navigationService;