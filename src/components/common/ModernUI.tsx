// src/components/common/ModernUI.tsx - Composants UI modernes réutilisables
import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient'; // Pas compatible web - remplacé par du CSS
import { useTranslation } from 'react-i18next';
import { ClocheIcon } from '../../assets/icons/ui/ClocheIcon';
import { LogoBob } from '../../assets/images/branding/LogoBob';
import { HomeIcon } from '../../assets/icons/navigation/HomeIcon';
import { ExchangesIcon } from '../../assets/icons/navigation/ExchangesIcon';
import { ProfileIcon } from '../../assets/icons/navigation/ProfileIcon';
import { EmpruntActifIcon } from '../../assets/icons/requests/EmpruntActifIcon';
import { PretActifIcon } from '../../assets/icons/requests/PretActifIcon';
import { ServiceActifIcon } from '../../assets/icons/requests/ServiceActifIcon';
import { CollectifActifIcon } from '../../assets/icons/requests/CollectifActifIcon';

// Couleurs et styles de base
export const modernColors = {
  primary: '#007AFF',
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  light: '#f8f9fa',
  dark: '#343a40',
  white: '#ffffff',
  gray: '#6c757d',
  lightGray: '#f0f0f0',
  border: '#dee2e6'
};

export const modernSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24
};

// Styles de base pour les cartes
export const cardStyle: ViewStyle = {
  backgroundColor: modernColors.white,
  padding: modernSpacing.lg,
  margin: modernSpacing.sm,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3
};

// Composant Card moderne
interface ModernCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof modernSpacing;
}

export const ModernCard: React.FC<ModernCardProps> = ({ 
  children, 
  style, 
  padding = 'lg' 
}) => (
  <View style={[cardStyle, { padding: modernSpacing[padding] }, style]}>
    {children}
  </View>
);

// Composant Section avec titre
interface ModernSectionProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  icon?: string;
}

export const ModernSection: React.FC<ModernSectionProps> = ({ 
  title, 
  children, 
  style, 
  icon 
}) => (
  <ModernCard style={style}>
    <Text style={{
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: modernSpacing.lg,
      color: modernColors.dark
    }}>
{icon && `${icon} `}{title || ''}
    </Text>
    {children}
  </ModernCard>
);

// Barre de progression moderne
interface ModernProgressBarProps {
  percentage: number;
  color?: string;
  label?: string;
}

export const ModernProgressBar: React.FC<ModernProgressBarProps> = ({ 
  percentage, 
  color = modernColors.primary,
  label 
}) => (
  <View>
    {label && (
      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: color,
        marginBottom: modernSpacing.xs
      }}>
        {label}
      </Text>
    )}
    <View style={{
      backgroundColor: modernColors.lightGray,
      height: 8,
      borderRadius: 4,
      marginBottom: modernSpacing.xs
    }}>
      <View style={{
        backgroundColor: color,
        height: 8,
        borderRadius: 4,
        width: `${Math.max(percentage, 5)}%`
      }} />
    </View>
  </View>
);

// Carte statistique moderne
interface ModernStatCardProps {
  icon: string;
  number: number | string;
  label: string;
  color?: string;
  onPress?: () => void;
  sublabel?: string;
}

export const ModernStatCard: React.FC<ModernStatCardProps> = ({
  icon,
  number,
  label,
  color = modernColors.light,
  onPress,
  sublabel
}) => (
  <TouchableOpacity 
    style={{
      flex: 1,
      backgroundColor: color,
      padding: modernSpacing.lg,
      borderRadius: 8,
      marginHorizontal: 4,
      alignItems: 'center',
      opacity: onPress ? 1 : 0.9
    }}
    onPress={onPress}
    disabled={!onPress}
  >
    <Text style={{ fontSize: 24, marginBottom: modernSpacing.xs }}>{icon}</Text>
    <Text style={{
      fontSize: 20,
      fontWeight: 'bold',
      color: color === modernColors.light ? modernColors.dark : modernColors.white
    }}>
{String(number)}
    </Text>
    <Text style={{
      fontSize: 12,
      color: color === modernColors.light ? modernColors.gray : 
             color === '#d4edda' ? '#155724' :
             color === '#fff3cd' ? '#856404' : 
             modernColors.white,
      textAlign: 'center'
    }}>
      {label || ''}
    </Text>
    {sublabel && (
      <Text style={{
        fontSize: 10,
        color: color === modernColors.light ? modernColors.gray : modernColors.white,
        textAlign: 'center',
        marginTop: 2
      }}>
{sublabel || ''}
      </Text>
    )}
  </TouchableOpacity>
);

