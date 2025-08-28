// src/components/common/ModernScreen.tsx - Layout moderne réutilisable pour tous les écrans
import React from 'react';
import { ScrollView, View, RefreshControl, ViewStyle } from 'react-native';
import { modernColors, modernSpacing } from './ModernUI';

interface ModernScreenProps {
  children: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
}

export const ModernScreen: React.FC<ModernScreenProps> = ({
  children,
  refreshing = false,
  onRefresh,
  style,
  showsVerticalScrollIndicator = false,
  contentContainerStyle,
  scrollEnabled = true
}) => (
  <View style={[{
    flex: 1,
    backgroundColor: '#f5f5f5' // Gris très clair pour le fond
  }, style]}>
    <ScrollView 
      style={{ flex: 1 }}
      contentContainerStyle={[{
        paddingTop: 0,
        paddingBottom: 80 // Plus d'espace en bas pour éviter que la navbar cache le contenu
      }, contentContainerStyle]}
      refreshControl={onRefresh ? (
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[modernColors.primary]}
          tintColor={modernColors.primary}
        />
      ) : undefined}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      scrollEnabled={scrollEnabled}
    >
      {children}
    </ScrollView>
  </View>
);

// Screen sans scroll pour les cas particuliers
export const ModernStaticScreen: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => (
  <View style={[{
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: modernSpacing.sm
  }, style]}>
    {children}
  </View>
);