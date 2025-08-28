// src/screens/events/components/InvitationTargetCard.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Carte principale
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  cardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
  },

  cardSent: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
    opacity: 0.8,
  },

  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },

  avatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },

  bobBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#28A745',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  bobBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '900',
  },

  levelBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FFD700',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  levelBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '900',
  },

  // Informations du contact
  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },

  contactPhone: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },

  contactGroup: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 4,
  },

  bobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },

  bobLevel: {
    fontSize: 12,
    color: '#28A745',
    fontWeight: '600',
  },

  bobPoints: {
    fontSize: 12,
    color: '#FFB000',
    fontWeight: '600',
  },

  historyInfo: {
    fontSize: 11,
    color: '#28A745',
    fontStyle: 'italic',
    marginTop: 2,
  },

  // Actions
  cardActions: {
    alignItems: 'center',
    gap: 8,
  },

  // Canal de communication
  channelButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },

  channelIcon: {
    fontSize: 18,
    marginBottom: 2,
  },

  channelText: {
    fontSize: 10,
    color: '#495057',
    fontWeight: '600',
    textAlign: 'center',
  },

  channelArrow: {
    fontSize: 8,
    color: '#ADB5BD',
    marginTop: 2,
  },

  // Message personnalisé
  customMessageIndicator: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#FFF3CD',
  },

  customMessageIcon: {
    fontSize: 14,
  },

  // Statut
  statusContainer: {
    alignItems: 'center',
  },

  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  unselectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
  },

  sentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#28A745',
  },

  sentText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Modal de sélection de canal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 20,
    maxHeight: '80%',
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 4,
  },

  modalSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },

  // Options de canal
  channelOptions: {
    paddingVertical: 12,
  },

  channelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },

  channelOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
  },

  channelOptionOptimal: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
  },

  channelOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#F8F9FA',
  },

  channelOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  channelOptionInfo: {
    flex: 1,
  },

  channelOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  channelOptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginRight: 8,
  },

  channelOptionLabelSelected: {
    color: '#007AFF',
  },

  channelOptionLabelDisabled: {
    color: '#6C757D',
  },

  optimalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: '#28A745',
  },

  optimalBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  channelOptionDescription: {
    fontSize: 13,
    color: '#6C757D',
  },

  channelOptionDescriptionDisabled: {
    color: '#ADB5BD',
  },

  // Actions du modal
  modalActions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },

  modalCancelButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#6C757D',
    alignItems: 'center',
  },

  modalCancelText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});