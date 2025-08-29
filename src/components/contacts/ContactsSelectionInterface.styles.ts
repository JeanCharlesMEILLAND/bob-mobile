// src/components/contacts/ContactsSelectionInterface.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingTop: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
  },
  headerContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    padding: Spacing.sm,
  },
  clearButtonText: {
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
  },
  searchClear: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  searchClearText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },

  // Filter tabs
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  filterTabActive: {
    backgroundColor: Colors.primary + '10',
  },
  filterTabText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  filterTabTextActive: {
    color: Colors.primary,
  },

  // Quick actions
  quickActions: {
    backgroundColor: '#F0F7FF',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  quickActionButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  quickActionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },

  // Contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  contactRowSelected: {
    backgroundColor: Colors.primary + '05',
  },
  contactRowDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7,
  },
  contactCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  contactCheckboxDisabled: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  contactCheckboxInvitation: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  alreadyInBob: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  invitationPending: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: Typography.weights.bold,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactAvatarSuggested: {
    backgroundColor: '#FFE0B2',
  },
  contactAvatarDisabled: {
    backgroundColor: '#E0E0E0',
  },
  contactAvatarInvitation: {
    backgroundColor: '#FFE0B2',
  },
  contactInitial: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  contactInitialDisabled: {
    color: '#666666',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  contactNameDisabled: {
    color: '#666666',
  },
  contactNumber: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactNumberDisabled: {
    color: '#666666',
  },
  contactSuggestion: {
    fontSize: Typography.sizes.xs,
    color: '#FF9800',
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  contactAlreadyInBob: {
    fontSize: Typography.sizes.xs,
    color: '#4CAF50',
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  contactInvitationPending: {
    fontSize: Typography.sizes.xs,
    color: '#FF9800',
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
  contactEmailBadge: {
    fontSize: 16,
    marginLeft: Spacing.sm,
  },

  // Empty list
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 50,
  },
  emptyListIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyListTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyListText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Floating button
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 60, // Juste milieu - ni trop haut ni trop bas
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: Spacing.md,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  floatingButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
  },
  floatingButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },

  // Lista de contacts
  contactsList: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 160, // Plus d'espace pour le bouton flottant
  },

  // Toggle section
  toggleSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary + '20',
  },
  toggleText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  toggleTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },

  // Status badges
  statusBadge: {
    fontSize: Typography.sizes.xs,
    color: '#666666',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  statusBadgeBob: {
    fontSize: Typography.sizes.xs,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  statusBadgeInvitation: {
    fontSize: Typography.sizes.xs,
    color: '#FF9800',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },

  // Disabled states (duplicate removed)
  contactTextDisabled: {
    color: '#666666',
  },
  contactBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Barre alphabétique
  alphabetContainer: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  alphabetRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
  },
  letterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    backgroundColor: 'transparent',
    minWidth: 30,
    alignItems: 'center',
  },
  letterButtonActive: {
    backgroundColor: Colors.primary,
  },
  letterButtonDisabled: {
    opacity: 0.3,
  },
  letterText: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    fontSize: 14,
  },
  letterTextActive: {
    color: Colors.white,
  },
  letterTextDisabled: {
    color: '#666666',
  },
  letterCount: {
    fontSize: 8,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  letterCountActive: {
    color: Colors.white,
  },
  letterFilterInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#BBDEFB',
  },
  letterFilterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  clearFilterText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },

  // Styles pour contacts déjà importés (supprimés pour éviter duplication)
  checkmarkDisabled: {
    fontSize: 12,
    color: '#4CAF50',
  },
  contactAlreadyAdded: {
    fontSize: Typography.sizes.xs,
    color: '#4CAF50',
    fontWeight: Typography.weights.medium,
    marginTop: 2,
  },
});