// src/components/common/CustomAlert.tsx - Alert stylisée selon votre design system
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { styles } from './CustomAlert.styles';

export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive' | 'primary';
  onPress?: () => void;
  loading?: boolean;
}

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  icon?: string;
  buttons?: AlertButton[];
  onClose?: () => void;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  icon = '⚠️',
  buttons = [{ text: 'OK', style: 'primary' }],
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onClose && button.style !== 'destructive') {
      onClose();
    }
  };

  const handleBackgroundPress = () => {
    // Permettre fermeture en tapant à côté seulement si pas de bouton destructif
    const hasDestructive = buttons.some(b => b.style === 'destructive');
    if (!hasDestructive && onClose) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={handleBackgroundPress}
      >
        <TouchableOpacity activeOpacity={1}>
          <Animated.View 
            style={[
              styles.modal,
              {
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  })
                }],
                opacity: slideAnim,
              }
            ]}
          >
            {/* Icône */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>
            
            {/* Titre */}
            <Text style={styles.title}>{title}</Text>
            
            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Boutons */}
            <View style={styles.buttonsContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style === 'cancel' && styles.cancelButton,
                    button.style === 'destructive' && styles.destructiveButton,
                    button.style === 'primary' && styles.primaryButton,
                    buttons.length === 1 && styles.singleButton,
                  ]}
                  onPress={() => handleButtonPress(button)}
                  disabled={button.loading}
                >
                  {button.loading ? (
                    <ActivityIndicator 
                      color={button.style === 'primary' ? 'white' : '#3B82F6'} 
                      size="small" 
                    />
                  ) : (
                    <Text style={[
                      styles.buttonText,
                      button.style === 'cancel' && styles.cancelButtonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'primary' && styles.primaryButtonText,
                    ]}>
                      {button.text}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

// Hook pour simplifier l'utilisation
export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = React.useState<CustomAlertProps | null>(null);

  const showAlert = (config: Omit<CustomAlertProps, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig(prev => prev ? { ...prev, visible: false } : null);
  };

  // Fonctions helper pour différents types d'alertes
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      icon: '❓',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: onCancel },
        { text: 'Confirmer', style: 'primary', onPress: onConfirm },
      ],
      onClose: hideAlert,
    });
  };

  const showDestructive = (
    title: string,
    message: string,
    confirmText: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      icon: '🗑️',
      buttons: [
        { text: 'Annuler', style: 'cancel', onPress: onCancel },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ],
      onClose: hideAlert,
    });
  };

  const showSuccess = (title: string, message?: string) => {
    showAlert({
      title,
      message,
      icon: '✅',
      buttons: [{ text: 'OK', style: 'primary' }],
      onClose: hideAlert,
    });
  };

  const showError = (title: string, message?: string) => {
    showAlert({
      title,
      message,
      icon: '❌',
      buttons: [{ text: 'OK', style: 'primary' }],
      onClose: hideAlert,
    });
  };

  const AlertComponent = alertConfig ? (
    <CustomAlert {...alertConfig} />
  ) : null;

  return {
    showAlert,
    hideAlert,
    showConfirm,
    showDestructive,
    showSuccess,
    showError,
    AlertComponent,
  };
};