// src/components/common/CreateGroupModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Input } from './Input';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { 
  GroupeFormData, 
  GroupeType, 
  GROUPE_TYPES, 
  GROUPE_COLORS,
  CreateGroupeData,
} from '../../types';

interface CreateGroupModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateGroupeData) => Promise<void>;
  isLoading?: boolean;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<GroupeFormData>({
    nom: '',
    description: '',
    couleur: GROUPE_COLORS[0],
    type: 'famille',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    // Reset form
    setFormData({
      nom: '',
      description: '',
      couleur: GROUPE_COLORS[0],
      type: 'famille',
    });
    setErrors({});
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom du groupe est obligatoire';
    } else if (formData.nom.length < 2) {
      newErrors.nom = 'Minimum 2 caractères';
    } else if (formData.nom.length > 50) {
      newErrors.nom = 'Maximum 50 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const submitData: CreateGroupeData = {
        nom: formData.nom.trim(),
        description: formData.description?.trim() || '',
        couleur: formData.couleur,
        type: formData.type,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer le groupe');
    }
  };

  const handleTypeSelect = (type: GroupeType) => {
    setFormData(prev => ({ ...prev, type }));
  };

  const handleColorSelect = (couleur: string) => {
    setFormData(prev => ({ ...prev, couleur }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Nouveau groupe</Text>
          
          <TouchableOpacity 
            onPress={handleSubmit} 
            style={[styles.saveButton, (!formData.nom.trim() || isLoading) && styles.saveButtonDisabled]}
            disabled={!formData.nom.trim() || isLoading}
          >
            <Text style={[styles.saveText, (!formData.nom.trim() || isLoading) && styles.saveTextDisabled]}>
              {isLoading ? 'Création...' : 'Créer'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Form Fields */}
          <View style={styles.section}>
            <Input
              label="Nom du groupe *"
              placeholder="Ex: Ma famille, Mes amis..."
              value={formData.nom}
              onChangeText={(text) => setFormData(prev => ({ ...prev, nom: text }))}
              error={errors.nom}
              maxLength={50}
            />

            <Input
              label="Description (optionnel)"
              placeholder="Décrivez votre groupe..."
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
              style={styles.textArea}
            />
          </View>

          {/* Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de groupe</Text>
            
            <View style={styles.typeGrid}>
              {GROUPE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeCard,
                    formData.type === type.value && styles.typeCardSelected
                  ]}
                  onPress={() => handleTypeSelect(type.value)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeLabel,
                    formData.type === type.value && styles.typeLabelSelected
                  ]}>
                    {type.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    formData.type === type.value && styles.typeDescriptionSelected
                  ]}>
                    {type.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Couleur du groupe</Text>
            
            <View style={styles.colorGrid}>
              {GROUPE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    formData.couleur === color && styles.colorOptionSelected
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {formData.couleur === color && (
                    <Text style={styles.colorCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aperçu</Text>
            
            <View style={[styles.previewCard, { borderLeftColor: formData.couleur }]}>
              <View style={styles.previewContent}>
                <Text style={styles.previewIcon}>
                  {GROUPE_TYPES.find(t => t.value === formData.type)?.icon}
                </Text>
                <View style={styles.previewText}>
                  <Text style={styles.previewName}>
                    {formData.nom || 'Nom du groupe'}
                  </Text>
                  <Text style={styles.previewType}>
                    {GROUPE_TYPES.find(t => t.value === formData.type)?.label}
                  </Text>
                  {formData.description && (
                    <Text style={styles.previewDescription}>
                      {formData.description}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  header: {
    ...GlobalStyles.spaceBetween,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: 60, // Safe area
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  cancelButton: {
    padding: Spacing.xs,
  },
  
  cancelText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  
  saveButton: {
    padding: Spacing.xs,
  },
  
  saveButtonDisabled: {
    opacity: 0.5,
  },
  
  saveText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  
  saveTextDisabled: {
    color: Colors.textSecondary,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  
  section: {
    marginVertical: Spacing.lg,
  },
  
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  
  // Type Selection
  typeGrid: {
    gap: Spacing.md,
  },
  
  typeCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    ...GlobalStyles.shadow,
  },
  
  typeCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#3B82F610',
  },
  
  typeIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  
  typeLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  typeLabelSelected: {
    color: Colors.primary,
  },
  
  typeDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  
  typeDescriptionSelected: {
    color: Colors.primary,
  },
  
  // Color Selection
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  
  colorOptionSelected: {
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  colorCheckmark: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  
  // Preview
  previewCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    ...GlobalStyles.shadow,
  },
  
  previewContent: {
    ...GlobalStyles.row,
    padding: Spacing.md,
  },
  
  previewIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  
  previewText: {
    flex: 1,
  },
  
  previewName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  previewType: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  
  previewDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});