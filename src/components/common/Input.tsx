// src/components/common/Input.tsx
import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../styles';
import { WebStyles } from '../../styles/web';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export const Input: React.FC<InputProps> = ({ 
  label,
  error,
  variant = 'default', 
  size = 'medium',
  style, 
  ...props 
}) => {
  const inputVariant = error ? 'error' : variant;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <TextInput
        style={[
          styles.input,
          styles[inputVariant],
          styles[size],
          WebStyles.input,
          style
        ]}
        placeholderTextColor={Colors.textSecondary}
        {...props}
      />
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.sizes.base,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  
  // Variants
  default: {
    borderColor: Colors.border,
  },
  error: {
    borderColor: Colors.error,
  },
  
  // Sizes
  small: {
    paddingVertical: Spacing.sm,
    minHeight: 36,
  },
  medium: {
    paddingVertical: 12,
    minHeight: 48,
  },
  large: {
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default Input;