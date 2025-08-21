// src/screens/exchanges/DataInjectionScreen.tsx - Interface pour injecter les données de test
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { TEST_USER, addTestUserToContacts } from '../../data/testUserData';
import { MOCK_EXCHANGES, injectMockExchangesToStrapi, cleanTestExchanges } from '../../data/mockExchangesData';
import { styles } from './DataInjectionScreen.styles';

interface InjectionStatus {
  isLoading: boolean;
  lastResult?: {
    success: number;
    errors: number;
    total: number;
  };
  lastAction?: 'inject' | 'clean' | 'add_user';
}

export const DataInjectionScreen: React.FC = () => {
  const navigation = useSimpleNavigation();
  const [status, setStatus] = useState<InjectionStatus>({ isLoading: false });

  const handleInjectData = async () => {
    Alert.alert(
      '🚀 Injection des données',
      `Voulez-vous injecter ${MOCK_EXCHANGES.length} exemples d'échanges dans Strapi ?\n\nCela inclut des Bobs de prêt, emprunt, services offerts et demandés.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Injecter',
          onPress: async () => {
            setStatus({ isLoading: true, lastAction: 'inject' });
            
            try {
              const result = await injectMockExchangesToStrapi();
              setStatus({ 
                isLoading: false, 
                lastResult: result, 
                lastAction: 'inject' 
              });
              
              if (result.success > 0) {
                Alert.alert(
                  '✅ Injection réussie !', 
                  `${result.success} échanges injectés avec succès.\n${result.errors > 0 ? `${result.errors} erreurs.` : ''}`
                );
              } else {
                Alert.alert('❌ Échec', 'Aucun échange n\'a pu être injecté.');
              }
            } catch (error) {
              setStatus({ isLoading: false });
              Alert.alert('❌ Erreur', 'Erreur lors de l\'injection des données.');
            }
          }
        }
      ]
    );
  };

  const handleCleanData = async () => {
    Alert.alert(
      '🧹 Nettoyage des données',
      'Voulez-vous supprimer tous les échanges de test ?\n\nCette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Nettoyer',
          style: 'destructive',
          onPress: async () => {
            setStatus({ isLoading: true, lastAction: 'clean' });
            
            try {
              const count = await cleanTestExchanges();
              setStatus({ 
                isLoading: false, 
                lastResult: { success: count, errors: 0, total: count },
                lastAction: 'clean' 
              });
              
              Alert.alert('✅ Nettoyage terminé', `${count} échanges de test supprimés.`);
            } catch (error) {
              setStatus({ isLoading: false });
              Alert.alert('❌ Erreur', 'Erreur lors du nettoyage.');
            }
          }
        }
      ]
    );
  };

  const handleAddTestUser = async () => {
    Alert.alert(
      '🤖 Bober Testeur',
      'Ajouter le Bober Testeur à vos contacts ?\n\nIl deviendra ami avec tous les utilisateurs pour faciliter les tests.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Ajouter',
          onPress: async () => {
            setStatus({ isLoading: true, lastAction: 'add_user' });
            
            try {
              const success = await addTestUserToContacts('current_user_id');
              setStatus({ 
                isLoading: false,
                lastResult: { success: success ? 1 : 0, errors: success ? 0 : 1, total: 1 },
                lastAction: 'add_user'
              });
              
              if (success) {
                Alert.alert('✅ Bober Testeur ajouté !', 'Il apparaît maintenant dans vos contacts.');
              } else {
                Alert.alert('❌ Échec', 'Impossible d\'ajouter le Bober Testeur.');
              }
            } catch (error) {
              setStatus({ isLoading: false });
              Alert.alert('❌ Erreur', 'Erreur lors de l\'ajout du Bober Testeur.');
            }
          }
        }
      ]
    );
  };

  const getStatusMessage = () => {
    if (!status.lastResult) return null;

    const { success, errors, total } = status.lastResult;
    const action = status.lastAction;

    if (action === 'inject') {
      return `✅ ${success}/${total} échanges injectés ${errors > 0 ? `(${errors} erreurs)` : ''}`;
    } else if (action === 'clean') {
      return `🧹 ${success} échanges supprimés`;
    } else if (action === 'add_user') {
      return success > 0 ? '🤖 Bober Testeur ajouté' : '❌ Échec ajout Bober Testeur';
    }
  };

  const renderExchangePreview = () => (
    <View style={styles.previewSection}>
      <Text style={styles.previewTitle}>📋 Aperçu des données</Text>
      
      {['pret', 'emprunt', 'service_offert', 'service_demande'].map(type => {
        const count = MOCK_EXCHANGES.filter(ex => ex.type === type).length;
        const typeInfo = {
          'pret': { icon: '📤', label: 'Prêts', color: '#10B981' },
          'emprunt': { icon: '📥', label: 'Emprunts', color: '#3B82F6' },
          'service_offert': { icon: '🤝', label: 'Services offerts', color: '#8B5CF6' },
          'service_demande': { icon: '🙋', label: 'Services demandés', color: '#F59E0B' }
        }[type];

        return (
          <View key={type} style={styles.typeRow}>
            <Text style={styles.typeIcon}>{typeInfo?.icon}</Text>
            <Text style={styles.typeLabel}>{typeInfo?.label}</Text>
            <View style={[styles.typeBadge, { backgroundColor: typeInfo?.color }]}>
              <Text style={styles.typeCount}>{count}</Text>
            </View>
          </View>
        );
      })}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total : {MOCK_EXCHANGES.length} échanges</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="🛠️ Injection de données"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.content}>
        {/* Bober Testeur Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Bober Testeur</Text>
          <Text style={styles.sectionDesc}>
            Le Bober Testeur est un utilisateur fictif qui sera ami avec tous les vrais utilisateurs.
            Il permet de tester les interactions sans impliquer de vraies personnes.
          </Text>

          <View style={styles.userCard}>
            <Text style={styles.userAvatar}>{TEST_USER.avatar}</Text>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {TEST_USER.prenom} {TEST_USER.nom}
              </Text>
              <Text style={styles.userPhone}>{TEST_USER.telephone}</Text>
              <Text style={styles.userBio}>{TEST_USER.bio}</Text>
              <View style={styles.userStats}>
                <Text style={styles.statItem}>💰 {TEST_USER.bobizBalance} Bobiz</Text>
                <Text style={styles.statItem}>⭐ {TEST_USER.reputation}/5</Text>
                <Text style={styles.statItem}>📊 {TEST_USER.totalExchanges} échanges</Text>
              </View>
            </View>
          </View>

          <Button
            title="🤖 Ajouter aux contacts"
            onPress={handleAddTestUser}
            disabled={status.isLoading}
            style={styles.addUserButton}
          />
        </View>

        {/* Données d'échange */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Données d'échange</Text>
          <Text style={styles.sectionDesc}>
            Collection d'exemples réalistes couvrant tous les types d'échanges.
            Parfait pour tester l'interface et les fonctionnalités.
          </Text>

          {renderExchangePreview()}

          <View style={styles.actionButtons}>
            <Button
              title="🚀 Injecter les données"
              onPress={handleInjectData}
              disabled={status.isLoading}
              style={styles.injectButton}
            />

            <Button
              title="🧹 Nettoyer les données"
              onPress={handleCleanData}
              disabled={status.isLoading}
              style={styles.cleanButton}
            />
          </View>
        </View>

        {/* Status */}
        {status.isLoading && (
          <View style={styles.loadingSection}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>
              {status.lastAction === 'inject' && 'Injection en cours...'}
              {status.lastAction === 'clean' && 'Nettoyage en cours...'}
              {status.lastAction === 'add_user' && 'Ajout du Bober Testeur...'}
            </Text>
          </View>
        )}

        {!status.isLoading && status.lastResult && (
          <View style={styles.statusSection}>
            <Text style={styles.statusText}>{getStatusMessage()}</Text>
          </View>
        )}

        {/* Exemples détaillés */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Exemples inclus</Text>
          
          <View style={styles.examplesList}>
            {MOCK_EXCHANGES.slice(0, 6).map((exchange, index) => (
              <View key={index} style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleType}>
                    {exchange.type === 'pret' ? '📤' : 
                     exchange.type === 'emprunt' ? '📥' :
                     exchange.type === 'service_offert' ? '🤝' : '🙋'}
                  </Text>
                  <Text style={styles.exampleCategory}>{exchange.categorie}</Text>
                </View>
                <Text style={styles.exampleTitle}>{exchange.titre}</Text>
                <Text style={styles.exampleDesc} numberOfLines={2}>
                  {exchange.description}
                </Text>
                <Text style={styles.exampleReward}>
                  +{exchange.bobizRecompense} Bobiz
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.moreText}>
            ... et {MOCK_EXCHANGES.length - 6} autres exemples !
          </Text>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>📖 Instructions</Text>
          <Text style={styles.instructionsText}>
            1. <Text style={styles.bold}>Ajoutez le Bober Testeur</Text> pour avoir un contact de test{'\n'}
            2. <Text style={styles.bold}>Injectez les données</Text> pour peupler Strapi{'\n'}
            3. <Text style={styles.bold}>Testez l'app</Text> avec des données réalistes{'\n'}
            4. <Text style={styles.bold}>Nettoyez</Text> quand vous voulez repartir à zéro
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};