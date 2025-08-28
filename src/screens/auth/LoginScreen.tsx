// src/screens/auth/LoginScreen.tsx - Version modernisée
import React, { useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Button, Input, PasswordInput } from '../../components/common';
import { 
  ModernCard,
  ModernActionButton,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const { login, register, testConnection, isLoading } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Form states
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

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