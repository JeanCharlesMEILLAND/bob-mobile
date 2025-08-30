import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Button } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { biometricService, BiometricCapability } from '../../services/biometric.service';

interface BiometricLoginScreenProps {
  onUsePassword: () => void;
  onCancel?: () => void;
}

export const BiometricLoginScreen: React.FC<BiometricLoginScreenProps> = ({
  onUsePassword,
  onCancel
}) => {
  const { t } = useTranslation();
  const { loginWithBiometric, isLoading } = useAuth();
  const [capability, setCapability] = useState<BiometricCapability | null>(null);
  const [isCheckingCapability, setIsCheckingCapability] = useState(true);

  useEffect(() => {
    checkBiometricCapability();
  }, []);

  const checkBiometricCapability = async () => {
    setIsCheckingCapability(true);
    
    try {
      const cap = await biometricService.checkCapability();
      setCapability(cap);
      
      // Si disponible, proposer l'authentification automatiquement
      if (cap.isAvailable && cap.isEnrolled) {
        setTimeout(handleBiometricLogin, 500); // Petit délai pour l'UX
      }
    } catch (error) {
      console.error('Erreur vérification biométrie:', error);
    } finally {
      setIsCheckingCapability(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const result = await loginWithBiometric();
      
      if (!result.success) {
        if (result.error?.includes('Session expirée')) {
          Alert.alert(
            t('auth.biometric.error'),
            'Votre session a expiré. Veuillez vous reconnecter avec votre mot de passe.',
            [{ text: t('common.ok'), onPress: onUsePassword }]
          );
        } else {
          console.log('Échec connexion biométrique:', result.error);
          // Ne pas afficher d'erreur si l'user a simplement annulé
        }
      }
    } catch (error: any) {
      console.error('Erreur connexion biométrique:', error);
    }
  };

  if (isCheckingCapability) {
    return (
      <ModernScreen
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
      >
        <ModernCard>
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{
              fontSize: 16,
              color: modernColors.gray,
              textAlign: 'center'
            }}>
              {t('common.loading')}...
            </Text>
          </View>
        </ModernCard>
      </ModernScreen>
    );
  }

  if (!capability?.isAvailable || !capability?.isEnrolled) {
    return (
      <ModernScreen
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
      >
        <ModernCard>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: modernColors.gray,
              textAlign: 'center',
              marginBottom: 12
            }}>
              {!capability?.isAvailable ? 
                t('auth.biometric.notAvailable') : 
                t('auth.biometric.notConfigured')
              }
            </Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              textAlign: 'center',
              marginBottom: 24,
              lineHeight: 20
            }}>
              {!capability?.isAvailable ? 
                t('auth.biometric.notAvailableMessage') :
                t('auth.biometric.notConfiguredMessage')
              }
            </Text>
            
            <View style={{ width: '100%', gap: 12 }}>
              <Button
                title={t('auth.biometric.usePassword')}
                onPress={onUsePassword}
              />
              
              {onCancel && (
                <Button
                  title={t('common.cancel')}
                  onPress={onCancel}
                  variant="secondary"
                />
              )}
            </View>
          </View>
        </ModernCard>
      </ModernScreen>
    );
  }

  // Biométrie disponible et configurée
  const biometricTypeName = biometricService.getBiometricTypeName(capability.supportedTypes);

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
    >
      <ModernCard style={{ marginBottom: 24 }}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{
            fontSize: 36,
            fontWeight: 'bold',
            color: modernColors.primary,
            textAlign: 'center',
            marginBottom: 8
          }}>Bob</Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 22
          }}>
            Bon retour ! Connectez-vous rapidement
          </Text>
        </View>
      </ModernCard>
      
      <ModernCard>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>
            {capability.supportedTypes.includes(1) ? '👆' : '👤'}
          </Text>
          
          <Text style={{
            fontSize: 20,
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
            marginBottom: 32,
            lineHeight: 20
          }}>
            {t('auth.biometric.defaultMessage')}
          </Text>
          
          <View style={{ width: '100%', gap: 16 }}>
            <Button
              title={t('auth.biometric.authenticate', { type: biometricTypeName })}
              onPress={handleBiometricLogin}
              loading={isLoading}
            />
            
            <TouchableOpacity
              onPress={onUsePassword}
              style={{ alignItems: 'center', paddingVertical: 12 }}
            >
              <Text style={{
                fontSize: 16,
                color: modernColors.primary,
                textDecorationLine: 'underline'
              }}>
                {t('auth.biometric.usePassword')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ModernCard>
    </ModernScreen>
  );
};

export default BiometricLoginScreen;