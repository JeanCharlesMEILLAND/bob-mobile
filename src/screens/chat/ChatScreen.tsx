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
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/common';
import { realtimeChatService, RealtimeChatMessage } from '../../services/realtime-chat.service';
import { socketService, useSocket } from '../../services/socket.service';
import { ChatMessage, ChatRoom, TypingIndicator } from '../../types/chat.types';
import { MessageBubble } from './components/MessageBubble';
import { EmojiPicker } from './components/EmojiPicker';
import { TypingIndicatorComponent } from './components/TypingIndicator';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';
import { styles } from './ChatScreen.styles';
import { mediaService, MediaFile } from '../../services/media.service';

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
  const navigation = useNavigation();
  
  const [messages, setMessages] = useState<RealtimeChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  // Hook Socket.io
  const { connected, socket } = useSocket();
  const [replyTo, setReplyTo] = useState<RealtimeChatMessage | null>(null);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadRealtimeChat();
    
    return () => {
      // Cleanup
      realtimeChatService.offNewMessage(chatId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chatId]);

  const loadRealtimeChat = async () => {
    try {
      setIsLoading(true);
      
      console.log('📱 Chargement conversation temps réel:', chatId);
      
      // Charger les messages de la conversation
      const chatMessages = await realtimeChatService.getConversationMessages(chatId);
      setMessages(chatMessages);
      
      // Écouter les nouveaux messages en temps réel
      realtimeChatService.onNewMessage(chatId, (newMessages) => {
        console.log('📨 Nouveaux messages reçus:', newMessages.length);
        setMessages(newMessages);
        
        // Marquer comme lus automatiquement
        if (user?.id && newMessages.length > 0) {
          const unreadMessageIds = newMessages
            .filter(msg => !msg.readBy[user.id.toString()] && msg.sender?.id !== user.id)
            .map(msg => msg.id);
          
          if (unreadMessageIds.length > 0) {
            realtimeChatService.markAsRead(chatId, unreadMessageIds);
          }
        }
      });
      
      setIsLoading(false);
      console.log('✅ Conversation temps réel chargée');
      
    } catch (error) {
      console.error('❌ Erreur chargement conversation temps réel:', error);
      setIsLoading(false);
    }
  };

  // Fonction d'envoi de message
  const sendMessage = async (attachments?: MediaFile[]) => {
    if ((!inputText.trim() && !attachments?.length) || !user?.id) {
      return;
    }

    console.log('📤 Envoi message temps réel:', inputText.substring(0, 50) + '...');
    
    try {
      // Arrêter l'indicateur de saisie
      realtimeChatService.stopTyping(chatId);
      
      // Déterminer le type de message
      const messageType = attachments?.length ? 'media' : 'text';
      const content = inputText.trim() || (attachments?.length ? 'Image partagée' : '');
      
      // Envoyer le message via le service temps réel avec les pièces jointes
      await realtimeChatService.sendMessage(
        chatId, 
        content, 
        messageType,
        replyTo?.id,
        attachments
      );
      
      // Nettoyer l'input et la réponse
      setInputText('');
      setReplyTo(null);
      setShowEmojiPicker(false);
      
      // Scroller vers le bas
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error('❌ Erreur envoi message:', error);
      Alert.alert(
        'Erreur',
        'Impossible d\'envoyer le message. Vérifiez votre connexion.',
        [{ text: 'OK' }]
      );
    }
  };

  // Fonction pour ajouter des pièces jointes
  const handleAttachment = () => {
    if (uploadingAttachment) return;

    Alert.alert(
      'Ajouter une pièce jointe',
      'Comment souhaitez-vous ajouter une image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: '📷 Appareil photo', 
          onPress: () => handleTakePhoto() 
        },
        { 
          text: '🖼️ Galerie', 
          onPress: () => handlePickFromGallery() 
        },
      ]
    );
  };

  const handleTakePhoto = async () => {
    try {
      setUploadingAttachment(true);

      const result = await mediaService.takePhoto({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uploadedImages = await mediaService.uploadImagesFromPicker(result);
        
        if (uploadedImages.length > 0) {
          await sendMessage(uploadedImages);
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur photo:', error);
      Alert.alert(
        'Erreur appareil photo',
        error.message || 'Impossible de prendre la photo'
      );
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      setUploadingAttachment(true);

      const result = await mediaService.pickImages({
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uploadedImages = await mediaService.uploadImagesFromPicker(result);
        
        if (uploadedImages.length > 0) {
          await sendMessage(uploadedImages);
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur galerie:', error);
      Alert.alert(
        'Erreur galerie',
        error.message || 'Impossible de sélectionner les images'
      );
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Gestion de la saisie
  const handleTextChange = (text: string) => {
    setInputText(text);
    
    // Indicateur de saisie
    if (text.length > 0) {
      realtimeChatService.startTyping(chatId);
      
      // Arrêter l'indicateur après 3 secondes d'inactivité
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        realtimeChatService.stopTyping(chatId);
      }, 3000);
    } else {
      realtimeChatService.stopTyping(chatId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };



  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleReply = (message: RealtimeChatMessage) => {
    setReplyTo(message);
    setShowEmojiPicker(false);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user?.id) return;
    
    try {
      // TODO: Implémenter les réactions avec le service temps réel
      console.log('🎭 Réaction:', { messageId, emoji });
    } catch (error) {
      console.error('Erreur réaction:', error);
    }
  };

  const cancelReply = () => {
    setReplyTo(null);
  };

  const renderMessage = ({ item, index }: { item: RealtimeChatMessage, index: number }) => {
    const isOwn = item.sender?.id === user?.id;
    const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.sender?.id !== item.sender?.id);
    
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
    const title = chatTitle || contactName || 'Chat';
    const subtitle = contactName ? (isOnline ? t('contacts.online') : '') : '';

    return (
      <Header
        title={title}
        subtitle={subtitle}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
        rightComponent={() => (
          <View style={styles.headerActions}>
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

        {/* Bouton pièce jointe */}
        <TouchableOpacity
          style={[styles.attachmentButton, uploadingAttachment && styles.attachmentButtonDisabled]}
          onPress={handleAttachment}
          disabled={uploadingAttachment}
        >
          <Text style={styles.attachmentButtonText}>
            {uploadingAttachment ? '⏳' : '📎'}
          </Text>
        </TouchableOpacity>

        {/* Zone de texte */}
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder="Tapez votre message..."
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage()}
          blurOnSubmit={false}
        />

        {/* Bouton envoyer */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
          ]}
          onPress={() => sendMessage()}
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

  const isDesktop = isWebDesktop();

  return (
    <KeyboardAvoidingView
      style={[
        styles.container, 
        getWebStyle(WebStyles.container),
        isDesktop && { maxWidth: 1000, alignSelf: 'center', margin: '20px auto' }
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      enabled={Platform.OS !== 'web'}
    >
      {renderHeader()}

      <View style={[
        styles.chatContainer,
        isDesktop && {
          borderRadius: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          backgroundColor: '#FFFFFF',
          ...(Platform.OS === 'web' && { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' })
        }
      ]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContainer,
            isDesktop && { padding: 16 }
          ]}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
          onContentSizeChange={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }}
          onLayout={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 50);
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