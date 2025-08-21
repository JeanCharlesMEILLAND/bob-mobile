// src/components/contacts/ManageContactsScreen.tsx - Version complète
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './ManageContactsScreen.styles';
import { GroupeType, GROUPE_TYPES } from '../../types/contacts.types';

const STORAGE_KEY = '@bob_contacts_tags';
const HISTORY_KEY = '@bob_invitations_history';
const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

interface ContactWithTags {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  aSurBob: boolean;
  tags: GroupeType[];
  dateInscriptionBob?: string;
  nombreEchanges?: number;
  dernierEchange?: string;
  historiqueActions?: {
    date: string;
    type: 'echange' | 'evenement' | 'service' | 'invitation';
    description: string;
  }[];
}

interface ManageContactsScreenProps {
  onClose: () => void;
  repertoire: any[];
  contactsAvecBob?: any[];
  stats: any;
  onViewProfile?: (contact: ContactWithTags) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ManageContactsScreen: React.FC<ManageContactsScreenProps> = ({
  onClose,
  repertoire,
  contactsAvecBob = [],
  stats,
  onViewProfile,
  onDeleteContact,
}) => {
  const [searchText, setSearchText] = useState('');
  const [contactsWithTags, setContactsWithTags] = useState<ContactWithTags[]>([]);
  const [letterFilter, setLetterFilter] = useState<string>('');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactWithTags | null>(null);
  const [showActionsModal, setShowActionsModal] = useState(false);

  useEffect(() => {
    loadContactsData();
  }, [repertoire, contactsAvecBob]);

  const loadContactsData = async () => {
    try {
      const [storedTags, storedHistory] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
      ]);
      
      const savedTags = storedTags ? JSON.parse(storedTags) : {};
      const savedHistory = storedHistory ? JSON.parse(storedHistory) : {};
      
      console.log('📱 ManageContacts - Chargement des données...');
      console.log('📋 Historique invitations:', savedHistory);
      
      // FILTRER uniquement les contacts qui ont Bob
      const contactsAvecBobOnly = repertoire.filter(contact => {
        // 1. Via le flag aSurBob original
        if (contact.aSurBob) {
          console.log(`✅ ${contact.nom} a Bob (flag aSurBob)`);
          return true;
        }
        
        // 2. Via la liste contactsAvecBob
        if (contactsAvecBob.some(c => c.telephone === contact.telephone)) {
          console.log(`✅ ${contact.nom} a Bob (dans contactsAvecBob)`);
          return true;
        }
        
        // 3. Via l'historique des invitations (statut 'sur_bob')
        const historyData = savedHistory[contact.id];
        if (historyData && historyData.statut === 'sur_bob') {
          console.log(`✅ ${contact.nom} a Bob (statut sur_bob dans historique)`);
          return true;
        }
        
        return false;
      });
      
      console.log(`📊 ${contactsAvecBobOnly.length} contacts avec Bob trouvés`);
      
      const merged = contactsAvecBobOnly.map(contact => {
        const historyData = savedHistory[contact.id] || {};
        
        return {
          ...contact,
          tags: savedTags[contact.id] || historyData.tags || [],
          aSurBob: true,
          dateInscriptionBob: historyData.dateInscriptionBob || new Date().toISOString(),
          nombreEchanges: historyData.nombreEchanges || 0,
          dernierEchange: historyData.dernierEchange,
          historiqueActions: historyData.historiqueActions || [],
        };
      });
      
      setContactsWithTags(merged);
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      setContactsWithTags([]);
    }
  };

  const refreshContacts = () => {
    console.log('🔄 Rafraîchissement manuel...');
    loadContactsData();
  };

  const saveContactsTags = async (updatedContacts: ContactWithTags[]) => {
    try {
      const tagsData: Record<string, GroupeType[]> = {};
      updatedContacts.forEach(contact => {
        if (contact.tags.length > 0) {
          tagsData[contact.id] = contact.tags;
        }
      });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tagsData));
    } catch (error) {
      console.error('Erreur sauvegarde tags:', error);
    }
  };

  const toggleTag = async (contactId: string, tag: GroupeType) => {
    const updatedContacts = contactsWithTags.map(contact => {
      if (contact.id === contactId) {
        const newTags = contact.tags.includes(tag)
          ? contact.tags.filter(t => t !== tag)
          : [...contact.tags, tag];
        return { ...contact, tags: newTags };
      }
      return contact;
    });
    
    setContactsWithTags(updatedContacts);
    await saveContactsTags(updatedContacts);
  };

  const handleDeleteContact = (contact: ContactWithTags) => {
    Alert.alert(
      'Retirer de mes amis Bob',
      `${contact.nom} restera sur Bob mais ne sera plus dans votre liste d'amis.\\n\\nVoulez-vous continuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              const storedHistory = await AsyncStorage.getItem(HISTORY_KEY);
              const history = storedHistory ? JSON.parse(storedHistory) : {};
              
              if (history[contact.id]) {
                history[contact.id].retiréDesMesAmis = true;
                history[contact.id].dateRetrait = new Date().toISOString();
                await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
              }
            } catch (error) {
              console.error('Erreur mise à jour historique:', error);
            }
            
            if (onDeleteContact) {
              onDeleteContact(contact.id);
            }
            setContactsWithTags(prev => prev.filter(c => c.id !== contact.id));
            setShowActionsModal(false);
            Alert.alert('✅', `${contact.nom} a été retiré de vos amis Bob`);
          }
        }
      ]
    );
  };

  const handleViewHistory = (contact: ContactWithTags) => {
    setSelectedContact(contact);
    setShowHistoryModal(true);
    setShowActionsModal(false);
  };

  const handleViewProfile = (contact: ContactWithTags) => {
    if (onViewProfile) {
      onViewProfile(contact);
    }
    setShowActionsModal(false);
  };

  const openActionsModal = (contact: ContactWithTags) => {
    setSelectedContact(contact);
    setShowActionsModal(true);
  };

  const contactsByLetter = useMemo(() => {
    const counts: { [key: string]: number } = {};
    
    ALPHABET.forEach(letter => {
      counts[letter] = contactsWithTags.filter(c => 
        c.nom.toUpperCase().startsWith(letter)
      ).length;
    });
    
    return counts;
  }, [contactsWithTags]);

  const contactsFiltered = useMemo(() => {
    let filtered = [...contactsWithTags];

    if (letterFilter) {
      filtered = filtered.filter(contact => 
        contact.nom.toUpperCase().startsWith(letterFilter)
      );
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(contact => 
        contact.nom.toLowerCase().includes(search) ||
        contact.telephone.includes(search)
      );
    }

    return filtered.sort((a, b) => a.nom.localeCompare(b.nom));
  }, [contactsWithTags, searchText, letterFilter]);

  const renderContactCard = ({ item }: { item: ContactWithTags }) => {
    const daysSinceJoined = item.dateInscriptionBob 
      ? Math.floor((Date.now() - new Date(item.dateInscriptionBob).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <View style={styles.contactCard}>
        <View style={styles.contactHeader}>
          <View style={[styles.contactAvatar, { backgroundColor: '#4CAF50' }]}>
            <Text style={styles.contactInitial}>
              {item.nom.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{item.nom}</Text>
            <Text style={styles.contactNumber}>{item.telephone}</Text>
            <View style={styles.hasBobBadge}>
              <Text style={styles.hasBobBadgeText}>
                ✅ Sur Bob {daysSinceJoined > 0 ? `depuis ${daysSinceJoined}j` : "aujourd'hui"}
              </Text>
            </View>
            {item.nombreEchanges && item.nombreEchanges > 0 && (
              <Text style={styles.exchangeCount}>
                {item.nombreEchanges} échange{item.nombreEchanges > 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <Text style={styles.tagsLabel}>Groupes :</Text>
          <View style={styles.tagsRow}>
            {GROUPE_TYPES.map(groupe => {
              const isActive = item.tags.includes(groupe.value);
              return (
                <TouchableOpacity
                  key={groupe.value}
                  style={[styles.tagButton, isActive && styles.tagButtonActive]}
                  onPress={() => toggleTag(item.id, groupe.value)}
                >
                  <Text style={[styles.tagButtonText, isActive && styles.tagButtonTextActive]}>
                    {isActive ? `${groupe.icon} ${groupe.label}` : `+${groupe.label}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => handleViewProfile(item)}
          >
            <Text style={styles.profileButtonText}>👤 Profil</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => handleViewHistory(item)}
          >
            <Text style={styles.historyButtonText}>📜 Historique</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => openActionsModal(item)}
          >
            <Text style={styles.menuButtonText}>⋮</Text>
          </TouchableOpacity>
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
        <View style={styles.headerContent}>
          <Text style={styles.title}>Mes amis Bob</Text>
          <Text style={styles.subtitle}>
            {contactsWithTags.length} ami{contactsWithTags.length > 1 ? 's' : ''} actif{contactsWithTags.length > 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity onPress={refreshContacts} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <TextInput
          placeholder="🔍 Rechercher un ami Bob..."
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

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

      <FlatList
        data={contactsFiltered}
        keyExtractor={item => item.id}
        renderItem={renderContactCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>
              {letterFilter ? '🔤' : searchText ? '🔍' : '👥'}
            </Text>
            <Text style={styles.emptyTitle}>
              {letterFilter ? `Aucun ami Bob en "${letterFilter}"` :
               searchText ? 'Aucun ami trouvé' :
               'Aucun ami sur Bob pour le moment'}
            </Text>
            <Text style={styles.emptyDescription}>
              Allez dans "Inviter" pour marquer vos contacts comme ayant rejoint Bob !
            </Text>
          </View>
        }
      />

      <Modal
        visible={showHistoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📜 Historique</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedContact && (
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.contactModalName}>{selectedContact.nom}</Text>
                <Text style={styles.contactModalInfo}>
                  Sur Bob depuis {selectedContact.dateInscriptionBob ? new Date(selectedContact.dateInscriptionBob).toLocaleDateString() : 'récemment'}
                </Text>
                
                {selectedContact.historiqueActions && selectedContact.historiqueActions.length > 0 ? (
                  selectedContact.historiqueActions.map((action, index) => (
                    <View key={index} style={styles.historyItem}>
                      <Text style={styles.historyDate}>
                        {new Date(action.date).toLocaleDateString()}
                      </Text>
                      <Text style={styles.historyType}>
                        {action.type === 'echange' ? '🔄' : 
                         action.type === 'evenement' ? '🎉' :
                         action.type === 'service' ? '🤝' : '📤'} {action.type}
                      </Text>
                      <Text style={styles.historyDescription}>
                        {action.description}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noHistory}>Aucun historique pour le moment</Text>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionModalContent}>
            {selectedContact && (
              <>
                <View style={styles.actionModalHeader}>
                  <Text style={styles.actionModalTitle}>{selectedContact.nom}</Text>
                  <TouchableOpacity onPress={() => setShowActionsModal(false)}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => handleViewProfile(selectedContact)}
                >
                  <Text style={styles.actionIcon}>👤</Text>
                  <Text style={styles.actionText}>Voir le profil</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionItem}
                  onPress={() => handleViewHistory(selectedContact)}
                >
                  <Text style={styles.actionIcon}>📜</Text>
                  <Text style={styles.actionText}>Voir l'historique</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionItem, styles.actionItemDanger]}
                  onPress={() => handleDeleteContact(selectedContact)}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                  <Text style={[styles.actionText, styles.actionTextDanger]}>
                    Retirer de mes amis
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};