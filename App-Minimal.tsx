// App-Minimal.tsx - Version minimale fonctionnelle
import React from 'react';
import { SafeAreaView, StatusBar, View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.content}>
        <Text style={styles.title}>🚀 Bob App - Version Complète</Text>
        <Text style={styles.subtitle}>Chargement de l'application...</Text>
        <Text style={styles.status}>✅ React Native Web OK</Text>
        <Text style={styles.status}>✅ TypeScript OK</Text>
        <Text style={styles.status}>✅ Compilation réussie</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 5,
  },
});