// Bouton d'action moderne
interface ModernActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  color?: string;
  badge?: number | string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ModernActionButton: React.FC<ModernActionButtonProps> = ({
  icon,
  title,
  description,
  onPress,
  color = modernColors.light,
  badge,
  disabled = false,
  style
}) => (
  <TouchableOpacity 
    style={[{
      flexDirection: 'row',
      backgroundColor: color,
      padding: modernSpacing.md,
      borderRadius: 8,
      marginBottom: modernSpacing.sm,
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1
    }, style]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={{ fontSize: 20, marginRight: modernSpacing.md }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{
        color: color === modernColors.light ? modernColors.dark : modernColors.white,
        fontWeight: '600',
        fontSize: 16
      }}>
{title || ''}
      </Text>
      <Text style={{
        color: color === modernColors.light ? modernColors.gray : 
               color === modernColors.primary ? 'rgba(255,255,255,0.9)' : modernColors.gray,
        fontSize: 14,
        opacity: color === modernColors.light ? 1 : 0.9
      }}>
{description || ''}
      </Text>
    </View>
    {badge && (
      <View style={{
        backgroundColor: color === modernColors.light ? modernColors.primary : 'rgba(255,255,255,0.3)',
        paddingHorizontal: modernSpacing.sm,
        paddingVertical: 4,
        borderRadius: 12
      }}>
        <Text style={{
          color: color === modernColors.light ? modernColors.white : modernColors.white,
          fontWeight: 'bold',
          fontSize: 12
        }}>
{String(badge)}
        </Text>
      </View>
    )}
    {!badge && (
      <Text style={{
        color: color === modernColors.light ? modernColors.gray : modernColors.white,
        fontSize: 18
      }}>
        →
      </Text>
    )}
  </TouchableOpacity>
);

// Section maintenance moderne
interface ModernMaintenanceSectionProps {
  title?: string;
  children: React.ReactNode;
}

export const ModernMaintenanceSection: React.FC<ModernMaintenanceSectionProps> = ({
  title,
  children
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('ui.maintenance');
  return (
    <View style={{
      padding: modernSpacing.xl,
      backgroundColor: modernColors.lightGray,
      margin: modernSpacing.sm,
      borderRadius: 8
    }}>
      <Text style={{
        fontWeight: 'bold',
        marginBottom: modernSpacing.sm,
        fontSize: 16,
        color: modernColors.dark
      }}>
        {displayTitle}
      </Text>
      {children}
    </View>
  );
};

// Bouton de maintenance
interface ModernMaintenanceButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  color?: 'primary' | 'danger';
  disabled?: boolean;
  icon?: string;
}

export const ModernMaintenanceButton: React.FC<ModernMaintenanceButtonProps> = ({
  title,
  subtitle,
  onPress,
  color = 'primary',
  disabled = false,
  icon = '🔄'
}) => (
  <TouchableOpacity
    style={{
      backgroundColor: color === 'primary' ? modernColors.primary : '#dc3545',
      padding: modernSpacing.md,
      borderRadius: 8,
      marginTop: modernSpacing.sm,
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1
    }}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={{
      color: modernColors.white,
      fontWeight: 'bold',
      fontSize: 16
    }}>
      {icon} {title}
    </Text>
    {subtitle && (
      <Text style={{
        color: modernColors.white,
        fontSize: 12,
        marginTop: 4,
        opacity: 0.9
      }}>
        {subtitle}
      </Text>
    )}
  </TouchableOpacity>
);

// Debug info moderne
interface ModernDebugInfoProps {
  data: Record<string, any>;
  title?: string;
}

export const ModernDebugInfo: React.FC<ModernDebugInfoProps> = ({
  data,
  title
}) => {
  const { t } = useTranslation();
  const displayTitle = title || t('ui.debugInfo');
  return (
    <View style={{
      backgroundColor: modernColors.light,
      padding: modernSpacing.md,
      margin: modernSpacing.sm,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: modernColors.border
    }}>
      <Text style={{
        fontWeight: 'bold',
        marginBottom: modernSpacing.sm,
        color: modernColors.dark
      }}>
        {displayTitle}:
      </Text>
      {Object.entries(data).map(([key, value]) => (
        <Text key={key} style={{ color: modernColors.gray, fontSize: 12 }}>
          • {key}: {String(value)}
        </Text>
      ))}
    </View>
  );
};

// Header moderne pour la home
interface ModernHomeHeaderProps {
  username: string;
  hasNotifications?: boolean;
  onNotificationPress?: () => void;
  avatarColor?: string;
  showLogo?: boolean;
}

export const ModernHomeHeader: React.FC<ModernHomeHeaderProps> = ({
  username,
  hasNotifications = false,
  onNotificationPress,
  avatarColor = modernColors.primary,
  showLogo = true
}) => {
  const { t } = useTranslation();
  return (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 20,
    minHeight: 80,
    backgroundColor: 'transparent',
    borderRadius: 12,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      {/* Logo Bob ou Avatar */}
      <View style={{
        width: 50,
        height: 50,
        borderRadius: showLogo ? 0 : 25,
        backgroundColor: showLogo ? 'transparent' : avatarColor,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
      }}>
        {showLogo ? (
          <LogoBob width={40} />
        ) : (
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: modernColors.white
          }}>
            {username?.charAt(0).toUpperCase() || 'U'}
          </Text>
        )}
      </View>

      {/* Salutation */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: modernColors.dark
        }}>
          {t('ui.hello', { username: username || t('ui.user') })}
        </Text>
        <Text style={{
          fontSize: 14,
          color: modernColors.gray,
          marginTop: 2
        }}>
          {t('ui.whatBobToday')}
        </Text>
      </View>
    </View>

    {/* Cloche de notifications */}
    <TouchableOpacity
      onPress={onNotificationPress}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <ClocheIcon 
        width={36} 
        height={36} 
        hasNotification={hasNotifications}
      />
    </TouchableOpacity>
  </View>
  );
};

