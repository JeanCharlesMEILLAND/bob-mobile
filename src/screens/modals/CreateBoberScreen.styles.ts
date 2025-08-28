// src/screens/exchanges/CreateExchangeEventScreen.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Indicateur d'étapes
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },

  stepDotActive: {
    backgroundColor: '#3B82F6',
  },

  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },

  stepLineActive: {
    backgroundColor: '#3B82F6',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },

  // Champs de saisie
  inputGroup: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
  },

  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },

  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },

  // Grille de catégories
  categoryGrid: {
    flexDirection: 'row',
    gap: 8,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  categoryChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },

  categoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  categoryLabelSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Modes de ciblage
  targetingModes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  targetingMode: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  targetingModeSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  targetingModeIcon: {
    fontSize: 20,
    marginRight: 8,
  },

  targetingModeInfo: {
    flex: 1,
  },

  targetingModeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },

  targetingModeTitleSelected: {
    color: '#1E40AF',
  },

  targetingModeDesc: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Liste de contacts
  contactsList: {
    marginBottom: 24,
  },

  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  contactItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contactAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  contactInfo: {
    flex: 1,
  },

  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  contactDetail: {
    fontSize: 12,
    color: '#6B7280',
  },

  contactCheck: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
  },

  // Section d'invitation
  inviteSection: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  inviteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },

  inviteRow: {
    flexDirection: 'row',
    gap: 8,
  },

  phoneInput: {
    flex: 1,
  },

  qrButton: {
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Résumé de confirmation
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  summaryType: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },

  summaryDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },

  summaryCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },

  summaryCategoryIcon: {
    fontSize: 14,
    marginRight: 4,
  },

  summaryCategoryText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },

  // Section destinataires
  recipientsSection: {
    marginBottom: 24,
  },

  recipientsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  recipientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  recipientAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },

  recipientInfo: {
    flex: 1,
  },

  recipientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  recipientStatus: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Section info
  infoSection: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },

  infoText: {
    fontSize: 13,
    color: '#3B82F6',
    lineHeight: 18,
  },

  // Section de soumission
  submitSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  submitButton: {
    width: '100%',
    paddingVertical: 16,
  },
});