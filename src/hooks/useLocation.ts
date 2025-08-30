// src/hooks/useLocation.ts - Hook React pour géolocalisation BOB
import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { locationService, LocationPlace, LocationCoords, LocationOptions } from '../services/locationService';

/**
 * Interface pour le statut de géolocalisation
 */
interface LocationStatus {
  isLoading: boolean;
  hasPermission: boolean;
  error: string | null;
  isWatching: boolean;
}

/**
 * Interface pour les options du hook
 */
interface UseLocationOptions extends LocationOptions {
  enableBackground?: boolean;
  autoRequest?: boolean;
  watchPosition?: boolean;
}

/**
 * Hook personnalisé pour gérer la géolocalisation
 */
export const useLocation = (options: UseLocationOptions = {}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationPlace | null>(null);
  const [status, setStatus] = useState<LocationStatus>({
    isLoading: false,
    hasPermission: false,
    error: null,
    isWatching: false,
  });
  
  const [nearbyPlaces, setNearbyPlaces] = useState<LocationPlace[]>([]);
  const watchingRef = useRef(false);

  /**
   * Demander les permissions de localisation
   */
  const requestPermissions = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));
      
      const granted = await locationService.requestPermissions();
      
      setStatus(prev => ({
        ...prev,
        hasPermission: granted,
        isLoading: false,
        error: granted ? null : 'Permissions de localisation refusées'
      }));

      return granted;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur permissions'
      }));
      return false;
    }
  }, []);

  /**
   * Obtenir la position actuelle
   */
  const getCurrentPosition = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: null }));

      const location = await locationService.getCurrentPosition(options);
      
      if (location) {
        setCurrentLocation(location);
        setStatus(prev => ({ ...prev, hasPermission: true }));
      }

      setStatus(prev => ({ 
        ...prev, 
        isLoading: false,
        error: location ? null : 'Impossible d\'obtenir la position'
      }));

      return location;
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur géolocalisation'
      }));
      return null;
    }
  }, [options]);

  /**
   * Démarrer la surveillance de position
   */
  const startWatching = useCallback(async () => {
    if (watchingRef.current) return;

    try {
      const success = await locationService.watchPosition(
        (location) => {
          setCurrentLocation(location);
          console.log('📍 [USE_LOCATION] Position mise à jour');
        },
        options
      );

      if (success) {
        watchingRef.current = true;
        setStatus(prev => ({ ...prev, isWatching: true }));
      }

      return success;
    } catch (error) {
      console.error('❌ [USE_LOCATION] Erreur surveillance:', error);
      return false;
    }
  }, [options]);

  /**
   * Arrêter la surveillance de position
   */
  const stopWatching = useCallback(() => {
    if (watchingRef.current) {
      locationService.stopWatching();
      watchingRef.current = false;
      setStatus(prev => ({ ...prev, isWatching: false }));
      console.log('🛑 [USE_LOCATION] Surveillance arrêtée');
    }
  }, []);

  /**
   * Rechercher des adresses
   */
  const searchAddresses = useCallback(async (query: string) => {
    try {
      const region = currentLocation?.coords;
      return await locationService.searchAddresses(query, region);
    } catch (error) {
      console.error('❌ [USE_LOCATION] Erreur recherche adresses:', error);
      return [];
    }
  }, [currentLocation]);

  /**
   * Calculer la distance jusqu'à un point
   */
  const getDistanceTo = useCallback((destination: LocationCoords) => {
    if (!currentLocation) return null;
    
    return locationService.calculateDistance(currentLocation.coords, destination);
  }, [currentLocation]);

  /**
   * Formater une distance
   */
  const formatDistance = useCallback((distanceKm: number) => {
    return locationService.formatDistance(distanceKm);
  }, []);

  /**
   * Vérifier si on est proche d'un point
   */
  const isNearby = useCallback((point: LocationCoords, radiusKm: number = 1) => {
    if (!currentLocation) return false;
    
    return locationService.isWithinRadius(currentLocation.coords, point, radiusKm);
  }, [currentLocation]);

  /**
   * Obtenir les lieux à proximité
   */
  const loadNearbyPlaces = useCallback(async (radiusKm: number = 5) => {
    try {
      const places = await locationService.getNearbyPlaces(currentLocation?.coords, radiusKm);
      setNearbyPlaces(places);
      return places;
    } catch (error) {
      console.error('❌ [USE_LOCATION] Erreur lieux proximité:', error);
      return [];
    }
  }, [currentLocation]);

  /**
   * Initialisation automatique
   */
  useEffect(() => {
    const initialize = async () => {
      if (options.autoRequest !== false) {
        const hasPermission = await requestPermissions();
        
        if (hasPermission) {
          await getCurrentPosition();
          
          if (options.watchPosition) {
            await startWatching();
          }
        }
      }
    };

    initialize();

    return () => {
      stopWatching();
      locationService.cleanup();
    };
  }, []);

  /**
   * Gestion des changements d'état de l'app
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && !options.enableBackground) {
        stopWatching();
      } else if (nextAppState === 'active' && options.watchPosition && status.hasPermission) {
        startWatching();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [options.enableBackground, options.watchPosition, status.hasPermission]);

  return {
    // État
    currentLocation,
    status,
    nearbyPlaces,
    
    // Actions
    requestPermissions,
    getCurrentPosition,
    startWatching,
    stopWatching,
    searchAddresses,
    loadNearbyPlaces,
    
    // Utilitaires
    getDistanceTo,
    formatDistance,
    isNearby,
  };
};

export default useLocation;