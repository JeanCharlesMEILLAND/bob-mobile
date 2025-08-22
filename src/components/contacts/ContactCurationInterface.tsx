// src/components/contacts/ContactCurationInterface.tsx - Interface de curation manuelle
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';

interface ContactBrut {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  hasEmail: boolean;
  isComplete: boolean; // Nom + téléphone + email
}

interface ContactCurationInterfaceProps {
  visible: boolean;
  contactsBruts: ContactBrut[]; // Les 1421 contacts du téléphone
  contactsDejaSelectionnes: string[]; // IDs des contacts déjà dans Bob
  onClose: () => void;
  onImportSelected: (contactIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export const ContactCurationInterface: React.FC<ContactCurationInterfaceProps> = ({
  visible,
  contactsBruts,
  contactsDejaSelectionnes,
  onClose,
  onImportSelected,
  isLoading = false,
}) => {
  // États de sélection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<'tous' | 'avec_email' | 'sans_email' | 'complets'>('tous');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Alphabet pour navigation rapide
  const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const [letterFilter, setLetterFilter] = useState<string>('');

  // Reset sélection quand on ouvre/ferme
  useEffect(() => {
    if (visible) {
      setSelectedContacts(new Set());
      setSearchText('');
      setLetterFilter('');
      setFilterMode('tous');
    }
  }, [visible]);

  // Filtrer les contacts selon les critères
  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsBruts];

    // Exclure les contacts déjà dans Bob
    filtered = filtered.filter(c => !contactsDejaSelectionnes.includes(c.id));

    // Appliquer le filtre de mode
    switch (filterMode) {
      case 'avec_email':
        filtered = filtered.filter(c => c.hasEmail);
        break;
      case 'sans_email':
        filtered = filtered.filter(c => !c.hasEmail);
        break;
      case 'complets':
        filtered = filtered.filter(c => c.isComplete);
        break;
    }

    // Appliquer le filtre par lettre
    if (letterFilter) {
      filtered = filtered.filter(contact => 
        contact.nom.toUpperCase().startsWith(letterFilter)
      );
    }

    // Appliquer la recherche textuelle
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(contact => 
        contact.nom.toLowerCase().includes(search) ||
        contact.telephone.includes(search) ||
        (contact.email && contact.email.toLowerCase().includes(search))
      );
    }

