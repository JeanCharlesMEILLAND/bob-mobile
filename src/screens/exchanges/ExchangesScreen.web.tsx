// src/screens/exchanges/ExchangesScreen.web.tsx - Version web moderne
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Platform 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { WebLayout } from '../../components/web';
import { 
  WebDesign, 
  WebColors, 
  WebTypography, 
  WebSpacing, 
  getWebStyle,
  getResponsiveStyle 
} from '../../styles/webDesign';

interface Exchange {
  id: string;
  type: 'pret' | 'emprunt' | 'service_offert' | 'service_demande';
  titre: string;
  description: string;
  statut: 'actif' | 'en_cours' | 'termine' | 'annule';
  dateCreation: string;
  createur: {
    username: string;
  };
  bobizGagnes: number;
}

interface ExchangeStats {
  totalExchanges: number;
  activeExchanges: number;
  completedExchanges: number;
  totalBobizEarned: number;
  myOffers: number;
  myRequests: number;
}

interface StatCardProps {
  icon: string;
  value: number;
  label: string;
  color: string;
  trend?: { value: number; isPositive: boolean };
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, trend }) => {
  const styles = {
    card: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        borderRadius: WebSpacing.md,
        padding: WebSpacing.md,
        borderLeft: `3px solid ${color}`,
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.08)`,
        border: `1px solid ${WebColors.border}`,
        cursor: 'default',
        minHeight: 120,
        maxHeight: 'none',
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'flex-start',
        overflow: 'visible',
        wordWrap: 'break-word',
        gap: 6,
      }),
    },
    
    header: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 32,
        marginBottom: 0,
      }),
    },
    
    icon: {
      ...getWebStyle({
        fontSize: 20,
        backgroundColor: `${color}20`,
        padding: WebSpacing.xs,
        borderRadius: WebSpacing.sm,
        width: 40,
        height: 40,
        textAlign: 'center' as const,
        lineHeight: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: WebSpacing.sm,
      }),
    },
    
    
    contentRow: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: WebSpacing.md,
        flex: 1,
      }),
    },

    value: {
      ...getWebStyle({
        fontSize: 26,
        fontWeight: 'bold',
        color: WebColors.gray900,
        lineHeight: 1.1,
        marginTop: 0,
        marginBottom: 0,
        minWidth: 'auto',
      }),
    },
    
    label: {
      ...getWebStyle({
        fontSize: 13,
        color: WebColors.gray600,
        fontWeight: '500',
        lineHeight: 1.2,
        marginTop: 0,
        marginBottom: 0,
        flex: 1,
        overflow: 'visible',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        textOverflow: 'clip',
      }),
    },
    
    trend: {
      ...getWebStyle({
        fontSize: 11,
        fontWeight: '600',
        color: trend?.isPositive ? WebColors.success : WebColors.error,
        marginTop: 0,
        whiteSpace: 'nowrap',
      }),
    },
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Text style={{ fontSize: 20, lineHeight: 24 }}>{icon}</Text>
        </View>
        {trend && (
          <Text style={styles.trend}>
            {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
          </Text>
        )}
      </View>
      <View style={styles.contentRow}>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  onPress: () => void;
  badge?: number;
}

const ActionCard: React.FC<ActionCardProps> = ({ 
  icon, 
  title, 
  description, 
  color, 
  onPress, 
  badge 
}) => {
  const styles = {
    card: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        borderRadius: WebSpacing.md,
        padding: WebSpacing.md,
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.08)`,
        border: `1px solid ${WebColors.border}`,
        cursor: 'pointer',
        position: 'relative' as const,
        borderLeft: `3px solid ${color}`,
        transition: 'all 0.2s ease',
        minHeight: 110,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'flex-start',
      }),
    },
    
    cardHover: {
      ...getWebStyle({
        transform: 'translateY(-2px)',
        boxShadow: `0 8px 25px 0 ${WebColors.shadowMedium}`,
      }),
    },
    
    topRow: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: WebSpacing.sm,
      }),
    },
    
    iconContainer: {
      ...getWebStyle({
        backgroundColor: `${color}20`,
        padding: WebSpacing.sm,
        borderRadius: WebSpacing.md,
        width: 44,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }),
    },
    
    icon: {
      ...getWebStyle({
        fontSize: 22,
        lineHeight: 1,
      }),
    },
    
    
    title: {
      ...getWebStyle({
        fontSize: 16,
        fontWeight: '600',
        color: WebColors.gray900,
        lineHeight: 1.2,
        marginBottom: WebSpacing.xs,
        overflow: 'visible',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
      }),
    },
    
    description: {
      ...getWebStyle({
        fontSize: 13,
        color: WebColors.gray600,
        lineHeight: 1.3,
        marginTop: 0,
        marginBottom: 0,
        overflow: 'visible',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
        wordBreak: 'break-word',
        maxHeight: 'none',
      }),
    },
    
    badge: {
      ...getWebStyle({
        position: 'absolute' as const,
        top: -8,
        right: -8,
        backgroundColor: WebColors.error,
        color: WebColors.white,
        fontSize: WebTypography.fontSize.xs,
        fontWeight: WebTypography.fontWeight.bold,
        borderRadius: WebSpacing.full,
        width: 24,
        height: 24,
        textAlign: 'center' as const,
        lineHeight: '24px',
        border: `2px solid ${WebColors.white}`,
      }),
    },
    
    arrow: {
      ...getWebStyle({
        fontSize: 16,
        color: color,
        fontWeight: 'bold',
      }),
    },
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {badge !== undefined && badge > 0 && (
        <Text style={styles.badge}>{badge}</Text>
      )}
    </TouchableOpacity>
  );
};

