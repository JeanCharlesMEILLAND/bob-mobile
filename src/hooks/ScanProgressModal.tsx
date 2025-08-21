// src/components/contacts/ScanProgressModal.tsx - Progrès de scan moderne
import React from 'react';
import {
  View,
  Text,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

interface ScanProgress {
  phase: 'permissions' | 'reading' | 'processing' | 'matching' | 'saving' | 'complete';
  progress: number;
  currentCount?: number;
  totalCount?: number;
  message?: string;
}

interface ScanProgressModalProps {
  visible: boolean;
  progress: ScanProgress;
  onClose?: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

export const ScanProgressModal: React.FC<ScanProgressModalProps> = ({
  visible,
  progress,
  onClose,
}) => {
  const progressAnimated = React.useRef(new Animated.Value(0)).current;
  const scaleAnimated = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnimated, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  React.useEffect(() => {
    Animated.timing(progressAnimated, {
      toValue: progress.progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress.progress]);

  const getPhaseInfo = (phase: string) => {
    switch (phase) {
      case 'permissions':
        return { icon: '🔐', title: 'Autorisations', color: '#FF9800' };
      case 'reading':
        return { icon: '📖', title: 'Lecture contacts', color: '#2196F3' };
      case 'processing':
        return { icon: '⚙️', title: 'Traitement', color: '#9C27B0' };
      case 'matching':
        return { icon: '🔍', title: 'Recherche Bob', color: '#4CAF50' };
      case 'saving':
        return { icon: '💾', title: 'Sauvegarde', color: '#607D8B' };
      case 'complete':
        return { icon: '✅', title: 'Terminé', color: '#4CAF50' };
      default:
        return { icon: '📱', title: 'Scan', color: '#2196F3' };
    }
  };

  const phaseInfo = getPhaseInfo(progress.phase);
  const progressPercent = Math.round(progress.progress);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[
          styles.modalContainer,
          { transform: [{ scale: scaleAnimated }] }
        ]}>
          {/* Header avec icône phase */}
          <View style={styles.header}>
            <View style={[styles.phaseIcon, { backgroundColor: phaseInfo.color + '20' }]}>
              <Text style={styles.phaseIconText}>{phaseInfo.icon}</Text>
            </View>
            <Text style={styles.title}>Scan du répertoire</Text>
            <Text style={[styles.phaseTitle, { color: phaseInfo.color }]}>
              {phaseInfo.title}
            </Text>
          </View>

          {/* Barre de progression animée */}
          <View style={styles.progressSection}>
            <View style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    backgroundColor: phaseInfo.color,
                    width: progressAnimated.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              />
            </View>
            
            <Text style={styles.progressText}>
              {progressPercent}%
            </Text>
          </View>

          {/* Détails du progrès */}
          <View style={styles.detailsSection}>
            {progress.message && (
              <Text style={styles.messageText}>
                {progress.message}
              </Text>
            )}
            
            {progress.currentCount !== undefined && progress.totalCount !== undefined && (
              <View style={styles.countsContainer}>
                <Text style={styles.countsText}>
                  {progress.currentCount.toLocaleString()} / {progress.totalCount.toLocaleString()} contacts
                </Text>
                <View style={styles.miniProgressBar}>
                  <View
                    style={[
                      styles.miniProgressFill,
                      {
                        width: `${Math.round((progress.currentCount / progress.totalCount) * 100)}%`,
                        backgroundColor: phaseInfo.color,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Animation de chargement */}
          <View style={styles.loadingSection}>
            <ActivityIndicator 
              size="large" 
              color={phaseInfo.color}
              style={styles.spinner}
            />
            
            {/* Phases progress dots */}
            <View style={styles.phaseDots}>
              {['permissions', 'reading', 'processing', 'matching', 'saving'].map((phase, index) => {
                const isActive = ['permissions', 'reading', 'processing', 'matching', 'saving'].indexOf(progress.phase) >= index;
                const isCurrent = progress.phase === phase;
                
                return (
                  <View
                    key={phase}
                    style={[
                      styles.phaseDot,
                      isActive && styles.phaseDotActive,
                      isCurrent && styles.phaseDotCurrent,
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Estimation temps restant */}
          {progress.progress > 10 && progress.progress < 100 && (
            <View style={styles.estimationSection}>
              <Text style={styles.estimationText}>
                ⏱️ Estimation : {Math.round((100 - progress.progress) / 10)} secondes
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: Math.min(screenWidth - 40, 320),
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  phaseIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  phaseIconText: {
    fontSize: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailsSection: {
    marginBottom: 20,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  countsContainer: {
    alignItems: 'center',
  },
  countsText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  miniProgressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#F0F0F0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  loadingSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  phaseDots: {
    flexDirection: 'row',
    gap: 8,
  },
  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  phaseDotActive: {
    backgroundColor: '#4CAF50',
  },
  phaseDotCurrent: {
    backgroundColor: '#2196F3',
    transform: [{ scale: 1.5 }],
  },
  estimationSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  estimationText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});