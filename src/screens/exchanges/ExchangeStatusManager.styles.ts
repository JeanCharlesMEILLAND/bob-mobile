// src/screens/exchanges/ExchangeStatusManager.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  // Status Header
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Progress Steps
  stepsContainer: {
    paddingLeft: 8,
    marginBottom: 20,
  },

  step: {
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
  },

  // Actions
  actionsContainer: {
    gap: 12,
  },

  actionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  primaryButton: {
    backgroundColor: '#3B82F6',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  successButton: {
    backgroundColor: '#10B981',
  },

  successButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },

  dangerButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
  },

  dangerButtonText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
});