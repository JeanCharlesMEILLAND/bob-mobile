// src/screens/events/CreateEventScreen.styles.ts
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
    marginBottom: 32,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },

  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Form Inputs
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

  dateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  dateInput: {
    flex: 1,
  },

  numberRow: {
    flexDirection: 'row',
    gap: 12,
  },

  numberInput: {
    flex: 1,
  },

  // Event Needs
  emptyNeeds: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },

  emptyNeedsText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyNeedsHint: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  needsList: {
    gap: 16,
  },

  needCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  needHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  needIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 4,
  },

  needInfo: {
    flex: 1,
  },

  needTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    borderWidth: 0,
    padding: 0,
    marginBottom: 8,
  },

  needDescription: {
    fontSize: 14,
    color: '#6B7280',
    borderWidth: 0,
    padding: 0,
  },

  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  needOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  optionLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 12,
    fontWeight: '500',
  },

  quantityInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },

  timingOptions: {
    flexDirection: 'row',
    gap: 8,
  },

  timingOption: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  timingOptionActive: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },

  timingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  timingTextActive: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  creatorPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  checkboxActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },

  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  creatorPositionText: {
    fontSize: 14,
    color: '#374151',
  },

  // Add Need Modal
  addNeedModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  addNeedTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'center',
  },

  needTypesList: {
    gap: 12,
    marginBottom: 16,
  },

  needTypeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  needTypeIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  needTypeInfo: {
    flex: 1,
  },

  needTypeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  needTypeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },

  needTypeExample: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  cancelButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },

  // Targeting
  targetTypes: {
    gap: 12,
    marginBottom: 16,
  },

  targetType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },

  targetTypeActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  targetIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  targetLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  targetLabelActive: {
    color: '#1E40AF',
  },

  // Selection
  selectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  groupsList: {
    gap: 8,
  },

  contactsList: {
    gap: 8,
  },

  selectableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  selectableItemActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  selectableIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contactAvatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  selectableInfo: {
    flex: 1,
  },

  selectableName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 2,
  },

  selectableCount: {
    fontSize: 12,
    color: '#6B7280',
  },

  selectedCheck: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
  },

  targetSummary: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },

  targetSummaryText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Submit
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