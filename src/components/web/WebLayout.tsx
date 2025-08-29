// src/components/web/WebLayout.tsx - Layout desktop moderne
import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebDesign, WebColors, WebTypography, WebSpacing, getWebStyle } from '../../styles/webDesign';

interface WebLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  activeScreen?: string;
}

interface NavItem {
  id: string;
  icon: string;
  label: string;
  screen: string;
  badge?: number;
}

// Navigation items seront traduits dans le composant
const navigationItems: Omit<NavItem, 'label'>[] = [
  {
    id: 'home',
    icon: '🏠',
    screen: 'Main',
  },
  {
    id: 'contacts',
    icon: '👥', 
    screen: 'Contacts',
  },
  {
    id: 'exchanges',
    icon: '🤖',
    screen: 'Exchanges',
    badge: 3,
  },
  {
    id: 'chat',
    icon: '💬',
    screen: 'Chat',
    badge: 2,
  },
  {
    id: 'events',
    icon: '🎯',
    screen: 'Events',
  },
  {
    id: 'profile',
    icon: '👤',
    screen: 'Profile',
  },
];

// Quick actions seront traduites dans le composant
interface QuickAction {
  id: string;
  icon: string;
  screen: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: 'create-bob',
    icon: '➕',
    screen: 'CreateExchange',
    color: WebColors.primary,
  },
  {
    id: 'create-event',
    icon: '🎯',
    screen: 'CreateEvent',
    color: WebColors.secondary,
  },
  {
    id: 'test-demo',
    icon: '🧪',
    screen: 'BobTest',
    color: WebColors.accent,
  },
];

