// src/components/contacts/InvitationInterface.styles.ts - COMPLET
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

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
  
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },

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
    marginBottom: Spacing.md,
  },

  contactCardName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: 4,
  },

  contactCardPhone: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  statusContainer: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },

  statusNew: {
    fontSize: Typography.sizes.sm,
    color: '#4CAF50',
    fontWeight: Typography.weights.medium,
  },

  statusWaiting: {
    fontSize: Typography.sizes.sm,
    color: '#FF9800',
    fontWeight: Typography.weights.medium,
  },

  statusMethod: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  statusRelance: {
    fontSize: Typography.sizes.sm,
    color: '#FF5722',
    fontWeight: Typography.weights.medium,
  },

  statusLastContact: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  statusOnBob: {
    fontSize: Typography.sizes.sm,
    color: '#4CAF50',
    fontWeight: Typography.weights.bold,
  },

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

  messagePreview: {
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },

  messageLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },

  cardActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },

  actionButtonWhatsApp: {
    backgroundColor: '#25D366',
  },

  actionButtonRelance: {
    backgroundColor: '#FF9800',
  },

  actionButtonSuccess: {
    backgroundColor: '#4CAF50',
  },

  actionButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.sm,
  },

  bobActions: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },

  bobActionsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
  },

  listContent: {
    paddingBottom: Spacing.xl,
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },

  tabText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  tagButtonDisabled: {
  opacity: 0.5,
  backgroundColor: '#F5F5F5',
  borderColor: '#E0E0E0',
},

tagButtonTextDisabled: {
  color: '#9E9E9E',
},

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

letterFilterInfo: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#E3F2FD',
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.xs,
},

letterFilterText: {
  fontSize: Typography.sizes.sm,
  color: Colors.primary,
},

clearFilterText: {
  fontSize: Typography.sizes.sm,
  color: Colors.primary,
  fontWeight: Typography.weights.bold,
},

clearFilterButton: {
  marginTop: Spacing.md,
  backgroundColor: Colors.primary,
  paddingHorizontal: Spacing.lg,
  paddingVertical: Spacing.sm,
  borderRadius: 8,
},

clearFilterButtonText: {
  color: Colors.white,
  fontWeight: Typography.weights.bold,
},

emptyState: {
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 60,
  paddingHorizontal: Spacing.lg,
},

emptyIcon: {
  fontSize: 48,
  marginBottom: Spacing.md,
},

emptyTitle: {
  fontSize: Typography.sizes.lg,
  color: Colors.textSecondary,
  textAlign: 'center',
  marginBottom: Spacing.sm,
},

clearButton: {
  padding: Spacing.xs,
},

clearButtonText: {
  fontSize: Typography.sizes.lg,
  color: Colors.textSecondary,
},

});