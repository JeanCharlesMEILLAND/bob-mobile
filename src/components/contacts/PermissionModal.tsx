// src/components/contacts/PermissionModal.tsx - Modal de demande de permission
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { styles } from './PermissionModal.styles';

interface PermissionModalProps {
  visible: boolean;
  slideAnim: Animated.Value;
  isLoading: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  visible,
  slideAnim,
  isLoading,
  onClose,
  onAccept,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modal,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                })
              }]
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📱</Text>
            <Text style={styles.icon}>🤝</Text>
            <Text style={styles.icon}>🔒</Text>
          </View>
          
          <Text style={styles.title}>Accéder à vos contacts</Text>
          <Text style={styles.description}>
            Bob a besoin d'accéder à votre répertoire pour vous proposer vos proches 
            et faciliter les invitations.
          </Text>
          
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Vos données restent privées et sécurisées</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Vous choisissez qui ajouter à Bob</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚫</Text>
              <Text style={styles.featureText}>Aucun spam, aucune publicité</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={onClose}
            >
              <Text style={styles.declineText}>Plus tard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.acceptText}>Autoriser l'accès</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};