// src/screens/events/InviteContactsScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },

  // En-tête événement
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },

  eventImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#E9ECEF',
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },

  eventSubtitle: {
    fontSize: 14,
    color: '#6C757D',
  },

  // Filtres et actions
  filtersSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },

  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },

  filterChipText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },

  filterChipTextActive: {
    color: '#FFFFFF',
  },

  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },

  quickAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E9ECEF',
  },

  quickActionText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },

  // Liste des contacts
  contactsList: {
    flex: 1,
    paddingHorizontal: 16,
  },

  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },

  contactCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },

  contactCardSent: {
    borderColor: '#28A745',
    backgroundColor: '#F0FFF4',
    opacity: 0.7,
  },

  contactMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactAvatar: {
    position: 'relative',
    marginRight: 12,
  },

  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  avatarText: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 50,
    fontSize: 18,
    fontWeight: '600',
  },

  bobBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#28A745',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },

  bobBadgeText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },

  contactDetails: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 2,
  },

  contactHistory: {
    fontSize: 12,
    color: '#28A745',
    fontStyle: 'italic',
  },

  contactActions: {
    alignItems: 'center',
    gap: 8,
  },

  // Canal de communication
  channelSelector: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    minWidth: 60,
  },

  channelIcon: {
    fontSize: 20,
    marginBottom: 2,
  },

  channelLabel: {
    fontSize: 10,
    color: '#495057',
    fontWeight: '500',
  },

  // Statut de sélection
  contactStatus: {
    alignItems: 'center',
  },

  selectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  unselectedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    backgroundColor: '#FFFFFF',
  },

  sentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#28A745',
  },

  sentBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // État vide
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },

  emptyStateText: {
    fontSize: 18,
    color: '#6C757D',
    fontWeight: '500',
    marginBottom: 8,
  },

  emptyStateHint: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },

  // Barre du bas
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectionSummary: {
    flex: 1,
    marginRight: 16,
  },

  summaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },

  summaryDetails: {
    fontSize: 12,
    color: '#6C757D',
  },

  sendButton: {
    minWidth: 160,
    backgroundColor: '#007AFF',
  },

  sendButtonDisabled: {
    backgroundColor: '#ADB5BD',
  },
});