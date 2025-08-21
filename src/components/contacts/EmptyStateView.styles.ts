// src/components/contacts/EmptyStateView.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    minHeight: 600,
  },
  illustration: {
    position: 'relative',
    marginBottom: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: Spacing.lg,
  },
  emptyIconBackground: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '10',
    top: -10,
    left: -10,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },

  // Guide visuel
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  stepText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepDivider: {
    width: 30,
    height: 2,
    backgroundColor: Colors.primary + '30',
    marginHorizontal: Spacing.xs,
  },

  // Boutons
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 25,
    elevation: 4,
    minWidth: 280,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.text,
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
  },

  // Carte de résultat
  scanResultCard: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    elevation: 2,
  },
  scanResultIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  scanResultNumber: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  scanResultLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  scanDate: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Actions
  scannedActions: {
    width: '100%',
    gap: Spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});