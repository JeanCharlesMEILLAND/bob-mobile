// src/screens/events/components/BulkInvitationManager.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  // Bouton d'envoi principal
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },

  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6C757D',
    marginTop: 4,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeButtonText: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '600',
  },

  previewContent: {
    flex: 1,
  },

  // Statistiques
  statsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  statItem: {
    alignItems: 'center',
  },

  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#007AFF',
    marginBottom: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#6C757D',
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Canaux
  channelsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },

  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  channelIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },

  channelName: {
    flex: 1,
    fontSize: 16,
    color: '#495057',
    fontWeight: '500',
  },

  channelCount: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '700',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    textAlign: 'center',
  },

  // Message personnalisé
  messageSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },

  messageInput: {
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#495057',
    backgroundColor: '#FFFFFF',
    minHeight: 80,
  },

  messageHint: {
    fontSize: 12,
    color: '#6C757D',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Options
  optionsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },

  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  optionContent: {
    flex: 1,
  },

  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },

  optionDescription: {
    fontSize: 13,
    color: '#6C757D',
  },

  // Destinataires
  recipientsSection: {
    padding: 20,
  },

  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },

  recipientInfo: {
    flex: 1,
  },

  recipientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },

  recipientDetails: {
    fontSize: 12,
    color: '#6C757D',
  },

  recipientChannel: {
    alignItems: 'center',
    marginRight: 8,
  },

  recipientChannelIcon: {
    fontSize: 16,
    marginBottom: 2,
  },

  recipientChannelText: {
    fontSize: 10,
    color: '#6C757D',
    fontWeight: '600',
  },

  bobIndicator: {
    backgroundColor: '#28A745',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },

  bobIndicatorText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Actions du modal
  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#6C757D',
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  sendingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },

  sendingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});