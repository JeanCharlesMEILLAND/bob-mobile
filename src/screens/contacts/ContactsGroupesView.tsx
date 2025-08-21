// src/screens/contacts/ContactsGroupesView.tsx - Votre ancien écran groupes
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, FlatList, ScrollView } from 'react-native';
import { Button, CreateGroupModal, GroupeCard } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { useContacts } from '../../hooks/useContacts';
import { GroupeWithContactCount, CreateGroupeData } from '../../types';

interface ContactsGroupesViewProps {
  onGroupeSelect: (groupe: GroupeWithContactCount) => void;
}

export const ContactsGroupesView: React.FC<ContactsGroupesViewProps> = ({ 
  onGroupeSelect 
}) => {
  const { 
    groupes, 
    contacts, 
    isLoading, 
    createGroupe, 
    updateGroupe, 
    deleteGroupe,
    getGroupeTypes 
  } = useContacts();

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Handler pour la création de groupe compatible avec le modal
  const handleCreateGroupe = async (data: CreateGroupeData): Promise<void> => {
    const result = await createGroupe(data);
    if (result) {
      console.log('✅ Groupe créé avec succès:', result.nom);
    }
  };

  const handleCreateTestGroup = () => {
    console.log('👥 Création d\'un groupe de test');
    createGroupe({
      nom: 'Ma Famille',
      description: 'Description test groupe',
      type: 'custom',
      couleur: '#8B5CF6',
    });
  };

  const handleTestTypes = () => {
    console.log('🔍 Test des types de groupes:');
    const types = getGroupeTypes();
    types.forEach(type => {
      console.log(`  ${type.icon} ${type.label}: ${type.description}`);
    });
    console.log('🎨 Couleurs disponibles:', [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
    ]);
  };

  const handleQuickCreate = () => {
    console.log('⚡ Création rapide d\'un groupe de test');
    createGroupe({
      nom: 'Groupe Test',
      description: 'Créé rapidement',
      type: 'custom',
      couleur: '#10B981',
    });
  };

  const handleGroupeTap = (groupe: GroupeWithContactCount) => {
    console.log('👆 Tap sur groupe:', groupe.nom);
    onGroupeSelect(groupe);
  };

  const handleEdit = (groupe: GroupeWithContactCount) => {
    console.log('✏️ Édition groupe:', groupe.nom);
    Alert.alert(
      'Édition du groupe',
      'Fonctionnalité en développement...',
      [{ text: 'OK' }]
    );
  };

  const handleDelete = (groupe: GroupeWithContactCount) => {
    Alert.alert(
      'Supprimer le groupe',
      `Voulez-vous vraiment supprimer le groupe "${groupe.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            deleteGroupe(groupe.id);
            Alert.alert('Supprimé', `Le groupe "${groupe.nom}" a été supprimé`);
          },
        },
      ]
    );
  };

  const totalContacts = contacts.length;
  const totalGroupes = groupes.length;
  const groupesActifs = groupes.filter(g => g.contactCount > 0).length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Stats Dashboard */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalGroupes}</Text>
            <Text style={styles.statLabel}>Groupes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalContacts}</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{groupesActifs}</Text>
            <Text style={styles.statLabel}>Actifs</Text>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <Button
            title="+ Créer un groupe"
            onPress={() => setShowCreateModal(true)}
            variant="primary"
            style={styles.actionButton}
          />
          <View style={styles.quickActions}>
            <Button
              title="⚡ Test rapide"
              onPress={handleQuickCreate}
              variant="secondary"
              style={styles.quickButton}
            />
            <Button
              title="🔍 Tester types"
              onPress={handleTestTypes}
              variant="secondary"
              style={styles.quickButton}
            />
          </View>
        </View>

        {/* Liste des groupes */}
        <View style={styles.groupesSection}>
          <Text style={styles.sectionTitle}>
            Mes Groupes ({groupes.length})
          </Text>
          
          {groupes.length > 0 ? (
            <FlatList
              data={groupes}
              renderItem={({ item }) => (
                <GroupeCard
                  groupe={item}
                  onPress={() => handleGroupeTap(item)}
                  onEdit={() => handleEdit(item)}
                  onDelete={() => handleDelete(item)}
                />
              )}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>👥</Text>
              <Text style={styles.emptyStateTitle}>Aucun groupe créé</Text>
              <Text style={styles.emptyStateText}>
                Créez votre premier groupe pour organiser vos contacts
              </Text>
              <Button
                title="Créer mon premier groupe"
                onPress={() => setShowCreateModal(true)}
                variant="primary"
                style={styles.emptyStateButton}
              />
            </View>
          )}
        </View>

        {/* Debug pour développement */}
        {__DEV__ && (
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>🔧 Debug (dev seulement)</Text>
            <Button
              title="👥 Créer groupe test"
              onPress={handleCreateTestGroup}
              variant="secondary"
              style={styles.debugButton}
            />
            <Text style={styles.debugInfo}>
              Groupes: {groupes.length} | Contacts: {contacts.length}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de création */}
      <CreateGroupModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateGroupe}
        isLoading={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  actionsContainer: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  actionButton: {
    // Style par défaut
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  quickButton: {
    flex: 1,
  },
  groupesSection: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    // Style par défaut
  },
  debugSection: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  debugButton: {
    marginBottom: Spacing.sm,
  },
  debugInfo: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});