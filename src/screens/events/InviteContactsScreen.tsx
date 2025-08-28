// src/screens/events/InviteContactsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './InviteContactsScreen.styles';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebStyles } from '../../styles/web';
import { smartInvitationsService } from '../../services/smart-invitations.service';
import { authService } from '../../services/auth.service';
import {
  SmartInvitationTarget,
  ContactInvitationState,
  InvitationType,
  InviteContactsScreenProps
} from '../../types/events.extended.types';

export const InviteContactsScreen: React.FC<InviteContactsScreenProps> = ({
  eventId,
  eventTitle,
  eventPhoto,
  onComplete
}) => {
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  // États
  const [smartTargets, setSmartTargets] = useState<SmartInvitationTarget[]>([]);
  const [contactStates, setContactStates] = useState<ContactInvitationState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'bob' | 'no-bob'>('all');

  // Filtres
  const [searchText, setSearchText] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('');

  useEffect(() => {
    loadSmartTargets();
  }, [eventId]);

  const loadSmartTargets = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token requis');

      console.log('📇 Chargement des cibles intelligentes...');
      const targets = await smartInvitationsService.prepareSmartTargets(eventId, token);
      
      // Initialiser les états des contacts
      const initialStates: ContactInvitationState[] = targets.map(target => ({
        target,
        selected: target.estUtilisateurBob, // Pré-sélectionner les utilisateurs Bob
        invitationSent: false,
        canal: target.canalOptimal,
        customMessage: undefined
      }));

      setSmartTargets(targets);
      setContactStates(initialStates);
      
      console.log(`✅ ${targets.length} cibles chargées`);
    } catch (error: any) {
      console.error('❌ Erreur chargement cibles:', error);
      Alert.alert('Erreur', 'Impossible de charger les contacts');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrer les contacts
  const filteredContacts = contactStates.filter(contact => {
    // Filtre par type
    if (filterType === 'bob' && !contact.target.estUtilisateurBob) return false;
    if (filterType === 'no-bob' && contact.target.estUtilisateurBob) return false;

    // Filtre par recherche
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const nomComplet = `${contact.target.prenom || ''} ${contact.target.nom}`.toLowerCase();
      if (!nomComplet.includes(searchLower)) return false;
    }

    // Filtre par groupe
    if (selectedGroupFilter && contact.target.groupeOrigine !== selectedGroupFilter) {
      return false;
    }

    return true;
  });

  const toggleContactSelection = (contactId: string) => {
    setContactStates(prev => prev.map(contact => 
      contact.target.id === contactId
        ? { ...contact, selected: !contact.selected }
        : contact
    ));
  };

  const changeContactChannel = (contactId: string, canal: InvitationType) => {
    setContactStates(prev => prev.map(contact => 
      contact.target.id === contactId
        ? { ...contact, canal }
        : contact
    ));
  };

  const getSelectedCount = () => {
    return contactStates.filter(c => c.selected).length;
  };

  const getBobUsersCount = () => {
    const selected = contactStates.filter(c => c.selected);
    return {
      bob: selected.filter(c => c.target.estUtilisateurBob).length,
      noBob: selected.filter(c => !c.target.estUtilisateurBob).length
    };
  };

  const getChannelStats = () => {
    const selected = contactStates.filter(c => c.selected);
    const stats: Record<InvitationType, number> = {
      push: 0,
      sms: 0,
      whatsapp: 0,
      email: 0,
      mixte: 0
    };

    selected.forEach(contact => {
      stats[contact.canal]++;
    });

    return stats;
  };

  const selectAllBob = () => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: contact.target.estUtilisateurBob ? true : contact.selected
    })));
  };

  const selectAllNoBob = () => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: !contact.target.estUtilisateurBob ? true : contact.selected
    })));
  };

  const deselectAll = () => {
    setContactStates(prev => prev.map(contact => ({
      ...contact,
      selected: false
    })));
  };

  const handleSendInvitations = async () => {
    const selectedContacts = contactStates.filter(c => c.selected);
    
    if (selectedContacts.length === 0) {
      Alert.alert('Aucune sélection', 'Veuillez sélectionner au moins un contact');
      return;
    }

    const { bob, noBob } = getBobUsersCount();
    const channelStats = getChannelStats();

    Alert.alert(
      'Confirmer l\'envoi',
      `Envoyer ${selectedContacts.length} invitation${selectedContacts.length > 1 ? 's' : ''} ?\n\n` +
      `👥 ${bob} utilisateur${bob > 1 ? 's' : ''} Bob\n` +
      `📱 ${noBob} contact${noBob > 1 ? 's' : ''} sans Bob\n\n` +
      `📬 Push: ${channelStats.push}\n` +
      `💬 SMS: ${channelStats.sms}\n` +
      `📧 Email: ${channelStats.email}\n` +
      `📲 WhatsApp: ${channelStats.whatsapp}`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Envoyer', onPress: sendInvitations, style: 'default' }
      ]
    );
  };

  const sendInvitations = async () => {
    try {
      setIsSending(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token requis');

      console.log('📤 Envoi des invitations...');
      
      const result = await smartInvitationsService.sendSmartInvitations(
        eventId,
        contactStates,
        {
          envoyerImmediatement: true,
          respecterPreferences: true
        },
        token
      );

      // Mettre à jour les états
      setContactStates(prev => prev.map(contact => {
        const wasSent = result.invitations.some(
          inv => inv.destinataire.telephone === contact.target.telephone
        );
        return wasSent 
          ? { ...contact, invitationSent: true, selected: false }
          : contact;
      }));

      const successMessage = `✅ ${result.success} invitation${result.success > 1 ? 's' : ''} envoyée${result.success > 1 ? 's' : ''} !` +
        (result.failed > 0 ? `\n❌ ${result.failed} échec${result.failed > 1 ? 's' : ''}` : '') +
        `\n\n👥 ${result.tracking.utilisateursBob.envoye} utilisateurs Bob` +
        `\n📱 ${result.tracking.contactsSansBob.envoye} contacts sans Bob`;

      Alert.alert(
        'Invitations envoyées !',
        successMessage,
        [{ text: 'Continuer', onPress: onComplete }]
      );

    } catch (error: any) {
      console.error('❌ Erreur envoi invitations:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer les invitations');
    } finally {
      setIsSending(false);
    }
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

  const getChannelLabel = (canal: InvitationType): string => {
    switch (canal) {
      case 'push': return 'Notification';
      case 'sms': return 'SMS';
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'Email';
      default: return 'Mixte';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Header title="Inviter des contacts" showBackButton onBackPress={navigation.goBack} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Analyse des contacts...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, WebStyles.container]}>
      <Header 
        title="Inviter des contacts"
        subtitle={`${eventTitle}`}
        showBackButton 
        onBackPress={navigation.goBack}
      />

      {/* En-tête événement */}
      <View style={styles.eventHeader}>
        {eventPhoto && (
          <Image source={{ uri: eventPhoto }} style={styles.eventImage} />
        )}
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle}>{eventTitle}</Text>
          <Text style={styles.eventSubtitle}>
            {smartTargets.length} contact{smartTargets.length > 1 ? 's' : ''} disponible{smartTargets.length > 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Filtres et actions rapides */}
      <View style={styles.filtersSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, filterType === 'all' && styles.filterChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.filterChipText, filterType === 'all' && styles.filterChipTextActive]}>
              Tous ({smartTargets.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'bob' && styles.filterChipActive]}
            onPress={() => setFilterType('bob')}
          >
            <Text style={[styles.filterChipText, filterType === 'bob' && styles.filterChipTextActive]}>
              👥 Utilisateurs Bob ({smartTargets.filter(t => t.estUtilisateurBob).length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filterType === 'no-bob' && styles.filterChipActive]}
            onPress={() => setFilterType('no-bob')}
          >
            <Text style={[styles.filterChipText, filterType === 'no-bob' && styles.filterChipTextActive]}>
              📱 Sans Bob ({smartTargets.filter(t => !t.estUtilisateurBob).length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Actions rapides */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={selectAllBob}>
            <Text style={styles.quickActionText}>Tous Bob</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={selectAllNoBob}>
            <Text style={styles.quickActionText}>Tous sans Bob</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction} onPress={deselectAll}>
            <Text style={styles.quickActionText}>Aucun</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste des contacts */}
      <ScrollView style={styles.contactsList} showsVerticalScrollIndicator={false}>
        {filteredContacts.map(contactState => (
          <TouchableOpacity
            key={contactState.target.id}
            style={[
              styles.contactCard,
              contactState.selected && styles.contactCardSelected,
              contactState.invitationSent && styles.contactCardSent
            ]}
            onPress={() => toggleContactSelection(contactState.target.id)}
          >
            {/* Avatar et info */}
            <View style={styles.contactMain}>
              <View style={styles.contactAvatar}>
                {contactState.target.avatar ? (
                  <Image source={{ uri: contactState.target.avatar }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {(contactState.target.prenom?.[0] || '') + contactState.target.nom[0]}
                  </Text>
                )}
                {contactState.target.estUtilisateurBob && (
                  <View style={styles.bobBadge}>
                    <Text style={styles.bobBadgeText}>BOB</Text>
                  </View>
                )}
              </View>

              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>
                  {contactState.target.prenom ? `${contactState.target.prenom} ` : ''}
                  {contactState.target.nom}
                </Text>
                <Text style={styles.contactDetails}>
                  {contactState.target.telephone}
                  {contactState.target.groupeOrigine && ` • ${contactState.target.groupeOrigine}`}
                </Text>
                
                {/* Historique si disponible */}
                {contactState.target.historiqueInvitations && contactState.target.historiqueInvitations.nombreInvitations > 0 && (
                  <Text style={styles.contactHistory}>
                    📊 {contactState.target.historiqueInvitations.nombreInvitations} invitation{contactState.target.historiqueInvitations.nombreInvitations > 1 ? 's' : ''} • {contactState.target.historiqueInvitations.tauxAcceptation}% acceptées
                  </Text>
                )}
              </View>
            </View>

            {/* Canal et sélection */}
            <View style={styles.contactActions}>
              {/* Canal d'envoi */}
              <TouchableOpacity 
                style={styles.channelSelector}
                onPress={() => {
                  // TODO: Ouvrir modal de sélection de canal
                }}
              >
                <Text style={styles.channelIcon}>{getChannelIcon(contactState.canal)}</Text>
                <Text style={styles.channelLabel}>{getChannelLabel(contactState.canal)}</Text>
              </TouchableOpacity>

              {/* Statut */}
              <View style={styles.contactStatus}>
                {contactState.invitationSent ? (
                  <View style={styles.sentBadge}>
                    <Text style={styles.sentBadgeText}>✓ Envoyé</Text>
                  </View>
                ) : contactState.selected ? (
                  <View style={styles.selectedBadge}>
                    <Text style={styles.selectedBadgeText}>✓</Text>
                  </View>
                ) : (
                  <View style={styles.unselectedBadge} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredContacts.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Aucun contact trouvé</Text>
            <Text style={styles.emptyStateHint}>
              Essayez de modifier vos filtres
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar avec résumé et bouton d'envoi */}
      <View style={styles.bottomBar}>
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryText}>
            {getSelectedCount()} sélectionné{getSelectedCount() > 1 ? 's' : ''}
          </Text>
          {getSelectedCount() > 0 && (
            <Text style={styles.summaryDetails}>
              👥 {getBobUsersCount().bob} Bob • 📱 {getBobUsersCount().noBob} sans Bob
            </Text>
          )}
        </View>

        <Button
          title={isSending ? 'Envoi...' : '📤 Envoyer les invitations'}
          onPress={handleSendInvitations}
          loading={isSending}
          disabled={getSelectedCount() === 0 || isSending}
          style={[styles.sendButton, getSelectedCount() === 0 && styles.sendButtonDisabled]}
        />
      </View>
    </View>
  );
};