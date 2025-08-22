// src/components/contacts/InvitationInterface.tsx - Version avec barre alphabétique
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { styles } from './InvitationInterface.styles';
import { GroupeType, GROUPE_TYPES } from '../../types/contacts.types';
import { generateMessage } from '../../constants/messageTemplates';
import { invitationsService } from '../../services/invitations.service';
import { authService } from '../../services/auth.service';
import { generateTranslatedMessageStatic } from '../../services/messageTranslation.service';
import { formatPhoneForWhatsApp } from '../../utils/contactHelpers';

const STORAGE_KEY = '@bob_invitations_history';
const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

type ContactStatus = 
  | 'nouveau'
  | 'invite'
  | 'relance'
  | 'refuse'
  | 'sur_bob';

interface ContactWithStatus {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  tags: GroupeType[];
  statut: ContactStatus;
  historiqueInvitations: {
    date: string;
    methode: 'sms' | 'whatsapp' | 'link';
    message: string;
  }[];
  dateInscriptionBob?: string;
  dernierContact?: string;
}

interface InvitationInterfaceProps {
  contactsSansBob: any[];
  contactsAvecBob?: any[];
  onClose: () => void;
  onSaveGroupAssignments?: (assignments: { contactId: string; groupes: GroupeType[] }[]) => void;
}

