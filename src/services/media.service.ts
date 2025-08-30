// src/services/media.service.ts - Service pour l'upload et gestion des médias
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import { apiClient, tokenStorage } from './api';
import { ErrorHandler, withErrorHandling } from '../utils/error-handler';
import { networkManager } from '../utils/network-manager';

export interface MediaFile {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadResult {
  success: boolean;
  files: MediaFile[];
  message?: string;
}

export interface ImagePickerOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

export interface CameraOptions extends ImagePickerOptions {
  allowsEditing?: boolean;
  quality?: number;
}

class MediaService {
  private uploadEndpoint = '/upload';

  // =================== PERMISSIONS ===================

  /**
   * Demander les permissions pour la caméra
   */
  async requestCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        return status === 'granted';
      }
      return true; // Web n'a pas besoin de permissions explicites
    } catch (error) {
      console.error('❌ Erreur permission caméra:', error);
      return false;
    }
  }

  /**
   * Demander les permissions pour la galerie
   */
  async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === 'granted';
      }
      return true;
    } catch (error) {
      console.error('❌ Erreur permission galerie:', error);
      return false;
    }
  }

  // =================== SÉLECTION D'IMAGES ===================

  /**
   * Ouvrir la caméra pour prendre une photo
   */
  async takePhoto(options: CameraOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    return withErrorHandling(async () => {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        throw new Error('Permission caméra refusée');
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect || [4, 3],
        quality: options.quality ?? 0.8,
      });

      console.log('📸 Photo prise:', result.canceled ? 'annulée' : 'succès');
      return result;
    }, 'prise de photo');
  }

  /**
   * Ouvrir la galerie pour sélectionner des images
   */
  async pickImages(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    return withErrorHandling(async () => {
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        throw new Error('Permission galerie refusée');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: options.mediaTypes || ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? false,
        aspect: options.aspect,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: options.allowsMultipleSelection ?? false,
      });

      console.log('🖼️ Images sélectionnées:', result.canceled ? 'annulée' : result.assets?.length || 0);
      return result;
    }, 'sélection d\'images');
  }

  /**
   * Afficher un sélecteur d'action (caméra ou galerie)
   */
  async showImagePicker(options: ImagePickerOptions = {}): Promise<ImagePicker.ImagePickerResult> {
    return new Promise((resolve) => {
      // Pour le web et les tests, on utilise directement la galerie
      if (Platform.OS === 'web') {
        this.pickImages(options).then(resolve);
        return;
      }

      // Pour mobile, on peut implémenter un ActionSheet
      // Pour l'instant, on utilise la galerie par défaut
      this.pickImages(options).then(resolve);
    });
  }

  // =================== UPLOAD ===================

  /**
   * Uploader un fichier vers Strapi
   */
  async uploadFile(fileUri: string, fileName?: string): Promise<MediaFile> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Token d\'authentification requis');

      // Créer FormData pour l'upload
      const formData = new FormData();
      
      const fileExtension = fileUri.split('.').pop()?.toLowerCase() || 'jpg';
      const finalFileName = fileName || `image_${Date.now()}.${fileExtension}`;

      // Déterminer le type MIME
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
      };

      const mimeType = mimeTypes[fileExtension] || 'image/jpeg';

      if (Platform.OS === 'web') {
        // Pour le web, on peut avoir un blob ou un file
        const response = await fetch(fileUri);
        const blob = await response.blob();
        formData.append('files', blob, finalFileName);
      } else {
        // Pour React Native
        formData.append('files', {
          uri: fileUri,
          type: mimeType,
          name: finalFileName,
        } as any);
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:1337/api'}${this.uploadEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Ne pas définir Content-Type, laissons le navigateur le faire avec boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      const uploadedFile = Array.isArray(result) ? result[0] : result;

      console.log('✅ Fichier uploadé:', uploadedFile.name);
      return uploadedFile;
    }, 'upload de fichier');
  }

  /**
   * Uploader plusieurs fichiers
   */
  async uploadMultipleFiles(fileUris: string[]): Promise<MediaFile[]> {
    return withErrorHandling(async () => {
      console.log(`📤 Upload de ${fileUris.length} fichiers...`);
      
      const uploadPromises = fileUris.map((uri, index) => 
        this.uploadFile(uri, `image_${Date.now()}_${index}.jpg`)
      );

      const results = await Promise.all(uploadPromises);
      console.log(`✅ ${results.length} fichiers uploadés avec succès`);
      return results;
    }, 'upload multiple de fichiers');
  }

  /**
   * Uploader des images depuis ImagePicker
   */
  async uploadImagesFromPicker(pickerResult: ImagePicker.ImagePickerResult): Promise<MediaFile[]> {
    return withErrorHandling(async () => {
      if (pickerResult.canceled || !pickerResult.assets) {
        throw new Error('Aucune image sélectionnée');
      }

      const fileUris = pickerResult.assets.map(asset => asset.uri);
      return this.uploadMultipleFiles(fileUris);
    }, 'upload d\'images depuis picker');
  }

  // =================== GESTION DES FICHIERS ===================

  /**
   * Récupérer les informations d'un fichier
   */
  async getFileInfo(fileId: number): Promise<MediaFile> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      
      const response = await networkManager.smartFetch(
        `${this.uploadEndpoint}/files/${fileId}`,
        {
          headers: token ? {
            'Authorization': `Bearer ${token}`,
          } : {},
          cache: true,
          cacheExpiry: 5 * 60 * 1000, // 5 minutes
          context: `info fichier ${fileId}`,
        }
      );

      return response;
    }, `récupération info fichier ${fileId}`);
  }

  /**
   * Supprimer un fichier
   */
  async deleteFile(fileId: number): Promise<void> {
    return withErrorHandling(async () => {
      const token = await tokenStorage.getToken();
      if (!token) throw new Error('Token d\'authentification requis');

      await networkManager.smartFetch(
        `${this.uploadEndpoint}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          cache: false,
          context: `suppression fichier ${fileId}`,
        }
      );

      console.log('🗑️ Fichier supprimé:', fileId);
    }, `suppression fichier ${fileId}`);
  }

  // =================== UTILITAIRES ===================

  /**
   * Redimensionner une image (côté client pour optimiser l'upload)
   */
  async resizeImage(uri: string, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<string> {
    try {
      // TODO: Installer expo-image-manipulator une fois les conflits de dépendances résolus
      // const { manipulateAsync, SaveFormat } = await import('expo-image-manipulator');
      // const result = await manipulateAsync(
      //   uri,
      //   [{ resize: { width: maxWidth, height: maxHeight } }],
      //   { compress: quality, format: SaveFormat.JPEG }
      // );
      // console.log('🔄 Image redimensionnée:', result.width, 'x', result.height);
      // return result.uri;
      
      console.warn('⚠️ Redimensionnement non disponible, utilisation de l\'image originale');
      return uri;
    } catch (error) {
      console.warn('⚠️ Redimensionnement non disponible, utilisation de l\'image originale');
      return uri;
    }
  }

  /**
   * Valider un fichier avant upload
   */
  validateFile(asset: ImagePicker.ImagePickerAsset): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10 MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (asset.fileSize && asset.fileSize > maxSize) {
      return { valid: false, error: 'Fichier trop volumineux (max 10 MB)' };
    }

    if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
      return { valid: false, error: 'Type de fichier non supporté' };
    }

    return { valid: true };
  }

  /**
   * Optimiser une image avant upload
   */
  async optimizeForUpload(asset: ImagePicker.ImagePickerAsset): Promise<string> {
    try {
      // Redimensionner si trop grande
      if (asset.width && asset.height && (asset.width > 1200 || asset.height > 1200)) {
        return this.resizeImage(asset.uri, 1200, 1200, 0.8);
      }

      return asset.uri;
    } catch (error) {
      console.warn('⚠️ Optimisation impossible:', error);
      return asset.uri;
    }
  }

  /**
   * Workflow complet : sélection + optimisation + upload
   */
  async selectAndUploadImages(options: ImagePickerOptions = {}): Promise<MediaFile[]> {
    return withErrorHandling(async () => {
      // 1. Sélectionner les images
      const pickerResult = await this.showImagePicker(options);
      
      if (pickerResult.canceled || !pickerResult.assets) {
        return [];
      }

      // 2. Valider et optimiser
      const validAssets: ImagePicker.ImagePickerAsset[] = [];
      
      for (const asset of pickerResult.assets) {
        const validation = this.validateFile(asset);
        if (!validation.valid) {
          console.warn('❌ Fichier invalide:', validation.error);
          continue;
        }
        validAssets.push(asset);
      }

      if (validAssets.length === 0) {
        throw new Error('Aucun fichier valide sélectionné');
      }

      // 3. Optimiser les images
      const optimizedUris: string[] = [];
      for (const asset of validAssets) {
        const optimizedUri = await this.optimizeForUpload(asset);
        optimizedUris.push(optimizedUri);
      }

      // 4. Uploader
      const uploadedFiles = await this.uploadMultipleFiles(optimizedUris);
      
      console.log(`🎉 ${uploadedFiles.length} images uploadées avec succès !`);
      return uploadedFiles;
    }, 'workflow complet sélection et upload');
  }
}

export const mediaService = new MediaService();