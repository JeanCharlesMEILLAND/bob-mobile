// src/components/contacts/NetworkIntroductionScreen.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: Spacing.lg,
  },

  // Hero Section - compact
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Benefits Grid - 2x2
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
    width: '100%',
  },
  benefitCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  benefitText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    textAlign: 'center',
  },

  // Steps Section - compact
  stepsSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: '#F8F9FA',
    padding: Spacing.lg,
    borderRadius: 12,
    width: '100%',
  },
  stepsTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  stepText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },

  // Call to Action - compact
  ctaContainer: {
    marginBottom: Spacing.md,
  },
  ctaButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 25,
    elevation: 4,
    minWidth: 250,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});