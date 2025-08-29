// src/components/forms/CreateEventForm.tsx - Formulaire de création d'événement avec upload d'images
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import ImageUploader from '../common/ImageUploader';
import { MediaFile } from '../../services/media.service';
import { Colors } from '../../styles/tokens';

export interface EventFormData {
  titre: string;
  description: string;
  dateDebut: Date;
  dateFin?: Date;
  adresse?: string;
  maxParticipants?: number;
  bobizRecompense?: number;
  recurrent?: boolean;
  images?: MediaFile[];
}

export interface CreateEventFormProps {
  initialData?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<EventFormData>({
    titre: '',
    description: '',
    dateDebut: new Date(),
    dateFin: undefined,
    adresse: '',
    maxParticipants: undefined,
    bobizRecompense: 20,
    recurrent: false,
    images: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof EventFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est obligatoire';
    } else if (formData.titre.length < 3) {
      newErrors.titre = 'Le titre doit faire au moins 3 caractères';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La description est obligatoire';
    } else if (formData.description.length < 10) {
      newErrors.description = 'La description doit faire au moins 10 caractères';
    }

    if (formData.dateDebut <= new Date()) {
      newErrors.dateDebut = 'La date de début doit être dans le futur';
    }

    if (formData.dateFin && formData.dateFin <= formData.dateDebut) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }

    if (formData.maxParticipants && formData.maxParticipants < 1) {
      newErrors.maxParticipants = 'Le nombre de participants doit être positif';
    }

    if (formData.bobizRecompense && (formData.bobizRecompense < 1 || formData.bobizRecompense > 100)) {
      newErrors.bobizRecompense = 'La récompense doit être entre 1 et 100 BOBIZ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    } else {
      Alert.alert('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire.');
    }
  };

  const handleImagesUploaded = (images: MediaFile[]) => {
    updateField('images', [...(formData.images || []), ...images]);
  };

  const handleImagesChanged = (images: MediaFile[]) => {
    updateField('images', images);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  const parseInputDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Titre de l'événement <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.titre && styles.inputError]}
            value={formData.titre}
            onChangeText={(value) => updateField('titre', value)}
            placeholder="Barbecue entre voisins, soirée jeux..."
            maxLength={100}
          />
          {errors.titre && <Text style={styles.errorText}>{errors.titre}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Décrivez votre événement : activités prévues, ce qu'il faut apporter..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos de l'événement</Text>
          <Text style={styles.hint}>
            Ajoutez des photos pour donner envie aux participants de vous rejoindre !
          </Text>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            onImagesChanged={handleImagesChanged}
            initialImages={formData.images}
            maxImages={4}
            uploadButtonText="Ajouter des photos"
            placeholder="Aucune photo ajoutée"
            imagePickerOptions={{
              allowsMultipleSelection: true,
              quality: 0.8,
            }}
          />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date et heure de début <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.dateDebut && styles.inputError]}
            value={formatDateForInput(formData.dateDebut)}
            onChangeText={(value) => updateField('dateDebut', parseInputDate(value))}
            placeholder="2024-01-01T18:00"
          />
          {errors.dateDebut && <Text style={styles.errorText}>{errors.dateDebut}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date et heure de fin (optionnel)</Text>
          <TextInput
            style={[styles.input, errors.dateFin && styles.inputError]}
            value={formData.dateFin ? formatDateForInput(formData.dateFin) : ''}
            onChangeText={(value) => updateField('dateFin', value ? parseInputDate(value) : undefined)}
            placeholder="2024-01-01T22:00"
          />
          {errors.dateFin && <Text style={styles.errorText}>{errors.dateFin}</Text>}
        </View>

        {/* Adresse */}
        <View style={styles.section}>
          <Text style={styles.label}>Lieu / Adresse</Text>
          <TextInput
            style={styles.input}
            value={formData.adresse}
            onChangeText={(value) => updateField('adresse', value)}
            placeholder="Chez Marie, 123 rue des Lilas..."
          />
        </View>

        {/* Participants et récompense */}
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Participants max</Text>
            <TextInput
              style={[styles.input, errors.maxParticipants && styles.inputError]}
              value={formData.maxParticipants?.toString() || ''}
              onChangeText={(value) => updateField('maxParticipants', parseInt(value) || undefined)}
              placeholder="10"
              keyboardType="numeric"
            />
            {errors.maxParticipants && <Text style={styles.errorText}>{errors.maxParticipants}</Text>}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Récompense BOBIZ</Text>
            <TextInput
              style={[styles.input, errors.bobizRecompense && styles.inputError]}
              value={formData.bobizRecompense?.toString()}
              onChangeText={(value) => updateField('bobizRecompense', parseInt(value) || 0)}
              placeholder="20"
              keyboardType="numeric"
            />
            {errors.bobizRecompense && <Text style={styles.errorText}>{errors.bobizRecompense}</Text>}
          </View>
        </View>

        {/* Événement récurrent */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => updateField('recurrent', !formData.recurrent)}
          >
            <View style={[styles.checkbox, formData.recurrent && styles.checkboxChecked]}>
              {formData.recurrent && <Text style={styles.checkboxIcon}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Événement récurrent</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>
            Si coché, cet événement se répétera automatiquement
          </Text>
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          {onCancel && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Annuler</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.buttonPrimary,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonPrimaryText}>
              {loading ? 'Création...' : '🎉 Créer l\'événement'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Espace pour éviter le clavier */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  hint: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text,
    minHeight: 100,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: '#8B5CF6', // Couleur violette pour les événements
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonPrimaryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default CreateEventForm;