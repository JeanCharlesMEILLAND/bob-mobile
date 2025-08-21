// src/screens/exchanges/BrowseExchangesScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  RefreshControl 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header } from '../../components/common';
import { styles } from './BrowseExchangesScreen.styles';

interface Exchange {
  id: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  dateCreation: string;
  dureeJours?: number;
  bobizGagnes: number;
  adresse?: string;
  distance?: string;
  createur: {
    id: string;
    username: string;
    avatar?: string;
  };
  categorie?: string;
  conditions?: string;
}

interface FilterState {
  type: 'all' | 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  category: string;
  distance: 'all' | 'proche' | 'loin';
  sortBy: 'recent' | 'distance' | 'bobiz';
}

const categories = [
  { id: 'all', label: 'Toutes', icon: '🌟' },
  { id: 'bricolage', label: 'Bricolage', icon: '🔧' },
  { id: 'jardinage', label: 'Jardinage', icon: '🌱' },
  { id: 'cuisine', label: 'Cuisine', icon: '👨‍🍳' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'informatique', label: 'Informatique', icon: '💻' },
  { id: 'sport', label: 'Sport', icon: '⚽' },
  { id: 'maison', label: 'Maison', icon: '🏠' }
];

interface ExchangeItemProps {
  exchange: Exchange;
  onPress: () => void;
  onContact: () => void;
}

