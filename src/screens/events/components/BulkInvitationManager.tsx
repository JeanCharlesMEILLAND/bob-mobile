// src/screens/events/components/BulkInvitationManager.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { styles } from './BulkInvitationManager.styles';
import {
  ContactInvitationState,
  InvitationType,
  BulkInvitationResult
} from '../../../types/events.extended.types';

interface BulkInvitationManagerProps {
  selectedContacts: ContactInvitationState[];
  onSendInvitations: (
    contacts: ContactInvitationState[],
    options: {
      messagePersonnalise?: string;
      envoyerImmediatement: boolean;
      respecterPreferences: boolean;
    }
  ) => Promise<BulkInvitationResult>;
  onComplete: (result: BulkInvitationResult) => void;
  eventTitle: string;
}

export const BulkInvitationManager: React.FC<BulkInvitationManagerProps> = ({
  selectedContacts,
  onSendInvitations,
  onComplete,
  eventTitle
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [messagePersonnalise, setMessagePersonnalise] = useState('');
  const [envoyerImmediatement, setEnvoyerImmediatement] = useState(true);
  const [respecterPreferences, setRespecterPreferences] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const getStats = () => {
    const utilisateursBob = selectedContacts.filter(c => c.target.estUtilisateurBob).length;
    const contactsSansBob = selectedContacts.filter(c => !c.target.estUtilisateurBob).length;
    
    const canaux: Record<InvitationType, number> = {
      push: 0,
      sms: 0,
      whatsapp: 0,
      email: 0,
      mixte: 0
    };

    selectedContacts.forEach(contact => {
      canaux[contact.canal]++;
    });

    return { utilisateursBob, contactsSansBob, canaux };
  };

  const getChannelIcon = (canal: InvitationType): string => {
    switch (canal) {
      case 'push': return '🔔';
      case 'sms': return '💬';
      case 'whatsapp': return '📲';
      case 'email': return '📧';
      default: return '📤';
    }
  };

  const getChannelName = (canal: InvitationType): string => {
    switch (canal) {
      case 'push': return 'Notification Bob';
      case 'sms': return 'SMS';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      default: return 'Mixte';
    }
  };

  const handleSend = async () => {
    try {
      setIsSending(true);
      
      const result = await onSendInvitations(selectedContacts, {
        messagePersonnalise: messagePersonnalise.trim() || undefined,
        envoyerImmediatement,
        respecterPreferences
      });

      setShowPreview(false);
      onComplete(result);
    } catch (error: any) {
      console.error('❌ Erreur envoi invitations:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer les invitations');
    } finally {
      setIsSending(false);
    }
  };

  const confirmSend = () => {
    const stats = getStats();
    
    Alert.alert(
      'Confirmer l\'envoi',
      `Envoyer ${selectedContacts.length} invitation${selectedContacts.length > 1 ? 's' : ''} ?\n\n` +
      `👥 ${stats.utilisateursBob} utilisateur${stats.utilisateursBob > 1 ? 's' : ''} Bob\n` +
      `📱 ${stats.contactsSansBob} contact${stats.contactsSansBob > 1 ? 's' : ''} sans Bob\n\n` +
      `🔔 ${stats.canaux.push} notification${stats.canaux.push > 1 ? 's' : ''}\n` +
      `💬 ${stats.canaux.sms} SMS\n` +
      `📲 ${stats.canaux.whatsapp} WhatsApp\n` +
      `📧 ${stats.canaux.email} email${stats.canaux.email > 1 ? 's' : ''}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Aperçu', onPress: () => setShowPreview(true) },
        { text: 'Envoyer', onPress: handleSend, style: 'default' }
      ]
    );
  };

  const renderPreviewModal = () => {
    const stats = getStats();

    return (
      <Modal
        visible={showPreview}
        transparent
        animationType="slide"
        onRequestClose={() => !isSending && setShowPreview(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aperçu des invitations</Text>
              <Text style={styles.modalSubtitle}>
                {eventTitle}
              </Text>
              {!isSending && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowPreview(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.previewContent}>
              {/* Statistiques */}
              <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>📊 Résumé</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedContacts.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#28A745' }]}>{stats.utilisateursBob}</Text>
                    <Text style={styles.statLabel}>Bob</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: '#007AFF' }]}>{stats.contactsSansBob}</Text>
                    <Text style={styles.statLabel}>Sans Bob</Text>
                  </View>
                </View>
              </View>

              {/* Répartition par canal */}
              <View style={styles.channelsSection}>
                <Text style={styles.sectionTitle}>📬 Canaux d'envoi</Text>
                {Object.entries(stats.canaux)
                  .filter(([_, count]) => count > 0)
                  .map(([canal, count]) => (
                    <View key={canal} style={styles.channelItem}>
                      <Text style={styles.channelIcon}>
                        {getChannelIcon(canal as InvitationType)}
                      </Text>
                      <Text style={styles.channelName}>
                        {getChannelName(canal as InvitationType)}
                      </Text>
                      <Text style={styles.channelCount}>{count}</Text>
                    </View>
                  ))}
              </View>

              {/* Message personnalisé */}
              <View style={styles.messageSection}>
                <Text style={styles.sectionTitle}>💬 Message personnalisé</Text>
                <TextInput
                  style={styles.messageInput}
                  placeholder="Ajouter un message personnalisé (optionnel)"
                  value={messagePersonnalise}
                  onChangeText={setMessagePersonnalise}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                  editable={!isSending}
                />
                <Text style={styles.messageHint}>
                  Ce message sera ajouté à l'invitation standard
                </Text>
              </View>

              {/* Options avancées */}
              <View style={styles.optionsSection}>
                <Text style={styles.sectionTitle}>⚙️ Options</Text>
                
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => !isSending && setEnvoyerImmediatement(!envoyerImmediatement)}
                  disabled={isSending}
                >
                  <View style={[styles.checkbox, envoyerImmediatement && styles.checkboxChecked]}>
                    {envoyerImmediatement && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLabel}>Envoyer immédiatement</Text>
                    <Text style={styles.optionDescription}>
                      Les invitations seront envoyées maintenant
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => !isSending && setRespecterPreferences(!respecterPreferences)}
                  disabled={isSending}
                >
                  <View style={[styles.checkbox, respecterPreferences && styles.checkboxChecked]}>
                    {respecterPreferences && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionLabel}>Respecter les préférences</Text>
                    <Text style={styles.optionDescription}>
                      Adapter l'heure et la fréquence selon l'historique
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Liste des destinataires */}
              <View style={styles.recipientsSection}>
                <Text style={styles.sectionTitle}>👥 Destinataires</Text>
                {selectedContacts.map(contact => (
                  <View key={contact.target.id} style={styles.recipientItem}>
                    <View style={styles.recipientInfo}>
                      <Text style={styles.recipientName}>
                        {contact.target.prenom ? `${contact.target.prenom} ` : ''}
                        {contact.target.nom}
                      </Text>
                      <Text style={styles.recipientDetails}>
                        {contact.target.telephone}
                        {contact.target.groupeOrigine && ` • ${contact.target.groupeOrigine}`}
                      </Text>
                    </View>
                    <View style={styles.recipientChannel}>
                      <Text style={styles.recipientChannelIcon}>
                        {getChannelIcon(contact.canal)}
                      </Text>
                      <Text style={styles.recipientChannelText}>
                        {getChannelName(contact.canal)}
                      </Text>
                    </View>
                    {contact.target.estUtilisateurBob && (
                      <View style={styles.bobIndicator}>
                        <Text style={styles.bobIndicatorText}>BOB</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActions}>
              {!isSending ? (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowPreview(false)}
                  >
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSend}
                  >
                    <Text style={styles.sendButtonText}>
                      📤 Envoyer {selectedContacts.length} invitation{selectedContacts.length > 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.sendingContainer}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.sendingText}>Envoi en cours...</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.sendButton}
        onPress={confirmSend}
        disabled={selectedContacts.length === 0}
      >
        <Text style={styles.sendButtonText}>
          📤 Envoyer {selectedContacts.length} invitation{selectedContacts.length > 1 ? 's' : ''}
        </Text>
      </TouchableOpacity>

      {renderPreviewModal()}
    </View>
  );
};