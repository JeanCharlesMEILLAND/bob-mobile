// src/components/notifications/NotificationTestPanel.tsx - Panel de test notifications
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * Panel de test et debug pour les notifications push
 */
export const NotificationTestPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    pushToken,
    isPushReady,
    sendTestNotification,
    markAllAsRead,
    requestPermissions,
    initializePush
  } = useNotifications();

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('✅ Succès', 'Notification de test envoyée !');
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible d\'envoyer la notification de test');
    }
  };

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    Alert.alert(
      granted ? '✅ Permissions accordées' : '❌ Permissions refusées',
      granted 
        ? 'Les notifications push sont maintenant activées'
        : 'Veuillez activer les notifications dans les paramètres'
    );
  };

  const handleInitializePush = async () => {
    const success = await initializePush();
    Alert.alert(
      success ? '✅ Initialisé' : '❌ Échec',
      success 
        ? 'Service push notifications initialisé'
        : 'Échec d\'initialisation du service push'
    );
  };

  const showTokenInfo = () => {
    if (pushToken) {
      Alert.alert(
        '🔑 Token Expo Push',
        `Token: ${pushToken.substring(0, 30)}...\n\nCe token est utilisé pour envoyer des notifications push à cet appareil.`,
        [
          { text: 'Copier', onPress: () => {/* TODO: Copy to clipboard */} },
          { text: 'OK' }
        ]
      );
    } else {
      Alert.alert('⚠️ Token manquant', 'Aucun token push disponible. Initialisez d\'abord le service.');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔔 Notifications Push - Test</Text>
        <Text style={styles.subtitle}>Panel de debug et test des notifications</Text>
      </View>

      {/* Statut */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Statut du Service</Text>
        
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Feather 
              name={isPushReady ? "check-circle" : "x-circle"} 
              size={20} 
              color={isPushReady ? "#10b981" : "#ef4444"} 
            />
            <Text style={styles.statusText}>
              Service Push: {isPushReady ? 'Actif' : 'Inactif'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Feather 
              name={pushToken ? "key" : "alert-triangle"} 
              size={20} 
              color={pushToken ? "#3b82f6" : "#f59e0b"} 
            />
            <Text style={styles.statusText}>
              Token: {pushToken ? 'Généré' : 'Manquant'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Feather 
              name="bell" 
              size={20} 
              color={unreadCount > 0 ? "#ef4444" : "#6b7280"} 
            />
            <Text style={styles.statusText}>
              Non lues: {unreadCount}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Feather 
              name="list" 
              size={20} 
              color="#6b7280" 
            />
            <Text style={styles.statusText}>
              Total: {notifications.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Actions de Test</Text>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleTestNotification}
          disabled={!isPushReady}
        >
          <Feather name="send" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Envoyer Notification Test</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleRequestPermissions}
        >
          <Feather name="shield" size={20} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>Demander Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleInitializePush}
        >
          <Feather name="play-circle" size={20} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>Réinitialiser Service</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={showTokenInfo}
        >
          <Feather name="info" size={20} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>Infos Token</Text>
        </TouchableOpacity>

        {unreadCount > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.warningButton]}
            onPress={markAllAsRead}
          >
            <Feather name="check-circle" size={20} color="#f59e0b" />
            <Text style={styles.warningButtonText}>Marquer Toutes Lues</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Erreurs */}
      {error && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Erreur</Text>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}

      {/* Dernières notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📬 Dernières Notifications</Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : notifications.length > 0 ? (
          <View style={styles.notificationsList}>
            {notifications.slice(0, 5).map((notification, index) => (
              <View key={notification.id || index} style={styles.notificationItem}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>{notification.titre}</Text>
                  <View style={[
                    styles.statusBadge,
                    notification.lue ? styles.readBadge : styles.unreadBadge
                  ]}>
                    <Text style={[
                      styles.statusBadgeText,
                      notification.lue ? styles.readBadgeText : styles.unreadBadgeText
                    ]}>
                      {notification.lue ? 'Lue' : 'Non lue'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationMeta}>
                  {notification.type} • {notification.priorite} • {new Date(notification.dateCreation).toLocaleString('fr-FR')}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucune notification</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    minWidth: '45%',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  warningButton: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  warningButtonText: {
    color: '#f59e0b',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  notificationsList: {
    gap: 12,
  },
  notificationItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationMeta: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  readBadge: {
    backgroundColor: '#d1fae5',
  },
  unreadBadge: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readBadgeText: {
    color: '#059669',
  },
  unreadBadgeText: {
    color: '#dc2626',
  },
});

export default NotificationTestPanel;