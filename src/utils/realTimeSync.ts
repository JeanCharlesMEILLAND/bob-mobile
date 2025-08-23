// src/utils/realTimeSync.ts - Synchronisation temps réel cache ↔ Strapi
import { logger, logSync } from './logger';
import { performanceManager } from './performance';
import { useNotifications } from '../components/common/SmartNotifications';

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'contacts' | 'invitations' | 'groupes';
  data: any;
  localId?: string;
  optimisticUpdate?: boolean;
  timestamp: number;
}

interface SyncState {
  pending: SyncOperation[];
  inProgress: SyncOperation[];
  failed: SyncOperation[];
  lastSync: number;
}

class RealTimeSync {
  private static instance: RealTimeSync;
  private syncState: SyncState = {
    pending: [],
    inProgress: [],
    failed: [],
    lastSync: 0
  };
  
  private syncInProgress = false;
  private syncQueue: (() => Promise<void>)[] = [];
  private subscribers: ((state: SyncState) => void)[] = [];

  static getInstance(): RealTimeSync {
    if (!RealTimeSync.instance) {
      RealTimeSync.instance = new RealTimeSync();
    }
    return RealTimeSync.instance;
  }

  // **SOLUTION PRINCIPALE** : Mise à jour optimiste + sync en arrière-plan
  async optimisticUpdate<T>(
    operation: Omit<SyncOperation, 'id' | 'timestamp'>,
    localUpdateFn: () => T,
    strapiUpdateFn: () => Promise<any>
  ): Promise<T> {
    const opId = `${operation.type}_${operation.table}_${Date.now()}_${Math.random()}`;
    
    // 1. 🚀 MISE À JOUR LOCALE IMMÉDIATE (ce que l'utilisateur voit)
    logSync('Mise à jour optimiste immédiate', { type: operation.type, table: operation.table });
    const localResult = localUpdateFn();

    // 2. 📤 PROGRAMMER LA SYNC STRAPI EN ARRIÈRE-PLAN
    const syncOp: SyncOperation = {
      ...operation,
      id: opId,
      timestamp: Date.now()
    };

    this.addToSyncQueue(syncOp, strapiUpdateFn);

    return localResult;
  }

