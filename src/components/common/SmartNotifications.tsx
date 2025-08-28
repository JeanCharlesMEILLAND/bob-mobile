// src/components/common/SmartNotifications.tsx - Système de notifications intelligentes
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { logger } from '../../utils/logger';
import { performanceManager } from '../../utils/performance';
import { Colors, Typography, Spacing } from '../../styles';

export interface SmartNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'tip';
  title: string;
  message?: string;
  duration?: number; // ms, 0 = permanent
  action?: {
    label: string;
    onPress: () => void;
  };
  priority: 'low' | 'normal' | 'high' | 'critical';
  persistent?: boolean;
  category?: string;
}

interface NotificationState extends SmartNotification {
  timestamp: number;
  shown: boolean;
  dismissed: boolean;
  interacted: boolean;
}

interface SmartNotificationsProps {
  position?: 'top' | 'bottom';
  maxVisible?: number;
  groupSimilar?: boolean;
}

class NotificationManager {
  private static instance: NotificationManager;
  private subscribers: ((notifications: NotificationState[]) => void)[] = [];
  private notifications: NotificationState[] = [];
  private notificationHistory: NotificationState[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  // Ajouter une notification avec déduplication intelligente
  show(notification: SmartNotification): string {
    const id = notification.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Si un ID spécifique est fourni, mettre à jour la notification existante au lieu de la remplacer
    if (notification.id) {
      const existingById = this.notifications.find(n => n.id === notification.id && !n.dismissed);
      if (existingById) {
        // Mise à jour in-place sans animation de suppression/création
        existingById.title = notification.title;
        existingById.message = notification.message;
        existingById.type = notification.type;
        existingById.priority = notification.priority;
        existingById.timestamp = Date.now(); // Mise à jour du timestamp
        
        this.notifySubscribers();
        logger.debug('notifications', 'Notification mise à jour par ID', { id: notification.id });
        return existingById.id;
      }
    }
    
    // Déduplication basée sur le type et le message (pour les notifications sans ID fixe)
    if (notification.category && !notification.id) {
      const existing = this.notifications.find(n => 
        n.category === notification.category && 
        n.type === notification.type &&
        !n.dismissed &&
        Date.now() - n.timestamp < 5000 // 5 secondes
      );
      
      if (existing) {
        logger.debug('notifications', 'Notification dédupliquée', { 
          category: notification.category,
          type: notification.type 
        });
        return existing.id;
      }
    }

    const notificationState: NotificationState = {
      ...notification,
      id,
      timestamp: Date.now(),
      shown: true,
      dismissed: false,
      interacted: false,
    };

    // Insérer selon la priorité
    const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
    let insertIndex = 0;
    
    for (let i = 0; i < this.notifications.length; i++) {
      if (priorityOrder[this.notifications[i].priority] <= priorityOrder[notification.priority]) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    this.notifications.splice(insertIndex, 0, notificationState);
    this.notificationHistory.push(notificationState);

    // Auto-dismiss si duration spécifiée
    if (notification.duration !== 0 && !notification.persistent) {
      const duration = notification.duration || this.getDefaultDuration(notification.type, notification.priority);
      
      const timer = setTimeout(() => {
        this.dismiss(id, 'auto');
      }, duration);
      
      this.timers.set(id, timer);
    }

    this.notifySubscribers();
    
    logger.info('notifications', 'Notification ajoutée', { 
      id, 
      type: notification.type, 
      priority: notification.priority 
    });

    return id;
  }

  // Calculer la durée par défaut selon le type et la priorité
  private getDefaultDuration(type: SmartNotification['type'], priority: SmartNotification['priority']): number {
    const baseDurations = {
      error: 6000,
      warning: 5000,
      success: 3000,
      info: 4000,
      tip: 8000
    };

    const priorityMultipliers = {
      critical: 2,
      high: 1.5,
      normal: 1,
      low: 0.8
    };

    return baseDurations[type] * priorityMultipliers[priority];
  }

  // Masquer une notification
  dismiss(id: string, reason: 'user' | 'auto' | 'action' = 'user'): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      if (reason === 'action') {
        notification.interacted = true;
      }
    }

    this.notifications = this.notifications.filter(n => n.id !== id);
    
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.notifySubscribers();
    
    logger.debug('notifications', 'Notification supprimée', { id, reason });
  }

