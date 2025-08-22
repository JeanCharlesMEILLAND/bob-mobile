// src/components/common/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { WebStyles } from '../../styles/web';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  rightElement,
  leftElement,
}) => {
  return (
    <View style={[styles.container, WebStyles.header]}>
      <View style={styles.content}>
        {/* Left side */}
        <View style={styles.leftSide}>
          {showBackButton && onBackPress ? (
            <TouchableOpacity onPress={onBackPress} style={[styles.backButton, WebStyles.button]}>
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
          ) : leftElement ? (
            leftElement
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>

        {/* Center */}
        <View style={styles.center}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>

        {/* Right side */}
        <View style={styles.rightSide}>
          {rightElement || <View style={styles.placeholder} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 50, // Safe area top
  },
  
  content: {
    ...GlobalStyles.spaceBetween,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  
  leftSide: {
    flex: 1,
    alignItems: 'flex-start',
  },
  
  center: {
    flex: 2,
    alignItems: 'center',
  },
  
  rightSide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  
  backButton: {
    padding: Spacing.xs,
    marginLeft: -Spacing.xs, // Compensate padding for alignment
  },
  
  backButtonText: {
    color: Colors.primary,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
  },
  
  placeholder: {
    width: 24, // Minimal width for spacing
  },
});