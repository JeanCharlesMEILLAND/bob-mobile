// src/components/common/TestModeIndicator.tsx - Indicateur du mode de test actuel
import React from 'react';
import { View, Text } from 'react-native';
import { useTestStore } from '../../store/testStore';

interface TestModeIndicatorProps {
  show?: boolean;
}

export const TestModeIndicator: React.FC<TestModeIndicatorProps> = ({ 
  show = __DEV__ // Afficher seulement en développement par défaut
}) => {
  const { testMode, invitedBy } = useTestStore();

  if (!show) return null;

  const getModeInfo = () => {
    switch (testMode) {
      case 'normal':
        return { emoji: '✅', label: 'Mode Normal', color: '#10B981' };
      case 'newUser':
        return { emoji: '👋', label: 'Nouvel Utilisateur', color: '#3B82F6' };
      case 'invited':
        return { emoji: '🎉', label: `Invité par ${invitedBy || 'Unknown'}`, color: '#F59E0B' };
      default:
        return { emoji: '❓', label: 'Mode inconnu', color: '#6B7280' };
    }
  };

  const { emoji, label, color } = getModeInfo();

  return (
    <View style={{
      position: 'absolute',
      top: 5, // Très haut, juste après la status bar
      right: 10,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      zIndex: 10000,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 5
    }}>
      <Text style={{ fontSize: 12, marginRight: 3 }}>{emoji}</Text>
      <Text style={{ 
        fontSize: 10, 
        color: color,
        fontWeight: '600'
      }}>
        {label}
      </Text>
    </View>
  );
};