  // Masquer toutes les notifications d'une catégorie
  dismissCategory(category: string): void {
    const toRemove = this.notifications.filter(n => n.category === category);
    toRemove.forEach(n => this.dismiss(n.id, 'user'));
    
    logger.debug('notifications', 'Catégorie supprimée', { category, count: toRemove.length });
  }

  // Obtenir les notifications visibles
  getVisible(maxCount?: number): NotificationState[] {
    let visible = this.notifications.filter(n => !n.dismissed);
    
    if (maxCount && visible.length > maxCount) {
      // Prioriser les notifications critiques et récentes
      visible = visible
        .sort((a, b) => {
          const priorityOrder = { critical: 4, high: 3, normal: 2, low: 1 };
          const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
          if (priorityDiff !== 0) return priorityDiff;
          return b.timestamp - a.timestamp;
        })
        .slice(0, maxCount);
    }

    return visible;
  }

  // S'abonner aux changements
  subscribe(callback: (notifications: NotificationState[]) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getVisible());
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(): void {
    const visible = this.getVisible();
    this.subscribers.forEach(callback => callback(visible));
  }

  // Statistiques et analytiques
  getStats(): {
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    dismissedCount: number;
    interactionRate: number;
  } {
    const total = this.notificationHistory.length;
    const dismissed = this.notificationHistory.filter(n => n.dismissed).length;
    const interacted = this.notificationHistory.filter(n => n.interacted).length;

    const byType = this.notificationHistory.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = this.notificationHistory.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byType,
      byPriority,
      dismissedCount: dismissed,
      interactionRate: total > 0 ? (interacted / total) * 100 : 0
    };
  }

  // Nettoyer l'historique ancien
  cleanup(): void {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    this.notificationHistory = this.notificationHistory.filter(n => n.timestamp > oneWeekAgo);
    
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
    
    logger.info('notifications', 'Nettoyage effectué');
  }
}

// Composant de notification individuelle
const NotificationCard: React.FC<{
  notification: NotificationState;
  onDismiss: (id: string) => void;
  position: 'top' | 'bottom';
}> = React.memo(({ notification, onDismiss, position }) => {
  const translateY = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 6,
      }),
    ]).start();
  }, []);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss(notification.id));
  };

  const getTypeConfig = (type: SmartNotification['type']) => {
    const configs = {
      success: { color: '#10B981', icon: '✅', bg: '#D1FAE5' },
      error: { color: '#EF4444', icon: '❌', bg: '#FEE2E2' },
      warning: { color: '#F59E0B', icon: '⚠️', bg: '#FEF3C7' },
      info: { color: '#3B82F6', icon: 'ℹ️', bg: '#DBEAFE' },
      tip: { color: '#8B5CF6', icon: '💡', bg: '#EDE9FE' },
    };
    return configs[type];
  };

  const typeConfig = getTypeConfig(notification.type);

  return (
    <Animated.View
      style={[
        notificationStyles.container,
        {
          backgroundColor: typeConfig.bg,
          borderLeftColor: typeConfig.color,
          transform: [{ translateY }, { scale }],
          opacity,
        }
      ]}
    >
      <TouchableOpacity
        style={notificationStyles.content}
        onPress={() => {
          if (notification.action) {
            notification.action.onPress();
            onDismiss(notification.id);
          }
        }}
        disabled={!notification.action}
      >
        <View style={notificationStyles.header}>
          <Text style={notificationStyles.icon}>{typeConfig.icon}</Text>
          <View style={notificationStyles.textContainer}>
            <Text style={[notificationStyles.title, { color: typeConfig.color }]}>
              {notification.title}
            </Text>
            {notification.message && (
              <Text style={notificationStyles.message}>
                {notification.message}
              </Text>
            )}
          </View>
          <TouchableOpacity onPress={dismiss} style={notificationStyles.dismissButton}>
            <Text style={notificationStyles.dismissText}>×</Text>
          </TouchableOpacity>
        </View>

        {notification.action && (
          <View style={notificationStyles.actionContainer}>
            <View style={notificationStyles.actionButtons}>
              {/* Bouton Annuler pour les confirmations */}
              {notification.type === 'warning' && notification.persistent && (
                <TouchableOpacity
                  style={[notificationStyles.actionButton, notificationStyles.cancelButton]}
                  onPress={dismiss}
                >
                  <Text style={notificationStyles.cancelText}>Annuler</Text>
                </TouchableOpacity>
              )}
              
              {/* Bouton principal d'action */}
              <TouchableOpacity
                style={[notificationStyles.actionButton, { backgroundColor: typeConfig.color }]}
                onPress={() => {
                  notification.action?.onPress();
                }}
              >
                <Text style={notificationStyles.confirmText}>
                  {notification.action.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Comparer les props pour éviter les re-rendus inutiles
  return (
    prevProps.notification.id === nextProps.notification.id &&
    prevProps.notification.title === nextProps.notification.title &&
    prevProps.notification.message === nextProps.notification.message &&
    prevProps.notification.type === nextProps.notification.type &&
    prevProps.position === nextProps.position
  );
});

// Composant principal
export const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  position = 'top',
  maxVisible = 3,
  groupSimilar = true,
}) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const manager = NotificationManager.getInstance();

  useEffect(() => {
    const unsubscribe = manager.subscribe((newNotifications) => {
      const visible = newNotifications.slice(0, maxVisible);
      setNotifications(visible);
    });

    return unsubscribe;
  }, [maxVisible]);

  const handleDismiss = (id: string) => {
    manager.dismiss(id, 'user');
  };

  if (notifications.length === 0) return null;

  return (
    <View style={[
      notificationStyles.overlay,
      { [position]: 50 }
    ]}>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
          position={position}
        />
      ))}
    </View>
  );
};

