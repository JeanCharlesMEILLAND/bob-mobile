// src/components/contacts/PermissionModal.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    color: Colors.text,
  },
  description: {
    fontSize: Typography.sizes.base,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  features: {
    marginBottom: Spacing.xl,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  featureText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  declineButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  declineText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  acceptButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  acceptText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.base,
  },
});