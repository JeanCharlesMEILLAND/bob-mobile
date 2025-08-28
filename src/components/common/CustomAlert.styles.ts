// src/components/common/CustomAlert.styles.ts
import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../styles';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  
  icon: {
    fontSize: 32,
  },
  
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    color: Colors.text,
    lineHeight: 24,
  },
  
  message: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  
  buttonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  
  button: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  
  singleButton: {
    // Style spécial pour un seul bouton
  },
  
  // Styles des boutons par type
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  
  primaryButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  destructiveButton: {
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  // Styles du texte des boutons
  buttonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  
  cancelButtonText: {
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  
  primaryButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
  
  destructiveButtonText: {
    color: Colors.white,
    fontWeight: Typography.weights.bold,
  },
});