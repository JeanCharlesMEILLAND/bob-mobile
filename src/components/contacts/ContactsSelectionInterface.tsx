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
  repertoireBob: any[];
  invitations: any[];
  onClose: () => void;
  onImportSelected: (contactIds: string[]) => Promise<void>;
  isLoading: boolean;
}

export const ContactsSelectionInterface: React.FC<ContactsSelectionInterfaceProps> = ({
  contactsBruts,
  repertoireBob,
  invitations,
  onClose,
  onImportSelected,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'suggested' | 'recent' | 'withExisting'>('suggested');
  
  // Fonction pour normaliser les numéros de téléphone (supprimer espaces, tirets, etc.)
  const normalizePhone = (phone: string) => {
    return phone?.replace(/[\s\-\(\)\.]/g, '') || '';
  };

  // Tous les contacts avec indication s'ils sont déjà dans Bob ou ont une invitation
  const contactsAvecStatut = useMemo(() => {
    // Créer des sets pour une recherche rapide
    const phonesBob = new Set(repertoireBob.map(c => normalizePhone(c.telephone)));
    const phonesInvitations = new Set(
      invitations
        .filter(i => i.statut === 'envoye') // Seulement les invitations en cours
        .map(i => normalizePhone(i.telephone))
    );
    
    return contactsBruts.map((c: any) => {
      const phoneNormalized = normalizePhone(c.telephone);
      const dejaDansBob = phonesBob.has(phoneNormalized);
      const invitationEnCours = phonesInvitations.has(phoneNormalized);
      
      return {
        ...c,
        score: calculateSmartScore(c),
        dejaDansBob,
        invitationEnCours,
        statut: dejaDansBob ? 'dansBob' : (invitationEnCours ? 'invitation' : 'disponible')
      };
    });
  }, [contactsBruts, repertoireBob, invitations]);

  // Contacts disponibles (non déjà dans Bob et pas d'invitation en cours) 
  const contactsDisponibles = useMemo(() => {
    return contactsAvecStatut.filter(c => c.statut === 'disponible');
  }, [contactsAvecStatut]);

  // Filtrage et tri
  const contactsFiltered = useMemo(() => {
    let filtered = filterMode === 'withExisting' ? [...contactsAvecStatut] : [...contactsDisponibles];

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
      case 'withExisting':
        // Trier avec contacts déjà dans Bob en bas
        filtered.sort((a, b) => {
          if (a.dejaDansBob && !b.dejaDansBob) return 1;
          if (!a.dejaDansBob && b.dejaDansBob) return -1;
          return a.nom.localeCompare(b.nom);
        });
        break;
      default:
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [contactsDisponibles, contactsAvecStatut, searchText, filterMode]);

  const toggleContact = (contactId: string) => {
    const contact = contactsAvecStatut.find(c => c.id === contactId);
    
    if (contact?.dejaDansBob) {
      Alert.alert(
        'Contact déjà dans Bob',
        `${contact.nom} est déjà dans votre réseau Bob !`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    if (contact?.invitationEnCours) {
      Alert.alert(
        'Invitation déjà envoyée',
        `Une invitation a déjà été envoyée à ${contact.nom}. Attendez sa réponse.`,
        [{ text: 'OK' }]
      );
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
    // Ne sélectionner que les contacts vraiment disponibles
    const availableIds = new Set(contactsFiltered.filter(c => c.statut === 'disponible').map(c => c.id));
    setSelectedContacts(availableIds);
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
    const isUnavailable = item.statut !== 'disponible';
    
    return (
      <TouchableOpacity
        style={[
          styles.contactRow, 
          isSelected && styles.contactRowSelected,
          isUnavailable && styles.contactRowDisabled
        ]}
        onPress={() => toggleContact(item.id)}
        disabled={isUnavailable}
      >
        <View style={[
          styles.contactCheckbox, 
          isSelected && styles.contactCheckboxSelected,
          item.dejaDansBob && styles.contactCheckboxDisabled,
          item.invitationEnCours && styles.contactCheckboxInvitation
        ]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
          {item.dejaDansBob && <Text style={styles.alreadyInBob}>✓</Text>}
          {item.invitationEnCours && <Text style={styles.invitationPending}>⏳</Text>}
        </View>
        
        <View style={[
          styles.contactAvatar, 
          item.score > 15 && item.statut === 'disponible' && styles.contactAvatarSuggested,
          item.dejaDansBob && styles.contactAvatarDisabled,
          item.invitationEnCours && styles.contactAvatarInvitation
        ]}>
          <Text style={[
            styles.contactInitial,
            isUnavailable && styles.contactInitialDisabled
          ]}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        
        <View style={styles.contactDetails}>
          <Text style={[
            styles.contactName,
            isUnavailable && styles.contactNameDisabled
          ]}>
            {item.nom}
          </Text>
          <Text style={[
            styles.contactNumber,
            isUnavailable && styles.contactNumberDisabled
          ]}>
            {item.telephone}
          </Text>
          {item.score > 15 && item.statut === 'disponible' && (
            <Text style={styles.contactSuggestion}>✨ Suggéré</Text>
          )}
          {item.dejaDansBob && (
            <Text style={styles.contactAlreadyInBob}>✅ Déjà dans Bob</Text>
          )}
          {item.invitationEnCours && (
            <Text style={styles.contactInvitationPending}>⏳ Invitation envoyée</Text>
          )}
        </View>
        
        {item.email && item.statut === 'disponible' && (
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
            {filterMode === 'withExisting' 
              ? `${contactsFiltered.filter(c => c.statut === 'disponible').length} disponibles • ${contactsFiltered.filter(c => c.dejaDansBob).length} dans Bob • ${contactsFiltered.filter(c => c.invitationEnCours).length} invitations`
              : `${contactsFiltered.length} disponible${contactsFiltered.length > 1 ? 's' : ''}`
            } • {selectedContacts.size} sélectionné{selectedContacts.size > 1 ? 's' : ''}
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
        <TouchableOpacity
          style={[styles.filterTab, filterMode === 'withExisting' && styles.filterTabActive]}
          onPress={() => setFilterMode('withExisting')}
        >
          <Text style={[styles.filterTabText, filterMode === 'withExisting' && styles.filterTabTextActive]}>
            📋 Tout voir
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions rapides */}
      {contactsFiltered.filter(c => c.statut === 'disponible').length > 0 && (
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={selectAll} style={styles.quickActionButton}>
            <Text style={styles.quickActionText}>
              Sélectionner disponibles ({contactsFiltered.filter(c => c.statut === 'disponible').length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Liste des contacts */}
      <FlatList
        data={contactsFiltered}
        keyExtractor={(item, index) => `${item.id}_${index}_${item.nom || 'unknown'}_${item.telephone || 'no-phone'}`}
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