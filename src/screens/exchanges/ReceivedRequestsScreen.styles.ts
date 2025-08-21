// src/screens/exchanges/ReceivedRequestsScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  content: {
    flex: 1,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  tabActive: {
    backgroundColor: '#EBF8FF',
  },

  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  tabTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Requests List
  requestsList: {
    flex: 1,
  },

  requestsContainer: {
    padding: 16,
    gap: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },

  // Request Card
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  userDetails: {
    flex: 1,
  },

  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  requestDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  requestStatus: {
    alignItems: 'flex-end',
    gap: 4,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Request Content
  requestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  requestDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },

  // Photos
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },

  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  morePhotos: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  morePhotosText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Request Meta
  requestMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  requestInfo: {
    flex: 1,
  },

  requestDuration: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 4,
  },

  requestBobiz: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },

  // Actions
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  declineButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  acceptButton: {
    backgroundColor: '#10B981',
  },

  declineButtonText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  acceptButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Tips Card
  tipsCard: {
    backgroundColor: '#F0F9FF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },

  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },

  tipsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
});