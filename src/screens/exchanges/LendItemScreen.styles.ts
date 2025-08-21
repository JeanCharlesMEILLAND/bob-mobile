// src/screens/exchanges/LendItemScreen.styles.ts
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
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

  // Section photos
  photosSection: {
    marginTop: 8,
  },

  addPhotoButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addPhotoIcon: {
    fontSize: 32,
    marginBottom: 8,
  },

  addPhotoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Grille de catégories
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

  // Grille des états
  conditionsGrid: {
    gap: 12,
  },

  conditionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  conditionCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  conditionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },

  conditionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },

  conditionLabelSelected: {
    color: '#1E40AF',
  },

  conditionDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Options de ciblage
  targetingOptions: {
    gap: 12,
    marginBottom: 24,
  },

  targetingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  targetingOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  targetingIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  targetingInfo: {
    flex: 1,
  },

  targetingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },

  targetingTitleSelected: {
    color: '#1E40AF',
  },

  targetingDesc: {
    fontSize: 13,
    color: '#6B7280',
  },

  targetingCheck: {
    fontSize: 18,
    color: '#10B981',
    fontWeight: 'bold',
  },

  // Section contacts
  contactsSection: {
    marginTop: 16,
  },

  contactsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
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

  // Section de soumission
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
});