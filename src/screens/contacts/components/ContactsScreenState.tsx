// src/screens/contacts/components/ContactsScreenState.tsx
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CONTACTS_STATS_CACHE_KEY = '@bob_contacts_stats_cache';

export const useContactsScreenState = () => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSelectionInterface, setShowSelectionInterface] = useState(false);
  const [showInvitationInterface, setShowInvitationInterface] = useState(false);
  const [showInvitationsScreen, setShowInvitationsScreen] = useState(false);
  const [showManageContactsScreen, setShowManageContactsScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // 🔧 FIX: Stats persistantes avec AsyncStorage pour éviter la réinitialisation à zéro
  const [stats, setStatsInternal] = useState<{
    mesContacts: number;
    contactsAvecBob: number;
    contactsSansBob: number;
    contactsInvites: number;
    pourcentageBob: number;
    totalContactsTelephone: number;
    contactsAvecEmail: number;
    contactsComplets: number;
    contactsDisponibles: number;
    tauxCuration: number;
    invitationsEnCours: number;
    invitationsAcceptees: number;
    contactsEnLigne: number;
    nouveauxDepuisScan: number;
    totalContactsBob: number;
    totalInvitationsEnvoyees: number;
    timestamp: string;
  }>({
    mesContacts: 0, contactsAvecBob: 0, contactsSansBob: 0, contactsInvites: 0,
    pourcentageBob: 0, totalContactsTelephone: 0, contactsAvecEmail: 0,
    contactsComplets: 0, contactsDisponibles: 0, tauxCuration: 0,
    invitationsEnCours: 0, invitationsAcceptees: 0, contactsEnLigne: 0,
    nouveauxDepuisScan: 0, totalContactsBob: 0, totalInvitationsEnvoyees: 0,
    timestamp: ''
  });

  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  // Charger les stats depuis AsyncStorage au démarrage
  useEffect(() => {
    const loadPersistedStats = async () => {
      try {
        const cachedStats = await AsyncStorage.getItem(CONTACTS_STATS_CACHE_KEY);
        if (cachedStats) {
          const parsed = JSON.parse(cachedStats);
          console.log('📥 Chargement stats depuis cache:', parsed);
          setStatsInternal(parsed);
        }
      } catch (error) {
        console.warn('⚠️ Erreur chargement cache stats:', error);
      } finally {
        setIsStatsLoaded(true);
      }
    };

    loadPersistedStats();
  }, []);

  // Wrapper pour setStats qui sauvegarde automatiquement dans AsyncStorage
  const setStats = async (newStats: any) => {
    console.log('💾 Sauvegarde stats dans cache:', newStats);
    
    try {
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem(CONTACTS_STATS_CACHE_KEY, JSON.stringify(newStats));
      
      // Mettre à jour l'état local
      setStatsInternal(newStats);
      
      console.log('✅ Stats sauvegardées avec succès');
    } catch (error) {
      console.error('❌ Erreur sauvegarde stats:', error);
      // En cas d'erreur, on met quand même à jour l'état local
      setStatsInternal(newStats);
    }
  };

  // Fonction pour vider le cache des stats (si nécessaire)
  const clearStatsCache = async () => {
    try {
      await AsyncStorage.removeItem(CONTACTS_STATS_CACHE_KEY);
      console.log('🗑️ Cache stats vidé');
    } catch (error) {
      console.warn('⚠️ Erreur vidage cache stats:', error);
    }
  };


  return {
    // Modal states
    showPermissionModal,
    setShowPermissionModal,
    showSelectionInterface,
    setShowSelectionInterface,
    showInvitationInterface,
    setShowInvitationInterface,
    showInvitationsScreen,
    setShowInvitationsScreen,
    showManageContactsScreen,
    setShowManageContactsScreen,
    
    // UI states
    refreshing,
    setRefreshing,
    showTips,
    setShowTips,
    isFirstTime,
    setIsFirstTime,
    
    // Stats persistantes
    stats,
    setStats,
    isStatsLoaded,
    clearStatsCache
  };
};