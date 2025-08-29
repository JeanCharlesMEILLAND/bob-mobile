// src/components/forms/CreateBesoinForm.tsx - Formulaire de création de besoin avec upload d'images
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

export interface BesoinFormData {
  titre: string;
  description: string;
  type: 'objet_demande' | 'service_demande' | 'competence_demande' | 'transport' | 'hebergement' | 'materiel' | 'autre';
  urgence: 'faible' | 'normale' | 'haute' | 'urgente';
  dateEcheance?: Date;
  adresse?: string;
  bobizOfferts?: number;
  quantite?: number;
  tags?: string[];
  images?: MediaFile[];
}

export interface CreateBesoinFormProps {
  initialData?: Partial<BesoinFormData>;
  onSubmit: (data: BesoinFormData) => void;
  onCancel?: () => void;
  loading?: boolean;
}

const BESOIN_TYPES = [
  { id: 'objet_demande', title: 'Objet demandé', icon: '📦', description: 'J\'ai besoin d\'emprunter un objet' },
  { id: 'service_demande', title: 'Service demandé', icon: '🤝', description: 'J\'ai besoin d\'aide pour un service' },
  { id: 'competence_demande', title: 'Compétence demandée', icon: '🎓', description: 'J\'ai besoin d\'expertise' },
  { id: 'transport', title: 'Transport', icon: '🚗', description: 'J\'ai besoin d\'un transport' },
  { id: 'hebergement', title: 'Hébergement', icon: '🏠', description: 'J\'ai besoin d\'un hébergement' },
  { id: 'materiel', title: 'Matériel', icon: '🔧', description: 'J\'ai besoin de matériel spécifique' },
  { id: 'autre', title: 'Autre', icon: '❓', description: 'Autre type de besoin' },
] as const;

const URGENCE_LEVELS = [
  { id: 'faible', title: 'Faible', color: '#10B981', description: 'Pas pressé' },
  { id: 'normale', title: 'Normale', color: '#3B82F6', description: 'Dans les prochains jours' },
  { id: 'haute', title: 'Haute', color: '#F59E0B', description: 'Assez urgent' },
  { id: 'urgente', title: 'Urgente', color: '#EF4444', description: 'Très urgent !' },
] as const;

