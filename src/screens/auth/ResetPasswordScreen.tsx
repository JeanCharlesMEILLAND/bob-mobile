import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Button, PasswordInput } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { authService } from '../../services/auth.service';

type ResetPasswordRouteParams = {
  ResetPassword: {
    token: string;
  };
};

export const ResetPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<ResetPasswordRouteParams, 'ResetPassword'>>();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const resetToken = route.params?.token;

  useEffect(() => {
    validateResetToken();
  }, []);

  const validateResetToken = async () => {
    if (!resetToken) {
      setTokenValid(false);
      Alert.alert(
        t('auth.resetPassword.invalidTokenTitle'),
        t('auth.resetPassword.invalidTokenMessage'),
        [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
      );
      return;
    }

    try {
      const isValid = await authService.validateResetToken(resetToken);
      setTokenValid(isValid);
      
      if (!isValid) {
        Alert.alert(
          t('auth.resetPassword.expiredTokenTitle'),
          t('auth.resetPassword.expiredTokenMessage'),
          [{ text: t('common.ok'), onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      setTokenValid(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password.trim()) {
      newErrors.password = t('auth.validation.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('auth.validation.passwordTooShort');
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.validation.confirmPasswordRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.validation.passwordsNotMatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm() || !resetToken) return;

    setIsLoading(true);
    
    try {
      await authService.resetPassword(resetToken, password);
      
      Alert.alert(
        t('auth.resetPassword.successTitle'),
        t('auth.resetPassword.successMessage'),
        [
          {
            text: t('auth.loginButton'),
            onPress: () => navigation.navigate('Login' as never)
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

  if (tokenValid === false) {
    return (
      <ModernScreen
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
      >
        <ModernCard>
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>⚠️</Text>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: modernColors.error,
              textAlign: 'center',
              marginBottom: 12
            }}>
              {t('auth.resetPassword.invalidTokenTitle')}
            </Text>
            <Text style={{
              fontSize: 16,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 24
            }}>
              {t('auth.resetPassword.invalidTokenMessage')}
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

  if (tokenValid === null) {
    return (
      <ModernScreen
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
      >
        <ModernCard>
          <View style={{ alignItems: 'center', padding: 20 }}>
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

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
    >
      <ModernCard style={{ marginBottom: 24 }}>
        <View style={{ alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🔐</Text>
          <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: modernColors.primary,
            textAlign: 'center',
            marginBottom: 8
          }}>
            {t('auth.resetPassword.title')}
          </Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 22
          }}>
            {t('auth.resetPassword.subtitle')}
          </Text>
        </View>
      </ModernCard>
      
      <ModernCard>
        <PasswordInput
          label={t('auth.newPassword') + ' *'}
          placeholder={t('auth.newPassword')}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          autoFocus
        />
        
        <View style={{ marginTop: 16 }}>
          <PasswordInput
            label={t('auth.confirmPassword') + ' *'}
            placeholder={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
          />
        </View>
        
        <View style={{ marginTop: 24 }}>
          <Button
            title={t('auth.resetPassword.updatePassword')}
            onPress={handleResetPassword}
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

export default ResetPasswordScreen;