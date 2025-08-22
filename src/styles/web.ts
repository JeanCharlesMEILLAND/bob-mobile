// src/styles/web.ts
import { Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const WebStyles = {
  // Adaptations pour le web
  container: {
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 0,
  },
  
  // Cards plus larges sur web
  card: {
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    marginBottom: Platform.OS === 'web' ? 16 : 12,
    borderRadius: Platform.OS === 'web' ? 12 : 8,
    padding: Platform.OS === 'web' ? 20 : 16,
  },
  
  // Navigation adaptée
  bottomNavigation: {
    // Sur web, peut être en sidebar ou en top navigation
    flexDirection: Platform.OS === 'web' && width > 768 ? 'column' : 'row',
    maxWidth: Platform.OS === 'web' && width > 768 ? 250 : '100%',
    height: Platform.OS === 'web' && width > 768 ? '100vh' : 'auto',
    position: Platform.OS === 'web' && width > 768 ? 'fixed' : 'relative',
  },
  
  // Contenu principal avec sidebar
  mainContent: {
    marginLeft: Platform.OS === 'web' && width > 768 ? 250 : 0,
    flex: 1,
    minHeight: Platform.OS === 'web' ? '100vh' : 'auto',
  },
  
  // Styles pour les boutons sur web (hover effects)
  button: {
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    transition: Platform.OS === 'web' ? 'all 0.2s ease' : undefined,
    minHeight: Platform.OS === 'web' ? 48 : 44,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
  },
  
  // Inputs plus grands sur web
  input: {
    minHeight: Platform.OS === 'web' ? 48 : 44,
    paddingHorizontal: Platform.OS === 'web' ? 16 : 12,
    fontSize: Platform.OS === 'web' ? 16 : 14,
    borderRadius: Platform.OS === 'web' ? 8 : 6,
  },
  
  // Headers plus grands sur web
  header: {
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
  },
  
  // Lists avec espacement optimal
  listItem: {
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    paddingVertical: Platform.OS === 'web' ? 16 : 12,
    minHeight: Platform.OS === 'web' ? 64 : 56,
  },
  
  // Modals plus grandes sur web
  modal: {
    maxWidth: Platform.OS === 'web' ? 600 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    borderRadius: Platform.OS === 'web' ? 16 : 12,
  },
  
  // Forms centrées sur web
  form: {
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
    marginHorizontal: Platform.OS === 'web' ? 'auto' : 0,
    paddingHorizontal: Platform.OS === 'web' ? 24 : 16,
  },
  
  // Scrollable areas
  scrollView: {
    // Sur web, des scrollbars plus jolies
    scrollbarWidth: Platform.OS === 'web' ? 'thin' : undefined,
    scrollbarColor: Platform.OS === 'web' ? '#888 #f1f1f1' : undefined,
  },
  
  // Grid layouts pour desktop
  grid: {
    flexDirection: Platform.OS === 'web' && width > 768 ? 'row' : 'column',
    flexWrap: Platform.OS === 'web' && width > 768 ? 'wrap' : 'nowrap',
    gap: Platform.OS === 'web' ? 20 : 12,
  },
  
  gridItem: {
    flex: Platform.OS === 'web' && width > 768 ? '1 1 45%' : 1,
    minWidth: Platform.OS === 'web' && width > 768 ? 300 : 'auto',
  },
};

export const isWebDesktop = () => {
  return Platform.OS === 'web' && width > 768;
};

export const isWebMobile = () => {
  return Platform.OS === 'web' && width <= 768;
};

export const getResponsiveStyle = (mobileStyle: any, webStyle: any) => {
  return Platform.OS === 'web' ? { ...mobileStyle, ...webStyle } : mobileStyle;
};