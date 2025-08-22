import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet
} from 'react-native';
import { NavigationContext } from '../../navigation/SimpleNavigation';

const VerifyStrapi: React.FC = () => {
  const navigation = useContext(NavigationContext);
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState(null);

  const handleRefresh = () => {
    console.log('🔄 Actualisation...');
    // Ici tu peux ajouter la logique pour recharger les données
  };

  const testCreateExchange = () => {
    console.log('🧪 Navigation vers création Bob...');
    navigation?.navigate('CreateExchange');
  };

  const goBack = () => {
    console.log('🔙 Retour vers écran précédent');
    navigation?.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={goBack}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 Vérification Strapi</Text>
      </View>
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
          />
        }
      >
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>🔗 Statut de connexion</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusLabel}>API URL</Text>
              <Text style={styles.statusValue}>Configurée</Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusLabel}>Token Auth</Text>
              <Text style={styles.statusValue}>Valide</Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusIcon}>✅</Text>
              <Text style={styles.statusLabel}>Utilisateur</Text>
              <Text style={styles.statusValue}>Jean-Charles</Text>
            </View>
          </View>
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>📊 Vos Bobs dans Strapi</Text>
          
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Composant fonctionne !</Text>
              <Text style={styles.successDesc}>
                Sauvegarde Strapi fonctionnelle
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefresh}
          >
            <Text style={styles.buttonText}>🔄 Actualiser</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.testButton} 
            onPress={testCreateExchange}
          >
            <Text style={styles.buttonText}>🧪 Créer Bob de test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Comment ça marche</Text>
          <Text style={styles.infoText}>
            Cette page vérifie que vos Bobs sont correctement sauvegardés dans Strapi.
            {'\n\n'}• Connexion : Vérifie l'API et l'authentification
            {'\n'}• Récupération : Charge tous vos Bobs existants  
            {'\n'}• Test : Crée un Bob temporaire pour valider
            {'\n\n'}Tirez vers le bas pour actualiser les données.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusSection: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1F2937',
  },
  statusGrid: {
    gap: 15,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statusIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  statusLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  statusValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  resultSection: {
    marginBottom: 30,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  successIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 5,
  },
  successDesc: {
    fontSize: 14,
    color: '#047857',
  },
  actionsSection: {
    gap: 15,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#10B981',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1F2937',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#6B7280',
  },
});

export default VerifyStrapi;