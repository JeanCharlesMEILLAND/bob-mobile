import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Button, Input } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { authService } from '../../services/auth.service';

export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendResetEmail = async () => {
    setErrors({});
    
    // Validation
    if (!email.trim()) {
      setErrors({ email: t('auth.validation.emailRequired') });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: t('auth.validation.emailInvalid') });
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.requestPasswordReset(email);
      setEmailSent(true);
      
      Alert.alert(
        t('auth.forgotPassword.emailSentTitle'),
        t('auth.forgotPassword.emailSentMessage', { email }),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack()
          }
        ]
      );
      
    } catch (error: any) {
      Alert.alert(
        t('auth.errors.resetPasswordError'),
        error.message || t('auth.errors.unknownError')
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <ModernScreen
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
      >
        <ModernCard>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📧</Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: modernColors.primary,
              textAlign: 'center',
              marginBottom: 12
            }}>
              {t('auth.forgotPassword.emailSentTitle')}
            </Text>
            <Text style={{
              fontSize: 16,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 24
            }}>
              {t('auth.forgotPassword.emailSentMessage', { email })}
            </Text>
            <Button
              title={t('auth.backToLogin')}
              onPress={() => navigation.goBack()}
              variant="primary"
            />
          </View>
        </ModernCard>
      </ModernScreen>
    );
  }

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
    >
      <ModernCard style={{ marginBottom: 24 }}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔑</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: modernColors.primary,
            textAlign: 'center',
            marginBottom: 8
          }}>
            {t('auth.forgotPassword.title')}
          </Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 22
          }}>
            {t('auth.forgotPassword.subtitle')}
          </Text>
        </View>
      </ModernCard>
      
      <ModernCard>
        <Input
          label={t('auth.email') + ' *'}
          placeholder="votre@email.com"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus
        />
        
        <View style={{ marginTop: 24 }}>
          <Button
            title={t('auth.forgotPassword.sendResetEmail')}
            onPress={handleSendResetEmail}
            loading={isLoading}
          />
        </View>
        
        <View style={{ marginTop: 12 }}>
          <Button
            title={t('auth.backToLogin')}
            variant="secondary"
            onPress={() => navigation.goBack()}
          />
        </View>
      </ModernCard>
    </ModernScreen>
  );
};

export default ForgotPasswordScreen;