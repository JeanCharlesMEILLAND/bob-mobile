// src/screens/exchanges/BobTestScenario.styles.ts
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
    marginBottom: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  // Scénario card
  scenarioCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  scenarioTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 12,
  },

  scenarioText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  bold: {
    fontWeight: '600',
    color: '#1F2937',
  },

  // Steps
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  stepNumber: {
    fontSize: 20,
    marginRight: 12,
    minWidth: 30,
  },

  stepContent: {
    flex: 1,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  stepDesc: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Buttons
  startButton: {
    backgroundColor: '#10B981',
    marginBottom: 16,
  },

  realCreateButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  realCreateButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  // Success view
  successCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 12,
  },

  successText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20,
    marginBottom: 8,
  },

  // Bob preview
  bobPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  bobSummary: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  bobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },

  bobStatus: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 4,
  },

  bobParticipant: {
    fontSize: 14,
    color: '#6B7280',
  },

  bobDetails: {
    gap: 12,
  },

  bobDesc: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },

  bobConditions: {
    fontSize: 14,
    color: '#374151',
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },

  bobLocation: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Action buttons
  actionButtons: {
    gap: 12,
  },

  viewButton: {
    backgroundColor: '#3B82F6',
  },

  switchButton: {
    backgroundColor: '#8B5CF6',
  },

  // Borrower view
  notificationCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#BFDBFE',
  },

  notifIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  notifTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },

  notifText: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },

  notifTime: {
    fontSize: 12,
    color: '#6B7280',
  },

  borrowerActions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },

  acceptButton: {
    backgroundColor: '#10B981',
  },

  refuseButton: {
    backgroundColor: '#EF4444',
  },

  // Active state
  activeActions: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },

  activeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#15803D',
    marginBottom: 8,
  },

  activeText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },

  chatButton: {
    backgroundColor: '#3B82F6',
    minWidth: 200,
  },

  completeButton: {
    backgroundColor: '#8B5CF6',
    minWidth: 200,
  },

  backButton: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 12,
  },

  backButtonText: {
    color: '#6B7280',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});