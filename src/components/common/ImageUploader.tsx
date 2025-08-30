// src/components/common/ImageUploader.tsx - Composant d'upload d'images
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { mediaService, MediaFile, ImagePickerOptions } from '../../services/media.service';
import { Colors } from '../../styles/tokens';

export interface ImageUploaderProps {
  onImagesUploaded?: (images: MediaFile[]) => void;
  onImagesChanged?: (images: MediaFile[]) => void;
  initialImages?: MediaFile[];
  maxImages?: number;
  disabled?: boolean;
  style?: any;
  imagePickerOptions?: ImagePickerOptions;
  showUploadButton?: boolean;
  uploadButtonText?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesUploaded,
  onImagesChanged,
  initialImages = [],
  maxImages = 5,
  disabled = false,
  style,
  imagePickerOptions = {},
  showUploadButton = true,
  uploadButtonText = "Ajouter des images",
  placeholder = "Aucune image ajoutée",
}) => {
  const [images, setImages] = useState<MediaFile[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const handleAddImages = () => {
    if (disabled || uploading) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limite atteinte', `Vous pouvez ajouter maximum ${maxImages} images.`);
      return;
    }

    // Afficher le choix entre appareil photo et galerie
    Alert.alert(
      'Ajouter des images',
      'Comment souhaitez-vous ajouter des images ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: '📷 Appareil photo', 
          onPress: () => handleTakePhoto() 
        },
        { 
          text: '🖼️ Galerie', 
          onPress: () => handlePickFromGallery() 
        },
      ]
    );
  };


  const handleTakePhoto = async () => {
    try {
      setUploading(true);

      // Prendre une photo avec l'appareil
      const result = await mediaService.takePhoto({
        allowsEditing: true,
        quality: 0.8,
        ...imagePickerOptions,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Uploader la photo
        const uploadedImages = await mediaService.uploadImagesFromPicker(result);
        
        if (uploadedImages.length > 0) {
          const newImages = [...images, ...uploadedImages].slice(0, maxImages);
          setImages(newImages);
          onImagesChanged?.(newImages);
          onImagesUploaded?.(uploadedImages);
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur photo:', error);
      Alert.alert(
        'Erreur appareil photo',
        error.message || 'Impossible de prendre la photo'
      );
    } finally {
      setUploading(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setUploading(true);

      const remainingSlots = maxImages - images.length;

      // Sélectionner depuis la galerie
      const result = await mediaService.pickImages({
        allowsMultipleSelection: remainingSlots > 1,
        quality: 0.8,
        ...imagePickerOptions,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Uploader les images
        const uploadedImages = await mediaService.uploadImagesFromPicker(result);
        
        if (uploadedImages.length > 0) {
          const newImages = [...images, ...uploadedImages].slice(0, maxImages);
          setImages(newImages);
          onImagesChanged?.(newImages);
          onImagesUploaded?.(uploadedImages);
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur galerie:', error);
      Alert.alert(
        'Erreur galerie',
        error.message || 'Impossible de sélectionner les images'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (imageToRemove: MediaFile) => {
    if (disabled) return;

    Alert.alert(
      'Supprimer l\'image',
      'Êtes-vous sûr de vouloir supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter(img => img.id !== imageToRemove.id);
            setImages(newImages);
            onImagesChanged?.(newImages);
            
            // Optionnellement, supprimer du serveur
            // mediaService.deleteFile(imageToRemove.id).catch(console.error);
          },
        },
      ]
    );
  };

  const renderImagePreview = (image: MediaFile, _index: number) => (
    <View key={image.id} style={styles.imageContainer}>
      <Image
        source={{ uri: image.url }}
        style={styles.imagePreview}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveImage(image)}
        disabled={disabled}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <View style={[styles.container, style]}>
      {/* Images existantes */}
      {images.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScrollView}
          contentContainerStyle={styles.imagesContainer}
        >
          {images.map(renderImagePreview)}
        </ScrollView>
      )}

      {/* Placeholder si aucune image */}
      {images.length === 0 && (
        <View style={styles.placeholderContainer}>
          <Text style={styles.placeholderText}>{placeholder}</Text>
        </View>
      )}

      {/* Bouton d'ajout */}
      {showUploadButton && canAddMore && (
        <TouchableOpacity
          style={[
            styles.uploadButton,
            disabled && styles.uploadButtonDisabled,
            uploading && styles.uploadButtonUploading,
          ]}
          onPress={handleAddImages}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={Colors.white} />
              <Text style={[styles.uploadButtonText, styles.uploadingText]}>
                Upload en cours...
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.uploadButtonIcon}>📷</Text>
              <Text style={styles.uploadButtonText}>
                {uploadButtonText} ({images.length}/{maxImages})
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Indicateur de limite atteinte */}
      {images.length >= maxImages && (
        <Text style={styles.limitReachedText}>
          Limite de {maxImages} images atteinte
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  imagesScrollView: {
    marginBottom: 12,
  },
  imagesContainer: {
    paddingHorizontal: 4,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.border,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  placeholderContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: 12,
  },
  placeholderText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontStyle: 'italic',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    minHeight: 48,
  },
  uploadButtonDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  uploadButtonUploading: {
    backgroundColor: '#3B82F6',
  },
  uploadButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadingText: {
    marginLeft: 8,
  },
  limitReachedText: {
    marginTop: 8,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ImageUploader;