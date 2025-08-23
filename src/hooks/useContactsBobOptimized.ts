// src/hooks/useContactsBobOptimized.ts - Version optimisée avec cache et logs intelligents
import { useCallback, useEffect, useState } from 'react';
import { useContactsBob as useContactsBobOriginal } from './useContactsBob';
import { performanceManager, usePerformanceCache } from '../utils/performance';
import { logger, logContacts } from '../utils/logger';
import { useNotifications } from '../components/common/SmartNotifications';

export const useContactsBobOptimized = () => {
  const notifications = useNotifications();
  const cache = usePerformanceCache();
  
  // Utiliser le hook original
  const originalHook = useContactsBobOriginal();
  
  // État pour les métriques de performance
  const [performanceMetrics, setPerformanceMetrics] = useState({
    lastSyncDuration: 0,
    cacheHitRate: 0,
    apiCallsCount: 0
  });

  // Wrapper optimisé pour les opérations coûteuses
  const scannerRepertoireOptimized = useCallback(async () => {
    const timer = logger.startTimer('scannerRepertoire');
    
    try {
      // Vérifier d'abord le cache
      const cacheKey = 'contacts_scan_in_progress';
      const isScanning = cache.get(cacheKey);
      
      if (isScanning) {
        logContacts('Scan déjà en cours, ignorer la demande');
        return false;
      }

      // Marquer le scan en cours
      cache.set(cacheKey, true, 30000); // 30 secondes
      
      notifications.info(
        'Scan en cours',
        'Analyse de vos contacts...',
        { category: 'contacts_scan', duration: 0 }
      );

      const result = await performanceManager.measure(
        'scanner_repertoire_complet',
        () => originalHook.scannerRepertoire(),
        1000 // Alerter si > 1 seconde
      );

      // Nettoyer le cache
      cache.set(cacheKey, false);
      
      if (result) {
        notifications.success(
          'Scan terminé',
          `${originalHook.contactsBruts.length} contacts trouvés`,
          { 
            category: 'contacts_scan',
            action: {
              label: 'Voir',
              onPress: () => {} // Navigation vers contacts
            }
          }
        );
      }

      timer();
      return result;
      
    } catch (error) {
      cache.set(cacheKey, false);
      logger.error('contacts', 'Erreur scan repertoire optimisé', error);
      
      notifications.error(
        'Erreur de scan',
        'Impossible de scanner vos contacts',
        {
          persistent: true,
          action: {
            label: 'Réessayer',
            onPress: scannerRepertoireOptimized
          }
        }
      );
      
      timer();
      throw error;
    }
  }, [originalHook.scannerRepertoire, cache, notifications, originalHook.contactsBruts.length]);

  // Wrapper optimisé pour la synchronisation avec déduplication
  const importerContactsEtSyncOptimized = useCallback(async (contacts: any[]) => {
    const cacheKey = `import_sync_${contacts.length}_${Date.now()}`;
    
    return await performanceManager.deduplicateAPI(
      'import_contacts_sync',
      async () => {
        const timer = logger.startTimer('importerContactsEtSync');
        
        try {
          notifications.info(
            'Synchronisation',
            `Import de ${contacts.length} contacts...`,
            { category: 'contacts_sync', duration: 0 }
          );

          const result = await performanceManager.measure(
            'importer_contacts_complet',
            () => originalHook.importerContactsEtSync(contacts),
            2000 // Alerter si > 2 secondes
          );

          notifications.success(
            'Import réussi',
            `${contacts.length} contacts synchronisés`,
            { category: 'contacts_sync' }
          );

          timer();
          return result;
          
        } catch (error) {
          logger.error('contacts', 'Erreur import optimisé', error);
          
          notifications.error(
            'Erreur d\'import',
            'Impossible de synchroniser vos contacts',
            {
              persistent: true,
              action: {
                label: 'Réessayer',
                onPress: () => importerContactsEtSyncOptimized(contacts)
              }
            }
          );
          
          timer();
          throw error;
        }
      }
    );
  }, [originalHook.importerContactsEtSync, notifications]);

  // Debounced stats calculation
  const getStatsOptimized = useCallback(
    performanceManager.debounce('getStats', async () => {
      const timer = logger.startTimer('getStats');
      
      try {
        // Vérifier le cache d'abord
        const cacheKey = `stats_${originalHook.contactsBruts.length}_${originalHook.repertoire.length}`;
        const cachedStats = cache.get(cacheKey);
        
        if (cachedStats) {
          logger.debug('performance', 'Stats depuis cache');
          return cachedStats;
        }

        const stats = await originalHook.getStats();
        
        // Mettre en cache pour 30 secondes
        cache.set(cacheKey, stats, 30000);
        
        timer();
        return stats;
        
      } catch (error) {
        logger.error('contacts', 'Erreur getStats optimisé', error);
        timer();
        throw error;
      }
    }, 500)
  , [originalHook.getStats, cache, originalHook.contactsBruts.length, originalHook.repertoire.length]);

  // Métriques de performance en temps réel
  useEffect(() => {
    const updateMetrics = () => {
      const perfMetrics = performanceManager.getMetrics();
      setPerformanceMetrics({
        lastSyncDuration: 0, // À implémenter
        cacheHitRate: perfMetrics.cacheStats.hitRate,
        apiCallsCount: perfMetrics.apiCalls
      });
    };

    // Update toutes les 10 secondes si en développement
    const interval = __DEV__ ? setInterval(updateMetrics, 10000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Notifications contextuelles intelligentes
  useEffect(() => {
    // Tip si jamais scanné
    if (originalHook.contactsBruts.length === 0 && !originalHook.lastScanDate) {
      notifications.tip(
        'Premier scan',
        'Commencez par scanner vos contacts pour découvrir qui a Bob',
        {
          category: 'onboarding',
          persistent: true,
          action: {
            label: 'Scanner',
            onPress: scannerRepertoireOptimized
          }
        }
      );
    }
    
    // Tip si beaucoup de contacts mais aucun sélectionné
    if (originalHook.contactsBruts.length > 50 && originalHook.repertoire.length === 0) {
      notifications.tip(
        'Sélection recommandée',
        `${originalHook.contactsBruts.length} contacts trouvés. Sélectionnez vos proches pour commencer`,
        {
          category: 'curation',
          duration: 8000
        }
      );
    }

    // Warning si taux Bob très faible
    const bobRate = originalHook.repertoire.length > 0 
      ? (originalHook.repertoire.filter(c => c.aSurBob).length / originalHook.repertoire.length) * 100 
      : 0;
      
    if (originalHook.repertoire.length >= 10 && bobRate < 10) {
      notifications.warning(
        'Faible adoption Bob',
        `Seulement ${Math.round(bobRate)}% de vos contacts ont Bob. Invitez-en plus !`,
        {
          category: 'adoption',
          action: {
            label: 'Inviter',
            onPress: () => {} // Navigation vers invitations
          }
        }
      );
    }
  }, [
    originalHook.contactsBruts.length, 
    originalHook.repertoire.length, 
    originalHook.lastScanDate,
    scannerRepertoireOptimized,
    notifications
  ]);

  // Retourner l'interface optimisée
  return {
    // États originaux
    ...originalHook,
    
    // Méthodes optimisées
    scannerRepertoire: scannerRepertoireOptimized,
    importerContactsEtSync: importerContactsEtSyncOptimized,
    getStats: getStatsOptimized,
    
    // Nouvelles métriques
    performanceMetrics,
    
    // Nouvelles méthodes utilitaires
    clearPerformanceCache: () => {
      cache.clear();
      logger.info('performance', 'Cache de performance vidé');
    },
    
    getPerformanceReport: () => {
      const metrics = performanceManager.getMetrics();
      logContacts('Rapport de performance', {
        cacheHitRate: `${metrics.cacheStats.hitRate.toFixed(1)}%`,
        apiCalls: metrics.apiCalls,
        cacheSize: metrics.cacheStats.size
      });
      return metrics;
    }
  };
};

// Export pour backward compatibility
export { useContactsBobOptimized as useContactsBob };