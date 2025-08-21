// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Imports des traductions
import fr from './locales/fr.json';
import en from './locales/en.json';
import pl from './locales/pl.json';

const STORAGE_KEY = '@bob_language';

// Détection de la langue par défaut
const getDefaultLanguage = () => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  
  // Mapping des langues supportées
  switch (deviceLanguage) {
    case 'fr':
      return 'fr';
    case 'en':
      return 'en';
    case 'pl':
      return 'pl';
    default:
      return 'fr'; // Français par défaut
  }
};

// Plugin pour sauvegarder la langue sélectionnée
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
      } else {
        callback(getDefaultLanguage());
      }
    } catch (error) {
      console.error('Erreur détection langue:', error);
      callback(getDefaultLanguage());
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lng);
    } catch (error) {
      console.error('Erreur sauvegarde langue:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en },
      pl: { translation: pl },
    },
    fallbackLng: 'fr',
    debug: __DEV__,
    interpolation: {
      escapeValue: false, // React s'occupe de l'échappement
    },
    react: {
      useSuspense: false, // Important pour React Native
    },
  });

export default i18n;

// Fonction utilitaire pour changer de langue
export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    console.log(`🌐 Langue changée vers: ${language}`);
  } catch (error) {
    console.error('Erreur changement langue:', error);
  }
};

// Types pour TypeScript
export type Language = 'fr' | 'en' | 'pl';

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];