export const CreateBesoinForm: React.FC<CreateBesoinFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { t } = useTranslation();
  
  const [formData, setBesoinData] = useState<BesoinFormData>({
    titre: '',
    description: '',
    type: 'objet_demande',
    urgence: 'normale',
    dateEcheance: undefined,
    adresse: '',
    bobizOfferts: 5,
    quantite: 1,
    tags: [],
    images: [],
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState('');

  const updateField = (field: keyof BesoinFormData, value: any) => {
    setBesoinData(prev => ({ ...prev, [field]: value }));
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

    if (formData.dateEcheance && formData.dateEcheance <= new Date()) {
      newErrors.dateEcheance = 'La date d\'échéance doit être dans le futur';
    }

    if (formData.quantite && formData.quantite < 1) {
      newErrors.quantite = 'La quantité doit être positive';
    }

    if (formData.bobizOfferts && (formData.bobizOfferts < 0 || formData.bobizOfferts > 100)) {
      newErrors.bobizOfferts = 'Les BOBIZ offerts doivent être entre 0 et 100';
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

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      updateField('tags', [...(formData.tags || []), tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().slice(0, 16);
  };

  const parseInputDate = (dateString: string): Date => {
    return new Date(dateString);
  };

  const selectedType = BESOIN_TYPES.find(type => type.id === formData.type);
  const selectedUrgence = URGENCE_LEVELS.find(level => level.id === formData.urgence);

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
        {/* Type de besoin */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de besoin</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScrollView}>
            {BESOIN_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  formData.type === type.id && styles.typeChipSelected
                ]}
                onPress={() => updateField('type', type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeText,
                  formData.type === type.id && styles.typeTextSelected
                ]}>
                  {type.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Titre */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Titre du besoin <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.titre && styles.inputError]}
            value={formData.titre}
            onChangeText={(value) => updateField('titre', value)}
            placeholder={`${selectedType?.description || 'Décrivez votre besoin'}`}
            maxLength={100}
          />
          {errors.titre && <Text style={styles.errorText}>{errors.titre}</Text>}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description détaillée <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Décrivez en détail votre besoin, les conditions, la durée..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Images */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos du besoin</Text>
          <Text style={styles.hint}>
            Ajoutez des photos pour clarifier votre demande
          </Text>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            onImagesChanged={handleImagesChanged}
            initialImages={formData.images}
            maxImages={3}
            uploadButtonText="Ajouter des photos"
            placeholder="Aucune photo ajoutée"
            imagePickerOptions={{
              allowsMultipleSelection: true,
              quality: 0.8,
            }}
          />
        </View>

        {/* Urgence */}
        <View style={styles.section}>
          <Text style={styles.label}>Niveau d'urgence</Text>
          <View style={styles.urgenceContainer}>
            {URGENCE_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.urgenceChip,
                  formData.urgence === level.id && [
                    styles.urgenceChipSelected,
                    { borderColor: level.color }
                  ]
                ]}
                onPress={() => updateField('urgence', level.id)}
              >
                <Text style={[
                  styles.urgenceText,
                  formData.urgence === level.id && { color: level.color }
                ]}>
                  {level.title}
                </Text>
                <Text style={styles.urgenceDesc}>{level.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date d'échéance */}
        <View style={styles.section}>
          <Text style={styles.label}>Date d'échéance (optionnel)</Text>
          <TextInput
            style={[styles.input, errors.dateEcheance && styles.inputError]}
            value={formData.dateEcheance ? formatDateForInput(formData.dateEcheance) : ''}
            onChangeText={(value) => updateField('dateEcheance', value ? parseInputDate(value) : undefined)}
            placeholder="2024-01-01T18:00"
          />
          {errors.dateEcheance && <Text style={styles.errorText}>{errors.dateEcheance}</Text>}
        </View>

        {/* Lieu */}
        <View style={styles.section}>
          <Text style={styles.label}>Lieu / Adresse</Text>
          <TextInput
            style={styles.input}
            value={formData.adresse}
            onChangeText={(value) => updateField('adresse', value)}
            placeholder="Où le besoin se situe-t-il ?"
          />
        </View>

        {/* Quantité et BOBIZ offerts */}
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Quantité</Text>
            <TextInput
              style={[styles.input, errors.quantite && styles.inputError]}
              value={formData.quantite?.toString()}
              onChangeText={(value) => updateField('quantite', parseInt(value) || 1)}
              placeholder="1"
              keyboardType="numeric"
            />
            {errors.quantite && <Text style={styles.errorText}>{errors.quantite}</Text>}
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>BOBIZ offerts</Text>
            <TextInput
              style={[styles.input, errors.bobizOfferts && styles.inputError]}
              value={formData.bobizOfferts?.toString()}
              onChangeText={(value) => updateField('bobizOfferts', parseInt(value) || 0)}
              placeholder="5"
              keyboardType="numeric"
            />
            {errors.bobizOfferts && <Text style={styles.errorText}>{errors.bobizOfferts}</Text>}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={styles.label}>Mots-clés</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Ajouter un mot-clé"
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addTagButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {formData.tags?.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={styles.tag}
                onPress={() => removeTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <Text style={styles.tagRemove}>×</Text>
              </TouchableOpacity>
            ))}
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
              { backgroundColor: selectedUrgence?.color || Colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonPrimaryText}>
              {loading ? 'Création...' : `${selectedType?.icon} Publier le besoin`}
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
  typeScrollView: {
    marginBottom: 8,
  },
  typeChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: Colors.white,
    minWidth: 100,
  },
  typeChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F0F8FF',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  typeTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  urgenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgenceChip: {
    flex: 1,
    minWidth: '47%',
    padding: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  urgenceChipSelected: {
    borderWidth: 2,
  },
  urgenceText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  urgenceDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
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
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  addTagButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    color: Colors.text,
    fontSize: 14,
    marginRight: 6,
  },
  tagRemove: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: 'bold',
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

export default CreateBesoinForm;