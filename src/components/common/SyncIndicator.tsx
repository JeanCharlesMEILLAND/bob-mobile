// src/components/common/SyncIndicator.tsx - Indicateur visuel de synchronisation
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRealTimeSync } from '../../utils/realTimeSync';
import { Colors, Typography, Spacing } from '../../styles';

interface SyncIndicatorProps {
  position?: 'top' | 'bottom';
  showDetails?: boolean;
  onTap?: () => void;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({
  position = 'top',
  showDetails = false,
  onTap
}) => {
  const { syncState, stats } = useRealTimeSync();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -50 : 50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Déterminer l'état de sync
  const getSyncStatus = () => {
    if (stats.pendingOps > 0 || stats.queueLength > 0) {
      return {
        status: 'syncing',
        color: '#F59E0B',
        icon: '🔄',
        message: `${stats.pendingOps} en attente...`,
        bgColor: '#FEF3C7'
      };
    }
    
    if (stats.failedOps > 0) {
      return {
        status: 'error',
        color: '#EF4444',
        icon: '⚠️',
        message: `${stats.failedOps} échec(s)`,
        bgColor: '#FEE2E2'
      };
    }
    
    if (stats.lastSyncAgo < 5000) { // Moins de 5 secondes
      return {
        status: 'success',
        color: '#10B981',
        icon: '✅',
        message: 'Synchronisé',
        bgColor: '#D1FAE5'
      };
    }
    
    return {
      status: 'idle',
      color: '#6B7280',
      icon: '📡',
      message: 'En attente',
      bgColor: '#F3F4F6'
    };
  };

  const syncStatus = getSyncStatus();
  const shouldShow = syncStatus.status !== 'idle' || showDetails;

  // Animation de pulse pendant la sync
  useEffect(() => {
    if (syncStatus.status === 'syncing') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [syncStatus.status, pulseAnim]);

  // Animation d'apparition/disparition
  useEffect(() => {
    if (shouldShow) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: position === 'top' ? -50 : 50,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow, slideAnim, opacityAnim, position]);

  if (!shouldShow) return null;

  const formatLastSync = (ms: number) => {
    if (ms < 1000) return 'maintenant';
    if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.floor(ms / 60000)}min`;
    return `${Math.floor(ms / 3600000)}h`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: syncStatus.bgColor,
          borderLeftColor: syncStatus.color,
          [position]: 0,
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ],
          opacity: opacityAnim,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onTap}
        disabled={!onTap}
        activeOpacity={onTap ? 0.7 : 1}
      >
        <View style={styles.mainInfo}>
          <Text style={styles.icon}>{syncStatus.icon}</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.message, { color: syncStatus.color }]}>
              {syncStatus.message}
            </Text>
            {showDetails && (
              <Text style={styles.details}>
                Dernière sync: {formatLastSync(stats.lastSyncAgo)}
              </Text>
            )}
          </View>
        </View>

        {/* Progress bar si sync en cours */}
        {syncStatus.status === 'syncing' && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  backgroundColor: syncStatus.color,
                  width: `${Math.max(10, (stats.pendingOps / (stats.pendingOps + 5)) * 100)}%`
                }
              ]}
            />
          </View>
        )}

        {/* Bouton action si erreur */}
        {syncStatus.status === 'error' && onTap && (
          <View style={styles.actionContainer}>
            <Text style={[styles.actionText, { color: syncStatus.color }]}>
              Appuyer pour détails
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Hook pour gérer l'état de l'indicateur
export const useSyncIndicator = () => {
  const { syncState, stats } = useRealTimeSync();
  
  return {
    shouldShow: stats.pendingOps > 0 || stats.failedOps > 0 || stats.lastSyncAgo < 3000,
    pendingCount: stats.pendingOps,
    failedCount: stats.failedOps,
    isOnline: stats.lastSyncAgo < 30000, // Considéré en ligne si sync dans les 30s
    lastSync: stats.lastSyncAgo,
    syncState
  };
};

// Composant compact pour la barre de statut
export const SyncStatusBadge: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { stats } = useRealTimeSync();
  
  if (stats.pendingOps === 0 && stats.failedOps === 0) {
    return null;
  }

  const hasErrors = stats.failedOps > 0;
  const color = hasErrors ? '#EF4444' : '#F59E0B';
  const icon = hasErrors ? '⚠️' : '🔄';
  const count = hasErrors ? stats.failedOps : stats.pendingOps;

  return (
    <TouchableOpacity
      style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.badgeIcon}>{icon}</Text>
      <Text style={[styles.badgeText, { color }]}>{count}</Text>
    </TouchableOpacity>
  );
};

const styles = {
  container: {
    position: 'absolute' as any,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  content: {
    padding: Spacing.sm,
  },
  mainInfo: {
    flexDirection: 'row' as any,
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium as any,
  },
  details: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: {
    height: 2,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
    marginTop: Spacing.sm,
    overflow: 'hidden' as any,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1,
  },
  actionContainer: {
    marginTop: Spacing.xs,
  },
  actionText: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center' as any,
    fontStyle: 'italic' as any,
  },
  badge: {
    flexDirection: 'row' as any,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  badgeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium as any,
  },
};