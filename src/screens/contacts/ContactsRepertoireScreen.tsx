// src/screens/contacts/ContactsRepertoireScreen.tsx - Screen principal
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  ScrollView,
  RefreshControl,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useContactsBob } from '../../hooks/useContactsBob';
import { Colors } from '../../styles';
import { WebStyles } from '../../styles/web';

// Import des composants découpés
import { PermissionModal } from '../../components/contacts/PermissionModal';
import { EmptyStateView } from '../../components/contacts/EmptyStateView';
import { ContactsDashboard } from '../../components/contacts/ContactsDashboard';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { InvitationInterface } from '../../components/contacts/InvitationInterface';
import { ManageContactsScreen } from '../../components/contacts/ManageContactsScreen';
import { NetworkIntroductionScreen } from '../../components/contacts/NetworkIntroductionScreen';

import { styles } from './ContactsRepertoireScreen.styles';

export const ContactsRepertoireScreen = () => {
  const {
    isLoading,
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    scannerRepertoire,
    importerContactsEtSync,
    getStats,
    lastScanDate,
    clearCache,
    forcerMiseAJourNoms,
    simulerAcceptationInvitation,
  } = useContactsBob();

  // États UI
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSelectionInterface, setShowSelectionInterface] = useState(false);
  const [showInvitationInterface, setShowInvitationInterface] = useState(false);
  const [showManageContactsScreen, setShowManageContactsScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Animation
  const [slideAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const [stats, setStats] = useState<{
    totalContactsTelephone: number;
    contactsAvecEmail: number;
    contactsComplets: number;
    mesContacts: number;
    contactsAvecBob: number;
    contactsSansBob: number;
    contactsInvites: number;
    nouveauxDepuisScan: number;
    contactsDisponibles?: number;
    tauxCuration?: number;
    invitationsEnCours?: number;
    invitationsAcceptees?: number;
    contactsEnLigne?: number;
  } | null>(null);


  // L'état first-time dépend uniquement du répertoire
  // Si pas de contacts dans le réseau = première fois / recommencer à zéro
  useEffect(() => {
    setIsFirstTime(repertoire.length === 0);
  }, [repertoire.length]);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getStats();
      setStats(result);
    };
    fetchStats();
  }, [contactsBruts, repertoire, contacts, invitations]); // Supprimé getStats des dépendances

  // Animation pulse pour boutons importants
  useEffect(() => {
    if (repertoire.length === 0 && contactsBruts.length > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [repertoire, contactsBruts]);

  // Pull to refresh
  const onRefresh = React.useCallback(async () => {
    if (refreshing || isLoading) {
      console.log('⏳ Refresh/scan déjà en cours, ignorer...');
      return;
    }
    
    setRefreshing(true);
    try {
      await scannerRepertoire();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, isLoading]);

  // Démarrer directement le processus de sélection
  const handleGetStarted = async () => {
    if (isLoading) {
      console.log('⏳ Scan déjà en cours, ignorer...');
      return;
    }
    
    try {
      // Scanner directement le répertoire
      console.log('🚀 Démarrage direct du scan contacts...');
      const contactsScannés = await scannerRepertoire();
      
      // Ouvrir directement la sélection si des contacts trouvés
      if (contactsScannés && contactsScannés.length > 0) {
        console.log(`📱 Ouverture directe de la sélection avec ${contactsScannés.length} contacts`);
        setShowSelectionInterface(true);
      } else {
        Alert.alert(
          'Aucun contact trouvé',
          'Vérifiez que vous avez des contacts dans votre téléphone.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.warn('Erreur démarrage process:', error);
      
      // En cas d'erreur, afficher la modal de permission
      if (error.message?.includes('Permission')) {
        setShowPermissionModal(true);
      } else {
        Alert.alert('Erreur', error.message || 'Impossible de scanner les contacts');
      }
    }
  };

  // Demander permission avec style
  const demanderPermissionRepertoire = () => {
    setShowPermissionModal(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Scanner le répertoire
  const handleScanRepertoire = async () => {
    setShowPermissionModal(false);
    try {
      await scannerRepertoire();
      
      if (contactsBruts.length > 0) {
        Alert.alert(
          '📱 Scan terminé !',
          `${contactsBruts.length} contacts trouvés dans votre téléphone.\n\nChoisissez maintenant ceux que vous voulez dans votre réseau Bob.`,
          [
            { text: 'Plus tard', style: 'cancel' },
            { text: 'Choisir maintenant', onPress: () => setShowSelectionInterface(true) }
          ]
        );
      } else {
        Alert.alert(
          'Aucun contact trouvé',
          'Vérifiez que vous avez des contacts dans votre téléphone.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Importer les contacts sélectionnés
  const handleImportSelected = async (contactIds: string[]) => {
    if (isLoading) {
      console.log('⏳ Import déjà en cours, ignorer...');
      return;
    }
    
    try {
      await importerContactsEtSync(contactIds);
      setShowSelectionInterface(false);
      
      // Les stats seront refreshed automatiquement par le useEffect
      
      Alert.alert(
        '✅ Contacts ajoutés !',
        `${contactIds.length} contact(s) ajouté(s) à votre réseau Bob.`,
        [{ text: 'Super !', style: 'default' }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Statistiques enrichies
  const enrichedStats = stats
    ? {
        ...stats,
        pourcentageBob: stats.mesContacts > 0 
          ? Math.round((stats.contactsAvecBob / stats.mesContacts) * 100)
          : 0,
        nouveauxDepuisScan: contactsBruts.length - repertoire.length,
        contactsDisponibles: stats.contactsDisponibles ?? 0,
        tauxCuration: stats.tauxCuration ?? 0,
        invitationsEnCours: stats.invitationsEnCours ?? 0,
        invitationsAcceptees: stats.invitationsAcceptees ?? 0,
        contactsEnLigne: stats.contactsEnLigne ?? 0,
        // Calculer le nombre d'invitations en cours depuis les invitations réelles
        contactsInvites: (() => {
          const invitationsEnCours = invitations.filter(i => i.statut === 'envoye');
          console.log('📊 DEBUG Invitations en cours:', invitationsEnCours.length);
          console.log('📊 DEBUG Détail invitations:', invitationsEnCours.map(i => ({ telephone: i.telephone, statut: i.statut })));
          return invitationsEnCours.length;
        })(),
        // Recalculer contactsSansBob en excluant ceux avec invitation en cours
        contactsSansBob: (() => {
          const phonesBob = new Set(contacts.map(c => c.telephone?.replace(/[\s\-\(\)\.]/g, '')));
          const phonesInvitations = new Set(invitations.map(i => i.telephone?.replace(/[\s\-\(\)\.]/g, '')));
          return repertoire.filter(c => {
            const phone = c.telephone?.replace(/[\s\-\(\)\.]/g, '');
            return !phonesBob.has(phone) && !phonesInvitations.has(phone);
          }).length;
        })(),
      }
    : {
        totalContactsTelephone: 0,
        mesContacts: 0,
        contactsAvecBob: 0,
        contactsSansBob: 0,
        pourcentageBob: 0,
        contactsDisponibles: 0,
        tauxCuration: 0,
        contactsInvites: 0,
        invitationsEnCours: 0,
        invitationsAcceptees: 0,
        contactsEnLigne: 0,
        nouveauxDepuisScan: 0,
        contactsAvecEmail: 0,
        contactsComplets: 0,
      };

  return (
    <View style={[styles.container, WebStyles.container]}>
      {/* Header avec badge notification */}
      <View style={styles.dashboardHeader}>
         <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Dashboard Réseau Bob</Text>
          {/* {repertoire.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {enrichedStats.mesContacts} contacts • {enrichedStats.pourcentageBob}% ont Bob
            </Text>
          )} */}
        </View>
        {/* {repertoire.length > 0 && enrichedStats.contactsSansBob > 0 && (
          <TouchableOpacity 
            onPress={() => setShowInvitationInterface(true)}
            style={styles.inviteButton}
          >
            <Text style={styles.inviteButtonText}>Inviter</Text>
            {enrichedStats.contactsSansBob > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{enrichedStats.contactsSansBob}</Text>
              </View>
            )}
          </TouchableOpacity>
        )} */}
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        
        {repertoire.length === 0 ? (
          /* Page d'introduction - dès qu'on n'a pas de réseau */
          <NetworkIntroductionScreen
            onGetStarted={handleGetStarted}
            pulseAnim={pulseAnim}
          />
        ) : (
          /* État avec contacts - Dashboard */
          <ContactsDashboard
            stats={enrichedStats}
            invitations={invitations}
            showTips={showTips}
            onCloseTips={() => setShowTips(false)}
            onInvite={async () => {
              // 🔧 Forcer mise à jour avant d'ouvrir l'interface
              console.log('🔄 Mise à jour des noms avant invitation...');
              await forcerMiseAJourNoms();
              setShowInvitationInterface(true);
            }}
            onAddContacts={() => setShowSelectionInterface(true)}
            onManageContacts={() => setShowManageContactsScreen(true)}
            onSimulerAcceptation={async (telephone: string) => {
              const success = await simulerAcceptationInvitation(telephone);
              if (success) {
                Alert.alert(
                  '🎉 Simulation réussie !', 
                  'L\'invitation a été acceptée et le contact a rejoint Bob !',
                  [{ text: 'Super !', style: 'default' }]
                );
              }
            }}
            onRefresh={demanderPermissionRepertoire}
            onClearAll={() => {
              Alert.alert(
                '🗑️ Suppression complète',
                `Cette action va supprimer :\n\n• ${repertoire.length} contacts de votre réseau\n• ${invitations.length} invitations\n• Données locales ET serveur\n\n⚠️ Action irréversible !`,
                [
                  { text: 'Annuler', style: 'cancel' },
                  { 
                    text: 'Tout supprimer', 
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        // Afficher une modal de progression
                        Alert.alert('🔄 Suppression en cours...', 'Suppression des données locales et serveur...');
                        
                        await clearCache();
                        
                        // Force reset after clearing - les useEffects vont s'exécuter automatiquement
                        // grâce aux changements dans lastScanDate, repertoire, invitations
                        
                        Alert.alert('✅ Suppression terminée', 'Tous vos contacts ont été supprimés. Vous pouvez recommencer à zéro.');
                      } catch (error: any) {
                        Alert.alert('❌ Erreur', error.message || 'Erreur lors de la suppression');
                      }
                    }
                  }
                ]
              );
            }}
            isLoading={isLoading}
          />
        )}
      </ScrollView>

      {/* Modal de permission */}
      <PermissionModal
        visible={showPermissionModal}
        slideAnim={slideAnim}
        isLoading={isLoading}
        onClose={() => setShowPermissionModal(false)}
        onAccept={handleScanRepertoire}
      />

      {/* Interface de sélection depuis répertoire téléphone */}
      {showSelectionInterface && (
        <Modal visible={showSelectionInterface} animationType="slide">
          <ContactsSelectionInterface
            contactsBruts={contactsBruts}
            repertoireBob={repertoire}
            invitations={invitations}
            onClose={() => setShowSelectionInterface(false)}
            onImportSelected={handleImportSelected}
            isLoading={isLoading}
          />
        </Modal>
      )}

      {/* Interface d'invitation */}
      {showInvitationInterface && (
        <Modal visible={showInvitationInterface} animationType="slide">
          <InvitationInterface
            contactsSansBob={(() => {
              const filtered = repertoire.filter(c => !c.aSurBob);
              console.log('🔍 DEBUG Contacts envoyés à InvitationInterface:', 
                filtered.map(c => ({ id: c.id, nom: c.nom, telephone: c.telephone }))
              );
              return filtered;
            })()}
            onClose={() => setShowInvitationInterface(false)}
          />
        </Modal>
      )}

      {/* Page de gestion des contacts Bob */}
      {showManageContactsScreen && (
        <Modal visible={showManageContactsScreen} animationType="slide">
          <ManageContactsScreen 
            onClose={() => setShowManageContactsScreen(false)}
            repertoire={repertoire}
            stats={enrichedStats}
          />
        </Modal>
      )}
    </View>
  );
};