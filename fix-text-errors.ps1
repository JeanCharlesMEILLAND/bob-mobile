# Fix erreurs d'import Text dans tous les fichiers
# Executer depuis C:\BOB\bob-mobile\

Write-Host "Correction erreurs d'import Text..." -ForegroundColor Cyan

# 1. App.tsx principal corrigé
Write-Host "Correction App.tsx..." -ForegroundColor Yellow
$mainAppFixed = @'
// App.tsx principal - Architecture propre - CORRIGÉ
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, View, Text } from 'react-native';
import { GlobalStyles } from './src/styles/global';
import { Colors } from './src/styles/tokens';

// Hooks
import { useAuth } from './src/hooks/useAuth';

// Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ExchangesScreen } from './src/screens/exchanges/ExchangesScreen';

// Components
import { BottomNavigation } from './src/components/navigation/BottomNavigation';

// Screens temporaires (à créer plus tard)
const EventsScreen = () => (
  <View style={[GlobalStyles.container, GlobalStyles.center]}>
    <Text style={GlobalStyles.h2}>Événements</Text>
    <Text style={GlobalStyles.bodySecondary}>À venir...</Text>
  </View>
);

const ContactsScreen = () => (
  <View style={[GlobalStyles.container, GlobalStyles.center]}>
    <Text style={GlobalStyles.h2}>Contacts</Text>
    <Text style={GlobalStyles.bodySecondary}>À venir...</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={[GlobalStyles.container, GlobalStyles.center]}>
    <Text style={GlobalStyles.h2}>Profil</Text>
    <Text style={GlobalStyles.bodySecondary}>À venir...</Text>
  </View>
);

export default function App() {
  const { isAuthenticated } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');

  // Écran de connexion
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={GlobalStyles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  // Rendu des écrans principaux
  const renderScreen = () => {
    switch (currentScreen) {
      case 'events':
        return <EventsScreen />;
      case 'contacts':
        return <ContactsScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <ExchangesScreen />;
    }
  };

  // App principale
  return (
    <SafeAreaView style={GlobalStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={GlobalStyles.container}>
        {renderScreen()}
        <BottomNavigation
          currentScreen={currentScreen}
          onScreenChange={setCurrentScreen}
        />
      </View>
    </SafeAreaView>
  );
}
'@
$mainAppFixed | Out-File -FilePath "App.tsx" -Encoding UTF8

# 2. LoginScreen corrigé
Write-Host "Correction LoginScreen..." -ForegroundColor Yellow
$loginScreenFixed = @'
// Écran de connexion séparé - CORRIGÉ
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { GlobalStyles } from '../../styles/global';
import { Colors, Typography, Spacing, BorderRadius, Shadows, Layout } from '../../styles/tokens';
import { useAuth } from '../../hooks/useAuth';

export const LoginScreen: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(identifier, password);
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={GlobalStyles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>B</Text>
            </View>
            <Text style={GlobalStyles.h1}>Bob</Text>
            <Text style={[GlobalStyles.bodySecondary, styles.tagline]}>
              Partagez, échangez, collaborez
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={[GlobalStyles.h3, styles.formTitle]}>Connexion</Text>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Email ou nom d'utilisateur"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                style={GlobalStyles.input}
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <TextInput
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={GlobalStyles.input}
                placeholderTextColor={Colors.textPlaceholder}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[GlobalStyles.buttonPrimary, isLoading && styles.buttonDisabled]}
            >
              <Text style={GlobalStyles.buttonText}>
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={GlobalStyles.caption}>Pas encore de compte ?</Text>
            <TouchableOpacity>
              <Text style={styles.footerLink}>S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: Layout.window.height * 0.08,
    marginBottom: Layout.window.height * 0.06,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    ...Shadows.lg,
  },
  logoText: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.bold,
    color: Colors.background,
  },
  tagline: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  formContainer: {
    flex: 1,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: Colors.gray400,
    ...Shadows.sm,
  },
  linkButton: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  linkText: {
    color: Colors.primary,
    fontSize: Typography.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xl,
  },
  footerLink: {
    color: Colors.primary,
    fontSize: Typography.sm,
    fontWeight: Typography.semibold,
  },
});
'@
$loginScreenFixed | Out-File -FilePath "src\screens\auth\LoginScreen.tsx" -Encoding UTF8

# 3. ExchangesScreen corrigé
Write-Host "Correction ExchangesScreen..." -ForegroundColor Yellow
$exchangesScreenFixed = @'
// Écran Échanges séparé - CORRIGÉ
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { GlobalStyles } from '../../styles/global';
import { Colors, Typography, Spacing } from '../../styles/tokens';

export const ExchangesScreen: React.FC = () => {
  return (
    <ScrollView style={GlobalStyles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={GlobalStyles.h2}>Échanges</Text>
        <Text style={GlobalStyles.bodySecondary}>Prêtez, empruntez, partagez</Text>
      </View>

      {/* Content */}
      <View style={GlobalStyles.p24}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[GlobalStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={GlobalStyles.caption}>Actifs</Text>
          </View>
          <View style={[GlobalStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={GlobalStyles.caption}>Complétés</Text>
          </View>
          <View style={[GlobalStyles.card, styles.statCard]}>
            <Text style={styles.statNumber}>10</Text>
            <Text style={GlobalStyles.caption}>Points</Text>
          </View>
        </View>

        {/* Empty State */}
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyIconText}>🔄</Text>
          </View>
          <Text style={GlobalStyles.h3}>Aucun échange</Text>
          <Text style={[GlobalStyles.bodySecondary, styles.emptyDescription]}>
            Commencez par prêter un objet ou demander un service
          </Text>
          <TouchableOpacity style={GlobalStyles.buttonPrimary}>
            <Text style={GlobalStyles.buttonText}>Créer un échange</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  statNumber: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyIconText: {
    fontSize: Typography['4xl'],
  },
  emptyDescription: {
    textAlign: 'center',
    marginVertical: Spacing.md,
    marginHorizontal: Spacing.xl,
  },
});
'@
$exchangesScreenFixed | Out-File -FilePath "src\screens\exchanges\ExchangesScreen.tsx" -Encoding UTF8

Write-Host ""
Write-Host "Corrections appliquees !" -ForegroundColor Green
Write-Host ""
Write-Host "Corrections apportees :" -ForegroundColor White
Write-Host "  - Import Text depuis React Native" -ForegroundColor Gray
Write-Host "  - StyleSheet.create() ajoute" -ForegroundColor Gray
Write-Host "  - Types TypeScript corriges" -ForegroundColor Gray
Write-Host "  - Composants temporaires fixes" -ForegroundColor Gray
Write-Host ""
Write-Host "Testez maintenant: npx expo start --tunnel" -ForegroundColor Cyan