const ExchangeItem: React.FC<ExchangeItemProps> = ({ exchange, onPress, onContact }) => {
  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'pret': return { icon: '📤', label: 'Prêt', color: '#10B981', bg: '#ECFDF5' };
      case 'emprunt': return { icon: '📥', label: 'Demande', color: '#3B82F6', bg: '#EBF8FF' };
      case 'service_offert': return { icon: '🤝', label: 'Service', color: '#8B5CF6', bg: '#F3E8FF' };
      case 'service_demande': return { icon: '🙋', label: 'Aide', color: '#F59E0B', bg: '#FFFBEB' };
      default: return { icon: '📦', label: 'Échange', color: '#6B7280', bg: '#F9FAFB' };
    }
  };

  const typeInfo = getTypeInfo(exchange.type);

  return (
    <TouchableOpacity style={styles.exchangeItem} onPress={onPress}>
      <View style={styles.exchangeItemHeader}>
        <View style={[styles.exchangeTypeBadge, { backgroundColor: typeInfo.bg }]}>
          <Text style={styles.exchangeTypeIcon}>{typeInfo.icon}</Text>
          <Text style={[styles.exchangeTypeText, { color: typeInfo.color }]}>
            {typeInfo.label}
          </Text>
        </View>
        
        {exchange.distance && (
          <Text style={styles.exchangeDistance}>📍 {exchange.distance}</Text>
        )}
      </View>
      
      <Text style={styles.exchangeItemTitle}>{exchange.titre}</Text>
      <Text style={styles.exchangeItemDescription} numberOfLines={2}>
        {exchange.description}
      </Text>
      
      <View style={styles.exchangeItemMeta}>
        <View style={styles.exchangeItemAuthor}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorAvatarText}>
              {exchange.createur.username.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.authorName}>{exchange.createur.username}</Text>
        </View>
        
        <View style={styles.exchangeItemActions}>
          <Text style={styles.exchangeItemBobiz}>+{exchange.bobizGagnes} Bobiz</Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={onContact}
          >
            <Text style={styles.contactButtonText}>💬 Contacter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BrowseExchangesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    category: 'all',
    distance: 'all',
    sortBy: 'recent'
  });

  useEffect(() => {
    loadExchanges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exchanges, searchQuery, filters]);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      // TODO: Appel API réel
      console.log('🔍 Chargement des échanges...');
      
      // Mock data
      const mockExchanges: Exchange[] = [
        {
          id: '1',
          type: 'pret',
          titre: 'Perceuse Bosch 18V',
          description: 'Perceuse visseuse sans fil en excellent état, avec malette et 2 batteries',
          statut: 'actif',
          dateCreation: new Date().toISOString(),
          dureeJours: 7,
          bobizGagnes: 15,
          distance: 'Proche',
          createur: { id: '1', username: 'MarieD' },
          categorie: 'bricolage'
        },
        {
          id: '2',
          type: 'service_offert',
          titre: 'Aide déménagement',
          description: 'Propose aide pour petit déménagement, disponible weekend',
          statut: 'actif',
          dateCreation: new Date().toISOString(),
          bobizGagnes: 25,
          distance: 'Plus loin',
          createur: { id: '2', username: 'ThomasL' },
          categorie: 'transport'
        }
      ];
      
      setExchanges(mockExchanges);
    } catch (error) {
      console.error('Erreur chargement échanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = exchanges;

    // Filtre par recherche textuelle
    if (searchQuery.trim()) {
      filtered = filtered.filter(exchange => 
        exchange.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exchange.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre par type
    if (filters.type !== 'all') {
      filtered = filtered.filter(exchange => exchange.type === filters.type);
    }

    // Filtre par catégorie
    if (filters.category !== 'all') {
      filtered = filtered.filter(exchange => exchange.categorie === filters.category);
    }

    // Filtre par distance
    if (filters.distance !== 'all') {
      filtered = filtered.filter(exchange => {
        if (filters.distance === 'proche') return exchange.distance === 'Proche';
        if (filters.distance === 'loin') return exchange.distance === 'Plus loin';
        return true;
      });
    }

    // Tri
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
        break;
      case 'distance':
        filtered.sort((a, b) => {
          const distanceOrder = { 'Proche': 0, 'Plus loin': 1, undefined: 2 };
          return (distanceOrder[a.distance as keyof typeof distanceOrder] || 2) - 
                 (distanceOrder[b.distance as keyof typeof distanceOrder] || 2);
        });
        break;
      case 'bobiz':
        filtered.sort((a, b) => b.bobizGagnes - a.bobizGagnes);
        break;
    }

    setFilteredExchanges(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExchanges();
    setRefreshing(false);
  };

  const handleExchangePress = (exchange: Exchange) => {
    console.log('👆 Détail échange:', exchange.id);
    // TODO: Navigation vers ExchangeDetailScreen
  };

  const handleContactPress = (exchange: Exchange) => {
    console.log('💬 Contacter:', exchange.createur.username);
    // TODO: Navigation vers Chat ou modal contact
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <View style={styles.container}>
      <Header title="Parcourir les échanges" />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Rechercher un objet ou service..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filtersSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
          >
            {/* Type Filters */}
            <TouchableOpacity
              style={[styles.filterChip, filters.type === 'all' && styles.filterChipActive]}
              onPress={() => updateFilter('type', 'all')}
            >
              <Text style={[styles.filterChipText, filters.type === 'all' && styles.filterChipTextActive]}>
                🌟 Tous
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, filters.type === 'pret' && styles.filterChipActive]}
              onPress={() => updateFilter('type', 'pret')}
            >
              <Text style={[styles.filterChipText, filters.type === 'pret' && styles.filterChipTextActive]}>
                📤 Prêts
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.filterChip, filters.type === 'service_offert' && styles.filterChipActive]}
              onPress={() => updateFilter('type', 'service_offert')}
            >
              <Text style={[styles.filterChipText, filters.type === 'service_offert' && styles.filterChipTextActive]}>
                🤝 Services
              </Text>
            </TouchableOpacity>

            {/* Category Filters */}
            {categories.slice(1).map(category => (
              <TouchableOpacity
                key={category.id}
                style={[styles.filterChip, filters.category === category.id && styles.filterChipActive]}
                onPress={() => updateFilter('category', category.id)}
              >
                <Text style={[styles.filterChipText, filters.category === category.id && styles.filterChipTextActive]}>
                  {category.icon} {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sort Options */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Trier par:</Text>
          <View style={styles.sortOptions}>
            {[
              { key: 'recent', label: 'Plus récents' },
              { key: 'distance', label: 'Distance' },
              { key: 'bobiz', label: 'Points Bobiz' }
            ].map(option => (
              <TouchableOpacity
                key={option.key}
                style={[styles.sortOption, filters.sortBy === option.key && styles.sortOptionActive]}
                onPress={() => updateFilter('sortBy', option.key)}
              >
                <Text style={[styles.sortOptionText, filters.sortBy === option.key && styles.sortOptionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsCount}>
            {filteredExchanges.length} échange{filteredExchanges.length > 1 ? 's' : ''} trouvé{filteredExchanges.length > 1 ? 's' : ''}
          </Text>
          
          <FlatList
            data={filteredExchanges}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ExchangeItem
                exchange={item}
                onPress={() => handleExchangePress(item)}
                onContact={() => handleContactPress(item)}
              />
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.exchangesList}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>Aucun échange trouvé</Text>
                <Text style={styles.emptyDescription}>
                  Essayez de modifier vos critères de recherche
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
};