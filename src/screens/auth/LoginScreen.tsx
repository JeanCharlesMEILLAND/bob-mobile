// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../hooks';
import { Button, Input } from '../../components/common';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';

export const LoginScreen: React.FC = () => {
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
      if (!username.trim()) newErrors.username = 'Nom d\'utilisateur requis';
      if (!email.trim()) newErrors.email = 'Email requis';
      if (password !== confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    } else {
      if (!identifier.trim()) newErrors.identifier = 'Email ou nom d\'utilisateur requis';
    }
    
    if (!password.trim()) newErrors.password = 'Mot de passe requis';
    if (password.length < 6 && password.length > 0) newErrors.password = 'Minimum 6 caractères';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    console.log('🚀 LoginScreen - Tentative de connexion');
    const result = await login(identifier, password);
    
    if (!result.success) {
      Alert.alert('Erreur de connexion', result.error || 'Erreur inconnue');
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log('📝 LoginScreen - Tentative d\'inscription');
    const result = await register(username, email, password);
    
    if (!result.success) {
      Alert.alert('Erreur d\'inscription', result.error || 'Erreur inconnue');
    } else {
      Alert.alert('Succès', 'Inscription réussie ! Vous êtes maintenant connecté.');
    }
  };

  const fillTestCredentials = () => {
    setIdentifier('test@bob.com');
    setPassword('password123');
    setIsRegisterMode(false);
    setErrors({});
    Alert.alert('Info', 'Identifiants de test ajoutés. Cliquez sur "Se connecter".');
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
          {isRegisterMode ? 'Créer votre compte' : 'Connectez-vous à votre compte'}
        </Text>
      </View>
      
      <View style={styles.form}>
        {isRegisterMode ? (
          <>
            <Input
              label="Nom d'utilisateur *"
              placeholder="Votre nom d'utilisateur"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
              autoCapitalize="none"
            />
            
            <Input
              label="Email *"
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
            label="Email ou nom d'utilisateur *"
            placeholder="votre@email.com"
            value={identifier}
            onChangeText={setIdentifier}
            error={errors.identifier}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
        
        <Input
          label="Mot de passe *"
          placeholder="Votre mot de passe"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
        />
        
        {isRegisterMode && (
          <Input
            label="Confirmer le mot de passe *"
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            error={errors.confirmPassword}
            secureTextEntry
          />
        )}
        
        {/* Action Button */}
        <Button
          title={isRegisterMode ? 'S\'inscrire' : 'Se connecter'}
          onPress={isRegisterMode ? handleRegister : handleLogin}
          loading={isLoading}
          style={styles.actionButton}
        />
        
        {/* Toggle Mode Button */}
        <Button
          title={isRegisterMode ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          variant="secondary"
          onPress={toggleMode}
          style={styles.toggleButton}
        />
        
        {/* Test Buttons */}
        {!isRegisterMode && (
          <View style={styles.testButtons}>
            <Button
              title="🧪 Utiliser identifiants de test"
              variant="success"
              size="small"
              onPress={fillTestCredentials}
            />
            
            <Button
              title="🔍 Test connexion VPS"
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