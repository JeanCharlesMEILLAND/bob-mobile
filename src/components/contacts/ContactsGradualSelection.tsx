// src/components/contacts/ContactsGradualSelection.tsx - Sélection par lots
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ContactPhone {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  isAdded: boolean;      // Déjà ajouté à Bob
  isSelected: boolean;   // Sélectionné pour ajout
  frequency?: number;    // Fréquence d'appel estimée
  lastContact?: string;  // Dernière interaction
}

interface ContactsGradualSelectionProps {
  onContactsSelected: (contacts: ContactPhone[]) => void;
  onClose: () => void;
  maxSelection?: number; // Limite par session (défaut 10)
}

const STORAGE_KEY = '@bob_contacts_added';

export const ContactsGradualSelection: React.FC<ContactsGradualSelectionProps> = ({
  onContactsSelected,
  onClose,
  maxSelection = 10
}) => {
  // États principaux
  const [allContacts, setAllContacts] = useState<ContactPhone[]>([]);
  const [addedContactIds, setAddedContactIds] = useState<Set<string>>(new Set());
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États de filtres
  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'frequency' | 'recent'>('name');
  const [showOnlyNew, setShowOnlyNew] = useState(true);
  
  // Animation
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  // Charger les contacts déjà ajoutés
  useEffect(() => {
    loadAddedContacts();
    
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const loadAddedContacts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAddedContactIds(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.error('Erreur chargement contacts ajoutés:', error);
    }
  };

  const saveAddedContacts = async (contactIds: string[]) => {
    try {
      const newAddedIds = new Set([...addedContactIds, ...contactIds]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...newAddedIds]));
      setAddedContactIds(newAddedIds);
    } catch (error) {
      console.error('Erreur sauvegarde contacts:', error);
    }
  };

  // Scanner le répertoire (première fois ou refresh)
  const scanContacts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Demande permission contacts...');
      const { status } = await Contacts.requestPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Bob a besoin d\'accéder à vos contacts pour vous proposer vos proches.',
          [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Paramètres', onPress: () => {
              // Ouvrir les paramètres iOS/Android
              Alert.alert('Info', 'Allez dans Paramètres > Confidentialité > Contacts > Bob');
            }}
          ]
        );
        return;
      }

      console.log('📱 Récupération contacts...');
      const { data: rawContacts } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.Emails,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
        ],
        sort: Contacts.SortTypes.FirstName,
        pageSize: 500, // Limiter pour performance
      });

      console.log(`📊 ${rawContacts.length} contacts récupérés`);

      // Nettoyer et formater avec priorité intelligente
      const cleanedContacts: ContactPhone[] = [];
      
      for (const contact of rawContacts) {
        // Filtres de qualité
        if (!contact.phoneNumbers?.length || !contact.name?.trim()) continue;
        
        const telephone = cleanPhoneNumber(contact.phoneNumbers[0].number || '');
        if (!telephone || telephone.length < 8) continue;

        // Éviter doublons
        if (cleanedContacts.some(c => c.telephone === telephone)) continue;

        // Estimer la fréquence d'importance (heuristique simple)
        const frequency = estimateContactFrequency(contact);
        
        cleanedContacts.push({
          id: contact.id || `contact_${Date.now()}_${Math.random()}`,
          nom: contact.name.trim(),
          telephone,
          email: contact.emails?.[0]?.email?.trim(),
          isAdded: addedContactIds.has(contact.id || ''),
          isSelected: false,
          frequency,
          lastContact: estimateLastContact(contact),
        });
      }

      // Trier par importance (fréquence estimée)
      cleanedContacts.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));

      setAllContacts(cleanedContacts);
      setHasScanned(true);
      
      console.log(`✅ ${cleanedContacts.length} contacts nettoyés et triés`);
      console.log(`📊 ${cleanedContacts.filter(c => !c.isAdded).length} nouveaux à proposer`);

    } catch (err: any) {
      console.error('❌ Erreur scan contacts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Nettoyer numéro de téléphone
  const cleanPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+') && /^[67]/.test(cleaned)) {
      cleaned = '+33' + cleaned;
    }
    
    return cleaned.length >= 8 ? cleaned : '';
  };

  // Estimer fréquence contact (heuristique basée sur le nom)
  const estimateContactFrequency = (contact: any): number => {
    let score = 0;
    const name = contact.name?.toLowerCase() || '';
    
    // Famille proche (noms courts, fréquents)
    if (['papa', 'maman', 'marie', 'pierre', 'jean', 'paul', 'sophie'].some(n => name.includes(n))) {
      score += 10;
    }
    
    // Prénoms seuls = plus proche
    if (!name.includes(' ') && name.length < 15) {
      score += 5;
    }
    
    // Noms avec entreprise = moins prioritaire
    if (['sarl', 'sas', 'eurl', 'auto', 'garage', 'docteur', 'cabinet'].some(w => name.includes(w))) {
      score -= 5;
    }
    
    // Bonus si email personnel
    if (contact.emails?.[0]?.email && !contact.emails[0].email.includes('@company')) {
      score += 3;
    }
    
    return Math.max(0, score);
  };

  const estimateLastContact = (contact: any): string => {
    // Simulation - dans vraie app, utiliser les logs d'appels
    const days = Math.floor(Math.random() * 365);
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
  };

  // Filtrer et trier les contacts
  const filteredContacts = useMemo(() => {
    let filtered = [...allContacts];

    // Filtre : nouveaux seulement
    if (showOnlyNew) {
      filtered = filtered.filter(c => !c.isAdded);
    }

    // Filtre : recherche
    if (searchText.trim()) {
      const search = searchText.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.nom.toLowerCase().includes(search) ||
        c.telephone.includes(search)
      );
    }

    // Tri
    switch (sortBy) {
      case 'frequency':
        filtered.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastContact || 0).getTime() - new Date(a.lastContact || 0).getTime());
        break;
      case 'name':
      default:
        filtered.sort((a, b) => a.nom.localeCompare(b.nom));
    }

    return filtered;
  }, [allContacts, searchText, sortBy, showOnlyNew]);

  // Sélectionner/désélectionner un contact
  const toggleContact = (contactId: string) => {
    const newSelected = new Set(selectedContacts);
    
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else if (newSelected.size < maxSelection) {
      newSelected.add(contactId);
    } else {
      Alert.alert(
        'Limite atteinte',
        `Vous pouvez sélectionner au maximum ${maxSelection} contacts par session. Ajoutez-les d'abord, puis revenez pour en sélectionner d'autres.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedContacts(newSelected);
  };

  // Sélection intelligente (top contacts)
  const selectTopContacts = (count: number = 5) => {
    const topContacts = filteredContacts
      .filter(c => !c.isAdded && !selectedContacts.has(c.id))
      .slice(0, count);
    
    const newSelected = new Set(selectedContacts);
    topContacts.forEach(c => newSelected.add(c.id));
    
    if (newSelected.size > maxSelection) {
      Alert.alert('Limite atteinte', `Vous ne pouvez sélectionner que ${maxSelection} contacts maximum.`);
      return;
    }
    
    setSelectedContacts(newSelected);
  };

  // Confirmer et ajouter les contacts sélectionnés
  const confirmSelection = async () => {
    if (selectedContacts.size === 0) {
      Alert.alert('Aucune sélection', 'Sélectionnez au moins un contact à ajouter.');
      return;
    }

    const contactsToAdd = allContacts.filter(c => selectedContacts.has(c.id));
    
    Alert.alert(
      'Confirmer l\'ajout',
      `Ajouter ${contactsToAdd.length} contact(s) à votre réseau Bob ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Ajouter', 
          onPress: async () => {
            // Sauvegarder comme ajoutés
            await saveAddedContacts(contactsToAdd.map(c => c.id));
            
            // Mettre à jour l'état
            setAllContacts(prev => prev.map(c => 
              selectedContacts.has(c.id) ? { ...c, isAdded: true } : c
            ));
            
            // Callback parent
            onContactsSelected(contactsToAdd);
            
            // Réinitialiser sélection
            setSelectedContacts(new Set());
            
            Alert.alert(
              'Contacts ajoutés !',
              `${contactsToAdd.length} contact(s) ajouté(s) avec succès. Vous pouvez en sélectionner d'autres si besoin.`,
              [{ text: 'Super !' }]
            );
          }
        }
      ]
    );
  };

  // Stats rapides
  const stats = {
    total: allContacts.length,
    nouveaux: allContacts.filter(c => !c.isAdded).length,
    ajoutés: allContacts.filter(c => c.isAdded).length,
    sélectionnés: selectedContacts.size,
  };

  // Rendu d'un contact
  const renderContact = ({ item }: { item: ContactPhone }) => {
    const isSelected = selectedContacts.has(item.id);
    const canSelect = !item.isAdded && (isSelected || selectedContacts.size < maxSelection);
    
    return (
      <TouchableOpacity
        onPress={() => canSelect && toggleContact(item.id)}
        disabled={item.isAdded}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          backgroundColor: isSelected ? '#E3F2FD' : item.isAdded ? '#F5F5F5' : 'white',
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
          opacity: item.isAdded ? 0.6 : 1,
        }}
      >
        {/* Checkbox ou statut */}
        <View style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: item.isAdded ? '#4CAF50' : isSelected ? '#2196F3' : '#CCCCCC',
          backgroundColor: item.isAdded ? '#4CAF50' : isSelected ? '#2196F3' : 'transparent',
          marginRight: 12,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {item.isAdded ? (
            <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
          ) : isSelected ? (
            <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
          ) : null}
        </View>

        {/* Avatar */}
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: item.isAdded ? '#4CAF50' : (item.frequency || 0) > 5 ? '#FF9800' : '#2196F3',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            {item.nom.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Infos */}
        <View style={{ flex: 1 }}>
          <Text style={{ 
            fontSize: 16, 
            fontWeight: 'bold', 
            color: item.isAdded ? '#666' : '#333' 
          }}>
            {item.nom}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 2 }}>
            {item.telephone}
          </Text>
          {(item.frequency || 0) > 5 && (
            <Text style={{ fontSize: 12, color: '#FF9800', marginTop: 2 }}>
              🔥 Contact fréquent
            </Text>
          )}
        </View>

        {/* Statut */}
        <View style={{ alignItems: 'flex-end' }}>
          {item.isAdded ? (
            <View style={{ 
              backgroundColor: '#4CAF50', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 12 
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                AJOUTÉ
              </Text>
            </View>
          ) : (item.frequency || 0) > 5 ? (
            <View style={{ 
              backgroundColor: '#FF9800', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 12 
            }}>
              <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                PRIORITÉ
              </Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={{ 
      flex: 1, 
      backgroundColor: '#F5F5F5',
      opacity: fadeAnim,
      transform: [{ scale: scaleAnim }]
    }}>
      {/* Header avec stats */}
      <View style={{ 
        backgroundColor: '#2196F3', 
        paddingTop: 50, 
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              Ajouter mes contacts
            </Text>
            <Text style={{ color: 'white', fontSize: 16, opacity: 0.9 }}>
              Sélectionnez jusqu'à {maxSelection} contacts par session
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
            <Text style={{ color: 'white', fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
              {stats.total}
            </Text>
            <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
              Total
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
              {stats.nouveaux}
            </Text>
            <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
              Nouveaux
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
              {stats.sélectionnés}
            </Text>
            <Text style={{ color: 'white', fontSize: 12, opacity: 0.9 }}>
              Sélectionnés
            </Text>
          </View>
        </View>
      </View>

      {!hasScanned ? (
        /* Premier scan */
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>📱</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
            Accéder à vos contacts
          </Text>
          <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 32 }}>
            Bob vous propose d'ajouter vos proches progressivement pour créer votre réseau d'entraide.
          </Text>
          
          <TouchableOpacity
            onPress={scanContacts}
            disabled={isLoading}
            style={{
              backgroundColor: '#2196F3',
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderRadius: 25,
              elevation: 4,
              minWidth: 200,
              alignItems: 'center',
            }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                📱 Scanner mes contacts
              </Text>
            )}
          </TouchableOpacity>
          
          {error && (
            <View style={{ 
              backgroundColor: '#FFEBEE', 
              padding: 16, 
              borderRadius: 8, 
              marginTop: 20,
              borderLeftWidth: 4,
              borderLeftColor: '#F44336',
            }}>
              <Text style={{ color: '#F44336', fontWeight: 'bold' }}>
                ❌ {error}
              </Text>
            </View>
          )}
        </View>
      ) : (
        /* Interface de sélection */
        <>
          {/* Contrôles de filtrage */}
          <View style={{ backgroundColor: 'white', margin: 16, borderRadius: 12, padding: 16, elevation: 2 }}>
            {/* Recherche */}
            <TextInput
              placeholder="🔍 Rechercher un contact..."
              value={searchText}
              onChangeText={setSearchText}
              style={{
                borderWidth: 1,
                borderColor: '#E0E0E0',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 16,
                marginBottom: 12,
              }}
            />
            
            {/* Filtres et tri */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setShowOnlyNew(!showOnlyNew)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: showOnlyNew ? '#E3F2FD' : '#F5F5F5',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>
                    {showOnlyNew ? '✓' : '○'} Nouveaux uniquement
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#666', marginRight: 8 }}>Tri :</Text>
                {['name', 'frequency', 'recent'].map(sort => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => setSortBy(sort as any)}
                    style={{
                      backgroundColor: sortBy === sort ? '#2196F3' : '#F5F5F5',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 4,
                      marginHorizontal: 2,
                    }}
                  >
                    <Text style={{
                      color: sortBy === sort ? 'white' : '#666',
                      fontSize: 10,
                      fontWeight: 'bold',
                    }}>
                      {sort === 'name' ? 'A-Z' : sort === 'frequency' ? '🔥' : '📅'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Actions rapides */}
          <View style={{ 
            flexDirection: 'row', 
            paddingHorizontal: 16, 
            marginBottom: 16, 
            justifyContent: 'space-between' 
          }}>
            <TouchableOpacity
              onPress={() => selectTopContacts(3)}
              style={{
                backgroundColor: '#FF9800',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                ⚡ Top 3
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => selectTopContacts(5)}
              style={{
                backgroundColor: '#4CAF50',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 12 }}>
                🎯 Top 5
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setSelectedContacts(new Set())}
              disabled={selectedContacts.size === 0}
              style={{
                backgroundColor: selectedContacts.size > 0 ? '#F44336' : '#E0E0E0',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ 
                color: selectedContacts.size > 0 ? 'white' : '#999', 
                fontWeight: 'bold', 
                fontSize: 12 
              }}>
                🗑️ Vider
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste des contacts */}
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={(item, index) => `${item.id}_${index}_${item.nom || 'unknown'}_${item.telephone || 'no-phone'}`}
            style={{ flex: 1, marginHorizontal: 16 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ padding: 32, alignItems: 'center' }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>
                  {showOnlyNew ? '✅' : '🔍'}
                </Text>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
                  {showOnlyNew ? 'Tous vos contacts ont été ajoutés !' : 'Aucun contact trouvé'}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8 }}>
                  {showOnlyNew ? 'Félicitations ! Revenez plus tard pour ajouter de nouveaux contacts.' : 'Essayez de modifier votre recherche'}
                </Text>
              </View>
            }
          />

          {/* Bouton d'action flottant */}
          {selectedContacts.size > 0 && (
            <View style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
              backgroundColor: '#4CAF50',
              borderRadius: 25,
              elevation: 8,
            }}>
              <TouchableOpacity
                onPress={confirmSelection}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                }}
              >
                <Text style={{ color: 'white', fontSize: 20, marginRight: 8 }}>✓</Text>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                  Ajouter {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
};