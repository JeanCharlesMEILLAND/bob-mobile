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
  Clipboard,
  Modal,
  ActivityIndicator,
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
import { useNotifications } from '../common/SmartNotifications';

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
  contactsBruts?: any[]; // 🔧 Ajout pour vérification de doublons
  onClose: () => void;
  onSaveGroupAssignments?: (assignments: { contactId: string; groupes: GroupeType[] }[]) => void;
  onInvitationSent?: () => Promise<void>; // 🔧 Callback pour mise à jour des stats
  sendInvitationFromHook?: (contactId: string, method: 'sms' | 'whatsapp') => Promise<void>; // 🔧 Fonction du hook principal
  onRemoveContact?: (contactId: string) => Promise<void>; // 🔧 Fonction pour supprimer un contact du répertoire
}

export const InvitationInterface: React.FC<InvitationInterfaceProps> = ({
  contactsSansBob,
  contactsAvecBob = [],
  contactsBruts = [], // 🔧 Ajout pour vérification de doublons
  onClose,
  onSaveGroupAssignments,
  onInvitationSent,
  sendInvitationFromHook,
  onRemoveContact,
}) => {
  const { t, i18n } = useTranslation();
  const notifications = useNotifications();
  const [contactsWithStatus, setContactsWithStatus] = useState<ContactWithStatus[]>([]);
  const [searchText, setSearchText] = useState('');
  const [letterFilter, setLetterFilter] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'tous' | 'nouveau' | 'attente' | 'sur_bob'>('tous');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // 🔧 Fonction de normalisation des numéros (même que ContactsSelectionInterface)
  const normalizePhone = (phone: string) => {
    return phone?.replace(/[\s\-\(\)\.]/g, '') || '';
  };

  // 🔧 SUPPRIMÉ: checkIfInRepertoire - logique erronée pour l'invitation sur Bob

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
    console.log('🚀 DÉBUT sendInvitation:', { contact: contact.nom, method });
    
    // 🔧 NOUVEAU: Utiliser la fonction du hook principal si disponible
    if (sendInvitationFromHook) {
      try {
        console.log('🎯 Utilisation de sendInvitation du hook principal');
        await sendInvitationFromHook(contact.id, method);
        
        // Mettre à jour l'état local aussi
        const updatedContacts = contactsWithStatus.map(c => {
          if (c.id === contact.id) {
            return {
              ...c,
              statut: 'invite' as ContactStatus,
              historiqueInvitations: [
                ...c.historiqueInvitations,
                {
                  date: new Date().toISOString(),
                  methode: method,
                  message: getMessageForContact(contact, method, ''),
                }
              ],
              dernierContact: new Date().toISOString(),
            };
          }
          return c;
        });
        
        setContactsWithStatus(updatedContacts);
        await saveInvitationHistory(updatedContacts);
        
        // Notifier le parent pour mise à jour des stats
        if (onInvitationSent) {
          await onInvitationSent();
        }
        
        console.log('✅ Invitation envoyée via hook principal');
        return;
      } catch (error) {
        console.error('❌ Erreur invitation via hook principal:', error);
        // Fallback vers l'ancien processus si échec
      }
    }
    
    // 🔧 FALLBACK: Ancien processus si pas de fonction du hook
    console.log('🔄 Utilisation du processus d\'invitation custom');
    proceedWithInvitation();

    async function proceedWithInvitation() {
      // Afficher le modal de chargement
      setIsLoading(true);
      setLoadingMessage(
        method === 'sms' 
          ? `📱 Préparation du SMS pour ${contact.nom}...` 
          : `💬 Préparation de WhatsApp pour ${contact.nom}...`
      );
    
    try {
      // Créer l'invitation dans Strapi d'abord
      const token = await authService.getValidToken();
      if (!token) {
        setIsLoading(false);
        notifications.error(
          t('common.error'), 
          t('contacts.invitation.mustBeConnected'),
          { category: 'auth_error', duration: 5000 }
        );
        return;
      }

      // Étape 1: Création invitation
      setLoadingMessage(`🔗 Création de l'invitation pour ${contact.nom}...`);
      console.log('📤 Création invitation Strapi pour:', contact.nom);
      
      const invitation = await invitationsService.createInvitation({
        telephone: contact.telephone,
        nom: contact.nom,
        type: method,
      }, token);
      
      console.log('✅ Invitation créée avec code:', invitation.codeParrainage);
      console.log('📋 Objet invitation complet:', JSON.stringify(invitation, null, 2));
      
      // Étape 2: Génération du message
      setLoadingMessage(`✍️ Préparation du message d'invitation...`);
      const message = getMessageForContact(contact, method, invitation.codeParrainage);
      
      let url = '';
      if (method === 'sms') {
        url = `sms:${contact.telephone}?body=${encodeURIComponent(message)}`;
      } else {
        // Utiliser la fonction de formatage dédiée WhatsApp
        const phoneNumber = formatPhoneForWhatsApp(contact.telephone);
        
        if (!phoneNumber) {
          setIsLoading(false);
          notifications.error(
            'Erreur', 
            'Numéro de téléphone invalide pour WhatsApp',
            { category: 'phone_error', duration: 5000 }
          );
          return;
        }
        
        // Essayer différents formats d'URL WhatsApp
        const whatsappUrls = [
          `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`,
          `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
          `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`
        ];
        
        url = whatsappUrls[0]; // Commencer par le premier format
        console.log('📱 URLs WhatsApp à tester:', whatsappUrls);
      }
      
      console.log('📱 Tentative d\'ouverture URL:', url);
      
      if (method === 'whatsapp') {
        // Étape 3: Préparation WhatsApp
        setLoadingMessage(`💬 Ouverture de WhatsApp...`);
        
        // Pour WhatsApp, utiliser le format qui marche (wa.me accepte le +)
        const cleanPhone = contact.telephone.startsWith('+') ? contact.telephone : '+' + contact.telephone;
        const whatsappUrls = [
          `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, // Le plus universel - MARCHE !
          `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}` // API WhatsApp
        ];
        
        let whatsappOpened = false;
        for (const whatsappUrl of whatsappUrls) {
          console.log('📱 Test WhatsApp URL:', whatsappUrl);
          const canOpen = await Linking.canOpenURL(whatsappUrl);
          console.log('📱 URL supportée:', canOpen);
          
          if (canOpen) {
            await Linking.openURL(whatsappUrl);
            console.log('✅ WhatsApp ouvert avec succès');
            whatsappOpened = true;
            setLoadingMessage(`✅ WhatsApp ouvert !`);
            break;
          }
        }
        
        if (!whatsappOpened) {
          setIsLoading(false);
          console.error('❌ Aucun format WhatsApp supporté');
          Alert.alert(
            'WhatsApp - Contact non trouvé', 
            `Le numéro ${contact.telephone} n'est pas dans vos contacts WhatsApp.\n\nVoulez-vous :\n• Copier le message d'invitation pour l'envoyer manuellement\n• Ou utiliser SMS à la place ?`,
            [
              { text: 'Copier le message', onPress: () => {
                // Copier le message dans le presse-papiers
                Clipboard.setString(message);
                console.log('📋 Message copié:', message);
                Alert.alert('Message copié !', 'Le message d\'invitation a été copié. Vous pouvez maintenant l\'envoyer via WhatsApp manuellement.');
              }},
              { text: 'Envoyer par SMS', onPress: () => sendInvitation(contact, 'sms') },
              { text: 'Annuler', style: 'cancel' }
            ]
          );
          return;
        }
      } else {
        // Étape 3: Ouverture de l'application
        setLoadingMessage(method === 'sms' ? `📱 Ouverture de l'application SMS...` : `💬 Ouverture de WhatsApp...`);
        
        const canOpen = await Linking.canOpenURL(url);
        console.log('📱 URL supportée:', canOpen);
        
        if (canOpen) {
          await Linking.openURL(url);
          console.log('✅ URL ouverte avec succès');
          setLoadingMessage(method === 'sms' ? `✅ SMS ouvert !` : `✅ WhatsApp ouvert !`);
          
          // Petit délai pour laisser l'app s'ouvrir, puis continuer avec le traitement
          await new Promise(resolve => setTimeout(resolve, 1500));
        } else {
          setIsLoading(false);
          console.error('❌ URL non supportée:', url);
          notifications.error(
            'Erreur', 
            method === 'sms' ? 'Impossible d\'ouvrir l\'application SMS' : 'Impossible d\'ouvrir WhatsApp',
            { category: 'app_open_error', duration: 5000 }
          );
          return;
        }
      }
      
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
      
      // 🔧 Notifier le parent pour mise à jour des stats
      if (onInvitationSent) {
        try {
          // Petit délai pour s'assurer que le cache AsyncStorage est écrit
          await new Promise(resolve => setTimeout(resolve, 100));
          await onInvitationSent();
          console.log('✅ Stats du dashboard mises à jour après invitation');
        } catch (error) {
          console.warn('⚠️ Erreur mise à jour stats dashboard:', error);
        }
      }
      
      // Fermer le modal de chargement après le processus complet
      setIsLoading(false);
      
      // Notification au lieu de modal
      notifications.success(
        'Invitation envoyée !', 
        `L'invitation ${method.toUpperCase()} a été envoyée à ${contact.nom}`,
        { category: 'invitation_sent', duration: 4000 }
      );
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Erreur envoi invitation:', error);
      notifications.error(
        'Erreur d\'invitation', 
        `Impossible d'envoyer l'invitation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        { category: 'invitation_error', duration: 6000 }
      );
    }
    } // 🔧 Fin de proceedWithInvitation
  }; // 🔧 Fin de sendInvitation

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

  const removeContact = async (contact: ContactWithStatus) => {
    // 🎨 NOUVEAU: Utiliser notifications.confirm au lieu d'Alert.alert
    notifications.confirm(
      'Supprimer le contact',
      `Voulez-vous vraiment supprimer ${contact.nom} de votre répertoire Bob ?`,
      async () => {
        // Action de confirmation (Supprimer)
        if (onRemoveContact) {
          try {
            await onRemoveContact(contact.id);
            // Mettre à jour la liste locale
            const updatedContacts = contactsWithStatus.filter(c => c.id !== contact.id);
            setContactsWithStatus(updatedContacts);
            
            // Les stats seront mises à jour par handleRemoveContactWithStatsUpdate
            console.log('✅ Contact supprimé de l\'interface, stats en cours de mise à jour...');
            
            // ✅ Notification gérée par useContactsActions.ts - éviter le doublon
          } catch (error) {
            console.error('❌ Erreur suppression contact:', error);
            notifications.error('Erreur', 'Impossible de supprimer le contact.');
          }
        }
      },
      () => {
        // Action d'annulation (optionnelle)
        console.log('Suppression annulée');
      },
      {
        category: 'contact_deletion'
      }
    );
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
          <View style={{ flex: 1 }}>
            <Text style={styles.contactCardName}>👤 {item.nom}</Text>
            <Text style={styles.contactCardPhone}>{item.telephone}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => removeContact(item)}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
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
        keyExtractor={(item, index) => `${item.id}_${index}_${item.nom || 'unknown'}_${item.telephone || 'no-phone'}`}
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

      {/* Modal de chargement */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}} // Empêcher la fermeture manuelle
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.modalTitle}>Envoi d'invitation</Text>
            <Text style={styles.modalMessage}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};