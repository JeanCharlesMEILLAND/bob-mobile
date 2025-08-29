// src/components/common/ModernGradient.tsx - Gradient moderne compatible web
import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';

interface ModernGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const ModernGradient: React.FC<ModernGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}) => {
  // Pour web, utiliser un gradient CSS
  if (Platform.OS === 'web') {
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI + 90;
    const gradientStyle = {
      background: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
    };
    
    return (
      <View style={[style, gradientStyle as any]}>
        {children}
      </View>
    );
  }
  
  // Pour mobile, utiliser une couleur de fond simple (fallback)
  return (
    <View style={[{ backgroundColor: colors[0] }, style]}>
      {children}
    </View>
  );
};

// Presets de gradients modernes
export const ModernGradients = {
  blue: ['#42A5F5', '#1976D2'],
  purple: ['#8B5CF6', '#6D28D9'],
  success: ['#E8F5E8', '#C8E6C9'],
  info: ['#EBF8FF', '#DBEAFE'],
  warning: ['#FFF7ED', '#FED7AA'],
  glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.05)'],
  subtle: ['rgba(248, 250, 252, 0.8)', 'rgba(241, 245, 249, 0.6)'],
};