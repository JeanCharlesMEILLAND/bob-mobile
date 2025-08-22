// src/screens/chat/components/EmojiPicker.tsx - Sélecteur d'emojis
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList
} from 'react-native';
import { EMOJI_CATEGORIES } from '../../../types/chat.types';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({
  onSelect,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchText, setSearchText] = useState('');

  // Filtrer les emojis selon la recherche
  const getFilteredEmojis = () => {
    if (!searchText.trim()) {
      return EMOJI_CATEGORIES[activeCategory].emojis;
    }

    const searchLower = searchText.toLowerCase();
    return EMOJI_CATEGORIES.flatMap(category => 
      category.emojis.filter(emoji => {
        // Recherche basique par nom de catégorie ou emoji communs
        const categoryName = category.name.toLowerCase();
        return categoryName.includes(searchLower) || 
               (searchLower === 'coeur' && emoji.includes('❤️')) ||
               (searchLower === 'rire' && emoji.includes('😂')) ||
               (searchLower === 'pouce' && emoji.includes('👍')) ||
               (searchLower === 'triste' && emoji.includes('😢'));
      })
    );
  };

  const handleEmojiPress = (emoji: string) => {
    onSelect(emoji);
  };

  const styles = {
    container: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      maxHeight: 300,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },

    header: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
    },

    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: '#333',
    },

    closeButton: {
      padding: 4,
    },

    closeButtonText: {
      fontSize: 20,
      color: '#666',
    },

    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    searchInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 16,
      backgroundColor: '#F5F5F5',
    },

    categoriesContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },

    categoriesScroll: {
      flexDirection: 'row' as const,
    },

    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      backgroundColor: '#F0F0F0',
    },

    categoryButtonActive: {
      backgroundColor: '#007AFF',
    },

    categoryText: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: '#666',
    },

    categoryTextActive: {
      color: '#FFFFFF',
    },

    emojisContainer: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },

    emojiGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'space-between',
    },

    emojiButton: {
      width: '12.5%',
      aspectRatio: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginBottom: 8,
      borderRadius: 8,
    },

    emojiButtonPressed: {
      backgroundColor: '#E0E0E0',
    },

    emoji: {
      fontSize: 24,
    },

    noResultsContainer: {
      alignItems: 'center' as const,
      paddingVertical: 20,
    },

    noResultsText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center' as const,
    },
  };

  const filteredEmojis = getFilteredEmojis();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emojis</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un emoji..."
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
      </View>

      {/* Catégories (masquées pendant la recherche) */}
      {!searchText.trim() && (
        <View style={styles.categoriesContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {EMOJI_CATEGORIES.map((category, index) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryButton,
                  activeCategory === index && styles.categoryButtonActive
                ]}
                onPress={() => setActiveCategory(index)}
              >
                <Text style={[
                  styles.categoryText,
                  activeCategory === index && styles.categoryTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Emojis */}
      <View style={styles.emojisContainer}>
        {filteredEmojis.length > 0 ? (
          <View style={styles.emojiGrid}>
            {filteredEmojis.map((emoji, index) => (
              <TouchableOpacity
                key={`${emoji}_${index}`}
                style={styles.emojiButton}
                onPress={() => handleEmojiPress(emoji)}
                activeOpacity={0.7}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>
              Aucun emoji trouvé{'\n'}
              Essayez "coeur", "rire", "pouce" ou "triste"
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};