// src/components/common/GroupeCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { GroupeWithContactCount, GROUPE_TYPES } from '../../types';

interface GroupeCardProps {
  groupe: GroupeWithContactCount;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const GroupeCard: React.FC<GroupeCardProps> = ({
  groupe,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const groupeType = GROUPE_TYPES.find(t => t.value === groupe.type);

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le groupe',
      `Êtes-vous sûr de vouloir supprimer le groupe "${groupe.nom}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: onDelete,
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: groupe.couleur }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Header avec icône et actions */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: groupe.couleur + '20' }]}>
            <Text style={styles.icon}>
              {groupeType?.icon || '⭐'}
            </Text>
          </View>
          
          <View style={styles.headerText}>
            <Text style={styles.nom} numberOfLines={1}>
              {groupe.nom}
            </Text>
            <Text style={styles.type}>
              {groupeType?.label || 'Personnalisé'}
            </Text>
          </View>
        </View>

        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            
            {onDelete && (
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Description */}
      {groupe.description && (
        <Text style={styles.description} numberOfLines={2}>
          {groupe.description}
        </Text>
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{groupe.contactCount}</Text>
          <Text style={styles.statLabel}>
            {groupe.contactCount === 0 ? 'contact' : 
             groupe.contactCount === 1 ? 'contact' : 'contacts'}
          </Text>
        </View>
        
        <View style={styles.separator} />
        
        <View style={styles.stat}>
          <Text style={styles.statDate}>
            {formatDate(groupe.dateCreation)}
          </Text>
          <Text style={styles.statLabel}>créé</Text>
        </View>
      </View>

      {/* Status badge */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          { backgroundColor: groupe.actif ? Colors.success : Colors.textSecondary }
        ]}>
          <Text style={styles.statusText}>
            {groupe.actif ? 'Actif' : 'Inactif'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...GlobalStyles.shadow,
  },
  
  header: {
    ...GlobalStyles.spaceBetween,
    marginBottom: Spacing.sm,
  },
  
  headerLeft: {
    ...GlobalStyles.row,
    flex: 1,
  },
  
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  
  icon: {
    fontSize: 20,
  },
  
  headerText: {
    flex: 1,
  },
  
  nom: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 2,
  },
  
  type: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  
  actions: {
    ...GlobalStyles.row,
    gap: Spacing.xs,
  },
  
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  
  actionIcon: {
    fontSize: 16,
  },
  
  description: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  
  stats: {
    ...GlobalStyles.row,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  stat: {
    alignItems: 'center',
  },
  
  statNumber: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  
  statDate: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  
  separator: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  
  statusContainer: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  statusText: {
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
});