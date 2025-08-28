// src/components/common/EventInvitationCard.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },

  // Header invitation
  invitationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E3F2FD',
  },

  inviterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  inviterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },

  inviterAvatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  inviterAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  inviterDetails: {
    flex: 1,
  },

  inviterName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  invitationText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },

  invitationBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  invitationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Carte événement
  eventCard: {
    backgroundColor: '#FFFFFF',
  },

  eventImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#F8F9FA',
  },

  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  eventImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
  },

  eventImageIcon: {
    fontSize: 64,
  },

  eventTypeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  eventTypeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Informations événement
  eventInfo: {
    padding: 20,
  },

  eventTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 32,
  },

  eventDescription: {
    fontSize: 16,
    color: '#4A5568',
    lineHeight: 24,
    marginBottom: 16,
  },

  eventDetails: {
    gap: 12,
  },

  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventDetailIcon: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },

  eventDetailText: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    fontWeight: '500',
  },

  eventStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  eventStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventStatIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  eventStatText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '600',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },

  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },

  loadingText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },

  declineButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },

  declineButtonText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },

  acceptButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },

  acceptButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Aperçu des besoins
  needsPreview: {
    padding: 20,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F7FAFC',
  },

  needsPreviewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 12,
  },

  needsPreviewList: {
    gap: 8,
  },

  needPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
  },

  needPreviewIcon: {
    fontSize: 16,
    marginRight: 8,
  },

  needPreviewText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
    flex: 1,
  },

  moreNeedsText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Call to action
  ctaContainer: {
    backgroundColor: '#F0F8FF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E3F2FD',
  },

  ctaText: {
    fontSize: 13,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});