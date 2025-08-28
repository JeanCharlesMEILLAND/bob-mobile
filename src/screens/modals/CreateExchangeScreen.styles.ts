// src/screens/exchanges/CreateExchangeScreen.styles.ts
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Type Selection
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  typeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  typeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
  },

  typeTitleSelected: {
    color: '#1E40AF',
  },

  typeDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },

  typeDescSelected: {
    color: '#3B82F6',
  },

  // Category Selection
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  categoryChipSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },

  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },

  categoryLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  categoryLabelSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Form Fields
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

  // Submit Section
  submitSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },

  submitButton: {
    width: '100%',
    paddingVertical: 16,
    marginBottom: 12,
  },

  submitNote: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // Contact Selection
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  toggleButton: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },

  toggleButtonText: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: '600',
  },

  contactSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  contactSummaryIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  contactSummaryText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },

  contactSelection: {
    marginTop: 8,
  },

  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    padding: 24,
  },

  emptyContacts: {
    alignItems: 'center',
    padding: 24,
  },

  emptyContactsIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  emptyContactsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  emptyContactsHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  contactsList: {
    gap: 8,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  contactItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  contactItemDisabled: {
    opacity: 0.6,
  },

  contactItemInvite: {
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },

  contactIcon: {
    fontSize: 16,
    marginRight: 12,
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

  // Section informative
  infoSection: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },

  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },

  infoText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
  },

  // Bouton de configuration
  configureButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 12,
    alignSelf: 'center',
  },

  configureButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Bouton d'annulation
  cancelButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  // Nouveaux styles pour la UX WhatsApp-style
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
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
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },

  stepLineActive: {
    backgroundColor: '#3B82F6',
  },

  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },

  // Étape 1: Recherche
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },

  searchIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
    minHeight: 60,
  },

  quickSuggestions: {
    marginBottom: 24,
  },

  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  suggestionChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  suggestionText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  typeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },

  typeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  typeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  typeButtonTextActive: {
    color: '#1F2937',
  },

  // Étape 2: Sélection
  queryDisplay: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  queryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },

  queryType: {
    fontSize: 14,
    color: '#3B82F6',
  },

  suggestionsSection: {
    marginBottom: 24,
  },

  suggestionsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  groupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  groupItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  groupIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  groupInfo: {
    flex: 1,
  },

  groupName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  groupDescription: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Étape 3: Affinage
  refineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },

  skipButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 8,
  },

  skipButtonText: {
    fontSize: 14,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },

  // Nouveaux styles pour l'interface de sélection du type
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  exchangeTypesGrid: {
    gap: 16,
    marginBottom: 32,
  },

  exchangeTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  exchangeTypeCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#FAFBFF',
  },

  exchangeTypeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  exchangeTypeIcon: {
    fontSize: 32,
    marginRight: 16,
  },

  exchangeTypeInfo: {
    flex: 1,
  },

  exchangeTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  exchangeTypeTitleSelected: {
    color: '#1E40AF',
  },

  exchangeTypeSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  exchangeTypeDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },

  exchangeTypeExamples: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },

  exchangeTypeExamplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  exchangeTypeExamplesText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  // Informations de ciblage
  exchangeTypeTargeting: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },

  exchangeTypeTargetingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 2,
  },

  exchangeTypeTargetingText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },

  // Section des fonctionnalités
  featuresSection: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  featuresSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
    marginBottom: 12,
  },

  featuresList: {
    gap: 6,
  },

  featureItem: {
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
});