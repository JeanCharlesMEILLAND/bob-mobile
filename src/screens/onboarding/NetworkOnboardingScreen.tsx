import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks';
import { Button } from '../../components/common';
import { 
  ModernCard,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { storageService } from '../../services/storage.service';
import { contactsService } from '../../services/contacts.service';

export const NetworkOnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [contactStats, setContactStats] = useState({
    total: 0,
    onBob: 0,
    canInvite: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasContactPermission, setHasContactPermission] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Bienvenue sur BOB !',
      subtitle: 'Votre réseau d\'entraide local',
      emoji: '🏘️',
      component: renderWelcomeStep
    },
    {
      id: 'network',
      title: 'BOB fonctionne en réseau',
      subtitle: 'L\'entraide, c\'est ensemble !',
      emoji: '🤝',
      component: renderNetworkStep
    },
    {
      id: 'contacts',
      title: 'Trouvez vos amis',
      subtitle: 'Qui de vos contacts est déjà sur BOB ?',
      emoji: '📱',
      component: renderContactsStep
    },
    {
      id: 'invite',
      title: 'Invitez vos proches',
      subtitle: 'Plus vous êtes nombreux, plus c\'est utile !',
      emoji: '💌',
      component: renderInviteStep
    },
    {
      id: 'complete',
      title: 'C\'est parti !',
      subtitle: 'Votre réseau BOB vous attend',
      emoji: '🚀',
      component: renderCompleteStep
    }
  ];

  useEffect(() => {
    checkContactPermission();
  }, []);

  const checkContactPermission = async () => {
    const hasPermission = await contactsService.hasPermissions();
    setHasContactPermission(hasPermission);
  };

  function renderWelcomeStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 80, marginBottom: 24 }}>🏘️</Text>
        
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
          BOB n'est pas juste une app, c'est votre communauté d'entraide locale.
        </Text>

        <ModernCard style={{
          backgroundColor: '#F0F8FF',
          borderColor: modernColors.primary,
          borderWidth: 1,
          width: '100%'
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: modernColors.primary,
              textAlign: 'center',
              marginBottom: 16
            }}>
              🎯 Votre mission
            </Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray,
              textAlign: 'center',
              lineHeight: 20
            }}>
              Connectez-vous avec vos voisins, amis et famille pour créer un réseau d'entraide solide dans votre région.
            </Text>
          </View>
        </ModernCard>
      </View>
    );
  }

  function renderNetworkStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 64, marginBottom: 24 }}>🤝</Text>
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          L'entraide, c'est ensemble !
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          BOB n'est utile que si vous avez un réseau. Plus vous connaissez de personnes sur BOB, plus vous pouvez échanger.
        </Text>

        <View style={{ width: '100%', gap: 16 }}>
          <ModernCard style={{ backgroundColor: '#F0FDF4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>🏠</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: 4
                }}>
                  Voisins proches
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Empruntez des outils, partagez un jardin
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={{ backgroundColor: '#FEF3F2' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>👥</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#DC2626',
                  marginBottom: 4
                }}>
                  Amis & Famille
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Services, transport, garde d'enfants
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={{ backgroundColor: '#FEF7CD' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>🌟</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#D97706',
                  marginBottom: 4
                }}>
                  Plus de réseau = Plus d'opportunités
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Échanges variés, entraide garantie
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>
      </View>
    );
  }

  function renderContactsStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 64, marginBottom: 24 }}>📱</Text>
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Trouvez vos amis
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          Découvrons qui de vos contacts utilise déjà BOB !
        </Text>

        {hasContactPermission ? (
          <ModernCard style={{
            backgroundColor: '#F0FDF4',
            borderColor: '#22C55E',
            borderWidth: 1,
            width: '100%',
            marginBottom: 24
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#059669',
                textAlign: 'center',
                marginBottom: 8
              }}>
                Accès aux contacts autorisé
              </Text>
              {contactStats.total > 0 && (
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  textAlign: 'center'
                }}>
                  {contactStats.onBob} amis sur BOB trouvés sur {contactStats.total} contacts
                </Text>
              )}
            </View>
          </ModernCard>
        ) : (
          <ModernCard style={{
            backgroundColor: '#FEF3F2',
            borderColor: '#EF4444',
            borderWidth: 1,
            width: '100%',
            marginBottom: 24
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📵</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#DC2626',
                textAlign: 'center',
                marginBottom: 8
              }}>
                Autorisation requise
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                textAlign: 'center',
                marginBottom: 16
              }}>
                Pour trouver vos amis sur BOB, nous devons accéder à votre carnet d'adresses.
              </Text>
              
              <View style={{
                backgroundColor: 'white',
                padding: 12,
                borderRadius: 8,
                borderColor: '#FEE2E2',
                borderWidth: 1
              }}>
                <Text style={{
                  fontSize: 12,
                  color: modernColors.gray,
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  🔒 Vos contacts restent privés et ne sont jamais stockés sur nos serveurs
                </Text>
              </View>
            </View>
          </ModernCard>
        )}

        <Button
          title={hasContactPermission ? "Rechercher mes amis sur BOB" : "Autoriser l'accès aux contacts"}
          onPress={handleSyncContacts}
          loading={isLoading}
        />
      </View>
    );
  }

  function renderInviteStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 64, marginBottom: 24 }}>💌</Text>
        
        <Text style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          Invitez vos proches
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          Plus votre réseau est large, plus BOB vous sera utile !
        </Text>

        {contactStats.canInvite > 0 && (
          <ModernCard style={{
            backgroundColor: '#F0F8FF',
            borderColor: modernColors.primary,
            borderWidth: 1,
            width: '100%',
            marginBottom: 24
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🎯</Text>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: modernColors.primary,
                textAlign: 'center',
                marginBottom: 8
              }}>
                {contactStats.canInvite} contacts à inviter
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                textAlign: 'center'
              }}>
                Vous pouvez les inviter par SMS ou WhatsApp depuis la section Contacts
              </Text>
            </View>
          </ModernCard>
        )}

        <View style={{ width: '100%', gap: 16 }}>
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
                  Invitation par SMS
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Message personnalisé avec vos liens de téléchargement
                </Text>
              </View>
            </View>
          </ModernCard>

          <ModernCard style={{ backgroundColor: '#F0FDF4' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>💬</Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#059669',
                  marginBottom: 4
                }}>
                  WhatsApp
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: modernColors.gray,
                  lineHeight: 18
                }}>
                  Partage direct avec message pré-rempli
                </Text>
              </View>
            </View>
          </ModernCard>
        </View>
      </View>
    );
  }

  function renderCompleteStep() {
    return (
      <View style={{ alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 80, marginBottom: 24 }}>🚀</Text>
        
        <Text style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: modernColors.primary,
          textAlign: 'center',
          marginBottom: 12
        }}>
          C'est parti !
        </Text>
        
        <Text style={{
          fontSize: 16,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 32
        }}>
          Votre réseau BOB est configuré. Commencez dès maintenant à échanger avec votre communauté !
        </Text>

        <ModernCard style={{
          backgroundColor: modernColors.primary + '15',
          borderColor: modernColors.primary,
          borderWidth: 1,
          width: '100%',
          marginBottom: 24
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: modernColors.primary,
              textAlign: 'center',
              marginBottom: 16
            }}>
              📋 Vos prochaines étapes
            </Text>
            
            <View style={{ alignItems: 'flex-start', width: '100%' }}>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                marginBottom: 8,
                lineHeight: 20
              }}>
                • Explorez les échanges disponibles près de chez vous
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                marginBottom: 8,
                lineHeight: 20
              }}>
                • Créez votre premier échange (prêt, emprunt, service)
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                marginBottom: 8,
                lineHeight: 20
              }}>
                • Invitez plus d'amis depuis la section Contacts
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.gray,
                lineHeight: 20
              }}>
                • Gagnez vos premiers points BOBIZ en aidant vos voisins
              </Text>
            </View>
          </View>
        </ModernCard>

        <View style={{ 
          flexDirection: 'row', 
          backgroundColor: '#FEF7CD',
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
          width: '100%'
        }}>
          <Text style={{ fontSize: 32, marginRight: 12 }}>💡</Text>
          <Text style={{
            fontSize: 14,
            color: '#92400E',
            flex: 1,
            fontWeight: '500'
          }}>
            Astuce : Plus vous aidez, plus vous gagnez de points BOBIZ pour vos futurs échanges !
          </Text>
        </View>
      </View>
    );
  }

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      await completeNetworkOnboarding();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(steps.length - 1); // Aller au dernier step
    } else {
      completeNetworkOnboarding();
    }
  };

  const handleSyncContacts = async () => {
    setIsLoading(true);
    
    try {
      if (!hasContactPermission) {
        const granted = await contactsService.requestPermissions();
        
        if (!granted) {
          Alert.alert(
            'Permission refusée',
            'Vous pouvez toujours inviter vos amis manuellement depuis la section Contacts.',
            [{ text: 'OK' }]
          );
          setIsLoading(false);
          return;
        }
        
        setHasContactPermission(true);
      }

      // Synchroniser les contacts
      const contacts = await contactsService.syncContacts(true);
      
      // Calculer les stats
      const stats = {
        total: contacts.length,
        onBob: contacts.filter(c => c.isOnBob).length,
        canInvite: contacts.filter(c => !c.isOnBob && !c.isInvited).length
      };
      
      setContactStats(stats);
      
      Alert.alert(
        'Synchronisation terminée !',
        `${stats.onBob} amis trouvés sur BOB parmi vos ${stats.total} contacts.`,
        [{ text: 'Super !' }]
      );

    } catch (error: any) {
      console.error('Erreur sync contacts onboarding:', error);
      Alert.alert(
        'Erreur',
        'Impossible de synchroniser vos contacts. Vous pourrez réessayer plus tard.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const completeNetworkOnboarding = async () => {
    try {
      // Marquer l'onboarding réseau comme terminé
      await storageService.set('network_onboarding_completed', 'true');
      
      // Naviguer vers l'app principale (ou suivant dans le flow)
      console.log('Network onboarding terminé, navigation vers l\'app principale');
      
      // TODO: Naviguer vers le main tab navigator ou dashboard
      
    } catch (error) {
      console.error('Erreur completion network onboarding:', error);
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
          title="Passer"
          onPress={handleSkip}
          variant="secondary"
          size="small"
          style={{ flex: 0.3 }}
        />
        
        <Button
          title={currentStep === steps.length - 1 ? 'Commencer BOB !' : 'Suivant'}
          onPress={handleNext}
          loading={isLoading}
          style={{ flex: 0.6 }}
        />
      </View>
    </ModernScreen>
  );
};

export default NetworkOnboardingScreen;