// src/screens/exchanges/DataInjectionScreen.styles.ts
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

  section: {
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  sectionDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Bober Testeur
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  userAvatar: {
    fontSize: 40,
    marginRight: 16,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },

  userBio: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 12,
  },

  userStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  statItem: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  addUserButton: {
    backgroundColor: '#3B82F6',
  },

  // Preview des données
  previewSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },

  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },

  typeIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },

  typeLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 30,
    alignItems: 'center',
  },

  typeCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  injectButton: {
    flex: 1,
    backgroundColor: '#10B981',
  },

  cleanButton: {
    flex: 1,
    backgroundColor: '#EF4444',
  },

  // Status
  loadingSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
  },

  statusSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  statusText: {
    fontSize: 14,
    color: '#15803D',
    fontWeight: '500',
  },

  // Exemples
  examplesList: {
    gap: 12,
  },

  exampleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  exampleType: {
    fontSize: 16,
    marginRight: 8,
  },

  exampleCategory: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  exampleDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },

  exampleReward: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },

  moreText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  // Instructions
  instructionsSection: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },

  instructionsText: {
    fontSize: 14,
    color: '#3B82F6',
    lineHeight: 20,
  },

  bold: {
    fontWeight: '600',
  },
});