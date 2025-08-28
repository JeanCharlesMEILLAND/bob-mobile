// src/screens/main/BobChatListScreen.tsx - Liste des conversations Bob par catégorie
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  ScrollView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { bobMessagingService } from '../../services/bob-messaging.service';
import { ConversationListItem, BobConversationType } from '../../types/bob-chat.types';
import { Colors } from '../../styles';

const TAB_ICONS = {
  pret: '🏠',
  service: '🔧', 
  evenement: '🎉',
  groupe_local: '👥'
};

const TAB_LABELS = {
  pret: 'Prêts',
  service: 'Services',
  evenement: 'Événements', 
  groupe_local: 'Groupes'
};

export const BobChatListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useSimpleNavigation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<BobConversationType>('pret');
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Charger les conversations au montage et changement d'onglet
  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id, activeTab]);

  const loadConversations = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const convs = await bobMessagingService.getConversationsByType(user.id, activeTab);
      setConversations(convs);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    setRefreshing(false);
  }, [user?.id, activeTab]);

  const handleConversationPress = (item: ConversationListItem) => {
    // Marquer les messages comme lus
    if (item.unreadCount > 0 && user?.id) {
      bobMessagingService.markMessagesAsRead(item.conversation.id, user.id);
    }

    // Naviguer vers le chat avec le contexte
    navigation.navigate('Chat', {
      conversationId: item.conversation.id,
      conversationType: item.conversation.type,
      chatTitle: item.conversation.titre,
      // Passer les données contextuelles
      ...(item.conversation.pretContext && { 
        pretData: item.conversation.pretContext 
      }),
      ...(item.conversation.serviceContext && { 
        serviceData: item.conversation.serviceContext 
      }),
      ...(item.conversation.evenementContext && { 
        evenementData: item.conversation.evenementContext 
      })
    });
  };

  const renderConversationItem = ({ item }: { item: ConversationListItem }) => {
    const { conversation } = item;
    
    // Calculer l'aperçu selon le contexte
    let subtitle = item.lastMessagePreview;
    let contextInfo = '';
    
    if (conversation.type === 'pret' && conversation.pretContext) {
      contextInfo = `📦 ${conversation.pretContext.objet} • ${conversation.pretContext.statut}`;
    } else if (conversation.type === 'evenement' && conversation.evenementContext) {
      contextInfo = `👥 ${conversation.evenementContext.participantsCount} participants`;
    } else if (conversation.type === 'service' && conversation.serviceContext) {
      contextInfo = `💼 ${conversation.serviceContext.service}`;
    }

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.conversationInfo}>
          {/* Header avec titre et badge non lu */}
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle} numberOfLines={1}>
              {conversation.titre}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>

          {/* Infos contextuelles */}
          {contextInfo ? (
            <Text style={styles.contextInfo} numberOfLines={1}>
              {contextInfo}
            </Text>
          ) : null}

          {/* Dernier message */}
          <Text style={styles.lastMessage} numberOfLines={1}>
            {subtitle}
          </Text>

          {/* Footer avec participants et statut en ligne */}
          <View style={styles.conversationFooter}>
            <Text style={styles.participantsCount}>
              👥 {conversation.participants.length} participant{conversation.participants.length > 1 ? 's' : ''}
            </Text>
            {item.isOnline && (
              <View style={styles.onlineIndicator}>
                <Text style={styles.onlineText}>● En ligne</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTabBar = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabContainer}
      contentContainerStyle={styles.tabContent}
    >
      {(Object.keys(TAB_ICONS) as BobConversationType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && styles.activeTab
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={styles.tabIcon}>{TAB_ICONS[tab]}</Text>
          <Text style={[
            styles.tabLabel,
            activeTab === tab && styles.activeTabLabel
          ]}>
            {TAB_LABELS[tab]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{TAB_ICONS[activeTab]}</Text>
      <Text style={styles.emptyTitle}>Aucune conversation</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'pret' && 'Vos conversations de prêts apparaîtront ici'}
        {activeTab === 'service' && 'Vos conversations de services apparaîtront ici'}
        {activeTab === 'evenement' && 'Vos conversations d\'événements apparaîtront ici'}
        {activeTab === 'groupe_local' && 'Vos groupes locaux apparaîtront ici'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Mes Conversations Bob</Text>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Liste des conversations */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.conversation.id}
        renderItem={renderConversationItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary || '#007AFF']}
            tintColor={Colors.primary || '#007AFF'}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : undefined}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },

  // Tabs
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeTabLabel: {
    color: '#fff',
  },

  // Conversations
  conversationItem: {
    backgroundColor: '#fff',
    marginVertical: 4,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contextInfo: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantsCount: {
    fontSize: 12,
    color: '#6c757d',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
  },
};