// src/hooks/contacts/useContactsActions.ts - Hook pour toutes les actions sur les contacts

import { useCallback, useMemo } from 'react';
import { ContactsManager } from '../../services/contacts/ContactsManager';
import { Contact, ImportResult, SyncResult } from '../../types/contacts.unified';
import { useNotifications } from '../../components/common/SmartNotifications';

export interface UseContactsActionsReturn {
  // Actions principales
  scanPhoneContacts: () => Promise<ImportResult>;
  importAllContacts: () => Promise<ImportResult>;
  importSelectedContacts: (identifiers: string[], options?: { silent?: boolean, onComplete?: () => Promise<void> }) => Promise<ImportResult>;
  inviteContact: (telephone: string, method?: 'sms' | 'whatsapp') => Promise<void>;
  removeContact: (identifier: string) => Promise<void>;
  
  // Synchronisation
  syncToStrapi: (contacts?: Contact[]) => Promise<SyncResult>;
  detectBobUsers: (contacts?: Contact[]) => Promise<void>;
  
  // Nettoyage et maintenance
  deleteAllFromStrapi: () => Promise<number>;
  clearAllData: () => Promise<void>;
  blockSync: () => void;
  unblockSync: () => void;
  
  // États
  isSyncBlocked: boolean;
  
  // Utilitaires
  refreshData: () => Promise<void>;
  getDebugInfo: () => Promise<any>;
}

