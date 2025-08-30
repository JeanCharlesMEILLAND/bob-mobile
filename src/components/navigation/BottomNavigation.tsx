// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { modernColors } from '../common/ModernUI';
import { HomeIcon } from '../../assets/icons/navigation/HomeIcon';
import { ContactsIcon } from '../../assets/icons/navigation/ContactsIcon';
import { EventsIcon } from '../../assets/icons/navigation/EventsIcon';
import { ProfileIcon } from '../../assets/icons/navigation/ProfileIcon';

interface BottomNavigationProps {
  currentScreen: string;
  onScreenChange: (screen: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentScreen,
  onScreenChange
}) => {
  const tabs = [
    { key: 'home', label: 'Accueil', IconComponent: HomeIcon },
    { key: 'contacts', label: 'Contacts', IconComponent: ContactsIcon },
    { key: 'events', label: 'Événements', IconComponent: EventsIcon },
    { key: 'profile', label: 'Profil', IconComponent: ProfileIcon }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            currentScreen === tab.key && styles.activeTab
          ]}
          onPress={() => onScreenChange(tab.key)}
        >
          <View style={styles.tabIcon}>
            <tab.IconComponent 
              active={currentScreen === tab.key}
              width={20} 
              height={20} 
            />
          </View>
          <Text style={[
            styles.tabLabel,
            currentScreen === tab.key && styles.activeTabLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: modernColors.white,
    borderTopWidth: 1,
    borderTopColor: modernColors.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: `${modernColors.primary}15`,
  },
  tabIcon: {
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    color: modernColors.gray,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: modernColors.primary,
    fontWeight: 'bold',
  }
});

export { BottomNavigation };
export default BottomNavigation;