// src/screens/events/components/InvitationTargetCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Alert
} from 'react-native';
import { styles } from './InvitationTargetCard.styles';
import {
  SmartInvitationTarget,
  InvitationType,
  ContactInvitationState
} from '../../../types/events.extended.types';

interface InvitationTargetCardProps {
  contactState: ContactInvitationState;
  onToggleSelection: (contactId: string) => void;
  onChangeChannel: (contactId: string, canal: InvitationType) => void;
  onCustomMessage?: (contactId: string, message: string) => void;
}

const AVAILABLE_CHANNELS: Array<{
  type: InvitationType;
  label: string;
  icon: string;
  description: string;
}> = [
  { type: 'push', label: 'Notification Bob', icon: '🔔', description: 'Notification in-app (utilisateurs Bob uniquement)' },
  { type: 'sms', label: 'SMS', icon: '💬', description: 'Message texte classique' },
  { type: 'whatsapp', label: 'WhatsApp', icon: '📲', description: 'Message WhatsApp Business' },
  { type: 'email', label: 'Email', icon: '📧', description: 'Email avec invitation complète' }
];

export const InvitationTargetCard: React.FC<InvitationTargetCardProps> = ({
  contactState,
  onToggleSelection,
  onChangeChannel,
  onCustomMessage
}) => {
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showCustomMessageModal, setShowCustomMessageModal] = useState(false);

  const { target, selected, canal, invitationSent, customMessage } = contactState;

  const getChannelIcon = (channelType: InvitationType): string => {
    return AVAILABLE_CHANNELS.find(c => c.type === channelType)?.icon || '📤';
  };

  const getChannelLabel = (channelType: InvitationType): string => {
    return AVAILABLE_CHANNELS.find(c => c.type === channelType)?.label || 'Inconnu';
  };

  const getAvailableChannels = (): typeof AVAILABLE_CHANNELS => {
    if (target.estUtilisateurBob) {
      return AVAILABLE_CHANNELS;
    } else {
      // Pour les contacts sans Bob, exclure push
      return AVAILABLE_CHANNELS.filter(c => c.type !== 'push');
    }
  };

  const handleChannelChange = (newChannel: InvitationType) => {
    if (!target.estUtilisateurBob && newChannel === 'push') {
      Alert.alert(
        'Canal non disponible',
        'Les notifications Bob ne sont disponibles que pour les utilisateurs Bob existants.'
      );
      return;
    }

    onChangeChannel(target.id, newChannel);
    setShowChannelModal(false);
  };

  const renderChannelModal = () => (
    <Modal
      visible={showChannelModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowChannelModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choisir le canal d'envoi</Text>
            <Text style={styles.modalSubtitle}>
              Pour {target.prenom ? `${target.prenom} ` : ''}{target.nom}
            </Text>
          </View>

          <View style={styles.channelOptions}>
            {getAvailableChannels().map(channel => {
              const isOptimal = channel.type === target.canalOptimal;
              const isSelected = channel.type === canal;
              const isDisabled = !target.estUtilisateurBob && channel.type === 'push';

              return (
                <TouchableOpacity
                  key={channel.type}
                  style={[
                    styles.channelOption,
                    isSelected && styles.channelOptionSelected,
                    isOptimal && styles.channelOptionOptimal,
                    isDisabled && styles.channelOptionDisabled
                  ]}
                  onPress={() => handleChannelChange(channel.type)}
                  disabled={isDisabled}
                >
                  <Text style={styles.channelOptionIcon}>{channel.icon}</Text>
                  <View style={styles.channelOptionInfo}>
                    <View style={styles.channelOptionHeader}>
                      <Text style={[
                        styles.channelOptionLabel,
                        isSelected && styles.channelOptionLabelSelected,
                        isDisabled && styles.channelOptionLabelDisabled
                      ]}>
                        {channel.label}
                      </Text>
                      {isOptimal && (
                        <View style={styles.optimalBadge}>
                          <Text style={styles.optimalBadgeText}>OPTIMAL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[
                      styles.channelOptionDescription,
                      isDisabled && styles.channelOptionDescriptionDisabled
                    ]}>
                      {channel.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowChannelModal(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.card,
          selected && styles.cardSelected,
          invitationSent && styles.cardSent
        ]}
        onPress={() => onToggleSelection(target.id)}
        disabled={invitationSent}
      >
        {/* Avatar et informations principales */}
        <View style={styles.cardMain}>
          <View style={styles.avatarContainer}>
            {target.avatar ? (
              <Image source={{ uri: target.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {(target.prenom?.[0] || '') + target.nom[0]}
                </Text>
              </View>
            )}
            
            {/* Badge Bob */}
            {target.estUtilisateurBob && (
              <View style={styles.bobBadge}>
                <Text style={styles.bobBadgeText}>BOB</Text>
              </View>
            )}

            {/* Badge niveau Bob */}
            {target.profilBob && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>
                  {target.profilBob.niveau.charAt(0)}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>
              {target.prenom ? `${target.prenom} ` : ''}{target.nom}
            </Text>
            <Text style={styles.contactPhone}>{target.telephone}</Text>
            
            {target.groupeOrigine && (
              <Text style={styles.contactGroup}>📂 {target.groupeOrigine}</Text>
            )}

            {/* Informations Bob */}
            {target.profilBob && (
              <View style={styles.bobInfo}>
                <Text style={styles.bobLevel}>{target.profilBob.niveau}</Text>
                <Text style={styles.bobPoints}>💎 {target.profilBob.bobizPoints} BOBIZ</Text>
              </View>
            )}

            {/* Historique d'invitations */}
            {target.historiqueInvitations && target.historiqueInvitations.nombreInvitations > 0 && (
              <Text style={styles.historyInfo}>
                📊 {target.historiqueInvitations.nombreInvitations} invitation{target.historiqueInvitations.nombreInvitations > 1 ? 's' : ''} • {target.historiqueInvitations.tauxAcceptation}% acceptées
              </Text>
            )}
          </View>
        </View>

        {/* Actions et statut */}
        <View style={styles.cardActions}>
          {/* Canal de communication */}
          <TouchableOpacity 
            style={styles.channelButton}
            onPress={() => setShowChannelModal(true)}
            disabled={invitationSent}
          >
            <Text style={styles.channelIcon}>{getChannelIcon(canal)}</Text>
            <Text style={styles.channelText}>{getChannelLabel(canal)}</Text>
            {!invitationSent && (
              <Text style={styles.channelArrow}>▼</Text>
            )}
          </TouchableOpacity>

          {/* Message personnalisé */}
          {customMessage && (
            <TouchableOpacity 
              style={styles.customMessageIndicator}
              onPress={() => onCustomMessage && onCustomMessage(target.id, customMessage)}
            >
              <Text style={styles.customMessageIcon}>💬</Text>
            </TouchableOpacity>
          )}

          {/* Statut de sélection/envoi */}
          <View style={styles.statusContainer}>
            {invitationSent ? (
              <View style={styles.sentBadge}>
                <Text style={styles.sentText}>✓ Envoyé</Text>
              </View>
            ) : selected ? (
              <View style={styles.selectedIndicator}>
                <Text style={styles.selectedText}>✓</Text>
              </View>
            ) : (
              <View style={styles.unselectedIndicator} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {renderChannelModal()}
    </>
  );
};