  // Ajouter une opération à la queue de sync
  private addToSyncQueue(operation: SyncOperation, strapiUpdateFn: () => Promise<any>) {
    this.syncState.pending.push(operation);
    this.notifySubscribers();

    // Programmer l'exécution
    this.syncQueue.push(async () => {
      await this.executeSyncOperation(operation, strapiUpdateFn);
    });

    // Démarrer le processeur de queue si pas déjà en cours
    if (!this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // Traiter la queue de synchronisation
  private async processSyncQueue() {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    logSync('Début traitement queue sync', { pending: this.syncQueue.length });

    while (this.syncQueue.length > 0) {
      const syncFn = this.syncQueue.shift();
      if (syncFn) {
        try {
          await performanceManager.measure('sync_operation', syncFn, 2000);
        } catch (error) {
          logger.error('sync', 'Erreur traitement queue', error);
        }
      }
    }

    this.syncInProgress = false;
    this.syncState.lastSync = Date.now();
    this.notifySubscribers();
    
    logSync('Queue sync terminée');
  }

  // Exécuter une opération de sync
  private async executeSyncOperation(operation: SyncOperation, strapiUpdateFn: () => Promise<any>) {
    try {
      // Déplacer vers inProgress
      this.syncState.pending = this.syncState.pending.filter(op => op.id !== operation.id);
      this.syncState.inProgress.push(operation);
      this.notifySubscribers();

      logSync('Exécution sync Strapi', { 
        type: operation.type, 
        table: operation.table,
        dataSize: JSON.stringify(operation.data).length 
      });

      // Exécuter la sync Strapi
      await strapiUpdateFn();

      // Succès - retirer de inProgress
      this.syncState.inProgress = this.syncState.inProgress.filter(op => op.id !== operation.id);
      
      logSync('Sync Strapi réussie', { type: operation.type, table: operation.table });

    } catch (error) {
      // Échec - déplacer vers failed pour retry
      this.syncState.inProgress = this.syncState.inProgress.filter(op => op.id !== operation.id);
      this.syncState.failed.push({ ...operation, error });
      
      logger.error('sync', 'Échec sync Strapi', { 
        operation: operation.type,
        table: operation.table,
        error 
      });

      // Programmer un retry dans 5 secondes
      setTimeout(() => {
        this.retryFailedOperation(operation.id);
      }, 5000);
    }

    this.notifySubscribers();
  }

  // Retry automatique des opérations échouées
  private async retryFailedOperation(operationId: string) {
    const failedOp = this.syncState.failed.find(op => op.id === operationId);
    if (!failedOp) return;

    logger.info('sync', 'Retry opération échouée', { id: operationId });
    
    // Remettre en pending pour nouveau try
    this.syncState.failed = this.syncState.failed.filter(op => op.id !== operationId);
    this.syncState.pending.push(failedOp);
    
    if (!this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  // **MÉTHODES PRATIQUES POUR L'APP BOB**

  // Ajouter contact au répertoire en temps réel
  async addContactToRepertoire(
    contact: any,
    localAddFn: () => void,
    strapiAddFn: () => Promise<any>
  ) {
    return this.optimisticUpdate(
      {
        type: 'create',
        table: 'contacts',
        data: contact
      },
      localAddFn,
      strapiAddFn
    );
  }

  // Supprimer contact du répertoire en temps réel
  async removeContactFromRepertoire(
    contactId: string,
    localRemoveFn: () => void,
    strapiRemoveFn: () => Promise<any>
  ) {
    return this.optimisticUpdate(
      {
        type: 'delete',
        table: 'contacts',
        data: { id: contactId }
      },
      localRemoveFn,
      strapiRemoveFn
    );
  }

  // Envoyer invitation en temps réel
  async sendInvitation(
    invitation: any,
    localAddFn: () => void,
    strapiSendFn: () => Promise<any>
  ) {
    return this.optimisticUpdate(
      {
        type: 'create',
        table: 'invitations',
        data: invitation
      },
      localAddFn,
      strapiSendFn
    );
  }

  // **MÉTHODES DE MONITORING**

  // S'abonner aux changements d'état de sync
  subscribe(callback: (state: SyncState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.syncState);
    
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback({ ...this.syncState }));
  }

  // Obtenir l'état de sync
  getState(): SyncState {
    return { ...this.syncState };
  }

  // Forcer une sync complète
  async forcePullFromStrapi(pullFn: () => Promise<void>) {
    logSync('Sync forcée depuis Strapi');
    
    try {
      await performanceManager.measure('force_sync_pull', pullFn, 3000);
      this.syncState.lastSync = Date.now();
      this.notifySubscribers();
    } catch (error) {
      logger.error('sync', 'Erreur sync forcée', error);
      throw error;
    }
  }

  // Stats de performance
  getStats() {
    return {
      pendingOps: this.syncState.pending.length,
      failedOps: this.syncState.failed.length,
      lastSyncAgo: Date.now() - this.syncState.lastSync,
      isInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length
    };
  }
}

// Instance singleton
export const realTimeSync = RealTimeSync.getInstance();

// Hook React pour utiliser la sync temps réel
import React from 'react';

export const useRealTimeSync = () => {
  const [syncState, setSyncState] = React.useState<SyncState>(realTimeSync.getState());

  React.useEffect(() => {
    return realTimeSync.subscribe(setSyncState);
  }, []);

  return {
    syncState,
    addContact: realTimeSync.addContactToRepertoire.bind(realTimeSync),
    removeContact: realTimeSync.removeContactFromRepertoire.bind(realTimeSync),
    sendInvitation: realTimeSync.sendInvitation.bind(realTimeSync),
    forcePull: realTimeSync.forcePullFromStrapi.bind(realTimeSync),
    stats: realTimeSync.getStats()
  };
};