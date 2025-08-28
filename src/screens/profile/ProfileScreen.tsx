// src/screens/profile/ProfileScreen.tsx - Version modernisée
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { useTestStore, initTestStore } from '../../store/testStore';
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
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  // Store pour les modes de test
  const [localTestMode, setLocalTestMode] = useState<'normal' | 'newUser' | 'invited'>('normal');
  const testMode = localTestMode;
  
  // Actions temporaires (remplacent le store)
  const setTestMode = (mode: 'normal' | 'newUser' | 'invited') => {
    setLocalTestMode(mode);
    console.log('🧪 Mode test changé vers:', mode);
  };
  
  const setInvitedBy = (name: string | null) => {
    console.log('🧪 Invité par:', name);
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

  // 🔍 DIAGNOSTIC temporaire: Tester permissions Strapi
  const handleDiagnosticStrapi = async () => {
    try {
      const { authService } = await import('../../services/auth.service');
      const { debugService } = await import('../../services/debug.service');
      
      Alert.alert('🔍 Diagnostic Strapi', 'Test des permissions en cours...', [
        { text: 'OK' }
      ]);
      
      const token = await authService.getValidToken();
      if (!token) {
        Alert.alert('❌ Erreur', 'Pas de token d\'authentification');
        return;
      }
      
      console.log('🔍 Lancement diagnostic Strapi...');
      const results = await debugService.diagnoseStrapiPermissions(token);
      
      const message = `
📖 Lecture: ${results.canRead ? '✅' : '❌'}
✏️ Création: ${results.canCreate ? '✅' : '❌'}
🔄 Modification: ${results.canUpdate ? '✅' : '❌'}
🗑️ Suppression: ${results.canDelete ? '✅' : '❌'}

${results.errors.length > 0 ? `Erreurs: ${results.errors.length}` : ''}`;
      
      Alert.alert(
        '🔍 Résultats Diagnostic',
        message,
        [
          { text: 'Voir logs', onPress: () => console.log('📊 Diagnostic complet:', results) },
          { text: 'OK' }
        ]
      );
      
    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      Alert.alert('❌ Erreur', 'Impossible de faire le diagnostic');
    }
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

      {/* Section de test développement - Version nettoyée */}
      <ModernSection title="🧪 Outils Développeur" style={{ margin: 8 }}>
        
        {/* Sous-section Tests UI */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#666' }}>
          🎭 Tests Interface Utilisateur
        </Text>
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

        {/* Sous-section Contacts & Sync */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#666' }}>
          📱 Gestion Contacts & Synchronisation
        </Text>
        
        <ModernActionButton
          icon="🔍"
          title="Détecter utilisateurs Bob"
          description="⚠️ DÉSACTIVÉ - Utilisez le bouton dans l'écran Contacts"
          onPress={async () => {
            Alert.alert(
              '🔍 Détection Bob', 
              'Cette fonction a été déplacée vers l\'écran Contacts pour éviter les crashes.\n\nAllez dans Contacts → Bouton violet "🔍 Détecter utilisateurs Bob"',
              [{ text: 'OK' }]
            );
          }}
          color="#94A3B8"
        />
        
        <ModernActionButton
          icon="🔄"
          title="Resync depuis Strapi"
          description="Récupérer tous les contacts depuis Strapi + détection Bob automatique"
          onPress={async () => {
            try {
              console.log('🔄 Début resynchronisation depuis Strapi...');
              
              const { apiClient } = await import('../../services/api');
              const { authService } = await import('../../services/auth.service');
              const { ContactsManager } = await import('../../services/contacts/ContactsManager');
              
              const token = await authService.getValidToken();
              if (!token) {
                Alert.alert('❌ Erreur', 'Pas de token d\'authentification');
                return;
              }
              
              // 1. Récupérer tous les contacts Strapi
              const response = await apiClient.get('/contacts?pagination[limit]=100', token);
              if (!response.ok) {
                Alert.alert('❌ Erreur', 'Impossible de récupérer les contacts Strapi');
                return;
              }
              
              const data = await response.json();
              const strapiContacts = data.data || [];
              console.log(`📥 ${strapiContacts.length} contacts trouvés dans Strapi`);
              
              if (strapiContacts.length === 0) {
                Alert.alert('ℹ️ Info', 'Aucun contact trouvé dans Strapi');
                return;
              }
              
              // 2. Convertir au format local et importer
              const manager = ContactsManager.getInstance();
              const contactsToImport = strapiContacts.map((sc: any) => ({
                id: sc.documentId || sc.id,
                telephone: sc.telephone,
                nom: sc.nom,
                prenom: sc.prenom,
                email: sc.email,
                source: 'repertoire',
                dateAjout: sc.dateAjout || sc.createdAt,
                strapiId: sc.documentId || sc.id,
                documentId: sc.documentId
              }));
              
              // 3. Ajouter au repository local
              await manager.repository.addMany(contactsToImport);
              console.log(`✅ ${contactsToImport.length} contacts resynchronisés`);
              
              // 4. Lancer automatiquement la détection Bob
              console.log('🔍 Lancement détection Bob après resync...');
              try {
                await manager.detectBobUsers(contactsToImport);
                console.log('✅ Détection Bob terminée après resync');
              } catch (error) {
                console.warn('⚠️ Erreur détection Bob après resync:', error);
              }
              
              Alert.alert(
                '✅ Resynchronisation terminée', 
                `${strapiContacts.length} contacts récupérés depuis Strapi et détection Bob effectuée. Vérifiez vos stats !`,
                [
                  { text: 'OK', onPress: () => {
                    // Forcer un rafraîchissement de l'interface
                    console.log('🔄 Rafraîchissement interface après resync');
                  }}
                ]
              );
              
            } catch (error) {
              console.error('❌ Erreur resync:', error);
              Alert.alert('❌ Erreur', 'Erreur lors de la resynchronisation: ' + error.message);
            }
          }}
          color={modernColors.warning}
        />

        {/* Sous-section Debug & Diagnostic */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#666' }}>
          🔧 Debug & Diagnostic
        </Text>
        
        <ModernActionButton
          icon="🔍"
          title="Voir Structure Strapi"
          description="Afficher tous les contacts Strapi v5 et leur structure dans les logs"
          onPress={async () => {
            try {
              const { authService } = await import('../../services/auth.service');
              const { apiClient } = await import('../../services/api');
              
              const token = await authService.getValidToken();
              if (!token) {
                Alert.alert('❌ Erreur', 'Pas de token d\'authentification');
                return;
              }
              
              console.log('🔍 Test direct API CONTACTS Strapi v5...');
              
              const allContactsResponse = await apiClient.get('/contacts?pagination[limit]=20', token);
              if (allContactsResponse.ok) {
                const allData = await allContactsResponse.json();
                console.log('📋 TOUS LES CONTACTS (Strapi v5):', JSON.stringify(allData, null, 2));
                
                const contacts = allData.data || allData || [];
                const contactsInfo = contacts.map((contact: any) => ({
                  id: contact.id,
                  documentId: contact.documentId,
                  nom: contact.nom,
                  telephone: contact.telephone
                }));
                
                console.log('📞 CONTACTS RÉSUMÉS:', contactsInfo);
                
                Alert.alert('✅ Diagnostic terminé', `${contacts.length} contacts analysés. Structure complète dans les logs.`);
              } else {
                console.log('❌ Erreur récupération contacts:', allContactsResponse.status);
                Alert.alert('❌ Erreur', 'Impossible de récupérer les contacts: ' + allContactsResponse.status);
              }
              
            } catch (error) {
              console.error('❌ Erreur diagnostic:', error);
              Alert.alert('❌ Erreur', 'Erreur diagnostic: ' + error.message);
            }
          }}
          color={modernColors.primary}
        />
        
        <ModernActionButton
          icon="🔍"
          title="Test Permissions Strapi"
          description="Tester les permissions CRUD sur Strapi (lecture/écriture/suppression)"
          onPress={handleDiagnosticStrapi}
          color={modernColors.danger}
        />

        {/* Sous-section Nettoyage */}
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 10, color: '#666' }}>
          🧹 Nettoyage & Reset
        </Text>
        
        <ModernActionButton
          icon="🧹"
          title="Vider Cache Local"
          description="Nettoie AsyncStorage (contacts, invitations, préférences)"
          onPress={async () => {
            try {
              const AsyncStorage = await import('@react-native-async-storage/async-storage');
              await AsyncStorage.default.clear();
              Alert.alert('✅ Cache vidé', 'Le cache local a été vidé. Redémarrez l\'app pour recharger.');
            } catch (error) {
              Alert.alert('❌ Erreur', 'Impossible de vider le cache');
            }
          }}
          color={modernColors.warning}
        />
        
        <ModernActionButton
          icon="📱"
          title="Reset Complet Contacts"
          description="Efface tous les contacts locaux et force un nouveau scan téléphone"
          onPress={async () => {
            Alert.alert(
              '⚠️ Confirmer le Reset',
              'Êtes-vous sûr de vouloir effacer tous les contacts locaux et refaire un scan complet du téléphone ?',
              [
                { text: 'Annuler', style: 'cancel' },
                { 
                  text: 'Reset', 
                  style: 'destructive', 
                  onPress: async () => {
                    try {
                      console.log('🔄 Début reset complet contacts...');
                      
                      const { ContactsManager } = await import('../../services/contacts/ContactsManager');
                      const manager = ContactsManager.getInstance();
                      
                      await manager.clearAllData();
                      console.log('✅ Données contacts effacées');
                      
                      const AsyncStorage = await import('@react-native-async-storage/async-storage');
                      const keys = await AsyncStorage.default.getAllKeys();
                      const contactKeys = keys.filter(key => 
                        key.includes('contact') || 
                        key.includes('phone') || 
                        key.includes('repertoire') ||
                        key.includes('invitation')
                      );
                      
                      if (contactKeys.length > 0) {
                        await AsyncStorage.default.multiRemove(contactKeys);
                        console.log('✅ Clés contacts supprimées:', contactKeys);
                      }
                      
                      Alert.alert('✅ Reset terminé', 'Tous les contacts locaux ont été effacés. Redémarrez l\'app pour refaire le scan téléphone.');
                    } catch (error) {
                      console.error('❌ Erreur reset contacts:', error);
                      Alert.alert('❌ Erreur', 'Impossible de reset les contacts: ' + error.message);
                    }
                  }
                }
              ]
            );
          }}
          color={modernColors.danger}
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