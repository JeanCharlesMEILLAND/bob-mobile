// src/components/forms/CreateExchangeForm.tsx - Formulaire de création d'échange avec upload d'images
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

export interface ExchangeFormData {
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  conditions?: string;
  dureeJours?: number;
  bobizGagnes?: number;
  images?: MediaFile[];
}

export interface CreateExchangeFormProps {
  initialData?: Partial<ExchangeFormData>;
  onSubmit: (data: ExchangeFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const EXCHANGE_TYPES = [
  {
    id: 'pret',
    title: 'Prêt',
    description: 'Je prête quelque chose',
    icon: '📤',
    color: '#10B981',
  },
  {
    id: 'emprunt',
    title: 'Emprunt',
    description: 'Je souhaite emprunter',
    icon: '📥',
    color: '#3B82F6',
  },
  {
    id: 'service_offert',
    title: 'Service offert',
    description: 'Je propose un service',
    icon: '🤝',
    color: '#8B5CF6',
  },
  {
    id: 'service_demande',
    title: 'Service demandé',
    description: 'Je demande un service',
    icon: '🙏',
    color: '#F59E0B',
  },
] as const;

export const CreateExchangeForm: React.FC<CreateExchangeFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<ExchangeFormData>({
    type: 'pret',
    titre: '',
    description: '',
    conditions: '',
    dureeJours: 7,
    bobizGagnes: 10,
    images: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof ExchangeFormData, value: any) => {
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

    if (formData.dureeJours && (formData.dureeJours < 1 || formData.dureeJours > 365)) {
      newErrors.dureeJours = 'La durée doit être entre 1 et 365 jours';
    }

    if (formData.bobizGagnes && (formData.bobizGagnes < 1 || formData.bobizGagnes > 100)) {
      newErrors.bobizGagnes = 'Les BOBIZ doivent être entre 1 et 100';
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

  const selectedType = EXCHANGE_TYPES.find(type => type.id === formData.type);

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
        {/* Sélection du type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type d'échange</Text>
          <View style={styles.typeSelector}>
            {EXCHANGE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeOption,
                  formData.type === type.id && [
                    styles.typeOptionSelected,
                    { borderColor: type.color }
                  ]
                ]}
                onPress={() => updateField('type', type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeTitle,
                  formData.type === type.id && styles.typeTitleSelected
                ]}>
                  {type.title}
                </Text>
                <Text style={styles.typeDescription}>{type.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Titre <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.titre && styles.inputError]}
            value={formData.titre}
            onChangeText={(value) => updateField('titre', value)}
            placeholder={`Que ${formData.type === 'pret' ? 'prêtez' : formData.type === 'emprunt' ? 'cherchez' : 'proposez'}-vous ?`}
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
            placeholder="Décrivez en détail votre demande..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <Text style={styles.hint}>
            Ajoutez des photos pour rendre votre {selectedType?.title.toLowerCase()} plus attractif
          </Text>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            onImagesChanged={handleImagesChanged}
            initialImages={formData.images}
            maxImages={5}
            uploadButtonText="Ajouter des photos"
            placeholder="Aucune photo ajoutée"
            imagePickerOptions={{
              allowsMultipleSelection: true,
              quality: 0.8,
            }}
          />
        </View>

        {/* Conditions (optionnel) */}
        <View style={styles.section}>
          <Text style={styles.label}>Conditions particulières</Text>
          <TextInput
            style={styles.textArea}
            value={formData.conditions}
            onChangeText={(value) => updateField('conditions', value)}
            placeholder="Conditions spéciales, précautions, état de l'objet..."
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Durée et récompense */}
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Durée (jours)</Text>
            <TextInput
              style={[styles.input, errors.dureeJours && styles.inputError]}
              value={formData.dureeJours?.toString()}
              onChangeText={(value) => updateField('dureeJours', parseInt(value) || 0)}
              placeholder="7"
              keyboardType="numeric"
            />
            {errors.dureeJours && <Text style={styles.errorText}>{errors.dureeJours}</Text>}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Récompense BOBIZ</Text>
            <TextInput
              style={[styles.input, errors.bobizGagnes && styles.inputError]}
              value={formData.bobizGagnes?.toString()}
              onChangeText={(value) => updateField('bobizGagnes', parseInt(value) || 0)}
              placeholder="10"
              keyboardType="numeric"
            />
            {errors.bobizGagnes && <Text style={styles.errorText}>{errors.bobizGagnes}</Text>}
          </View>
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
              { backgroundColor: selectedType?.color || Colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonPrimaryText}>
              {loading ? 'Création...' : `Créer le ${selectedType?.title.toLowerCase()}`}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
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
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  typeOptionSelected: {
    borderWidth: 2,
    backgroundColor: '#F8FAFF',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  typeTitleSelected: {
    color: Colors.primary,
  },
  typeDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
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
    backgroundColor: Colors.primary,
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

export default CreateExchangeForm;