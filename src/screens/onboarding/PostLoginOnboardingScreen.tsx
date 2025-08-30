import React, { useState } from 'react';
import { View, Text, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks';
import { Button, Input } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { biometricService } from '../../services/biometric.service';
import { storageService } from '../../services/storage.service';

export const PostLoginOnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // États du profil
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    bio: ''
  });

  // État biométrie
  const [biometricSetup, setBiometricSetup] = useState({
    asked: false,
    enabled: false
  });

  const steps = [
    {
      id: 'welcome',
      title: `Bienvenue ${user?.username} !`,
      subtitle: 'Completez votre profil BOB',
      emoji: '👋',
      component: renderWelcomeStep
    },
    {
      id: 'profile',
      title: 'Votre Profil',
      subtitle: 'Aidez vos voisins à vous connaître',
      emoji: '👤',
      component: renderProfileStep
    },
    {
      id: 'biometric',
      title: 'Connexion Rapide',
      subtitle: 'Activez Touch ID / Face ID',
      emoji: '🔐',
      component: renderBiometricStep
    },
    {
      id: 'complete',
      title: 'Tout est prêt !',
      subtitle: 'Commencez à échanger',
      emoji: '🎉',
      component: renderCompleteStep
    }
  ];

  function renderWelcomeStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 80, marginBottom: 24 }}>👋</Text>
        
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Bienvenue {user?.username} !
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          Prenons quelques instants pour configurer votre profil et découvrir BOB ensemble.
        </Text>

        <View style={{
          backgroundColor: modernColors.background,
          padding: 16,
          borderRadius: 12,
          width: '100%'
        }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: modernColors.primary,
            marginBottom: 8,
            textAlign: 'center'
          }}>
            🚀 Qu'est-ce que BOB ?
          </Text>
          <Text style={{
            fontSize: 14,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 20
          }}>
            Une plateforme d'entraide locale où vous pouvez prêter, emprunter et échanger des services avec vos voisins.
          </Text>
        </View>
      </View>
    );
  }

  function renderProfileStep() {
    return (
      <View style={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 16 }}>👤</Text>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: modernColors.primary,
            textAlign: 'center',
            marginBottom: 8
          }}>
            Votre Profil
          </Text>
          <Text style={{
            fontSize: 16,
            color: modernColors.gray,
            textAlign: 'center',
            lineHeight: 22
          }}>
            Ces informations aideront vos voisins à vous faire confiance
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Input
              label="Prénom"
              placeholder="Votre prénom"
              value={profileData.firstName}
              onChangeText={(text) => setProfileData({...profileData, firstName: text})}
              style={{ flex: 1 }}
            />
            <Input
              label="Nom"
              placeholder="Votre nom"
              value={profileData.lastName}
              onChangeText={(text) => setProfileData({...profileData, lastName: text})}
              style={{ flex: 1 }}
            />
          </View>

          <Input
            label="Ville"
            placeholder="Votre ville"
            value={profileData.city}
            onChangeText={(text) => setProfileData({...profileData, city: text})}
          />

          <Input
            label="Présentation (optionnel)"
            placeholder="Parlez-nous de vous en quelques mots..."
            value={profileData.bio}
            onChangeText={(text) => setProfileData({...profileData, bio: text})}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80 }}
          />
        </View>
      </View>
    );
  }

  function renderBiometricStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 64, marginBottom: 24 }}>🔐</Text>
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Connexion Rapide
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          {Platform.OS === 'ios' 
            ? 'Utilisez Touch ID ou Face ID pour vous connecter rapidement et en sécurité.'
            : 'Utilisez votre empreinte digitale pour vous connecter rapidement et en sécurité.'
          }
        </Text>

        <ModernCard style={{
          backgroundColor: modernColors.background,
          borderColor: modernColors.primary,
          borderWidth: 1,
          width: '100%',
          marginBottom: 24
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 48,
              marginBottom: 12
            }}>
              {Platform.OS === 'ios' ? '👆' : '🔒'}
            </Text>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: modernColors.primary,
              textAlign: 'center',
              marginBottom: 8
            }}>
              Avantages :
            </Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 20
            }}>
              • Connexion en 1 seconde{'\n'}
              • Sécurité maximale{'\n'}
              • Pas besoin de retaper votre mot de passe
            </Text>
          </View>
        </ModernCard>
      </View>
    );
  }

  function renderCompleteStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 80, marginBottom: 24 }}>🎉</Text>
        
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Tout est prêt !
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          Votre profil BOB est configuré. Vous pouvez maintenant commencer à échanger avec votre communauté !
        </Text>

        <View style={{ width: '100%', gap: 16 }}>
          <ModernCard style={{ backgroundColor: '#F0F8FF' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>🔄</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: modernColors.primary,
                  marginBottom: 4
                }}>
                  Premiers pas
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Explorez les échanges disponibles dans votre région
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={{ backgroundColor: '#F0FDF4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>📱</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: 4
                }}>
                  Votre profil
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Vous pourrez compléter votre profil à tout moment dans les paramètres
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>
      </View>
    );
  }

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Dernière étape : compléter l'onboarding
      await completeOnboarding();
      return;
    }

    // Validation selon l'étape
    if (currentStep === 1) { // Profil
      if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
        Alert.alert('Information manquante', 'Veuillez renseigner au moins votre prénom et nom.');
        return;
      }
      // TODO: Sauvegarder le profil
    }

    if (currentStep === 2) { // Biométrie
      await handleBiometricSetup();
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBiometricSetup = async () => {
    setIsLoading(true);
    
    try {
      const canEnable = await biometricService.canEnableBiometric();
      
      if (canEnable.canEnable) {
        Alert.alert(
          t('auth.biometric.enableTitle'),
          t('auth.biometric.enableMessage'),
          [
            {
              text: t('auth.biometric.disable'),
              style: 'cancel',
              onPress: () => setBiometricSetup({asked: true, enabled: false})
            },
            {
              text: t('auth.biometric.enable'),
              onPress: async () => {
                await biometricService.setEnabled(true);
                if (user?.email || user?.username) {
                  await biometricService.saveBiometricCredential(user.email || user.username);
                }
                setBiometricSetup({asked: true, enabled: true});
                Alert.alert('Succès', 'Biométrie activée avec succès !');
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Biométrie non disponible',
          canEnable.reason || 'Impossible d\'activer la biométrie sur cet appareil.'
        );
        setBiometricSetup({asked: true, enabled: false});
      }
    } catch (error) {
      console.error('Erreur setup biométrie:', error);
      setBiometricSetup({asked: true, enabled: false});
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Marquer l'onboarding comme terminé
      await storageService.set('onboarding_completed', 'true');
      
      // Naviguer vers l'app principale
      // TODO: Naviguer vers le main tab navigator
      console.log('Onboarding terminé, navigation vers l\'app principale');
      
    } catch (error) {
      console.error('Erreur completion onboarding:', error);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
      contentContainerStyle={{ justifyContent: 'space-between', padding: 20 }}
    >
      {/* Progress Bar */}
      <View style={{
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        height: 4,
        borderRadius: 2
      }}>
        <View style={{
          backgroundColor: modernColors.primary,
          height: 4,
          borderRadius: 2,
          width: `${((currentStep + 1) / steps.length) * 100}%`
        }} />
      </View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <ModernCard style={{ flex: 1 }}>
          {currentStepData.component()}
        </ModernCard>
      </View>

      {/* Navigation */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
      }}>
        <Button
          title="Ignorer"
          onPress={handleSkip}
          variant="secondary"
          size="small"
          style={{ flex: 0.3 }}
        />
        
        <Button
          title={currentStep === steps.length - 1 ? 'Commencer !' : 'Suivant'}
          onPress={handleNext}
          loading={isLoading}
          style={{ flex: 0.6 }}
        />
      </View>
    </ModernScreen>
  );
};

export default PostLoginOnboardingScreen;