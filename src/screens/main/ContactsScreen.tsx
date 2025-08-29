// Version ultra-minimale identique à la structure de l'original
import React, { memo, useMemo, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useContacts } from '../../hooks/contacts/useContacts';
import { useContactsScreenState } from '../contacts/components/ContactsScreenState';
// ContactsDashboard supprimé - éléments intégrés directement
import { InvitationInterface } from '../../components/contacts/InvitationInterface';
import { ManageContactsScreen } from '../../components/contacts/ManageContactsScreen';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { SyncIndicator } from '../../components/common/SyncIndicator';
import { NetworkIntroductionScreen } from '../../components/contacts/NetworkIntroductionScreen';
import { InvitationsScreen } from '../../components/contacts/InvitationsScreen';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { useNotifications } from '../../components/common/SmartNotifications';
import { SmartNotifications } from '../../components/common/SmartNotifications';
import { authService } from '../../services/auth.service';
import { contactsService } from '../../services/contacts.service';
import { apiClient } from '../../services/api';
import { Colors } from '../../styles';
import { ModernHomeHeader, modernColors } from '../../components/common/ModernUI';
import { useAuth } from '../../hooks';
import { ContactsManager } from '../../services/contacts/ContactsManager';

export const ContactsScreen = memo(() => {
  // Reduced logging for better performance
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 ContactsMainScreenMinimal render');
  }
  
  const navigation = useSimpleNavigation();
  const notifications = useNotifications();
  const { user } = useAuth();
  
  // Hook principal temps réel
  const {
    loading,
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    getStats,
    clearCache,
    simulerAcceptationInvitation,
    syncState,
    scannerRepertoireBrut,
    importerContactsSelectionnes,
    importerContactsEtSync,
    syncContactsToStrapi,
    sendInvitation,
    removeContact,
    forcerMiseAJourNoms,
    lastScanDate,
    forcePullFromStrapi,
    supprimerTousLesContacts, // 🔧 FIX: Ajouter la fonction TURBO manquante
    viderToutStrapiPourUtilisateur, // 🧹 NOUVEAU: Nettoyage complet Strapi  
    debloquerSync, // 🔓 Débloquer sync après reset
    blockSync, // 🛑 Bloquer sync pendant reset
    unblockSync, // 🔓 Débloquer sync après reset  
    isSyncBlocked, // 🚫 État du blocage de synchronisation
    refreshData, // 🔄 Rechargement des données
    detectBobUsers, // 🔍 Détection des utilisateurs Bob
    emergencyStopAll // 🚨 Arrêt d'urgence
  } = useContacts();

  // 🔧 FIX: Log seulement si changement significatif pour réduire spam
  const hookData = useMemo(() => ({
    loading,
    contactsBrutsLength: contactsBruts?.length || 0,
    repertoireLength: repertoire?.length || 0,
    contactsLength: contacts?.length || 0,
    invitationsLength: invitations?.length || 0
  }), [loading, contactsBruts?.length, repertoire?.length, contacts?.length, invitations?.length]);
  
  const previousHookData = React.useRef(hookData);
  if (process.env.NODE_ENV === 'development' && 
      JSON.stringify(hookData) !== JSON.stringify(previousHookData.current)) {
    console.log('📊 Hook data CHANGÉ:', hookData);
    previousHookData.current = hookData;
  }

  // État local modulaire
  const {
    refreshing,
    setRefreshing,
    showTips,
    setShowTips,
    isFirstTime,
    stats: defaultStats,
    setStats,
    // États des interfaces
    showSelectionInterface,
    setShowSelectionInterface,
    showInvitationInterface,
    setShowInvitationInterface,
    showManageContactsScreen,
    setShowManageContactsScreen
  } = useContactsScreenState();
  
  // Utiliser les vraies stats calculées au lieu des stats statiques
  const [realStats, setRealStats] = useState(defaultStats);
  const [strapiInvitationsCount, setStrapiInvitationsCount] = useState(0);
  
  // Protection contre les réparations répétées
  const [lastRepairAttempt, setLastRepairAttempt] = useState<number>(0);
  
  // Flag pour empêcher la redirection après suppression
  const [hasEverHadContacts, setHasEverHadContacts] = useState(false);
  
  // Flag pour bloquer les mises à jour automatiques pendant la suppression
  const [isDuringDeletion, setIsDuringDeletion] = useState(false);
  const [syncBlocked, setSyncBlocked] = useState(false); // 🚫 Bloque TOUTES les syncs post-suppression
  const [isImporting, setIsImporting] = useState(false);
  
  // 📊 États pour la progression d'import détaillée
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
    phase: 'idle' as 'idle' | 'importing' | 'syncing' | 'detecting' | 'finalizing',
    startTime: null as number | null,
    estimatedTimeRemaining: null as number | null
  });
  
  // État pour la page dédiée aux invitations
  const [showInvitationsScreen, setShowInvitationsScreen] = useState(false);
  
  // 📊 Fonction pour mettre à jour la progression d'import
  const updateImportProgress = useCallback((current: number, total: number, phase: typeof importProgress.phase) => {
    const now = Date.now();
    let estimatedTimeRemaining = null;
    
    // Calculer le temps restant si on a commencé et qu'on a du progrès
    if (importProgress.startTime && current > 0 && current < total) {
      const elapsed = now - importProgress.startTime;
      const avgTimePerContact = elapsed / current;
      const remaining = total - current;
      estimatedTimeRemaining = Math.round((avgTimePerContact * remaining) / 1000); // en secondes
      
      // 🔧 Logging pour debug de la progression
      if (current % 50 === 0 || current === total) { // Log tous les 50 contacts
        console.log(`📊 Progression: ${current}/${total} (${Math.round(current/total*100)}%) - Temps restant: ${estimatedTimeRemaining}s`);
      }
    }
    
    setImportProgress({
      current,
      total,
      phase,
      startTime: importProgress.startTime || (phase !== 'idle' ? now : null),
      estimatedTimeRemaining
    });
  }, [importProgress.startTime]);
  
  // 🚀 AUTO-SCAN: Détecter cache vide et re-scanner téléphone automatiquement
  useEffect(() => {
    const manager = ContactsManager.getInstance();
    
    const unsubscribe = manager.repository.subscribe(async (type) => {
      if (type === 'scan_needed') {
        console.log('🚀 AUTO-SCAN déclenché - Cache vide détecté');
        try {
          // Déclencher le scan automatiquement
          await scannerRepertoireBrut?.();
          console.log('✅ AUTO-SCAN terminé avec succès');
        } catch (error) {
          console.error('❌ Erreur AUTO-SCAN:', error);
        }
      }
    });

    return unsubscribe;
  }, [scannerRepertoireBrut]);
  
  // Force la récupération des contacts bruts depuis le cache si nécessaire
  const forceReloadContactsBruts = async () => {
    if ((!contactsBruts || contactsBruts.length === 0)) {
      console.log('🔄 Force reload des contacts bruts depuis le cache');
      // DÉSACTIVÉ: Ne pas utiliser clearCache car ça peut tout effacer
      // On va juste attendre que les données se synchronisent naturellement
      console.log('⏳ Attente synchronisation naturelle des contacts bruts...');
    }
  };
  
  // Calculer les vraies stats avec la nouvelle architecture SANS refreshData
  // Fonction pour récupérer le nombre d'invitations Strapi
  const fetchStrapiInvitationsCount = useCallback(async () => {
    try {
      const token = await authService.getValidToken();
      if (token) {
        const response = await apiClient.get('/invitations', token);
        if (response.ok) {
          const data = await response.json();
          const invitations = data.data || [];
          setStrapiInvitationsCount(invitations.length);
          console.log('📩 Invitations Strapi récupérées:', invitations.length);
          return invitations.length;
        }
      }
    } catch (error) {
      console.warn('⚠️ Erreur récupération invitations Strapi:', error);
    }
    return 0;
  }, []);

  // Fonction globale pour rafraîchir TOUTES les stats (contacts + invitations)
  const refreshAllStats = useCallback(async () => {
    console.log('🔄 Refresh complet des statistiques...');
    
    // 🚫 TEMPORAIREMENT DÉSACTIVÉ: fetchStrapiInvitationsCount cause boucle API
    const statsResult = await updateRealStats();
    // const invitationsCount = await fetchStrapiInvitationsCount();
    
    console.log('✅ Refresh complet terminé (sans fetch invitations)');
    return { statsResult, invitationsCount: strapiInvitationsCount };
  }, [strapiInvitationsCount]);

  const updateRealStats = useCallback(async () => {
    // 🛑 BLOQUER les mises à jour pendant une suppression
    if (isDuringDeletion) {
      console.log('🚫 updateRealStats bloqué pendant suppression');
      return;
    }
    
    console.log('🔄 updateRealStats appelé avec (nouvelle architecture):', {
      repertoireLength: repertoire?.length || 0,
      contactsBrutsLength: contactsBruts?.length || 0,
      contactsLength: contacts?.length || 0,
      // DEBUG: Vérifier les vraies valeurs du hook
      debugPhoneContacts: contactsBruts?.length || 0,
      debugRepertoire: repertoire?.length || 0,
      debugTotal: (contactsBruts?.length || 0) + (repertoire?.length || 0)
    });
    
    try {
      // IMPORTANT: Utiliser getStats directement sans refreshData qui vide le cache
      const calculatedStats = await getStats();
      
      // Récupérer les invitations Strapi en parallèle
      const strapiInvitationsPromise = fetchStrapiInvitationsCount();
      
      // 🔧 FIX: Vérifier si getStats retourne null et utiliser des valeurs par défaut CORRIGÉES
      const safeStats = calculatedStats || {
        mesContacts: (repertoire?.length || 0) + (contactsBruts?.length || 0), // CORRECTION: inclure phone + repertoire
        contactsAvecBob: contacts?.length || 0,
        contactsSansBob: Math.max(0, (repertoire?.length || 0) - (contacts?.length || 0)),
        contactsDisponibles: Math.max(0, (contactsBruts?.length || 0) - (repertoire?.length || 0)),
        totalContactsTelephone: (contactsBruts?.length || 0) + (repertoire?.length || 0) // CORRECTION: total réel
      };
      
      console.log('🎯 STATS CALCULÉES (avec protection null):', {
        mesContacts: safeStats.mesContacts,
        contactsAvecBob: safeStats.contactsAvecBob,
        contactsSansBob: safeStats.contactsSansBob,
        contactsDisponibles: safeStats.contactsDisponibles,
        totalContactsTelephone: safeStats.totalContactsTelephone,
        wasNull: !calculatedStats
      });
      
      // 🔧 RÉPARATION AUTOMATIQUE : Si 0 contacts phone mais répertoire existe, réparer le cache
      const now = Date.now();
      const hasRepertoire = safeStats.mesContacts > 0;
      const hasPhoneContacts = (calculatedStats?.statsParSource?.phone || 0) > 0;
      const shouldRepair = hasRepertoire && !hasPhoneContacts && (now - lastRepairAttempt) > 10000; // 10 secondes minimum entre les tentatives
      
      if (shouldRepair) {
        console.log('🔧 RÉPARATION automatique détectée (0 contacts phone avec', safeStats.mesContacts, 'dans le répertoire)');
        setLastRepairAttempt(now);
        
        setTimeout(async () => {
          try {
            const { ContactsManager } = await import('../../services/contacts/ContactsManager');
            const manager = ContactsManager.getInstance();
            const repairResult = await manager.ensureMissingPhoneContacts();
            console.log('✅ Réparation contacts phone terminée:', repairResult);
            
            if (repairResult.added > 0) {
              console.log(`📱 ${repairResult.added} contacts phone restaurés - recalcul des stats...`);
              
              // Recalculer TOUTES les stats après réparation
              setTimeout(async () => {
                await refreshAllStats();
              }, 1000);
            } else {
              console.log('ℹ️ Aucun contact phone manquant détecté, réparation non nécessaire');
            }
          } catch (error) {
            console.warn('⚠️ Erreur réparation automatique contacts phone:', error);
          }
        }, 1000); // Délai plus long pour éviter les boucles
      }

      // 🔍 DÉTECTION AUTOMATIQUE BOB : Si 0 contacts avec Bob mais contacts dans le répertoire
      if (safeStats.contactsAvecBob === 0 && safeStats.mesContacts > 0) {
        console.log('🔍 Détection automatique Bob déclenchée (0 Bob détectés sur', safeStats.mesContacts, 'contacts)');
        setTimeout(async () => {
          try {
            const { ContactsManager } = await import('../../services/contacts/ContactsManager');
            const manager = ContactsManager.getInstance();
            await manager.forceDetectBobUsers();
            console.log('✅ Détection Bob automatique terminée - recalcul des stats...');
            
            // Recalculer TOUTES les stats après détection (avec délai pour que la base soit mise à jour)
            setTimeout(async () => {
              await refreshAllStats();
            }, 1000);
          } catch (error) {
            console.warn('⚠️ Erreur détection automatique Bob:', error);
          }
        }, 500); // Délai pour éviter les boucles
      }
      
      // 🛑 PROTECTION : Ne pas écraser les stats pendant une suppression
      if (!isDuringDeletion) {
        setRealStats(safeStats); // 🔧 FIX: Utiliser safeStats au lieu de calculatedStats
        console.log('✅ Stats mises à jour avec nouvelle architecture (protection null activée)');
      } else {
        console.log('🚫 Mise à jour stats bloquée pendant suppression');
      }
      
      // Marquer qu'on a eu des contacts si c'est le cas
      if (safeStats.mesContacts > 0 || (repertoire && repertoire.length > 0)) {
        setHasEverHadContacts(true);
      }
      
      console.log('✅ realStats mis à jour SANS clearCache - Dashboard préservé');
      
      // Synchronisation optionnelle (BLOQUÉE pendant et après suppression)
      if (repertoire && repertoire.length > 100 && !isDuringDeletion && !syncBlocked) {
        console.log('🔄 Sync Strapi déclenché pour', repertoire.length, 'contacts...');
        try {
          if (typeof syncContactsToStrapi === 'function') {
            await syncContactsToStrapi();
            console.log('✅ Sync Strapi terminée');
          }
        } catch (syncError) {
          console.error('❌ Erreur sync Strapi:', syncError);
        }
      } else if (isDuringDeletion || syncBlocked) {
        console.log('🚫 Sync Strapi bloquée:', isDuringDeletion ? 'pendant suppression' : 'post-suppression');
      }
      
    } catch (error) {
      console.warn('⚠️ Erreur calcul stats nouvelle architecture:', error);
    }
  }, [isDuringDeletion, repertoire, contactsBruts, contacts, getStats, syncContactsToStrapi, setRealStats, setHasEverHadContacts]);
  
  // DÉSACTIVÉ : Mise à jour automatique qui interfère avec les suppressions
  // React.useEffect(() => {
  //   if (!isDuringDeletion) {
  //     console.log('🎯 Effet stats déclenché par changement données (non bloqué)');
  //     updateRealStats();
  //   } else {
  //     console.log('🚫 Effet stats bloqué pendant suppression');
  //   }
  // }, [repertoire?.length, contacts?.length, invitations?.length, contactsBruts?.length, isDuringDeletion]);
  
  // 🚫 TEMPORAIREMENT DÉSACTIVÉ: Récupérer les invitations Strapi au chargement
  // React.useEffect(() => {
  //   console.log('📩 Chargement initial des invitations Strapi...');
  //   fetchStrapiInvitationsCount();
  // }, []); // Une seule fois au montage

  // Mise à jour manuelle des stats au montage uniquement
  React.useEffect(() => {
    console.log('📊 Chargement initial des stats...');
    updateRealStats();
  }, []); // Une seule fois au montage

  
  // DÉSACTIVÉ TEMPORAIREMENT: Force refresh qui cause des pertes de données
  // React.useEffect(() => {
  //   const forceRefreshStats = async () => {
  //     if (!isLoading) {
  //       console.log('🔄 Force refresh stats après navigation/montage');
  //       console.log('📊 État actuel lors du retour:', {
  //         repertoireLength: repertoire?.length || 0,
  //         contactsBrutsLength: contactsBruts?.length || 0,
  //         timestamp: new Date().toISOString()
  //       });
        
  //       await updateRealStats();
  //     }
  //   };
    
  //   // Délai pour s'assurer que les données sont bien à jour
  //   const timeout = setTimeout(forceRefreshStats, 500);
  //   return () => clearTimeout(timeout);
  // }, []); // Se déclenche à chaque montage du composant

  // Auto-scan des contacts bruts si jamais fait - DÉSACTIVÉ car peut causer des conflits
  // React.useEffect(() => {
  //   const autoScanIfNeeded = async () => {
  //     // Si on a un répertoire mais pas de contacts bruts, il faut scanner
  //     if (!isLoading && repertoire && repertoire.length > 0 && (!contactsBruts || contactsBruts.length === 0)) {
  //       console.log('🤖 Auto-scan détecté : répertoire existe mais pas de contacts bruts');
  //       console.log(`📊 Situation: ${repertoire.length} contacts en répertoire, ${contactsBruts?.length || 0} contacts bruts`);
        
  //       try {
  //         console.log('🚀 Lancement auto-scan du téléphone...');
  //         await scannerRepertoireBrut?.();
  //         console.log('✅ Auto-scan terminé, actualisation des stats...');
  //         await updateRealStats();
  //       } catch (error) {
  //         console.warn('⚠️ Auto-scan échoué:', error);
  //       }
  //     }
  //   };

  //   // Délai pour que les données soient bien chargées
  //   const timeout = setTimeout(autoScanIfNeeded, 2000);
  //   return () => clearTimeout(timeout);
  // }, [isLoading, repertoire?.length, contactsBruts?.length]);

  // Handler de refresh simple avec protection rate limiting ET blocage sync
  const handleRefresh = async () => {
    if (refreshing) return; // Protection contre les doubles appels
    
    // 🛑 NOUVELLE PROTECTION: Bloquer refresh si sync bloquée ou données cohérentes
    if (isSyncBlocked) {
      console.log('🚫 Refresh bloqué - Synchronisation désactivée');
      setRefreshing(false);
      return;
    }
    
    // 🛑 PROTECTION SMART: Si données cohérentes, pas besoin de refresh automatique
    if (repertoire?.length > 0 && !loading) {
      console.log('🚫 Refresh bloqué - Données déjà cohérentes', {
        repertoire: repertoire.length,
        contacts: contacts?.length || 0
      });
      setRefreshing(false);
      return;
    }
    
    console.log('🔄 Refresh autorisé');
    setRefreshing(true);
    
    try {
      // Attendre un peu pour éviter le rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Actualiser seulement les stats locales (pas de sync réseau)
      await updateRealStats();
    } catch (error) {
      console.error('Erreur refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 🗑️ SUPPRIMÉ: Ancien handler remplacé par les nouveaux boutons TURBO
  const handleClearCache = () => {
    console.log('⚠️ handleClearCache appelé - Redirection vers boutons TURBO');
    notifications.info(
      '🔧 Fonctions avancées déplacées',
      'Les outils de maintenance et suppression sont maintenant dans Menu → Profil → Tests et Debug pour plus de sécurité.',
      { duration: 8000 }
    );
  };

  // Fonction pour ouvrir l'écran des invitations existantes
  const handleRelancerInvitations = useCallback(() => {
    if (!loading) {
      console.log('📋 Ouverture écran invitations existantes');
      setShowInvitationsScreen(true);
    }
  }, [loading]);

  // ✅ unblockSync est déjà disponible depuis useContacts() ligne 57 - pas besoin de redéclarer

  // Handler pour importer tous les contacts d'un coup
  const handleImportAllContacts = async () => {
    unblockSync(); // 🔓 Débloquer les syncs pour import volontaire
    if (!loading && contactsBruts && contactsBruts.length > 0) {
      console.log('⚡ Import ALL contacts pressed - Affichage confirmation toast');
      
      // Récupérer tous les IDs des contacts bruts non importés
      const telephonesExistants = new Set(repertoire?.map(c => c.telephone?.replace(/[^\+\d]/g, '')) || []);
      const contactsNonImportes = contactsBruts.filter(c => 
        c.telephone && !telephonesExistants.has(c.telephone.replace(/[^\+\d]/g, ''))
      );
      
      // 🔧 FIX: Générer des IDs pour les contacts qui n'en ont pas
      const allContactIds = contactsNonImportes.map(contact => {
        if (contact.id) {
          return String(contact.id);
        } else {
          // Générer un ID basé sur le téléphone ou nom + téléphone
          const uniqueKey = contact.telephone || `${contact.nom}_${Math.random()}`;
          return `generated_${uniqueKey.replace(/[^\w]/g, '_')}_${Date.now()}`;
        }
      });
      
      console.log(`📥 ${allContactIds.length} nouveaux contacts à importer (${contactsBruts.length - allContactIds.length} déjà importés)`);
      console.log('🔍 DEBUG: Premiers contactIds générés:', allContactIds.slice(0, 3));
      
      if (allContactIds.length === 0) {
        notifications.info(
          '✅ Tous vos contacts sont déjà importés',
          'Félicitations ! Tous les contacts de votre téléphone sont déjà dans votre répertoire Bob. Rien de plus à importer.',
          { category: 'contacts_import', duration: 5000 }
        );
        return;
      }

      // 🚀 Limitation augmentée pour import en masse 
      const maxImportSize = 2000;
      const isLargeImport = allContactIds.length > maxImportSize;
      const actualImportIds = isLargeImport ? allContactIds.slice(0, maxImportSize) : allContactIds;
      
      const confirmTitle = isLargeImport 
        ? '📥 Import limité (très gros volume)'
        : '📥 Importer tous les contacts';
      
      const confirmMessage = isLargeImport
        ? `Vous avez ${allContactIds.length} nouveaux contacts, mais nous allons importer les ${maxImportSize} premiers.\n\n✨ Nous détecterons automatiquement ceux qui ont déjà Bob !\n\nVoulez-vous continuer ?`
        : `Voulez-vous importer tous les ${allContactIds.length} contacts de votre téléphone d'un coup ?\n\n✨ Nous détecterons automatiquement ceux qui ont déjà Bob !\n\n⏱️ Cela peut prendre quelques minutes selon votre connexion.`;

      // 🎯 Afficher notification toast de confirmation avec boutons
      notifications.confirm(
        confirmTitle,
        confirmMessage,
        // Fonction si l'utilisateur confirme
        async () => {
          try {
            console.log('✅ Utilisateur a confirmé l\'import complet');
            
            // 🚀 Initialiser la progression
            setIsImporting(true);
            updateImportProgress(0, actualImportIds.length, 'importing');
            
            // 🎉 Afficher notification IMMÉDIATEMENT avant de commencer
            notifications.success(
              `🚀 Import + détection Bob démarré`, 
              `${actualImportIds.length} contacts en cours d'import et détection automatique des utilisateurs Bob. Progression visible ci-dessous.`,
              { category: 'contacts_bulk_import', duration: 6000 }
            );
            
            // 🔧 FLOW SIMPLIFIÉ: Import + Sync + Détection + Stats
            if (importerContactsEtSync) {
              console.log('✅ Import complet lancé en arrière-plan');
              
              // 🚨 Nettoyer les anciennes notifications
              notifications.dismissCategory('force_sync');
              notifications.dismissCategory('bob_detection');
              notifications.dismissCategory('import_complete');
              
              // 📊 Notification de progression
              notifications.info(
                '⏳ Import en cours...',
                `Traitement de ${actualImportIds.length} contacts. Cela peut prendre quelques minutes.`,
                { category: 'import_progress', duration: 15000 }
              );
              
              // 1️⃣ IMPORT + SYNC (avec délai pour éviter conflits)
              console.log(`🚀 Démarrage import de ${actualImportIds.length} contacts...`);
              console.log('⏸️ Attente 2s pour stabiliser les suppressions en cours...');
              await new Promise(resolve => setTimeout(resolve, 2000)); // Délai de sécurité
              
              const importResult = await importerContactsEtSync(actualImportIds, (current, total) => {
                // 📊 Mettre à jour la progression en temps réel
                updateImportProgress(current, total, 'importing');
              });
              console.log('📊 Résultat import:', {
                imported: importResult?.imported || 0,
                syncCreated: importResult?.syncCreated || 0,
                errors: importResult?.errors?.length || 0
              });
              
              // 🔍 Délai avant détection Bob pour éviter les conflits 
              console.log('⏸️ Attente 3s pour stabiliser la sync avant détection Bob...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // 2️⃣ SYNC FORCÉE si nécessaire (sans notification supplémentaire)
              if (importResult?.imported === 0 && repertoire?.length > 0 && !syncBlocked) {
                console.log('🔄 Sync forcée des contacts existants...');
                try {
                  await syncContactsToStrapi();
                } catch (error) {
                  console.warn('⚠️ Sync forcée échouée:', error);
                }
              }
              
              // 🔄 Phase: Détection Bob
              updateImportProgress(importResult?.imported || 0, actualImportIds.length, 'detecting');
              
              // 3️⃣ DÉTECTION BOB (silencieuse)
              console.log('🔍 Détection utilisateurs Bob...');
              try {
                await detectBobUsers();
                console.log('✅ Détection Bob terminée');
              } catch (error) {
                console.warn('⚠️ Détection Bob échouée:', error);
              }
              
              // 🔄 Phase: Finalisation
              updateImportProgress(importResult?.imported || 0, actualImportIds.length, 'finalizing');
              
              // 4️⃣ STATS FINALES
              await updateRealStats();
              
              // 🎉 UNE SEULE notification finale avec refresh complet
              await refreshAllStats();
              const finalStats = await getStats();
              
              // 🔍 DIAGNOSTIC: Vérifier le décompte final
              console.log('🔍 DIAGNOSTIC FINAL:', {
                contactsPhoneTotal: contactsBruts?.length || 0,
                contactsImportes: finalStats?.mesContacts || 0,
                contactsAvecBob: finalStats?.contactsAvecBob || 0,
                contactsDisponibles: finalStats?.contactsDisponibles || 0,
                expectedTotal: actualImportIds.length,
                actualImported: importResult?.imported || 0,
                difference: (contactsBruts?.length || 0) - (finalStats?.mesContacts || 0)
              });
              
              // 🏁 Reset progression et cleanup
              setIsImporting(false);
              updateImportProgress(0, 0, 'idle');
              
              // 🔧 FORCE refresh complet des données après import
              console.log('🔄 Force refresh final des données après import...');
              await refreshData?.();
              await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre la propagation
              await updateRealStats();
              
              // 📊 Supprimer les notifications de progression
              notifications.dismissCategory('import_progress');
              notifications.dismissCategory('bob_detection'); 
              notifications.dismissCategory('final_stats');
              notifications.dismissCategory('contacts_bulk_import');
              
              notifications.success(
                '✅ Import terminé avec succès',
                `📊 ${finalStats?.mesContacts || 0} contacts dans votre répertoire\n👥 ${finalStats?.contactsAvecBob || 0} utilisateurs Bob détectés\n🔄 Synchronisation avec le serveur terminée`,
                { category: 'import_success', duration: 8000 }
              );
              
            } else {
              throw new Error('❌ Service d\'import non disponible');
            }
          } catch (error) {
            console.error('❌ Erreur lors de l\'import complet:', error);
            notifications.error(
              '❌ Erreur d\'import en masse',
              'L\'import automatique a échoué. Vous pouvez réessayer ou ajouter vos contacts un par un via "Ajouter des contacts".',
              { category: 'contacts_import_error', duration: 10000 }
            );
          }
        },
        // Fonction si l'utilisateur annule (optionnel)
        () => {
          console.log('❌ Utilisateur a annulé l\'import complet');
        },
        { category: 'contacts_bulk_confirm' }
      );
    }
  };

  // 🆕 Handler pour actualiser complet (scan téléphone + sync Strapi + stats)
  const handleActualiserComplet = async () => {
    if (loading || refreshing) return;
    
    console.log('🔄 ACTUALISATION COMPLÈTE DÉCLENCHÉE');
    
    try {
      setRefreshing(true);
      
      // Notification de début avec explication claire
      notifications.info(
        '🔄 Actualisation complète en cours',
        'Étape 1/3: Scan de votre téléphone pour détecter les nouveaux contacts...',
        { 
          category: 'sync_progress',
          duration: 3000
        }
      );
      
      // 1. 📱 Scanner le téléphone pour nouveaux contacts
      console.log('📱 1/3 - Scan du téléphone...');
      await scannerRepertoireBrut?.();
      
      // 2. 📥 Synchroniser avec Strapi (bidirectionnel)
      console.log('📥 2/3 - Synchronisation avec Strapi...');
      if (!syncBlocked) {
        try {
          // Synchroniser les contacts existants vers Strapi (sans import de nouveaux)
          await syncContactsToStrapi();
        } catch (syncError) {
          console.warn('⚠️ Erreur sync Strapi (pas grave):', syncError);
          // Continuer même si sync échoue
        }
      } else {
        console.log('🚫 Sync Strapi bloquée (post-suppression)');
      }
      
      // 3. 📊 Recalculer les stats exactes
      console.log('📊 3/3 - Recalcul des stats...');
      await updateRealStats();
      
      // Supprimer notification de progression
      notifications.dismissCategory('sync_progress');
      
      // Notification de succès avec explication claire
      notifications.success(
        '✅ Actualisation terminée avec succès',
        'Votre téléphone a été scanné, vos contacts synchronisés avec le serveur et les statistiques mises à jour. Tout est à jour !',
        { category: 'actualisation_success', duration: 6000 }
      );
      
      console.log('✅ Actualisation complète terminée');
      
    } catch (error) {
      console.error('❌ Erreur actualisation complète:', error);
      
      // Supprimer notification de progress
      notifications.dismissCategory('sync_progress');
      
      // Notification d'erreur avec explication claire
      notifications.error(
        '❌ Erreur lors de l\'actualisation',
        'L\'actualisation automatique a échoué. Vérifiez votre connexion internet et réessayez. Vous pouvez aussi utiliser les boutons individuels.',
        { category: 'actualisation_error', duration: 10000 }
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Handler pour scanner le téléphone manuellement (DÉPRÉCIÉ - sera supprimé)
  const handleScanPhone = async () => {
    if (!loading) {
      console.log('📲 Scan téléphone manuel déclenché');
      unblockSync(); // 🔓 Débloquer les syncs pour scan volontaire
      try {
        await scannerRepertoireBrut?.();
        await updateRealStats();
        console.log('✅ Scan manuel terminé');
      } catch (error) {
        console.error('❌ Erreur scan manuel:', error);
      }
    }
  };

  // 🆕 Handler pour effacer/supprimer TOUT (contacts + invitations, local + Strapi)
  const handleSupprimerTout = async () => {
    console.log('🗑️ SUPPRESSION TOTALE DEMANDÉE');
    
    // Toast de confirmation avec explication détaillée
    notifications.confirm(
      '⚠️ Attention - Suppression totale',
      'Cette action va supprimer DÉFINITIVEMENT tous vos contacts Bob, invitations et données du serveur. Vous devrez tout recommencer à zéro. Êtes-vous absolument sûr ?',
      // Si l'utilisateur confirme
      async () => {
        try {
          console.log('💀 Utilisateur a confirmé la suppression totale');
          
          // 🔧 FLOW SIMPLIFIÉ: Suppression + Nettoyage + Stats + Une seule notification finale
          console.log('🗑️ SUPPRESSION FLOW SIMPLIFIÉ DÉMARRÉ');
          console.log('📊 Contacts à supprimer:', repertoire?.length || 0);
          
          // 🛑 1️⃣ PRÉPARATION - Blocage et protection
          setIsDuringDeletion(true);
          setSyncBlocked(true); // 🚫 Bloquer TOUTES syncs futures
          blockSync?.();
          setRefreshing(true);
          
          // 🔄 2️⃣ SUPPRESSION STRAPI (silencieuse avec logs console uniquement)
          console.log('🔥 2/4 - Suppression sur Strapi...');
          
          const currentToken = await authService.getValidToken();
          if (currentToken) {
            // Suppression contacts Strapi (suppression complète)
            try {
              const strapiContacts = await contactsService.getMyContacts(currentToken);
              console.log(`🎯 ${strapiContacts.length} contacts à supprimer sur Strapi`);
              
              // Suppression par petits batches
              for (let i = 0; i < strapiContacts.length; i++) {
                const contact = strapiContacts[i];
                try {
                  await contactsService.deleteContact(contact.id, currentToken);
                  console.log(`✅ Contact ${i + 1}/${strapiContacts.length}: ${contact.nom || 'Contact'}`);
                } catch (error) {
                  console.warn(`⚠️ Erreur suppression ${contact.nom}:`, error.message);
                }
                
                if (i % 5 === 0 && i > 0) {
                  await new Promise(resolve => setTimeout(resolve, 50));
                }
              }
            } catch (error) {
              console.warn('⚠️ Erreur suppression contacts Strapi:', error);
            }
            
            // Suppression invitations Strapi
            try {
              const invitationsResponse = await apiClient.get('/invitations', currentToken);
              if (invitationsResponse.ok) {
                const invitationsData = await invitationsResponse.json();
                const strapiInvitations = invitationsData.data || [];
                
                console.log(`🎯 ${strapiInvitations.length} invitations à supprimer sur Strapi`);
                
                for (let i = 0; i < strapiInvitations.length; i++) {
                  const invitation = strapiInvitations[i];
                  try {
                    await apiClient.delete(`/invitations/${invitation.id}`, currentToken);
                    console.log(`✅ Invitation ${i + 1}/${strapiInvitations.length} supprimée`);
                  } catch (error) {
                    console.warn(`⚠️ Erreur suppression invitation ${invitation.id}:`, error);
                  }
                }
              }
            } catch (error) {
              console.warn('⚠️ Erreur suppression invitations Strapi:', error);
            }
          }
          
          // 🧹 3️⃣ NETTOYAGE LOCAL
          console.log('🧹 3/4 - Nettoyage local...');
          await clearCache();
          
          // 🔄 4️⃣ FORCER RÉINITIALISATION COMPLÈTE
          console.log('📊 4/4 - Réinitialisation complète des stats...');
          
          // 🚫 Forcer les stats à 0 immédiatement (plus de cache corrompu)
          const emptyStats = {
            mesContacts: 0,
            contactsAvecBob: 0,
            contactsSansBob: 0,
            contactsDisponibles: contactsBruts?.length || 0,
            invitationsEnCours: 0,
            invitationsAcceptees: 0,
            contactsAvecEmail: 0,
            contactsComplets: 0,
            tauxCuration: 0,
            pourcentageBob: 0
          };
          
          setRealStats(emptyStats);
          setStrapiInvitationsCount(0);
          setIsDuringDeletion(false);
          unblockSync?.();
          setRefreshing(false);
          
          const newStats = emptyStats;
          
          console.log('✅ SUPPRESSION TERMINÉE - Nouvelles stats:', newStats);
          
          // 🎉 UNE SEULE notification finale
          notifications.success(
            '✅ Suppression totale terminée',
            `Toutes vos données Bob ont été supprimées définitivement.\n📊 Nouvelles stats: ${newStats?.mesContacts || 0} contacts, ${newStats?.contactsAvecBob || 0} utilisateurs Bob.\nVous repartez de zéro.`,
            { 
              category: 'suppression_success',
              duration: 5000
            }
          );
          
          console.log('💀 Suppression totale terminée');
          
          // Redirection vers écran d'introduction après 2 secondes
          setTimeout(() => {
            console.log('🏠 Redirection vers écran d\'introduction...');
            navigation.navigate('home'); // ou l'écran d'introduction approprié
          }, 2000);
          
        } catch (error) {
          console.error('❌ Erreur suppression totale:', error);
          
          // Nettoyer l'état en cas d'erreur
          setIsDuringDeletion(false);
          setRefreshing(false);
          unblockSync?.();
          
          // Notification d'erreur simplifiée
          notifications.error(
            '❌ Erreur lors de la suppression',
            'Certaines données n\'ont pas pu être supprimées. Vérifiez votre connexion et réessayez.',
            { category: 'suppression_error', duration: 8000 }
          );
        }
      },
      // Si l'utilisateur annule
      () => {
        console.log('❌ Utilisateur a annulé la suppression totale');
      },
      { 
        category: 'suppression_confirm',
        priority: 'high' as const
      }
    );
  };

  // Fonction wrapper SIMPLE pour supprimer contact
  const handleRemoveContactWithStatsUpdate = async (contactId: string) => {
    console.log('🗑️ Suppression contact - approche simple');
    
    try {
      // 🔍 DIAGNOSTIC: Vérifier le contact avant suppression
      const token = await authService.getValidToken();
      if (token) {
        console.log('🔍 Vérification contact dans Strapi avant suppression...');
        const checkResponse = await apiClient.get(`/api/contacts/${contactId}`, token);
        console.log('📊 Contact existe avant suppression:', checkResponse.ok, checkResponse.status);
        
        if (checkResponse.ok) {
          const contactData = await checkResponse.json();
          console.log('📝 Données du contact à supprimer:', contactData.data);
        }
      }
      
      // Juste supprimer le contact, sans complications
      await removeContact(contactId);
      console.log('✅ Contact supprimé de Strapi');
      
      // 🔍 DIAGNOSTIC: Vérifier le contact après suppression
      if (token) {
        console.log('🔍 Vérification contact dans Strapi après suppression...');
        setTimeout(async () => {
          const checkResponse = await apiClient.get(`/api/contacts/${contactId}`, token);
          console.log('📊 Contact existe après suppression:', checkResponse.ok, checkResponse.status);
          
          if (checkResponse.ok) {
            console.log('⚠️ PROBLÈME: Le contact existe encore dans Strapi !');
            const contactData = await checkResponse.json();
            console.log('📝 Contact encore présent:', contactData.data);
          } else {
            console.log('✅ Contact bien supprimé de Strapi');
          }
        }, 1000);
      }
      
      // 🔧 CORRECTION: Mettre à jour les stats après suppression
      console.log('📊 Mise à jour des stats après suppression...');
      await updateRealStats();
      console.log('✅ Stats mises à jour après suppression');
      
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
    }
  };

  // 🔧 DEBUG: Log interface seulement si changement
  const currentInterface = showInvitationsScreen ? 'InvitationsScreen' :
                          showSelectionInterface ? 'ContactsSelectionInterface' :
                          showManageContactsScreen ? 'ManageContactsScreen' :
                          'MainDashboard';
  
  const previousInterface = React.useRef(currentInterface);
  if (process.env.NODE_ENV === 'development' && currentInterface !== previousInterface.current) {
    console.log('🔍 ContactsScreen - Interface CHANGÉE:', currentInterface);
    previousInterface.current = currentInterface;
  }

  // Page dédiée aux invitations
  if (showInvitationsScreen) {
    return (
      <InvitationsScreen
        invitations={invitations || []}
        onClose={async () => {
          console.log('🔄 Fermeture InvitationsScreen - Rechargement stats...');
          setShowInvitationsScreen(false);
          // Attendre que l'interface soit fermée puis recharger TOUTES les stats
          setTimeout(async () => {
            try {
              await refreshAllStats();
              console.log('✅ Stats complètes rechargées après fermeture InvitationsScreen');
            } catch (error) {
              console.error('❌ Erreur rechargement stats:', error);
            }
          }, 500);
        }}
        sendInvitationFromHook={sendInvitation}
        onResendInvitation={async (invitation) => {
          console.log('🔄 Relance invitation pour:', invitation.nom);
          try {
            await sendInvitation(invitation.telephone, invitation.nom);
          } catch (error) {
            console.error('❌ Erreur relance invitation:', error);
          }
        }}
      />
    );
  }

  // Interface d'invitation modal réactivée
  if (showInvitationInterface) {
    // Calculer les contacts sans Bob (repertoire - contacts avec Bob)
    const contactsAvecBobIds = new Set((contacts || []).map(c => c.id || c.telephone));
    const contactsSansBob = (repertoire || []).filter(contact => 
      !contactsAvecBobIds.has(contact.id || contact.telephone)
    );
    
    console.log('🎯 Interface invitation:', {
      repertoireTotal: repertoire?.length || 0,
      contactsAvecBob: contacts?.length || 0,
      contactsSansBobCalcules: contactsSansBob.length,
      premiersContactsSansBob: contactsSansBob.slice(0, 3).map(c => c.nom)
    });
    
    return (
      <InvitationInterface
        contactsSansBob={contactsSansBob}
        contactsAvecBob={contacts || []}
        contactsBruts={contactsBruts || []}
        loading={loading}
        onClose={async () => {
          console.log('🔄 Fermeture InvitationInterface - Rechargement stats...');
          setShowInvitationInterface(false);
          // Attendre que l'interface soit fermée puis recharger TOUTES les stats
          setTimeout(async () => {
            try {
              await refreshAllStats();
              console.log('✅ Stats complètes rechargées après fermeture InvitationInterface');
            } catch (error) {
              console.error('❌ Erreur rechargement stats:', error);
            }
          }, 500);
        }}
        sendInvitationFromHook={sendInvitation}
        onInvitationSent={async () => {
          // Recharger TOUTES les données après envoi d'invitation
          console.log('📩 Invitation envoyée - Refresh des stats...');
          await refreshAllStats();
        }}
        onRemoveContact={handleRemoveContactWithStatsUpdate}
      />
    );
  }

  // Interface de sélection des contacts téléphone - Page complète
  if (showSelectionInterface) {
    return (
      <ContactsSelectionInterface
        contactsBruts={contactsBruts || []}
        repertoire={repertoire || []}
        loading={isImporting}
        onClose={async () => {
          console.log('🔄 Fermeture ContactsSelectionInterface - Rechargement stats...');
          setShowSelectionInterface(false);
          // Attendre que l'interface soit fermée puis recharger les stats
          setTimeout(async () => {
            try {
              await updateRealStats();
              console.log('✅ Stats rechargées après fermeture ContactsSelectionInterface');
            } catch (error) {
              console.error('❌ Erreur rechargement stats:', error);
            }
          }, 500);
        }}
        onImportSelected={async (contactIds: string[]) => {
          try {
            console.log(`📥 Import de ${contactIds.length} contacts sélectionnés`);
            
            // 🔧 FLOW SIMPLIFIÉ pour import sélectif
            if (importerContactsEtSync) {
              // Import + sync + détection en une seule séquence
              await importerContactsEtSync(contactIds);
              
              // 🚀 FIX: Utiliser directement le ContactsManager au lieu du hook
              const manager = ContactsManager.getInstance();
              await manager.detectBobUsers();
              
              await refreshAllStats(); // REFRESH COMPLET
              console.log('✅ Import sélectif terminé');
            } else {
              throw new Error('❌ Service d\'import non disponible');
            }
            
            // ✅ Notification personnalisée avec stats finales
            notifications.success(
              `✅ ${contactIds.length} contact${contactIds.length > 1 ? 's' : ''} ajouté${contactIds.length > 1 ? 's' : ''}`, 
              `Vos contacts ont été ajoutés à votre répertoire Bob et synchronisés avec le serveur.`,
              { category: 'contacts_import', duration: 4000 }
            );
            
            setShowSelectionInterface(false);
            console.log('✅ Notification affichée, interface fermée');
            
          } catch (error) {
            console.error('❌ Erreur import contacts:', error);
          }
        }}
      />
    );
  }

  // Écran de gestion des contacts - Page complète
  if (showManageContactsScreen) {
    return (
      <ManageContactsScreen
        repertoire={repertoire || []}
        contactsAvecBob={contacts || []}
        stats={realStats}
        onClose={async () => {
          console.log('🔄 Fermeture ManageContactsScreen - Rechargement stats...');
          setShowManageContactsScreen(false);
          // Attendre que l'interface soit fermée puis recharger les stats
          setTimeout(async () => {
            try {
              await updateRealStats();
              console.log('✅ Stats rechargées après fermeture ManageContactsScreen');
            } catch (error) {
              console.error('❌ Erreur rechargement stats:', error);
            }
          }, 500);
        }}
        onDeleteContact={handleRemoveContactWithStatsUpdate}
      />
    );
  }

  // 🔧 CORRECTION: Redirection automatique vers NetworkIntroductionScreen SEULEMENT si première visite
  // Ne JAMAIS rediriger si on a déjà eu des contacts (évite la redirection après suppression)
  const shouldShowIntroduction = (!repertoire || repertoire.length === 0) && 
                                 (!contactsBruts || contactsBruts.length === 0) && 
                                 !hasEverHadContacts; // ⭐ Plus simple : juste vérifier si on a déjà eu des contacts
  
  // ✅ Suppression de la condition shouldShowIntroduction pour toujours afficher le dashboard

  // Handler pour les notifications (comme dans HomeScreen)
  const handleNotificationPress = () => {
    console.log('🔔 Notifications pressées depuis Contacts');
    // TODO: Navigation vers écran notifications
  };

  // Rendu direct du dashboard (sans conditions complexes)
  return (
    <View style={{ flex: 1, paddingTop: 0 }}> {/* Header tout en haut */}
      {/* Header moderne STICKY - identique à HomeScreen */}
      <View style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        backgroundColor: '#f5f5f5',
        paddingTop: 20 // Safe area pour status bar
      }}>
        <ModernHomeHeader 
          username={typeof user === 'string' ? user : (user?.username || 'Utilisateur')}
          hasNotifications={true} // TODO: Remplacer par la vraie logique de notifications
          onNotificationPress={handleNotificationPress}
          avatarColor={modernColors.primary}
        />
      </View>

      {/* Indicateur de synchronisation */}
      <SyncIndicator 
        syncState={syncState}
        style={{ position: 'absolute', top: 70, right: 10, zIndex: 1000 }}
      />

      <ScrollView
        style={{ backgroundColor: '#f5f5f5' }}
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary || '#007AFF']}
            tintColor={Colors.primary || '#007AFF'}
            // 🛑 Désactiver visuellement si sync bloquée ou données stables
            enabled={!isSyncBlocked && (repertoire?.length === 0 || loading)}
          />
        }
      >
{/* Debug: Log des stats passées au dashboard - SUPPRIMÉ POUR ÉVITER L'ERREUR TEXT COMPONENT */}
        
        {/* Dashboard moderne dans l'esprit de la HomePage - TOUJOURS VISIBLE */}
          <>
            {/* Message d'introduction - Style moderne */}
            <View style={{
              backgroundColor: '#fff',
              margin: 8,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6
            }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
                🏠 Votre espace contacts Bob
              </Text>
              <Text style={{ fontSize: 16, color: '#6B7280', lineHeight: 22 }}>
                Gérez votre réseau, invitez vos proches et développez votre communauté <Text style={{ color: '#3B82F6', fontWeight: '600' }}>Bob</Text> en toute simplicité.
              </Text>
            </View>

            {/* 📊 Barre de progression d'import - Visible seulement pendant l'import */}
            {isImporting && (
              <View style={{
                backgroundColor: '#fff',
                margin: 8,
                borderRadius: 16,
                padding: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
                borderLeftWidth: 4,
                borderLeftColor: '#3B82F6'
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937' }}>
                  📥 Import en cours...
                </Text>
                
                {/* Barre de progression */}
                <View style={{ 
                  backgroundColor: '#F3F4F6', 
                  height: 8, 
                  borderRadius: 4, 
                  marginBottom: 12, 
                  overflow: 'hidden' 
                }}>
                  <View style={{ 
                    backgroundColor: '#3B82F6', 
                    height: 8, 
                    borderRadius: 4,
                    width: `${importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </View>
                
                {/* Informations détaillées */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {importProgress.current}/{importProgress.total} contacts
                  </Text>
                  <Text style={{ fontSize: 14, color: '#6B7280' }}>
                    {importProgress.total > 0 ? Math.round((importProgress.current / importProgress.total) * 100) : 0}%
                  </Text>
                </View>
                
                {/* Phase actuelle */}
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8, textAlign: 'center' }}>
                  {importProgress.phase === 'importing' ? '📥 Import des contacts et synchronisation...' :
                   importProgress.phase === 'syncing' ? '🔄 Stabilisation de la synchronisation...' :
                   importProgress.phase === 'detecting' ? '🔍 Détection des utilisateurs Bob existants...' :
                   importProgress.phase === 'finalizing' ? '📊 Finalisation et calcul des statistiques...' :
                   'Traitement en cours...'}
                </Text>
                
                {/* Temps estimé */}
                {importProgress.estimatedTimeRemaining && (
                  <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4, textAlign: 'center' }}>
                    ⏱️ Temps restant estimé: {Math.floor(importProgress.estimatedTimeRemaining / 60)}m {importProgress.estimatedTimeRemaining % 60}s
                  </Text>
                )}
                
                {/* Message d'avertissement */}
                <View style={{ 
                  backgroundColor: '#FEF3C7', 
                  padding: 12, 
                  borderRadius: 8, 
                  marginTop: 12,
                  borderLeftWidth: 3,
                  borderLeftColor: '#F59E0B'
                }}>
                  <Text style={{ fontSize: 13, color: '#92400E' }}>
                    ⚠️ Import en cours - Évitez d'utiliser les invitations pendant cette période pour éviter les conflits.
                  </Text>
                </View>
              </View>
            )}

            {/* Section des statistiques - Style moderne */}
            <View style={{
              backgroundColor: '#fff',
              margin: 8,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1F2937' }}>
                📊 Mon Réseau Bob
              </Text>
            
              {/* Barre de progression moderne - CORRIGÉE */}
              <View style={{ backgroundColor: '#F3F4F6', height: 12, borderRadius: 6, marginBottom: 12, overflow: 'hidden' }}>
                <View style={{ 
                  backgroundColor: '#3B82F6', 
                  height: 12, 
                  borderRadius: 6,
                  width: `${Math.max((realStats?.mesContacts > 0 ? Math.round((realStats?.contactsAvecBob || 0) / realStats.mesContacts * 100) : 0), 5)}%`,
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4
                }} />
              </View>
              
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#3B82F6', marginBottom: 5 }}>
                {realStats?.mesContacts > 0 ? Math.round((realStats?.contactsAvecBob || 0) / realStats.mesContacts * 100) : 0}% de vos contacts ont Bob
              </Text>
              
              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>
                {realStats?.contactsAvecBob || 0} contacts avec Bob sur {realStats?.mesContacts || 0} dans votre réseau
              </Text>

              {/* Cartes statistiques redesignées avec invitations */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                
                {/* Carte 1: Total Réseau */}
                <TouchableOpacity 
                  style={{ 
                    width: '48%',
                    backgroundColor: '#F8FAFC', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#E2E8F0'
                  }}
                  onPress={() => {
                    if (!loading && contacts && contacts.length > 0) {
                      setShowManageContactsScreen(true);
                    }
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#6366F1',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 20, color: '#fff' }}>📱</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>{realStats?.mesContacts || 0}</Text>
                  <Text style={{ fontSize: 11, color: '#6B7280', textAlign: 'center', fontWeight: '500' }}>Total contacts</Text>
                </TouchableOpacity>

                {/* Carte 2: Avec Bob */}
                <TouchableOpacity 
                  style={{ 
                    width: '48%',
                    backgroundColor: '#F0FDF4', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#BBF7D0'
                  }}
                  onPress={() => {
                    if (!loading && contacts && contacts.length > 0) {
                      setShowManageContactsScreen(true);
                    }
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#10B981',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 18, color: '#fff' }}>✅</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#059669' }}>{realStats?.contactsAvecBob || 0}</Text>
                  <Text style={{ fontSize: 11, color: '#059669', textAlign: 'center', fontWeight: '500' }}>Avec Bob</Text>
                </TouchableOpacity>

                {/* Carte 3: Sans Bob */}
                <TouchableOpacity 
                  style={{ 
                    width: '48%',
                    backgroundColor: '#FFFBEB', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#FDE68A'
                  }}
                  onPress={() => {
                    if (!loading && !isImporting) {
                      console.log('🎯 Activation interface invitation intégrée');
                      setShowInvitationInterface(true);
                    }
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#F59E0B',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 18, color: '#fff' }}>⏳</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#D97706' }}>{realStats?.contactsSansBob || 0}</Text>
                  <Text style={{ fontSize: 11, color: '#D97706', textAlign: 'center', fontWeight: '500' }}>Sans Bob</Text>
                </TouchableOpacity>

                {/* Carte 4: Invitations en cours */}
                <TouchableOpacity 
                  style={{ 
                    width: '48%',
                    backgroundColor: '#FEF3F2', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#FEB2B2'
                  }}
                  onPress={() => {
                    if (!loading && !isImporting) {
                      console.log('🎯 Ouverture gestion invitations');
                      setShowInvitationInterface(true);
                    }
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#EF4444',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <Text style={{ fontSize: 18, color: '#fff' }}>📩</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC2626' }}>{strapiInvitationsCount || realStats?.invitationsEnCours || invitations?.length || 0}</Text>
                  <Text style={{ fontSize: 11, color: '#DC2626', textAlign: 'center', fontWeight: '500' }}>Invitations</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section Actions rapides - Style moderne */}
            <View style={{
              backgroundColor: '#fff',
              margin: 8,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6
            }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#1F2937' }}>
                🚀 Actions rapides
              </Text>
              
              {/* Bouton Inviter si des contacts sans Bob - Style moderne */}
              {/* 🔧 FIX: Utiliser realStats au lieu du calcul manuel */}
              {(realStats?.contactsSansBob || 0) > 0 && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#3B82F6', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#3B82F6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={() => {
                    if (!loading && !isImporting) {
                      console.log('🎯 Activation interface invitation intégrée');
                      setShowInvitationInterface(true);
                    }
                  }}
                  disabled={loading || isImporting}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🚀</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      Inviter sur Bob
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      {/* 🔧 FIX: Utiliser realStats au lieu du calcul manuel */}
                      {realStats?.contactsSansBob || 0} contact{(realStats?.contactsSansBob || 0) > 1 ? 's' : ''} sans Bob
                    </Text>
                  </View>
                  <View style={{ 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 16,
                    minWidth: 36,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                      {realStats?.contactsSansBob || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Bouton Ajouter des contacts - Style moderne */}
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#F8FAFC', 
                  padding: 16, 
                  borderRadius: 12, 
                  marginBottom: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: '#E2E8F0'
                }}
                onPress={async () => {
                  if (!loading) {
                    console.log('🎯 Add contacts pressed - Vérification état:', {
                      contactsBrutsLength: contactsBruts?.length || 0,
                      repertoireLength: repertoire?.length || 0
                    });
                    
                    // 🚨 FIX: NE JAMAIS scanner si on a déjà des contacts (ça remet à zéro !)
                    console.log('🎯 Ouverture interface sélection sans scan - Protection des données');
                    setShowSelectionInterface(true);
                  }
                }}
                disabled={loading}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: '#3B82F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20, color: '#fff' }}>➕</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1F2937', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                    Sélectionner des contacts
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 13 }}>
                    {/* 🔧 FIX: Utiliser les stats réelles au lieu de contactsBruts après suppression */}
                    {realStats?.contactsDisponibles > 0 
                      ? `${realStats.contactsDisponibles} contacts disponibles à ajouter`
                      : 'Aucun nouveau contact à ajouter'}
                  </Text>
                </View>
                {realStats?.contactsDisponibles > 0 && (
                  <View style={{ 
                    backgroundColor: '#3B82F6', 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 16,
                    minWidth: 36,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                      {realStats.contactsDisponibles}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Bouton Import en masse - Conditionnel selon contacts disponibles */}
              {(realStats?.contactsDisponibles || 0) > 0 && (
                <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#F59E0B', 
                  padding: 16, 
                  borderRadius: 12, 
                  marginBottom: 12,
                  alignItems: 'center',
                  shadowColor: '#F59E0B',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4
                }}
                onPress={async () => {
                  if (loading) return;
                  
                  console.log('⚡ Import ALL contacts pressed');
                  
                  // Toujours scanner d'abord pour avoir les derniers contacts
                  try {
                    console.log('📱 Scan du téléphone avant import...');
                    unblockSync(); // 🔓 Débloquer les syncs pour import volontaire
                    await scannerRepertoireBrut?.();
                    await updateRealStats();
                    
                    // Appeler directement handleImportAllContacts
                    await handleImportAllContacts();
                  } catch (error) {
                    console.error('❌ Erreur scan pour import:', error);
                    notifications.error(
                      '❌ Erreur de scan',
                      'Impossible de scanner votre téléphone. Vérifiez les permissions.',
                      { duration: 5000 }
                    );
                  }
                }}
                disabled={loading}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>⚡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                    Importer d'un coup
                  </Text>
                  <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                    {realStats?.contactsDisponibles > 0
                      ? `${realStats.contactsDisponibles} contacts restants`
                      : 'Scanner et importer tous vos contacts'
                    }
                  </Text>
                </View>
              </TouchableOpacity>
              )}

              {/* Bouton Gérer contacts - Style moderne */}
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  backgroundColor: contacts && contacts.length > 0 ? '#F8FAFC' : '#F1F5F9', 
                  padding: 16, 
                  borderRadius: 12, 
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: contacts && contacts.length > 0 ? '#E2E8F0' : '#CBD5E1',
                  opacity: contacts && contacts.length > 0 ? 1 : 0.6
                }}
                onPress={() => {
                  if (!loading && contacts && contacts.length > 0) {
                    setShowManageContactsScreen(true);
                  }
                }}
                disabled={loading || !contacts || contacts.length === 0}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: contacts && contacts.length > 0 ? '#6366F1' : '#94A3B8',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 18, color: '#fff' }}>📋</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    color: contacts && contacts.length > 0 ? '#1F2937' : '#64748B', 
                    fontWeight: '600', 
                    fontSize: 16, 
                    marginBottom: 2 
                  }}>
                    Gérer mes contacts
                  </Text>
                  <Text style={{ 
                    color: contacts && contacts.length > 0 ? '#6B7280' : '#94A3B8', 
                    fontSize: 13 
                  }}>
                    {contacts && contacts.length > 0 
                      ? `Organisez vos ${contacts.length} contact${contacts.length > 1 ? 's' : ''} Bob`
                      : 'Ajoutez d\'abord des contacts'
                    }
                  </Text>
                </View>
                <View style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: contacts && contacts.length > 0 ? '#E2E8F0' : '#CBD5E1',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{ 
                    color: contacts && contacts.length > 0 ? '#64748B' : '#94A3B8', 
                    fontSize: 16, 
                    fontWeight: 'bold' 
                  }}>→</Text>
                </View>
              </TouchableOpacity>

              {/* 🔍 Bouton Détecter utilisateurs Bob - Style moderne */}
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#8B5CF6', 
                  padding: 16, 
                  borderRadius: 12, 
                  marginBottom: 12,
                  alignItems: 'center',
                  shadowColor: '#8B5CF6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4
                }}
                onPress={async () => {
                  if (!loading) {
                    console.log('🔍 DÉTECTION BOB - depuis ContactsScreen');
                    try {
                      notifications.info(
                        '🔍 Détection Bob en cours',
                        'Recherche des utilisateurs Bob parmi vos contacts...',
                        { duration: 3000 }
                      );
                      
                      // 🔧 FIX: Le hook detectBobUsers passe automatiquement les contacts du répertoire
                      await detectBobUsers();
                      await updateRealStats();
                      
                      notifications.success(
                        '✅ Détection Bob terminée',
                        'Vérifiez vos nouveaux contacts avec Bob !',
                        { duration: 5000 }
                      );
                    } catch (error) {
                      console.error('❌ Erreur détection Bob:', error);
                      notifications.error(
                        '❌ Erreur détection Bob',
                        'La détection a échoué. Réessayez.',
                        { duration: 5000 }
                      );
                    }
                  }
                }}
                disabled={loading}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>🔍</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                    🔍 Détecter utilisateurs Bob
                  </Text>
                  <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                    Chercher qui a Bob parmi vos {repertoire?.length || 0} contacts
                  </Text>
                </View>
              </TouchableOpacity>

              {/* 🔍 DEBUG: Diagnostic Stats et Bob */}
              {process.env.NODE_ENV === 'development' && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#F59E0B', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#F59E0B',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!loading) {
                      console.log('🔍 DIAGNOSTIC: Analyse des stats et contacts Bob');
                      try {
                        const { ContactsManager } = require('../../services/contacts/ContactsManager');
                        const manager = ContactsManager.getInstance();
                        
                        // 1. Analyser les données brutes
                        console.log('📊 DIAGNOSTIC: État des données:');
                        console.log('- contactsBruts:', contactsBruts?.length || 0);
                        console.log('- repertoire:', repertoire?.length || 0); 
                        console.log('- contacts (hook):', contacts?.length || 0);
                        console.log('- invitations:', invitations?.length || 0);
                        
                        // 2. Analyser les sources de contacts
                        console.log('📈 DIAGNOSTIC: Répartition par source:');
                        const sourceCount = {};
                        if (contacts) {
                          contacts.forEach(c => {
                            sourceCount[c.source || 'undefined'] = (sourceCount[c.source || 'undefined'] || 0) + 1;
                          });
                          console.log('Sources:', sourceCount);
                        }
                        
                        // 3. Analyser les champs Bob
                        console.log('👥 DIAGNOSTIC: Champs Bob dans repertoire:');
                        if (repertoire) {
                          const bobAnalysis = repertoire.map(c => ({
                            nom: c.nom,
                            telephone: c.telephone,
                            source: c.source,
                            aSurBob: c.aSurBob,
                            estUtilisateurBob: c.estUtilisateurBob,
                            statut: c.statut
                          }));
                          console.log('Analyse Bob:', bobAnalysis.slice(0, 10));
                          
                          const bobCount = repertoire.filter(c => c.aSurBob === true || c.estUtilisateurBob === true).length;
                          const sourcesBob = repertoire.filter(c => c.source === 'bob').length;
                          console.log(`Bob détectés: ${bobCount} (aSurBob/estUtilisateurBob)`);
                          console.log(`Sources Bob: ${sourcesBob} (source='bob')`);
                        }
                        
                        // 4. Forcer recalcul stats
                        console.log('🔄 DIAGNOSTIC: Recalcul forcé des stats...');
                        await updateRealStats();
                        
                        const currentStats = await getStats();
                        console.log('📊 DIAGNOSTIC: Stats actuelles:', currentStats);
                        
                        // 5. Vérifier invitations Strapi
                        console.log('📤 DIAGNOSTIC: Vérification invitations Strapi...');
                        const token = await authService.getValidToken();
                        if (token) {
                          const invitationsResponse = await apiClient.get('/invitations', token);
                          if (invitationsResponse.ok) {
                            const invitationsData = await invitationsResponse.json();
                            const strapiInvitations = invitationsData.data || [];
                            console.log(`📤 Invitations Strapi: ${strapiInvitations.length}`);
                            console.log('Invitations:', strapiInvitations.map(inv => ({
                              nom: inv.nom,
                              telephone: inv.telephone,
                              statut: inv.statut
                            })));
                          }
                        }
                        
                        notifications.info(
                          '🔍 Diagnostic terminé',
                          'Vérifiez la console pour les résultats détaillés',
                          { duration: 5000 }
                        );
                        
                      } catch (error) {
                        console.error('❌ DIAGNOSTIC: Erreur:', error);
                        notifications.error('❌ Erreur diagnostic', error.message, { duration: 5000 });
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🔍</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      🔍 DIAGNOSTIC Stats & Bob
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Analyser les données et sources (R: {repertoire?.length || 0}, C: {contacts?.length || 0})
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 🐛 DEBUG: Test phone scan button */}
              {process.env.NODE_ENV === 'development' && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#EC4899', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#EC4899',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!loading) {
                      console.log('🐛 DEBUG: Manual phone scan triggered');
                      try {
                        // Import ContactsManager directly
                        const { ContactsManager } = require('../../services/contacts/ContactsManager');
                        const manager = ContactsManager.getInstance();
                        
                        console.log('📱 Démarrage scan téléphone...');
                        const scanResult = await manager.scanPhoneContacts();
                        
                        console.log('🔍 DEBUG: Scan result:', {
                          hasPermission: scanResult.hasPermission,
                          contactsFound: scanResult.total,
                          errors: scanResult.errors
                        });
                        
                        // Check what's in contactsBruts now
                        console.log('📊 DEBUG: contactsBruts avant refresh:', contactsBruts?.length || 0);
                        
                        // Force refresh data
                        await refreshData?.();
                        
                        // Wait for data to be available (hooks update asynchronously)
                        let attempts = 0;
                        const maxAttempts = 10;
                        while ((!contactsBruts || contactsBruts.length === 0) && attempts < maxAttempts) {
                          console.log(`🔄 DEBUG: Attente données (tentative ${attempts + 1}/${maxAttempts})...`);
                          await new Promise(resolve => setTimeout(resolve, 200));
                          attempts++;
                        }
                        
                        console.log('📊 DEBUG: contactsBruts après attente:', contactsBruts?.length || 0);
                        await updateRealStats();
                        
                        notifications.info(
                          '🐛 DEBUG: Scan terminé',
                          `${scanResult.total} scannés → ${contactsBruts?.length || 0} dans contactsBruts`,
                          { duration: 5000 }
                        );
                        
                      } catch (error) {
                        console.error('❌ DEBUG: Erreur scan:', error);
                        notifications.error('❌ DEBUG: Erreur', error.message, { duration: 5000 });
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🐛</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      🐛 DEBUG: Test Scan
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Scanner manuellement le téléphone ({contactsBruts?.length || 0} bruts)
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 🔧 DEBUG: Corriger Stats et Bob */}
              {process.env.NODE_ENV === 'development' && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#8B5CF6', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#8B5CF6',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!loading) {
                      console.log('🔧 CORRECTION: Forcer détection Bob et correction stats');
                      try {
                        const { ContactsManager } = require('../../services/contacts/ContactsManager');
                        const manager = ContactsManager.getInstance();
                        
                        notifications.info(
                          '🔧 Correction en cours',
                          'Forçage de la détection Bob et recalcul des stats...',
                          { duration: 3000 }
                        );
                        
                        // 1. Forcer détection Bob sur TOUS les contacts du répertoire
                        console.log('🔧 1/4 - Force détection Bob...');
                        await manager.detectBobUsers(); // Auto récupère tous les contacts répertoire
                        
                        // 2. Forcer refresh complet des données
                        console.log('🔧 2/4 - Refresh données...');
                        await refreshData?.();
                        
                        // 3. Attendre que les données se propagent
                        console.log('🔧 3/4 - Attente propagation...');
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                        // 4. Recalculer les stats
                        console.log('🔧 4/4 - Recalcul stats...');
                        await updateRealStats();
                        
                        // 5. Vérification post-correction
                        const newStats = await getStats();
                        console.log('✅ CORRECTION: Nouvelles stats:', newStats);
                        
                        // 6. Analyser les résultats
                        if (repertoire) {
                          const bobCount = repertoire.filter(c => c.aSurBob === true || c.estUtilisateurBob === true || c.source === 'bob').length;
                          console.log(`✅ CORRECTION: ${bobCount} utilisateurs Bob détectés dans le répertoire`);
                          
                          // Vérifier si stats sont maintenant correctes
                          const expectedSansBob = Math.max(0, repertoire.length - bobCount);
                          const actualSansBob = newStats?.contactsSansBob || 0;
                          
                          if (actualSansBob === expectedSansBob) {
                            notifications.success(
                              '✅ Correction réussie!',
                              `Stats corrigées: ${repertoire.length} total, ${bobCount} avec Bob, ${actualSansBob} sans Bob`,
                              { duration: 5000 }
                            );
                          } else {
                            notifications.warning(
                              '⚠️ Correction partielle',
                              `Attendu ${expectedSansBob} sans Bob, obtenu ${actualSansBob}. Vérifiez la console.`,
                              { duration: 5000 }
                            );
                          }
                        }
                        
                      } catch (error) {
                        console.error('❌ CORRECTION: Erreur:', error);
                        notifications.error('❌ Erreur correction', error.message, { duration: 5000 });
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🔧</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      🔧 CORRIGER Stats & Bob
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Forcer détection Bob + recalcul stats complet
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 🌐 STRAPI PULL: Restore contacts from server */}
              {process.env.NODE_ENV === 'development' && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#10B981', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!loading) {
                      console.log('🌐 STRAPI PULL: Force pull from Strapi triggered');
                      try {
                        notifications.info(
                          '🌐 Récupération Strapi...',
                          'Récupération de vos contacts depuis le serveur...',
                          { duration: 3000 }
                        );
                        
                        const result = await forcePullFromStrapi?.();
                        console.log('🌐 STRAPI PULL: Result:', result);
                        
                        // Force refresh and update stats
                        await refreshData?.();
                        await updateRealStats();
                        
                        notifications.success(
                          '✅ Récupération réussie!',
                          `${result?.contactsFound || 0} contacts récupérés depuis Strapi`,
                          { duration: 5000 }
                        );
                        
                      } catch (error) {
                        console.error('❌ STRAPI PULL: Erreur:', error);
                        notifications.error('❌ Erreur Strapi', error.message, { duration: 5000 });
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🌐</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      🌐 STRAPI PULL
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Récupérer contacts depuis le serveur (répertoire: {repertoire?.length || 0})
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* 📤 DEBUG: Diagnostic et Sync Invitations */}
              {process.env.NODE_ENV === 'development' && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#06B6D4', 
                    padding: 16, 
                    borderRadius: 12, 
                    marginBottom: 12,
                    alignItems: 'center',
                    shadowColor: '#06B6D4',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={async () => {
                    if (!loading) {
                      console.log('📤 INVITATIONS: Diagnostic et synchronisation');
                      try {
                        const token = await authService.getValidToken();
                        if (!token) {
                          throw new Error('Token non disponible');
                        }
                        
                        notifications.info(
                          '📤 Diagnostic invitations',
                          'Analyse des invitations locales vs Strapi...',
                          { duration: 3000 }
                        );
                        
                        // 1. Analyser invitations locales
                        console.log('📤 1/3 - Invitations locales:');
                        console.log('- invitations (hook):', invitations?.length || 0);
                        if (invitations && invitations.length > 0) {
                          console.log('Invitations locales:', invitations.map(inv => ({
                            nom: inv.nom,
                            telephone: inv.telephone,
                            statut: inv.statut,
                            dateEnvoi: inv.dateEnvoi
                          })));
                        }
                        
                        // 2. Analyser invitations Strapi
                        console.log('📤 2/3 - Invitations Strapi:');
                        const strapiResponse = await apiClient.get('/invitations', token);
                        let strapiInvitations = [];
                        
                        if (strapiResponse.ok) {
                          const strapiData = await strapiResponse.json();
                          strapiInvitations = strapiData.data || [];
                          console.log('- invitations Strapi:', strapiInvitations.length);
                          console.log('Invitations Strapi:', strapiInvitations.map(inv => ({
                            id: inv.id,
                            nom: inv.nom,
                            telephone: inv.telephone,
                            statut: inv.statut
                          })));
                        } else {
                          console.error('❌ Erreur récupération invitations Strapi:', strapiResponse.status);
                        }
                        
                        // 3. Analyser les différences
                        console.log('📤 3/3 - Analyse des différences:');
                        const localTelephones = new Set((invitations || []).map(inv => inv.telephone));
                        const strapiTelephones = new Set(strapiInvitations.map(inv => inv.telephone));
                        
                        const localOnly = Array.from(localTelephones).filter(tel => !strapiTelephones.has(tel));
                        const strapiOnly = Array.from(strapiTelephones).filter(tel => !localTelephones.has(tel));
                        
                        console.log('📤 Seulement en local:', localOnly);
                        console.log('📤 Seulement dans Strapi:', strapiOnly);
                        
                        // 4. Forcer synchronisation des invitations manquantes
                        if (localOnly.length > 0) {
                          console.log('🔄 Synchronisation des invitations manquantes vers Strapi...');
                          // TODO: Implémenter sync des invitations manquantes
                        }
                        
                        // 5. Résumé
                        const summary = `Local: ${invitations?.length || 0}, Strapi: ${strapiInvitations.length}, Manquantes Strapi: ${localOnly.length}, Manquantes Local: ${strapiOnly.length}`;
                        console.log('📊 RÉSUMÉ INVITATIONS:', summary);
                        
                        notifications.info(
                          '📤 Diagnostic invitations terminé',
                          summary,
                          { duration: 8000 }
                        );
                        
                      } catch (error) {
                        console.error('❌ INVITATIONS: Erreur:', error);
                        notifications.error('❌ Erreur diagnostic invitations', error.message, { duration: 5000 });
                      }
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>📤</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      📤 DIAGNOSTIC Invitations
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Analyser Local vs Strapi (L: {invitations?.length || 0})
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Bouton Supprimer tous mes contacts - Style moderne avec décompte */}
              {(repertoire?.length || 0) > 0 && (
                <TouchableOpacity 
                  style={{ 
                    flexDirection: 'row', 
                    backgroundColor: '#EF4444', 
                    padding: 16, 
                    borderRadius: 12, 
                    alignItems: 'center',
                    shadowColor: '#EF4444',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 4
                  }}
                  onPress={() => {
                    if (!loading) {
                      handleSupprimerTout();
                    }
                  }}
                  disabled={loading}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ fontSize: 20 }}>🗑️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                      Supprimer tous mes contacts
                    </Text>
                    <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                      Effacer les {repertoire?.length || 0} contact{(repertoire?.length || 0) > 1 ? 's' : ''} et données serveur
                    </Text>
                  </View>
                  <View style={{ 
                    backgroundColor: 'rgba(255,255,255,0.25)', 
                    paddingHorizontal: 12, 
                    paddingVertical: 6, 
                    borderRadius: 16,
                    minWidth: 36,
                    alignItems: 'center'
                  }}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                      {repertoire?.length || 0}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 🔧 BOUTON TEMPORAIRE: Test suppression (ignore les stats) */}
            {(contactsBruts?.length || 0) > 0 && (
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  backgroundColor: '#DC2626', 
                  padding: 16, 
                  margin: 8,
                  borderRadius: 12, 
                  alignItems: 'center',
                  shadowColor: '#DC2626',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4
                }}
                onPress={() => {
                  if (!loading) {
                    handleSupprimerTout();
                  }
                }}
                disabled={loading}
              >
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 20 }}>🗑️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginBottom: 2 }}>
                    🔧 TEST: Supprimer tous les contacts
                  </Text>
                  <Text style={{ color: 'white', fontSize: 13, opacity: 0.9 }}>
                    TEMPORAIRE - {contactsBruts?.length || 0} contacts + Strapi
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Section Bobiz - Système de récompenses */}
            <View style={{
              backgroundColor: '#fff',
              margin: 8,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 2,
              borderColor: '#FBBF24'
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: '#FEF3C7',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12
                }}>
                  <Text style={{ fontSize: 24 }}>🪙</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
                    Vos Bobiz
                  </Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#F59E0B' }}>
                    {user?.bobizPoints || 0} Bobiz
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: '#FEF3C7', padding: 16, borderRadius: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#92400E', marginBottom: 8 }}>
                  💰 Comment gagner des Bobiz ?
                </Text>
                <View style={{ marginLeft: 8 }}>
                  <Text style={{ fontSize: 14, color: '#92400E', marginBottom: 6 }}>
                    • <Text style={{ fontWeight: '600' }}>+10 Bobiz</Text> par invitation envoyée
                  </Text>
                  <Text style={{ fontSize: 14, color: '#92400E', marginBottom: 6 }}>
                    • <Text style={{ fontWeight: '600' }}>+50 Bobiz</Text> si votre contact accepte !
                  </Text>
                  <Text style={{ fontSize: 14, color: '#92400E' }}>
                    • <Text style={{ fontWeight: '600' }}>Bonus</Text> pour développer votre réseau
                  </Text>
                </View>
              </View>

              <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', fontStyle: 'italic' }}>
                Plus vous invitez, plus vous gagnez ! 🚀
              </Text>
            </View>

            {/* Section Aide - Style moderne */}
            <View style={{
              backgroundColor: '#fff',
              margin: 8,
              borderRadius: 16,
              padding: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1,
              borderColor: '#E5E7EB'
            }}>
              <Text style={{ fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 8 }}>
                🔧 <Text style={{ fontWeight: '600' }}>Besoin de plus d'options ?</Text>
              </Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#3B82F6', textAlign: 'center', marginBottom: 12 }}>
                Menu → Profil → Tests et Debug
              </Text>
              <View style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12 }}>
                <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20 }}>
                  • Scanner et synchroniser{'\n'}
                  • Gérer les données Strapi{'\n'}
                  • Diagnostics et nettoyage{'\n'}
                  • Documentation complète
                </Text>
              </View>
              
              {/* 🔧 Padding pour éviter que la barre de navigation cache les boutons */}
              <View style={{ height: 60 }} />
            </View>
          </>
      </ScrollView>
      
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
          📞 SCREEN: ContactsScreen.tsx
        </Text>
      </View>
      
    </View>
  );
});