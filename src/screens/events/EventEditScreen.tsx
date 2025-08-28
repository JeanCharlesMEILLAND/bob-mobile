// src/screens/events/EventEditScreen.tsx - Édition d'événement pour organisateur
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { eventsService, Event } from '../../services/events.service';
import { authService } from '../../services/auth.service';

interface EventEditScreenProps {
  eventId: number;
}

interface EventForm {
  titre: string;
  description: string;
  dateDebut: string;
  dateFin?: string;
  adresse?: string;
  maxParticipants?: number;
  bobizRecompense: number;
  besoins: BesoinForm[];
}

interface BesoinForm {
  id: string;
  type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
  titre: string;
  description: string;
  quantite?: number;
  maxPersonnes?: number;
  timing?: 'avant' | 'pendant' | 'apres';
  isCreatorPositioned: boolean;
}

const styles = {
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { flex: 1 },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212529',
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 12
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 45
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top' as const
  },
  besoinCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF'
  },
  besoinHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12
  },
  besoinTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529'
  },
  deleteButton: {
    backgroundColor: '#DC3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14
  },
  addButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    marginTop: 16
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    margin: 12
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18
  },
  typeSelector: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 8,
    marginTop: 8
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF'
  },
  typeOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  typeOptionText: {
    fontSize: 14,
    color: '#495057'
  },
  typeOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '600'
  }
};

