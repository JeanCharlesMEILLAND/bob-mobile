// src/screens/profile/ProfileScreen.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useContacts, useNetworkAccess } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { biometricService } from '../../services/biometric.service';
import { useTestStore } from '../../store/testStore';
import { Header } from '../../components/common';
import { LanguageSelector } from '../../components/common/LanguageSelector';
import { 
  ModernCard,
  ModernSection,
  ModernProgressBar,
  ModernStatCard,
  ModernActionButton,
  modernColors 
} from '../../components/common/ModernUI';
import { ModernScreen } from '../../components/common/ModernScreen';
import { ReferralSection } from '../../components/common/ReferralSection';

// ProfileAction remplacé par ModernActionButton

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigation = useSimpleNavigation();
  const { forcePullFromStrapi } = useContacts();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState<any>(null);
  
  // Network access stats
  const networkAccess = useNetworkAccess({ feature: 'profile' });
  
  // Store pour les modes de test
  const { testMode, setTestMode, setInvitedBy } = useTestStore();

  useEffect(() => {
    loadBiometricStatus();
  }, []);

  const loadBiometricStatus = async () => {
    try {
      const capability = await biometricService.checkCapability();
      const isEnabled = await biometricService.getEnabled();
      setBiometricStatus({
        ...capability,
        isEnabled
      });
    } catch (error) {
      console.error('Erreur chargement biométrie:', error);
    }
  };

  const handleBiometricToggle = async () => {
    try {
      if (!biometricStatus?.isAvailable) {
        Alert.alert('Biométrie non disponible', biometricStatus?.reason || 'Cette fonctionnalité n\'est pas disponible sur votre appareil.');
        return;
      }

      if (biometricStatus.isEnabled) {
        // Désactiver
        await biometricService.setEnabled(false);
        Alert.alert('Biométrie désactivée', 'Vous devrez utiliser votre mot de passe pour vous connecter.');
      } else {
        // Activer
        Alert.alert(
          'Activer la biométrie',
          'Souhaitez-vous utiliser votre empreinte digitale ou Face ID pour vous connecter plus rapidement ?',
          [
            { text: 'Annuler', style: 'cancel' },
            {
              text: 'Activer',
              onPress: async () => {
                try {
                  await biometricService.setEnabled(true);
                  if (user?.email || user?.username) {
                    await biometricService.saveBiometricCredential(user.email || user.username);
                  }
                  Alert.alert('Biométrie activée', 'Vous pourrez maintenant vous connecter avec votre empreinte ou Face ID !');
                } catch (error) {
                  Alert.alert('Erreur', 'Impossible d\'activer la biométrie.');
                }
              }
            }
          ]
        );
      }
      
      await loadBiometricStatus(); // Recharger le statut
    } catch (error) {
      console.error('Erreur toggle biométrie:', error);
      Alert.alert('Erreur', 'Impossible de modifier les paramètres biométriques.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirm'),
      t('profile.logoutMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMenuAction = (action: string) => {
    Alert.alert('Info', t('profile.featureInDevelopment', { feature: action }));
  };

  // Calculer le niveau basé sur les points
  const getBobizLevel = (points: number) => {
    if (points >= 1000) return '🏆 Légende';
    if (points >= 500) return '⭐ Super Bob';
    if (points >= 200) return '💫 Ami fidèle';
    return '🌱 Débutant';
  };

  const userBobizPoints = user?.bobizPoints || 0;
  const userLevel = getBobizLevel(userBobizPoints);

  // Fonctions de test d'interface
  const handleTestNewUser = () => {
    setTestMode('newUser');
    setInvitedBy(null);
    Alert.alert(
      '🧪 Mode Nouvel Utilisateur Activé',
      'L\'écran d\'accueil affichera la WelcomeSection !',
      [
        {
          text: 'Voir maintenant',
          onPress: () => navigation.navigateToTab('home')
        },
        { text: 'Plus tard', style: 'cancel' }
      ]
    );
  };

  const handleTestInvited = () => {
    setTestMode('invited');
    setInvitedBy('Marie'); // Nom d'exemple
    Alert.alert(
      '🎉 Mode Utilisateur Invité Activé',
      'L\'écran d\'accueil affichera le message "Marie vous a invité !" !',
      [
        {
          text: 'Voir maintenant',
          onPress: () => navigation.navigateToTab('home')
        },
        { text: 'Plus tard', style: 'cancel' }
      ]
    );
  };

  const handleTestNormal = () => {
    setTestMode('normal');
    setInvitedBy(null);
    Alert.alert(
      '✅ Mode Normal Activé',
      'L\'écran d\'accueil affichera le contenu standard avec activités.',
      [
        {
          text: 'Voir maintenant',
          onPress: () => navigation.navigateToTab('home')
        },
        { text: 'OK', style: 'cancel' }
      ]
    );
  };

  const handleResyncFromStrapi = async () => {
    Alert.alert(
      '🔄 Resynchroniser depuis Strapi',
      'Cette action va récupérer tous vos contacts directement depuis le serveur et mettre à jour vos statistiques. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Synchroniser',
          onPress: async () => {
            try {
              // Alert de début de synchronisation
              Alert.alert(
                '🔄 Synchronisation en cours',
                'Récupération de vos contacts depuis le serveur Strapi...'
              );

              const result = await forcePullFromStrapi();
              
              // Alert de succès avec détails
              Alert.alert(
                '✅ Resynchronisation terminée',
                result.message || 'Vos contacts et statistiques ont été mis à jour depuis Strapi.',
                [
                  {
                    text: 'Voir les contacts',
                    onPress: () => navigation.navigateToTab('contacts')
                  },
                  { text: 'OK', style: 'cancel' }
                ]
              );
              
            } catch (error) {
              console.error('❌ Erreur resync Strapi:', error);
              
              Alert.alert(
                '❌ Erreur de synchronisation',
                'Impossible de récupérer vos contacts depuis Strapi. Vérifiez votre connexion et réessayez.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <ModernScreen
      style={{ backgroundColor: '#f5f5f5' }}
    >
      <Header title={t('profile.title')} />
      
      {/* Profile Header Card */}
      <ModernCard style={{ margin: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: modernColors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 16
          }}>
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: modernColors.white
            }}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: modernColors.dark,
              marginBottom: 4
            }}>
              {user?.username || 'Utilisateur'}
            </Text>
            <Text style={{
              fontSize: 14,
              color: modernColors.gray
            }}>
              {user?.email || 'email@example.com'}
            </Text>
          </View>
        </View>
      </ModernCard>

      {/* Bobiz Stats Card */}
      <ModernSection title="🏆 Mon Bobiz" style={{ margin: 8 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <ModernStatCard
            icon="💎"
            number={userBobizPoints}
            label={t('profile.points')}
            color={modernColors.warning}
          />
          <ModernStatCard
            icon="🏆"
            number={userLevel}
            label={t('profile.level')}
            color={modernColors.success}
          />
        </View>
        
        <ModernProgressBar
          percentage={Math.min((userBobizPoints % 200) / 200 * 100, 100)}
          color={modernColors.primary}
          label={`${200 - (userBobizPoints % 200)} points pour le niveau suivant`}
        />
      </ModernSection>

      {/* Section de parrainage avec QR code */}
      <ReferralSection />

      {/* Biometric Security Section */}
      <ModernSection title="🔐 Sécurité Biométrique" style={{ margin: 8 }}>
        <ModernCard style={{
          backgroundColor: biometricStatus?.isEnabled ? '#F0FDF4' : '#FEF3C7',
          borderColor: biometricStatus?.isEnabled ? '#22C55E' : '#F59E0B',
          borderWidth: 1
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 32, marginRight: 16 }}>
              {biometricStatus?.isEnabled ? '🟢' : biometricStatus?.isAvailable ? '🟡' : '🔴'}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: biometricStatus?.isEnabled ? '#15803D' : '#92400E',
                marginBottom: 4
              }}>
                {biometricStatus?.isEnabled 
                  ? '✅ Biométrie activée'
                  : biometricStatus?.isAvailable 
                    ? '⚠️ Biométrie disponible' 
                    : '❌ Biométrie non disponible'
                }
              </Text>
              <Text style={{
                fontSize: 14,
                color: modernColors.dark,
                lineHeight: 18
              }}>
                {biometricStatus?.isEnabled 
                  ? 'Connexion rapide avec Touch ID / Face ID'
                  : biometricStatus?.isAvailable 
                    ? 'Activez pour une connexion plus rapide'
                    : biometricStatus?.reason || 'Non supporté sur cet appareil'
                }
              </Text>
            </View>
            {biometricStatus?.isAvailable && (
              <TouchableOpacity
                onPress={handleBiometricToggle}
                style={{
                  backgroundColor: biometricStatus.isEnabled ? '#EF4444' : '#22C55E',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 6
                }}
              >
                <Text style={{
                  color: 'white',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {biometricStatus.isEnabled ? 'Désactiver' : 'Activer'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ModernCard>
      </ModernSection>

      {/* Network Stats Section */}
      <ModernSection title="🏘️ Mon Réseau BOB" style={{ margin: 8 }}>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <ModernStatCard
            icon="👥"
            number={networkAccess.networkStats.totalContacts}
            label="Contacts total"
            color={modernColors.info}
          />
          <ModernStatCard
            icon="🤝"
            number={networkAccess.networkStats.bobContacts}
            label="Amis sur BOB"
            color={networkAccess.networkStats.bobContacts >= 3 ? modernColors.success : modernColors.warning}
          />
        </View>
        
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <ModernStatCard
            icon="⚡"
            number={networkAccess.networkStats.activeContacts}
            label="Amis actifs"
            color={modernColors.primary}
          />
          <ModernStatCard
            icon="📱"
            number={networkAccess.networkStats.totalContacts - networkAccess.networkStats.bobContacts}
            label="À inviter"
            color={modernColors.gray}
          />
        </View>

        {networkAccess.networkStats.bobContacts < 5 && (
          <ModernCard style={{ 
            backgroundColor: '#FEF3C7',
            borderLeftWidth: 4,
            borderLeftColor: '#F59E0B',
            marginTop: 8
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#92400E',
              marginBottom: 6
            }}>
              💡 Conseil : Développez votre réseau !
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#78350F',
              lineHeight: 18
            }}>
              {networkAccess.networkStats.bobContacts < 2 
                ? 'Invitez au moins 2 amis pour profiter pleinement de BOB ! Plus votre réseau est grand, plus vous pouvez échanger.'
                : 'Excellent début ! Continuez à inviter vos proches pour créer une vraie communauté d\'entraide.'
              }
            </Text>
          </ModernCard>
        )}
      </ModernSection>

      {/* Account Completion Progress */}
      <ModernSection title="📊 Profil" style={{ margin: 8 }}>
        {(() => {
          const hasEmail = !!user?.email;
          const hasUsername = !!user?.username;
          const hasBiometric = !!biometricStatus?.isEnabled;
          const hasNetwork = networkAccess.networkStats.bobContacts > 0;
          const hasReferral = true; // Assume referral system is set up
          
          const completed = [hasEmail, hasUsername, hasBiometric, hasNetwork, hasReferral].filter(Boolean).length;
          const total = 5;
          const percentage = Math.round((completed / total) * 100);
          
          return (
            <>
              <ModernProgressBar
                percentage={percentage}
                color={percentage === 100 ? modernColors.success : modernColors.primary}
                label={`Profil complété à ${percentage}%`}
              />
              
              <View style={{ marginTop: 16, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>
                    {hasEmail ? '✅' : '⏳'}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: hasEmail ? modernColors.success : modernColors.gray 
                  }}>
                    Email configuré
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>
                    {hasUsername ? '✅' : '⏳'}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: hasUsername ? modernColors.success : modernColors.gray 
                  }}>
                    Nom d'utilisateur défini
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>
                    {hasBiometric ? '✅' : '⏳'}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: hasBiometric ? modernColors.success : modernColors.gray 
                  }}>
                    Biométrie activée
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>
                    {hasNetwork ? '✅' : '⏳'}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: hasNetwork ? modernColors.success : modernColors.gray 
                  }}>
                    Réseau établi ({networkAccess.networkStats.bobContacts} amis)
                  </Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>✅</Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: modernColors.success
                  }}>
                    Code parrainage configuré
                  </Text>
                </View>
              </View>
            </>
          );
        })()}
      </ModernSection>

      {/* Settings Section */}
      <ModernSection title={t('profile.settings')} style={{ margin: 8 }}>
        <ModernActionButton
          icon="📱"
          title={t('profile.notifications')}
          description="Gérer vos préférences de notifications"
          onPress={() => handleMenuAction('Notifications')}
        />
        
        <ModernActionButton
          icon="🌍"
          title={t('settings.language')}
          description="Changer la langue de l'application"
          onPress={() => setShowLanguageSelector(true)}
        />
        
        <ModernActionButton
          icon="🔒"
          title={t('profile.privacy')}
          description="Paramètres de confidentialité et sécurité"
          onPress={() => handleMenuAction('Confidentialité')}
        />
        
        <ModernActionButton
          icon="🔄"
          title="Resynchroniser depuis Strapi"
          description="Récupérer vos contacts directement depuis le serveur et mettre à jour les statistiques"
          onPress={handleResyncFromStrapi}
          color={modernColors.info}
        />
        
        <ModernActionButton
          icon="❓"
          title={t('profile.help')}
          description="Centre d'aide et support client"
          onPress={() => handleMenuAction('Aide')}
        />
        
        <ModernActionButton
          icon="ℹ️"
          title={t('profile.about')}
          description="Informations sur l'application Bob"
          onPress={() => handleMenuAction('À propos')}
        />
      </ModernSection>

      {/* Section de test développement */}
      <ModernSection title="🧪 Tests Interface" style={{ margin: 8 }}>
        <ModernCard style={{ 
          backgroundColor: testMode === 'normal' ? '#F0F8FF' : '#FFF7ED',
          marginBottom: 16,
          padding: 16
        }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>
            Mode actuel : {
              testMode === 'normal' ? '✅ Normal' :
              testMode === 'newUser' ? '👋 Nouvel Utilisateur' :
              '🎉 Utilisateur Invité'
            }
          </Text>
          <Text style={{ fontSize: 14, color: '#666' }}>
            {testMode === 'normal' ? 'Écran d\'accueil avec activités fictives' :
             testMode === 'newUser' ? 'Écran d\'accueil avec WelcomeSection' :
             testMode === 'invited' ? 'WelcomeSection avec message d\'invitation' :
             'Mode de test actif'}
          </Text>
        </ModernCard>
        <ModernActionButton
          icon="👋"
          title="Test Nouvel Utilisateur"
          description="Voir l'écran d'accueil pour un utilisateur sans activité"
          onPress={handleTestNewUser}
          color={modernColors.primary}
        />
        
        <ModernActionButton
          icon="🎉"
          title="Test Utilisateur Invité"
          description="Simuler l'expérience d'un utilisateur invité par un ami"
          onPress={handleTestInvited}
          color={modernColors.warning}
        />
        
        <ModernActionButton
          icon="✅"
          title="Mode Normal"
          description="Écran d'accueil standard avec activités"
          onPress={handleTestNormal}
          color={modernColors.success}
        />
      </ModernSection>

      {/* Account Section */}
      <ModernSection title="Compte" style={{ margin: 8 }}>
        <ModernActionButton
          icon="🚪"
          title={t('profile.logout')}
          description="Se déconnecter de votre compte"
          onPress={handleLogout}
          color={modernColors.danger}
        />
      </ModernSection>

      {/* App Info */}
      <ModernCard style={{ margin: 8 }}>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: modernColors.dark,
          marginBottom: 8,
          textAlign: 'center'
        }}>Bob - L'app d'entraide</Text>
        <Text style={{
          fontSize: 14,
          color: modernColors.gray,
          marginBottom: 8,
          textAlign: 'center'
        }}>Version 1.0.0</Text>
        <Text style={{
          fontSize: 14,
          color: modernColors.gray,
          textAlign: 'center',
          lineHeight: 20
        }}>
          Prêtez, empruntez et organisez des événements avec vos proches
        </Text>
      </ModernCard>
      
      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
      
      {/* Nom de l'écran pour debug */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 8,
        alignItems: 'center'
      }}>
        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
          👤 SCREEN: ProfileScreen.tsx
        </Text>
      </View>
    </ModernScreen>
  );
};

export default ProfileScreen;