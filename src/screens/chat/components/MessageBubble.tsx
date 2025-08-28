// src/screens/chat/components/MessageBubble.tsx - Bulle de message individuelle
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { ChatMessage } from '../../../types/chat.types';
import { WebStyles, getWebStyle } from '../../../styles/web';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply: () => void;
  onReaction: (emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = false,
  onReply,
  onReaction
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleLongPress = () => {
    if (message.type === 'system') return;
    
    Alert.alert(
      'Actions',
      'Que voulez-vous faire ?',
      [
        { text: 'Répondre', onPress: onReply },
        { text: 'Réagir', onPress: () => setShowReactions(true) },
        { text: 'Annuler', style: 'cancel' }
      ]
    );
  };

  const handleReactionPress = (emoji: string) => {
    onReaction(emoji);
    setShowReactions(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    message.reactions?.forEach(reaction => {
      counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
    });
    return counts;
  };

  const styles = {
    container: {
      flexDirection: isOwn ? 'row-reverse' : 'row' as const,
      alignItems: 'flex-end',
      marginVertical: 2,
      paddingHorizontal: 12,
    },

    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#E5E5E5',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginHorizontal: 8,
    },

    avatarPlaceholder: {
      width: 32,
      marginHorizontal: 8,
    },

    avatarText: {
      fontSize: 12,
      fontWeight: 'bold' as const,
      color: '#666666',
    },

    messageContainer: {
      maxWidth: '75%',
      marginBottom: 4,
    },

    bubble: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: isOwn ? '#007AFF' : '#f0f0f0',
      marginBottom: 2,
    },

    systemBubble: {
      backgroundColor: '#FFF3CD',
      borderColor: '#FFEAA7',
      borderWidth: 1,
      alignSelf: 'center' as const,
      marginHorizontal: 20,
    },

    messageContent: {
      fontSize: 16,
      lineHeight: 20,
      color: isOwn ? '#FFFFFF' : '#000000',
    },

    systemMessageContent: {
      color: '#856404',
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
    },

    replyContainer: {
      backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      borderLeftWidth: 3,
      borderLeftColor: isOwn ? '#FFFFFF' : '#007AFF',
      paddingLeft: 8,
      paddingVertical: 4,
      marginBottom: 4,
      borderRadius: 4,
    },

    replyAuthor: {
      fontSize: 12,
      fontWeight: 'bold' as const,
      color: isOwn ? '#FFFFFF' : '#007AFF',
      marginBottom: 2,
    },

    replyText: {
      fontSize: 12,
      color: isOwn ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
    },

    messageInfo: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginTop: 2,
    },

    timestamp: {
      fontSize: 11,
      color: '#666666',
      marginHorizontal: 4,
    },

    readIndicator: {
      fontSize: 12,
      color: message.isRead ? '#007AFF' : '#999999',
    },

    reactionsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      marginTop: 4,
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
    },

    reactionBubble: {
      flexDirection: 'row' as const,
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginRight: 4,
      marginBottom: 2,
    },

    reactionEmoji: {
      fontSize: 12,
    },

    reactionCount: {
      fontSize: 10,
      fontWeight: 'bold' as const,
      color: '#666666',
      marginLeft: 2,
    },

    quickReactionsOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center' as const,
      alignItems: 'center',
      zIndex: 1000,
    },

    quickReactionsContainer: {
      flexDirection: 'row' as const,
      backgroundColor: '#FFFFFF',
      borderRadius: 25,
      paddingHorizontal: 8,
      paddingVertical: 8,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },

    quickReactionButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },

    quickReactionEmoji: {
      fontSize: 24,
    },
  };

  if (message.type === 'system') {
    return (
      <View style={[styles.container, { flexDirection: 'row', justifyContent: 'center' }]}>
        <View style={[styles.bubble, styles.systemBubble]}>
          <Text style={[styles.messageContent, styles.systemMessageContent]}>
            {message.content}
          </Text>
        </View>
      </View>
    );
  }

  const reactionCounts = getReactionCounts();

  return (
    <>
      <TouchableWithoutFeedback onLongPress={handleLongPress}>
        <View style={styles.container}>
          {/* Avatar */}
          {showAvatar && !isOwn ? (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {message.senderName.charAt(0).toUpperCase()}
              </Text>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}

          {/* Message */}
          <View style={styles.messageContainer}>
            <View style={styles.bubble}>
              {/* Réponse */}
              {message.replyTo && (
                <View style={styles.replyContainer}>
                  <Text style={styles.replyAuthor}>{message.replyTo.senderName}</Text>
                  <Text style={styles.replyText} numberOfLines={2}>
                    {message.replyTo.content}
                  </Text>
                </View>
              )}

              {/* Contenu du message */}
              <Text style={styles.messageContent}>{message.content}</Text>
            </View>

            {/* Réactions */}
            {Object.keys(reactionCounts).length > 0 && (
              <View style={styles.reactionsContainer}>
                {Object.entries(reactionCounts).map(([emoji, count]) => (
                  <TouchableOpacity
                    key={emoji}
                    style={styles.reactionBubble}
                    onPress={() => onReaction(emoji)}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                    <Text style={styles.reactionCount}>{count}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Informations du message */}
            <View style={styles.messageInfo}>
              <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
              {isOwn && (
                <Text style={styles.readIndicator}>
                  {message.isRead ? '✓✓' : '✓'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {/* Overlay des réactions rapides */}
      {showReactions && (
        <TouchableWithoutFeedback onPress={() => setShowReactions(false)}>
          <View style={styles.quickReactionsOverlay}>
            <View style={styles.quickReactionsContainer}>
              {QUICK_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.quickReactionButton}
                  onPress={() => handleReactionPress(emoji)}
                >
                  <Text style={styles.quickReactionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
};