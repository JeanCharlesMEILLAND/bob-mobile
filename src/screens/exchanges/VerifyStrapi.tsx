// src/screens/exchanges/VerifyStrapi.tsx - Vérification sauvegarde Strapi
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { useAuth } from '../../hooks';
import { Header, Button } from '../../components/common';
import { exchangesService, ExchangeStrapi } from '../../services/exchanges.service';
import { authService } from '../../services/auth.service';
import { styles } from './VerifyStrapi.styles';

interface VerificationResult {
  success: boolean;
  data?: ExchangeStrapi[];
  error?: string;
  count: number;
  lastCreated?: ExchangeStrapi;
}

export const VerifyStrapi: React.FC = () => {
  const navigation = useSimpleNavigation();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [connectionTest, setConnectionTest] = useState<{
    strapi: boolean;
    api: boolean;
    auth: boolean;
  } | null>(null);

  useEffect(() => {
    loadVerification();
  }, []);

  const loadVerification = async () => {
    setIsLoading(true);
    await Promise.all([
      verifyConnection(),
      verifyMyExchanges()
    ]);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVerification();
    setIsRefreshing(false);
  };

  const verifyConnection = async () => {
    try {
      const token = await authService.getValidToken();
      
      setConnectionTest({
        strapi: !!token,
        api: !!process.env.REACT_APP_API_URL,
        auth: !!token && token !== 'mock_token'
      });
      
      console.log('🔗 Test connexion:', { 
        token: token ? `${token.substring(0, 20)}...` : 'None',
        apiUrl: process.env.REACT_APP_API_URL,
        user: user?.username
      });
      
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      setConnectionTest({
        strapi: false,
        api: false,
        auth: false
      });
    }
  };

  const verifyMyExchanges = async () => {
    try {
      const token = await authService.getValidToken();
      if (!token) {
        setVerification({
          success: false,
          error: 'Token d\'authentification manquant',
          count: 0
        });
        return;
      }

      console.log('🔍 Vérification échanges Strapi...');
      const exchanges = await exchangesService.getMyExchanges(token);
      
      // Trier par date de création (plus récent en premier)
      const sortedExchanges = exchanges.sort((a, b) => 
        new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
      );

      setVerification({
        success: true,
        data: sortedExchanges,
        count: exchanges.length,
        lastCreated: sortedExchanges[0]
      });

      console.log('✅ Vérification terminée:', {
        total: exchanges.length,
        dernierCree: sortedExchanges[0]?.titre || 'Aucun'
      });

    } catch (error) {
      console.error('❌ Erreur vérification:', error);
      setVerification({
        success: false,
        error: error.message || 'Erreur inconnue',
        count: 0
      });
    }
  };

  const testCreateExchange = async () => {
    try {
      setIsLoading(true);
      const token = await authService.getValidToken();
      
      if (!token) {
        throw new Error('Token manquant');
      }

      console.log('🧪 Test création échange...');
      
      const testExchange = {
        titre: `Test Bob ${new Date().toLocaleTimeString()}`,
        description: 'Bob de test pour vérifier la sauvegarde Strapi',
        type: 'pret' as const,
        categorie: 'test',
        dureeJours: 1,
        conditions: 'Test de vérification automatique',
        bobizRecompense: 5,
        isTestData: true
      };

      const createdExchange = await exchangesService.createExchange(testExchange, token);
      
      console.log('✅ Exchange créé pour test:', createdExchange.id);
      
      // Recharger pour voir le nouveau Bob
      await verifyMyExchanges();
      
    } catch (error) {
      console.error('❌ Erreur test création:', error);
      setVerification({
        success: false,
        error: `Test échoué: ${error.message}`,
        count: verification?.count || 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExchangeTypeInfo = (type: string) => {
    const types = {
      'pret': { icon: '📤', label: 'Bob de prêt', color: '#10B981' },
      'emprunt': { icon: '📥', label: 'Bob d\'emprunt', color: '#3B82F6' },
      'service_offert': { icon: '🤝', label: 'Service offert', color: '#8B5CF6' },
      'service_demande': { icon: '🙋', label: 'Service demandé', color: '#F59E0B' }
    };
    return types[type] || types.pret;
  };

  const renderConnectionStatus = () => (
    <View style={styles.statusSection}>
      <Text style={styles.sectionTitle}>🔗 Statut de connexion</Text>
      
      <View style={styles.statusGrid}>
        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>
            {connectionTest?.api ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusLabel}>API URL</Text>
          <Text style={styles.statusValue}>
            {process.env.REACT_APP_API_URL || 'Non configurée'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>
            {connectionTest?.auth ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusLabel}>Token Auth</Text>
          <Text style={styles.statusValue}>
            {connectionTest?.auth ? 'Valide' : 'Manquant/Mock'}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusIcon}>
            {user ? '✅' : '❌'}
          </Text>
          <Text style={styles.statusLabel}>Utilisateur</Text>
          <Text style={styles.statusValue}>
            {user?.username || 'Non connecté'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderVerificationResult = () => {
    if (isLoading && !verification) {
      return (
        <View style={styles.loadingSection}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Vérification en cours...</Text>
        </View>
      );
    }

    if (!verification) return null;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>
          📊 Vos Bobs dans Strapi
        </Text>

        {verification.success ? (
          <>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✅</Text>
              <View style={styles.successContent}>
                <Text style={styles.successTitle}>
                  {verification.count} Bob(s) trouvé(s)
                </Text>
                <Text style={styles.successDesc}>
                  Sauvegarde Strapi fonctionnelle
                </Text>
              </View>
            </View>

            {verification.lastCreated && (
              <View style={styles.lastCreatedCard}>
                <Text style={styles.lastCreatedTitle}>🕐 Dernier créé</Text>
                <View style={styles.exchangePreview}>
                  <Text style={styles.exchangeTypeIcon}>
                    {getExchangeTypeInfo(verification.lastCreated.type).icon}
                  </Text>
                  <View style={styles.exchangeInfo}>
                    <Text style={styles.exchangeTitle}>
                      {verification.lastCreated.titre}
                    </Text>
                    <Text style={styles.exchangeType}>
                      {getExchangeTypeInfo(verification.lastCreated.type).label}
                    </Text>
                    <Text style={styles.exchangeDate}>
                      {new Date(verification.lastCreated.dateCreation).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.exchangeStatus}>
                    <Text style={styles.exchangeStatusText}>
                      {verification.lastCreated.statut}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {verification.data && verification.data.length > 0 && (
              <View style={styles.exchangesList}>
                <Text style={styles.listTitle}>📋 Tous vos Bobs</Text>
                {verification.data.slice(0, 10).map((exchange, index) => (
                  <View key={exchange.id} style={styles.exchangeItem}>
                    <Text style={styles.itemIcon}>
                      {getExchangeTypeInfo(exchange.type).icon}
                    </Text>
                    <View style={styles.itemContent}>
                      <Text style={styles.itemTitle}>{exchange.titre}</Text>
                      <Text style={styles.itemSubtitle}>
                        {getExchangeTypeInfo(exchange.type).label} • {exchange.statut}
                      </Text>
                    </View>
                    <Text style={styles.itemDate}>
                      {new Date(exchange.dateCreation).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                ))}
                
                {verification.data.length > 10 && (
                  <Text style={styles.moreItemsText}>
                    ... et {verification.data.length - 10} autres Bobs
                  </Text>
                )}
              </View>
            )}
          </>
        ) : (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>❌</Text>
            <View style={styles.errorContent}>
              <Text style={styles.errorTitle}>Erreur de vérification</Text>
              <Text style={styles.errorDesc}>
                {verification.error || 'Impossible de récupérer les données'}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header 
        title="🔍 Vérification Strapi"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
          />
        }
      >
        {renderConnectionStatus()}
        {renderVerificationResult()}

        <View style={styles.actionsSection}>
          <Button
            title="🔄 Actualiser"
            onPress={handleRefresh}
            disabled={isLoading}
            style={styles.refreshButton}
          />

          <Button
            title="🧪 Créer Bob de test"
            onPress={testCreateExchange}
            disabled={isLoading}
            style={styles.testButton}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>ℹ️ Comment ça marche</Text>
          <Text style={styles.infoText}>
            Cette page vérifie que vos Bobs sont correctement sauvegardés dans Strapi :
            {'\n\n'}• <Text style={styles.bold}>Connexion</Text> : Vérifie l'API et l'authentification
            {'\n'}• <Text style={styles.bold}>Récupération</Text> : Charge tous vos Bobs existants  
            {'\n'}• <Text style={styles.bold}>Test</Text> : Crée un Bob temporaire pour valider
            {'\n\n'}Tirez vers le bas pour actualiser les données.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};