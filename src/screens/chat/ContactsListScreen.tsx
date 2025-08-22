// src/screens/chat/ContactsListScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContactsBob } from '../../hooks/useContactsBob';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebLayout } from '../../components/web/WebLayout';
import { getWebStyle, WebColors, WebTypography, WebSpacing } from '../../styles/webDesign';

interface ContactForChat {
  id: string;
  name: string;
  username?: string;
  isOnline: boolean;
  lastActive: string;
  bobizPoints: number;
  level: string;
  phone: string;
  avatar?: string;
}

export const ContactsListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  const { contacts, repertoire, isLoading } = useContactsBob();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<ContactForChat[]>([]);

  useEffect(() => {
    // Combiner les contacts BOB et les contacts du répertoire
    const allContacts: ContactForChat[] = [];
    
    // Ajouter les contacts BOB (utilisateurs confirmés)
    contacts.forEach(contact => {
      allContacts.push({
        id: `bob_${contact.id}`,
        name: contact.prenom ? `${contact.prenom} ${contact.nom}` : contact.nom,
        username: contact.username,
        isOnline: contact.estEnLigne,
        lastActive: contact.derniereActivite,
        bobizPoints: contact.bobizPoints,
        level: contact.niveau,
        phone: contact.telephone,
        avatar: contact.avatar,
      });
    });
    
    // Ajouter les contacts du répertoire qui ont BOB
    repertoire
      .filter(contact => contact.aSurBob && !contacts.some(c => c.telephone === contact.telephone))
      .forEach(contact => {
        allContacts.push({
          id: `repertoire_${contact.id}`,
          name: contact.nom,
          isOnline: false,
          lastActive: new Date().toISOString(),
          bobizPoints: 0,
          level: 'Débutant',
          phone: contact.telephone,
        });
      });

    // 🆕 DEMO: Ajouter des contacts de démonstration si pas de contacts
    if (allContacts.length === 0) {
      const demoContacts: ContactForChat[] = [
        {
          id: 'demo_marie',
          name: 'Marie Dupont',
          username: 'marie_d',
          isOnline: true,
          lastActive: new Date().toISOString(),
          bobizPoints: 150,
          level: 'Ami fidèle',
          phone: '+33612345678',
        },
        {
          id: 'demo_pierre',
          name: 'Pierre Martin',
          username: 'pierre_m',
          isOnline: false,
          lastActive: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 min ago
          bobizPoints: 89,
          level: 'Débutant',
          phone: '+33687654321',
        },
        {
          id: 'demo_sophie',
          name: 'Sophie Bernard',
          username: 'sophie_b',
          isOnline: true,
          lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min ago
          bobizPoints: 310,
          level: 'Super Bob',
          phone: '+33611223344',
        },
        {
          id: 'demo_julien',
          name: 'Julien Moreau',
          username: 'julien_m',
          isOnline: false,
          lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
          bobizPoints: 520,
          level: 'Légende',
          phone: '+33655443322',
        },
        {
          id: 'demo_alice',
          name: 'Alice Rousseau',
          username: 'alice_r',
          isOnline: true,
          lastActive: new Date().toISOString(),
          bobizPoints: 75,
          level: 'Débutant',
          phone: '+33644556677',
        },
      ];
      
      allContacts.push(...demoContacts);
    }

    // Filtrer par recherche
    const filtered = searchQuery.trim() === '' 
      ? allContacts 
      : allContacts.filter(contact => 
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (contact.username && contact.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );

    setFilteredContacts(filtered.sort((a, b) => a.name.localeCompare(b.name)));
  }, [contacts, repertoire, searchQuery]);

  const handleContactPress = (contact: ContactForChat) => {
    console.log('🧭 Ouverture chat avec:', contact.name);
    
    // Créer un ID de chat basé sur les IDs des participants
    const chatId = `chat_${contact.id}_${Date.now()}`;
    const chatTitle = `Chat avec ${contact.name}`;
    
    navigation.navigate('Chat', {
      chatId,
      chatTitle,
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      isOnline: contact.isOnline,
    });
  };

  const getLastActiveText = (lastActive: string, isOnline: boolean) => {
    if (isOnline) return t('contacts.online');
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return t('contacts.justNow');
    if (diffMinutes < 60) return t('contacts.minutesAgo', { minutes: diffMinutes });
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return t('contacts.hoursAgo', { hours: diffHours });
    
    const diffDays = Math.floor(diffHours / 24);
    return t('contacts.daysAgo', { days: diffDays });
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Légende': return '🏆';
      case 'Super Bob': return '⭐';
      case 'Ami fidèle': return '💫';
      default: return '🌱';
    }
  };

  const renderContactItem = ({ item }: { item: ContactForChat }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.contactInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.contactName}>{item.name}</Text>
          {item.username && (
            <Text style={styles.username}>@{item.username}</Text>
          )}
        </View>
        
        <View style={styles.detailsRow}>
          <Text style={styles.lastActive}>
            {getLastActiveText(item.lastActive, item.isOnline)}
          </Text>
          <View style={styles.levelContainer}>
            <Text style={styles.levelEmoji}>{getLevelEmoji(item.level)}</Text>
            <Text style={styles.bobizPoints}>{item.bobizPoints} Bobiz</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.chevron}>
        <Text style={styles.chevronText}>💬</Text>
      </View>
    </TouchableOpacity>
  );

  const styles = {
    container: {
      ...getWebStyle({
        flex: 1,
        backgroundColor: WebColors.background,
      }),
    },

    searchContainer: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        padding: WebSpacing.lg,
        borderBottom: `1px solid ${WebColors.border}`,
      }),
    },

    searchInput: {
      ...getWebStyle({
        backgroundColor: WebColors.gray50,
        padding: WebSpacing.md,
        borderRadius: WebSpacing.md,
        fontSize: WebTypography.fontSize.base,
        color: WebColors.gray900,
        border: `1px solid ${WebColors.border}`,
      }),
    },

    header: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        padding: WebSpacing.lg,
        borderBottom: `1px solid ${WebColors.border}`,
      }),
    },

    headerText: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xl,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray900,
        marginBottom: WebSpacing.xs,
      }),
    },

    subtitle: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        color: WebColors.gray500,
      }),
    },

    contactItem: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        padding: WebSpacing.lg,
        backgroundColor: WebColors.white,
        borderBottom: `1px solid ${WebColors.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
      }),
    },

    avatarContainer: {
      ...getWebStyle({
        position: 'relative' as const,
        marginRight: WebSpacing.md,
      }),
    },

    avatar: {
      ...getWebStyle({
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: WebColors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }),
    },

    avatarText: {
      ...getWebStyle({
        color: WebColors.white,
        fontSize: WebTypography.fontSize.lg,
        fontWeight: WebTypography.fontWeight.semibold,
      }),
    },

    onlineIndicator: {
      ...getWebStyle({
        position: 'absolute' as const,
        bottom: 0,
        right: 0,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: WebColors.success,
        border: `2px solid ${WebColors.white}`,
      }),
    },

    contactInfo: {
      ...getWebStyle({
        flex: 1,
        justifyContent: 'center',
      }),
    },

    nameRow: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        marginBottom: WebSpacing.xs,
      }),
    },

    contactName: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.base,
        fontWeight: WebTypography.fontWeight.medium,
        color: WebColors.gray900,
        marginRight: WebSpacing.sm,
      }),
    },

    username: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        color: WebColors.gray500,
      }),
    },

    detailsRow: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
      }),
    },

    lastActive: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        color: WebColors.gray500,
      }),
    },

    levelContainer: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
      }),
    },

    levelEmoji: {
      ...getWebStyle({
        fontSize: 14,
        marginRight: 4,
      }),
    },

    bobizPoints: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xs,
        color: WebColors.primary,
        fontWeight: WebTypography.fontWeight.medium,
      }),
    },

    chevron: {
      ...getWebStyle({
        marginLeft: WebSpacing.md,
      }),
    },

    chevronText: {
      ...getWebStyle({
        fontSize: 20,
      }),
    },

    emptyState: {
      ...getWebStyle({
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: WebSpacing.xl,
      }),
    },

    emptyStateText: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.lg,
        color: WebColors.gray500,
        textAlign: 'center' as const,
        marginTop: WebSpacing.lg,
      }),
    },

    loadingText: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.base,
        color: WebColors.gray500,
        textAlign: 'center' as const,
        padding: WebSpacing.xl,
      }),
    },
  };

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          💬 {t('contacts.selectForChat')}
        </Text>
        <Text style={styles.subtitle}>
          {filteredContacts.length} {t('contacts.available')}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('contacts.searchContacts')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={WebColors.gray400}
        />
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>{t('common.loading')}...</Text>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48 }}>👥</Text>
          <Text style={styles.emptyStateText}>
            {searchQuery ? t('contacts.noResults') : t('contacts.noContactsYet')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          renderItem={renderContactItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  // Si c'est sur web, wrapper avec WebLayout
  if (Platform.OS === 'web') {
    return (
      <WebLayout title={t('contacts.selectForChat')} activeScreen="Chat">
        {content}
      </WebLayout>
    );
  }

  return content;
};