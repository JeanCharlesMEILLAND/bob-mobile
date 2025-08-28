// src/navigation/index.ts - Exports de navigation

export { default as NavigationContainer } from './NavigationContainer';
export { default as navigationService, navigate, goBack, resetNavigation, navigationRef } from './NavigationService';
export { default as useNavigation, useTabNavigation, useRouteParams, useNavigationActions, useDeepLinking, useShareLinks } from '../hooks/useNavigation';
export type { RootStackParamList, MainTabParamList } from './NavigationContainer';