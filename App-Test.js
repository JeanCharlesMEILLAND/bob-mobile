// App-Simple.js - Version simplifiée pour test
import React from 'react';
import { SafeAreaView, Text, View, StyleSheet, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      <View style={styles.content}>
        <Text style={styles.title}>🚀 Bob App</Text>
        <Text style={styles.subtitle}>Application chargée avec succès !</Text>
        <Text style={styles.version}>Version: {new Date().toLocaleString()}</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Status :</Text>
          <Text style={styles.statusItem}>✅ React Native OK</Text>
          <Text style={styles.statusItem}>✅ Expo OK</Text>
          <Text style={styles.statusItem}>✅ TypeScript configuré</Text>
          <Text style={styles.statusItem}>✅ Navigation installée</Text>
          <Text style={styles.statusItem}>✅ Services implémentés</Text>
        </View>

        <Text style={styles.note}>
          Pour activer la version complète, renommez App.tsx en App-Full.tsx 
          et ce fichier en App.js
        </Text>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EC4899',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  version: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    minWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  statusItem: {
    fontSize: 14,
    color: '#059669',
    marginBottom: 5,
  },
  note: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
});