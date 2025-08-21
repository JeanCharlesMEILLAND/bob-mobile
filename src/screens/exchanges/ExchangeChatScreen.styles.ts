// src/screens/exchanges/ExchangeChatScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  quickActionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  quickActionText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  // Messages List
  messagesList: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },

  // Messages
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },

  messageContainerOwn: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },

  messageContainerOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  senderName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    marginLeft: 12,
  },

  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },

  messageBubbleOwn: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },

  messageBubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  messageBubbleConsecutive: {
    marginTop: 2,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  messageTextOwn: {
    color: '#FFFFFF',
  },

  messageTextOther: {
    color: '#1F2937',
  },

  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  messageInfoOwn: {
    justifyContent: 'flex-end',
  },

  messageInfoOther: {
    justifyContent: 'flex-start',
  },

  messageTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  messageStatus: {
    fontSize: 11,
    marginLeft: 4,
  },

  messageStatusSent: {
    color: '#9CA3AF',
  },

  messageStatusRead: {
    color: '#3B82F6',
  },

  // System Messages
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
  },

  systemMessageText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },

  messageInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
  },

  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },

  sendButtonText: {
    fontSize: 16,
  },
});