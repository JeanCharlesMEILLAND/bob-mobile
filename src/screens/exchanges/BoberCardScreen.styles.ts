// src/screens/exchanges/BoberCardScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },

  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },

  shareButton: {
    fontSize: 20,
    padding: 4,
  },

  content: {
    flex: 1,
  },

  // En-tête du Bober
  boberHeader: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  boberTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  boberTypeIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  boberTypeInfo: {
    flex: 1,
  },

  boberTypeLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },

  boberAction: {
    fontSize: 14,
    color: '#6B7280',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  statusIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  statusLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Contenu principal
  boberContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  boberTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  boberDescription: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },

  categoryContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },

  categoryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Sections
  conditionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  conditionsText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },

  durationSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  durationLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  locationSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  locationText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },

  distanceText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Participants
  participantsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  participantAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },

  participantInfo: {
    flex: 1,
  },

  participantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  participantRole: {
    fontSize: 12,
    color: '#6B7280',
  },

  participantStatus: {
    alignItems: 'center',
  },

  creatorBadge: {
    fontSize: 16,
  },

  // Actions
  actionsSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButton: {
    backgroundColor: '#10B981',
  },

  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  refuseButton: {
    backgroundColor: '#EF4444',
  },

  refuseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  chatButton: {
    backgroundColor: '#3B82F6',
  },

  chatButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  completeButton: {
    backgroundColor: '#8B5CF6',
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  qrButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  qrButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  // QR Code
  qrCodeSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  qrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
  },

  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },

  qrCodePlaceholder: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'monospace',
  },

  qrInstructions: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  closeQRButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },

  closeQRButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Informations système
  systemInfo: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },

  systemInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
});