export const ExchangesScreenWeb: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigation = useSimpleNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'available'>('all');
  
  // Mock data
  const [stats, setStats] = useState<ExchangeStats>({
    totalExchanges: 24,
    activeExchanges: 8,
    completedExchanges: 16,
    totalBobizEarned: 320,
    myOffers: 12,
    myRequests: 6,
  });

  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('📊 Chargement données échanges');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateExchange = () => {
    navigation.navigate('CreateExchange');
  };

  const handleTestBob = () => {
    navigation.navigate('BobTest');
  };

  const handleDataInjection = () => {
    navigation.navigate('DataInjection');
  };

  const handleVerifyStrapi = () => {
    navigation.navigate('VerifyStrapi');
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { 
      chatId: 'bob_chat_001', 
      chatTitle: 'Chat Bob - Perceuse Bosch' 
    });
  };

  const getBobizLevel = (points: number) => {
    if (points >= 1000) return '🏆 Légende';
    if (points >= 500) return '⭐ Super Bob';
    if (points >= 200) return '💫 Ami fidèle';
    return '🌱 Débutant';
  };

  const userBobizPoints = user?.bobizPoints || 0;
  const userLevel = getBobizLevel(userBobizPoints);

  const styles = {
    container: {
      ...getWebStyle({
        flex: 1,
        backgroundColor: WebColors.background,
      }),
    },

    welcomeSection: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        padding: WebSpacing.lg,
        borderRadius: WebSpacing.md,
        marginBottom: WebSpacing.md,
        boxShadow: `0 1px 2px 0 rgba(0, 0, 0, 0.08)`,
        border: `1px solid ${WebColors.border}`,
      }),
    },

    welcomeHeader: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: WebSpacing.sm,
      }),
    },

    welcomeText: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xl,
        fontWeight: WebTypography.fontWeight.bold,
        color: WebColors.gray900,
      }),
    },

    bobizInfo: {
      ...getWebStyle({
        textAlign: 'right' as const,
      }),
    },

    bobizPoints: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.lg,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.primary,
      }),
    },

    bobizLevel: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        color: WebColors.gray600,
        marginTop: WebSpacing.xs,
      }),
    },

    statsGrid: {
      ...getWebStyle({
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: WebSpacing.md,
        marginBottom: WebSpacing.lg,
      }),
    },

    section: {
      ...getWebStyle({
        marginBottom: WebSpacing.lg,
      }),
    },

    sectionTitle: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.xl,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray900,
        marginBottom: WebSpacing.lg,
      }),
    },

    actionsGrid: {
      ...getWebStyle({
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: WebSpacing.md,
      }),
    },

    recentSection: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        borderRadius: WebSpacing.lg,
        padding: WebSpacing.xl,
        boxShadow: `0 1px 3px 0 ${WebColors.shadow}`,
        border: `1px solid ${WebColors.border}`,
      }),
    },

    tabsContainer: {
      ...getWebStyle({
        flexDirection: 'row' as const,
        marginBottom: WebSpacing.lg,
        backgroundColor: WebColors.gray100,
        borderRadius: WebSpacing.md,
        padding: WebSpacing.xs,
      }),
    },

    tab: {
      ...getWebStyle({
        flex: 1,
        padding: `${WebSpacing.sm}px ${WebSpacing.md}px`,
        borderRadius: WebSpacing.sm,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }),
    },

    tabActive: {
      ...getWebStyle({
        backgroundColor: WebColors.white,
        boxShadow: `0 1px 2px 0 ${WebColors.shadow}`,
      }),
    },

    tabText: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.sm,
        fontWeight: WebTypography.fontWeight.medium,
        color: WebColors.gray600,
        textAlign: 'center' as const,
      }),
    },

    tabTextActive: {
      ...getWebStyle({
        color: WebColors.gray900,
      }),
    },

    emptyState: {
      ...getWebStyle({
        textAlign: 'center' as const,
        padding: WebSpacing.xl,
        color: WebColors.gray500,
      }),
    },

    emptyIcon: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize['4xl'],
        marginBottom: WebSpacing.md,
      }),
    },

    emptyTitle: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.lg,
        fontWeight: WebTypography.fontWeight.semibold,
        color: WebColors.gray700,
        marginBottom: WebSpacing.sm,
      }),
    },

    emptyDescription: {
      ...getWebStyle({
        fontSize: WebTypography.fontSize.base,
        color: WebColors.gray500,
        lineHeight: WebTypography.lineHeight.relaxed,
      }),
    },
  };

  if (!getWebStyle(true, false)) {
    // Fallback pour mobile - utiliser l'écran original
    return null;
  }

  return (
    <WebLayout title={t('exchanges.titleWeb')} activeScreen="Exchanges">
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Section d'accueil */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeText}>
              {t('exchanges.welcomeWeb', { username: user?.username || 'Ami Bob' })}
            </Text>
            <View style={styles.bobizInfo}>
              <Text style={styles.bobizPoints}>
                🏆 {userBobizPoints} Bobiz
              </Text>
              <Text style={styles.bobizLevel}>
                {userLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 {t('exchanges.stats.title')}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="📦"
              value={stats.totalExchanges}
              label={t('exchanges.stats.totalExchanges')}
              color={WebColors.primary}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              icon="⚡"
              value={stats.activeExchanges}
              label={t('exchanges.stats.activeBobs')}
              color={WebColors.accent}
              trend={{ value: 5, isPositive: true }}
            />
            <StatCard
              icon="✅"
              value={stats.completedExchanges}
              label={t('exchanges.stats.completedBobs')}
              color={WebColors.success}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              icon="💰"
              value={stats.totalBobizEarned}
              label={t('exchanges.stats.bobizEarned')}
              color={WebColors.warning}
              trend={{ value: 15, isPositive: true }}
            />
          </View>
        </View>

        {/* Actions rapides - Supprimées car déjà présentes dans la sidebar */}

        {/* Échanges récents */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>🕒 {t('exchanges.recentExchanges')}</Text>
          
          <View style={styles.tabsContainer}>
            {[
              { key: 'all', label: t('exchanges.categories.all') },
              { key: 'available', label: t('exchanges.categories.available') },
              { key: 'my', label: t('exchanges.myExchanges') }
            ].map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  activeTab === tab.key && styles.tabActive
                ]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {exchanges.length > 0 ? (
            <View>
              {/* TODO: Liste des échanges */}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>
                {t('exchanges.noExchanges')}
              </Text>
              <Text style={styles.emptyDescription}>
                {t('exchanges.noExchangesDesc')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </WebLayout>
  );
};