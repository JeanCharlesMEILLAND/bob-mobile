// src/components/ui/NetworkIndicator.tsx - Indicateur de statut réseau

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useNetworkStatusIndicator } from '../../utils/useNetworkState';

interface NetworkIndicatorProps {
  style?: any;
  showText?: boolean;
  position?: 'top' | 'bottom';
  onPress?: () => void;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({
  style,
  showText = true,
  position = 'top',
  onPress,
}) => {
  const statusConfig = useNetworkStatusIndicator();
  const [showDetails, setShowDetails] = React.useState(false);
  const slideAnim = React.useRef(new Animated.Value(-50)).current;

  React.useEffect(() => {
    // Animation d'apparition
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [statusConfig.isOnline]);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!statusConfig.isOnline && statusConfig.queueInfo.count > 0) {
      setShowDetails(true);
    }
  };

  if (statusConfig.isOnline && !statusConfig.showQueue) {
    return null; // Masquer quand tout va bien
  }

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: statusConfig.color,
            transform: [
              {
                translateY: position === 'top' 
                  ? slideAnim 
                  : Animated.multiply(slideAnim, -1)
              }
            ]
          },
          style,
        ]}
      >
        <TouchableOpacity
          style={styles.content}
          onPress={handlePress}
          disabled={!statusConfig.showQueue && statusConfig.isOnline}
        >
          <Text style={styles.icon}>{statusConfig.icon}</Text>
          
          {showText && (
            <Text style={styles.text}>
              {statusConfig.text}
              {statusConfig.showQueue && ` (${statusConfig.queueText})`}
            </Text>
          )}

          {statusConfig.showQueue && (
            <Text style={styles.tapHint}>Toucher pour détails</Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Modal de détails pour la queue */}
      <QueueDetailsModal
        visible={showDetails}
        onClose={() => setShowDetails(false)}
        queueInfo={statusConfig.queueInfo}
      />
    </>
  );
};

// =================== FLOATING NETWORK INDICATOR ===================

interface FloatingNetworkIndicatorProps {
  bottom?: number;
  right?: number;
}

export const FloatingNetworkIndicator: React.FC<FloatingNetworkIndicatorProps> = ({
  bottom = 80,
  right = 20,
}) => {
  const statusConfig = useNetworkStatusIndicator();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const shouldShow = !statusConfig.isOnline || statusConfig.queueInfo.count > 0;
    
    if (shouldShow && !isVisible) {
      setIsVisible(true);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else if (!shouldShow && isVisible) {
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 150,
        friction: 8,
        useNativeDriver: true,
      }).start(() => setIsVisible(false));
    }
  }, [statusConfig.isOnline, statusConfig.queueInfo.count, isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.floatingContainer,
        {
          bottom,
          right,
          backgroundColor: statusConfig.color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Text style={styles.floatingIcon}>{statusConfig.icon}</Text>
      
      {statusConfig.showQueue && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{statusConfig.queueInfo.count}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// =================== QUEUE DETAILS MODAL ===================

interface QueueDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  queueInfo: {
    count: number;
    isProcessing: boolean;
  };
}

const QueueDetailsModal: React.FC<QueueDetailsModalProps> = ({
  visible,
  onClose,
  queueInfo,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              📤 Requêtes en attente
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nombre de requêtes:</Text>
              <Text style={styles.infoValue}>{queueInfo.count}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Statut:</Text>
              <Text style={styles.infoValue}>
                {queueInfo.isProcessing ? 'Traitement en cours...' : 'En attente de connexion'}
              </Text>
            </View>

            <View style={styles.explanation}>
              <Text style={styles.explanationTitle}>ℹ️ Information</Text>
              <Text style={styles.explanationText}>
                Ces actions ont été sauvegardées et seront automatiquement 
                exécutées dès que vous serez reconnecté à Internet.
              </Text>
              
              <Text style={styles.explanationText}>
                Aucune donnée ne sera perdue. L'application continue de 
                fonctionner normalement en mode hors ligne.
              </Text>
            </View>

            {queueInfo.isProcessing && (
              <View style={styles.processingIndicator}>
                <Text style={styles.processingText}>
                  🔄 Synchronisation en cours...
                </Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.okButton}
            onPress={onClose}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// =================== STYLES ===================

const styles = StyleSheet.create({
  // Indicateur principal
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tapHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Indicateur flottant
  floatingContainer: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingIcon: {
    fontSize: 20,
    color: 'white',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  explanation: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  processingIndicator: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  processingText: {
    fontSize: 14,
    color: '#1E40AF',
    fontWeight: '500',
  },
  okButton: {
    margin: 20,
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkIndicator;