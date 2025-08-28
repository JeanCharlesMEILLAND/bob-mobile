// src/components/contacts/InvitationsScreen.tsx - Page dédiée aux invitations
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from './InvitationsScreen.styles';

interface InvitationsScreenProps {
  invitations: any[];
  onClose: () => void;
  onResendInvitation?: (invitation: any) => void;
  onCancelInvitation?: (invitation: any) => void;
  sendInvitationFromHook?: (telephone: string, nom?: string) => Promise<void>;
}

export const InvitationsScreen: React.FC<InvitationsScreenProps> = ({
  invitations,
  onClose,
  onResendInvitation,
  onCancelInvitation,
  sendInvitationFromHook,
}) => {
  const { t } = useTranslation();
  const [resendingId, setResendingId] = useState<string | null>(null);

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'envoye': return 'En attente';
      case 'delivre': return 'Reçu';
      case 'lu': return 'Lu';
      case 'accepte': return 'Accepté';
      case 'refuse': return 'Refusé';
      case 'expire': return 'Expiré';
      default: return statut;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'envoye': return '#3B82F6'; // Bleu
      case 'delivre': return '#8B5CF6'; // Violet
      case 'lu': return '#06B6D4'; // Cyan
      case 'accepte': return '#10B981'; // Vert
      case 'refuse': return '#EF4444'; // Rouge
      case 'expire': return '#6B7280'; // Gris
      default: return '#6B7280';
    }
  };

  const handleResendInvitation = async (invitation: any) => {
    if (!sendInvitationFromHook) return;

    Alert.alert(
      'Relancer l\'invitation',
      `Voulez-vous relancer l'invitation pour ${invitation.nom} (${invitation.telephone}) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Relancer',
          onPress: async () => {
            try {
              setResendingId(invitation.id);
              await sendInvitationFromHook(invitation.telephone, invitation.nom);
              Alert.alert('Invitation relancée', `L'invitation a été envoyée à nouveau à ${invitation.nom}`);
            } catch (error) {
              console.error('Erreur relance invitation:', error);
              Alert.alert('Erreur', 'Impossible de relancer l\'invitation');
            } finally {
              setResendingId(null);
            }
          }
        }
      ]
    );
  };

  const renderInvitation = ({ item: invitation }: { item: any }) => {
    const isResending = resendingId === invitation.id;
    
    return (
      <View style={styles.invitationCard}>
        <View style={styles.invitationHeader}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{invitation.nom || 'Contact'}</Text>
            <Text style={styles.contactPhone}>{invitation.telephone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invitation.statut) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(invitation.statut) }]}>
              {getStatusText(invitation.statut)}
            </Text>
          </View>
        </View>

        <View style={styles.invitationDetails}>
          {invitation.dateEnvoi && (
            <Text style={styles.detailText}>
              📅 Envoyé le {new Date(invitation.dateEnvoi).toLocaleDateString()}
            </Text>
          )}
          {invitation.methode && (
            <Text style={styles.detailText}>
              📱 Via {invitation.methode.toUpperCase()}
            </Text>
          )}
          {invitation.nombreTentatives && invitation.nombreTentatives > 1 && (
            <Text style={styles.detailText}>
              🔄 {invitation.nombreTentatives} tentatives
            </Text>
          )}
        </View>

        {invitation.statut === 'envoye' && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.resendButton]}
              onPress={() => handleResendInvitation(invitation)}
              disabled={isResending}
            >
              <Text style={styles.resendButtonText}>
                {isResending ? '⏳ Envoi...' : '🔄 Relancer'}
              </Text>
            </TouchableOpacity>
            
            {onCancelInvitation && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => onCancelInvitation(invitation)}
              >
                <Text style={styles.cancelButtonText}>❌ Annuler</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Invitations</Text>
          <Text style={styles.headerSubtitle}>{invitations.length} invitation{invitations.length > 1 ? 's' : ''} en cours</Text>
        </View>
      </View>

      {/* Liste des invitations */}
      {invitations.length > 0 ? (
        <FlatList
          data={invitations}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderInvitation}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📤</Text>
          <Text style={styles.emptyTitle}>Aucune invitation en cours</Text>
          <Text style={styles.emptyDescription}>
            Toutes vos invitations ont été acceptées ou ont expiré.
          </Text>
        </View>
      )}

      {/* Footer avec statistiques */}
      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{invitations.filter(i => i.statut === 'envoye').length}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{invitations.filter(i => i.statut === 'delivre').length}</Text>
            <Text style={styles.statLabel}>Reçues</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{invitations.filter(i => i.statut === 'accepte').length}</Text>
            <Text style={styles.statLabel}>Acceptées</Text>
          </View>
        </View>
      </View>
    </View>
  );
};