// src/components/common/SmartDashboard.tsx - Dashboard intelligent et adaptatif
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { logger } from '../../utils/logger';
import { performanceManager } from '../../utils/performance';
import { Colors, Typography, Spacing } from '../../styles';

interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface SmartDashboardProps {
  metrics: MetricCard[];
  onRefresh?: () => Promise<void>;
  title?: string;
  subtitle?: string;
  compactMode?: boolean;
  customLayout?: 'grid' | 'list' | 'mixed';
}

interface LayoutConfig {
  columns: number;
  cardHeight: number;
  spacing: number;
}

export const SmartDashboard: React.FC<SmartDashboardProps> = ({
  metrics,
  onRefresh,
  title = 'Dashboard',
  subtitle,
  compactMode = false,
  customLayout = 'mixed'
}) => {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [layout, setLayout] = useState<LayoutConfig>({ columns: 2, cardHeight: 120, spacing: 12 });
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Optimisation responsive
  const screenData = Dimensions.get('window');
  const isTablet = screenData.width > 768;
  const isWide = screenData.width > 480;

  // Calculer le layout optimal
  const optimalLayout = useMemo(() => {
    const baseConfig: LayoutConfig = {
      columns: isTablet ? 4 : isWide ? 2 : 1,
      cardHeight: compactMode ? 80 : isTablet ? 140 : 120,
      spacing: isTablet ? 16 : 12
    };

    // Ajuster selon le nombre de métriques et leur priorité
    const highPriorityCount = metrics.filter(m => m.priority === 'high').length;
    
    if (customLayout === 'list') {
      baseConfig.columns = 1;
      baseConfig.cardHeight = 60;
    } else if (customLayout === 'grid') {
      baseConfig.columns = isTablet ? 3 : 2;
    } else if (customLayout === 'mixed') {
      // Layout mixte : priorité haute = pleine largeur
      if (highPriorityCount > 0 && metrics.length > 4) {
        baseConfig.columns = isTablet ? 3 : 2;
      }
    }

    return baseConfig;
  }, [screenData.width, metrics.length, compactMode, customLayout, isTablet, isWide]);

  // Organiser les métriques par priorité et optimiser l'affichage
  const organizedMetrics = useMemo(() => {
    return performanceManager.measure('dashboard-metrics-organization', () => {
      const sorted = [...metrics].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Grouper pour le layout mixte
      if (customLayout === 'mixed') {
        const highPriority = sorted.filter(m => m.priority === 'high');
        const others = sorted.filter(m => m.priority !== 'high');
        return { highPriority, others, all: sorted };
      }

      return { highPriority: [], others: [], all: sorted };
    });
  }, [metrics, customLayout]);

  // Animation d'entrée
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Gestion du refresh optimisée
  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;

    setRefreshing(true);
    try {
      await performanceManager.measure('dashboard-refresh', async () => {
        await onRefresh();
      });
      logger.info('dashboard', 'Refresh terminé avec succès');
    } catch (error) {
      logger.error('dashboard', 'Erreur lors du refresh', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Rendu d'une carte métrique
  const renderMetricCard = (metric: MetricCard, index: number, fullWidth: boolean = false) => {
    const cardWidth = fullWidth 
      ? '100%' 
      : `${(100 / optimalLayout.columns) - (optimalLayout.spacing / optimalLayout.columns)}%`;

    const trendColor = metric.trend === 'up' ? '#10B981' : 
                      metric.trend === 'down' ? '#EF4444' : '#6B7280';
    const trendIcon = metric.trend === 'up' ? '↗️' : 
                     metric.trend === 'down' ? '↘️' : '→';

    return (
      <Animated.View
        key={metric.id}
        style={[
          styles.metricCard,
          {
            width: cardWidth,
            height: optimalLayout.cardHeight,
            backgroundColor: metric.color + '10',
            borderLeftColor: metric.color,
            marginBottom: optimalLayout.spacing,
            transform: [
              { translateY: slideAnim },
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          onPress={metric.action?.onPress}
          disabled={!metric.action}
          activeOpacity={metric.action ? 0.7 : 1}
        >
          {/* Header avec icône et titre */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{metric.icon}</Text>
            <View style={styles.cardTitleContainer}>
              <Text style={[styles.cardTitle, { color: metric.color }]} numberOfLines={1}>
                {metric.title}
              </Text>
              {metric.trend && metric.trendValue && (
                <View style={styles.trendContainer}>
                  <Text style={[styles.trendIcon, { color: trendColor }]}>
                    {trendIcon}
                  </Text>
                  <Text style={[styles.trendValue, { color: trendColor }]}>
                    {metric.trendValue}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Valeur principale */}
          <Text style={[styles.cardValue, { color: metric.color }]} numberOfLines={1}>
            {metric.value}
          </Text>

          {/* Sous-titre */}
          {metric.subtitle && (
            <Text style={styles.cardSubtitle} numberOfLines={compactMode ? 1 : 2}>
              {metric.subtitle}
            </Text>
          )}

          {/* Action button */}
          {metric.action && (
            <View style={styles.cardAction}>
              <Text style={[styles.actionLabel, { color: metric.color }]}>
                {metric.action.label}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* Contenu scrollable */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Layout mixte : priorité haute en premier */}
        {customLayout === 'mixed' && organizedMetrics.highPriority.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Priorités</Text>
            </View>
            <View style={styles.metricsContainer}>
              {organizedMetrics.highPriority.map((metric, index) =>
                renderMetricCard(metric, index, true)
              )}
            </View>
          </>
        )}

        {/* Métriques principales */}
        <View style={[
          styles.metricsContainer,
          { justifyContent: optimalLayout.columns === 1 ? 'flex-start' : 'space-between' }
        ]}>
          {(customLayout === 'mixed' ? organizedMetrics.others : organizedMetrics.all)
            .map((metric, index) => renderMetricCard(metric, index))}
        </View>

        {/* Métriques de performance si développement */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.debugInfo}
            onPress={() => {
              const metrics = performanceManager.getMetrics();
              logger.info('dashboard', 'Métriques de performance', metrics);
            }}
          >
            <Text style={styles.debugText}>
              🔧 Layout: {optimalLayout.columns} cols • Performance: Tap pour logs
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold as any,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold as any,
    color: Colors.text,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap' as any,
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    padding: Spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium as any,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  trendIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  trendValue: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium as any,
  },
  cardValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold as any,
    marginVertical: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  cardAction: {
    alignSelf: 'flex-start',
  },
  actionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium as any,
    textTransform: 'uppercase' as any,
  },
  debugInfo: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  debugText: {
    fontSize: Typography.sizes.xs,
    color: '#6B7280',
    textAlign: 'center' as any,
  },
};