// src/screens/profile/ProfileScreen.tsx - Version modernisée
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useContacts } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
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

// ProfileAction remplacé par ModernActionButton

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigation = useSimpleNavigation();
  const { forcePullFromStrapi } = useContacts();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Store pour les modes de test
  const { testMode, setTestMode, setInvitedBy } = useTestStore();

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
    </ModernScreen>
  );
};

export default ProfileScreen;