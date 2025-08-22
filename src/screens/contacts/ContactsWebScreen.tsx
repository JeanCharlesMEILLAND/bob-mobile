// src/screens/contacts/ContactsWebScreen.tsx - Interface web optimisée
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useContactsWeb } from '../../hooks/useContactsWeb';
import { Colors } from '../../styles';
import { WebStyles } from '../../styles/web';

// Composant pour un contact dans la liste
const ContactCard: React.FC<{ contact: any }> = ({ contact }) => (
  <View style={[styles.contactCard, WebStyles.card]}>
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>
        {contact.nom} {contact.prenom || ''}
      </Text>
      <Text style={styles.contactPhone}>{contact.telephone}</Text>
      {contact.email && (
        <Text style={styles.contactEmail}>{contact.email}</Text>
      )}
    </View>
    
    <View style={styles.contactStatus}>
      {contact.aSurBob ? (
        <View style={styles.bobBadge}>
          <Text style={styles.bobBadgeText}>Bob</Text>
        </View>
      ) : (
        <View style={styles.nonBobBadge}>
          <Text style={styles.nonBobBadgeText}>Non-Bob</Text>
        </View>
      )}
      
      {contact.groupes.length > 0 && (
        <View style={styles.groupesBadge}>
          <Text style={styles.groupesBadgeText}>
            {contact.groupes.length} groupe{contact.groupes.length > 1 ? 's' : ''}
          </Text>
        </View>
      )}
    </View>
  </View>
);

// Composant d'état vide avec instructions
const EmptyStateWeb: React.FC<{ onRefresh: () => void; isLoading: boolean }> = ({ 
  onRefresh, 
  isLoading 
}) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateIcon}>📱</Text>
    <Text style={styles.emptyStateTitle}>Aucun contact trouvé</Text>
    <Text style={styles.emptyStateSubtitle}>
      Pour utiliser Bob sur le web, importez d'abord vos contacts depuis l'application mobile.
    </Text>
    
    <View style={styles.instructionsCard}>
      <Text style={styles.instructionsTitle}>Comment importer vos contacts :</Text>
      <Text style={styles.instructionStep}>
        1. 📱 Ouvrez l'app mobile Bob
      </Text>
      <Text style={styles.instructionStep}>
        2. 📋 Allez dans "Contacts"
      </Text>
      <Text style={styles.instructionStep}>
        3. 📤 Scannez et importez votre répertoire
      </Text>
      <Text style={styles.instructionStep}>
        4. 🔄 Synchronisez avec le cloud
      </Text>
      <Text style={styles.instructionStep}>
        5. 🌐 Rafraîchissez cette page web
      </Text>
    </View>

    <TouchableOpacity 
      style={styles.refreshButton} 
      onPress={onRefresh}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text style={styles.refreshButtonText}>🔄 Actualiser</Text>
      )}
    </TouchableOpacity>
  </View>
);

// Écran principal
export const ContactsWebScreen: React.FC = () => {
  const {
    contacts,
    isLoading,
    error,
    syncStatus,
    refresh,
    searchContacts,
    filterByBobStatus,
    getStats,
  } = useContactsWeb();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<boolean | null>(null);

  // Données filtrées et recherchées
  const filteredContacts = useMemo(() => {
    let result = contacts;
    
    // Appliquer le filtre Bob
    if (selectedFilter !== null) {
      result = filterByBobStatus(selectedFilter);
    }
    
    // Appliquer la recherche
    if (searchQuery.trim()) {
      result = searchContacts(searchQuery);
    }
    
    return result;
  }, [contacts, searchQuery, selectedFilter, searchContacts, filterByBobStatus]);

  const stats = useMemo(() => getStats(), [getStats]);

  // État d'erreur
  if (syncStatus.state === 'error' && !contacts.length) {
    return (
      <View style={[styles.container, WebStyles.container]}>
        <View style={styles.errorState}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Erreur de chargement</Text>
          <Text style={styles.errorMessage}>{syncStatus.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // État vide
  if (syncStatus.state === 'empty' || (!isLoading && contacts.length === 0)) {
    return (
      <View style={[styles.container, WebStyles.container]}>
        <EmptyStateWeb onRefresh={refresh} isLoading={isLoading} />
      </View>
    );
  }

  return (
    <View style={[styles.container, WebStyles.container]}>
      {/* Header avec statistiques */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.pageTitle}>Mes Contacts Bob</Text>
          <Text style={styles.syncStatus}>
            {syncStatus.message}
            {syncStatus.lastSync && (
              <Text style={styles.syncTime}>
                {' '}• {new Date(syncStatus.lastSync).toLocaleTimeString()}
              </Text>
            )}
          </Text>
        </View>
        
        {stats.total > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.bobUsers}</Text>
              <Text style={styles.statLabel}>Utilisateurs Bob</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.nonBobUsers}</Text>
              <Text style={styles.statLabel}>Non-Bob</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.groupes}</Text>
              <Text style={styles.statLabel}>Groupes</Text>
            </View>
          </View>
        )}
      </View>

      {/* Barre de recherche et filtres */}
      {contacts.length > 0 && (
        <View style={styles.filtersSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
          
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === null && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(null)}
            >
              <Text style={styles.filterButtonText}>Tous</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === true && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(true)}
            >
              <Text style={styles.filterButtonText}>Bob</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedFilter === false && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(false)}
            >
              <Text style={styles.filterButtonText}>Non-Bob</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Liste des contacts */}
      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ContactCard contact={item} />}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>
              {searchQuery ? 'Aucun contact trouvé pour cette recherche' : 'Aucun contact'}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  headerTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
  },
  
  syncStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  syncTime: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  
  statCard: {
    alignItems: 'center' as const,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minWidth: 80,
  },
  
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  
  filtersSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  searchInput: {
    borderWidth: 1,
    borderColor: '#d0d0d0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  
  filterButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  
  filterButtonText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
  
  listContainer: {
    padding: 16,
  },
  
  contactCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  contactInfo: {
    flex: 1,
  },
  
  contactName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  contactPhone: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  
  contactEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  
  contactStatus: {
    alignItems: 'flex-end' as const,
  },
  
  bobBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  
  bobBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  
  nonBobBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  
  nonBobBadgeText: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  
  groupesBadge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  
  groupesBadgeText: {
    color: Colors.text.secondary,
    fontSize: 10,
  },
  
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
    lineHeight: 22,
  },
  
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 400,
  },
  
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
    textAlign: 'center' as const,
  },
  
  instructionStep: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  
  refreshButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: 'center' as const,
  },
  
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  errorState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 40,
  },
  
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  
  errorMessage: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  noResults: {
    padding: 40,
    alignItems: 'center' as const,
  },
  
  noResultsText: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
};