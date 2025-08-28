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
  ScrollView,
} from 'react-native';
import { styles } from './ContactsSelectionInterface.styles';
import { calculateSmartScore } from '../../utils/contactHelpers';
import { useNotifications } from '../common/SmartNotifications';

const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

interface ContactsSelectionInterfaceProps {
  contactsBruts: any[];
  repertoire?: any[]; // Contacts déjà dans le répertoire (pour détecter les doublons)
  onClose: () => void;
  onImportSelected: (contactIds: string[]) => Promise<void>;
  isLoading: boolean;
}

export const ContactsSelectionInterface: React.FC<ContactsSelectionInterfaceProps> = ({
  contactsBruts,
  repertoire = [],
  onClose,
  onImportSelected,
  isLoading,
}) => {
  const notifications = useNotifications();
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'suggested' | 'recent'>('suggested');
  const [letterFilter, setLetterFilter] = useState<string>('');
  
  // Fonction de normalisation simple pour comparer les téléphones
  const normalizePhone = (phone: string) => {
    if (!phone) return '';
    return phone.replace(/[\s\-\(\)\.]/g, '');
  };
  
  // Créer un Set avec tous les téléphones du répertoire existant
  const telephonesExistants = useMemo(() => {
    const phones = new Set<string>();
    repertoire?.forEach(contact => {
      if (contact.telephone) {
        phones.add(normalizePhone(contact.telephone));
      }
    });
    return phones;
  }, [repertoire]);

  // Enrichir tous les contacts avec l'info "déjà importé"
  const contactsDisponibles = useMemo(() => {
    // 🔍 DEBUG POUSSÉ pour comprendre les différences
    const contactsAvecTelephone = contactsBruts.filter(c => c.telephone);
    const contactsSansTelephone = contactsBruts.filter(c => !c.telephone);
    const contactsUniques = new Set(contactsBruts.map(c => c.telephone || c.id));
    
    console.log('🔥🔥🔥 TRAITEMENT CONTACTS - Debug complet:', {
      contactsBruts: contactsBruts.length,
      contactsAvecTelephone: contactsAvecTelephone.length,
      contactsSansTelephone: contactsSansTelephone.length,
      contactsUniques: contactsUniques.size,
      repertoire: repertoire.length,
      telephonesExistants: telephonesExistants.size,
      premierContactBrut: contactsBruts[0]?.nom || 'AUCUN',
      premierRepertoire: repertoire[0]?.nom || 'AUCUN'
    });
    
    return contactsBruts.map((c: any) => {
      const normalizedPhone = normalizePhone(c.telephone || '');
      const isDejaImporte = telephonesExistants.has(normalizedPhone);
      
      return {
        ...c,
        score: calculateSmartScore(c),
        isDejaImporte, // Nouvelle propriété
      };
    });
  }, [contactsBruts, telephonesExistants]);

  // Filtrage et tri
  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsDisponibles];
    
    console.log('🔍 FILTRAGE DEBUG:', {
      filterMode,
      searchText: searchText.trim(),
      letterFilter,
      contactsDisponiblesTotal: contactsDisponibles.length,
      contactsDejaImportes: contactsDisponibles.filter(c => c.isDejaImporte).length,
      contactsNouveaux: contactsDisponibles.filter(c => !c.isDejaImporte).length
    });

    // Recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(search) ||
        c.telephone.includes(search)
      );
    }

    // Filtrage alphabétique
    if (letterFilter) {
      filtered = filtered.filter(c => 
        c.nom.toUpperCase().startsWith(letterFilter)
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

    console.log('📊 FILTRAGE RÉSULTAT:', {
      filterMode,
      filteredLength: filtered.length,
      déjàImportés: filtered.filter(c => c.isDejaImporte).length,
      nouveaux: filtered.filter(c => !c.isDejaImporte).length
    });

    return filtered;
  }, [contactsDisponibles, searchText, filterMode, letterFilter]);

  // Compter les contacts par lettre pour la barre alphabétique
  const letterCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    ALPHABET.forEach(letter => {
      counts[letter] = contactsDisponibles.filter(c => 
        c.nom.toUpperCase().startsWith(letter)
      ).length;
    });
    
    return counts;
  }, [contactsDisponibles]);

  const toggleContact = (contactId: string) => {
    // Trouver le contact pour vérifier s'il est déjà importé
    const contact = contactsFiltered.find(c => c.id === contactId);
    if (contact?.isDejaImporte) {
      // Ne rien faire si le contact est déjà importé
      return;
    }
    
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const selectAll = () => {
    // Sélectionner seulement les contacts NON déjà importés
    const availableIds = new Set(contactsFiltered.filter(c => !c.isDejaImporte).map(c => c.id));
    setSelectedContacts(availableIds);
  };

  const deselectAll = () => {
    setSelectedContacts(new Set());
  };

  const handleImport = () => {
    console.log('🔥🔥🔥 ContactsSelectionInterface - handleImport appelé avec', selectedContacts.size, 'contacts');
    if (selectedContacts.size === 0) {
      notifications.warning('Aucune sélection', 'Sélectionnez au moins un contact à importer.', {
        category: 'contact_selection',
        duration: 3000
      });
      return;
    }
    console.log('🚀🚀🚀 ContactsSelectionInterface - Appel onImportSelected avec:', Array.from(selectedContacts));
    onImportSelected(Array.from(selectedContacts));
  };

  const renderContact = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.has(item.id);
    const isDejaImporte = item.isDejaImporte;
    
    // Debug pour quelques contacts
    if (Math.random() < 0.05) { // 5% des contacts
      console.log('🎨 RENDER CONTACT:', {
        nom: item.nom,
        telephone: item.telephone,
        isDejaImporte: isDejaImporte,
        hasProperty: 'isDejaImporte' in item
      });
    }
    
    return (
      <TouchableOpacity
        style={[
          styles.contactRow, 
          isSelected && styles.contactRowSelected,
          isDejaImporte && styles.contactRowDisabled // Nouveau style
        ]}
        onPress={() => toggleContact(item.id)}
        disabled={isDejaImporte} // Désactiver le toucher
      >
        <View style={[
          styles.contactCheckbox, 
          isSelected && styles.contactCheckboxSelected,
          isDejaImporte && styles.contactCheckboxDisabled
        ]}>
          {isDejaImporte ? (
            <Text style={styles.checkmarkDisabled}>✅</Text>
          ) : (
            isSelected && <Text style={styles.checkmark}>✓</Text>
          )}
        </View>
        
        <View style={[
          styles.contactAvatar, 
          item.score > 15 && !isDejaImporte && styles.contactAvatarSuggested,
          isDejaImporte && styles.contactAvatarDisabled
        ]}>
          <Text style={[
            styles.contactInitial,
            isDejaImporte && styles.contactTextDisabled
          ]}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.contactDetails}>
          <Text style={[
            styles.contactName,
            isDejaImporte && styles.contactTextDisabled
          ]}>
            {item.nom}
          </Text>
          <Text style={[
            styles.contactNumber,
            isDejaImporte && styles.contactTextDisabled
          ]}>
            {item.telephone}
          </Text>
          {isDejaImporte ? (
            <Text style={styles.contactAlreadyAdded}>✅ Déjà ajouté</Text>
          ) : (
            item.score > 15 && (
              <Text style={styles.contactSuggestion}>✨ Suggéré</Text>
            )
          )}
        </View>
        
        {item.email && !isDejaImporte && (
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

      {/* Barre alphabétique */}
      <View style={styles.alphabetContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.alphabetRow}>
            {ALPHABET.map(letter => (
              <TouchableOpacity
                key={letter}
                onPress={() => setLetterFilter(letterFilter === letter ? '' : letter)}
                style={[
                  styles.letterButton,
                  letterFilter === letter && styles.letterButtonActive,
                  letterCounts[letter] === 0 && styles.letterButtonDisabled,
                ]}
                disabled={letterCounts[letter] === 0}
              >
                <Text style={[
                  styles.letterText,
                  letterFilter === letter && styles.letterTextActive,
                  letterCounts[letter] === 0 && styles.letterTextDisabled,
                ]}>
                  {letter}
                </Text>
                <Text style={[
                  styles.letterCount,
                  letterFilter === letter && styles.letterCountActive,
                ]}>
                  {letterCounts[letter]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Indicateur de filtre actif */}
      {letterFilter && (
        <View style={styles.letterFilterInfo}>
          <Text style={styles.letterFilterText}>
            Lettre "{letterFilter}" • {contactsFiltered.length} contact{contactsFiltered.length > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={() => setLetterFilter('')}>
            <Text style={styles.clearFilterText}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions rapides */}
      {contactsFiltered.length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAll} style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>
              Sélectionner disponibles ({contactsFiltered.filter(c => !c.isDejaImporte).length})
            </Text>
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
              {letterFilter ? '🔤' : searchText ? '🔍' : '📱'}
            </Text>
            <Text style={styles.emptyListTitle}>
              {letterFilter ? `Aucun contact en "${letterFilter}"` :
               searchText ? 'Aucun résultat' : 
               'Aucun contact disponible'}
            </Text>
            <Text style={styles.emptyListText}>
              {letterFilter ? `Essayez une autre lettre` :
               searchText ? 'Essayez avec un autre terme' : 
               'Tous vos contacts sont déjà dans Bob !'}
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
                ✅ Importer {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};