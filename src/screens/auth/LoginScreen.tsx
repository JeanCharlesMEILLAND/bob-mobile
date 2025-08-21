// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { Button, Input } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

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
      Alert.alert(t('auth.errors.loginError'), result.error || t('auth.errors.unknownError'));
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
    Alert.alert('Info', t('auth.testCredentialsAdded'));
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Bob</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? t('auth.registerSubtitle') : t('auth.loginSubtitle')}
        </Text>
      </View>
      
      <View style={styles.form}>
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
            
            <Input
              label={t('auth.email') + ' *'}
              placeholder="votre@email.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
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
        
        <Input
          label={t('auth.password') + ' *'}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />
        
        {isRegisterMode && (
          <Input
            label={t('auth.confirmPassword') + ' *'}
            placeholder={t('auth.confirmPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
          />
        )}
        
        {/* Action Button */}
        <Button
          title={isRegisterMode ? t('auth.registerButton') : t('auth.loginButton')}
          onPress={isRegisterMode ? handleRegister : handleLogin}
          loading={isLoading}
          style={styles.actionButton}
        />
        
        {/* Toggle Mode Button */}
        <Button
          title={isRegisterMode ? t('auth.switchToLogin') : t('auth.switchToRegister')}
          variant="secondary"
          onPress={toggleMode}
          style={styles.toggleButton}
        />
        
        {/* Test Buttons */}
        {!isRegisterMode && (
          <View style={styles.testButtons}>
            <Button
              title={t('auth.useTestCredentials')}
              variant="success"
              size="small"
              onPress={fillTestCredentials}
            />
            
            <Button
              title={'🔍 ' + t('auth.testConnection')}
              variant="secondary"
              size="small"
              onPress={handleTestConnection}
              style={styles.testConnectionButton}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  
  subtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  
  form: {
    gap: Spacing.md,
  },
  
  actionButton: {
    marginTop: Spacing.lg,
  },
  
  toggleButton: {
    marginTop: Spacing.md,
  },
  
  testButtons: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  
  testConnectionButton: {
    marginTop: Spacing.sm,
  },
});