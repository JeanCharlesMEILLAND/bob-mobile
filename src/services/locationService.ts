// src/services/locationService.ts - Service de géolocalisation pour BOB
import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Interface pour une position géographique
 */
export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
 * Interface pour une adresse géocodée
 */
export interface GeocodedAddress {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  name?: string;
  formattedAddress?: string;
}

/**
 * Interface pour un lieu avec coordonnées et adresse
 */
export interface LocationPlace {
  coords: LocationCoords;
  address?: GeocodedAddress;
  timestamp?: number;
}

/**
 * Interface pour les options de géolocalisation
 */
export interface LocationOptions {
  accuracy?: Location.Accuracy;
  timeout?: number;
  maximumAge?: number;
  enableHighAccuracy?: boolean;
}

/**
 * Service de géolocalisation pour BOB
 */
class LocationService {
  private lastKnownLocation: LocationPlace | null = null;
  private watchSubscription: Location.LocationSubscription | null = null;

  /**
   * Vérifier et demander les permissions de localisation
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log('📍 [LOCATION] Demande de permissions...');

      // Vérifier les permissions actuelles
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('📍 [LOCATION] Demande de permissions foreground...');
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          console.warn('⚠️ [LOCATION] Permissions foreground refusées');
          
          Alert.alert(
            'Localisation requise',
            'BOB a besoin d\'accéder à votre position pour vous proposer des événements et échanges à proximité.',
            [
              { text: 'Plus tard', style: 'cancel' },
              { text: 'Paramètres', onPress: () => Location.requestForegroundPermissionsAsync() }
            ]
          );
          
          return false;
        }
      }

      console.log('✅ [LOCATION] Permissions accordées');
      return true;

    } catch (error) {
      console.error('❌ [LOCATION] Erreur permissions:', error);
      return false;
    }
  }

  /**
   * Obtenir la position actuelle
   */
  async getCurrentPosition(options: LocationOptions = {}): Promise<LocationPlace | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      console.log('📍 [LOCATION] Récupération position actuelle...');

      const locationOptions: Location.LocationOptions = {
        accuracy: options.accuracy || Location.Accuracy.Balanced,
        timeInterval: options.timeout || 10000,
        distanceInterval: 0,
      };

      const location = await Location.getCurrentPositionAsync(locationOptions);

