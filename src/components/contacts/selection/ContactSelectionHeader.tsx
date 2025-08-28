// src/components/contacts/selection/ContactSelectionHeader.tsx
import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';

interface ContactSelectionHeaderProps {
  searchText: string;
  onSearchTextChange: (text: string) => void;
  filterMode: 'all' | 'suggested' | 'recent' | 'withExisting';
  onFilterModeChange: (mode: 'all' | 'suggested' | 'recent' | 'withExisting') => void;
  selectedCount: number;
  totalAvailableCount: number;
  onClose: () => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
}

export const ContactSelectionHeader: React.FC<ContactSelectionHeaderProps> = ({
  searchText,
  onSearchTextChange,
  filterMode,
  onFilterModeChange,
  selectedCount,
  totalAvailableCount,
  onClose,
  onSelectAll,
  onSelectNone
}) => {
  const filters = [
    { key: 'suggested' as const, label: '🎯 Suggérés', count: 0 },
    { key: 'all' as const, label: '📱 Tous', count: totalAvailableCount },
    { key: 'recent' as const, label: '🕐 Récents', count: 0 },
    { key: 'withExisting' as const, label: '👥 Amis communs', count: 0 },
  ];

  return (
    <View style={styles.header}>
      {/* En-tête */}
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Choisir mes contacts</Text>
          <Text style={styles.headerSubtitle}>
            {selectedCount} sélectionné(s) sur {totalAvailableCount} disponible(s)
          </Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un contact..."
          value={searchText}
          onChangeText={onSearchTextChange}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterMode === filter.key && styles.filterButtonActive
            ]}
            onPress={() => onFilterModeChange(filter.key)}
          >
            <Text style={[
              styles.filterButtonText,
              filterMode === filter.key && styles.filterButtonTextActive
            ]}>
              {filter.label}
              {filter.count > 0 && ` (${filter.count})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions rapides */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={onSelectAll}>
          <Text style={styles.quickActionText}>Tout sélectionner</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickActionButton} onPress={onSelectNone}>
          <Text style={styles.quickActionText}>Tout désélectionner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = {
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666666',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row' as const,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterButton: {
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500' as const,
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  quickActions: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center' as const,
  },
  quickActionText: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500' as const,
  },
};