// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomNavigationProps, TabItem, ScreenType } from '../../types';
import { Colors, Typography, Spacing } from '../../styles';

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onScreenChange 
}) => {
  const { t } = useTranslation();
  
  const tabs: TabItem[] = [
    { id: 'home', label: t('navigation.exchanges') || 'Échanges', icon: '🔄' },
    { id: 'events', label: t('navigation.events') || 'Événements', icon: '🎉' },
    { id: 'contacts', label: t('navigation.contacts') || 'Contacts', icon: '👥' },
    { id: 'profile', label: t('navigation.profile') || 'Profil', icon: '🏆' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            currentScreen === tab.id && styles.tabActive
          ]}
          onPress={() => onScreenChange(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.tabIcon}>{tab.icon || '📱'}</Text>
          <Text style={[
            styles.tabLabel,
            currentScreen === tab.id && styles.tabLabelActive
          ]}>
            {tab.label || 'Tab'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 10, // Safe area bottom
    paddingTop: Spacing.sm,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  
  tabActive: {
    backgroundColor: '#3B82F615', // 15% opacity
  },
  
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  
  tabLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
});