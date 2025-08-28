// src/services/contacts/ContactsManager.ts - Gestionnaire central unifié

import { ContactsRepository } from './ContactsRepository';
import { ContactsSync } from './ContactsSync';
import { ContactsScanner } from './ContactsScanner';
import { contactsService } from '../contacts.service';
import { authService } from '../auth.service';
import { invitationsService } from '../invitations.service';
import { apiClient } from '../api';
import { 
  Contact, 
  ContactsStats, 
  ImportResult, 
  SyncResult,
  ScanResult,
  CONTACTS_CONFIG 
} from '../../types/contacts.unified';

export class ContactsManager {
  private static instance: ContactsManager;
  
  readonly repository: ContactsRepository;
  private readonly contactsSync: ContactsSync;
  private readonly contactsScanner: ContactsScanner;
  private isSyncBlocked = false;
  private isOperationInProgress = false;
  private isBatchMode = false; // 🚀 OPTIMISATION: Mode batch pour limiter les recalculs

  private constructor() {
    this.repository = new ContactsRepository();
    this.contactsSync = new ContactsSync(this.repository);
    this.contactsScanner = new ContactsScanner();
  }

  static getInstance(): ContactsManager {
    if (!ContactsManager.instance) {
      ContactsManager.instance = new ContactsManager();
    }
    return ContactsManager.instance;
  }

  // === GESTION DES OPÉRATIONS ===

  private async withOperation<T>(operation: () => Promise<T>, defaultResult?: T): Promise<T> {
    if (this.isOperationInProgress) {
      console.warn('⚠️ Opération ignorée - Une synchronisation est déjà en cours');
      // Retourner un résultat par défaut sécurisé
      if (defaultResult !== undefined) {
        return Promise.resolve(defaultResult);
      }
      // Pour les ImportResult, retourner une structure vide valide
      return Promise.resolve({ imported: 0, skipped: 0, errors: [], total: 0 } as any);
    }

    this.isOperationInProgress = true;
    try {
      return await operation();
    } finally {
      this.isOperationInProgress = false;
    }
  }

  // === MODE BATCH POUR OPTIMISATION ===
  
  enableBatchMode(): void {
    console.log('🔒 BATCH MODE: Activation - Listeners désactivés');
    this.isBatchMode = true;
  }

  disableBatchMode(): void {
    console.log('🔓 BATCH MODE: Désactivation - Listeners réactivés');
    this.isBatchMode = false;
  }

  isBatchModeActive(): boolean {
    return this.isBatchMode;
  }

  async withBatchMode<T>(operation: () => Promise<T>): Promise<T> {
    this.enableBatchMode();
    try {
      const result = await operation();
      // Recalcul unique des stats à la fin
      await this.repository.notifyChange('bulk_update');
      return result;
    } finally {
      this.disableBatchMode();
    }
  }

  // === SCAN DU TÉLÉPHONE ===

  async scanPhoneContacts(): Promise<ScanResult> {
    return this.withOperation(async () => {
      console.log('📱 Délégation scan vers ContactsScanner...');
      
      const scanResult = await this.contactsScanner.scanPhoneContacts();
      
      // Sauvegarder les contacts dans le repository s'il y en a
      if (scanResult.contacts.length > 0) {
        await this.repository.addMany(scanResult.contacts);
        console.log(`✅ ${scanResult.contacts.length} contacts ajoutés au repository`);
      }
      
      return scanResult;
    });
  }

  // === IMPORT DANS LE RÉPERTOIRE BOB ===

