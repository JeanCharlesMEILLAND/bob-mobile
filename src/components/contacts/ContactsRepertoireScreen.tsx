// src/screens/contacts/ContactsRepertoireScreen.tsx - Interface complète de gestion répertoire
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';
import { useContactsBob } from '../../hooks/useContactsBob';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';

export const ContactsRepertoireScreen = () => {
  const {
    isLoading,
    contactsBruts,
    repertoire,
    contacts,
    scannerRepertoire,
    importerContactsSelectionnes,
    retirerContactsDuRepertoire,
    repartirAZero,
    getStats,
    lastScanDate,
    clearCache,
  } = useContactsBob();

  // États UI
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSelectionInterface, setShowSelectionInterface] = useState(false);
  const [showInvitationInterface, setShowInvitationInterface] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'smart' | 'recent'>('smart');
  const [showManageMode, setShowManageMode] = useState(false);

  // Animation
  const [slideAnim] = useState(new Animated.Value(0));

  const stats = getStats();

  // Contacts intelligents (avec priorité basée sur fréquence estimée)
  const contactsAvecPriorite = useMemo(() => {
    return contactsBruts.map(contact => ({
      ...contact,
      priorite: calculerPriorite(contact),
      isInRepertoire: repertoire.some(r => r.id === contact.id),
    }));
  }, [contactsBruts, repertoire]);

  // Filtrage et tri des contacts
  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsAvecPriorite];

    // Recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(search) ||
        c.telephone.includes(search) ||
        (c.email && c.email.toLowerCase().includes(search))
      );
    }

    // Tri
    switch (sortBy) {
      case 'smart':
        filtered.sort((a, b) => (b.priorite || 0) - (a.priorite || 0));
        break;
      case 'recent':
        // Simuler tri par récence (dans vraie app: utiliser logs d'appels)
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [contactsAvecPriorite, searchText, sortBy]);

  // Calculer priorité intelligente
  function calculerPriorite(contact: any): number {
    let score = 0;
    const nom = contact.nom.toLowerCase();

    // Famille proche (heuristiques)
    const motsFamille = ['papa', 'maman', 'marie', 'pierre', 'jean', 'sophie', 'paul', 'anne'];
    if (motsFamille.some(mot => nom.includes(mot))) score += 10;

    // Prénom seul = plus proche
    if (!nom.includes(' ') && nom.length < 15) score += 8;

    // A un email = plus complet
    if (contact.hasEmail) score += 5;

    // Éviter entreprises
    const motsEntreprise = ['sarl', 'sas', 'auto', 'garage', 'docteur', 'cabinet', 'service'];
    if (motsEntreprise.some(mot => nom.includes(mot))) score -= 5;

    // Nom court = plus proche
    if (nom.length < 12) score += 3;

    return Math.max(0, score);
  }

  // Demander permission avec style
  const demanderPermissionRepertoire = () => {
    setShowPermissionModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Scanner le répertoire
  const handleScanRepertoire = async () => {
    setShowPermissionModal(false);
    try {
      await scannerRepertoire();
      
      Alert.alert(
        '📱 Scan terminé !',
        `${contactsBruts.length} contacts trouvés dans votre téléphone.\n\nChoisissez maintenant ceux que vous voulez dans votre réseau Bob.`,
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Choisir maintenant', onPress: () => setShowSelectionInterface(true) }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Importer les contacts sélectionnés
  const handleImportSelected = async (contactIds: string[]) => {
    try {
      await importerContactsSelectionnes(contactIds);
      setShowSelectionInterface(false);
      setSelectedContacts(new Set());
      
      Alert.alert(
        '✅ Contacts ajoutés !',
        `${contactIds.length} contact(s) ajouté(s) à votre réseau Bob.`,
        [{ text: 'Super !', style: 'default' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Retirer des contacts du répertoire
  const handleRetirerContacts = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Aucune sélection', 'Sélectionnez des contacts à retirer.');
      return;
    }

    Alert.alert(
      'Retirer des contacts',
      `Retirer ${selectedContacts.size} contact(s) de votre réseau Bob ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await retirerContactsDuRepertoire(Array.from(selectedContacts));
              setSelectedContacts(new Set());
              setShowManageMode(false);
              Alert.alert('Succès', 'Contacts retirés de votre réseau.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  // Repartir à zéro
  const handleRepartirAZero = () => {
    Alert.alert(
      '🗑️ Repartir à zéro',
      `Supprimer tous vos ${stats.mesContacts} contacts Bob et recommencer ?\n\nVos contacts téléphone ne seront pas affectés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Repartir à zéro',
          style: 'destructive',
          onPress: async () => {
            try {
              await repartirAZero();
              setSelectedContacts(new Set());
              setShowManageMode(false);
              Alert.alert('Remis à zéro', 'Vous pouvez maintenant re-sélectionner vos contacts.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  // Vider cache complet
  const handleViderCache = () => {
    Alert.alert(
      '💾 Vider le cache',
      'Supprimer TOUTES les données (contacts téléphone + Bob) et recommencer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider tout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              Alert.alert('Cache vidé', 'Toutes les données ont été supprimées.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  // Sélectionner/désélectionner contact
  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
  };

  // Rendu d'un contact dans le répertoire
  const renderContact = ({ item }: { item: any }) => {
    const isSelected = selectedContacts.has(item.id);
    const prioriteColor = (item.priorite || 0) > 8 ? '#FF9800' : (item.priorite || 0) > 5 ? '#2196F3' : '#9E9E9E';
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => showManageMode && toggleContactSelection(item.id)}
      >
        {/* Checkbox en mode gestion */}
        {showManageMode && (
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        )}

        {/* Avatar avec priorité */}
        <View style={[styles.avatar, { backgroundColor: prioriteColor }]}>
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

        {/* Indicateurs */}
        <View style={styles.indicateurs}>
          {(item.priorite || 0) > 8 && (
            <View style={styles.badgePriorite}>
              <Text style={styles.badgeText}>🔥</Text>
            </View>
          )}
          {item.hasEmail && (
            <View style={styles.badgeEmail}>
              <Text style={styles.badgeText}>📧</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Contacts Bob</Text>
        {repertoire.length > 0 && (
          <TouchableOpacity 
            onPress={() => setShowInvitationInterface(true)}
            style={styles.inviteButton}
          >
            <Text style={styles.inviteButtonText}>Inviter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Interface d'invitation */}
      {showInvitationInterface && (
        <ContactsSelectionInterface
          onClose={() => setShowInvitationInterface(false)}
        />
      )}

      <ScrollView style={styles.content}>
        {repertoire.length === 0 ? (
          /* État initial - Pas de contacts */
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={styles.emptyTitle}>Créez votre réseau Bob</Text>
            <Text style={styles.emptyDescription}>
              Sélectionnez les contacts de votre répertoire que vous souhaitez avoir dans Bob pour faciliter l'entraide.
            </Text>

            {contactsBruts.length === 0 ? (
              /* Pas encore scanné */
              <TouchableOpacity
                style={styles.scanButton}
                onPress={demanderPermissionRepertoire}
                disabled={isLoading}
              >
                <Text style={styles.scanButtonText}>
                  📱 Accéder à mon répertoire
                </Text>
              </TouchableOpacity>
            ) : (
              /* Contacts scannés mais aucun sélectionné */
              <View style={styles.scannedActions}>
                <View style={styles.scanInfo}>
                  <Text style={styles.scanInfoText}>
                    📊 {contactsBruts.length} contacts trouvés
                  </Text>
                  {lastScanDate && (
                    <Text style={styles.scanDate}>
                      Scanné le {new Date(lastScanDate).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => setShowSelectionInterface(true)}
                >
                  <Text style={styles.selectButtonText}>
                    🎯 Choisir mes contacts
                  </Text>
                </TouchableOpacity>

                <View style={styles.secondaryActions}>
                  <TouchableOpacity
                    style={styles.rescanButton}
                    onPress={demanderPermissionRepertoire}
                    disabled={isLoading}
                  >
                    <Text style={styles.rescanButtonText}>🔄 Rescanner</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleViderCache}
                  >
                    <Text style={styles.clearButtonText}>🗑️ Vider cache</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* État avec contacts - Dashboard */
          <View style={styles.dashboard}>
            {/* Stats */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>📊 Mon réseau Bob</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.mesContacts}</Text>
                  <Text style={styles.statLabel}>Mes contacts</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.contactsAvecBob}</Text>
                  <Text style={styles.statLabel}>Ont Bob</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.contactsSansBob}</Text>
                  <Text style={styles.statLabel}>À inviter</Text>
                </View>
              </View>
            </View>

            {/* Actions principales */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>🎯 Actions</Text>
              
              <View style={styles.actionsList}>
                {stats.contactsSansBob > 0 && (
                  <TouchableOpacity 
                    style={styles.actionCard}
                    onPress={() => setShowInvitationInterface(true)}
                  >
                    <Text style={styles.actionIcon}>🚀</Text>
                    <View style={styles.actionInfo}>
                      <Text style={styles.actionTitle}>Inviter des contacts</Text>
                      <Text style={styles.actionDescription}>
                        {stats.contactsSansBob} contact{stats.contactsSansBob > 1 ? 's' : ''} à inviter
                      </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => setShowSelectionInterface(true)}
                >
                  <Text style={styles.actionIcon}>➕</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Ajouter des contacts</Text>
                    <Text style={styles.actionDescription}>
                      {stats.contactsDisponibles} contact{stats.contactsDisponibles > 1 ? 's' : ''} disponible{stats.contactsDisponibles > 1 ? 's' : ''}
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionCard}
                  onPress={() => setShowManageMode(!showManageMode)}
                >
                  <Text style={styles.actionIcon}>⚙️</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Gérer mes contacts</Text>
                    <Text style={styles.actionDescription}>
                      Retirer ou organiser mon réseau
                    </Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Liste des contacts du répertoire */}
            {showManageMode && (
              <View style={styles.manageSection}>
                <View style={styles.manageHeader}>
                  <Text style={styles.sectionTitle}>📋 Mes {repertoire.length} contacts</Text>
                  <TouchableOpacity onPress={() => setShowManageMode(false)}>
                    <Text style={styles.doneButton}>Terminé</Text>
                  </TouchableOpacity>
                </View>

                {/* Recherche */}
                <TextInput
                  placeholder="🔍 Rechercher un contact..."
                  value={searchText}
                  onChangeText={setSearchText}
                  style={styles.searchInput}
                />

                {/* Tri */}
                <View style={styles.sortContainer}>
                  {['smart', 'name', 'recent'].map(sort => (
                    <TouchableOpacity
                      key={sort}
                      style={[styles.sortButton, sortBy === sort && styles.sortButtonActive]}
                      onPress={() => setSortBy(sort as any)}
                    >
                      <Text style={[styles.sortText, sortBy === sort && styles.sortTextActive]}>
                        {sort === 'smart' ? '🎯 Intelligent' : 
                         sort === 'name' ? '🔤 A-Z' : '📅 Récent'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Actions de sélection */}
                {selectedContacts.size > 0 && (
                  <View style={styles.selectionActions}>
                    <Text style={styles.selectionCount}>
                      {selectedContacts.size} sélectionné{selectedContacts.size > 1 ? 's' : ''}
                    </Text>
                    <View style={styles.selectionButtons}>
                      <TouchableOpacity 
                        style={styles.clearSelectionButton}
                        onPress={() => setSelectedContacts(new Set())}
                      >
                        <Text style={styles.clearSelectionText}>Vider</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.removeButton}
                        onPress={handleRetirerContacts}
                      >
                        <Text style={styles.removeButtonText}>🗑️ Retirer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Liste */}
                <FlatList
                  data={contactsFiltered.filter(c => c.isInRepertoire)}
                  renderItem={renderContact}
                  keyExtractor={item => item.id}
                  style={styles.contactsList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}

            {/* Actions avancées */}
            <View style={styles.advancedSection}>
              <Text style={styles.sectionTitle}>⚙️ Gestion avancée</Text>
              
              <View style={styles.advancedActions}>
                <TouchableOpacity
                  style={styles.rescanButton}
                  onPress={demanderPermissionRepertoire}
                  disabled={isLoading}
                >
                  <Text style={styles.rescanButtonText}>🔄 Rescanner répertoire</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleRepartirAZero}
                >
                  <Text style={styles.resetButtonText}>🗑️ Repartir à zéro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de permission */}
      <Modal
        visible={showPermissionModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.permissionOverlay}>
          <Animated.View 
            style={[
              styles.permissionModal,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.permissionIcon}>🤝</Text>
            <Text style={styles.permissionTitle}>Partager votre répertoire avec Bob ?</Text>
            <Text style={styles.permissionDescription}>
              Bob peut accéder à vos contacts pour vous proposer vos proches et faciliter les invitations.
            </Text>
            
            <View style={styles.permissionFeatures}>
              <Text style={styles.permissionFeature}>• Vos contacts restent privés</Text>
              <Text style={styles.permissionFeature}>• Vous choisissez qui ajouter</Text>
              <Text style={styles.permissionFeature}>• Aucune donnée partagée sans votre accord</Text>
            </View>

            <View style={styles.permissionActions}>
              <TouchableOpacity
                style={styles.permissionDecline}
                onPress={() => setShowPermissionModal(false)}
              >
                <Text style={styles.permissionDeclineText}>Non merci</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.permissionAccept}
                onPress={handleScanRepertoire}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.permissionAcceptText}>Accéder aux contacts</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Interface de sélection */}
      {showSelectionInterface && (
        <Modal visible={showSelectionInterface} animationType="slide">
          <ContactSelectionInterface
            contactsBruts={contactsBruts}
            contactsDejaSelectionnes={repertoire.map(c => c.id)}
            onClose={() => setShowSelectionInterface(false)}
            onImportSelected={handleImportSelected}
            isLoading={isLoading}
          />
        </Modal>
      )}
    </View>
  );
};

// Interface de sélection des contacts (version simplifiée)
interface ContactSelectionProps {
  contactsBruts: any[];
  contactsDejaSelectionnes: string[];
  onClose: () => void;
  onImportSelected: (contactIds: string[]) => Promise<void>;
  isLoading: boolean;
}

const ContactSelectionInterface: React.FC<ContactSelectionProps> = ({
  contactsBruts,
  contactsDejaSelectionnes,
  onClose,
  onImportSelected,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'smart' | 'name'>('smart');

  // Contacts avec priorité calculée
  const contactsWithPriority = useMemo(() => {
    return contactsBruts
      .filter(c => !contactsDejaSelectionnes.includes(c.id))
      .map(contact => ({
        ...contact,
        priorite: calculerPrioriteSmart(contact),
      }));
  }, [contactsBruts, contactsDejaSelectionnes]);

  // Filtrage et tri
  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsWithPriority];

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(search) ||
        c.telephone.includes(search)
      );
    }

    if (sortBy === 'smart') {
      filtered.sort((a, b) => (b.priorite || 0) - (a.priorite || 0));
    } else {
      filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [contactsWithPriority, searchText, sortBy]);

  function calculerPrioriteSmart(contact: any): number {
    let score = 0;
    const nom = contact.nom.toLowerCase();

    if (['papa', 'maman', 'marie', 'pierre', 'jean', 'sophie'].some(m => nom.includes(m))) score += 15;
    if (!nom.includes(' ') && nom.length < 15) score += 10;
    if (contact.hasEmail) score += 5;
    if (['sarl', 'auto', 'docteur'].some(m => nom.includes(m))) score -= 8;
    if (nom.length < 10) score += 3;

    return Math.max(0, score);
  }

  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContacts(newSelected);
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
    const prioriteColor = (item.priorite || 0) > 10 ? '#FF9800' : '#2196F3';
    
    return (
      <TouchableOpacity
        style={[styles.contactItem, isSelected && styles.contactItemSelected]}
        onPress={() => toggleContact(item.id)}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={[styles.avatar, { backgroundColor: prioriteColor }]}>
          <Text style={styles.avatarText}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactNom}>{item.nom}</Text>
          <Text style={styles.contactPhone}>{item.telephone}</Text>
          {(item.priorite || 0) > 10 && (
            <Text style={styles.prioriteIndicator}>🔥 Suggéré</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Choisir mes contacts</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.selectionHeader}>
        <Text style={styles.selectionStats}>
          {contactsFiltered.length} disponibles • {selectedContacts.size} sélectionnés
        </Text>
      </View>

      <TextInput
        placeholder="🔍 Rechercher..."
        value={searchText}
        onChangeText={setSearchText}
        style={styles.searchInput}
      />

      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'smart' && styles.sortButtonActive]}
          onPress={() => setSortBy('smart')}
        >
          <Text style={[styles.sortText, sortBy === 'smart' && styles.sortTextActive]}>
            🎯 Suggestions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'name' && styles.sortButtonActive]}
          onPress={() => setSortBy('name')}
        >
          <Text style={[styles.sortText, sortBy === 'name' && styles.sortTextActive]}>
            🔤 A-Z
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contactsFiltered}
        renderItem={renderContact}
        keyExtractor={item => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
      />

      {selectedContacts.size > 0 && (
        <View style={styles.importContainer}>
          <TouchableOpacity
            style={styles.importButton}
            onPress={handleImport}
            disabled={isLoading}
          >
            <Text style={styles.importButtonText}>
              ✅ Ajouter {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingTop: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  inviteButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },

  content: {
    flex: 1,
  },

  // État vide
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    minHeight: 500,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },

  // Boutons scan
  scanButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    elevation: 4,
    minWidth: 250,
    alignItems: 'center',
  },
  scanButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },

  // Actions après scan
  scannedActions: {
    width: '100%',
    gap: Spacing.md,
  },
  scanInfo: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanInfoText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  scanDate: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  selectButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  rescanButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  rescanButtonText: {
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: Typography.weights.medium,
  },

  // Dashboard
  dashboard: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },

  // Sections
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Stats
  statsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    textAlign: 'center',
  },

  // Actions
  actionsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  actionsList: {
    gap: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.textSecondary,
  },

  // Gestion
  manageSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    elevation: 2,
    maxHeight: 600,
  },
  manageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  doneButton: {
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.base,
  },

  // Recherche et tri
  searchInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
    marginBottom: Spacing.sm,
  },
  sortContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  sortButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  sortTextActive: {
    color: Colors.white,
  },

  // Sélection
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  selectionCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  clearSelectionButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  clearSelectionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.medium,
  },

  // Liste contacts
  contactsList: {
    maxHeight: 300,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactItemSelected: {
    backgroundColor: '#E3F2FD',
  },

  // Checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },

  // Avatar
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },

  // Info contact
  contactInfo: {
    flex: 1,
  },
  contactNom: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  contactPhone: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  contactEmail: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  prioriteIndicator: {
    fontSize: Typography.sizes.xs,
    color: '#FF9800',
    fontWeight: Typography.weights.medium,
  },

  // Indicateurs
  indicateurs: {
    alignItems: 'center',
    gap: 2,
  },
  badgePriorite: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEmail: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 8,
    color: Colors.white,
  },

  // Actions avancées
  advancedSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    elevation: 2,
  },
  advancedActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#F44336',
    fontWeight: Typography.weights.medium,
  },

  // Modal permission
  permissionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  permissionModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  permissionIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  permissionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  permissionDescription: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  permissionFeatures: {
    marginBottom: Spacing.xl,
  },
  permissionFeature: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  permissionActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  permissionDecline: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionDeclineText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  permissionAccept: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  permissionAcceptText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },

  // Import
  selectionHeader: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  selectionStats: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  importContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  importButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
    padding: Spacing.xs,
  },
});
