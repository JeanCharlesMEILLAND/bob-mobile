// src/components/common/LanguageSelector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, LANGUAGES, Language } from '../../i18n';

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  visible,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    i18n.language as Language
  );

  const handleLanguageSelect = async (languageCode: Language) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
    
    // Afficher un message de confirmation
    const languageName = LANGUAGES.find(l => l.code === languageCode)?.name;
    console.log(t('settings.languageChanged', { language: languageName }));
    
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.chooseLanguage')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.languageList}>
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                <Text style={styles.flag}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageName,
                    selectedLanguage === language.code && styles.selectedText,
                  ]}
                >
                  {language.name}
                </Text>
                {selectedLanguage === language.code && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
  },
  languageList: {
    padding: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#E3F2FD',
  },
  flag: {
    fontSize: 24,
    marginRight: 16,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: 'bold',
  },
});