export const InvitationInterface: React.FC<InvitationInterfaceProps> = ({
  contactsSansBob,
  contactsAvecBob = [],
  onClose,
  onSaveGroupAssignments,
}) => {
  const { t } = useTranslation();
  const [contactsWithStatus, setContactsWithStatus] = useState<ContactWithStatus[]>([]);
  const [searchText, setSearchText] = useState('');
  const [letterFilter, setLetterFilter] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'tous' | 'nouveau' | 'attente' | 'sur_bob'>('tous');

  useEffect(() => {
    loadInvitationHistory();
  }, [contactsSansBob, contactsAvecBob]);

  const loadInvitationHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const history = stored ? JSON.parse(stored) : {};
      
      const merged = contactsSansBob.map(contact => {
        const savedData = history[contact.id] || {};
        const estSurBob = contactsAvecBob.some(c => c.telephone === contact.telephone);
        
        return {
          ...contact,
          statut: estSurBob ? 'sur_bob' : (savedData.statut || 'nouveau'),
          tags: savedData.tags || [],
          historiqueInvitations: savedData.historiqueInvitations || [],
          dateInscriptionBob: estSurBob ? (savedData.dateInscriptionBob || new Date().toISOString()) : undefined,
          dernierContact: savedData.dernierContact,
        } as ContactWithStatus;
      });
      
      setContactsWithStatus(merged);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    }
  };

  const saveInvitationHistory = async (updatedContacts: ContactWithStatus[]) => {
    try {
      const history: Record<string, any> = {};
      
      updatedContacts.forEach(contact => {
        history[contact.id] = {
          statut: contact.statut,
          tags: contact.tags,
          historiqueInvitations: contact.historiqueInvitations,
          dateInscriptionBob: contact.dateInscriptionBob,
          dernierContact: contact.dernierContact,
        };
      });
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
    }
  };

  const toggleTag = async (contactId: string, tag: GroupeType) => {
    const updatedContacts = contactsWithStatus.map(contact => {
      if (contact.id === contactId) {
        const newTags = contact.tags.includes(tag)
          ? contact.tags.filter(t => t !== tag)
          : [...contact.tags, tag];
        return { ...contact, tags: newTags };
      }
      return contact;
    });
    
    setContactsWithStatus(updatedContacts);
    await saveInvitationHistory(updatedContacts);
    
    if (onSaveGroupAssignments) {
      const contact = updatedContacts.find(c => c.id === contactId);
      if (contact) {
        onSaveGroupAssignments([{ contactId: contact.id, groupes: contact.tags }]);
      }
    }
  };

  const getMessageForContact = (contact: ContactWithStatus, channel: 'sms' | 'whatsapp' | 'link', codeParrainage?: string): string => {
    const { i18n } = useTranslation();
    const priorityOrder: GroupeType[] = ['famille', 'amis', 'voisins', 'bricoleurs', 'custom'];
    
    let selectedTemplate: GroupeType | undefined = undefined;
    for (const priority of priorityOrder) {
      if (contact.tags.includes(priority)) {
        selectedTemplate = priority;
        break;
      }
    }
    
    const inviteLink = codeParrainage 
      ? `https://bob-app.com/invite/${codeParrainage}`
      : 'bob-app.com/invite';
    
    return generateTranslatedMessageStatic(channel as 'sms' | 'whatsapp', selectedTemplate, {
      firstName: contact.nom.split(' ')[0],
      link: inviteLink,
    }, i18n.language);
  };

  const sendInvitation = async (contact: ContactWithStatus, method: 'sms' | 'whatsapp') => {
    try {
      // Créer l'invitation dans Strapi d'abord
      const token = await authService.getValidToken();
      if (!token) {
        Alert.alert(t('common.error'), t('contacts.invitation.mustBeConnected'));
        return;
      }

      console.log('📤 Création invitation Strapi pour:', contact.nom);
      
      const invitation = await invitationsService.createInvitation({
        telephone: contact.telephone,
        nom: contact.nom,
        type: method,
      }, token);
      
      console.log('✅ Invitation créée avec code:', invitation.codeParrainage);
      
      // Générer le message avec le vrai lien d'invitation
      const message = getMessageForContact(contact, method, invitation.codeParrainage);
      
      let url = '';
      if (method === 'sms') {
        url = `sms:${contact.telephone}?body=${encodeURIComponent(message)}`;
      } else {
        // Utiliser la fonction de formatage dédiée WhatsApp
        const phoneNumber = formatPhoneForWhatsApp(contact.telephone);
        
        if (!phoneNumber) {
          Alert.alert('Erreur', 'Numéro de téléphone invalide pour WhatsApp');
          return;
        }
        
        url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
      }
      
      await Linking.openURL(url);
      
      const updatedContacts = contactsWithStatus.map(c => {
        if (c.id === contact.id) {
          const newHistory = [
            ...c.historiqueInvitations,
            {
              date: new Date().toISOString(),
              methode: method,
              message: message,
            }
          ];
          
          const newStatus: ContactStatus = c.statut === 'nouveau' ? 'invite' : 'relance';
          
          return {
            ...c,
            statut: newStatus,
            historiqueInvitations: newHistory,
            dernierContact: new Date().toISOString(),
          };
        }
        return c;
      });
      
      setContactsWithStatus(updatedContacts);
      await saveInvitationHistory(updatedContacts);
      
      Alert.alert(
        t('contacts.invitation.invitationSent'), 
        t('contacts.invitation.invitationSentDesc', { 
          name: contact.nom, 
          method: method.toUpperCase() 
        })
      );
    } catch (error) {
      console.error('❌ Erreur envoi invitation:', error);
      Alert.alert(t('common.error'), t('contacts.invitation.errorSending', { error: error instanceof Error ? error.message : 'Erreur inconnue' }));
    }
  };

  const markAsJoinedBob = async (contact: ContactWithStatus) => {
    const updatedContacts = contactsWithStatus.map(c => {
      if (c.id === contact.id) {
        return {
          ...c,
          statut: 'sur_bob' as ContactStatus,
          dateInscriptionBob: new Date().toISOString(),
        };
      }
      return c;
    });
    
    setContactsWithStatus(updatedContacts);
    await saveInvitationHistory(updatedContacts);
    
    Alert.alert(t('contacts.invitation.joined'), t('contacts.invitation.joinedDesc', { name: contact.nom }));
  };

  const getCurrentTemplateLabel = (contact: ContactWithStatus): string => {
    if (contact.tags.length === 0) return 'Par défaut';
    
    const priorityOrder: GroupeType[] = ['famille', 'amis', 'voisins', 'bricoleurs', 'custom'];
    for (const priority of priorityOrder) {
      if (contact.tags.includes(priority)) {
        const groupe = GROUPE_TYPES.find(g => g.value === priority);
        return `Version ${groupe?.label || priority}`;
      }
    }
    
    return 'Par défaut';
  };

  // Compter les contacts par lettre
  const contactsByLetter = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    // Filtrer d'abord par statut
    let baseContacts = [...contactsWithStatus];
    if (filterTab === 'nouveau') {
      baseContacts = baseContacts.filter(c => c.statut === 'nouveau');
    } else if (filterTab === 'attente') {
      baseContacts = baseContacts.filter(c => c.statut === 'invite' || c.statut === 'relance');
    } else if (filterTab === 'sur_bob') {
      baseContacts = baseContacts.filter(c => c.statut === 'sur_bob');
    }
    
    ALPHABET.forEach(letter => {
      counts[letter] = baseContacts.filter(c => 
        c.nom.toUpperCase().startsWith(letter)
      ).length;
    });
    
    return counts;
  }, [contactsWithStatus, filterTab]);

  const filteredContacts = React.useMemo(() => {
    let filtered = [...contactsWithStatus];
    
    // Filtre par statut
    if (filterTab === 'nouveau') {
      filtered = filtered.filter(c => c.statut === 'nouveau');
    } else if (filterTab === 'attente') {
      filtered = filtered.filter(c => c.statut === 'invite' || c.statut === 'relance');
    } else if (filterTab === 'sur_bob') {
      filtered = filtered.filter(c => c.statut === 'sur_bob');
    }
    
    // Filtre par lettre
    if (letterFilter) {
      filtered = filtered.filter(contact => 
        contact.nom.toUpperCase().startsWith(letterFilter)
      );
    }
    
    // Filtre par recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.nom.toLowerCase().includes(search) ||
        contact.telephone.includes(search)
      );
    }
    
    // Tri alphabétique
    return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [contactsWithStatus, filterTab, letterFilter, searchText]);

  const renderContactCard = ({ item }: { item: ContactWithStatus }) => {
    const daysSinceInvite = item.dernierContact 
      ? Math.floor((Date.now() - new Date(item.dernierContact).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <View style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <Text style={styles.contactCardName}>👤 {item.nom}</Text>
          <Text style={styles.contactCardPhone}>{item.telephone}</Text>
        </View>

        <View style={styles.statusContainer}>
          {item.statut === 'nouveau' && (
            <Text style={styles.statusNew}>🆕 Jamais invité</Text>
          )}
          
          {item.statut === 'invite' && (
            <View>
              <Text style={styles.statusWaiting}>⏳ Invité il y a {daysSinceInvite} jour(s)</Text>
            </View>
          )}
          
          {item.statut === 'relance' && (
            <View>
              <Text style={styles.statusRelance}>🔄 Relancé {item.historiqueInvitations.length} fois</Text>
              <Text style={styles.statusLastContact}>
                Dernier contact: il y a {daysSinceInvite} jour(s)
              </Text>
            </View>
          )}
          
          {item.statut === 'sur_bob' && (
            <Text style={styles.statusOnBob}>
              ✅ Sur Bob depuis {item.dateInscriptionBob ? new Date(item.dateInscriptionBob).toLocaleDateString() : 'récemment'}
            </Text>
          )}
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Tags:</Text>
          <View style={styles.tagsRow}>
            {GROUPE_TYPES.map(groupe => {
              const isActive = item.tags.includes(groupe.value);
              return (
                <TouchableOpacity
                  key={groupe.value}
                  style={[
                    styles.tagButton, 
                    isActive && styles.tagButtonActive,
                    item.statut === 'sur_bob' && styles.tagButtonDisabled
                  ]}
                  onPress={() => item.statut !== 'sur_bob' && toggleTag(item.id, groupe.value)}
                  disabled={item.statut === 'sur_bob'}
                >
                  <Text style={[
                    styles.tagButtonText, 
                    isActive && styles.tagButtonTextActive,
                    item.statut === 'sur_bob' && styles.tagButtonTextDisabled
                  ]}>
                    {isActive ? `${groupe.icon} ${groupe.label}` : `+${groupe.label}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {item.statut !== 'sur_bob' && item.tags.length > 0 && (
          <View style={styles.messagePreview}>
            <Text style={styles.messageLabel}>Message: {getCurrentTemplateLabel(item)}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {item.statut === 'nouveau' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => sendInvitation(item, 'sms')}
              >
                <Text style={styles.actionButtonText}>📱 Inviter SMS</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonWhatsApp]}
                onPress={() => sendInvitation(item, 'whatsapp')}
              >
                <Text style={styles.actionButtonText}>💬 WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}
          
          {(item.statut === 'invite' || item.statut === 'relance') && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonRelance]}
                onPress={() => sendInvitation(item, 'sms')}
              >
                <Text style={styles.actionButtonText}>🔄 Relancer</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess]}
                onPress={() => markAsJoinedBob(item)}
              >
                <Text style={styles.actionButtonText}>✅ A rejoint</Text>
              </TouchableOpacity>
            </>
          )}
          
          {item.statut === 'sur_bob' && (
            <View style={styles.bobActions}>
              <Text style={styles.bobActionsText}>
                Contact actif sur Bob
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inviter sur Bob</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Rechercher..."
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs de filtrage par statut */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, filterTab === 'tous' && styles.tabActive]}
          onPress={() => {
            setFilterTab('tous');
            setLetterFilter('');
          }}
        >
          <Text style={[styles.tabText, filterTab === 'tous' && styles.tabTextActive]}>
            Tous ({contactsWithStatus.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filterTab === 'nouveau' && styles.tabActive]}
          onPress={() => {
            setFilterTab('nouveau');
            setLetterFilter('');
          }}
        >
          <Text style={[styles.tabText, filterTab === 'nouveau' && styles.tabTextActive]}>
            À inviter ({contactsWithStatus.filter(c => c.statut === 'nouveau').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, filterTab === 'attente' && styles.tabActive]}
          onPress={() => {
            setFilterTab('attente');
            setLetterFilter('');
          }}
        >
          <Text style={[styles.tabText, filterTab === 'attente' && styles.tabTextActive]}>
            En attente ({contactsWithStatus.filter(c => c.statut === 'invite' || c.statut === 'relance').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Barre alphabétique */}
      <View style={styles.alphabetContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.alphabetRow}>
            {ALPHABET.map(letter => (
              <TouchableOpacity
                key={letter}
                onPress={() => setLetterFilter(letterFilter === letter ? '' : letter)}
                style={[
                  styles.letterButton,
                  letterFilter === letter && styles.letterButtonActive,
                  contactsByLetter[letter] === 0 && styles.letterButtonDisabled,
                ]}
                disabled={contactsByLetter[letter] === 0}
              >
                <Text style={[
                  styles.letterText,
                  letterFilter === letter && styles.letterTextActive,
                  contactsByLetter[letter] === 0 && styles.letterTextDisabled,
                ]}>
                  {letter}
                </Text>
                {contactsByLetter[letter] > 0 && (
                  <Text style={[
                    styles.letterCount,
                    letterFilter === letter && styles.letterCountActive,
                  ]}>
                    {contactsByLetter[letter]}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {letterFilter && (
        <View style={styles.letterFilterInfo}>
          <Text style={styles.letterFilterText}>
            Contacts commençant par "{letterFilter}"
          </Text>
          <TouchableOpacity onPress={() => setLetterFilter('')}>
            <Text style={styles.clearFilterText}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredContacts}
        keyExtractor={item => item.id}
        renderItem={renderContactCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {letterFilter ? '🔤' : searchText ? '🔍' : '📱'}
            </Text>
            <Text style={styles.emptyTitle}>
              {letterFilter ? `Aucun contact en "${letterFilter}"` :
               searchText ? 'Aucun contact trouvé' : 
               filterTab === 'nouveau' ? 'Aucun nouveau contact' :
               filterTab === 'attente' ? 'Aucune invitation en attente' :
               'Aucun contact'}
            </Text>
            {letterFilter && (
              <TouchableOpacity
                onPress={() => setLetterFilter('')}
                style={styles.clearFilterButton}
              >
                <Text style={styles.clearFilterButtonText}>Voir tous les contacts</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};