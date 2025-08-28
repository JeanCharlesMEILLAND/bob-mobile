// src/components/contacts/ManageContactsScreen.styles.ts - COMPLET
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
    marginLeft: Spacing.sm,
  },
  searchClearText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.lg,
  },

  // Status filters
  statusFilters: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusFilter: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  statusFilterActive: {
    backgroundColor: Colors.primary + '10',
  },
  statusFilterText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  statusFilterTextActive: {
    color: Colors.primary,
  },

  // Contact Card
  contactCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  contactHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    position: 'relative',
  },

  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },

  contactInitial: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },

  contactInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
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

  hasBobBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },

  hasBobBadgeText: {
    fontSize: Typography.sizes.xs,
    color: '#4CAF50',
    fontWeight: Typography.weights.medium,
  },

  // Tags
  tagsContainer: {
    marginBottom: Spacing.md,
  },

  tagsLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },

  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },

  tagButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  tagButtonActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },

  tagButtonText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },

  tagButtonTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },

  // Card Actions
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },

  inviteButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
  },

  inviteButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },

  menuButton: {
    padding: Spacing.xs,
  },

  menuButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    marginTop: 50,
  },

  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
    opacity: 0.5,
  },

  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  listContent: {
    paddingBottom: Spacing.xl,
  },

  // Ajouter ces styles dans ManageContactsScreen.styles.ts :

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
  color: '#CCC',
},

letterCount: {
  fontSize: 8,
  color: Colors.textSecondary,
  marginTop: 2,
},

letterCountActive: {
  color: Colors.white,
},

// Boutons pour contacts Bob
profileButton: {
  backgroundColor: Colors.primary,
  paddingHorizontal: Spacing.sm,
  paddingVertical: 6,
  borderRadius: 6,
},

profileButtonText: {
  color: Colors.white,
  fontSize: Typography.sizes.xs,
  fontWeight: Typography.weights.medium,
},

historyButton: {
  backgroundColor: '#FF9800',
  paddingHorizontal: Spacing.sm,
  paddingVertical: 6,
  borderRadius: 6,
},

historyButtonText: {
  color: Colors.white,
  fontSize: Typography.sizes.xs,
  fontWeight: Typography.weights.medium,
},

exchangeCount: {
  fontSize: Typography.sizes.xs,
  color: Colors.textSecondary,
  marginTop: 2,
  fontStyle: 'italic',
},

clearButton: {
  padding: Spacing.xs,
},

clearButtonText: {
  fontSize: Typography.sizes.lg,
  color: Colors.textSecondary,
},

// Modals
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalContent: {
  backgroundColor: Colors.white,
  borderRadius: 16,
  padding: Spacing.lg,
  width: '90%',
  maxHeight: '70%',
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: Spacing.md,
},

modalTitle: {
  fontSize: Typography.sizes.lg,
  fontWeight: Typography.weights.bold,
},

modalClose: {
  fontSize: 24,
  color: Colors.textSecondary,
  padding: Spacing.xs,
},

modalScroll: {
  maxHeight: 400,
},

contactModalName: {
  fontSize: Typography.sizes.lg,
  fontWeight: Typography.weights.bold,
  marginBottom: Spacing.xs,
},

contactModalInfo: {
  fontSize: Typography.sizes.sm,
  color: Colors.textSecondary,
  marginBottom: Spacing.md,
},

historyItem: {
  backgroundColor: Colors.background,
  padding: Spacing.md,
  borderRadius: 8,
  marginBottom: Spacing.sm,
},

historyDate: {
  fontSize: Typography.sizes.xs,
  color: Colors.textSecondary,
  marginBottom: 4,
},

historyType: {
  fontSize: Typography.sizes.sm,
  fontWeight: Typography.weights.medium,
  color: Colors.primary,
  marginBottom: 4,
},

historyDescription: {
  fontSize: Typography.sizes.sm,
  color: Colors.text,
},

noHistory: {
  fontSize: Typography.sizes.base,
  color: Colors.textSecondary,
  textAlign: 'center',
  marginTop: Spacing.xl,
},

// Modal Actions
actionModalContent: {
  backgroundColor: Colors.white,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  padding: Spacing.lg,
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
},

actionModalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: Spacing.md,
  paddingBottom: Spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: '#E0E0E0',
},

actionModalTitle: {
  fontSize: Typography.sizes.lg,
  fontWeight: Typography.weights.bold,
},

actionItem: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: Spacing.md,
},

actionItemDanger: {
  borderTopWidth: 1,
  borderTopColor: '#E0E0E0',
  marginTop: Spacing.sm,
  paddingTop: Spacing.md,
},

actionIcon: {
  fontSize: 20,
  marginRight: Spacing.md,
  width: 30,
},

actionText: {
  fontSize: Typography.sizes.base,
  color: Colors.text,
},

actionTextDanger: {
  color: '#D32F2F',
},

emptyDescription: {
  fontSize: Typography.sizes.base,
  color: Colors.textSecondary,
  textAlign: 'center',
  marginTop: Spacing.sm,
},

refreshButton: {
  padding: Spacing.sm,
},
refreshButtonText: {
  fontSize: 24,
  color: Colors.primary,
},

// Delete button
deleteButton: {
  position: 'absolute',
  top: 8,
  right: 8,
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: '#FFE5E5',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1,
},
deleteButtonText: {
  fontSize: 16,
  color: '#D32F2F',
},

});