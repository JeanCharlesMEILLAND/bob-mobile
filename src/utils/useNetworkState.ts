// src/utils/useNetworkState.ts - Hook React pour l'état réseau

import { useState, useEffect } from 'react';
import { networkManager, NetworkState } from './network-manager';

export interface UseNetworkStateReturn extends NetworkState {
  // États dérivés
  isOnline: boolean;
  isOffline: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  
  // Actions
  refresh: () => Promise<void>;
  
  // Queue info
  queueInfo: {
    count: number;
    isProcessing: boolean;
  };
}

/**
 * Hook pour surveiller l'état du réseau et de la connectivité
 */
export default function useNetworkState(): UseNetworkStateReturn {
  const [networkState, setNetworkState] = useState<NetworkState>(
    networkManager.getCurrentState()
  );
  const [queueInfo, setQueueInfo] = useState(networkManager.getQueueInfo());

  useEffect(() => {
    // Écouter les changements d'état réseau
    const handleNetworkChange = (newState: NetworkState) => {
      setNetworkState(newState);
    };

    // Écouter les changements de queue
    const updateQueueInfo = () => {
      setQueueInfo(networkManager.getQueueInfo());
    };

    networkManager.on('networkStateChanged', handleNetworkChange);
    networkManager.on('requestFailed', updateQueueInfo);
    
    // Mettre à jour l'info de queue périodiquement
    const queueInterval = setInterval(updateQueueInfo, 5000);

    // Nettoyage
    return () => {
      networkManager.off('networkStateChanged', handleNetworkChange);
      networkManager.off('requestFailed', updateQueueInfo);
      clearInterval(queueInterval);
    };
  }, []);

  // Déterminer la qualité de connexion
  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!networkState.isConnected || !networkState.isInternetReachable) {
      return 'offline';
    }
    
    if (networkState.isWifi) {
      return 'excellent';
    }
    
    if (networkState.isCellular) {
      return 'good';
    }
    
    return 'poor';
  };

  const refresh = async () => {
    // Force une vérification de l'état réseau
    // Cette méthode pourrait être étendue pour faire des tests de connectivité
    const currentState = networkManager.getCurrentState();
    setNetworkState(currentState);
    setQueueInfo(networkManager.getQueueInfo());
  };

  return {
    ...networkState,
    isOnline: networkManager.isOnline,
    isOffline: networkManager.isOffline,
    connectionQuality: getConnectionQuality(),
    refresh,
    queueInfo: {
      count: queueInfo.count,
      isProcessing: queueInfo.isProcessing,
    },
  };
}

/**
 * Hook spécialisé pour les composants qui ont besoin de réagir 
 * aux changements de connectivité
 */
export function useConnectionAwareEffect(
  effect: (isOnline: boolean) => void | (() => void),
  deps: any[] = []
) {
  const { isOnline } = useNetworkState();

  useEffect(() => {
    return effect(isOnline);
  }, [isOnline, ...deps]);
}

/**
 * Hook pour afficher des indicateurs de statut réseau
 */
export function useNetworkStatusIndicator() {
  const { isOnline, connectionQuality, queueInfo } = useNetworkState();

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        color: '#EF4444',
        text: 'Hors ligne',
        icon: '📵',
        showQueue: queueInfo.count > 0,
        queueText: `${queueInfo.count} en attente`
      };
    }

    switch (connectionQuality) {
      case 'excellent':
        return {
          color: '#10B981',
          text: 'Excellente connexion',
          icon: '📶',
          showQueue: false,
        };
      case 'good':
        return {
          color: '#F59E0B',
          text: 'Connexion correcte',
          icon: '📶',
          showQueue: false,
        };
      case 'poor':
        return {
          color: '#EF4444',
          text: 'Connexion faible',
          icon: '📶',
          showQueue: false,
        };
      default:
        return {
          color: '#6B7280',
          text: 'Connexion inconnue',
          icon: '❓',
          showQueue: false,
        };
    }
  };

  return {
    ...getStatusConfig(),
    isOnline,
    connectionQuality,
    queueInfo,
  };
}