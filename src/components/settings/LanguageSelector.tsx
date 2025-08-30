// src/components/settings/LanguageSelector.tsx - Sélecteur de langue pour BOB
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  FlatList, 
  SafeAreaView 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { changeLanguage, LANGUAGES, Language } from '../../i18n';

/**
 * Props du LanguageSelector
 */
interface LanguageSelectorProps {
  currentLanguage?: Language;
  onLanguageChange?: (language: Language) => void;
  showInModal?: boolean;
  style?: any;
}

/**
 * Composant de sélection de langue
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onLanguageChange,
  showInModal = true,
  style
}) => {
  const { t, i18n } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const currentLang = currentLanguage || (i18n.language as Language);
  const currentLanguageInfo = LANGUAGES.find(lang => lang.code === currentLang) || LANGUAGES[0];

  /**
   * Gérer le changement de langue
   */
  const handleLanguageChange = async (language: Language) => {
    try {
      await changeLanguage(language);
      onLanguageChange?.(language);
      setIsModalVisible(false);
      
      console.log(`🌐 [LANGUAGE] Langue changée vers: ${language}`);
    } catch (error) {
      console.error('❌ [LANGUAGE] Erreur changement langue:', error);
    }
  };

  /**
   * Rendu d'un élément de langue
   */
  const renderLanguageItem = ({ item }: { item: typeof LANGUAGES[0] }) => {
    const isSelected = item.code === currentLang;
    
    return (
      <TouchableOpacity
        style={[styles.languageItem, isSelected && styles.selectedLanguageItem]}
        onPress={() => handleLanguageChange(item.code)}
      >
        <View style={styles.languageContent}>
          <Text style={styles.languageFlag}>{item.flag}</Text>
          <View style={styles.languageText}>
            <Text style={[styles.languageName, isSelected && styles.selectedLanguageName]}>
              {item.name}
            </Text>
            <Text style={[styles.languageCode, isSelected && styles.selectedLanguageCode]}>
              {item.code.toUpperCase()}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <Feather name="check" size={20} color="#10b981" />
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Modal de sélection de langue
   */
  const LanguageModal = () => (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setIsModalVisible(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <Feather name="x" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('common.settings')} - Langue</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Liste des langues */}
        <FlatList
          data={LANGUAGES}
          renderItem={renderLanguageItem}
          keyExtractor={(item) => item.code}
          style={styles.languageList}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer avec info */}
        <View style={styles.modalFooter}>
          <Text style={styles.footerText}>
            🌐 La langue sera changée immédiatement pour toute l'application
          </Text>
        </View>
        
      </SafeAreaView>
    </Modal>
  );

  if (showInModal) {
    return (
      <View style={[styles.container, style]}>
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={() => setIsModalVisible(true)}
        >
          <View style={styles.selectorContent}>
            <Text style={styles.selectorFlag}>{currentLanguageInfo.flag}</Text>
            <View style={styles.selectorText}>
              <Text style={styles.selectorLabel}>Langue</Text>
              <Text style={styles.selectorValue}>{currentLanguageInfo.name}</Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color="#9ca3af" />
        </TouchableOpacity>
        
        <LanguageModal />
      </View>
    );
  }

  // Version inline (sans modal)
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.inlineTitle}>Langue / Language / Język</Text>
      <View style={styles.inlineLanguages}>
        {LANGUAGES.map((language) => {
          const isSelected = language.code === currentLang;
          
          return (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.inlineLanguageButton,
                isSelected && styles.selectedInlineLanguageButton
              ]}
              onPress={() => handleLanguageChange(language.code)}
            >
              <Text style={styles.inlineLanguageFlag}>{language.flag}</Text>
              <Text 
                style={[
                  styles.inlineLanguageText,
                  isSelected && styles.selectedInlineLanguageText
                ]}
              >
                {language.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    
  },
  
  // Styles pour version modal
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectorFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  selectorText: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Styles pour modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 32,
  },
  languageList: {
    flex: 1,
    padding: 20,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedLanguageItem: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: '#059669',
  },
  languageCode: {
    fontSize: 12,
    color: '#6b7280',
  },
  selectedLanguageCode: {
    color: '#10b981',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },

  // Styles pour version inline
  inlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  inlineLanguages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  inlineLanguageButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  selectedInlineLanguageButton: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  inlineLanguageFlag: {
    fontSize: 20,
    marginBottom: 4,
  },
  inlineLanguageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  selectedInlineLanguageText: {
    color: '#3b82f6',
  },
});

export default LanguageSelector;