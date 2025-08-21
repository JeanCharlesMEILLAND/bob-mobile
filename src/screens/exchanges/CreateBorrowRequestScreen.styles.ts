// src/screens/exchanges/CreateBorrowRequestScreen.styles.ts
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

  inputHint: {
    fontSize: 12,
    color: '#6B7280',
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

  // Photos
  photosContainer: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },

  photoItem: {
    position: 'relative',
  },

  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },

  photoRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  photoRemoveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },

  addPhotoText: {
    fontSize: 24,
    marginBottom: 4,
  },

  addPhotoLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  // Duration Selection
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  durationOption: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  durationOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  durationIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  durationLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },

  durationLabelSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  // Custom Duration
  customDurationContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },

  dateInputsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  dateInputGroup: {
    flex: 1,
  },

  dateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1F2937',
  },

  // Recipients
  recipientTypes: {
    gap: 12,
    marginBottom: 16,
  },

  recipientType: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  recipientTypeSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  recipientIcon: {
    fontSize: 24,
    marginRight: 12,
  },

  recipientLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  recipientLabelSelected: {
    color: '#1E40AF',
  },

  recipientCount: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Selection Containers
  selectionContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },

  selectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },

  // Groups List
  groupsList: {
    gap: 8,
  },

  groupItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  groupItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  groupIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  groupInfo: {
    flex: 1,
  },

  groupName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },

  groupNameSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  groupMembers: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Friends List
  friendsList: {
    gap: 8,
  },

  friendItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  friendItemSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },

  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  friendAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  friendInfo: {
    flex: 1,
  },

  friendName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },

  friendNameSelected: {
    color: '#1E40AF',
    fontWeight: '600',
  },

  friendGroup: {
    fontSize: 12,
    color: '#6B7280',
  },

  selectedIndicator: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: 'bold',
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