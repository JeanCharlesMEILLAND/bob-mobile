// src/components/contacts/EmptyStateView.tsx - Composant pour l'état vide
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { styles } from './EmptyStateView.styles';
import { getRelativeTime } from '../../utils/dateHelpers';

interface EmptyStateViewProps {
  contactsBruts: any[];
  isLoading: boolean;
  lastScanDate: string | null;
  pulseAnim: Animated.Value;
  onRequestPermission: () => void;
  onSelectContacts: () => void;
  onClearCache: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  contactsBruts,
  isLoading,
  lastScanDate,
  pulseAnim,
  onRequestPermission,
  onSelectContacts,
  onClearCache,
}) => {
  const handleClearCache = () => {
    Alert.alert(
      '💾 Vider le cache',
      'Supprimer toutes les données et recommencer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Vider', style: 'destructive', onPress: onClearCache }
      ]
    );
  };

  return (
    <View style={styles.emptyState}>
      <View style={styles.illustration}>
        <Text style={styles.emptyIcon}>👥</Text>
        <View style={styles.emptyIconBackground} />
      </View>
      
      <Text style={styles.emptyTitle}>Bienvenue dans Bob !</Text>
      <Text style={styles.emptyDescription}>
        Créez votre réseau de contacts pour faciliter l'entraide avec vos proches, voisins et collègues.
      </Text>

      {/* Guide visuel */}
      <View style={styles.steps}>
        <View style={styles.step}>
          <Text style={styles.stepNumber}>1</Text>
          <Text style={styles.stepText}>Importez vos contacts</Text>
        </View>
        <View style={styles.stepDivider} />
        <View style={styles.step}>
          <Text style={styles.stepNumber}>2</Text>
          <Text style={styles.stepText}>Invitez-les sur Bob</Text>
        </View>
        <View style={styles.stepDivider} />
        <View style={styles.step}>
          <Text style={styles.stepNumber}>3</Text>
          <Text style={styles.stepText}>Entraidez-vous !</Text>
        </View>
      </View>

      {contactsBruts.length === 0 ? (
        /* Pas encore scanné */
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onRequestPermission}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.primaryButtonIcon}>📱</Text>
                <Text style={styles.primaryButtonText}>
                  Commencer avec mon répertoire
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      ) : (
        /* Contacts scannés mais aucun sélectionné */
        <View style={styles.scannedActions}>
          <View style={styles.scanResultCard}>
            <Text style={styles.scanResultIcon}>✨</Text>
            <Text style={styles.scanResultNumber}>{contactsBruts.length}</Text>
            <Text style={styles.scanResultLabel}>contacts trouvés</Text>
            {lastScanDate && (
              <Text style={styles.scanDate}>
                Scanné {getRelativeTime(lastScanDate)}
              </Text>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={onSelectContacts}
            >
              <Text style={styles.primaryButtonIcon}>➕</Text>
              <Text style={styles.primaryButtonText}>
                Sélectionner mes contacts
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onRequestPermission}
              disabled={isLoading}
            >
              <Text style={styles.secondaryButtonText}>🔄 Rescanner</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleClearCache}
            >
              <Text style={styles.secondaryButtonText}>🗑️ Effacer tout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};