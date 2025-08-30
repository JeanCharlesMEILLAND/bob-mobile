import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { contactsService } from '../services';
import { storageService } from '../services/storage.service';

interface NetworkAccessConfig {
  minNetworkSize?: number;
  showWarningThreshold?: number;
  feature?: string;
}

interface NetworkStats {
  totalContacts: number;
  bobContacts: number;
  activeContacts: number;
}

interface NetworkAccessResult {
  hasAccess: boolean;
  showWarning: boolean;
  networkStats: NetworkStats;
  isLoading: boolean;
  ignoreWarning: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useNetworkAccess = (config: NetworkAccessConfig = {}): NetworkAccessResult => {
  const {
    minNetworkSize = 3,
    showWarningThreshold = 1,
    feature = 'feature'
  } = config;

  const { user } = useAuth();
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalContacts: 0,
    bobContacts: 0,
    activeContacts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasIgnoredWarning, setHasIgnoredWarning] = useState(false);

  useEffect(() => {
    if (user) {
      loadNetworkStats();
      checkIgnoredWarnings();
    }
  }, [user, feature]);

  const loadNetworkStats = async () => {
    try {
      setIsLoading(true);
      
      // Get contact stats from contacts service
      const contacts = await contactsService.getContacts();
      const bobContacts = contacts.filter(c => c.isOnBob && c.isActive);
      const activeContacts = bobContacts.filter(c => {
        // Consider active if they've been online recently or have recent activity
        return c.lastSeen && new Date(c.lastSeen) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      });

      setNetworkStats({
        totalContacts: contacts.length,
        bobContacts: bobContacts.length,
        activeContacts: activeContacts.length
      });
    } catch (error) {
      console.error('Erreur chargement stats réseau:', error);
      // Default to allowing access if we can't check
      setNetworkStats({ totalContacts: 5, bobContacts: 5, activeContacts: 5 });
    } finally {
      setIsLoading(false);
    }
  };

  const checkIgnoredWarnings = async () => {
    try {
      const ignoredUntil = await storageService.get(`network_warning_ignored_${feature}`);
      if (ignoredUntil) {
        const ignoredDate = new Date(ignoredUntil);
        const now = new Date();
        // Reset warning every 24 hours
        if (now < ignoredDate) {
          setHasIgnoredWarning(true);
        } else {
          await storageService.remove(`network_warning_ignored_${feature}`);
          setHasIgnoredWarning(false);
        }
      }
    } catch (error) {
      console.error('Erreur vérification warnings:', error);
    }
  };

  const ignoreWarning = async () => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await storageService.set(`network_warning_ignored_${feature}`, tomorrow.toISOString());
      setHasIgnoredWarning(true);
    } catch (error) {
      console.error('Erreur sauvegarde warning:', error);
      setHasIgnoredWarning(true); // Allow access anyway
    }
  };

  const refresh = async () => {
    await loadNetworkStats();
    await checkIgnoredWarnings();
  };

  const hasAccess = networkStats.bobContacts >= minNetworkSize || hasIgnoredWarning;
  const showWarning = networkStats.bobContacts < showWarningThreshold && !hasIgnoredWarning;

  return {
    hasAccess,
    showWarning,
    networkStats,
    isLoading,
    ignoreWarning,
    refresh
  };
};

export default useNetworkAccess;