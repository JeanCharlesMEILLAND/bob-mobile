// src/screens/contacts/GroupeDetailScreen.tsx - Version adaptée à votre structure
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  FlatList 
} from 'react-native';
import { Header, Button, Input } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { useContacts } from '../../hooks/contacts/useContacts';
import { GroupeWithContactCount, Contact } from '../../types'; // Utilise vos types existants

interface GroupeDetailScreenProps {
  groupe: GroupeWithContactCount;
  onBack: () => void;
}

export const GroupeDetailScreen: React.FC<GroupeDetailScreenProps> = ({ 
  groupe, 
  onBack 
}) => {
  const { repertoire: contacts, addContact, updateContactGroupe } = useContacts();
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  // Contacts du groupe (depuis les membres du groupe)
  const groupeContacts = groupe.membres || [];

  // Contacts disponibles à ajouter (pas encore dans le groupe)
  const availableContacts = contacts.filter(contact => 
    !groupeContacts.some(membre => membre.id === contact.id)
  );

  const handleAddNewContact = async () => {
    if (!newContactName.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom');
      return;
    }

    try {
      const newContact = await createContact({
        nom: newContactName.trim(),
        prenom: '', // Optionnel dans votre structure
        telephone: newContactPhone.trim() || undefined,
        email: undefined,
        groupeIds: [groupe.id], // Ajouter directement au groupe
      });

      if (newContact) {
        Alert.alert(
          'Contact ajouté',
          `${newContact.nom} a été ajouté au groupe ${groupe.nom}`
        );

        setNewContactName('');
        setNewContactPhone('');
        setShowAddContact(false);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le contact');
    }
  };

  const handleAddExistingContact = (contact: Contact) => {
    addContactToGroupe(contact.id, groupe.id);
    Alert.alert(
      'Contact ajouté',
      `${contact.nom} a été ajouté au groupe ${groupe.nom}`
    );
  };

  const handleRemoveContact = (contact: Contact) => {
    Alert.alert(
      'Retirer du groupe',
      `Voulez-vous retirer ${contact.nom} du groupe ${groupe.nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => {
            removeContactFromGroupe(contact.id, groupe.id);
            Alert.alert('Contact retiré', `${contact.nom} a été retiré du groupe`);
          },
        },
      ]
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'famille': return '👨‍👩‍👧‍👦';
      case 'amis': return '👫';
      case 'voisins': return '🏘️';
      case 'bricoleurs': return '🔧';
      default: return '⭐';
    }
  };

  const renderContact = ({ item: contact }: { item: Contact }) => (
    <View style={styles.contactCard}>
      <View style={styles.contactInfo}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactInitial}>
            {contact.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>
            {contact.prenom ? `${contact.prenom} ${contact.nom}` : contact.nom}
          </Text>
          {contact.telephone && (
            <Text style={styles.contactPhone}>{contact.telephone}</Text>
          )}
          {contact.email && (
            <Text style={styles.contactEmail}>{contact.email}</Text>
          )}
          <Text style={styles.contactDate}>
            Ajouté le {new Date(contact.dateAjout).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveContact(contact)}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAvailableContact = ({ item: contact }: { item: Contact }) => (
    <TouchableOpacity
      style={styles.availableContactCard}
      onPress={() => handleAddExistingContact(contact)}
    >
      <View style={styles.contactInfo}>
        <View style={styles.contactAvatar}>
          <Text style={styles.contactInitial}>
            {contact.nom.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.contactDetails}>
          <Text style={styles.contactName}>
            {contact.prenom ? `${contact.prenom} ${contact.nom}` : contact.nom}
          </Text>
          {contact.telephone && (
            <Text style={styles.contactPhone}>{contact.telephone}</Text>
          )}
        </View>
      </View>
      <View style={styles.addButton}>
        <Text style={styles.addButtonText}>➕</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={GlobalStyles.container}>
      <Header 
        title="Détail du groupe" 
        onBack={onBack}
        showBackButton 
      />
      
      <ScrollView style={styles.content}>
        {/* En-tête du groupe */}
        <View style={[styles.groupeHeader, { borderLeftColor: groupe.couleur }]}>
          <View style={styles.groupeInfo}>
            <Text style={styles.groupeIcon}>
              {getTypeIcon(groupe.type)}
            </Text>
            <View style={styles.groupeDetails}>
              <Text style={styles.groupeNom}>{groupe.nom}</Text>
              {groupe.description && (
                <Text style={styles.groupeDescription}>{groupe.description}</Text>
              )}
              <Text style={styles.groupeStats}>
                {groupeContacts.length} contact{groupeContacts.length > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsSection}>
          <Button
            title="➕ Nouveau contact"
            onPress={() => setShowAddContact(true)}
            variant="primary"
            style={styles.actionButton}
          />
          {availableContacts.length > 0 && (
            <Button
              title="📞 Ajouter contact existant"
              onPress={() => {/* Scroll vers section contacts disponibles */}}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
        </View>

        {/* Formulaire nouveau contact */}
        {showAddContact && (
          <View style={styles.addContactForm}>
            <Text style={styles.sectionTitle}>Nouveau Contact</Text>
            <Input
              label="Nom"
              value={newContactName}
              onChangeText={setNewContactName}
              placeholder="Nom du contact"
            />
            <Input
              label="Téléphone (optionnel)"
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              placeholder="+33 6 12 34 56 78"
              keyboardType="phone-pad"
            />
            <View style={styles.formButtons}>
              <Button
                title="Annuler"
                onPress={() => {
                  setShowAddContact(false);
                  setNewContactName('');
                  setNewContactPhone('');
                }}
                variant="secondary"
                style={styles.formButton}
              />
              <Button
                title="Ajouter"
                onPress={handleAddNewContact}
                variant="primary"
                style={styles.formButton}
              />
            </View>
          </View>
        )}

        {/* Liste des contacts du groupe */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Contacts du groupe ({groupeContacts.length})
          </Text>
          {groupeContacts.length > 0 ? (
            <FlatList
              data={groupeContacts}
              renderItem={renderContact}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucun contact dans ce groupe
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Ajoutez votre premier contact pour commencer
              </Text>
            </View>
          )}
        </View>

        {/* Contacts disponibles à ajouter */}
        {availableContacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Contacts disponibles ({availableContacts.length})
            </Text>
            <FlatList
              data={availableContacts}
              renderItem={renderAvailableContact}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  groupeHeader: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...GlobalStyles.shadow,
  },
  groupeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupeIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  groupeDetails: {
    flex: 1,
  },
  groupeNom: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  groupeDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  groupeStats: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
  addContactForm: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...GlobalStyles.shadow,
  },
  formButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  formButton: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  contactCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...GlobalStyles.shadow,
  },
  availableContactCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactInitial: {
    color: Colors.white,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  contactDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  removeButtonText: {
    fontSize: 18,
  },
  addButton: {
    padding: Spacing.sm,
  },
  addButtonText: {
    fontSize: 18,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});