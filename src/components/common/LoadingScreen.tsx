// src/components/common/LoadingScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Chargement...' 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo/App Name */}
        <Text style={styles.appName}>Bob</Text>
        
        {/* Loading Indicator */}
        <ActivityIndicator 
          size="large" 
          color={Colors.primary} 
          style={styles.spinner}
        />
        
        {/* Loading Message */}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...GlobalStyles.safeArea,
    ...GlobalStyles.center,
    backgroundColor: Colors.background,
  },
  
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  appName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  
  spinner: {
    marginBottom: Spacing.lg,
  },
  
  message: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});