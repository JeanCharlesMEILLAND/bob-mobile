import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button } from '../common';
import { modernColors } from '../common/ModernUI';
import { biometricService, BiometricCapability } from '../../services/biometric.service';

interface BiometricPromptProps {
  onSuccess: (identifier?: string) => void;
  onCancel?: () => void;
  onFallback?: () => void;
  customMessage?: string;
  showSetupOption?: boolean;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  onSuccess,
  onCancel,
  onFallback,
  customMessage,
  showSetupOption = true
}) => {
  const { t } = useTranslation();
  const [capability, setCapability] = useState<BiometricCapability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canEnableBiometric, setCanEnableBiometric] = useState<{
    canEnable: boolean;
    reason?: string;
  }>({ canEnable: false });

  useEffect(() => {
    checkBiometricCapability();
  }, []);

  const checkBiometricCapability = async () => {
    setIsLoading(true);
    
    try {
      const cap = await biometricService.checkCapability();
      const canEnable = await biometricService.canEnableBiometric();
      
      setCapability(cap);
      setCanEnableBiometric(canEnable);
    } catch (error) {
      console.error('Erreur vérification biométrie:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const success = await biometricService.authenticate(customMessage);
      
      if (success) {
        // Récupérer l'identifiant sauvegardé pour login automatique
        const savedCredential = await biometricService.getBiometricCredential();
        onSuccess(savedCredential || undefined);
      } else {
        // L'utilisateur a annulé ou l'auth a échoué
        if (onCancel) {
          onCancel();
        }
      }
    } catch (error) {
      console.error('Erreur authentification biométrique:', error);
      Alert.alert(
        t('auth.biometric.error'),
        t('auth.biometric.authFailed'),
        [
          { text: t('common.ok'), onPress: onCancel }
        ]
      );
    }
  };

  const handleSetupBiometric = () => {
    Alert.alert(
      t('auth.biometric.setupTitle'),
      t('auth.biometric.setupMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('auth.biometric.openSettings'), 
          onPress: () => {
            // TODO: Ouvrir les paramètres système
            console.log('Ouvrir paramètres biométrie');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 20,
          alignItems: 'center'
        }}>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray
          }}>
            {t('common.loading')}...
          </Text>
        </View>
      </View>
    );
  }

  if (!capability?.isAvailable) {
    return (
      <View style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          alignItems: 'center',
          maxWidth: 300
        }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: modernColors.gray,
            textAlign: 'center',
            marginBottom: 12
          }}>
            {t('auth.biometric.notAvailable')}
          </Text>
          <Text style={{
            fontSize: 14,
            color: modernColors.gray,
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 20
          }}>
            {t('auth.biometric.notAvailableMessage')}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title={t('common.ok')}
              onPress={onCancel}
              variant="secondary"
              size="small"
            />
            {onFallback && (
              <Button
                title={t('auth.biometric.usePassword')}
                onPress={onFallback}
                size="small"
              />
            )}
          </View>
        </View>
      </View>
    );
  }

  if (!capability.isEnrolled) {
    return (
      <View style={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 12,
          padding: 24,
          alignItems: 'center',
          maxWidth: 320
        }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: modernColors.gray,
            textAlign: 'center',
            marginBottom: 12
          }}>
            {t('auth.biometric.notConfigured')}
          </Text>
          <Text style={{
            fontSize: 14,
            color: modernColors.gray,
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 20
          }}>
            {t('auth.biometric.notConfiguredMessage')}
          </Text>
          
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <Button
              title={t('common.cancel')}
              onPress={onCancel}
              variant="secondary"
              size="small"
            />
            {onFallback && (
              <Button
                title={t('auth.biometric.usePassword')}
                onPress={onFallback}
                size="small"
              />
            )}
          </View>
          
          {showSetupOption && (
            <TouchableOpacity onPress={handleSetupBiometric}>
              <Text style={{
                fontSize: 14,
                color: modernColors.primary,
                textDecorationLine: 'underline'
              }}>
                {t('auth.biometric.setupNow')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Biométrie disponible et configurée
  const biometricTypeName = biometricService.getBiometricTypeName(capability.supportedTypes);

  return (
    <View style={{ 
      backgroundColor: 'rgba(0,0,0,0.5)',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
    }}>
      <View style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center',
        maxWidth: 300
      }}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>
          {capability.supportedTypes.includes(1) ? '👆' : '👤'}
        </Text>
        
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 8
        }}>
          {biometricTypeName}
        </Text>
        
        <Text style={{
          fontSize: 14,
          color: modernColors.gray,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 20
        }}>
          {customMessage || t('auth.biometric.defaultMessage')}
        </Text>
        
        <View style={{ width: '100%', gap: 12 }}>
          <Button
            title={t('auth.biometric.authenticate', { type: biometricTypeName })}
            onPress={handleBiometricAuth}
          />
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title={t('common.cancel')}
              onPress={onCancel}
              variant="secondary"
              size="small"
              style={{ flex: 1 }}
            />
            {onFallback && (
              <Button
                title={t('auth.biometric.usePassword')}
                onPress={onFallback}
                variant="secondary"
                size="small"
                style={{ flex: 1 }}
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default BiometricPrompt;