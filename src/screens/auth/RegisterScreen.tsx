import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';

interface RegisterScreenProps {
  navigation: any;
}

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractÃ¨res');
      return;
    }

    try {
      await register({ username, email, password });
      // Navigation automatique via AppNavigator
    } catch (error: any) {
      Alert.alert(
        'Erreur d\'inscription',
        error.response?.data?.error?.message || 'Une erreur s\'est produite'
      );
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Bob</Text>
        <Text style={styles.subtitle}>CrÃ©ez votre compte</Text>

        <View style={styles.form}>
          <TextInput
            placeholder="Nom d'utilisateur"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />

          <TextInput
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={[styles.button, isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>
              DÃ©jÃ  un compte ? Se connecter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#3B82F6',
    textAlign: 'center',
    fontSize: 16,
  },
});
