// src/screens/chat/ChatScreen.tsx - Écran de conversation
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header } from '../../components/common';
import { chatService } from '../../services/chat.service';
import { ChatMessage, ChatRoom, TypingIndicator } from '../../types/chat.types';
import { MessageBubble } from './components/MessageBubble';
import { EmojiPicker } from './components/EmojiPicker';
import { TypingIndicatorComponent } from './components/TypingIndicator';
import { WebStyles, getWebStyle } from '../../styles/web';
import { styles } from './ChatScreen.styles';

interface ChatScreenProps {
  chatId: string;
  chatTitle?: string;
  contactId?: string;
  contactName?: string;
  contactPhone?: string;
  isOnline?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ 
  chatId, 
  chatTitle = 'Chat',
  contactId,
  contactName,
  contactPhone,
  isOnline 
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadChatData();
    subscribeToUpdates();
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les messages
      const chatMessages = await chatService.getMessages(chatId);
      setMessages(chatMessages);
      
      // Charger les infos de la room
      const rooms = await chatService.getChatRooms(user?.id || '');
      let currentRoom = rooms.find(r => r.id === chatId);
      
      // Si la room n'existe pas, la créer automatiquement
      if (!currentRoom && user?.id && contactName) {
        console.log('🆕 Création automatique de la room de chat:', chatId);
        currentRoom = {
          id: chatId,
          name: chatTitle || contactName,
          type: 'private' as const,
          participants: [
            {
              id: user.id,
              name: user.username || 'Moi',
              avatar: undefined,
              isOnline: true,
              lastSeen: new Date().toISOString(),
            },
            {
              id: contactId || 'contact',
              name: contactName,
              avatar: undefined,
              isOnline: isOnline || false,
              lastSeen: new Date().toISOString(),
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastMessage: undefined,
          unreadCount: 0,
          isActive: true,
        };
      }
      
      setRoom(currentRoom || null);
      
      // Marquer comme lu
      if (user?.id) {
        const unreadIds = chatMessages
          .filter(m => !m.isRead && m.senderId !== user.id)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await chatService.markAsRead(chatId, user.id, unreadIds);
        }
      }
      
      setIsLoading(false);
      
      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('Erreur chargement chat:', error);
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    // Écouter les nouveaux messages
    const unsubscribeMessages = chatService.subscribe(`messages_${chatId}`, (message: ChatMessage) => {
      setMessages(prev => {
        const exists = prev.find(m => m.id === message.id);
        if (exists) {
          // Mettre à jour le message existant (réactions, etc.)
          return prev.map(m => m.id === message.id ? message : m);
        } else {
          // Nouveau message
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
          return [...prev, message];
        }
      });
    });

    // Écouter les indicateurs de frappe
    const unsubscribeTyping = chatService.subscribe(`typing_${chatId}`, (indicators: TypingIndicator[]) => {
      setTypingUsers(indicators.filter(i => i.userId !== user?.id));
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
    };
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;

    try {
      const content = inputText.trim();
      const messageType = content.match(/^[\p{Emoji}\s]+$/u) ? 'emoji' : 'text';
      
      console.log('📤 Envoi message:', { chatId, senderId: user.id, content, type: messageType });
      
      // Créer le message localement d'abord pour un affichage immédiat
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random()}`,
        chatId,
        senderId: user.id,
        senderName: user.username || 'Moi',
        content,
        type: messageType,
        timestamp: new Date().toISOString(),
        isRead: false,
        reactions: [],
        replyTo: replyTo ? {
          messageId: replyTo.id,
          content: replyTo.content,
          senderName: replyTo.senderName
        } : undefined
      };
      
      // Ajouter le message à la liste localement
      setMessages(prev => [...prev, newMessage]);
      
      // Puis envoyer via le service (en arrière-plan)
      try {
        await chatService.sendMessage(
          chatId,
          user.id,
          content,
          messageType,
          replyTo ? {
            messageId: replyTo.id,
            content: replyTo.content,
            senderName: replyTo.senderName
          } : undefined
        );
        console.log('✅ Message envoyé avec succès');
      } catch (serviceError) {
        console.warn('⚠️ Service d\'envoi échoué, message gardé localement:', serviceError);
      }

      setInputText('');
      setReplyTo(null);
      setShowEmojiPicker(false);
      
      // Scroll vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Arrêter l'indicateur de frappe
      try {
        await chatService.setTyping(chatId, user.id, false);
      } catch (typingError) {
        console.warn('⚠️ Erreur indicateur frappe:', typingError);
      }
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    }
  };

  const handleInputChange = async (text: string) => {
    setInputText(text);
    
    if (!user?.id) return;
    
    // Indicateur de frappe
    if (text.trim()) {
      await chatService.setTyping(chatId, user.id, true);
      
      // Reset timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        chatService.setTyping(chatId, user.id, false);
      }, 1000);
    } else {
      await chatService.setTyping(chatId, user.id, false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleReply = (message: ChatMessage) => {
    setReplyTo(message);
    setShowEmojiPicker(false);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return;
    
    try {
      await chatService.addReaction(messageId, chatId, user.id, emoji);
    } catch (error) {
      console.error('Erreur réaction:', error);
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const renderMessage = ({ item, index }: { item: ChatMessage, index: number }) => {
    const isOwn = item.senderId === user?.id;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== item.senderId);
    
    return (
      <MessageBubble
        message={item}
        isOwn={isOwn}
        showAvatar={showAvatar}
        onReply={() => handleReply(item)}
        onReaction={(emoji) => handleReaction(item.id, emoji)}
      />
    );
  };

  const renderHeader = () => {
    const title = room?.name || chatTitle || contactName || 'Chat';
    const subtitle = room 
      ? room.type === 'bob' 
        ? `${room.bobTitle} • ${room.participants.filter(p => p.id !== user?.id).map(p => p.name).join(', ')}`
        : room.participants.filter(p => p.id !== user?.id).map(p => p.name).join(', ')
      : isOnline ? t('contacts.online') : '';

    return (
      <Header
        title={title}
        subtitle={subtitle}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={() => (
          <View style={styles.headerActions}>
            {room?.type === 'bob' && (
              <TouchableOpacity 
                style={styles.headerAction}
                onPress={() => {
                  // Navigation vers la fiche Bob
                  navigation.navigate('BoberCard', { boberId: room.bobId });
                }}
              >
                <Text style={styles.headerActionIcon}>📋</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.headerAction}
              onPress={() => {
                Alert.alert('Infos', 'Fonctionnalité en cours de développement');
              }}
            >
              <Text style={styles.headerActionIcon}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    );
  };

  const renderInputArea = () => (
    <View style={styles.inputContainer}>
      {/* Indicateur de réponse */}
      {replyTo && (
        <View style={styles.replyContainer}>
          <View style={styles.replyContent}>
            <Text style={styles.replyLabel}>Répondre à {replyTo.senderName}</Text>
            <Text style={styles.replyText} numberOfLines={1}>
              {replyTo.content}
            </Text>
          </View>
          <TouchableOpacity onPress={cancelReply} style={styles.replyCancel}>
            <Text style={styles.replyCancelText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Indicateur de frappe */}
      {typingUsers.length > 0 && (
        <TypingIndicatorComponent users={typingUsers} />
      )}

      <View style={styles.inputRow}>
        {/* Bouton emoji */}
        <TouchableOpacity
          style={styles.emojiButton}
          onPress={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Text style={styles.emojiButtonText}>
            {showEmojiPicker ? '⌨️' : '😀'}
          </Text>
        </TouchableOpacity>

        {/* Zone de texte */}
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Tapez votre message..."
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />

        {/* Bouton envoyer */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, WebStyles.container]}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, WebStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {renderHeader()}

      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
        />

        {/* Picker emoji */}
        {showEmojiPicker && (
          <EmojiPicker
            onSelect={handleEmojiSelect}
            onClose={() => setShowEmojiPicker(false)}
          />
        )}

        {renderInputArea()}
      </View>
    </KeyboardAvoidingView>
  );
};