// src/components/location/LocationPicker.tsx - Sélecteur de localisation pour événements
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocation } from '../../hooks/useLocation';
import { GeocodedAddress, LocationCoords } from '../../services/locationService';

/**
 * Interface pour un lieu sélectionné
 */
export interface SelectedLocation {
  coords: LocationCoords;
  address: string;
  name?: string;
}

/**
 * Props du LocationPicker
 */
interface LocationPickerProps {
  onLocationSelect: (location: SelectedLocation) => void;
  initialLocation?: SelectedLocation;
  placeholder?: string;
  showCurrentLocation?: boolean;
  style?: any;
}

/**
 * Composant de sélection de localisation
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  placeholder = "Rechercher une adresse...",
  showCurrentLocation = true,
  style
}) => {
  const { 
    currentLocation, 
    status, 
    searchAddresses, 
    getCurrentPosition 
  } = useLocation({ autoRequest: false });

  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || '');
  const [searchResults, setSearchResults] = useState<GeocodedAddress[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(initialLocation || null);

  /**
   * Effectuer une recherche d'adresses
   */
  const handleSearch = async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);

    try {
      const results = await searchAddresses(query);
      setSearchResults(results);
    } catch (error) {
      console.error('❌ Erreur recherche adresses:', error);
      Alert.alert('Erreur', 'Impossible de rechercher les adresses');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Sélectionner une adresse
   */
  const handleSelectAddress = (address: GeocodedAddress, coords?: LocationCoords) => {
    if (!address.formattedAddress) return;

    const location: SelectedLocation = {
      coords: coords || { latitude: 0, longitude: 0 }, // TODO: Géocoder si pas de coords
      address: address.formattedAddress,
      name: address.name
    };

    setSelectedLocation(location);
    setSearchQuery(address.formattedAddress);
    setShowResults(false);
    onLocationSelect(location);
  };

  /**
   * Utiliser la position actuelle
   */
  const handleUseCurrentLocation = async () => {
    try {
      if (!currentLocation) {
        const location = await getCurrentPosition();
        if (!location) {
          Alert.alert('Erreur', 'Impossible d\'obtenir votre position actuelle');
          return;
        }
      }

      const location = currentLocation!;
      const selectedLoc: SelectedLocation = {
        coords: location.coords,
        address: location.address?.formattedAddress || 'Position actuelle',
        name: 'Ma position'
      };

      setSelectedLocation(selectedLoc);
      setSearchQuery(selectedLoc.address);
      setShowResults(false);
      onLocationSelect(selectedLoc);

    } catch (error) {
      console.error('❌ Erreur position actuelle:', error);
      Alert.alert('Erreur', 'Impossible d\'utiliser votre position actuelle');
    }
  };

  /**
   * Rendu d'un résultat de recherche
   */
  const renderSearchResult = ({ item, index }: { item: GeocodedAddress; index: number }) => (
    <TouchableOpacity
      key={index}
      style={styles.resultItem}
      onPress={() => handleSelectAddress(item)}
    >
      <View style={styles.resultContent}>
        <Feather name="map-pin" size={18} color="#6b7280" />
        <View style={styles.resultText}>
          <Text style={styles.resultTitle} numberOfLines={1}>
            {item.name || item.street || 'Adresse'}
          </Text>
          <Text style={styles.resultSubtitle} numberOfLines={2}>
            {item.formattedAddress}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      
      {/* Champ de recherche */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                setShowResults(false);
                setSelectedLocation(null);
              }}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Bouton position actuelle */}
        {showCurrentLocation && (
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
            disabled={status.isLoading}
          >
            {status.isLoading ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Feather name="navigation" size={18} color="#3b82f6" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Résultats de recherche */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3b82f6" />
              <Text style={styles.loadingText}>Recherche en cours...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${index}-${item.formattedAddress}`}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          ) : searchQuery.length >= 3 ? (
            <View style={styles.noResultsContainer}>
              <Feather name="map-pin" size={24} color="#9ca3af" />
              <Text style={styles.noResultsText}>Aucune adresse trouvée</Text>
              <Text style={styles.noResultsSubtext}>Essayez avec d'autres termes</Text>
            </View>
          ) : null}
        </View>
      )}

      {/* Localisation sélectionnée */}
      {selectedLocation && !showResults && (
        <View style={styles.selectedLocationContainer}>
          <View style={styles.selectedLocationContent}>
            <Feather name="map-pin" size={16} color="#10b981" />
            <Text style={styles.selectedLocationText} numberOfLines={2}>
              {selectedLocation.name && selectedLocation.name !== selectedLocation.address
                ? `${selectedLocation.name} - ${selectedLocation.address}`
                : selectedLocation.address
              }
            </Text>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  clearButton: {
    padding: 4,
  },
  currentLocationButton: {
    width: 48,
    height: 48,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultsList: {
    maxHeight: 200,
  },
  resultItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noResultsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  noResultsSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  selectedLocationContainer: {
    marginTop: 8,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 6,
    padding: 8,
  },
  selectedLocationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  selectedLocationText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 16,
  },
});

export default LocationPicker;