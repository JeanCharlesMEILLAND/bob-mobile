// src/screens/chat/BobChatScreen.tsx - Chat contextuel Bob
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { bobMessagingService } from '../../services/bob-messaging.service';
import { 
  BobConversation, 
  BobMessage, 
  BobConversationType,
  ChatScreenProps
} from '../../types/bob-chat.types';
import { Colors } from '../../styles';

export const BobChatScreen: React.FC<ChatScreenProps> = ({ 
  conversationId,
  conversationType,
  pretData,
  serviceData,
  evenementData
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  const [conversation, setConversation] = useState<BobConversation | null>(null);
  const [messages, setMessages] = useState<BobMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadConversationData();
  }, [conversationId]);

  const loadConversationData = async () => {
    try {
      setLoading(true);
      
      // Charger la conversation
      const conv = await bobMessagingService.getConversation(conversationId);
      if (conv) {
        setConversation(conv);
        
        // Marquer les messages comme lus
        if (user?.id) {
          await bobMessagingService.markMessagesAsRead(conversationId, String(user.id));
        }
      }
      
      // Charger les messages
      const msgs = await bobMessagingService.getMessages(conversationId);
      setMessages(msgs);
      
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
      Alert.alert('Erreur', 'Impossible de charger la conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending || !user?.id) return;
    
    const messageText = inputText.trim();
    setInputText('');
    setSending(true);
    
    try {
      const message = await bobMessagingService.sendMessage({
        conversationId,
        content: messageText,
        type: 'text'
      });
      
      if (message) {
        setMessages(prev => [...prev, message]);
        // Scroller vers le bas
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Remettre le texte en cas d'erreur
      setInputText(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: BobMessage }) => {
    const isMyMessage = item.senderId === String(user?.id);
    const isSystemMessage = item.type === 'system';
    
    if (isSystemMessage) {
      return (
        <View style={styles.systemMessage}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {new Date(item.timestamp).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderContextHeader = () => {
    if (!conversation) return null;
    
    switch (conversationType) {
      case 'pret':
        if (!conversation.pretContext) return null;
        const pret = conversation.pretContext;
        return (
          <View style={styles.contextHeader}>
            <Text style={styles.contextIcon}>🏠</Text>
            <View style={styles.contextInfo}>
              <Text style={styles.contextTitle}>Prêt: {pret.objet}</Text>
              <Text style={styles.contextSubtitle}>
                Durée: {pret.duree} • Retour: {new Date(pret.dateRetour).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={[styles.contextStatus, getStatusStyle(pret.statut)]}>
                {getStatusLabel(pret.statut)}
              </Text>
            </View>
          </View>
        );
        
      case 'evenement':
        if (!conversation.evenementContext) return null;
        const evenement = conversation.evenementContext;
        return (
          <View style={styles.contextHeader}>
            <Text style={styles.contextIcon}>🎉</Text>
            <View style={styles.contextInfo}>
              <Text style={styles.contextTitle}>{evenement.titre}</Text>
              <Text style={styles.contextSubtitle}>
                📅 {new Date(evenement.date).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.contextSubtitle}>
                👥 {evenement.participantsCount}/{evenement.maxParticipants} participants
              </Text>
            </View>
          </View>
        );
        
      case 'service':
        if (!conversation.serviceContext) return null;
        const service = conversation.serviceContext;
        return (
          <View style={styles.contextHeader}>
            <Text style={styles.contextIcon}>🔧</Text>
            <View style={styles.contextInfo}>
              <Text style={styles.contextTitle}>{service.service}</Text>
              <Text style={styles.contextSubtitle}>
                📍 {service.adresse}
              </Text>
              {service.prix && (
                <Text style={styles.contextSubtitle}>
                  💰 {service.prix}€
                </Text>
              )}
            </View>
          </View>
        );
        
      default:
        return null;
    }
  };

  const getStatusStyle = (statut: string) => {
    switch (statut) {
      case 'accepte':
      case 'confirme': 
        return { color: '#28a745' };
      case 'en_cours':
        return { color: '#007AFF' };
      case 'en_retard':
      case 'annule':
        return { color: '#dc3545' };
      default:
        return { color: '#6c757d' };
    }
  };

  const getStatusLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'demande': '🔄 Demande en attente',
      'accepte': '✅ Accepté',
      'en_cours': '🚀 En cours',
      'rendu': '🎯 Terminé',
      'en_retard': '⏰ En retard',
      'annule': '❌ Annulé'
    };
    return labels[statut] || statut;
  };

  const renderHeader = () => (
    <SafeAreaView style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversation?.titre || 'Chat'}
          </Text>
          <Text style={styles.headerSubtitle}>
            👥 {conversation?.participants.length || 0} participant{(conversation?.participants.length || 0) > 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement du chat...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {renderContextHeader()}
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Écrivez votre message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '⏳' : '📤'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' as const,
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
  },

  // Header
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },

  // Context Header
  contextHeader: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
  },
  contextIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  contextInfo: {
    flex: 1,
  },
  contextTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#1a1a1a',
  },
  contextSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 2,
  },
  contextStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  // Messages
  messagesList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end' as const,
  },
  otherMessageContainer: {
    alignItems: 'flex-start' as const,
  },
  senderName: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1a1a1a',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#6c757d',
  },

  // System Messages
  systemMessage: {
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  systemMessageText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic' as const,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  // Input
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  inputRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    padding: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center' as const,
  },
  sendButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  sendButtonText: {
    fontSize: 18,
  },
};