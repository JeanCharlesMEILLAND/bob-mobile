// src/screens/chat/ChatScreen.styles.ts - Styles pour l'écran de chat
import { StyleSheet, Platform, Dimensions } from 'react-native';
import { WebStyles } from '../../styles/web';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Conteneur principal
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      maxWidth: screenWidth > 768 ? '100%' : '100vw',
      alignSelf: 'center',
    }),
  },

  // Container de chargement
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },

  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },

  // Header actions
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerAction: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  headerActionIcon: {
    fontSize: 20,
  },

  // Container principal du chat
  chatContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    ...(Platform.OS === 'web' && {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    }),
  },

  // Liste des messages
  messagesList: {
    flex: 1,
    paddingVertical: 8,
    ...(Platform.OS === 'web' && {
      overflowY: 'auto',
      maxHeight: 'calc(100vh - 200px)',
    }),
  },

  messagesContainer: {
    paddingBottom: 16,
    paddingHorizontal: 8,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  // Zone de saisie
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    ...(Platform.OS === 'web' && {
      borderTopWidth: 1,
      borderTopColor: '#E9ECEF',
      backgroundColor: '#FFFFFF',
      position: 'sticky',
      bottom: 0,
      zIndex: 100,
    }),
  },

  // Container de réponse
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },

  replyContent: {
    flex: 1,
  },

  replyLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 2,
  },

  replyText: {
    fontSize: 13,
    color: '#424242',
  },

  replyCancel: {
    padding: 8,
  },

  replyCancelText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: 'bold',
  },

  // Ligne de saisie
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 48,
  },

  // Bouton emoji
  emojiButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  emojiButtonText: {
    fontSize: 18,
  },

  // Zone de texte
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    ...Platform.select({
      ios: {
        paddingTop: 8,
        paddingBottom: 8,
      },
      android: {
        textAlignVertical: 'top',
      },
      web: {
        outlineWidth: 0,
        resize: 'none',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      },
    }),
  },

  // Bouton d'envoi
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonActive: {
    backgroundColor: '#007AFF',
  },

  sendButtonInactive: {
    backgroundColor: '#E0E0E0',
  },

  sendButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // États responsifs pour web (simplifiés)
  ...(Platform.OS === 'web' && screenWidth > 1024 && {
    containerLarge: {
      maxWidth: 1200,
      marginHorizontal: 'auto',
    },
  }),
});

// Styles supplémentaires pour les animations
export const animationStyles = {
  messageSlideIn: {
    opacity: 0,
    transform: [{ translateY: 20 }],
  },
  messageSlideInActive: {
    opacity: 1,
    transform: [{ translateY: 0 }],
  },
  
  emojiPickerSlideUp: {
    transform: [{ translateY: 300 }],
  },
  emojiPickerSlideUpActive: {
    transform: [{ translateY: 0 }],
  },
};