// src/hooks/contacts/useContactsStats.ts - Hook pour statistiques réactives

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ContactsManager } from '../../services/contacts/ContactsManager';
import { ContactsStats, ContactChangeType } from '../../types/contacts.unified';

export interface UseContactsStatsReturn {
  stats: ContactsStats | null;
  loading: boolean;
  error: string | null;
  lastUpdate: number;
  
  // Actions
  refreshStats: () => Promise<void>;
  
  // Stats formatées pour l'UI
  formattedStats: {
    totalTelephone: string;
    mesContacts: string;
    contactsAvecBob: string;
    contactsSansBob: string;
    contactsDisponibles: string;
    invitationsEnCours: string;
    tauxCuration: string;
    pourcentageBob: string;
  } | null;
}

export const useContactsStats = (): UseContactsStatsReturn => {
  const [stats, setStats] = useState<ContactsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const manager = useMemo(() => ContactsManager.getInstance(), []);

  // Calculer les stats initiales et s'abonner aux changements
  useEffect(() => {
    let mounted = true;

    const calculateInitialStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const initialStats = await manager.getStats();
        
        if (mounted) {
          setStats(initialStats);
          setLoading(false);
          setLastUpdate(Date.now());
          console.log('📊 useContactsStats - Stats initiales calculées:', {
            total: initialStats.totalTelephone,
            repertoire: initialStats.mesContacts,
            bob: initialStats.contactsAvecBob,
            disponibles: initialStats.contactsDisponibles
          });
        }
      } catch (err) {
        console.error('❌ Erreur calcul stats initiales:', err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    // Abonnement aux changements du repository pour recalcul automatique
    const unsubscribe = manager.repository.subscribe(async (type: ContactChangeType) => {
      if (!mounted) return;

      // 🚀 OPTIMISATION: Ignorer les mises à jour en mode batch (sauf bulk_update)
      if (manager.isBatchModeActive() && type !== 'bulk_update') {
        console.log(`📊 Stats non recalculées (batch mode) après ${type}`);
        return;
      }

      // Recalculer les stats à chaque changement (ou à la fin du batch)
      try {
        const newStats = await manager.getStats();
        setStats(newStats);
        setLastUpdate(Date.now());
        
        console.log(`📊 Stats recalculées après ${type}:`, {
          total: newStats.totalTelephone,
          repertoire: newStats.mesContacts,
          bob: newStats.contactsAvecBob,
          disponibles: newStats.contactsDisponibles
        });
      } catch (err) {
        console.error('❌ Erreur recalcul stats:', err);
        setError(err.message);
      }
    });

    calculateInitialStats();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [manager]);

  // === ACTIONS ===

  const refreshStats = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Rafraîchissement manuel des stats...');
      setLoading(true);
      setError(null);
      
      const newStats = await manager.getStats();
      setStats(newStats);
      setLastUpdate(Date.now());
      setLoading(false);
      
      console.log('✅ Stats rafraîchies manuellement');
    } catch (err) {
      console.error('❌ Erreur rafraîchissement stats:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [manager]);

  // === STATS FORMATÉES POUR L'UI ===

  const formattedStats = useMemo(() => {
    if (!stats) return null;

    const formatNumber = (num: number): string => {
      return num.toLocaleString('fr-FR');
    };

    const formatPercentage = (num: number): string => {
      return `${num}%`;
    };

    return {
      totalTelephone: formatNumber(stats.totalTelephone),
      mesContacts: formatNumber(stats.mesContacts),
      contactsAvecBob: formatNumber(stats.contactsAvecBob),
      contactsSansBob: formatNumber(stats.contactsSansBob),
      contactsDisponibles: formatNumber(stats.contactsDisponibles),
      invitationsEnCours: formatNumber(stats.invitationsEnCours),
      tauxCuration: formatPercentage(stats.tauxCuration),
      pourcentageBob: formatPercentage(stats.pourcentageBob)
    };
  }, [stats]);

  return {
    stats,
    loading,
    error,
    lastUpdate,
    refreshStats,
    formattedStats
  };
};