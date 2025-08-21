// src/screens/ContactsTestScreen.tsx - Écran de test pour contacts
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useContacts } from '../hooks/useContacts';

export const ContactsTestScreen: React.FC = () => {
  const {
    contacts,
    selectedContacts,
    isLoading,
    hasPermission,
    error,
    scanContacts,
    toggleContactSelection,
    saveSelection,
    loadSavedContacts,
    getSelectedContacts,
    getStats,
    clearError,
  } = useContacts();

  const stats = getStats();

  // Charger les contacts sauvegardés au démarrage
  useEffect(() => {
    loadSavedContacts();
  }, [loadSavedContacts]);

  // Gérer le scan des contacts
  const handleScan = async () => {
    const success = await scanContacts();
    if (success) {
      Alert.alert(
        'Scan terminé',
        `${stats.totalContacts} contacts trouvés !`,
        [{ text: 'OK' }]
      );
    } else if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK' }]);
    }
  };

  // Gérer la sauvegarde
  const handleSave = async () => {
    const selected = getSelectedContacts();
    if (selected.length === 0) {
      Alert.alert('Aucune sélection', 'Sélectionnez au moins un contact.');
      return;
    }

    Alert.alert(
      'Confirmer la sélection',
      `Sauvegarder ${selected.length} contact(s) sélectionné(s) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Sauvegarder',
          onPress: async () => {
            const success = await saveSelection();
            if (success) {
              Alert.alert(
                'Succès !',
                `${selected.length} contact(s) sauvegardé(s) avec succès !`,
                [{ text: 'Super !' }]
              );
            }
          }
        }
      ]
    );
  };

  // Rendu d'un contact
  const renderContact = ({ item }: { item: typeof contacts[0] }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        item.isSelected ? styles.contactSelected : null
      ]}
      onPress={() => toggleContactSelection(item.id)}
    >
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>
          {item.nom.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.nom}</Text>
        <Text style={styles.contactPhone}>{item.telephone}</Text>
        {item.email && (
          <Text style={styles.contactEmail}>{item.email}</Text>
        )}
      </View>
      
      <View style={[
        styles.checkbox,
        item.isSelected ? styles.checkboxSelected : null
      ]}>
        {item.isSelected && (
          <Text style={styles.checkboxText}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Rendu d'un contact sauvegardé
  const renderSavedContact = ({ item }: { item: typeof selectedContacts[0] }) => (
    <View style={styles.savedContactItem}>
      <View style={[styles.contactAvatar, { backgroundColor: '#4CAF50' }]}>
        <Text style={styles.contactAvatarText}>
          {item.nom.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.nom}</Text>
        <Text style={styles.contactPhone}>{item.telephone}</Text>
      </View>
      
      <View style={styles.savedBadge}>
        <Text style={styles.savedBadgeText}>SAUVÉ</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Test Contacts Bob</Text>
        <Text style={styles.subtitle}>
          Permission: {hasPermission ? '✅ Accordée' : '❌ Non accordée'}
        </Text>
      </View>

      {/* Stats */}
      {contacts.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.totalContacts}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.selectedCount}</Text>
            <Text style={styles.statLabel}>Sélectionnés</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.savedCount}</Text>
            <Text style={styles.statLabel}>Sauvegardés</Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleScan}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>
              📱 {hasPermission ? 'Rescanner' : 'Scanner Contacts'}
            </Text>
          )}
        </TouchableOpacity>

        {stats.selectedCount > 0 && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>
              💾 Sauvegarder ({stats.selectedCount})
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Liste des contacts */}
      {contacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📱 Contacts Trouvés ({contacts.length})
          </Text>
          <FlatList
            data={contacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Liste des contacts sauvegardés */}
      {selectedContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💾 Contacts Sauvegardés ({selectedContacts.length})
          </Text>
          <FlatList
            data={selectedContacts}
            renderItem={renderSavedContact}
            keyExtractor={item => item.id}
            style={styles.savedList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* État vide */}
      {!hasPermission && !isLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📱</Text>
          <Text style={styles.emptyTitle}>Accès aux contacts</Text>
          <Text style={styles.emptyText}>
            Appuyez sur "Scanner Contacts" pour accéder à votre répertoire
          </Text>
        </View>
      )}

      {/* Toast d'erreur */}
      {error && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity onPress={clearError}>
            <Text style={styles.errorClose}>✕</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    flex: 1,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  list: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 300,
  },
  savedList: {
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: 200,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactSelected: {
    backgroundColor: '#E3F2FD',
  },
  savedContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxText: {
    color: 'white',
    fontSize: 16,
  },
  savedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savedBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyState: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorToast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
  },
  errorText: {
    color: 'white',
    flex: 1,
    fontWeight: 'bold',
  },
  errorClose: {
    color: 'white',
    fontSize: 18,
    marginLeft: 8,
  },
});