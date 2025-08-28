// src/utils/ImageCache.tsx - Système de cache avancé pour les images
import React from 'react';
import { Image } from 'react-native';

export class ImageCache {
  private static preloadedImages: Map<string, boolean> = new Map();

  static async preloadImage(source: any): Promise<boolean> {
    try {
      const uri = Image.resolveAssetSource(source).uri;
      
      if (this.preloadedImages.get(uri)) {
        return true; // Already preloaded
      }

      await Image.prefetch(uri);
      this.preloadedImages.set(uri, true);
      return true;
    } catch (error) {
      console.warn('Failed to preload image:', error);
      return false;
    }
  }

  static async preloadMultipleImages(sources: any[]): Promise<void> {
    const promises = sources.map(source => this.preloadImage(source));
    await Promise.all(promises);
  }

  static isPreloaded(source: any): boolean {
    const uri = Image.resolveAssetSource(source).uri;
    return this.preloadedImages.get(uri) || false;
  }
}

// Hook pour le préchargement
export const useImagePreloader = (images: any[]) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    ImageCache.preloadMultipleImages(images).then(() => {
      setIsLoaded(true);
    });
  }, [images]);

  return isLoaded;
};