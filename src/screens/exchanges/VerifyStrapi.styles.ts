// src/screens/exchanges/VerifyStrapi.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  // Connection Status
  statusSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  statusGrid: {
    gap: 16,
  },

  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },

  statusIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },

  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    width: 80,
  },

  statusValue: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  // Loading
  loadingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },

  // Results
  resultSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  successIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  successContent: {
    flex: 1,
  },

  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 2,
  },

  successDesc: {
    fontSize: 13,
    color: '#166534',
  },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  errorContent: {
    flex: 1,
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 2,
  },

  errorDesc: {
    fontSize: 13,
    color: '#B91C1C',
  },

  // Last Created
  lastCreatedCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  lastCreatedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },

  exchangePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  exchangeTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  exchangeInfo: {
    flex: 1,
  },

  exchangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  exchangeType: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 2,
  },

  exchangeDate: {
    fontSize: 11,
    color: '#6B7280',
  },

  exchangeStatus: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  exchangeStatusText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Exchanges List
  exchangesList: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  exchangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },

  itemIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },

  itemContent: {
    flex: 1,
  },

  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  itemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },

  itemDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  moreItemsText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  refreshButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },

  testButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },

  // Info
  infoSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 12,
  },

  infoText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },

  bold: {
    fontWeight: '600',
  },
});