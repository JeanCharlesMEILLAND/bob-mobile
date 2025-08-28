// src/components/contacts/selection/ContactSelectionItem.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ContactSelectionItemProps {
  contact: {
    id: string;
    nom: string;
    telephone?: string;
    email?: string;
    estDansBob: boolean;
    estInvite: boolean;
    score: number;
    lastContact?: string;
  };
  isSelected: boolean;
  onToggleSelection: (contactId: string) => void;
}

export const ContactSelectionItem: React.FC<ContactSelectionItemProps> = ({
  contact,
  isSelected,
  onToggleSelection
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Vert
    if (score >= 60) return '#FF9800'; // Orange
    return '#757575'; // Gris
  };

  const getStatusIcon = () => {
    if (contact.estDansBob) return '✅';
    if (contact.estInvite) return '📧';
    return '➕';
  };

  const getStatusText = () => {
    if (contact.estDansBob) return 'Déjà sur Bob';
    if (contact.estInvite) return 'Invité';
    return 'Nouveau';
  };

  return (
    <TouchableOpacity
      style={[
        styles.contactItem,
        isSelected && styles.contactItemSelected,
        (contact.estDansBob || contact.estInvite) && styles.contactItemDisabled
      ]}
      onPress={() => onToggleSelection(contact.id)}
      disabled={contact.estDansBob || contact.estInvite}
    >
      {/* Avatar/Initial */}
      <View style={styles.contactAvatar}>
        <Text style={styles.contactAvatarText}>
          {contact.nom.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Infos principales */}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.nom}</Text>
        
        {contact.telephone && (
          <Text style={styles.contactPhone}>{contact.telephone}</Text>
        )}
        
        {contact.email && (
          <Text style={styles.contactEmail}>{contact.email}</Text>
        )}

        {contact.lastContact && (
          <Text style={styles.contactLastContact}>
            Dernière interaction: {contact.lastContact}
          </Text>
        )}
      </View>

      {/* Score et statut */}
      <View style={styles.contactMeta}>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: getScoreColor(contact.score) }]}>
            {contact.score}%
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      {/* Checkbox */}
      {!contact.estDansBob && !contact.estInvite && (
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkboxIcon}>✓</Text>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = {
  contactItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contactItemSelected: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  contactItemDisabled: {
    opacity: 0.6,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  contactInfo: {
    flex: 1,
    marginRight: 12,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#333333',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 2,
  },
  contactLastContact: {
    fontSize: 11,
    color: '#CCCCCC',
    fontStyle: 'italic' as const,
  },
  contactMeta: {
    alignItems: 'flex-end' as const,
    marginRight: 12,
  },
  scoreContainer: {
    marginBottom: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  statusContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#666666',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  checkboxSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  checkboxIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
};