      const place: LocationPlace = {
        coords: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          heading: location.coords.heading,
          speed: location.coords.speed,
        },
        timestamp: location.timestamp,
      };

      // Géocoder l'adresse
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude: place.coords.latitude,
          longitude: place.coords.longitude,
        });

        if (addresses.length > 0) {
          const address = addresses[0];
          place.address = {
            street: address.street || undefined,
            city: address.city || undefined,
            region: address.region || undefined,
            postalCode: address.postalCode || undefined,
            country: address.country || undefined,
            name: address.name || undefined,
            formattedAddress: this.formatAddress(address),
          };
        }
      } catch (geocodeError) {
        console.warn('⚠️ [LOCATION] Erreur géocodage:', geocodeError);
      }

      this.lastKnownLocation = place;
      console.log('✅ [LOCATION] Position obtenue:', place.address?.formattedAddress || 'Coordonnées uniquement');

      return place;

    } catch (error) {
      console.error('❌ [LOCATION] Erreur position actuelle:', error);
      return null;
    }
  }

  /**
   * Rechercher des adresses par texte
   */
  async searchAddresses(query: string, region?: LocationCoords): Promise<GeocodedAddress[]> {
    try {
      console.log('🔍 [LOCATION] Recherche adresses:', query);

      const geocodeOptions: Location.GeocodeOptions = {};
      
      if (region) {
        geocodeOptions.region = {
          latitude: region.latitude,
          longitude: region.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
      }

      const results = await Location.geocodeAsync(query, geocodeOptions);

      const addresses: GeocodedAddress[] = results.map(result => ({
        street: result.street || undefined,
        city: result.city || undefined,
        region: result.region || undefined,
        postalCode: result.postalCode || undefined,
        country: result.country || undefined,
        name: result.name || undefined,
        formattedAddress: this.formatAddress(result),
      }));

      console.log(`✅ [LOCATION] ${addresses.length} adresses trouvées`);
      return addresses;

    } catch (error) {
      console.error('❌ [LOCATION] Erreur recherche adresses:', error);
      return [];
    }
  }

  /**
   * Calculer la distance entre deux points (en km)
   */
  calculateDistance(point1: LocationCoords, point2: LocationCoords): number {
    const R = 6371; // Rayon de la Terre en km
    
    const dLat = this.degToRad(point2.latitude - point1.latitude);
    const dLon = this.degToRad(point2.longitude - point1.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.degToRad(point1.latitude)) * Math.cos(this.degToRad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }

  /**
   * Formater une distance pour l'affichage
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    } else if (distanceKm < 10) {
      return `${distanceKm.toFixed(1)}km`;
    } else {
      return `${Math.round(distanceKm)}km`;
    }
  }

  /**
   * Vérifier si un point est dans un rayon donné
   */
  isWithinRadius(center: LocationCoords, point: LocationCoords, radiusKm: number): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusKm;
  }

  /**
   * Obtenir les lieux à proximité
   */
  async getNearbyPlaces(center?: LocationCoords, radiusKm: number = 5): Promise<LocationPlace[]> {
    // Cette fonction pourrait être étendue pour utiliser une API de lieux
    // Pour l'instant, on retourne juste la position actuelle si disponible
    
    const currentLocation = center ? { coords: center } : await this.getCurrentPosition();
    
    if (!currentLocation) {
      return [];
    }

    // TODO: Intégrer avec une API de lieux (Google Places, Foursquare, etc.)
    return [currentLocation];
  }

  /**
   * Surveiller les changements de position
   */
  async watchPosition(
    callback: (location: LocationPlace) => void,
    options: LocationOptions = {}
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      console.log('👁️ [LOCATION] Démarrage surveillance position...');

      const locationOptions: Location.LocationOptions = {
        accuracy: options.accuracy || Location.Accuracy.Balanced,
        timeInterval: 30000, // 30 secondes
        distanceInterval: 100, // 100 mètres
      };

      this.watchSubscription = await Location.watchPositionAsync(
        locationOptions,
        (location) => {
          const place: LocationPlace = {
            coords: {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              altitude: location.coords.altitude,
              altitudeAccuracy: location.coords.altitudeAccuracy,
              heading: location.coords.heading,
              speed: location.coords.speed,
            },
            timestamp: location.timestamp,
          };

          this.lastKnownLocation = place;
          callback(place);
        }
      );

      console.log('✅ [LOCATION] Surveillance position active');
      return true;

    } catch (error) {
      console.error('❌ [LOCATION] Erreur surveillance position:', error);
      return false;
    }
  }

  /**
   * Arrêter la surveillance de position
   */
  stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
      console.log('🛑 [LOCATION] Surveillance position arrêtée');
    }
  }

  /**
   * Obtenir la dernière position connue
   */
  getLastKnownLocation(): LocationPlace | null {
    return this.lastKnownLocation;
  }

  /**
   * Formater une adresse pour l'affichage
   */
  private formatAddress(address: Location.LocationGeocodedAddress): string {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ') || 'Adresse inconnue';
  }

  /**
   * Convertir des degrés en radians
   */
  private degToRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Nettoyer les ressources
   */
  cleanup(): void {
    this.stopWatching();
    this.lastKnownLocation = null;
  }
}

// Instance singleton
export const locationService = new LocationService();

/**
 * Types d'export pour l'utilisation externe
 */
export type {
  LocationCoords,
  GeocodedAddress,
  LocationPlace,
  LocationOptions
};

export default locationService;