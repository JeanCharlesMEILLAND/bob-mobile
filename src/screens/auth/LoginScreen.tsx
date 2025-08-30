// src/screens/auth/LoginScreen.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Platform, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
// import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useAuth } from '../../hooks';
import { Button, Input, PasswordInput } from '../../components/common';
import { referralService } from '../../services';
import { storageService } from '../../services/storage.service';
import type { RootStackParamList } from '../../navigation/NavigationContainer';
import { 
  ModernCard,
  ModernActionButton,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';

// type LoginScreenRouteProp = RouteProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  // const navigation = useNavigation();
  // const route = useRoute<LoginScreenRouteProp>();
  const { login, register, testConnection, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Referral state
  const [referralCode, setReferralCode] = useState('');
  const [hasValidReferral, setHasValidReferral] = useState(false);
  
  // Form states
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check for referral code from navigation or storage
    const checkReferralCode = async () => {
      try {
        // Code from navigation params
        // const navReferralCode = route.params?.referralCode;
        
        // Code from storage (saved from deep link)
        const storedReferralCode = await storageService.get('pending_referral_code');
        
        const codeToUse = storedReferralCode;
        
        if (codeToUse) {
          setReferralCode(codeToUse);
          
          // Validate the code
          const validation = await referralService.validateReferralCode(codeToUse);
          if (validation.success) {
            setHasValidReferral(true);
            
            Alert.alert(
              '🎁 Code de parrainage détecté',
              `Vous avez été invité par ${validation.data?.referrerName || 'un ami'} !\n\nConnectez-vous ou inscrivez-vous pour activer votre parrainage.`,
              [{ text: 'Super !' }]
            );
          } else {
            setReferralCode('');
            await storageService.remove('pending_referral_code');
          }
        }
      } catch (error) {
        console.error('Erreur vérification code parrainage:', error);
      }
    };

    checkReferralCode();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (isRegisterMode) {
      if (!username.trim()) newErrors.username = t('auth.validation.usernameRequired');
      if (!email.trim()) newErrors.email = t('auth.validation.emailRequired');
      if (password !== confirmPassword) newErrors.confirmPassword = t('auth.validation.passwordsNotMatch');
    } else {
      if (!identifier.trim()) newErrors.identifier = t('auth.validation.identifierRequired');
    }
    
    if (!password.trim()) newErrors.password = t('auth.validation.passwordRequired');
    if (password.length < 6 && password.length > 0) newErrors.password = t('auth.validation.passwordTooShort');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    console.log('🚀 LoginScreen - Tentative de connexion');
    const result = await login(identifier, password);
    
    if (!result.success) {
      const errorMessage = result.error || 'Erreur de connexion inconnue';
      Alert.alert(
        '❌ Connexion échouée', 
        errorMessage,
        [
          { text: 'Réessayer', style: 'default' },
          { 
            text: 'Utiliser test', 
            onPress: fillTestCredentials,
            style: 'default'
          }
        ]
      );
    } else {
      // Apply referral code if present
      await applyReferralCodeIfPresent();
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log('📝 LoginScreen - Tentative d\'inscription');
    const result = await register(username, email, password);
    
    if (!result.success) {
      Alert.alert(t('auth.errors.registerError'), result.error || t('auth.errors.unknownError'));
    } else {
      Alert.alert(t('common.success'), t('auth.registerSuccess'));
      // Apply referral code if present
      await applyReferralCodeIfPresent();
    }
  };

  const applyReferralCodeIfPresent = async () => {
    if (referralCode && hasValidReferral) {
      try {
        const result = await referralService.applyReferralCode(referralCode);
        
        if (result.success) {
          // Clean up stored code
          await storageService.remove('pending_referral_code');
          
          Alert.alert(
            '🎉 Parrainage activé !',
            'Félicitations ! Votre parrainage a été activé. Vos Bobiz de bienvenue arriveront bientôt !',
            [{ text: 'Super !' }]
          );
        }
      } catch (error) {
        console.error('Erreur application parrainage:', error);
        // Don't show error to user - parrainage is bonus feature
      }
    }
  };

  const fillTestCredentials = () => {
    setIdentifier('test@bob.com');
    setPassword('password123');
    setIsRegisterMode(false);
    setErrors({});
    Alert.alert(
      '🧪 Identifiants de test', 
      'Identifiants remplis automatiquement:\n• Email: test@bob.com\n• Mot de passe: password123\n\nAutres comptes disponibles:\n• admin@bob.com / admin123\n• marie@bob.com / marie123\n• test / test'
    );
  };

  const handleTestConnection = async () => {
    try {
      const result = await testConnection();
      Alert.alert(
        'Test Connexion VPS', 
        `Status: ${result.status} - ${result.ok ? 'OK' : 'Erreur'}`
      );
    } catch (error: any) {
      Alert.alert('Erreur VPS', error.message || 'Impossible de se connecter');
    }
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setErrors({});
    // Clear form
    setIdentifier('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ justifyContent: 'center', padding: 20 }}
    >
      <ModernCard style={{ marginBottom: 24 }}>
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
          {isRegisterMode ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
        </Text>
      </ModernCard>

      {/* Referral Code Indicator */}
      {hasValidReferral && (
        <ModernCard style={{ marginBottom: 16, backgroundColor: '#F0FDF4' }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 4
          }}>
            <Text style={{ fontSize: 32, marginRight: 12 }}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#059669',
                marginBottom: 4
              }}>
                Code de parrainage actif
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.dark,
                lineHeight: 18
              }}>
                Vous recevrez des Bobiz de bienvenue après connexion !
              </Text>
            </View>
          </View>
        </ModernCard>
      )}
      
      <ModernCard>
        {isRegisterMode ? (
          <>
            <Input
              label={t('auth.username') + ' *'}
              placeholder={t('auth.username')}
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
            />
            
            <View style={{ marginTop: 16 }}>
              <Input
                label={t('auth.email') + ' *'}
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        ) : (
          <Input
            label={t('auth.identifier') + ' *'}
            placeholder="votre@email.com"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        
        <View style={{ marginTop: 16 }}>
          <PasswordInput
            label={t('auth.password') + ' *'}
            placeholder={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        </View>
        
        {isRegisterMode && (
          <View style={{ marginTop: 16 }}>
            <PasswordInput
              label={t('auth.confirmPassword') + ' *'}
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
            />
          </View>
        )}
        
        {/* Forgot Password Link */}
        {!isRegisterMode && (
          <TouchableOpacity
            style={{ alignItems: 'center', marginTop: 16 }}
            onPress={() => {
              // TODO: Implémenter navigation vers forgot password
              Alert.alert('Info', 'Fonctionnalité à venir');
            }}
          >
            <Text style={{
              fontSize: 14,
              color: modernColors.primary,
              textDecorationLine: 'underline'
            }}>
              {t('auth.forgotPassword.title')}
            </Text>
          </TouchableOpacity>
        )}
        
        <View style={{ marginTop: 24 }}>
          <Button
            title={isRegisterMode ? t('auth.registerButton') : t('auth.loginButton')}
            onPress={isRegisterMode ? handleRegister : handleLogin}
            loading={isLoading}
          />
        </View>
        
        <View style={{ marginTop: 12 }}>
          <Button
            title={isRegisterMode ? t('auth.switchToLogin') : t('auth.switchToRegister')}
            variant="secondary"
            onPress={toggleMode}
          />
        </View>
      </ModernCard>
      
      {/* Test Buttons */}
      {!isRegisterMode && (
        <ModernCard style={{ marginTop: 16 }}>
          <View style={{
            backgroundColor: '#F0F8FF',
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            borderLeftWidth: 4,
            borderLeftColor: modernColors.primary
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: modernColors.primary,
              marginBottom: 8,
              textAlign: 'center'
            }}>🧪 Identifiants de test disponibles :</Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              marginVertical: 2,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
            }}>• test@bob.com / password123</Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              marginVertical: 2,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
            }}>• admin@bob.com / admin123</Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              marginVertical: 2,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
            }}>• marie@bob.com / marie123</Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              marginVertical: 2,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'
            }}>• test / test</Text>
          </View>
          
          <Button
            title={t('auth.useTestCredentials')}
            variant="success"
            size="small"
            onPress={fillTestCredentials}
          />
          
          <View style={{ marginTop: 8 }}>
            <Button
              title={'🔍 ' + t('auth.testConnection')}
              variant="secondary"
              size="small"
              onPress={handleTestConnection}
            />
          </View>
        </ModernCard>
      )}
    </ModernScreen>
  );
};

// Styles supprimés - utilisation des composants modernes

export default LoginScreen;