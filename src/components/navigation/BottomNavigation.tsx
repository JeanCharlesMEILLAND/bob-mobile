// src/components/navigation/BottomNavigation.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const tabs: TabItem[] = [
    { id: 'home', label: t('navigation.home'), icon: '🏠', subtitle: 'Dashboard' },
    { id: 'contacts', label: t('navigation.contacts'), icon: '👥', subtitle: 'Network' },
    { id: 'chat', label: t('navigation.chat'), icon: '💬', subtitle: 'Messages' },
    { id: 'profile', label: t('navigation.profile'), icon: '⚙️', subtitle: 'Settings' },
  ];

  const renderTabIcon = (tabId: string, isActive: boolean, isHovered: boolean = false) => {
    const isDesktop = isWebDesktop();
    const iconSize = isDesktop ? 24 : 20;
    const iconColor = isActive 
      ? (isDesktop ? '#FFFFFF' : Colors.primary)
      : isHovered 
        ? (isDesktop ? '#EC4899' : Colors.textSecondary)
        : Colors.textSecondary;
    
    const iconStyle = {
      fontSize: iconSize,
      color: iconColor,
      transition: Platform.OS === 'web' ? 'all 0.2s ease-in-out' : undefined,
    };
    
    switch (tabId) {
      case 'home':
        return (
          <View style={[styles.iconContainer, isDesktop && styles.iconContainerDesktop]}>
            <Text style={iconStyle}>🏠</Text>
          </View>
        );
      case 'contacts':
        return (
          <View style={[styles.iconContainer, isDesktop && styles.iconContainerDesktop]}>
            <Text style={iconStyle}>👥</Text>
          </View>
        );
      case 'chat':
        return (
          <View style={[styles.iconContainer, isDesktop && styles.iconContainerDesktop]}>
            <Text style={iconStyle}>💬</Text>
          </View>
        );
      case 'profile':
        return (
          <View style={[styles.iconContainer, isDesktop && styles.iconContainerDesktop]}>
            <Text style={iconStyle}>⚙️</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.iconContainer, isDesktop && styles.iconContainerDesktop]}>
            <Text style={iconStyle}>📱</Text>
          </View>
        );
    }
  };

  const isDesktop = isWebDesktop();

  return (
    <View style={[
      styles.container, 
      isDesktop && [styles.containerDesktop, isCollapsed && styles.containerCollapsed],
      getWebStyle(isDesktop ? styles.sidebarContainer : {})
    ]}>
      {isDesktop && (
        <View style={[styles.sidebarHeader, isCollapsed && styles.sidebarHeaderCollapsed]}>
          <View style={styles.logoContainer}>
            <Text style={[styles.logoIcon, isCollapsed && styles.logoIconCollapsed]}>🏠</Text>
            {!isCollapsed && (
              <View style={styles.logoText}>
                <Text style={styles.sidebarTitle}>BOB Network</Text>
                <Text style={styles.sidebarSubtitle}>Private Exchange</Text>
              </View>
            )}
          </View>
          {isDesktop && (
            <TouchableOpacity
              style={styles.collapseButton}
              onPress={() => setIsCollapsed(!isCollapsed)}
              activeOpacity={0.7}
            >
              <Text style={styles.collapseIcon}>{isCollapsed ? '→' : '←'}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.navSection}>
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const isHovered = hoveredTab === tab.id;
          
          return (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                isDesktop && styles.tabDesktop,
                isCollapsed && styles.tabCollapsed,
                isActive && (isDesktop ? styles.tabActiveDesktop : styles.tabActive),
                isHovered && isDesktop && styles.tabHovered
              ]}
              onPress={() => onScreenChange(tab.id)}
              onMouseEnter={Platform.OS === 'web' ? () => setHoveredTab(tab.id) : undefined}
              onMouseLeave={Platform.OS === 'web' ? () => setHoveredTab(null) : undefined}
              activeOpacity={0.8}
            >
              <View style={[styles.tabContent, isDesktop && styles.tabContentDesktop]}>
                {renderTabIcon(tab.id, isActive, isHovered)}
                {(!isDesktop || !isCollapsed) && (
                  <View style={styles.tabTextContainer}>
                    <Text style={[
                      styles.tabLabel,
                      isDesktop && styles.tabLabelDesktop,
                      isActive && (isDesktop ? styles.tabLabelActiveDesktop : styles.tabLabelActive),
                      isHovered && isDesktop && styles.tabLabelHovered
                    ]}>
                      {tab.label || 'Tab'}
                    </Text>
                    {isDesktop && tab.subtitle && (
                      <Text style={[
                        styles.tabSubtitle,
                        isActive && styles.tabSubtitleActive
                      ]}>
                        {tab.subtitle}
                      </Text>
                    )}
                  </View>
                )}
              </View>
              {isActive && isDesktop && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      
      {isDesktop && (
        <View style={[styles.sidebarFooter, isCollapsed && styles.sidebarFooterCollapsed]}>
          <View style={styles.userProfile}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>JC</Text>
            </View>
            {!isCollapsed && (
              <View style={styles.userInfo}>
                <Text style={styles.userName}>Jean-Charles</Text>
                <Text style={styles.userStatus}>• En ligne</Text>
              </View>
            )}
          </View>
          {!isCollapsed && (
            <Text style={styles.sidebarVersion}>BOB v2.0.0</Text>
          )}
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
    width: 280,
    height: '100vh',
    position: 'fixed' as any,
    top: 0,
    left: 0,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 0,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backdropFilter: 'blur(10px)',
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease-in-out',
    }),
  },

  containerCollapsed: {
    width: 80,
  },
  
  sidebarContainer: {
    ...(Platform.OS === 'web' && {
      boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
    }),
  },
  
  // Header styles
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sidebarHeaderCollapsed: {
    padding: 16,
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  logoIcon: {
    fontSize: 28,
    marginRight: 12,
    ...(Platform.OS === 'web' && {
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
      transition: 'all 0.2s ease',
    }),
  },

  logoIconCollapsed: {
    marginRight: 0,
  },

  logoText: {
    flex: 1,
  },
  
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  sidebarSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  collapseButton: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },

  collapseIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold' as const,
  },

  // Navigation section
  navSection: {
    flex: 1,
    paddingTop: 20,
  },
  
  // Footer styles
  sidebarFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  sidebarFooterCollapsed: {
    padding: 16,
    alignItems: 'center',
  },

  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  userAvatarText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
    marginBottom: 2,
  },

  userStatus: {
    fontSize: 12,
    color: '#4ADE80',
    fontWeight: '500' as const,
  },
  
  sidebarVersion: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  
  // Tab styles
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
    width: '100%',
    marginHorizontal: 12,
    marginVertical: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    flexDirection: 'row' as const,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease-in-out',
    }),
  },

  tabCollapsed: {
    marginHorizontal: 16,
    paddingHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  tabContent: {
    alignItems: 'center',
  },
  
  tabContentDesktop: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'flex-start' as const,
    width: '100%',
  },

  tabTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  
  tabActive: {
    backgroundColor: '#3B82F615',
  },
  
  tabActiveDesktop: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(10px)',
    }),
  },

  tabHovered: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    ...(Platform.OS === 'web' && {
      transform: 'translateX(4px)',
    }),
  },

  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 0 8px rgba(255,255,255,0.5)',
    }),
  },

  // Icon styles
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerDesktop: {
    width: 24,
    height: 24,
  },
  
  // Label styles
  tabLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginTop: 4,
  },
  
  tabLabelDesktop: {
    fontSize: 15,
    marginTop: 0,
    textAlign: 'left',
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500' as const,
    letterSpacing: 0.5,
  },

  tabSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },

  tabSubtitleActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  
  tabLabelActiveDesktop: {
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },

  tabLabelHovered: {
    color: 'rgba(255,255,255,0.95)',
  },
});