export const WebLayout: React.FC<WebLayoutProps> = ({
  children,
  title = 'Bob',
  showSidebar = true,
  activeScreen = 'Main'
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigation = useSimpleNavigation();

  if (!getWebStyle({ display: 'flex' }, false)) {
    // Fallback pour mobile - pas de layout web
    return <>{children}</>;
  }

  const handleNavigation = (screen: string) => {
    console.log('🧭 WebLayout Navigation vers:', screen);
    
    // Mapping des noms d'écrans pour correspondre au système de navigation
    const screenMapping: Record<string, string> = {
      'Main': 'home',
      'Contacts': 'contacts', 
      'Exchanges': 'home',
      'Chat': 'Chat',
      'Events': 'events',
      'Profile': 'profile',
      'CreateExchange': 'CreateExchange',
      'CreateEvent': 'CreateEvent',
      'BobTest': 'BobTest'
    };
    
    const targetScreen = screenMapping[screen] || screen;
    
    // Si c'est un écran d'onglet, utiliser navigateToTab
    if (['home', 'contacts', 'events', 'profile'].includes(targetScreen)) {
      navigation.navigateToTab?.(targetScreen);
    } else {
      // Pour le chat, ouvrir la liste des contacts
      if (targetScreen === 'Chat') {
        navigation.navigate('ContactsList');
      } else {
        // Sinon utiliser navigate pour les autres écrans modaux
        navigation.navigate(targetScreen);
      }
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getNavLabel = (id: string) => {
    switch (id) {
      case 'home': return t('navigation.home');
      case 'contacts': return t('navigation.contacts');
      case 'exchanges': return t('webLayout.myBobs');
      case 'chat': return t('webLayout.messages');
      case 'events': return t('webLayout.collectiveBob');
      case 'profile': return t('navigation.profile');
      default: return id;
    }
  };

  const getQuickActionLabel = (id: string) => {
    switch (id) {
      case 'create-bob': return t('exchanges.createBob');
      case 'create-event': return t('webLayout.collectiveBob');
      case 'test-demo': return t('webLayout.test');
      default: return id;
    }
  };

  const getQuickActionDesc = (id: string) => {
    switch (id) {
      case 'create-bob': return t('exchanges.actions.createBobDesc');
      case 'create-event': return t('webLayout.organizeEvent');
      case 'test-demo': return t('webLayout.demoComplete');
      default: return '';
    }
  };

  const styles = {
    container: {
      ...getWebStyle({
        display: 'flex',
        flexDirection: 'row' as const,
        height: '100vh',
        backgroundColor: WebColors.background,
        fontFamily: WebTypography.fontFamily.sans,
      }),
    },

    sidebar: {
      ...getWebStyle({
        width: WebDesign.sidebar.width,
        backgroundColor: WebDesign.sidebar.backgroundColor,
        borderRight: WebDesign.sidebar.borderRight,
        boxShadow: WebDesign.sidebar.boxShadow,
        display: showSidebar ? 'flex' : 'none',
        flexDirection: 'column' as const,
        position: 'fixed' as const,
        height: '100vh',
        left: 0,
        top: 0,
        zIndex: 1000,
      }),
    },

    sidebarHeader: {
      ...getWebStyle({
        padding: WebSpacing.lg,
        borderBottom: `1px solid ${WebColors.border}`,
        backgroundColor: WebColors.white,
      }),
    },

    logo: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize['2xl'],
        fontWeight: WebTypography.fontWeight.bold,
        color: WebColors.primary,
        textAlign: 'center' as const,
      }),
    },

    userInfo: {
      ...getWebStyle({
        marginTop: WebSpacing.md,
        textAlign: 'center' as const,
      }),
    },

    userName: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.base,
        fontWeight: WebTypography.fontWeight.medium,
        color: WebColors.gray900,
      }),
    },

    userRole: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        color: WebColors.gray500,
        marginTop: 2,
      }),
    },

    nav: {
      ...getWebStyle({
        flex: 1,
        padding: WebSpacing.md,
      }),
    },

    navSection: {
      ...getWebStyle({
        marginBottom: WebSpacing.xl,
      }),
    },

    navSectionTitle: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xs,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray400,
        textTransform: 'uppercase' as const,
        letterSpacing: 1,
        marginBottom: WebSpacing.sm,
        paddingLeft: WebSpacing.md,
      }),
    },

    navItem: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        padding: `${WebSpacing.sm}px ${WebSpacing.md}px`,
        borderRadius: WebSpacing.sm,
        marginBottom: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }),
    },

    navItemActive: {
      ...getWebStyle({
        backgroundColor: `${WebColors.primary}10`,
        borderLeft: `3px solid ${WebColors.primary}`,
      }),
    },

    navItemHover: {
      ...getWebStyle({
        backgroundColor: WebColors.gray50,
      }),
    },

    navItemIcon: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.lg,
        marginRight: WebSpacing.sm,
        width: 24,
        textAlign: 'center' as const,
      }),
    },

    navItemLabel: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.base,
        fontWeight: WebTypography.fontWeight.medium,
        color: WebColors.gray700,
        flex: 1,
      }),
    },

    navItemLabelActive: {
      ...getWebStyle({
        color: WebColors.primary,
      }),
    },

    navItemBadge: {
      ...getWebStyle({
        backgroundColor: WebColors.error,
        color: WebColors.white,
        fontSize: WebTypography.fontSize.xs,
        fontWeight: WebTypography.fontWeight.bold,
        borderRadius: WebSpacing.lg,
        paddingHorizontal: WebSpacing.xs,
        paddingVertical: 2,
        minWidth: 18,
        textAlign: 'center' as const,
      }),
    },

    quickActionsSection: {
      ...getWebStyle({
        padding: WebSpacing.md,
        borderTop: `1px solid ${WebColors.border}`,
        backgroundColor: WebColors.gray50,
      }),
    },

    quickActionItem: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'flex-start',
        padding: WebSpacing.md,
        borderRadius: WebSpacing.md,
        marginBottom: WebSpacing.sm,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: WebColors.white,
        border: `1px solid ${WebColors.border}`,
        minHeight: 85,
        maxHeight: 'none',
        overflow: 'visible',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
      }),
    },

    quickActionIcon: {
      ...getWebStyle({
        fontSize: 20,
        marginRight: WebSpacing.md,
        marginTop: 2,
      }),
    },

    quickActionText: {
      ...getWebStyle({
        fontSize: 14,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray800,
        flex: 1,
        lineHeight: 1.4,
        overflow: 'visible',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        textOverflow: 'clip',
      }),
    },

    sidebarFooter: {
      ...getWebStyle({
        padding: WebSpacing.md,
        borderTop: `1px solid ${WebColors.border}`,
      }),
    },

    logoutButton: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: WebSpacing.sm,
        backgroundColor: WebColors.error,
        borderRadius: WebSpacing.sm,
        cursor: 'pointer',
      }),
    },

    logoutText: {
      ...getWebStyle({
        color: WebColors.white,
        fontSize: WebTypography.fontSize.sm,
        fontWeight: WebTypography.fontWeight.medium,
        marginLeft: WebSpacing.xs,
      }),
    },

    mainContent: {
      ...getWebStyle({
        flex: 1,
        marginLeft: showSidebar ? WebDesign.sidebar.width : 0,
        display: 'flex',
        flexDirection: 'column' as const,
        minHeight: '100vh',
      }),
    },

    header: {
      ...getWebStyle({
        ...WebDesign.header,
        display: 'flex',
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky' as const,
        top: 0,
        zIndex: 900,
      }),
    },

    headerTitle: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xl,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray900,
      }),
    },

    headerActions: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: WebSpacing.md,
      }),
    },

    content: {
      ...getWebStyle({
        flex: 1,
        padding: WebSpacing.lg,
        maxWidth: WebDesign.layout.maxWidth,
        alignSelf: 'center',
        width: '100%',
      }),
    },
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      {showSidebar && (
        <View style={styles.sidebar}>
          {/* Header sidebar */}
          <View style={styles.sidebarHeader}>
            <Text style={styles.logo}>🤖 Bob</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.username || t('webLayout.user')}
              </Text>
              <Text style={styles.userRole}>
                {t('webLayout.member')} • {user?.bobizPoints || 0} Bobiz
              </Text>
            </View>
          </View>

          {/* Navigation */}
          <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
            <View style={styles.navSection}>
              <Text style={styles.navSectionTitle}>{t('webLayout.navigation')}</Text>
              {navigationItems.map((item) => {
                const isActive = activeScreen === item.screen;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                    ]}
                    onPress={() => handleNavigation(item.screen)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.navItemIcon}>{item.icon}</Text>
                    <Text style={[
                      styles.navItemLabel,
                      isActive && styles.navItemLabelActive,
                    ]}>
                      {getNavLabel(item.id)}
                    </Text>
                    {item.badge && item.badge > 0 && (
                      <Text style={styles.navItemBadge}>{item.badge}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.navSection}>
              <Text style={styles.navSectionTitle}>{t('webLayout.quickActions')}</Text>
              {quickActions.map((action: QuickAction) => (
                <TouchableOpacity
                  key={action.id}
                  style={styles.quickActionItem}
                  onPress={() => handleNavigation(action.screen)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quickActionText}>{getQuickActionLabel(action.id)}</Text>
                    <Text style={[styles.quickActionText, { 
                      fontSize: 12, 
                      color: WebColors.gray500,
                      fontWeight: WebTypography.fontWeight.normal,
                      marginTop: 4,
                      lineHeight: 1.4,
                      overflow: 'visible',
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      textOverflow: 'clip',
                      maxHeight: 'none'
                    }]}>
                      {getQuickActionDesc(action.id)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer sidebar */}
          <View style={styles.sidebarFooter}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text>🚪</Text>
              <Text style={styles.logoutText}>{t('webLayout.logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Contenu principal */}
      <View style={styles.mainContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => handleNavigation('Contacts')}>
              <Text style={{ fontSize: 20 }}>👥</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleNavigation('CreateExchange')}>
              <Text style={{ fontSize: 20 }}>➕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    </View>
  );
};