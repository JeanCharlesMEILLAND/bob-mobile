// src/components/navigation/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomNavigationProps, TabItem, ScreenType } from '../../types';
import { Colors, Typography, Spacing } from '../../styles';
import { WebStyles, getWebStyle, isWebDesktop } from '../../styles/web';
import { HomeIcon } from '../../assets/icons/navigation/HomeIcon';
import { ExchangesIcon } from '../../assets/icons/navigation/ExchangesIcon';
import { EventsIcon } from '../../assets/icons/navigation/EventsIcon';
import { ProfileIcon } from '../../assets/icons/navigation/ProfileIcon';

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onScreenChange 
}) => {
  const { t } = useTranslation();
  
  const tabs: TabItem[] = [
    { id: 'home', label: t('navigation.home'), icon: '🏠' },
    { id: 'contacts', label: t('navigation.contacts'), icon: '📞' },
    { id: 'chat', label: t('navigation.chat'), icon: '💬' },
    { id: 'profile', label: t('navigation.profile'), icon: '👤' },
  ];

  const renderTabIcon = (tabId: string, isActive: boolean) => {
    const iconProps = { width: 22, height: 22, active: isActive };
    
    switch (tabId) {
      case 'home':
        return <HomeIcon {...iconProps} height={20} />;
      case 'contacts':
        return (
          <Text style={{ fontSize: 20, color: isActive ? Colors.primary : Colors.textSecondary }}>
            📞
          </Text>
        );
      case 'chat':
        return (
          <Text style={{ fontSize: 20, color: isActive ? Colors.primary : Colors.textSecondary }}>
            💬
          </Text>
        );
      case 'profile':
        return <ProfileIcon {...iconProps} width={16} height={20} />;
      default:
        return (
          <Text style={{ fontSize: 20, color: isActive ? Colors.primary : Colors.textSecondary }}>
            📱
          </Text>
        );
    }
  };

  const isDesktop = isWebDesktop();

  return (
    <View style={[
      styles.container, 
      isDesktop && styles.containerDesktop,
      getWebStyle(isDesktop ? styles.sidebarContainer : {})
    ]}>
      {isDesktop && (
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>🏠 BOB Network</Text>
        </View>
      )}
      
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            isDesktop && styles.tabDesktop,
            currentScreen === tab.id && (isDesktop ? styles.tabActiveDesktop : styles.tabActive)
          ]}
          onPress={() => onScreenChange(tab.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.tabContent, isDesktop && styles.tabContentDesktop]}>
            {renderTabIcon(tab.id, currentScreen === tab.id)}
            <Text style={[
              styles.tabLabel,
              isDesktop && styles.tabLabelDesktop,
              currentScreen === tab.id && (isDesktop ? styles.tabLabelActiveDesktop : styles.tabLabelActive)
            ]}>
              {tab.label || 'Tab'}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
      
      {isDesktop && (
        <View style={styles.sidebarFooter}>
          <Text style={styles.sidebarVersion}>v1.0.0</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Mobile styles (default)
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: 0,
    paddingTop: 6,
    minHeight: 50,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  
  // Desktop sidebar styles
  containerDesktop: {
    flexDirection: 'column',
    width: 250,
    height: '100%',
    position: 'absolute' as any,
    top: 0,
    bottom: 'auto',
    borderTopWidth: 0,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingTop: 0,
    paddingBottom: 20,
    minHeight: 'auto',
  },
  
  sidebarContainer: {
    ...(Platform.OS === 'web' && {
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
    }),
  },
  
  sidebarHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  
  sidebarTitle: {
    fontSize: 18,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    textAlign: 'center',
  },
  
  sidebarFooter: {
    marginTop: 'auto',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  
  sidebarVersion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 2,
    paddingBottom: 2,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  
  tabDesktop: {
    flex: 0,
    width: 'auto',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  
  tabContent: {
    alignItems: 'center',
  },
  
  tabContentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  
  tabActive: {
    backgroundColor: '#3B82F615',
  },
  
  tabActiveDesktop: {
    backgroundColor: Colors.primary,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(59,130,246,0.3)',
    }),
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
    marginTop: 4,
  },
  
  tabLabelDesktop: {
    fontSize: Typography.sizes.sm,
    marginTop: 0,
    marginLeft: 12,
    textAlign: 'left',
    flex: 1,
  },
  
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  
  tabLabelActiveDesktop: {
    color: Colors.white,
    fontWeight: Typography.weights.semibold,
  },
});