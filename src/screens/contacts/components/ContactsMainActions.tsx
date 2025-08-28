// src/screens/contacts/components/ContactsMainActions.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../../../styles';
import { styles } from '../ContactsMainScreen.styles';

interface ContactsMainActionsProps {
  stats: {
    contactsDisponibles: number;
    totalContactsBob: number;
    invitationsEnCours: number;
    mesContacts: number;
  };
  isLoading: boolean;
  onScanRepertoire: () => void;
  onShowSelection: () => void;
  onShowInvitations: () => void;
  onShowManage: () => void;
}

export const ContactsMainActions: React.FC<ContactsMainActionsProps> = ({
  stats,
  isLoading,
  onScanRepertoire,
  onShowSelection,
  onShowInvitations,
  onShowManage
}) => {
  return (
    <View style={styles.actionsSection || { padding: 16 }}>
      {/* Action principale selon contexte */}
      {stats.contactsDisponibles > 0 ? (
        <TouchableOpacity
          style={[styles.primaryButton || { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 }, { backgroundColor: Colors.primary }]}
          onPress={onShowSelection}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText || { color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            📱 Choisir mes contacts ({stats.contactsDisponibles})
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.primaryButton || { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 }, { backgroundColor: Colors.secondary }]}
          onPress={onScanRepertoire}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText || { color: 'white', fontSize: 16, fontWeight: 'bold' }}>
            🔄 Scanner mon répertoire
          </Text>
        </TouchableOpacity>
      )}

      {/* Actions secondaires */}
      <View style={styles.secondaryActions || { flexDirection: 'row', gap: 8 }}>
        {stats.mesContacts > 0 && (
          <TouchableOpacity
            style={styles.secondaryButton || { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, flex: 1 }}
            onPress={onShowInvitations}
          >
            <Text style={styles.secondaryButtonText || { fontSize: 14, color: '#666', textAlign: 'center' }}>
              💌 Inviter sur Bob
            </Text>
            {stats.invitationsEnCours > 0 && (
              <View style={styles.badge || { backgroundColor: '#ff4444', borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2, position: 'absolute', top: -8, right: -8 }}>
                <Text style={styles.badgeText || { color: 'white', fontSize: 10, fontWeight: 'bold' }}>{stats.invitationsEnCours}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        
        {stats.mesContacts > 0 && (
          <TouchableOpacity
            style={styles.secondaryButton || { padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8, flex: 1 }}
            onPress={onShowManage}
          >
            <Text style={styles.secondaryButtonText || { fontSize: 14, color: '#666', textAlign: 'center' }}>
              ⚙️ Gérer
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};