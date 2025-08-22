// src/screens/events/CreateEventScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { styles } from './CreateEventScreen.styles';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebStyles } from '../../styles/web';
import { invitationsService } from '../../services/invitations.service';
import { authService } from '../../services/auth.service';
import { eventsService } from '../../services/events.service';

interface EventNeed {
  id: string;
  type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
  titre: string;
  description: string;
  quantite?: number;
  maxPersonnes?: number;
  timing?: 'avant' | 'pendant' | 'apres';
  isCreatorPositioned?: boolean;
}

interface Contact {
  id: string;
  nom: string;
  hasBob: boolean;
  groupe?: string;
}

interface Group {
  id: string;
  nom: string;
  icon: string;
  membersCount: number;
}

type TargetType = 'groups' | 'contacts' | 'all';

export const CreateEventScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  // Event basic info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [adresse, setAdresse] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [bobizRecompense, setBobizRecompense] = useState('20');
  
  // Event needs
  const [needs, setNeeds] = useState<EventNeed[]>([]);
  const [showAddNeed, setShowAddNeed] = useState(false);
  
  // Targeting
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetingPreview, setTargetingPreview] = useState<{
    totalContacts: number;
    contacts: Array<{
      nom: string;
      telephone: string;
      source: string;
      groupeOrigine?: string;
    }>;
    groupesSummary?: Record<string, number>;
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Mock data
  const mockGroups: Group[] = [
    { id: 'famille', nom: 'Famille', icon: '👨‍👩‍👧', membersCount: 8 },
    { id: 'amis', nom: 'Amis', icon: '😄', membersCount: 12 },
    { id: 'voisins', nom: 'Voisins', icon: '🏠', membersCount: 6 },
    { id: 'bricoleurs', nom: 'Bricoleurs', icon: '🔧', membersCount: 4 }
  ];

  const mockContacts: Contact[] = [
    { id: '1', nom: 'Marie Dupont', hasBob: true, groupe: 'famille' },
    { id: '2', nom: 'Thomas Laurent', hasBob: true, groupe: 'bricoleurs' },
    { id: '3', nom: 'Sophie Martin', hasBob: true, groupe: 'voisins' }
  ];

  const needTypes = [
    { 
      key: 'objet' as const, 
      title: 'Objet simple', 
      description: 'Un objet à apporter',
      icon: '📦',
      example: 'Table pliante x3, Chaises x6'
    },
    { 
      key: 'service_individuel' as const, 
      title: 'Service individuel', 
      description: 'Une personne fait quelque chose',
      icon: '👤',
      example: 'Apporter boissons, Prendre photos'
    },
    { 
      key: 'service_collectif' as const, 
      title: 'Service collectif', 
      description: 'Plusieurs personnes collaborent',
      icon: '👥',
      example: 'Aide installation - 4 personnes max'
    },
    { 
      key: 'service_timing' as const, 
      title: 'Service avec timing', 
      description: 'Action à un moment précis',
      icon: '⏰',
      example: 'Installation avant événement'
    }
  ];

  const addNeed = (type: EventNeed['type']) => {
    const newNeed: EventNeed = {
      id: Date.now().toString(),
      type,
      titre: '',
      description: '',
      quantite: type === 'objet' ? 1 : undefined,
      maxPersonnes: type === 'service_collectif' ? 2 : undefined,
      timing: type === 'service_timing' ? 'avant' : undefined
    };
    
    setNeeds(prev => [...prev, newNeed]);
    setShowAddNeed(false);
  };

  const updateNeed = (needId: string, updates: Partial<EventNeed>) => {
    setNeeds(prev => prev.map(need => 
      need.id === needId ? { ...need, ...updates } : need
    ));
  };

  const removeNeed = (needId: string) => {
    setNeeds(prev => prev.filter(need => need.id !== needId));
  };

  const toggleCreatorPosition = (needId: string) => {
    updateNeed(needId, { 
      isCreatorPositioned: !needs.find(n => n.id === needId)?.isCreatorPositioned 
    });
  };

  const updateTargetingPreview = async () => {
    const token = await authService.getValidToken();
    if (!token) return;
    
    const targeting = {
      type: targetType,
      groupes: targetType === 'groups' ? selectedGroups : [],
      contacts: targetType === 'contacts' ? selectedContacts : []
    };

    const validation = invitationsService.validateTargeting(targeting);
    if (!validation.isValid) {
      setTargetingPreview(null);
      return;
    }

    setIsLoadingPreview(true);
    try {
      const preview = await invitationsService.previewTargeting(targeting, token);
      setTargetingPreview(preview);
    } catch (error) {
      console.error('❌ Erreur prévisualisation ciblage:', error);
      setTargetingPreview(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Mettre à jour la prévisualisation quand le ciblage change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateTargetingPreview();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [targetType, selectedGroups, selectedContacts]);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !dateDebut) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (needs.length === 0) {
      Alert.alert('Erreur', 'Ajoutez au moins un besoin pour votre événement');
      return;
    }

    // Valider le ciblage
    const targeting = {
      type: targetType,
      groupes: targetType === 'groups' ? selectedGroups : [],
      contacts: targetType === 'contacts' ? selectedContacts : []
    };

    const validation = invitationsService.validateTargeting(targeting);
    if (!validation.isValid) {
      Alert.alert('Erreur', validation.errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    try {
      const eventData = {
        titre: title,
        description,
        dateDebut,
        dateFin,
        adresse,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        bobizRecompense: parseInt(bobizRecompense),
        statut: 'planifie',
        createur: user?.id,
        besoins: needs,
        ciblage: targeting
      };

      console.log('🎉 Création événement BOB Collectif:', eventData);
      
      // 1. Créer l'événement via l'API
      const token = await authService.getValidToken();
      if (!token) {
        throw new Error('Token d\'authentification requis');
      }
      
      const newEvent = await eventsService.createEvent(eventData, token);
      
      // 2. Prévisualiser qui recevra les invitations
      try {
        const token = await authService.getValidToken();
        if (!token) {
          throw new Error('Token d\'authentification requis');
        }
        
        const preview = await invitationsService.previewTargeting(targeting, token);
        console.log('📋 Prévisualisation ciblage:', preview);
        
        // 3. Envoyer les invitations
        const invitationResult = await invitationsService.sendEventInvitations(
          newEvent.id,
          targeting,
          token
        );
        
        console.log('📤 Résultat invitations:', invitationResult);
        
        const successMessage = `Événement créé !\n\n` +
          `✅ ${invitationResult.success} invitation${invitationResult.success > 1 ? 's' : ''} envoyée${invitationResult.success > 1 ? 's' : ''}` +
          (invitationResult.failed > 0 ? `\n❌ ${invitationResult.failed} échec${invitationResult.failed > 1 ? 's' : ''}` : '') +
          `\n\nUn chat de groupe sera créé dès la première participation.`;
        
        Alert.alert(
          'BOB Collectif créé !',
          successMessage,
          [{ text: 'OK', onPress: () => {
            // TODO: Navigation vers EventDetailScreen avec newEvent.id
            console.log('📱 Navigation vers événement:', newEvent.id);
          }}]
        );
      } catch (previewError) {
        console.error('❌ Erreur prévisualisation/envoi:', previewError);
        
        // Fallback : créer l'événement sans invitations pour l'instant
        Alert.alert(
          'BOB Collectif créé !', 
          `Votre BOB Collectif "${newEvent.titre}" a été créé avec succès ! Les invitations seront envoyées prochainement.`,
          [{ text: 'OK', onPress: () => {
            console.log('📱 Navigation vers événement créé:', newEvent.id);
          }}]
        );
      }
      
    } catch (error) {
      console.error('❌ Erreur création événement:', error);
      Alert.alert('Erreur', 'Impossible de créer l\'événement. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNeedIcon = (type: EventNeed['type']) => {
    return needTypes.find(nt => nt.key === type)?.icon || '📦';
  };

  const getTargetCount = () => {
    if (targetingPreview) {
      return targetingPreview.totalContacts;
    }
    
    // Fallback vers l'ancien calcul si pas de preview
    switch (targetType) {
      case 'groups':
        return selectedGroups.reduce((total, groupId) => {
          const group = mockGroups.find(g => g.id === groupId);
          return total + (group?.membersCount || 0);
        }, 0);
      case 'contacts':
        return selectedContacts.length;
      case 'all':
        return mockContacts.filter(c => c.hasBob).length;
      default:
        return 0;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, WebStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Créer un événement" 
        showBackButton={true}
        onBackPress={navigation.goBack}
      />
      
      <ScrollView 
        style={[styles.content, WebStyles.scrollView]} 
        contentContainerStyle={WebStyles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Event Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Titre de l'événement *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Barbecue de quartier, Déménagement, Fête d'anniversaire..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Décrivez votre événement, ce qui est prévu, l'ambiance..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Date début *</Text>
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA HH:MM"
                value={dateDebut}
                onChangeText={setDateDebut}
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Date fin</Text>
              <TextInput
                style={styles.input}
                placeholder="JJ/MM/AAAA HH:MM"
                value={dateFin}
                onChangeText={setDateFin}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse</Text>
            <TextInput
              style={styles.input}
              placeholder="Lieu de l'événement"
              value={adresse}
              onChangeText={setAdresse}
            />
          </View>

          <View style={styles.numberRow}>
            <View style={styles.numberInput}>
              <Text style={styles.inputLabel}>Max participants</Text>
              <TextInput
                style={styles.input}
                placeholder="Illimité"
                value={maxParticipants}
                onChangeText={setMaxParticipants}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.numberInput}>
              <Text style={styles.inputLabel}>Bobiz récompense</Text>
              <TextInput
                style={styles.input}
                value={bobizRecompense}
                onChangeText={setBobizRecompense}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Event Needs */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Liste des besoins</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddNeed(true)}
            >
              <Text style={styles.addButtonText}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>

          {needs.length === 0 ? (
            <View style={styles.emptyNeeds}>
              <Text style={styles.emptyNeedsText}>
                Ajoutez des besoins pour votre événement
              </Text>
              <Text style={styles.emptyNeedsHint}>
                Objets à apporter, services à rendre, aide collective...
              </Text>
            </View>
          ) : (
            <View style={styles.needsList}>
              {needs.map((need) => (
                <View key={need.id} style={styles.needCard}>
                  <View style={styles.needHeader}>
                    <Text style={styles.needIcon}>{getNeedIcon(need.type)}</Text>
                    <View style={styles.needInfo}>
                      <TextInput
                        style={styles.needTitle}
                        placeholder="Titre du besoin"
                        value={need.titre}
                        onChangeText={(text) => updateNeed(need.id, { titre: text })}
                      />
                      <TextInput
                        style={styles.needDescription}
                        placeholder="Description détaillée"
                        value={need.description}
                        onChangeText={(text) => updateNeed(need.id, { description: text })}
                      />
                    </View>
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => removeNeed(need.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Need specific fields */}
                  {need.type === 'objet' && (
                    <View style={styles.needOptions}>
                      <Text style={styles.optionLabel}>Quantité:</Text>
                      <TextInput
                        style={styles.quantityInput}
                        value={need.quantite?.toString() || '1'}
                        onChangeText={(text) => updateNeed(need.id, { quantite: parseInt(text) || 1 })}
                        keyboardType="numeric"
                      />
                    </View>
                  )}

                  {need.type === 'service_collectif' && (
                    <View style={styles.needOptions}>
                      <Text style={styles.optionLabel}>Max personnes:</Text>
                      <TextInput
                        style={styles.quantityInput}
                        value={need.maxPersonnes?.toString() || '2'}
                        onChangeText={(text) => updateNeed(need.id, { maxPersonnes: parseInt(text) || 2 })}
                        keyboardType="numeric"
                      />
                    </View>
                  )}

                  {need.type === 'service_timing' && (
                    <View style={styles.needOptions}>
                      <Text style={styles.optionLabel}>Timing:</Text>
                      <View style={styles.timingOptions}>
                        {['avant', 'pendant', 'apres'].map(timing => (
                          <TouchableOpacity
                            key={timing}
                            style={[styles.timingOption, need.timing === timing && styles.timingOptionActive]}
                            onPress={() => updateNeed(need.id, { timing: timing as any })}
                          >
                            <Text style={[styles.timingText, need.timing === timing && styles.timingTextActive]}>
                              {timing === 'avant' ? 'Avant' : timing === 'pendant' ? 'Pendant' : 'Après'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Creator positioning */}
                  <TouchableOpacity 
                    style={styles.creatorPosition}
                    onPress={() => toggleCreatorPosition(need.id)}
                  >
                    <View style={[styles.checkbox, need.isCreatorPositioned && styles.checkboxActive]}>
                      {need.isCreatorPositioned && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.creatorPositionText}>Je me positionne sur ce besoin</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Need Modal */}
          {showAddNeed && (
            <View style={styles.addNeedModal}>
              <Text style={styles.addNeedTitle}>Quel type de besoin ?</Text>
              <View style={styles.needTypesList}>
                {needTypes.map(type => (
                  <TouchableOpacity
                    key={type.key}
                    style={styles.needTypeCard}
                    onPress={() => addNeed(type.key)}
                  >
                    <Text style={styles.needTypeIcon}>{type.icon}</Text>
                    <View style={styles.needTypeInfo}>
                      <Text style={styles.needTypeTitle}>{type.title}</Text>
                      <Text style={styles.needTypeDescription}>{type.description}</Text>
                      <Text style={styles.needTypeExample}>Ex: {type.example}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowAddNeed(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Targeting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Qui inviter ?</Text>
          
          <View style={styles.targetTypes}>
            <TouchableOpacity
              style={[styles.targetType, targetType === 'all' && styles.targetTypeActive]}
              onPress={() => setTargetType('all')}
            >
              <Text style={styles.targetIcon}>🌍</Text>
              <Text style={[styles.targetLabel, targetType === 'all' && styles.targetLabelActive]}>
                Tous mes contacts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.targetType, targetType === 'groups' && styles.targetTypeActive]}
              onPress={() => setTargetType('groups')}
            >
              <Text style={styles.targetIcon}>👥</Text>
              <Text style={[styles.targetLabel, targetType === 'groups' && styles.targetLabelActive]}>
                Groupes spécifiques
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.targetType, targetType === 'contacts' && styles.targetTypeActive]}
              onPress={() => setTargetType('contacts')}
            >
              <Text style={styles.targetIcon}>👤</Text>
              <Text style={[styles.targetLabel, targetType === 'contacts' && styles.targetLabelActive]}>
                Contacts sélectionnés
              </Text>
            </TouchableOpacity>
          </View>

          {/* Group Selection */}
          {targetType === 'groups' && (
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionTitle}>Choisir les groupes :</Text>
              <View style={styles.groupsList}>
                {mockGroups.map(group => {
                  const isSelected = selectedGroups.includes(group.id);
                  
                  return (
                    <TouchableOpacity
                      key={group.id}
                      style={[styles.selectableItem, isSelected && styles.selectableItemActive]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedGroups(prev => prev.filter(id => id !== group.id));
                        } else {
                          setSelectedGroups(prev => [...prev, group.id]);
                        }
                      }}
                    >
                      <Text style={styles.selectableIcon}>{group.icon}</Text>
                      <View style={styles.selectableInfo}>
                        <Text style={styles.selectableName}>{group.nom}</Text>
                        <Text style={styles.selectableCount}>{group.membersCount} membres</Text>
                      </View>
                      {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Contact Selection */}
          {targetType === 'contacts' && (
            <View style={styles.selectionContainer}>
              <Text style={styles.selectionTitle}>Choisir les contacts :</Text>
              <View style={styles.contactsList}>
                {mockContacts.filter(c => c.hasBob).map(contact => {
                  const isSelected = selectedContacts.includes(contact.id);
                  
                  return (
                    <TouchableOpacity
                      key={contact.id}
                      style={[styles.selectableItem, isSelected && styles.selectableItemActive]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedContacts(prev => prev.filter(id => id !== contact.id));
                        } else {
                          setSelectedContacts(prev => [...prev, contact.id]);
                        }
                      }}
                    >
                      <View style={styles.contactAvatar}>
                        <Text style={styles.contactAvatarText}>
                          {contact.nom.split(' ').map(n => n[0]).join('')}
                        </Text>
                      </View>
                      <View style={styles.selectableInfo}>
                        <Text style={styles.selectableName}>{contact.nom}</Text>
                        <Text style={styles.selectableCount}>
                          {mockGroups.find(g => g.id === contact.groupe)?.nom || 'Aucun groupe'}
                        </Text>
                      </View>
                      {isSelected && <Text style={styles.selectedCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.targetSummary}>
            <Text style={styles.targetSummaryText}>
              {isLoadingPreview ? (
                '⏳ Calcul en cours...'
              ) : (
                `📤 ${getTargetCount()} personne${getTargetCount() > 1 ? 's' : ''} recevront l'invitation`
              )}
            </Text>
            
            {targetingPreview && targetingPreview.groupesSummary && Object.keys(targetingPreview.groupesSummary).length > 0 && (
              <Text style={[styles.targetSummaryText, { fontSize: 12, marginTop: 4, opacity: 0.8 }]}>
                {Object.entries(targetingPreview.groupesSummary)
                  .map(([groupe, count]) => `${groupe}: ${count}`)
                  .join(' • ')
                }
              </Text>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            title="🎉 Créer l'événement"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!title.trim() || !description.trim() || needs.length === 0}
            style={styles.submitButton}
          />
          
          <Text style={styles.submitNote}>
            Les invitations seront envoyées immédiatement. Un chat de groupe sera créé automatiquement.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};