  async importContactsToRepertoireUltraFast(identifiers: string[]): Promise<ImportResult> {
    return this.withOperation(async () => {
      console.log(`🚀 ULTRA-FAST Import de ${identifiers.length} contacts...`);
      
      const contacts = await this.repository.getAllPhoneContacts();
      
      // Trouver les contacts à importer
      const contactsToImport = identifiers.map(identifier => {
        return contacts.find(contact => {
          // Si c'est un téléphone (commence par +)
          if (identifier.startsWith('+')) {
            return contact.telephone === identifier;
          }
          // Si c'est un ID de contact
          return contact.id === identifier;
        });
      }).filter(Boolean); // Supprimer les undefined
      
      console.log(`🔍 Contacts trouvés à importer: ${contactsToImport.length}/${identifiers.length}`);
      
      if (contactsToImport.length === 0) {
        return { imported: 0, skipped: identifiers.length, errors: [], total: identifiers.length };
      }
      
      try {
        const token = await authService.getValidToken();
        if (!token) throw new Error('Token manquant');
        
        // 🚀 PRÉPARER TOUTES LES DONNÉES EN 1 FOIS
        const contactsData = contactsToImport.map(contact => ({
          nom: contact.nom || 'Contact',
          prenom: contact.prenom || '',
          telephone: contact.telephone || '',
          email: contact.email || null,
          source: 'import_repertoire'
        }));
        
        console.log(`📤 Import ULTRA-RAPIDE de ${contactsData.length} contacts vers Strapi...`);
        const startTime = Date.now();
        
        // 🚀 UN SEUL APPEL API POUR TOUT !
        const createdContacts = await contactsService.createContactsBulkSingle(contactsData, token);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Import ULTRA-RAPIDE terminé en ${duration}ms (${Math.round(contactsData.length / (duration / 1000))} contacts/sec)`);
        
        // 📝 Mettre à jour le cache local
        for (let i = 0; i < contactsToImport.length; i++) {
          const localContact = contactsToImport[i];
          const strapiContact = createdContacts[i];
          
          if (strapiContact) {
            const repertoireContact: Contact = {
              ...localContact,
              id: strapiContact.documentId || strapiContact.id,
              strapiId: strapiContact.id?.toString(),
              documentId: strapiContact.documentId,
              source: 'repertoire',
              dateImport: new Date().toISOString()
            };
            
            await this.repository.update(localContact.telephone, repertoireContact, true);
          }
        }
        
        // 💾 Sauvegarder le cache une seule fois
        await this.repository.forceSaveToCache();
        
        return {
          imported: createdContacts.length,
          skipped: identifiers.length - createdContacts.length,
          errors: [],
          total: identifiers.length
        };
        
      } catch (error) {
        console.error('❌ Erreur import ultra-fast:', error);
        
        // 🔄 FALLBACK: Utiliser l'ancienne méthode si l'API bulk échoue
        console.log('🔄 Fallback vers import par batches...');
        return await this.importContactsToRepertoire(identifiers);
      }
    });
  }

  async importContactsToRepertoire(identifiers: string[]): Promise<ImportResult> {
    return this.withOperation(async () => {
      console.log(`📥 Import de ${identifiers.length} contacts dans le répertoire...`);
      
      const phoneContacts = await this.repository.getPhoneContacts();
      
      // 🔧 FIX: Support des IDs de contacts ET des téléphones
      const contactsToImport = phoneContacts.filter(contact => {
        return identifiers.some(identifier => {
          // Si c'est un téléphone (commence par +)
          if (identifier.startsWith('+')) {
            return contact.telephone === identifier;
          }
          // Si c'est un ID de contact
          return contact.id === identifier;
        });
      });
      
      console.log(`🔍 Contacts trouvés à importer: ${contactsToImport.length}/${identifiers.length}`);
      
      // 🚀 OPTIMISATION: Utiliser le batch mode pour éviter les recalculs multiples
      return await this.withBatchMode(async () => {
        let imported = 0;
        let errors: string[] = [];

        for (const contact of contactsToImport) {
          try {
            // Convertir en contact répertoire
            const repertoireContact: Contact = {
              ...contact,
              source: 'repertoire',
              aSurBob: undefined, // Sera déterminé par la détection Bob
              dateImport: new Date().toISOString()
            };

            await this.repository.update(contact.telephone, repertoireContact, true); // 🚀 skipCache = true
            imported++;

          } catch (error) {
            errors.push(`Erreur import ${contact.nom}: ${error.message}`);
          }
        }

        // 🚀 OPTIMISATION: Sauvegarder le cache une seule fois
        console.log('💾 Sauvegarde batch du cache après import...');
        await this.repository.forceSaveToCache();
        console.log('✅ Cache sauvegardé');

        // 🚫 DÉSACTIVÉ TEMPORAIREMENT: Pas de sync automatique pour éviter les conflits
        // La sync sera faite manuellement après tous les batches
        console.log('🔄 Sync automatique désactivée - sera faite manuellement après import complet');

        return {
          imported,
          skipped: identifiers.length - imported,
          errors,
          total: identifiers.length
        };
      });
    });
  }

  // === SYNCHRONISATION STRAPI ===

  async syncToStrapi(contacts?: Contact[]): Promise<SyncResult> {
    if (this.isSyncBlocked) {
      console.warn('🚫 Synchronisation bloquée');
      return { success: false, created: 0, updated: 0, failed: 0, errors: ['Synchronisation bloquée'] };
    }

    return this.withOperation(async () => {
      const contactsToSync = contacts || await this.repository.getRepertoireContacts();
      console.log(`🔄 Délégation sync vers ContactsSync: ${contactsToSync.length} contacts`);
      
      return await this.contactsSync.syncToStrapi(contactsToSync, {
        batchSize: CONTACTS_CONFIG.syncBatchSize,
        forceSync: false
      });
    });
  }


  private async syncToStrapiBackground(contacts: Contact[]): Promise<void> {
    try {
      await this.syncToStrapi(contacts);
      console.log(`✅ Sync arrière-plan terminée: ${contacts.length} contacts`);
    } catch (error) {
      console.error('❌ Erreur sync arrière-plan:', error);
    }
  }

  // === INVITATIONS ===

  async inviteContact(telephoneOrId: string, method: 'sms' | 'whatsapp' = 'sms'): Promise<void> {
    console.log(`🔍 ContactsManager.inviteContact - Recherche contact: ${telephoneOrId}`);
    
    // Essayer de trouver par téléphone d'abord
    let contact = await this.repository.getByPhone(telephoneOrId);
    
    // Si pas trouvé et que ça ressemble à un ID de téléphone, chercher par ID
    if (!contact && telephoneOrId.includes(':ABPerson')) {
      console.log(`🔄 Recherche par ID de contact téléphone: ${telephoneOrId}`);
      const allContacts = await this.repository.getAll();
      contact = allContacts.find(c => c.id === telephoneOrId);
    }
    
    if (!contact) {
      console.error(`❌ Contact introuvable dans repository: ${telephoneOrId}`);
      throw new Error('Contact introuvable');
    }

    console.log(`✅ Contact trouvé:`, { nom: contact.nom, source: contact.source, id: contact.id });

    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token invalide');

      console.log(`📤 Création invitation Strapi pour: ${contact.nom}`);
      
      // Créer invitation via API
      const invitation = await invitationsService.createInvitation({
        nom: contact.nom,
        telephone: contact.telephone,
        type: method
      }, token);

      console.log(`✅ Invitation créée sur Strapi:`, invitation);

      // Convertir le contact en contact invité
      const invitedContact: Contact = {
        ...contact,
        source: 'invited',
        invitation: {
          id: invitation.id,
          documentId: invitation.id, // invitationsService.createInvitation retourne juste l'id
          statut: invitation.statut,
          dateEnvoi: invitation.dateEnvoi,
          type: invitation.type
        },
        aSurBob: false,
        strapiId: invitation.id
      };

      console.log(`💾 Mise à jour repository - Contact invité:`, { 
        telephone, 
        source: invitedContact.source, 
        invitationId: invitedContact.invitation?.id 
      });

      await this.repository.update(telephone, invitedContact);
      
      console.log(`📤 Invitation envoyée et sauvegardée: ${contact.nom}`);

      // 🔧 DIAGNOSTIC: Vérifier que la mise à jour a bien été effectuée
      const updatedContact = await this.repository.getByPhone(telephone);
      console.log(`🔍 Vérification après update:`, { 
        found: !!updatedContact,
        source: updatedContact?.source,
        hasInvitation: !!updatedContact?.invitation
      });

    } catch (error) {
      console.error(`❌ Erreur invitation ${contact.nom}:`, error);
      throw error;
    }
  }

  // === SUPPRESSION ===

  async deleteAllFromStrapi(): Promise<number> {
    if (this.isSyncBlocked) {
      console.warn('🚫 Suppression bloquée - utilisez débloquer d\'abord');
      return 0;
    }

    return this.withOperation(async () => {
      console.log('🧹 Suppression complète Strapi...');
      
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token invalide');

      let totalDeleted = 0;
      let page = 1;
      
      do {
        try {
          console.log(`🔍 Récupération page ${page} des contacts Strapi...`);
          const response = await apiClient.get(`/contacts?pagination[page]=${page}&pagination[pageSize]=500`, token);
          
          if (!response.ok) {
            break;
          }
          
          const responseData = await response.json();
          
          if (!responseData.data || !Array.isArray(responseData.data)) {
            break;
          }

          const contacts = responseData.data;
          console.log(`📄 Page ${page}: ${contacts.length} contacts trouvés`);

          if (contacts.length === 0) break;

          // Suppression par batches parallèles
          const batches = this.createBatches(contacts, CONTACTS_CONFIG.deleteBatchSize);
          
          for (const batch of batches) {
            const deletePromises = batch.map(async (contact) => {
              try {
                const deleteResponse = await apiClient.delete(`/contacts/${contact.documentId || contact.id}`, token);
                return deleteResponse.ok;
              } catch (error) {
                console.warn(`⚠️ Erreur suppression ${contact.nom}:`, error);
                return false;
              }
            });

            const results = await Promise.all(deletePromises);
            const successCount = results.filter(r => r).length;
            totalDeleted += successCount;

            const pourcentage = responseData.meta?.pagination?.total 
              ? Math.round((totalDeleted / responseData.meta.pagination.total) * 100)
              : Math.round((totalDeleted / (totalDeleted + contacts.length - successCount)) * 100);

            console.log(`✅ Batch supprimé: ${successCount}/${batch.length} (Total: ${totalDeleted} - ${pourcentage}%)`);
            
            if (totalDeleted % 100 === 0) {
              const barre = '●'.repeat(Math.floor(pourcentage / 5)) + '○'.repeat(20 - Math.floor(pourcentage / 5));
              console.log(`📊 ${totalDeleted} contacts supprimés ${barre} ${pourcentage}%`);
            }
          }

          page++;
        } catch (error) {
          console.error(`❌ Erreur page ${page}:`, error);
          break;
        }
      } while (true);

      // Après suppression complète, vider le cache local et bloquer sync
      if (totalDeleted > 0) {
        console.log('🔄 Nettoyage local après suppression Strapi...');
        
        // Garder seulement les contacts téléphone
        const phoneContacts = await this.repository.getPhoneContacts();
        await this.repository.clear();
        await this.repository.addMany(phoneContacts);
        
        // Bloquer les sync automatiques
        this.isSyncBlocked = true;
        console.log('🚫 Synchronisation automatique BLOQUÉE après reset');
      }

      console.log(`🧹 NETTOYAGE TERMINÉ: ${totalDeleted} contacts supprimés de Strapi`);
      return totalDeleted;
    });
  }

  // === DÉTECTION UTILISATEURS BOB ===

  /**
   * Forcer la détection Bob pour tous les contacts du répertoire
   */
  async forceDetectBobUsers(): Promise<void> {
    console.log('🔄 Force détection utilisateurs Bob...');
    
    // D'abord, synchroniser les strapiId manquants pour améliorer la suppression
    try {
      await this.contactsSync.syncMissingStrapiIds();
    } catch (error) {
      console.warn('⚠️ Erreur sync strapiId:', error);
    }
    
    await this.detectBobUsers();
  }

  async detectBobUsers(contacts?: Contact[]): Promise<void> {
    // D'abord, synchroniser les strapiId manquants pour améliorer la suppression
    try {
      await this.contactsSync.syncMissingStrapiIds();
    } catch (error) {
      console.warn('⚠️ Erreur sync strapiId:', error);
    }
    
    const contactsToCheck = contacts || await this.repository.getRepertoireContacts();
    
    console.log(`🔎 ContactsManager.detectBobUsers - Début avec ${contactsToCheck.length} contacts`);
    console.log(`🔍 Contacts à vérifier:`, contactsToCheck.map(c => `${c.nom} (${c.telephone})`));
    
    // 🧪 DEBUG spécial pour testbob
    const testbobContact = contactsToCheck.find(c => c.nom?.toLowerCase().includes('testbob'));
    if (testbobContact) {
      console.log(`🧪 DEBUG: testbob trouvé dans les contacts à vérifier:`, {
        nom: testbobContact.nom,
        telephone: testbobContact.telephone,
        source: testbobContact.source,
        aSurBob: testbobContact.aSurBob
      });
    } else {
      console.log(`🧪 DEBUG: testbob NOT FOUND dans les contacts à vérifier`);
      console.log(`🧪 DEBUG: Noms des contacts:`, contactsToCheck.map(c => c.nom));
    }
    
    if (contactsToCheck.length === 0) {
      console.log('❌ Aucun contact à vérifier pour Bob');
      return;
    }
    
    try {
      const result = await this.contactsSync.detectBobUsers(contactsToCheck);
      
      console.log(`📊 Résultat détection:`, {
        totalChecked: result.totalChecked,
        bobFound: result.bobFound,
        errors: result.errors.length,
        bobUsers: Object.keys(result.bobUsers).length
      });
      
      // Mettre à jour le repository avec les résultats
      let updatedCount = 0;
      let promotedCount = 0;
      
      // Batch mode pour éviter les recalculs multiples
      await this.withBatchMode(async () => {
        for (const contact of contactsToCheck) {
          const hasBob = result.bobUsers[contact.telephone];
          
          if (hasBob !== undefined && hasBob !== contact.aSurBob) {
            await this.repository.update(contact.telephone, { aSurBob: hasBob });
            updatedCount++;
          
            if (hasBob && contact.source === 'repertoire') {
              // Promouvoir en contact Bob
              const bobContact: Contact = {
                ...contact,
                source: 'bob',
                aSurBob: true,
                statut: 'ami'
              };
              await this.repository.update(contact.telephone, bobContact);
              promotedCount++;
            }
          }
        }
        
        if (updatedCount > 0) {
          console.log(`🔄 Bob détection: ${updatedCount} contacts mis à jour, ${promotedCount} promus vers Bob`);
        }
      });
      
      console.log(`✅ Détection Bob terminée: ${result.bobFound}/${result.totalChecked} utilisateurs Bob trouvés`);
      
    } catch (error) {
      console.error('❌ Erreur détection Bob:', error);
      throw error; // Re-throw pour que l'erreur soit visible
    }
  }

  // === STATISTIQUES ===

  async getStats(): Promise<ContactsStats> {
    return this.repository.calculateStats();
  }

  // === GESTION DE LA SYNCHRONISATION ===

  blockSync(): void {
    this.isSyncBlocked = true;
    this.contactsSync.stopSync(); // Arrêter aussi le service de sync
    console.log('🚫 Synchronisation bloquée');
  }

  unblockSync(): void {
    this.isSyncBlocked = false;
    this.contactsSync.resetCache(); // Réinitialiser le cache
    console.log('🔓 Synchronisation débloquée');
  }

  isSyncBlockedStatus(): boolean {
    return this.isSyncBlocked || this.contactsSync.isSyncing();
  }

  // === NETTOYAGE ===

  async clearAllData(): Promise<void> {
    await this.repository.clearAllCache();
    
    // 🚀 FIX: Vider aussi le cache Strapi pour éviter les contacts "ignorés" 
    this.contactsSync.resetCaches();
    console.log('🧹 Cache Strapi ContactsSync vidé');
    
    this.isSyncBlocked = false;
    this.isOperationInProgress = false;
    console.log('🧹 Toutes les données contacts supprimées');
  }

  // === UTILITAIRES ===

  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Nettoyer le numéro - garder seulement les chiffres et le +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si vide après nettoyage, retourner vide
    if (!cleaned) return '';
    
    // Supprimer les + multiples et garder seulement le premier
    cleaned = cleaned.replace(/\++/g, '+');
    
    // Si déjà un numéro international (commence par +), le garder tel quel
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // SEUL CAS SÛRE : Numéro français 0XXXXXXXXX (10 chiffres commençant par 0)
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      // Vérifier que c'est bien un numéro français valide (01-09)
      const secondDigit = cleaned.charAt(1);
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(secondDigit)) {
        return '+33' + cleaned.substring(1);
      }
    }
    
    // Pour TOUS les autres cas : GARDER LE NUMÉRO ORIGINAL
    // Ne pas ajouter d'indicatif car on ne peut pas deviner le pays
    return cleaned;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === SUPPRESSION D'UN CONTACT SPÉCIFIQUE ===

  /**
   * Supprimer un contact du répertoire et le remettre comme contact phone si possible
   */
  async removeFromRepertoire(telephone: string): Promise<{ success: boolean; restoredAsPhone: boolean; error?: string }> {
    return this.withOperation(async () => {
      console.log(`🗑️ Suppression contact du répertoire: ${telephone}`);
      
      try {
        // 1. Récupérer le contact à supprimer
        const contact = await this.repository.getByPhone(telephone);
        if (!contact) {
          return { success: false, restoredAsPhone: false, error: 'Contact introuvable' };
        }

        console.log(`🔍 Contact à supprimer:`, { nom: contact.nom, source: contact.source });

        // 2. Supprimer de Strapi si nécessaire (méthode améliorée par téléphone)
        if (contact.source === 'repertoire' || contact.source === 'invited') {
          const token = await authService.getValidToken();
          if (token) {
            try {
              if (contact.source === 'invited' && contact.invitation?.documentId) {
                // Supprimer l'invitation de Strapi
                console.log(`📤 Suppression invitation Strapi: ${contact.invitation.documentId}`);
                await apiClient.delete(`/invitations/${contact.invitation.documentId}`, token);
                console.log(`✅ Invitation supprimée de Strapi`);
              } else {
                // Pour les contacts du répertoire, utiliser le service contacts avec recherche par téléphone
                console.log(`🗑️ Suppression contact Strapi:`, { 
                  nom: contact.nom, 
                  telephone: contact.telephone, 
                  strapiId: contact.strapiId,
                  source: contact.source
                });
                
                try {
                  let deleted = false;
                  
                  // Stratégie 1: Utiliser l'ID direct si disponible
                  if (contact.strapiId) {
                    console.log(`🎯 Essai suppression par ID direct: ${contact.strapiId}`);
                    try {
                      await apiClient.delete(`/contacts/${contact.strapiId}`, token);
                      console.log(`✅ Contact supprimé de Strapi par ID direct`);
                      deleted = true;
                    } catch (deleteError) {
                      console.log(`❌ Échec suppression par ID direct (${deleteError.status}):`, deleteError.message || deleteError);
                      if (deleteError.status !== 404) {
                        throw deleteError; // Re-lancer si ce n'est pas une erreur 404
                      }
                    }
                  }
                  
                  // Stratégie 2: Si l'ID direct a échoué ou n'existe pas, rechercher par téléphone
                  if (!deleted) {
                    console.log(`🔍 Recherche par téléphone: ${contact.telephone}`);
                    const contactsResponse = await apiClient.get(`/contacts?filters[telephone][$eq]=${encodeURIComponent(contact.telephone)}`, token);
                    
                    console.log(`📡 Réponse recherche:`, {
                      ok: contactsResponse.ok,
                      status: contactsResponse.status,
                      hasData: !!contactsResponse.data,
                      dataArray: !!contactsResponse.data?.data,
                      count: contactsResponse.data?.data?.length || 0
                    });
                    
                    if (contactsResponse.ok && contactsResponse.data?.data?.[0]) {
                      const strapiContact = contactsResponse.data.data[0];
                      const strapiId = strapiContact.documentId || strapiContact.id;
                      
                      console.log(`📍 Contact trouvé dans Strapi:`, {
                        strapiId,
                        documentId: strapiContact.documentId,
                        id: strapiContact.id,
                        nom: strapiContact.nom
                      });
                      
                      await apiClient.delete(`/contacts/${strapiId}`, token);
                      console.log(`✅ Contact supprimé de Strapi après recherche par téléphone`);
                      deleted = true;
                    } else {
                      console.log(`ℹ️ Contact introuvable dans Strapi par téléphone - peut-être déjà supprimé`);
                    }
                  }
                  
                  if (!deleted) {
                    console.log(`⚠️ Contact non trouvé dans Strapi mais poursuite de la suppression locale`);
                  }
                  
                } catch (deleteError) {
                  console.error(`❌ Erreur suppression Strapi:`, {
                    message: deleteError.message || deleteError,
                    status: deleteError.status,
                    telephone: contact.telephone,
                    strapiId: contact.strapiId
                  });
                  // Continue quand même avec la suppression locale
                }
              }
            } catch (strapiError) {
              if (strapiError.status === 404) {
                console.log(`ℹ️ Contact déjà supprimé de Strapi ou introuvable (404 - normal)`);
              } else {
                console.warn(`⚠️ Erreur suppression Strapi:`, strapiError);
              }
              // Continue quand même avec la suppression locale
            }
          }
        }

        // 3. Vérifier si le contact existe encore dans le téléphone
        const scanResult = await this.contactsScanner.scanPhoneContacts();
        const stillInPhone = scanResult.contacts.find(phoneContact => 
          this.normalizePhoneNumber(phoneContact.telephone) === this.normalizePhoneNumber(telephone)
        );

        let restoredAsPhone = false;

        if (stillInPhone) {
          // 4a. Le contact existe encore dans le téléphone -> le remettre comme contact phone
          console.log(`📱 Contact trouvé dans le téléphone, restauration comme contact phone`);
          
          const phoneContact: Contact = {
            ...stillInPhone,
            source: 'phone',
            aSurBob: false,
            invitation: undefined, // ✅ Nettoyer l'invitation
            strapiId: undefined,   // ✅ Nettoyer l'ID Strapi
            estInvite: false,      // ✅ Réinitialiser le statut d'invitation
            dateAjout: stillInPhone.dateAjout || new Date().toISOString()
          };

          await this.repository.update(telephone, phoneContact);
          restoredAsPhone = true;
          
          console.log(`✅ Contact restauré comme contact phone PROPRE (sans invitation): ${phoneContact.nom}`);
        } else {
          // 4b. Le contact n'existe plus dans le téléphone -> suppression complète
          console.log(`📱 Contact non trouvé dans le téléphone, suppression complète`);
          await this.repository.remove(telephone);
        }

        console.log(`✅ Suppression du répertoire terminée: ${contact.nom}`);
        return { success: true, restoredAsPhone };

      } catch (error) {
        console.error(`❌ Erreur suppression contact:`, error);
        return { success: false, restoredAsPhone: false, error: (error as Error).message };
      }
    });
  }

  // === RÉPARATION DU CACHE ===

  /**
   * Réparer le cache en rescannant le téléphone et en restaurant les contacts phone
   */
  async repairPhoneContactsCache(): Promise<{ restored: number; errors: string[] }> {
    return this.withOperation(async () => {
      console.log('🔧 RÉPARATION: Rescan complet du téléphone...');
      
      try {
        // 1. Scanner tous les contacts du téléphone
        const scanResult = await this.contactsScanner.scanPhoneContacts();
        
        if (!scanResult.hasPermission || scanResult.contacts.length === 0) {
          return {
            restored: 0,
            errors: scanResult.errors.length > 0 ? scanResult.errors : ['Aucun contact trouvé dans le téléphone']
          };
        }

        console.log(`📱 ${scanResult.contacts.length} contacts trouvés dans le téléphone`);

        // 2. Récupérer les contacts actuels du repository
        const currentContacts = await this.repository.getAll();
        const currentByPhone = new Map(currentContacts.map(c => [c.telephone, c]));

        console.log(`💾 ${currentContacts.length} contacts actuels dans le repository`);

        // 3. Identifier les contacts qui doivent être restaurés comme contacts phone
        let restored = 0;
        const errors: string[] = [];

        for (const phoneContact of scanResult.contacts) {
          const existing = currentByPhone.get(phoneContact.telephone);
          
          if (!existing) {
            // Contact n'existe pas du tout -> l'ajouter comme contact phone
            try {
              await this.repository.add(phoneContact);
              restored++;
              console.log(`➕ Contact phone ajouté: ${phoneContact.nom}`);
            } catch (error) {
              console.warn(`⚠️ Erreur ajout ${phoneContact.nom}:`, error);
              errors.push(`Erreur ajout ${phoneContact.nom}: ${error.message}`);
            }
          } else if (existing.source === 'invited' || existing.source === 'repertoire') {
            // Contact existe mais pas comme phone -> ignorer (ne pas écraser)
            console.log(`⏭️ Contact ${phoneContact.nom} existe déjà comme ${existing.source}, ignoré`);
          }
          // Si c'est déjà un contact phone ou bob, on le laisse tel quel
        }

        console.log(`✅ Réparation terminée: ${restored} contacts phone restaurés`);

        return { restored, errors };

      } catch (error) {
        console.error('❌ Erreur lors de la réparation du cache:', error);
        return { 
          restored: 0, 
          errors: [error.message || 'Erreur inconnue lors de la réparation'] 
        };
      }
    });
  }

  /**
   * Forcer la création de contacts phone manquants (sans écraser le repertoire)
   */
  async ensureMissingPhoneContacts(): Promise<{ added: number; errors: string[] }> {
    return this.withOperation(async () => {
      console.log('🔍 VÉRIFICATION: Contacts phone manquants...');
      
      try {
        // 1. Scanner le téléphone
        const scanResult = await this.contactsScanner.scanPhoneContacts();
        if (!scanResult.hasPermission || scanResult.contacts.length === 0) {
          return { added: 0, errors: ['Pas d\'accès aux contacts du téléphone'] };
        }

        // 2. Récupérer les contacts existants
        const existingContacts = await this.repository.getAll();
        const existingPhones = new Set(existingContacts.map(c => c.telephone));

        // 3. Identifier les contacts manquants
        const missingContacts = scanResult.contacts.filter(phoneContact => 
          !existingPhones.has(phoneContact.telephone)
        );

        console.log(`📱 ${missingContacts.length} contacts phone manquants détectés sur ${scanResult.contacts.length} total`);

        // 4. Ajouter les contacts manquants
        if (missingContacts.length > 0) {
          await this.repository.addMany(missingContacts);
          console.log(`✅ ${missingContacts.length} contacts phone ajoutés au repository`);
        }

        return { added: missingContacts.length, errors: [] };

      } catch (error) {
        console.error('❌ Erreur vérification contacts phone:', error);
        return { added: 0, errors: [error.message || 'Erreur inconnue'] };
      }
    });
  }

  // === API DE HAUT NIVEAU ===

  async importAllPhoneContacts(): Promise<ImportResult> {
    // 1. Scanner le téléphone
    const scanResult = await this.scanPhoneContacts();
    if (!scanResult.hasPermission || scanResult.contacts.length === 0) {
      return {
        imported: 0,
        skipped: 0,
        errors: scanResult.errors,
        total: 0
      };
    }

    // 2. Importer tous dans le répertoire
    const telephones = scanResult.contacts.map(c => c.telephone);
    const importResult = await this.importContactsToRepertoire(telephones);

    // 3. Détecter utilisateurs Bob
    if (importResult.imported > 0) {
      this.detectBobUsers().catch(error => {
        console.warn('⚠️ Détection Bob échouée:', error);
      });
    }

    return importResult;
  }

  // === DEBUG ===

  async getDebugInfo(): Promise<any> {
    const repositoryInfo = await this.repository.getDebugInfo();
    const stats = await this.getStats();
    
    return {
      ...repositoryInfo,
      stats,
      isSyncBlocked: this.isSyncBlocked,
      isOperationInProgress: this.isOperationInProgress,
      config: CONTACTS_CONFIG
    };
  }
}