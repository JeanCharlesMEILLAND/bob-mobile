// src/screens/exchanges/BobTestScenario.tsx - Test complet du parcours Bob
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { Header, Button } from '../../components/common';
import { BoberCardScreen, BoberData } from './BoberCardScreen';
import { mockBoberExamples } from './mockBoberData';
import { styles } from './BobTestScenario.styles';

type UserRole = 'preteur' | 'emprunteur';
type TestStep = 'menu' | 'create_bob' | 'bob_created' | 'switch_user' | 'view_as_borrower';

export const BobTestScenario: React.FC = () => {
  const navigation = useSimpleNavigation();
  
  const [currentStep, setCurrentStep] = useState<TestStep>('menu');
  const [userRole, setUserRole] = useState<UserRole>('preteur');
  const [createdBob, setCreatedBob] = useState<BoberData | null>(null);

  // Simulation d'un Bob de prêt créé
  const simulatedBobPret: BoberData = {
    id: 'test_bob_pret_001',
    title: '🔨 Perceuse sans fil Bosch',
    description: 'Perceuse sans fil 18V avec 2 batteries, chargeur et coffret de mèches. Parfaite pour tous vos travaux de bricolage. État impeccable, utilisée seulement pour quelques projets.',
    type: 'pret',
    category: 'Bricolage',
    status: 'en_attente',
    createdBy: {
      id: 'preteur_123',
      name: 'Marie Dupont (Vous)',
    },
    participants: [
      {
        id: 'emprunteur_456',
        name: 'Thomas Martin',
        status: 'invite',
      }
    ],
    createdAt: new Date().toISOString(),
    duration: '3 jours',
    conditions: '• Merci de la rendre propre et chargée\n• Petit dépôt de garantie de 50€ demandé\n• Disponible dès demain',
    location: {
      address: '15 rue de la République, 69001 Lyon',
      distance: '800m'
    },
    photos: [
      'https://example.com/perceuse1.jpg',
      'https://example.com/perceuse2.jpg'
    ],
    chatId: 'chat_test_001',
    qrCode: 'bob://bober/test_bob_pret_001'
  };

  const simulatedBobPretAccepted: BoberData = {
    ...simulatedBobPret,
    status: 'actif',
    participants: [
      {
        id: 'emprunteur_456',
        name: 'Thomas Martin',
        status: 'accepte',
      }
    ]
  };

  const handleStartBobCreation = () => {
    Alert.alert(
      '🚀 Création d\'un Bob de prêt',
      'Simulation du processus complet:\n\n1. Sélection "Bob de prêt"\n2. Description de la perceuse\n3. Ciblage de Thomas Martin\n4. Confirmation et création',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Simuler la création',
          onPress: () => {
            setTimeout(() => {
              setCreatedBob(simulatedBobPret);
              setCurrentStep('bob_created');
              Alert.alert('✅ Bob créé !', 'Votre Bob de prêt a été créé et envoyé à Thomas Martin.');
            }, 1500);
          }
        }
      ]
    );
  };

  const handleSwitchToEmprunteur = () => {
    setUserRole('emprunteur');
    setCurrentStep('view_as_borrower');
  };

  const handleAcceptBob = () => {
    Alert.alert(
      '✅ Accepter le Bob',
      'Thomas Martin accepte d\'emprunter la perceuse',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Accepter',
          onPress: () => {
            setCreatedBob(simulatedBobPretAccepted);
            Alert.alert('🎉 Bob accepté !', 'Thomas a accepté ! Le Bob est maintenant actif. Vous pouvez communiquer via le chat.');
          }
        }
      ]
    );
  };

  const handleRefuseBob = () => {
    Alert.alert(
      '❌ Refuser le Bob',
      'Thomas Martin refuse d\'emprunter la perceuse',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser',
          style: 'destructive',
          onPress: () => {
            const refusedBob = { ...simulatedBobPret, status: 'annule' as const };
            setCreatedBob(refusedBob);
            Alert.alert('😔 Bob refusé', 'Thomas a refusé. Vous pouvez proposer à quelqu\'un d\'autre.');
          }
        }
      ]
    );
  };

  const handleMarkCompleted = () => {
    Alert.alert(
      '🏆 Terminer le Bob',
      'Marquer ce Bob comme terminé ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Terminé',
          onPress: () => {
            const completedBob = { ...simulatedBobPretAccepted, status: 'termine' as const };
            setCreatedBob(completedBob);
            Alert.alert('🎉 Bob terminé !', 'Perceuse rendue ! Vous avez gagné 15 Bobiz. 💰');
          }
        }
      ]
    );
  };

  const renderMenu = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>🧪 Test du parcours Bob</Text>
        <Text style={styles.subtitle}>
          Simulation complète d'un Bob de prêt de bout en bout
        </Text>

        <View style={styles.scenarioCard}>
          <Text style={styles.scenarioTitle}>📖 Scénario de test</Text>
          <Text style={styles.scenarioText}>
            <Text style={styles.bold}>Prêteur:</Text> Marie Dupont{'\n'}
            <Text style={styles.bold}>Objet:</Text> Perceuse sans fil Bosch{'\n'}
            <Text style={styles.bold}>Emprunteur:</Text> Thomas Martin{'\n'}
            <Text style={styles.bold}>Durée:</Text> 3 jours{'\n'}
            <Text style={styles.bold}>Distance:</Text> 800m
          </Text>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>🔄 Étapes du test</Text>
          
          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>1️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Création du Bob</Text>
              <Text style={styles.stepDesc}>Marie crée un Bob de prêt pour sa perceuse</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>2️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Vue côté emprunteur</Text>
              <Text style={styles.stepDesc}>Thomas reçoit la demande et peut accepter/refuser</Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <Text style={styles.stepNumber}>3️⃣</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Bob actif</Text>
              <Text style={styles.stepDesc}>Communication via chat et suivi en temps réel</Text>
            </View>
          </View>
        </View>

        <Button
          title="🚀 Commencer le test"
          onPress={handleStartBobCreation}
          style={styles.startButton}
        />

        <TouchableOpacity 
          style={styles.realCreateButton}
          onPress={() => navigation.navigate('CreateExchange')}
        >
          <Text style={styles.realCreateButtonText}>
            📱 Créer un vrai Bob
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderBobCreated = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>✅ Bob créé avec succès !</Text>
        
        <View style={styles.successCard}>
          <Text style={styles.successTitle}>🎉 Félicitations Marie !</Text>
          <Text style={styles.successText}>
            Votre Bob de prêt "Perceuse sans fil Bosch" a été créé et envoyé à Thomas Martin.
          </Text>
          <Text style={styles.successText}>
            Il va recevoir une notification et pourra accepter ou refuser.
          </Text>
        </View>

        {createdBob && (
          <View style={styles.bobPreview}>
            <Text style={styles.previewTitle}>📋 Aperçu de votre Bob</Text>
            <View style={styles.bobSummary}>
              <Text style={styles.bobTitle}>{createdBob.title}</Text>
              <Text style={styles.bobStatus}>Statut: {createdBob.status}</Text>
              <Text style={styles.bobParticipant}>
                Envoyé à: {createdBob.participants[0]?.name}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <Button
            title="👀 Voir la fiche complète"
            onPress={() => {
              if (createdBob) {
                navigation.navigate('BoberCard', { 
                  boberData: { ...createdBob, createdBy: { ...createdBob.createdBy, name: 'Marie Dupont (Vous)' }} 
                });
              }
            }}
            style={styles.viewButton}
          />

          <Button
            title="🔄 Voir côté Thomas"
            onPress={handleSwitchToEmprunteur}
            style={styles.switchButton}
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderBorrowerView = () => (
    <ScrollView style={styles.content}>
      <View style={styles.section}>
        <Text style={styles.title}>👋 Vue de Thomas Martin</Text>
        <Text style={styles.subtitle}>
          Vous avez reçu une demande de Bob !
        </Text>

        <View style={styles.notificationCard}>
          <Text style={styles.notifIcon}>🔔</Text>
          <Text style={styles.notifTitle}>Nouveau Bob de prêt</Text>
          <Text style={styles.notifText}>
            Marie Dupont vous propose d'emprunter sa "Perceuse sans fil Bosch"
          </Text>
          <Text style={styles.notifTime}>Il y a quelques instants</Text>
        </View>

        {createdBob && (
          <View style={styles.bobPreview}>
            <Text style={styles.previewTitle}>📋 Détails du Bob</Text>
            <View style={styles.bobDetails}>
              <Text style={styles.bobTitle}>{createdBob.title}</Text>
              <Text style={styles.bobDesc}>{createdBob.description}</Text>
              <Text style={styles.bobConditions}>
                <Text style={styles.bold}>Conditions:</Text>{'\n'}{createdBob.conditions}
              </Text>
              <Text style={styles.bobLocation}>
                📍 {createdBob.location?.address} ({createdBob.location?.distance})
              </Text>
            </View>
          </View>
        )}

        {createdBob?.status === 'en_attente' && (
          <View style={styles.borrowerActions}>
            <Text style={styles.actionTitle}>Que souhaitez-vous faire ?</Text>
            
            <Button
              title="✅ Accepter ce Bob"
              onPress={handleAcceptBob}
              style={styles.acceptButton}
            />
            
            <Button
              title="❌ Refuser ce Bob"
              onPress={handleRefuseBob}
              style={styles.refuseButton}
            />
          </View>
        )}

        {createdBob?.status === 'actif' && (
          <View style={styles.activeActions}>
            <Text style={styles.activeTitle}>🎉 Bob accepté !</Text>
            <Text style={styles.activeText}>
              Vous pouvez maintenant communiquer avec Marie et organiser la récupération.
            </Text>
            
            <Button
              title="💬 Ouvrir le chat"
              onPress={() => Alert.alert('💬 Chat', 'Fonctionnalité chat en cours de développement')}
              style={styles.chatButton}
            />
            
            <Button
              title="🏆 Marquer comme terminé"
              onPress={handleMarkCompleted}
              style={styles.completeButton}
            />
          </View>
        )}

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            setUserRole('preteur');
            setCurrentStep('bob_created');
          }}
        >
          <Text style={styles.backButtonText}>← Retour vue Marie</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const getScreenTitle = () => {
    if (currentStep === 'view_as_borrower') {
      return `${createdBob?.title || 'Bob'} - Thomas`;
    }
    return 'Test Parcours Bob';
  };

  return (
    <View style={styles.container}>
      <Header 
        title={getScreenTitle()}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      
      {currentStep === 'menu' && renderMenu()}
      {currentStep === 'bob_created' && renderBobCreated()}
      {currentStep === 'view_as_borrower' && renderBorrowerView()}
    </View>
  );
};