// Bloc des demandes reçues
interface ReceivedRequest {
  id: string;
  requesterName: string;
  requesterAvatar?: string;
  type: 'pret' | 'service' | 'aide';
  title: string;
  description: string;
  timeAgo: string;
  isUrgent?: boolean;
}

interface ModernReceivedRequestsProps {
  requests: ReceivedRequest[];
  onViewRequest: (requestId: string) => void;
}

export const ModernReceivedRequests: React.FC<ModernReceivedRequestsProps> = ({
  requests,
  onViewRequest
}) => {
  const { t } = useTranslation();
  const getRequestSVG = (type: string) => {
    switch (type) {
      case 'emprunt': return <EmpruntActifIcon width={36} height={36} />;
      case 'pret': return <PretActifIcon width={36} height={36} />;
      case 'service': return <ServiceActifIcon width={36} height={36} />;
      case 'evenement': return <CollectifActifIcon width={36} height={36} />;
      default: return <ServiceActifIcon width={36} height={36} />;
    }
  };

  const getPersonInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };

  if (!requests || requests.length === 0) {
    return (
      <View style={{ backgroundColor: 'transparent' }}>
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <Text style={{ fontSize: 32, marginBottom: 8 }}>💌</Text>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: modernColors.dark,
            marginBottom: 4
          }}>
            {t('ui.noRequestsReceived')}
          </Text>
          <Text style={{
            fontSize: 14,
            color: modernColors.gray,
            textAlign: 'center'
          }}>
            {t('ui.noRequestsReceivedDesc')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: 'transparent' }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
      }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: modernColors.dark
        }}>
          {t('ui.requestsAndActions', { count: requests.length })}
        </Text>
      </View>

      {requests.map((request, index) => (
        <View 
          key={request.id} 
          style={{
            backgroundColor: '#F0F8FF',
            borderRadius: 12,
            padding: 12,
            marginBottom: index < requests.length - 1 ? 10 : 0,
            minHeight: 100 // Hauteur proportionnelle aux autres cards
          }}
        >
          {/* En-tête de la demande */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            {/* Initiales de la personne */}
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#3B82F6',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10
            }}>
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: '#fff'
              }}>
                {getPersonInitials(request.requesterName || 'User')}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: modernColors.dark,
                    marginRight: 6
                  }}>
                    {request.requesterName || 'Contact'}
                  </Text>
                  {request.isUrgent && (
                    <View style={{
                      backgroundColor: modernColors.danger,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 8
                    }}>
                      <Text style={{
                        fontSize: 10,
                        color: modernColors.white,
                        fontWeight: '600'
                      }}>
                        {t('ui.urgent')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Icône SVG du type de demande */}
                {getRequestSVG(request.type)}
              </View>
              <Text style={{
                fontSize: 12,
                color: modernColors.gray,
                marginTop: 2
              }}>
                {request.timeAgo}
              </Text>
            </View>
          </View>

          {/* Contenu de la demande */}
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: modernColors.dark,
            marginBottom: 4
          }}>
            {request.title || ''}
          </Text>
          <Text style={{
            fontSize: 12,
            color: modernColors.gray,
            lineHeight: 16,
            marginBottom: 12
          }} numberOfLines={2}>
            {request.description || ''}
          </Text>

          {/* Bouton voir subtil mais visible */}
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
            <TouchableOpacity
              style={{
                backgroundColor: modernColors.primary,
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 18,
                shadowColor: modernColors.primary,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
                elevation: 2
              }}
              onPress={() => onViewRequest(request.id)}
            >
              <Text style={{
                color: modernColors.white,
                fontSize: 12,
                fontWeight: '600'
              }}>
                {t('ui.view')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

// Navigation moderne
interface ModernNavbarProps {
  activeTab: 'home' | 'exchanges' | 'events' | 'profile';
  onTabPress: (tab: 'home' | 'exchanges' | 'events' | 'profile') => void;
}

export const ModernNavbar: React.FC<ModernNavbarProps> = ({ 
  activeTab, 
  onTabPress 
}) => {
  const { t } = useTranslation();
  const tabs = [
    { key: 'home' as const, label: t('ui.tabs.home') },
    { key: 'exchanges' as const, label: t('ui.tabs.exchanges') },
    { key: 'events' as const, label: t('ui.tabs.events') },
    { key: 'profile' as const, label: t('ui.tabs.profile') }
  ];

  const renderTabIcon = (tabKey: string, isActive: boolean) => {
    // Version temporaire avec emojis pour tester
    const iconSize = 24;
    switch (tabKey) {
      case 'home':
        return (
          <Text style={{ fontSize: iconSize, color: isActive ? modernColors.primary : modernColors.gray }}>
            🏠
          </Text>
        );
      case 'exchanges':
        return (
          <Text style={{ fontSize: iconSize, color: isActive ? modernColors.primary : modernColors.gray }}>
            🔄
          </Text>
        );
      case 'events':
        return (
          <Text style={{ fontSize: iconSize, color: isActive ? modernColors.primary : modernColors.gray }}>
            📅
          </Text>
        );
      case 'profile':
        return (
          <Text style={{ fontSize: iconSize, color: isActive ? modernColors.primary : modernColors.gray }}>
            👤
          </Text>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: modernColors.white,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: modernColors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8
    }}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={{
            flex: 1,
            alignItems: 'center',
            paddingVertical: 8
          }}
          onPress={() => onTabPress(tab.key)}
        >
          {renderTabIcon(tab.key, activeTab === tab.key)}
          <Text style={{
            fontSize: 11,
            marginTop: 4,
            color: activeTab === tab.key ? modernColors.primary : modernColors.gray,
            fontWeight: activeTab === tab.key ? '600' : '400'
          }}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};