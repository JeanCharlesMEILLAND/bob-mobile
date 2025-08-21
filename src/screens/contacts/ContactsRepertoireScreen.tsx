// src/screens/contacts/ContactsRepertoireScreen.tsx - Screen principal
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  Modal,
  Animated,
} from 'react-native';
import { useContactsBob } from '../../hooks/useContactsBob';
import { Colors, Typography, Spacing } from '../../styles';

// Import des composants découpés
import { PermissionModal } from '../../components/contacts/PermissionModal';
import { EmptyStateView } from '../../components/contacts/EmptyStateView';
import { ContactsDashboard } from '../../components/contacts/ContactsDashboard';
import { ContactSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { InvitationInterface } from '../../components/contacts/InvitationInterface';
import { ManageContactsScreen } from '../../components/contacts/ManageContactsScreen';

import { styles } from './ContactsRepertoireScreen.styles';
import { getRelativeTime } from '../../utils/dateHelpers';

export const ContactsRepertoireScreen = () => {
  const {
    isLoading,
    contactsBruts,
    repertoire,
    contacts,
    scannerRepertoire,
    importerContactsSelectionnes,
    getStats,
    lastScanDate,
    clearCache,
  } = useContactsBob();

  // États UI
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSelectionInterface, setShowSelectionInterface] = useState(false);
  const [showInvitationInterface, setShowInvitationInterface] = useState(false);
  const [showManageContactsScreen, setShowManageContactsScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(true);

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

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getStats();
      setStats(result);
    };
    fetchStats();
  }, [contactsBruts, repertoire]);

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
    setRefreshing(true);
    try {
      await scannerRepertoire();
    } finally {
      setRefreshing(false);
    }
  }, []);

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
    try {
      await importerContactsSelectionnes(contactIds);
      setShowSelectionInterface(false);
      
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
    <View style={styles.container}>
      {/* Header avec badge notification */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mon Réseau Bob</Text>
          {repertoire.length > 0 && (
            <Text style={styles.headerSubtitle}>
              {enrichedStats.mesContacts} contacts • {enrichedStats.pourcentageBob}% ont Bob
            </Text>
          )}
        </View>
        {repertoire.length > 0 && enrichedStats.contactsSansBob > 0 && (
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
        )}
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
          /* État initial - Pas de contacts */
          <EmptyStateView
            contactsBruts={contactsBruts}
            isLoading={isLoading}
            lastScanDate={lastScanDate}
            pulseAnim={pulseAnim}
            onRequestPermission={demanderPermissionRepertoire}
            onSelectContacts={() => setShowSelectionInterface(true)}
            onClearCache={clearCache}
          />
        ) : (
          /* État avec contacts - Dashboard */
          <ContactsDashboard
            stats={enrichedStats}
            showTips={showTips}
            onCloseTips={() => setShowTips(false)}
            onInvite={() => setShowInvitationInterface(true)}
            onAddContacts={() => setShowSelectionInterface(true)}
            onManageContacts={() => setShowManageContactsScreen(true)}
            onRefresh={demanderPermissionRepertoire}
            onClearAll={clearCache}
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
          <ContactSelectionInterface
            contactsBruts={contactsBruts}
            contactsDejaSelectionnes={repertoire.map(c => c.id)}
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
            contactsSansBob={repertoire.filter(c => !c.aSurBob)}
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