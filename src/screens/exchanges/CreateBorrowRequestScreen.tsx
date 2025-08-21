// src/screens/exchanges/CreateBorrowRequestScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './CreateBorrowRequestScreen.styles';

interface Contact {
  id: string;
  nom: string;
  telephone: string;
  hasBob: boolean;
  groupe?: string;
}

interface Group {
  id: string;
  nom: string;
  icon: string;
  membersCount: number;
}

type DurationOption = '1_day' | '3_days' | '1_week' | '2_weeks' | '1_month' | 'custom';
type RecipientType = 'friend' | 'group' | 'all';

export const CreateBorrowRequestScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>('1_week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  
  // Recipients
  const [recipientType, setRecipientType] = useState<RecipientType>('all');
  const [selectedFriend, setSelectedFriend] = useState<Contact | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data
  const mockFriends: Contact[] = [
    { id: '1', nom: 'Marie Dupont', telephone: '+33123456789', hasBob: true, groupe: 'famille' },
    { id: '2', nom: 'Thomas Laurent', telephone: '+33987654321', hasBob: true, groupe: 'bricoleurs' },
    { id: '3', nom: 'Sophie Martin', telephone: '+33555666777', hasBob: true, groupe: 'voisins' }
  ];

  const mockGroups: Group[] = [
    { id: 'famille', nom: 'Famille', icon: '👨‍👩‍👧', membersCount: 8 },
    { id: 'amis', nom: 'Amis', icon: '😄', membersCount: 12 },
    { id: 'voisins', nom: 'Voisins', icon: '🏠', membersCount: 6 },
    { id: 'bricoleurs', nom: 'Bricoleurs', icon: '🔧', membersCount: 4 }
  ];

  const durationOptions = [
    { key: '1_day' as DurationOption, label: '1 jour', icon: '📅' },
    { key: '3_days' as DurationOption, label: '3 jours', icon: '📅' },
    { key: '1_week' as DurationOption, label: '1 semaine', icon: '📅' },
    { key: '2_weeks' as DurationOption, label: '2 semaines', icon: '📅' },
    { key: '1_month' as DurationOption, label: '1 mois', icon: '📅' },
    { key: 'custom' as DurationOption, label: 'Personnalisé', icon: '⚙️' }
  ];

  const handleAddPhoto = () => {
    // TODO: Implémenter sélection photo
    Alert.alert('Info', 'Sélection photo à implémenter');
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (recipientType === 'friend' && !selectedFriend) {
      Alert.alert('Erreur', 'Veuillez sélectionner un ami');
      return;
    }

    if (recipientType === 'group' && !selectedGroup) {
      Alert.alert('Erreur', 'Veuillez sélectionner un groupe');
      return;
    }

    if (selectedDuration === 'custom' && (!customStartDate || !customEndDate)) {
      Alert.alert('Erreur', 'Veuillez préciser les dates pour la durée personnalisée');
      return;
    }

    setIsSubmitting(true);
    try {
      const borrowRequest = {
        type: 'emprunt',
        titre: title,
        description,
        photos,
        duree: selectedDuration,
        dateDebut: selectedDuration === 'custom' ? customStartDate : undefined,
        dateFin: selectedDuration === 'custom' ? customEndDate : undefined,
        destinataires: getRecipients(),
        createur: user?.id
      };

      console.log('📤 Création demande emprunt:', borrowRequest);
      
      // TODO: Appel API pour créer la demande
      // TODO: Envoi notifications/SMS aux destinataires
      
      Alert.alert(
        'Demande envoyée !', 
        getSuccessMessage(),
        [
          { text: 'OK', onPress: () => {
            // TODO: Navigation retour
          }}
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRecipients = () => {
    switch (recipientType) {
      case 'friend':
        return [selectedFriend?.id];
      case 'group':
        return mockFriends.filter(f => f.groupe === selectedGroup?.id).map(f => f.id);
      case 'all':
        return mockFriends.filter(f => f.hasBob).map(f => f.id);
      default:
        return [];
    }
  };

  const getSuccessMessage = () => {
    switch (recipientType) {
      case 'friend':
        return `${selectedFriend?.nom} recevra une notification de votre demande.`;
      case 'group':
        return `Les ${selectedGroup?.membersCount} membres du groupe "${selectedGroup?.nom}" recevront une notification.`;
      case 'all':
        return `Vos ${mockFriends.filter(f => f.hasBob).length} contacts avec Bob recevront une notification.`;
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Demander un emprunt" />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Que cherchez-vous ?</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Titre de l'objet *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Perceuse, Tondeuse, Table de jardin..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description détaillée *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez précisément l'objet recherché, les caractéristiques souhaitées..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.characterCount}>{description.length}/500</Text>
          </View>

          {/* Photos */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Photos (optionnel)</Text>
            <Text style={styles.inputHint}>Ajoutez des photos pour illustrer votre demande</Text>
            
            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photoPreview} />
                  <TouchableOpacity 
                    style={styles.photoRemove}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Text style={styles.photoRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {photos.length < 3 && (
                <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
                  <Text style={styles.addPhotoText}>📷</Text>
                  <Text style={styles.addPhotoLabel}>Ajouter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pour quelle durée ?</Text>
          
          <View style={styles.durationGrid}>
            {durationOptions.map(option => {
              const isSelected = selectedDuration === option.key;
              
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.durationOption, isSelected && styles.durationOptionSelected]}
                  onPress={() => setSelectedDuration(option.key)}
                >
                  <Text style={styles.durationIcon}>{option.icon}</Text>
                  <Text style={[styles.durationLabel, isSelected && styles.durationLabelSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Duration */}
          {selectedDuration === 'custom' && (
            <View style={styles.customDurationContainer}>
              <View style={styles.dateInputsRow}>
                <View style={styles.dateInputGroup}>
                  <Text style={styles.inputLabel}>Du</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="JJ/MM/AAAA"
                    value={customStartDate}
                    onChangeText={setCustomStartDate}
                  />
                </View>
                
                <View style={styles.dateInputGroup}>
                  <Text style={styles.inputLabel}>Au</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="JJ/MM/AAAA"
                    value={customEndDate}
                    onChangeText={setCustomEndDate}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Recipients Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qui peut vous aider ?</Text>
          
          <View style={styles.recipientTypes}>
            <TouchableOpacity
              style={[styles.recipientType, recipientType === 'all' && styles.recipientTypeSelected]}
              onPress={() => setRecipientType('all')}
            >
              <Text style={styles.recipientIcon}>🌍</Text>
              <Text style={[styles.recipientLabel, recipientType === 'all' && styles.recipientLabelSelected]}>
                Tous mes contacts
              </Text>
              <Text style={styles.recipientCount}>
                {mockFriends.filter(f => f.hasBob).length} contact{mockFriends.filter(f => f.hasBob).length > 1 ? 's' : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recipientType, recipientType === 'group' && styles.recipientTypeSelected]}
              onPress={() => setRecipientType('group')}
            >
              <Text style={styles.recipientIcon}>👥</Text>
              <Text style={[styles.recipientLabel, recipientType === 'group' && styles.recipientLabelSelected]}>
                Un groupe spécifique
              </Text>
              <Text style={styles.recipientCount}>4 groupes disponibles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.recipientType, recipientType === 'friend' && styles.recipientTypeSelected]}
              onPress={() => setRecipientType('friend')}
            >
              <Text style={styles.recipientIcon}>👤</Text>
              <Text style={[styles.recipientLabel, recipientType === 'friend' && styles.recipientLabelSelected]}>
                Un ami en particulier
              </Text>
              <Text style={styles.recipientCount}>Sélection ciblée</Text>
            </TouchableOpacity>
          </View>

          {/* Group Selection */}
          {recipientType === 'group' && (
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionTitle}>Choisir un groupe :</Text>
              <View style={styles.groupsList}>
                {mockGroups.map(group => {
                  const isSelected = selectedGroup?.id === group.id;
                  
                  return (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.groupItem, isSelected && styles.groupItemSelected]}
                      onPress={() => setSelectedGroup(group)}
                    >
                      <Text style={styles.groupIcon}>{group.icon}</Text>
                      <View style={styles.groupInfo}>
                        <Text style={[styles.groupName, isSelected && styles.groupNameSelected]}>
                          {group.nom}
                        </Text>
                        <Text style={styles.groupMembers}>
                          {group.membersCount} membre{group.membersCount > 1 ? 's' : ''}
                        </Text>
                      </View>
                      {isSelected && (
                        <Text style={styles.selectedIndicator}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Friend Selection */}
          {recipientType === 'friend' && (
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionTitle}>Choisir un ami :</Text>
              <View style={styles.friendsList}>
                {mockFriends.filter(f => f.hasBob).map(friend => {
                  const isSelected = selectedFriend?.id === friend.id;
                  
                  return (
                    <TouchableOpacity
                      key={friend.id}
                      style={[styles.friendItem, isSelected && styles.friendItemSelected]}
                      onPress={() => setSelectedFriend(friend)}
                    >
                      <View style={styles.friendAvatar}>
                        <Text style={styles.friendAvatarText}>
                          {friend.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.friendInfo}>
                        <Text style={[styles.friendName, isSelected && styles.friendNameSelected]}>
                          {friend.nom}
                        </Text>
                        <Text style={styles.friendGroup}>
                          Groupe: {mockGroups.find(g => g.id === friend.groupe)?.nom || 'Aucun'}
                        </Text>
                      </View>
                      {isSelected && (
                        <Text style={styles.selectedIndicator}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="📤 Envoyer la demande"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!title.trim() || !description.trim()}
            style={styles.submitButton}
          />
          
          <Text style={styles.submitNote}>
            {getSuccessMessage()}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};