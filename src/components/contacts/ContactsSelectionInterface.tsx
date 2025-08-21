// src/components/contacts/ContactsSelectionInterface.tsx - Interface de sélection des contacts
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { styles } from './ContactsSelectionInterface.styles';
import { calculateSmartScore } from '../../utils/contactHelpers';

interface ContactsSelectionInterfaceProps {
  contactsBruts: any[];
  contactsDejaSelectionnes: string[];
  onClose: () => void;
  onImportSelected: (contactIds: string[]) => Promise<void>;
  isLoading: boolean;
}

export const ContactsSelectionInterface: React.FC<ContactsSelectionInterfaceProps> = ({
  contactsBruts,
  contactsDejaSelectionnes,
  onClose,
  onImportSelected,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'suggested' | 'recent'>('suggested');
  
  // Contacts disponibles (non déjà sélectionnés)
  const contactsDisponibles = useMemo(() => {
    return contactsBruts
      .filter((c: any) => !contactsDejaSelectionnes.includes(c.id))
      .map((c: any) => ({
        ...c,
        score: calculateSmartScore(c),
      }));
  }, [contactsBruts, contactsDejaSelectionnes]);

  // Filtrage et tri
  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsDisponibles];

    // Recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(search) ||
        c.telephone.includes(search)
      );
    }

    // Filtrage par mode
    switch (filterMode) {
      case 'suggested':
        filtered = filtered.filter(c => c.score > 10);
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'recent':
        // Simuler par ordre alphabétique inversé (dans vraie app: utiliser date d'ajout au téléphone)
        filtered.sort((a, b) => b.nom.localeCompare(a.nom));
        break;
      default:
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [contactsDisponibles, searchText, filterMode]);

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(contactsFiltered.map(c => c.id));
    setSelectedContacts(allIds);
  };

  const deselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleImport = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Aucune sélection', 'Sélectionnez au moins un contact.');
      return;
    }
    await onImportSelected(Array.from(selectedContacts));
  };

  const renderContact = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.contactRow, isSelected && styles.contactRowSelected]}
        onPress={() => toggleContact(item.id)}
      >
        <View style={[styles.contactCheckbox, isSelected && styles.contactCheckboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        
        <View style={[styles.contactAvatar, item.score > 15 && styles.contactAvatarSuggested]}>
          <Text style={styles.contactInitial}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>{item.nom}</Text>
          <Text style={styles.contactNumber}>{item.telephone}</Text>
          {item.score > 15 && (
            <Text style={styles.contactSuggestion}>✨ Suggéré</Text>
          )}
        </View>
        
        {item.email && (
          <Text style={styles.contactEmailBadge}>📧</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec compteur */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Ajouter des contacts</Text>
          <Text style={styles.subtitle}>
            {contactsFiltered.length} disponible{contactsFiltered.length > 1 ? 's' : ''} • 
            {selectedContacts.size} sélectionné{selectedContacts.size > 1 ? 's' : ''}
          </Text>
        </View>
        {selectedContacts.size > 0 && (
          <TouchableOpacity onPress={deselectAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TextInput
          placeholder="🔍 Rechercher par nom ou téléphone..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.searchClear}>
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'suggested' && styles.filterTabActive]}
          onPress={() => setFilterMode('suggested')}
        >
          <Text style={[styles.filterTabText, filterMode === 'suggested' && styles.filterTabTextActive]}>
            ✨ Suggérés
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'all' && styles.filterTabActive]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[styles.filterTabText, filterMode === 'all' && styles.filterTabTextActive]}>
            📱 Tous
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'recent' && styles.filterTabActive]}
          onPress={() => setFilterMode('recent')}
        >
          <Text style={[styles.filterTabText, filterMode === 'recent' && styles.filterTabTextActive]}>
            🕐 Récents
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions rapides */}
      {contactsFiltered.length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAll} style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>Tout sélectionner ({contactsFiltered.length})</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des contacts */}
      <FlatList
        data={contactsFiltered}
        keyExtractor={item => item.id}
        renderItem={renderContact}
        ListEmptyComponent={
          <View style={styles.emptyList}>
            <Text style={styles.emptyListIcon}>
              {searchText ? '🔍' : '📱'}
            </Text>
            <Text style={styles.emptyListTitle}>
              {searchText ? 'Aucun résultat' : 'Aucun contact disponible'}
            </Text>
            <Text style={styles.emptyListText}>
              {searchText ? 'Essayez avec un autre terme' : 'Tous vos contacts sont déjà dans Bob !'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: selectedContacts.size > 0 ? 100 : 20 }}
      />

      {/* Bouton d'import flottant */}
      {selectedContacts.size > 0 && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleImport}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.floatingButtonText}>
                ✅ Ajouter {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};