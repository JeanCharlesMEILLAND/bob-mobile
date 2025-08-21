// src/screens/exchanges/ExchangeChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView,
  Platform,
  Alert 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Header } from '../../components/common';
import { styles } from './ExchangeChatScreen.styles';

interface Message {
  id: string;
  contenu: string;
  dateEnvoi: string;
  expediteur: {
    id: string;
    username: string;
  };
  statut: 'envoye' | 'lu';
  type?: 'text' | 'system' | 'location';
}

interface ExchangeChatProps {
  exchangeId: string;
  exchangeTitle: string;
  otherUser: {
    id: string;
    username: string;
  };
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isConsecutive: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn, isConsecutive }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (message.type === 'system') {
    return (
      <View style={styles.systemMessage}>
        <Text style={styles.systemMessageText}>{message.contenu}</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.messageContainer,
      isOwn ? styles.messageContainerOwn : styles.messageContainerOther
    ]}>
      {!isConsecutive && !isOwn && (
        <Text style={styles.senderName}>{message.expediteur.username}</Text>
      )}
      
      <View style={[
        styles.messageBubble,
        isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
        isConsecutive && styles.messageBubbleConsecutive
      ]}>
        <Text style={[
          styles.messageText,
          isOwn ? styles.messageTextOwn : styles.messageTextOther
        ]}>
          {message.contenu}
        </Text>
      </View>
      
      <View style={[
        styles.messageInfo,
        isOwn ? styles.messageInfoOwn : styles.messageInfoOther
      ]}>
        <Text style={styles.messageTime}>
          {formatTime(message.dateEnvoi)}
        </Text>
        {isOwn && (
          <Text style={[
            styles.messageStatus,
            message.statut === 'lu' ? styles.messageStatusRead : styles.messageStatusSent
          ]}>
            {message.statut === 'lu' ? '✓✓' : '✓'}
          </Text>
        )}
      </View>
    </View>
  );
};

export const ExchangeChatScreen: React.FC<ExchangeChatProps> = ({
  exchangeId,
  exchangeTitle,
  otherUser
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    
    // TODO: Setup WebSocket ou polling pour les nouveaux messages
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [exchangeId]);

  useEffect(() => {
    // Scroll vers le bas quand nouveaux messages
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      // TODO: Appel API réel pour charger les messages
      console.log('💬 Chargement messages pour échange:', exchangeId);
      
      // Mock data
      const mockMessages: Message[] = [
        {
          id: '1',
          contenu: `Nouveau chat créé pour "${exchangeTitle}"`,
          dateEnvoi: new Date(Date.now() - 3600000).toISOString(),
          expediteur: { id: 'system', username: 'Système' },
          statut: 'lu',
          type: 'system'
        },
        {
          id: '2',
          contenu: 'Salut ! Je suis intéressé par votre annonce. Est-ce que c\'est toujours disponible ?',
          dateEnvoi: new Date(Date.now() - 1800000).toISOString(),
          expediteur: otherUser,
          statut: 'lu'
        },
        {
          id: '3',
          contenu: 'Bonjour ! Oui c\'est toujours disponible. Vous en auriez besoin pour quand ?',
          dateEnvoi: new Date(Date.now() - 900000).toISOString(),
          expediteur: { id: user?.id || '', username: user?.username || '' },
          statut: 'lu'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
    }
  };

  const sendMessage = async () => {
    const trimmedText = messageText.trim();
    if (!trimmedText || sending) return;

    setSending(true);
    const tempId = Date.now().toString();

    // Optimistic update
    const newMessage: Message = {
      id: tempId,
      contenu: trimmedText,
      dateEnvoi: new Date().toISOString(),
      expediteur: { id: user?.id || '', username: user?.username || '' },
      statut: 'envoye'
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageText('');

    try {
      // TODO: Appel API réel pour envoyer le message
      console.log('📤 Envoi message:', {
        exchangeId,
        contenu: trimmedText,
        destinataire: otherUser.id
      });

      // Simulation délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, id: `real_${tempId}`, statut: 'lu' as const }
            : msg
        )
      );
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Retirer le message en cas d'erreur
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      setMessageText(trimmedText); // Restore text
      Alert.alert('Erreur', 'Impossible d\'envoyer le message');
    } finally {
      setSending(false);
    }
  };

  const handleQuickAction = (action: 'accept' | 'propose_meeting' | 'share_location') => {
    switch (action) {
      case 'accept':
        setMessageText('C\'est d\'accord ! Quand est-ce que vous pouvez passer ?');
        break;
      case 'propose_meeting':
        setMessageText('On peut se voir demain après-midi si ça vous convient ?');
        break;
      case 'share_location':
        // TODO: Implémenter partage de localisation
        Alert.alert('Info', 'Fonctionnalité à venir');
        break;
    }
  };

  const isConsecutiveMessage = (index: number): boolean => {
    if (index === 0) return false;
    const current = messages[index];
    const previous = messages[index - 1];
    
    return current.expediteur.id === previous.expediteur.id &&
           current.type !== 'system' &&
           previous.type !== 'system';
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwn = item.expediteur.id === user?.id;
    const isConsecutive = isConsecutiveMessage(index);
    
    return (
      <MessageBubble 
        message={item}
        isOwn={isOwn}
        isConsecutive={isConsecutive}
      />
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header 
        title={`Chat avec ${otherUser.username}`}
        subtitle={exchangeTitle}
      />
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('accept')}
        >
          <Text style={styles.quickActionText}>✅ Accepter</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('propose_meeting')}
        >
          <Text style={styles.quickActionText}>📅 RDV</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => handleQuickAction('share_location')}
        >
          <Text style={styles.quickActionText}>📍 Position</Text>
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input Bar */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Tapez votre message..."
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
          editable={!sending}
        />
        
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!messageText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={!messageText.trim() || sending}
        >
          <Text style={styles.sendButtonText}>
            {sending ? '⏳' : '📤'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};