// src/screens/main/ChatListScreen.tsx - Liste des contacts pour chat style WhatsApp
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useContacts } from '../../hooks/contacts/useContacts';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { styles } from './ChatListScreen.styles';

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

export const ChatListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  const { bobContacts: contacts, repertoireContacts: repertoire, loading: isLoading } = useContacts();
  
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
    
    // Ajouter quelques contacts de démo pour testing
    if (allContacts.length < 3) {
      const demoContacts: ContactForChat[] = [
        {
          id: 'demo_marie',
          name: 'Marie Dupont',
          username: 'marie_d',
          isOnline: false,
          lastActive: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          bobizPoints: 89,
          level: 'Débutant',
          phone: '+33687654321',
        },
        {
          id: 'demo_sophie',
          name: 'Sophie Bernard',
          username: 'sophie_b',
          isOnline: true,
          lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          bobizPoints: 310,
          level: 'Super Bob',
          phone: '+33611223344',
        },
        {
          id: 'demo_julien',
          name: 'Julien Moreau',
          username: 'julien_m',
          isOnline: false,
          lastActive: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          bobizPoints: 520,
          level: 'Légende',
          phone: '+33655443322',
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
    if (isOnline) return 'En ligne';
    
    const date = new Date(lastActive);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 5) return 'À l\'instant';
    if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} jour(s)`;
  };

  const getLevelEmoji = (level: string) => {
    switch (level) {
      case 'Légende': return '🏆';
      case 'Super Bob': return '⭐';
      case 'Ami fidèle': return '💫';
      default: return '🌱';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  const renderContactItem = ({ item }: { item: ContactForChat }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(item)}
      activeOpacity={0.7}
    >
      <View style={{ position: 'relative' }}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(item.name)}
          </Text>
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactSubtitle}>
          {getLastActiveText(item.lastActive, item.isOnline)}
        </Text>
      </View>
      
      <View style={styles.contactRight}>
        <View style={styles.bobizBadge}>
          <Text style={styles.bobizText}>
            {getLevelEmoji(item.level)} {item.bobizPoints}
          </Text>
        </View>
        <Text style={styles.lastActive}>
          {item.username && `@${item.username}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>Aucun contact disponible</Text>
      <Text style={styles.emptyDescription}>
        Ajoutez des contacts depuis l'onglet Contacts pour commencer à chatter avec votre réseau Bob !
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec recherche */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <View style={styles.searchContainer}>
          <Text style={{ fontSize: 16, color: '#9ca3af' }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un contact..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Liste des contacts */}
      <FlatList
        data={filteredContacts}
        renderItem={renderContactItem}
        keyExtractor={(item) => item.id}
        style={styles.contactsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
      />
      
      {/* Nom de l'écran pour debug */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
          💬 SCREEN: ChatListScreen.tsx
        </Text>
      </View>
    </SafeAreaView>
  );
};