// Hook pour utiliser les notifications facilement
export const useNotifications = () => {
  const manager = NotificationManager.getInstance();

  return {
    success: (title: string, message?: string, options?: Partial<SmartNotification>) => 
      manager.show({ ...options, id: options?.id || `success_${Date.now()}`, type: 'success', title, message, priority: options?.priority || 'normal' }),
    
    error: (title: string, message?: string, options?: Partial<SmartNotification>) => 
      manager.show({ ...options, id: options?.id || `error_${Date.now()}`, type: 'error', title, message, priority: options?.priority || 'high' }),
    
    warning: (title: string, message?: string, options?: Partial<SmartNotification>) => 
      manager.show({ ...options, id: options?.id || `warning_${Date.now()}`, type: 'warning', title, message, priority: options?.priority || 'normal' }),
    
    info: (title: string, message?: string, options?: Partial<SmartNotification>) => 
      manager.show({ ...options, id: options?.id || `info_${Date.now()}`, type: 'info', title, message, priority: options?.priority || 'normal' }),
    
    tip: (title: string, message?: string, options?: Partial<SmartNotification>) => 
      manager.show({ ...options, id: options?.id || `tip_${Date.now()}`, type: 'tip', title, message, priority: options?.priority || 'low' }),

    // 🆕 NOUVEAU: Notification de confirmation avec boutons Annuler/Confirmer
    confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void, options?: Partial<SmartNotification>) => {
      const confirmId = `confirm_${Date.now()}`;
      return manager.show({ 
        ...options, 
        id: confirmId, 
        type: 'warning', 
        title, 
        message, 
        priority: 'high',
        duration: 0, // Pas d'auto-dismiss
        persistent: true,
        action: {
          label: 'Confirmer',
          onPress: () => {
            onConfirm();
            manager.dismiss(confirmId, 'action');
          }
        }
      });
    },

    dismiss: (id: string) => manager.dismiss(id, 'user'),
    dismissCategory: (category: string) => manager.dismissCategory(category),
    getStats: () => manager.getStats(),
  };
};

const notificationStyles = {
  overlay: {
    position: 'absolute' as any,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 9999,
    pointerEvents: 'box-none' as any,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: Spacing.sm,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
  },
  icon: {
    fontSize: 20,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.base, // Use 'base' instead of 'md'
    fontWeight: Typography.weights.semibold as any,
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginTop: -4,
  },
  dismissText: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.normal as any, // Use 'normal' instead of 'light'
  },
  actionContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'flex-end' as const,
    gap: Spacing.sm,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center' as const,
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium as any,
    color: Colors.textSecondary,
  },
  confirmText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium as any,
    color: Colors.white,
  },
  actionText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium as any,
    textTransform: 'uppercase' as any,
  },
};

// Instance singleton du NotificationManager pour utilisation externe
export const notificationManager = NotificationManager.getInstance();