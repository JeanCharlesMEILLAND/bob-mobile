// src/components/common/PasswordInput.tsx
import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text, TouchableOpacity, Platform } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../styles';
import { WebStyles } from '../../styles/web';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  variant?: 'default' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export const PasswordInput: React.FC<PasswordInputProps> = ({ 
  label,
  error,
  variant = 'default', 
  size = 'medium',
  style, 
  ...props 
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputVariant = error ? 'error' : variant;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            styles[inputVariant],
            styles[size],
            WebStyles.input,
            style
          ]}
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry={!isPasswordVisible}
          {...props}
        />
        
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={togglePasswordVisibility}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.eyeIcon}>
            {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
          </Text>
        </TouchableOpacity>
      </View>
      
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
  
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingRight: 50, // Espace pour le bouton œil
    fontSize: Typography.sizes.base,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      },
    }),
  },
  
  eyeIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
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

export default PasswordInput;