// src/screens/contacts/RepertoireScreen.tsx - Version avec curation complète
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Header, Button } from '../../components/common';
import { ContactCurationInterface } from '../../components/contacts/ContactCurationInterface';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { Colors, Typography, Spacing, GlobalStyles } from '../../styles';
import { useContactsBob } from '../../hooks/useContactsBob';

export const RepertoireScreen = () => {
  const {
    isLoading,
    contactsBruts,           // Tous les contacts du téléphone
    repertoire,              // Mes contacts Bob sélectionnés
    contacts,                // Utilisateurs Bob trouvés
    scannerRepertoireBrut,   // Scanner sans import auto
    importerContactsEtSync, // Importer contacts choisis avec sync Strapi
    repartirAZero,           // Vider le répertoire
    inviterContact,
    getStats,
    lastScanDate,
    needsRefreshScan,
    clearCache,
  } = useContactsBob();

  const [showCurationInterface, setShowCurationInterface] = useState(false);
  const [showInvitationInterface, setShowInvitationInterface] = useState(false);
  const [skipContactSelection, setSkipContactSelection] = useState(false);

  const stats = getStats();

  // Scanner les contacts du téléphone
  const handleScanContacts = async () => {
    try {
      const contactsScanned = await scannerRepertoireBrut();
      Alert.alert(
        'Scan terminé ! 📱',
        `${contactsScanned.length} contacts trouvés dans votre téléphone.\n\nVoulez-vous choisir lesquels ajouter à Bob ?`,
        [
          { text: 'Plus tard', style: 'cancel' },
          { text: 'Choisir maintenant', onPress: () => setShowCurationInterface(true) }
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Ouvrir l'interface de curation
  const handleOuvrirCuration = () => {
    if (contactsBruts.length === 0) {
      Alert.alert(
        'Pas de contacts',
        'Vous devez d\'abord scanner votre répertoire téléphonique.',
        [
          { text: 'OK' },
          { text: 'Scanner maintenant', onPress: handleScanContacts }
        ]
      );
      return;
    }
    setShowCurationInterface(true);
  };

  // Importer les contacts sélectionnés
  const handleImportContacts = async (contactIds: string[]) => {
    try {
      await importerContactsEtSync(contactIds);
      console.log(`✅ ${contactIds.length} contacts importés avec succès`);
    } catch (error: any) {
      console.error('❌ Erreur import:', error);
      throw error;
    }
  };

  // Repartir à zéro
  const handleRepartirAZero = () => {
    Alert.alert(
      'Repartir à zéro',
      `Voulez-vous supprimer tous vos ${stats.mesContacts} contacts Bob actuels ?\n\nVous pourrez ensuite en re-sélectionner d'autres depuis votre répertoire téléphonique.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Repartir à zéro',
          style: 'destructive',
          onPress: async () => {
            try {
              await repartirAZero();
              Alert.alert('Succès', 'Votre liste de contacts Bob a été vidée. Vous pouvez maintenant en sélectionner de nouveaux.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  // Vider le cache complet
  const handleViderCache = () => {
    Alert.alert(
      'Vider tout le cache',
      'Cela va supprimer TOUS vos contacts (du téléphone + Bob) et vous devrez tout rescanner. Êtes-vous sûr ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider le cache',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache();
              Alert.alert('Cache vidé', 'Tout a été supprimé. Vous pouvez faire un nouveau scan.');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={GlobalStyles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mes Contacts Bob</Text>
        <TouchableOpacity onPress={() => setShowInvitationInterface(true)}>
          <Text style={styles.headerButton}>Inviter</Text>
        </TouchableOpacity>
      </View>

      {/* Interface de curation */}
      <ContactCurationInterface
        visible={showCurationInterface}
        contactsBruts={contactsBruts}
        contactsDejaSelectionnes={repertoire.map(c => c.id)}
        onClose={() => setShowCurationInterface(false)}
        onImportSelected={handleImportContacts}
        isLoading={isLoading}
      />

      {/* Interface d'invitation */}
      {showInvitationInterface && (
        <ContactsSelectionInterface
          contactsBruts={contactsBruts}
          contactsDejaSelectionnes={repertoire.map(c => c.id)}
          onImportSelected={handleImportContacts}
          isLoading={isLoading}
          onClose={() => setShowInvitationInterface(false)}
        />
      )}

      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleScanContacts}
          />
        }
      >
        {/* Section principale */}
        {isLoading ? (
          // État de chargement
          <View style={styles.loadingState}>
            <Text style={styles.loadingIcon}>⏳</Text>
            <Text style={styles.loadingTitle}>Chargement...</Text>
            <Text style={styles.loadingDescription}>
              Récupération de vos contacts Bob
            </Text>
          </View>
        ) : (
          // TOUJOURS afficher le dashboard - même avec 0 contacts
          <View style={styles.dashboard}>
            {repertoire.length === 0 ? (
              // État initial - Invitation à ajouter des contacts
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeIcon}>👋</Text>
                <Text style={styles.welcomeTitle}>Bienvenue dans vos contacts Bob !</Text>
                <Text style={styles.welcomeDescription}>
                  Votre réseau est vide pour l'instant. Vous pouvez commencer à utiliser Bob même sans contacts, ou ajouter des contacts depuis votre répertoire téléphone quand vous le souhaitez.
                </Text>
                
                <View style={styles.welcomeActions}>
                  <Button
                    title="📱 Ajouter des contacts"
                    onPress={handleOuvrirCuration}
                    style={styles.primaryButton}
                  />
                  <Text style={styles.welcomeNote}>
                    Vous pourrez toujours ajouter des contacts plus tard !
                  </Text>
                </View>
              </View>
            ) : (
              // Dashboard normal avec statistiques
              <>
                {/* Stats principales */}
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>📊 Vue d'ensemble</Text>
                  
                  <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{stats.mesContacts}</Text>
                      <Text style={styles.statLabel}>Mes contacts</Text>
                      <Text style={styles.statSubLabel}>dans Bob</Text>
                    </View>
                    
                    <View style={styles.statCard}>
                      <Text style={styles.statNumber}>{stats.contactsAvecBob}</Text>
                      <Text style={styles.statLabel}>Ont Bob</Text>
                      <Text style={styles.statSubLabel}>{stats.pourcentageBob}</Text>
                    </View>
                  </View>
                  
                  {/* Taux de curation */}
                  {stats.totalContactsTelephone > 0 && (
                    <View style={styles.curationInfo}>
                      <Text style={styles.curationText}>
                        📈 Vous avez sélectionné {stats.tauxCuration}% de vos contacts téléphone
                      </Text>
                      <Text style={styles.curationSubText}>
                        {stats.contactsDisponibles} contacts encore disponibles
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions principales */}
                <View style={styles.actionsSection}>
                  <Text style={styles.sectionTitle}>🎯 Actions rapides</Text>
                  
                  <View style={styles.actionsList}>
                    {stats.contactsSansBob > 0 && (
                      <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={() => setShowInvitationInterface(true)}
                      >
                        <Text style={styles.actionIcon}>🚀</Text>
                        <View style={styles.actionInfo}>
                          <Text style={styles.actionTitle}>Inviter des contacts</Text>
                          <Text style={styles.actionDescription}>
                            {stats.contactsSansBob} contact{stats.contactsSansBob > 1 ? 's' : ''} à inviter
                          </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                      </TouchableOpacity>
                    )}

                    {stats.contactsDisponibles > 0 && (
                      <TouchableOpacity 
                        style={styles.actionCard}
                        onPress={handleOuvrirCuration}
                      >
                        <Text style={styles.actionIcon}>📱</Text>
                        <View style={styles.actionInfo}>
                          <Text style={styles.actionTitle}>Ajouter des contacts</Text>
                          <Text style={styles.actionDescription}>
                            {stats.contactsDisponibles} contact{stats.contactsDisponibles > 1 ? 's' : ''} disponible{stats.contactsDisponibles > 1 ? 's' : ''}
                          </Text>
                        </View>
                        <Text style={styles.actionArrow}>›</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                      style={styles.actionCard}
                      onPress={handleScanContacts}
                    >
                      <Text style={styles.actionIcon}>🔄</Text>
                      <View style={styles.actionInfo}>
                        <Text style={styles.actionTitle}>Scanner nouveaux contacts</Text>
                        <Text style={styles.actionDescription}>
                          {needsRefreshScan && needsRefreshScan() ? 
                            'Recommandé (scan >24h)' : 
                            'Chercher de nouveaux contacts'
                          }
                        </Text>
                      </View>
                      <Text style={styles.actionArrow}>›</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {/* Actions avancées pour débogage en mode dev */}
            {__DEV__ && (
              <View style={styles.advancedSection}>
                <Text style={styles.sectionTitle}>⚙️ Gestion avancée (Développement)</Text>
                
                <View style={styles.advancedActions}>
                  {repertoire.length > 0 && (
                    <Button
                      title="🗑️ Repartir à zéro"
                      onPress={handleRepartirAZero}
                      variant="secondary"
                      style={styles.dangerButton}
                    />
                  )}
                  
                  <Button
                    title="💾 Vider tout le cache"
                    onPress={handleViderCache}
                    variant="secondary"
                    style={styles.debugButton}
                  />
                </View>
                
                <Text style={styles.advancedHint}>
                  Actions de débogage - Repartir à zéro supprime vos contacts Bob mais garde vos contacts téléphone scannés
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingTop: 60,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...GlobalStyles.shadow,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  headerButton: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
    padding: Spacing.xs,
  },

  // État de chargement
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  loadingTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  loadingDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  // État vide
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyStateDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },

  // Actions
  actionsContainer: {
    width: '100%',
    gap: Spacing.md,
  },
  primaryButton: {
    paddingHorizontal: Spacing.xl,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  secondaryButton: {
    flex: 1,
  },
  skipButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
    borderWidth: 1,
  },
  debugButton: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
    borderWidth: 1,
  },
  dangerButton: {
    borderColor: Colors.error,
    borderWidth: 1,
  },
  scanHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Résultat scan
  scanResultContainer: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  scanResultText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  scanDateText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  // Dashboard
  dashboard: {
    padding: Spacing.md,
    gap: Spacing.lg,
  },

  // Sections
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },

  // Stats
  statsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Info curation
  curationInfo: {
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  curationText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  curationSubText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },

  // Actions section
  actionsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  actionsList: {
    gap: Spacing.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  actionArrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },

  // Détails section
  detailsSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  detailsList: {
    gap: Spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  detailLabel: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    flex: 1,
  },
  detailValue: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },

  // Welcome section
  welcomeSection: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    ...GlobalStyles.shadow,
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  welcomeDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  welcomeActions: {
    alignItems: 'center',
    width: '100%',
  },
  welcomeNote: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
  addContactsButton: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },

  // Actions avancées
  advancedSection: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    ...GlobalStyles.shadow,
  },
  advancedActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  advancedHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});