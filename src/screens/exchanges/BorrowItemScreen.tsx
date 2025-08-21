// src/screens/exchanges/BorrowItemScreen.tsx - Interface spécialisée pour emprunter un objet
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  FlatList,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { exchangesService } from '../../services/exchanges.service';
import { authService } from '../../services/auth.service';
import { styles } from './BorrowItemScreen.styles';

interface AvailableItem {
  id: number;
  titre: string;
  description: string;
  categorie: string;
  etat: string;
  dureeJours?: number;
  caution?: number;
  photos?: string[];
  proprietaire: {
    id: number;
    nom: string;
    prenom: string;
    avatar?: string;
    distance?: number; // en km
  };
  createdAt: string;
}

interface FilterOptions {
  category: string;
  condition: string;
  maxDistance: number;
  maxDuration: number;
  sortBy: 'recent' | 'distance' | 'popularity';
}

const categories = [
  { id: '', label: 'Toutes', icon: '🔍' },
  { id: 'bricolage', label: 'Bricolage', icon: '🔧' },
  { id: 'jardinage', label: 'Jardinage', icon: '🌱' },
  { id: 'cuisine', label: 'Cuisine', icon: '👨‍🍳' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'electronique', label: 'Électronique', icon: '📱' },
  { id: 'maison', label: 'Maison', icon: '🏠' },
  { id: 'livre', label: 'Livres', icon: '📚' }
];

const conditions = [
  { id: '', label: 'Tous états' },
  { id: 'excellent', label: 'Excellent' },
  { id: 'tres_bon', label: 'Très bon' },
  { id: 'bon', label: 'Bon' },
  { id: 'correct', label: 'Correct' }
];