    // Trier par nom
    return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [contactsBruts, contactsDejaSelectionnes, searchText, filterMode, letterFilter]);

  // Compter les contacts par lettre
  const contactsByLetter = useMemo(() => {
    const counts: { [key: string]: number } = {};
    const availableContacts = contactsBruts.filter(c => !contactsDejaSelectionnes.includes(c.id));
    
    ALPHABET.forEach(letter => {
      counts[letter] = availableContacts.filter(c => 
        c.nom.toUpperCase().startsWith(letter)
      ).length;
    });

    return counts;
  }, [contactsBruts, contactsDejaSelectionnes]);

  // Statistiques
  const stats = useMemo(() => ({
    total: contactsBruts.length,
    disponibles: contactsBruts.length - contactsDejaSelectionnes.length,
    dejaImportes: contactsDejaSelectionnes.length,
    avecEmail: contactsBruts.filter(c => c.hasEmail && !contactsDejaSelectionnes.includes(c.id)).length,
    complets: contactsBruts.filter(c => c.isComplete && !contactsDejaSelectionnes.includes(c.id)).length,
    affiches: contactsFiltered.length,
    selectionnes: selectedContacts.size,
  }), [contactsBruts, contactsDejaSelectionnes, contactsFiltered.length, selectedContacts.size]);

  // Sélectionner/désélectionner un contact
  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const newSet = new Set<string>(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  // Sélectionner tous les contacts visibles
  const selectAllVisible = () => {
    const visibleIds = contactsFiltered.map(c => c.id);
    setSelectedContacts(prev => {
      const newSet = new Set(prev);
      visibleIds.forEach(id => newSet.add(id));
      return newSet;
    });
  };

  // Désélectionner tous les contacts visibles
  const deselectAllVisible = () => {
    const visibleIds = new Set(contactsFiltered.map(c => c.id));
    setSelectedContacts(prev => {
      const newSet = new Set<string>();
      prev.forEach(id => {
        if (!visibleIds.has(id)) {
          newSet.add(id);
        }
      });
      return newSet;
    });
  };

  // Vider complètement la sélection
  const clearSelection = () => {
    setSelectedContacts(new Set());
  };

  // Confirmer l'import
  const handleConfirmImport = () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Aucun contact sélectionné', 'Veuillez sélectionner au moins un contact à importer.');
      return;
    }
    setShowConfirmModal(true);
  };

  // Procéder à l'import
  const processImport = async () => {
    try {
      const contactIds = Array.from(selectedContacts);
      await onImportSelected(contactIds);
      setShowConfirmModal(false);
      Alert.alert(
        'Import terminé !',
        `${contactIds.length} contact(s) ajouté(s) à votre liste Bob.`,
        [{ text: 'Super !', onPress: onClose }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible d\'importer les contacts: ' + error.message);
    }
  };

  // Rendu d'un contact
  const renderContact = ({ item }: { item: ContactBrut }) => {
    const isSelected = selectedContacts.has(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => toggleContact(item.id)}
      >
        {/* Checkbox */}
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        {/* Avatar avec initiale */}
        <View style={[styles.avatar, item.isComplete && styles.avatarComplete]}>
          <Text style={styles.avatarText}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Infos contact */}
        <View style={styles.contactInfo}>
          <Text style={styles.contactNom} numberOfLines={1}>
            {item.nom}
          </Text>
          <Text style={styles.contactPhone} numberOfLines={1}>
            {item.telephone}
          </Text>
          {item.email && (
            <Text style={styles.contactEmail} numberOfLines={1}>
              {item.email}
            </Text>
          )}
        </View>

        {/* Badges */}
        <View style={styles.badgesContainer}>
          {item.hasEmail && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>📧</Text>
            </View>
          )}
          {item.isComplete && (
            <View style={[styles.badge, styles.badgeComplete]}>
              <Text style={styles.badgeText}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Choisir mes contacts</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.disponibles}</Text>
              <Text style={styles.statLabel}>disponibles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.affiches}</Text>
              <Text style={styles.statLabel}>affichés</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.selectionnes}</Text>
              <Text style={styles.statLabel}>sélectionnés</Text>
            </View>
          </View>
        </View>

        {/* Recherche */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Rechercher par nom, téléphone ou email..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearSearch}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres */}
        <View style={styles.filtersContainer}>
          {[
            { key: 'tous', label: 'Tous', count: stats.disponibles },
            { key: 'avec_email', label: 'Avec email', count: stats.avecEmail },
            { key: 'complets', label: 'Complets', count: stats.complets },
          ].map(filter => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                filterMode === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilterMode(filter.key as any)}
            >
              <Text style={[
                styles.filterText,
                filterMode === filter.key && styles.filterTextActive,
              ]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation alphabétique */}
        <View style={styles.alphabetContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={ALPHABET}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.letterButton,
                  letterFilter === item && styles.letterButtonActive,
                  contactsByLetter[item] === 0 && styles.letterButtonDisabled,
                ]}
                onPress={() => setLetterFilter(letterFilter === item ? '' : item)}
                disabled={contactsByLetter[item] === 0}
              >
                <Text style={[
                  styles.letterText,
                  letterFilter === item && styles.letterTextActive,
                  contactsByLetter[item] === 0 && styles.letterTextDisabled,
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Actions de sélection */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={selectAllVisible} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Tout sélectionner ({contactsFiltered.length})</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={deselectAllVisible} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Désélectionner la page</Text>
          </TouchableOpacity>
          
          {selectedContacts.size > 0 && (
            <TouchableOpacity onPress={clearSelection} style={[styles.actionButton, styles.actionButtonClear]}>
              <Text style={styles.actionButtonText}>Vider ({selectedContacts.size})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Liste des contacts */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Chargement des contacts...</Text>
          </View>
        ) : contactsFiltered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>
              {searchText || letterFilter ? 'Aucun contact trouvé' : 'Tous vos contacts sont déjà importés'}
            </Text>
            <Text style={styles.emptyMessage}>
              {searchText || letterFilter 
                ? 'Essayez de modifier votre recherche ou vos filtres'
                : 'Vous pouvez faire un nouveau scan pour récupérer de nouveaux contacts'
              }
            </Text>
          </View>
        ) : (
          <FlatList
            data={contactsFiltered}
            renderItem={renderContact}
            keyExtractor={(item, index) => `${item.id}_${index}_${item.nom || 'unknown'}_${item.telephone || 'no-phone'}`}
            style={styles.contactsList}
            showsVerticalScrollIndicator={false}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            windowSize={10}
          />
        )}

        {/* Bouton d'import */}
        {selectedContacts.size > 0 && (
          <View style={styles.importContainer}>
            <TouchableOpacity
              style={styles.importButton}
              onPress={handleConfirmImport}
              disabled={isLoading}
            >
              <Text style={styles.importButtonText}>
                🚀 Importer {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modal de confirmation */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.confirmOverlay}>
            <View style={styles.confirmModal}>
              <Text style={styles.confirmTitle}>Confirmer l'import</Text>
              <Text style={styles.confirmMessage}>
                Voulez-vous importer {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} dans votre liste Bob ?
              </Text>
              <Text style={styles.confirmSubMessage}>
                Ces contacts pourront ensuite être invités à rejoindre Bob.
              </Text>
              
              <View style={styles.confirmActions}>
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmButtonCancel]}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.confirmButtonTextCancel}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.confirmButton, styles.confirmButtonConfirm]}
                  onPress={processImport}
                  disabled={isLoading}
                >
                  <Text style={styles.confirmButtonTextConfirm}>
                    {isLoading ? 'Import...' : 'Confirmer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: 'white',
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
  },
  
  // Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearSearch: {
    padding: 8,
  },
  clearSearchText: {
    fontSize: 18,
    color: '#666',
  },
  
  // Filtres
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    elevation: 1,
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  
  // Navigation alphabétique
  alphabetContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 8,
    elevation: 1,
  },
  letterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderRadius: 4,
  },
  letterButtonActive: {
    backgroundColor: '#2196F3',
  },
  letterButtonDisabled: {
    opacity: 0.3,
  },
  letterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  letterTextActive: {
    color: 'white',
  },
  letterTextDisabled: {
    color: '#CCC',
  },
  
  // Actions
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    alignItems: 'center',
    elevation: 1,
  },
  actionButtonClear: {
    backgroundColor: '#FF9800',
  },
  actionButtonText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  
  // Liste contacts
  contactsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 1,
    borderRadius: 8,
    elevation: 1,
  },
  contactItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  
  // Checkbox
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Avatar
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarComplete: {
    backgroundColor: '#4CAF50',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // Info contact
  contactInfo: {
    flex: 1,
    marginRight: 8,
  },
  contactNom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: '#888',
  },
  
  // Badges
  badgesContainer: {
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeComplete: {
    backgroundColor: '#4CAF50',
  },
  badgeText: {
    fontSize: 10,
    color: 'white',
  },
  
  // États vides/loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Import
  importContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  importButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  importButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // Modal de confirmation
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  confirmSubMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  confirmButtonConfirm: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonTextConfirm: {
    color: 'white',
    fontWeight: '600',
  },
});