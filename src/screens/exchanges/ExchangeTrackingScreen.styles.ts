// src/screens/exchanges/ExchangeTrackingScreen.styles.ts
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Exchange Header
  exchangeHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  exchangeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 6,
  },

  exchangeWith: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },

  exchangeStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  statusBadgeActive: {
    backgroundColor: '#FFFBEB',
  },

  statusBadgeInProgress: {
    backgroundColor: '#EBF8FF',
  },

  statusBadgeCompleted: {
    backgroundColor: '#ECFDF5',
  },

  statusBadgeCancelled: {
    backgroundColor: '#FEF2F2',
  },

  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  timeRemaining: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },

  // Sections
  progressSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  actionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  // Progress Tracking
  trackingContainer: {
    paddingLeft: 8,
  },

  trackingStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },

  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },

  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  stepCircleActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  stepCircleCompleted: {
    borderColor: '#10B981',
    backgroundColor: '#10B981',
  },

  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },

  stepNumberActive: {
    color: '#3B82F6',
  },

  stepCheck: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },

  stepLineCompleted: {
    backgroundColor: '#10B981',
  },

  stepContent: {
    flex: 1,
    paddingTop: 4,
  },

  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },

  stepTitleActive: {
    color: '#3B82F6',
  },

  stepTitleCompleted: {
    color: '#10B981',
  },

  stepDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 6,
    lineHeight: 18,
  },

  stepDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 8,
  },

  stepAction: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },

  stepActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Details
  detailCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  detailDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },

  detailItem: {
    marginBottom: 8,
  },

  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },

  detailValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '500',
  },

  // Actions
  actionsList: {
    gap: 12,
  },

  actionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionButtonDanger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#F87171',
  },

  actionButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    textAlign: 'center',
  },

  actionButtonTextDanger: {
    color: '#DC2626',
  },

  // Success
  successSection: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },

  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: 14,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 20,
  },
});