export const BorrowItemScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  // États des données
  const [availableItems, setAvailableItems] = useState<AvailableItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<AvailableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // États de recherche et filtres
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    condition: '',
    maxDistance: 50,
    maxDuration: 30,
    sortBy: 'recent'
  });
  
  // États UI
  const [viewMode, setViewMode] = useState<'feed' | 'search' | 'map'>('feed');

  useEffect(() => {
    loadAvailableItems();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [availableItems, searchQuery, filters]);

  const loadAvailableItems = async () => {
    try {
      const token = await authService.getValidToken();
      if (!token) return;

      // Charger les objets disponibles en prêt
      const response = await exchangesService.getExchanges({
        type: 'pret',
        statut: 'actif'
      }, token);

      // Simuler quelques objets pour la démo
      const mockItems: AvailableItem[] = [
        {
          id: 1,
          titre: 'Perceuse Bosch Professional',
          description: 'Perceuse sans fil 18V avec 2 batteries et mallette complète. Parfait pour tous travaux.',
          categorie: 'bricolage',
          etat: 'excellent',
          dureeJours: 7,
          caution: 50,
          proprietaire: {
            id: 1,
            nom: 'Dupont',
            prenom: 'Jean',
            distance: 2.5
          },
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          titre: 'Tondeuse électrique',
          description: 'Tondeuse Flymo, légère et maniable, idéale pour petits jardins.',
          categorie: 'jardinage',
          etat: 'tres_bon',
          dureeJours: 14,
          proprietaire: {
            id: 2,
            nom: 'Martin',
            prenom: 'Sophie',
            distance: 1.2
          },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          titre: 'Vélo électrique',
          description: 'VTT électrique Decathlon, batterie longue durée, très peu utilisé.',
          categorie: 'transport',
          etat: 'excellent',
          dureeJours: 3,
          caution: 200,
          proprietaire: {
            id: 3,
            nom: 'Leroy',
            prenom: 'Marc',
            distance: 5.8
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      setAvailableItems(mockItems);
    } catch (error) {
      console.error('❌ Erreur chargement objets:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let filtered = [...availableItems];

    // Recherche textuelle
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.titre.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }

    // Filtre catégorie
    if (filters.category) {
      filtered = filtered.filter(item => item.categorie === filters.category);
    }

    // Filtre état
    if (filters.condition) {
      filtered = filtered.filter(item => item.etat === filters.condition);
    }

    // Filtre distance
    filtered = filtered.filter(item => 
      !item.proprietaire.distance || item.proprietaire.distance <= filters.maxDistance
    );

    // Filtre durée
    filtered = filtered.filter(item => 
      !item.dureeJours || item.dureeJours <= filters.maxDuration
    );

    // Tri
    switch (filters.sortBy) {
      case 'distance':
        filtered.sort((a, b) => 
          (a.proprietaire.distance || 0) - (b.proprietaire.distance || 0)
        );
        break;
      case 'recent':
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      // case 'popularity': à implémenter
    }

    setFilteredItems(filtered);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadAvailableItems();
  };

  const handleItemPress = (item: AvailableItem) => {
    Alert.alert(
      `Emprunter "${item.titre}" ?`,
      `Propriétaire: ${item.proprietaire.prenom} ${item.proprietaire.nom}${item.proprietaire.distance ? ` (${item.proprietaire.distance}km)` : ''}\n\n` +
      `État: ${conditions.find(c => c.id === item.etat)?.label}\n` +
      `Durée max: ${item.dureeJours ? `${item.dureeJours} jours` : 'Non spécifiée'}\n` +
      `${item.caution ? `Caution: ${item.caution}€` : 'Pas de caution'}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Demander', 
          onPress: () => handleBorrowRequest(item)
        }
      ]
    );
  };

  const handleBorrowRequest = async (item: AvailableItem) => {
    try {
      // TODO: Implémenter la demande d'emprunt
      Alert.alert(
        'Demande envoyée !',
        `Votre demande pour "${item.titre}" a été envoyée à ${item.proprietaire.prenom}. Vous serez notifié de sa réponse.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Erreur demande emprunt:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande.');
    }
  };

  const renderItem = ({ item }: { item: AvailableItem }) => {
    const categoryInfo = categories.find(c => c.id === item.categorie);
    const conditionInfo = conditions.find(c => c.id === item.etat);
    
    return (
      <TouchableOpacity 
        style={styles.itemCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemCategory}>
            <Text style={styles.itemCategoryIcon}>{categoryInfo?.icon}</Text>
            <Text style={styles.itemCategoryLabel}>{categoryInfo?.label}</Text>
          </View>
          {item.proprietaire.distance && (
            <Text style={styles.itemDistance}>
              📍 {item.proprietaire.distance}km
            </Text>
          )}
        </View>
        
        <Text style={styles.itemTitle}>{item.titre}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemFooter}>
          <View style={styles.itemOwner}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>
                {item.proprietaire.prenom[0]}{item.proprietaire.nom[0]}
              </Text>
            </View>
            <Text style={styles.ownerName}>
              {item.proprietaire.prenom} {item.proprietaire.nom}
            </Text>
          </View>
          
          <View style={styles.itemDetails}>
            {item.etat && (
              <View style={styles.itemCondition}>
                <Text style={styles.itemConditionText}>
                  {conditionInfo?.label}
                </Text>
              </View>
            )}
            {item.dureeJours && (
              <Text style={styles.itemDuration}>
                Max {item.dureeJours}j
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Catégories */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Catégorie</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterChips}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterChip,
                  filters.category === cat.id && styles.filterChipSelected
                ]}
                onPress={() => setFilters(prev => ({ ...prev, category: cat.id }))}
              >
                <Text style={styles.filterChipIcon}>{cat.icon}</Text>
                <Text style={[
                  styles.filterChipText,
                  filters.category === cat.id && styles.filterChipTextSelected
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
      
      {/* Autres filtres */}
      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>Distance maximale: {filters.maxDistance}km</Text>
        {/* TODO: Slider pour la distance */}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Emprunter"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {/* Barre de recherche et modes */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un objet..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.viewModes}>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'feed' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('feed')}
          >
            <Text style={styles.viewModeIcon}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'search' && styles.viewModeButtonActive]}
            onPress={() => setViewMode('search')}
          >
            <Text style={styles.viewModeIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewModeButton, viewMode === 'map' && styles.viewModeButtonActive]}
            onPress={() => Alert.alert('Carte', 'Vue carte en développement')}
          >
            <Text style={styles.viewModeIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filtersIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
      
      {/* Filtres */}
      {showFilters && renderFilters()}
      
      {/* Liste des objets */}
      <View style={styles.content}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'Aucun résultat' : 'Aucun objet disponible'}
            </Text>
            <Text style={styles.emptyDesc}>
              {searchQuery 
                ? 'Essayez avec d\'autres mots-clés ou ajustez les filtres'
                : 'Aucun objet n\'est disponible dans votre réseau pour le moment'
              }
            </Text>
            <Button
              title="Actualiser"
              onPress={handleRefresh}
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <FlatList
            data={filteredItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            contentContainerStyle={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};