export const useContactsActions = (): UseContactsActionsReturn => {
  const manager = useMemo(() => ContactsManager.getInstance(), []);
  const notifications = useNotifications();

  // === ACTIONS PRINCIPALES ===

  const scanPhoneContacts = useCallback(async (): Promise<ImportResult> => {
    try {
      console.log('📱 Action: Scan du téléphone...');
      const result = await manager.scanPhoneContacts();
      console.log(`✅ Scan terminé: ${result.total} contacts trouvés`);
      return {
        imported: result.total,
        skipped: 0,
        errors: result.errors,
        total: result.total
      };
    } catch (error) {
      console.error('❌ Erreur scan téléphone:', error);
      return {
        imported: 0,
        skipped: 0,
        errors: [(error as Error).message],
        total: 0
      };
    }
  }, [manager]);

  const importAllContacts = useCallback(async (): Promise<ImportResult> => {
    try {
      console.log('📥 Action: Import complet...');
      return await manager.importAllPhoneContacts();
    } catch (error) {
      console.error('❌ Erreur import complet:', error);
      return {
        imported: 0,
        skipped: 0,
        errors: [(error as Error).message],
        total: 0
      };
    }
  }, [manager]);

  const importSelectedContacts = useCallback(async (identifiers: string[], options?: { silent?: boolean, onComplete?: () => Promise<void>, onProgress?: (current: number, total: number) => void }): Promise<ImportResult> => {
    try {
      console.log(`📥 Action: Import sélectif de ${identifiers.length} contacts...`);
      
      // 🚀 ULTRA-RAPIDE: Si plus de 500 contacts, utiliser l'import bulk en 1 seul appel
      if (identifiers.length >= 500) {
        console.log(`🚀 ULTRA-RAPIDE activé: Import de ${identifiers.length} contacts en 1 seul appel !`);
        
        try {
          const startTime = Date.now();
          
          // Callback de progression au début
          if (options?.onProgress) {
            options.onProgress(0, identifiers.length);
          }
          
          // 🚀 UN SEUL APPEL POUR TOUT !
          const result = await manager.importContactsToRepertoireUltraFast(identifiers);
          
          const duration = Date.now() - startTime;
          console.log(`✅ Import ULTRA-RAPIDE terminé en ${duration}ms (${Math.round(identifiers.length / (duration / 1000))} contacts/sec)`);
          
          // Callback de progression à la fin
          if (options?.onProgress) {
            options.onProgress(identifiers.length, identifiers.length);
          }
          
          // Notification de succès
          if (!options?.silent) {
            notifications.success(
              '🚀 Import ULTRA-RAPIDE terminé !',
              `${result.imported} contacts importés en ${Math.round(duration / 1000)}s`,
              { 
                category: 'contact_import',
                duration: 4000
              }
            );
          }
          
          // Callback de fin
          if (options?.onComplete) {
            try {
              await options.onComplete();
            } catch (error) {
              console.warn('⚠️ Erreur callback onComplete:', error);
            }
          }
          
          return result;
          
        } catch (error) {
          console.warn('⚠️ Import ultra-rapide échoué, fallback vers batches:', error);
          // Continuer avec l'ancienne méthode si ça échoue
        }
      }
      
      // 🚀 OPTIMISATION: Batches beaucoup plus gros pour les imports normaux
      let BATCH_SIZE = Math.min(2000, Math.max(1000, Math.floor(identifiers.length / 2))); // Adaptatif: 1000-2000 selon volume
      console.log(`📦 Taille de batch calculée: ${BATCH_SIZE} (pour ${identifiers.length} contacts)`);
      const totalBatches = Math.ceil(identifiers.length / BATCH_SIZE);
      let totalImported = 0;
      let totalSkipped = 0;
      let totalErrors: string[] = [];
      
      console.log(`📦 Import par batches: ~${totalBatches} batches de taille adaptative`);
      
      let processedCount = 0;
      let batchIndex = 0;
      
      while (processedCount < identifiers.length) {
        const remainingCount = identifiers.length - processedCount;
        const currentBatchSize = Math.min(BATCH_SIZE, remainingCount);
        const batchIds = identifiers.slice(processedCount, processedCount + currentBatchSize);
        
        console.log(`📦 Batch ${batchIndex + 1}: Traitement ${currentBatchSize} contacts (${processedCount + 1} à ${processedCount + currentBatchSize})`);
        
        const batchStart = Date.now();
        try {
          // 🚀 UTILISER L'IMPORT ULTRA-RAPIDE pour les très gros batches
          const batchResult = currentBatchSize >= 1000 
            ? await manager.importContactsToRepertoireUltraFast(batchIds)
            : await manager.importContactsToRepertoire(batchIds);
          const batchDuration = Date.now() - batchStart;
          
          // 🚨 SÉCURITÉ: Vérifier que le résultat n'est pas null/undefined
          if (!batchResult) {
            console.warn(`⚠️ Batch ${batchIndex + 1} ignoré (opération en cours)`);
            // ✅ IMPORTANT: Mettre à jour la progression même si batch ignoré
            processedCount += currentBatchSize;
            if (options?.onProgress) {
              options.onProgress(processedCount, identifiers.length);
            }
            // Attendre un peu avant le prochain batch
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue; // Passer au batch suivant
          }
          
          // 📊 Adaptation dynamique de la taille selon la performance - SEUILS TRÈS ÉLEVÉS
          if (batchDuration < 10000 && BATCH_SIZE < 3000) { // Si < 10s et taille < 3000
            BATCH_SIZE = Math.min(3000, Math.floor(BATCH_SIZE * 2)); // Doubler si très rapide
            console.log(`🚀 Batch très rapide (${batchDuration}ms), doublement taille à ${BATCH_SIZE}`);
          } else if (batchDuration > 45000 && BATCH_SIZE > 200) { // Si > 45s et taille > 200
            BATCH_SIZE = Math.max(200, Math.floor(BATCH_SIZE * 0.6)); // Réduire de 40%
            console.log(`🐌 Batch lent (${batchDuration}ms), réduction taille à ${BATCH_SIZE}`);
          }
          
          totalImported += batchResult.imported || 0;
          totalSkipped += batchResult.skipped || 0;
          totalErrors = [...totalErrors, ...(batchResult.errors || [])];
          
          processedCount += currentBatchSize;
          
          // 📊 Callback de progression
          if (options?.onProgress) {
            options.onProgress(processedCount, identifiers.length);
          }
          
          console.log(`✅ Batch ${batchIndex + 1} terminé: +${batchResult.imported || 0} importés, +${batchResult.skipped || 0} ignorés (${batchDuration}ms)`);
          
          // 🔄 Petit délai entre les batches (adaptatif selon la performance)
          if (processedCount < identifiers.length) { 
            const delayMs = batchDuration > 15000 ? 1000 : 300; // Plus de délai si batch lent
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
          
        } catch (batchError) {
          console.error(`❌ Erreur batch ${batchIndex + 1}:`, batchError);
          totalErrors.push(`Batch ${batchIndex + 1}: ${(batchError as Error).message}`);
          
          // ✅ IMPORTANT: Mettre à jour la progression même en cas d'erreur
          processedCount += currentBatchSize;
          if (options?.onProgress) {
            options.onProgress(processedCount, identifiers.length);
          }
        }
        
        batchIndex++;
      }
      
      const result = {
        imported: totalImported,
        skipped: totalSkipped,
        errors: totalErrors,
        total: identifiers.length
      };
      
      // Notifications seulement si pas en mode silencieux
      if (!options?.silent) {
        // Notification de succès basée sur les résultats
        if (result.imported > 0) {
          notifications.success(
            'Contacts importés',
            `${result.imported} contact${result.imported > 1 ? 's' : ''} ajouté${result.imported > 1 ? 's' : ''} à votre répertoire`,
            { 
              category: 'contact_import',
              duration: 3000
            }
          );
        }
        
        // Notification d'avertissement si des contacts ont été ignorés
        if (result.skipped > 0) {
          notifications.warning(
            'Contacts ignorés',
            `${result.skipped} contact${result.skipped > 1 ? 's' : ''} déjà présent${result.skipped > 1 ? 's' : ''}`,
            { 
              category: 'contact_import',
              duration: 2000
            }
          );
        }
      }
      
      // Callback optionnel pour mettre à jour les stats
      if (options?.onComplete) {
        try {
          await options.onComplete();
        } catch (error) {
          console.warn('⚠️ Erreur callback onComplete:', error);
        }
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur import sélectif:', error);
      
      // Notification d'erreur
      notifications.error(
        'Erreur d\'importation',
        `Impossible d'importer les contacts sélectionnés`,
        {
          category: 'contact_import',
          duration: 4000,
          action: {
            label: 'Réessayer',
            onPress: () => importSelectedContacts(identifiers)
          }
        }
      );
      
      return {
        imported: 0,
        skipped: identifiers.length,
        errors: [(error as Error).message],
        total: identifiers.length
      };
    }
  }, [manager, notifications]);

  const inviteContact = useCallback(async (telephone: string, method: 'sms' | 'whatsapp' = 'sms'): Promise<void> => {
    try {
      console.log(`📤 Action: Invitation contact ${telephone}...`);
      await manager.inviteContact(telephone, method);
      console.log(`✅ Invitation envoyée: ${telephone}`);
      
      // Notification de succès
      notifications.success(
        'Invitation envoyée',
        `Invitation Bob envoyée au ${telephone}`,
        { 
          category: 'invitation',
          duration: 3000
        }
      );
      
    } catch (error) {
      console.error(`❌ Erreur invitation ${telephone}:`, error);
      
      // Notification d'erreur
      notifications.error(
        'Erreur d\'invitation',
        `Impossible d'envoyer l'invitation au ${telephone}`,
        {
          category: 'invitation',
          duration: 4000,
          action: {
            label: 'Réessayer',
            onPress: () => inviteContact(telephone, method)
          }
        }
      );
      
      throw error;
    }
  }, [manager, notifications]);

  const removeContact = useCallback(async (identifier: string): Promise<void> => {
    try {
      console.log(`🗑️ Action: Suppression contact ${identifier}...`);
      
      // 🔧 FIX: Identifier peut être soit un ID, soit un téléphone
      let contact = null;
      
      // D'abord essayer par téléphone (si ça ressemble à un numéro)
      if (identifier.startsWith('+') || /^\d+$/.test(identifier)) {
        contact = await manager.repository.getByPhone(identifier);
        console.log(`🔍 Recherche par téléphone: ${contact ? 'trouvé' : 'non trouvé'}`);
      }
      
      // Si pas trouvé, essayer par ID
      if (!contact) {
        const allContacts = await manager.repository.getAll();
        contact = allContacts.find(c => c.id === identifier);
        console.log(`🔍 Recherche par ID: ${contact ? 'trouvé' : 'non trouvé'}`);
      }
      
      if (!contact) {
        console.warn(`⚠️ Contact ${identifier} introuvable (ni par téléphone ni par ID)`);
        return;
      }

      console.log(`📋 Contact trouvé:`, {
        nom: contact.nom,
        telephone: contact.telephone,
        source: contact.source,
        id: contact.id,
        strapiId: contact.strapiId,
        documentId: (contact as any).documentId,
        hasStrapiId: !!contact.strapiId,
        syncBlocked: manager.isSyncBlockedStatus()
      });

      // 1. Supprimer de Strapi si nécessaire (même sans strapiId local, on essaie via téléphone)
      if (!manager.isSyncBlockedStatus()) {
        try {
          // Import des services nécessaires  
          const { apiClient } = await import('../../services/api');
          const { authService } = await import('../../services/auth.service');
          const token = await authService.getValidToken();
          
          if (!token) {
            console.warn('⚠️ Pas de token pour suppression Strapi');
            return;
          }
          
          // 🔧 FIX Strapi v5: Récupérer le vrai documentId depuis Strapi (comme suppression en masse)
          let realDocumentId = null;
          let strapiContact = null;
          
          try {
            // 1. Rechercher le contact sur Strapi par téléphone pour obtenir son vrai documentId
            console.log(`🔍 Recherche du contact sur Strapi par téléphone: ${contact.telephone}`);
            
            // Essayer plusieurs variantes du téléphone
            const phoneVariants = [
              contact.telephone,
              contact.telephone?.replace(/\s/g, ''), // Sans espaces
              contact.telephone?.replace(/[^\d+]/g, ''), // Seulement + et chiffres
              contact.telephone?.replace(/[\s\-\.()]/g, ''), // Sans espaces, tirets, points, parenthèses
              // Variantes françaises
              contact.telephone?.replace(/^(\+33)/, '0'), // +33 -> 0
              contact.telephone?.replace(/^0/, '+33'), // 0 -> +33
              // Variantes génériques (enlever le +)
              contact.telephone?.replace(/^\+/, ''), // +48531151108 -> 48531151108
              // Variantes avec 00 au lieu de +
              contact.telephone?.replace(/^\+/, '00'), // +48531151108 -> 0048531151108
            ].filter((phone, index, arr) => phone && phone.length > 5 && arr.indexOf(phone) === index); // Filtrer et dédupliquer
            
            console.log(`🔍 Variants générés:`, phoneVariants);
            
            for (const phoneVariant of phoneVariants) {
              console.log(`🔍 Tentative recherche avec: ${phoneVariant}`);
              const searchResponse = await apiClient.get(`/contacts?filters[telephone][$eq]=${encodeURIComponent(phoneVariant)}`, token);
              
              if (searchResponse.ok) {
                const searchData = await searchResponse.json();
                strapiContact = searchData.data?.[0];
                if (strapiContact) {
                  console.log(`✅ Contact trouvé avec variant: ${phoneVariant}`);
                  break;
                }
              }
            }
            
            if (strapiContact) {
              realDocumentId = strapiContact.documentId || strapiContact.id;
              console.log(`✅ Contact trouvé sur Strapi:`, {
                nom: strapiContact.nom,
                documentId: strapiContact.documentId,
                id: strapiContact.id,
                realDocumentId: realDocumentId
              });
            } else {
              // Fallback: rechercher par nom si téléphone échoue
              console.log(`🔍 Fallback: recherche par nom: ${contact.nom}`);
              try {
                // Essayer plusieurs approches de recherche par nom
                const nameSearches = [
                  `/contacts?filters[nom][$containsi]=${encodeURIComponent(contact.nom)}`,
                  `/contacts?filters[prenom][$containsi]=${encodeURIComponent(contact.nom)}`,
                  // Chercher par nom complet (nom + prenom)
                  `/contacts?filters[$or][0][nom][$containsi]=${encodeURIComponent(contact.nom.split(' ')[0])}&filters[$or][1][prenom][$containsi]=${encodeURIComponent(contact.nom.split(' ')[1] || '')}`,
                ];
                
                for (const searchUrl of nameSearches) {
                  console.log(`🔍 Recherche par nom avec: ${searchUrl}`);
                  const nameSearchResponse = await apiClient.get(searchUrl, token);
                  
                  if (nameSearchResponse.ok) {
                    const nameSearchData = await nameSearchResponse.json();
                    console.log(`📊 Résultats recherche nom: ${nameSearchData.data?.length || 0} contacts trouvés`);
                    
                    // Chercher une correspondance exacte ou proche
                    strapiContact = nameSearchData.data?.find((c: any) => {
                      const fullNameLocal = contact.nom?.toLowerCase();
                      const fullNameStrapi1 = (c.nom + ' ' + c.prenom)?.toLowerCase();
                      const fullNameStrapi2 = (c.prenom + ' ' + c.nom)?.toLowerCase();
                      
                      return c.nom?.toLowerCase() === fullNameLocal ||
                             c.prenom?.toLowerCase() === fullNameLocal ||
                             fullNameStrapi1 === fullNameLocal ||
                             fullNameStrapi2 === fullNameLocal ||
                             fullNameLocal?.includes(c.nom?.toLowerCase()) ||
                             fullNameLocal?.includes(c.prenom?.toLowerCase());
                    });
                    
                    if (strapiContact) {
                      realDocumentId = strapiContact.documentId || strapiContact.id;
                      console.log(`✅ Contact trouvé par nom sur Strapi:`, {
                        nom: strapiContact.nom,
                        prenom: strapiContact.prenom,
                        telephone: strapiContact.telephone,
                        documentId: strapiContact.documentId,
                        realDocumentId: realDocumentId
                      });
                      break; // Sortir de la boucle si trouvé
                    }
                  }
                }
              } catch (nameError) {
                console.warn('⚠️ Erreur recherche par nom:', nameError);
              }
              
              if (!strapiContact) {
                console.log(`ℹ️ Contact introuvable sur Strapi (téléphone ET nom), tentative avec ID local`);
                // En dernier recours, essayer avec l'ID local
                realDocumentId = (contact as any).documentId || contact.strapiId || contact.id;
                console.log(`⚠️ Utilisation ID local comme fallback: ${realDocumentId}`);
              }
            }
            
          } catch (searchError) {
            console.warn(`⚠️ Erreur recherche contact:`, searchError);
            realDocumentId = (contact as any).documentId || contact.strapiId || contact.id;
          }
          
          console.log(`🔗 Tentative suppression Strapi v5:`, {
            contactLocal: contact.nom,
            localId: contact.id,
            strapiId: contact.strapiId, 
            documentId: (contact as any).documentId,
            realDocumentId: realDocumentId,
            telephone: contact.telephone
          });
          
          console.log(`🌐 API DELETE: /contacts/${realDocumentId}`);
          const response = await apiClient.delete(`/contacts/${realDocumentId}`, token);
          
          console.log(`📊 Réponse DELETE complète:`, {
            url: `/contacts/${realDocumentId}`,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: response.headers
          });
          
          if (response.ok) {
            console.log(`✅ Contact supprimé de Strapi: ${contact.nom}`);
            
            // 🔍 VÉRIFICATION: Relancer une recherche pour confirmer la suppression
            setTimeout(async () => {
              try {
                const verifyResponse = await apiClient.get('/contacts?pagination[limit]=100', token);
                if (verifyResponse.ok) {
                  const verifyData = await verifyResponse.json();
                  const stillExists = verifyData.data.find((sc: any) => sc.telephone === contact.telephone);
                  
                  if (stillExists) {
                    console.warn(`🚨 PROBLÈME: Contact ${contact.nom} existe toujours dans Strapi après suppression!`, stillExists);
                  } else {
                    console.log(`✅ CONFIRMÉ: Contact ${contact.nom} bien supprimé de Strapi`);
                  }
                }
              } catch (error) {
                console.error('❌ Erreur vérification suppression:', error);
              }
            }, 2000); // Attendre 2s pour éviter problèmes de cache
            
          } else {
            console.warn(`⚠️ Échec suppression Strapi ${response.status}: ${contact.nom}`);
            
            // Lire le body de l'erreur pour plus d'infos
            try {
              const errorBody = await response.text();
              console.error(`📋 Détails erreur Strapi:`, errorBody);
              
              // Si 404 et on avait un vrai documentId, c'est étrange
              if (response.status === 404) {
                if (strapiContact) {
                  console.warn(`🚨 Contact était trouvé sur Strapi mais suppression 404 - cache désynchronisé?`);
                } else {
                  console.log(`ℹ️ 404 avec ID local - contact probablement déjà supprimé`);
                }
              }
            } catch (e) {
              console.warn('Impossible de lire le body de l\'erreur');
            }
          }
        } catch (strapiError) {
          console.warn(`⚠️ Erreur suppression Strapi pour ${contact.nom}:`, strapiError);
        }
      } else {
        console.log(`🔍 Suppression Strapi ignorée:`, {
          reason: 'Sync bloquée', 
          strapiId: contact.strapiId,
          syncBlocked: manager.isSyncBlockedStatus()
        });
      }

      // 2. Supprimer localement
      await manager.repository.remove(contact.telephone);
      console.log(`✅ Contact supprimé localement: ${contact.nom}`);

      // 3. Notification de succès
      notifications.success(
        'Contact supprimé',
        `${contact.nom} a été retiré de votre répertoire Bob`,
        { 
          category: 'contact_deletion',
          duration: 3000
        }
      );

    } catch (error) {
      console.error(`❌ Erreur suppression ${identifier}:`, error);
      
      // Notification d'erreur
      notifications.error(
        'Erreur de suppression',
        `Impossible de supprimer ${contact?.nom || identifier}. Veuillez réessayer.`,
        {
          category: 'contact_deletion',
          duration: 5000,
          action: {
            label: 'Réessayer',
            onPress: () => removeContact(identifier)
          }
        }
      );
      
      throw error;
    }
  }, [manager, notifications]);

  // === SYNCHRONISATION ===

  const syncToStrapi = useCallback(async (contacts?: Contact[]): Promise<SyncResult> => {
    try {
      console.log('🔄 Action: Synchronisation Strapi...');
      return await manager.syncToStrapi(contacts);
    } catch (error) {
      console.error('❌ Erreur sync Strapi:', error);
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: [(error as Error).message]
      };
    }
  }, [manager]);

  const detectBobUsers = useCallback(async (contacts?: Contact[]): Promise<void> => {
    try {
      console.log('🔎 Action: Détection utilisateurs Bob...');
      await manager.detectBobUsers(contacts);
      console.log('✅ Détection Bob terminée');
    } catch (error) {
      console.error('❌ Erreur détection Bob:', error);
      throw error;
    }
  }, [manager]);

  // === NETTOYAGE ET MAINTENANCE ===

  const deleteAllFromStrapi = useCallback(async (): Promise<number> => {
    try {
      console.log('🧹 Action: Suppression complète Strapi...');
      return await manager.deleteAllFromStrapi();
    } catch (error) {
      console.error('❌ Erreur suppression Strapi:', error);
      throw error;
    }
  }, [manager]);

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      console.log('🧹 Action: Nettoyage complet...');
      await manager.clearAllData();
      console.log('✅ Nettoyage complet terminé');
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      throw error;
    }
  }, [manager]);

  const blockSync = useCallback(() => {
    console.log('🚫 Action: Blocage synchronisation...');
    manager.blockSync();
  }, [manager]);

  const unblockSync = useCallback(() => {
    console.log('🔓 Action: Déblocage synchronisation...');
    manager.unblockSync();
  }, [manager]);

  // === UTILITAIRES ===

  const refreshData = useCallback(async (): Promise<void> => {
    try {
      console.log('🔄 Action: Rafraîchissement des données...');
      // Forcer le rechargement des données depuis le cache sans vider
      // Les observers se chargeront de notifier les composants
      await manager.repository.ensureLoaded();
      console.log(`✅ Données rafraîchies depuis le cache`);
    } catch (error) {
      console.error('❌ Erreur rafraîchissement:', error);
      throw error;
    }
  }, [manager]);

  const getDebugInfo = useCallback(async (): Promise<any> => {
    return await manager.getDebugInfo();
  }, [manager]);

  return {
    // Actions principales
    scanPhoneContacts,
    importAllContacts,
    importSelectedContacts,
    inviteContact,
    removeContact,
    
    // Synchronisation
    syncToStrapi,
    detectBobUsers,
    
    // Nettoyage et maintenance
    deleteAllFromStrapi,
    clearAllData,
    blockSync,
    unblockSync,
    
    // États
    isSyncBlocked: manager.isSyncBlockedStatus(),
    
    // Utilitaires
    refreshData,
    getDebugInfo
  };
};