export const EventEditScreen: React.FC<EventEditScreenProps> = ({ eventId }) => {
  const { user } = useAuth();
  const navigation = useSimpleNavigation();

  // États
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState<EventForm>({
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    adresse: '',
    maxParticipants: 50,
    bobizRecompense: 15,
    besoins: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token requis');

      const eventData = await eventsService.getEvent(eventId.toString(), token);
      if (!eventData) throw new Error('Événement non trouvé');

      // Vérifier que c'est bien l'organisateur
      const isOrganizer = await eventsService.isOrganisateur(eventData, token);
      if (!isOrganizer) {
        Alert.alert('Accès refusé', 'Vous n\'êtes pas l\'organisateur de cet événement');
        navigation.goBack();
        return;
      }

      setEvent(eventData);
      setForm({
        titre: eventData.titre,
        description: eventData.description,
        dateDebut: eventData.dateDebut,
        dateFin: eventData.dateFin || '',
        adresse: eventData.adresse || '',
        maxParticipants: eventData.maxParticipants || 50,
        bobizRecompense: eventData.bobizRecompense,
        besoins: (eventData.besoins || []).map(besoin => ({
          id: besoin.id,
          type: besoin.type,
          titre: besoin.titre,
          description: besoin.description,
          quantite: besoin.quantite,
          maxPersonnes: besoin.maxPersonnes,
          timing: besoin.timing,
          isCreatorPositioned: besoin.isCreatorPositioned || false
        }))
      });
    } catch (error: any) {
      console.error('❌ Erreur chargement événement:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'événement');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!form.titre.trim()) {
        Alert.alert('Erreur', 'Le titre est requis');
        return;
      }
      if (!form.description.trim()) {
        Alert.alert('Erreur', 'La description est requise');
        return;
      }
      if (!form.dateDebut.trim()) {
        Alert.alert('Erreur', 'La date de début est requise');
        return;
      }

      setIsSaving(true);
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token requis');

      console.log('💾 Sauvegarde modifications événement...');
      
      await eventsService.updateEvent(eventId.toString(), {
        titre: form.titre,
        description: form.description,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
        adresse: form.adresse,
        maxParticipants: form.maxParticipants,
        bobizRecompense: form.bobizRecompense,
        besoins: form.besoins,
        ciblage: { type: 'all' } // Conserver le ciblage existant ou par défaut
      }, token);

      Alert.alert(
        'Modifications sauvegardées !',
        'Votre événement a été mis à jour avec succès.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error: any) {
      console.error('❌ Erreur sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les modifications');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddBesoin = () => {
    const newBesoin: BesoinForm = {
      id: `besoin_${Date.now()}`,
      type: 'objet',
      titre: '',
      description: '',
      isCreatorPositioned: false
    };

    setForm(prev => ({
      ...prev,
      besoins: [...prev.besoins, newBesoin]
    }));
  };

  const handleUpdateBesoin = (besoinId: string, updates: Partial<BesoinForm>) => {
    setForm(prev => ({
      ...prev,
      besoins: prev.besoins.map(besoin => 
        besoin.id === besoinId ? { ...besoin, ...updates } : besoin
      )
    }));
  };

  const handleRemoveBesoin = (besoinId: string) => {
    setForm(prev => ({
      ...prev,
      besoins: prev.besoins.filter(besoin => besoin.id !== besoinId)
    }));
  };

  const getBesoinTypeLabel = (type: string) => {
    switch (type) {
      case 'objet': return 'Objet';
      case 'service_individuel': return 'Service individuel';
      case 'service_collectif': return 'Service collectif';
      case 'service_timing': return 'Service timing';
      default: return 'Objet';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Modification événement" showBackButton onBackPress={navigation.goBack} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title="Modifier l'événement"
        showBackButton 
        onBackPress={navigation.goBack}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations principales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Informations principales</Text>

          <Text style={styles.inputLabel}>Titre de l'événement</Text>
          <TextInput
            style={styles.textInput}
            value={form.titre}
            onChangeText={(text) => setForm(prev => ({ ...prev, titre: text }))}
            placeholder="Ex: Barbecue de quartier"
            maxLength={100}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={form.description}
            onChangeText={(text) => setForm(prev => ({ ...prev, description: text }))}
            placeholder="Décrivez votre événement..."
            multiline={true}
            numberOfLines={4}
            maxLength={500}
          />

          <Text style={styles.inputLabel}>Lieu</Text>
          <TextInput
            style={styles.textInput}
            value={form.adresse || ''}
            onChangeText={(text) => setForm(prev => ({ ...prev, adresse: text }))}
            placeholder="Ex: Parc des Buttes Chaumont, Paris"
            maxLength={200}
          />

          <Text style={styles.inputLabel}>Participants maximum</Text>
          <TextInput
            style={styles.textInput}
            value={form.maxParticipants?.toString() || ''}
            onChangeText={(text) => {
              const num = parseInt(text) || 50;
              setForm(prev => ({ ...prev, maxParticipants: num }));
            }}
            keyboardType="numeric"
            placeholder="50"
          />

          <Text style={styles.inputLabel}>BOBIZ de récompense</Text>
          <TextInput
            style={styles.textInput}
            value={form.bobizRecompense.toString()}
            onChangeText={(text) => {
              const num = parseInt(text) || 10;
              setForm(prev => ({ ...prev, bobizRecompense: num }));
            }}
            keyboardType="numeric"
            placeholder="15"
          />
        </View>

        {/* Gestion des besoins */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Besoins de l'événement</Text>

          {form.besoins.map((besoin) => (
            <View key={besoin.id} style={styles.besoinCard}>
              <View style={styles.besoinHeader}>
                <Text style={styles.besoinTitle}>
                  {besoin.titre || 'Nouveau besoin'}
                </Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleRemoveBesoin(besoin.id)}
                >
                  <Text style={styles.deleteButtonText}>Supprimer</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>Titre du besoin</Text>
              <TextInput
                style={styles.textInput}
                value={besoin.titre}
                onChangeText={(text) => handleUpdateBesoin(besoin.id, { titre: text })}
                placeholder="Ex: Barbecue portable"
                maxLength={100}
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={besoin.description}
                onChangeText={(text) => handleUpdateBesoin(besoin.id, { description: text })}
                placeholder="Décrivez ce dont vous avez besoin..."
                multiline={true}
                numberOfLines={3}
                maxLength={300}
              />

              <Text style={styles.inputLabel}>Type de besoin</Text>
              <View style={styles.typeSelector}>
                {(['objet', 'service_individuel', 'service_collectif', 'service_timing'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      besoin.type === type && styles.typeOptionActive
                    ]}
                    onPress={() => handleUpdateBesoin(besoin.id, { type })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        besoin.type === type && styles.typeOptionTextActive
                      ]}
                    >
                      {getBesoinTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {besoin.type === 'objet' && (
                <>
                  <Text style={styles.inputLabel}>Quantité</Text>
                  <TextInput
                    style={styles.textInput}
                    value={besoin.quantite?.toString() || ''}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      handleUpdateBesoin(besoin.id, { quantite: num });
                    }}
                    keyboardType="numeric"
                    placeholder="1"
                  />
                </>
              )}

              {(besoin.type === 'service_collectif') && (
                <>
                  <Text style={styles.inputLabel}>Nombre maximum de personnes</Text>
                  <TextInput
                    style={styles.textInput}
                    value={besoin.maxPersonnes?.toString() || ''}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 2;
                      handleUpdateBesoin(besoin.id, { maxPersonnes: num });
                    }}
                    keyboardType="numeric"
                    placeholder="2"
                  />
                </>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddBesoin}>
            <Text style={styles.addButtonText}>➕ Ajouter un besoin</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bouton de sauvegarde */}
      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? '💾 Sauvegarde...' : '💾 Sauvegarder les modifications'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};