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
  contactCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: 14,
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
  contactInitial: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
  },
  contactNumber: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactSuggestion: {
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
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: Spacing.md,
    elevation: 8,
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
});