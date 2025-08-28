// src/services/contacts/ContactsSync.ts - Service dédié à la synchronisation des contacts avec Strapi

import { apiClient } from '../api';
import { contactsService } from '../contacts.service';
import { authService } from '../auth.service';
import { contactsRepository } from './ContactsRepository';
import { Contact, SyncResult } from '../../types/contacts.unified';

export interface SyncOptions {
  createGroup?: boolean;
  groupName?: string;
  batchSize?: number;
  onProgress?: (progress: number) => void;
  forceSync?: boolean;
}

export interface BobVerificationResult {
  bobUsers: Record<string, boolean>;
  totalChecked: number;
  bobFound: number;
  errors: string[];
}

export class ContactsSync {
  private isSyncingState: boolean = false;
  private syncedContactsCache: Map<string, string> = new Map(); // téléphone → hash du contact
  private syncStartTime: number = 0;
  private repository: any;
  
  // 🚀 NOUVEAUX CACHES OPTIMISÉS
  private existingContactsCache: Map<string, string> = new Map(); // téléphone → documentId
  private bobUsersCache: Map<string, any> = new Map(); // téléphone → user data
  private bobCacheTimestamp = 0;
  private existingCacheTimestamp = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(repository?: any) {
    this.repository = repository || contactsRepository;
  }

  // === MÉTHODES PRINCIPALES ===

  /**
   * Synchroniser les strapiId manquants pour les contacts repertoire existants
   */
  async syncMissingStrapiIds(): Promise<{ updated: number; errors: string[] }> {
    console.log('🔍 Synchronisation des strapiId manquants...');
    
    const result = { updated: 0, errors: [] as string[] };
    const token = await authService.getValidToken();
    
    if (!token) {
      result.errors.push('Token d\'authentification manquant');
      return result;
    }
    
    try {
      // Récupérer les contacts répertoire qui n'ont pas de strapiId
      const allContacts = await this.repository.getAll();
      const contactsNeedingId = allContacts.filter(c => 
        (c.source === 'repertoire' || c.source === 'bob') && !c.strapiId
      );
      
      if (contactsNeedingId.length === 0) {
        console.log('✅ Tous les contacts ont déjà leur strapiId');
        return result;
      }
      
      console.log(`🔧 ${contactsNeedingId.length} contacts à synchroniser`);
      
      // Traiter par petits lots pour éviter la surcharge
      const batchSize = 10;
      for (let i = 0; i < contactsNeedingId.length; i += batchSize) {
        const batch = contactsNeedingId.slice(i, i + batchSize);
        
        for (const contact of batch) {
          try {
            const normalizedPhone = this.normalizePhoneNumber(contact.telephone);
            const contactsResponse = await apiClient.get(`/contacts?filters[telephone][$eq]=${encodeURIComponent(normalizedPhone)}`, token);
            
            if (contactsResponse.ok && contactsResponse.data?.data?.[0]) {
              const strapiContact = contactsResponse.data.data[0];
              const strapiId = strapiContact.documentId || strapiContact.id;
              
              await this.repository.update(contact.telephone, { strapiId });
              result.updated++;
              console.log(`✅ strapiId mis à jour pour ${contact.nom}: ${strapiId}`);
            }
          } catch (error) {
            const errorMsg = `Erreur ${contact.nom}: ${error.message}`;
            result.errors.push(errorMsg);
            console.warn(`⚠️ ${errorMsg}`);
          }
        }
        
        // Délai entre lots
        if (i + batchSize < contactsNeedingId.length) {
          await this.sleep(200);
        }
      }
      
      console.log(`✅ Synchronisation strapiId terminée: ${result.updated} mis à jour, ${result.errors.length} erreurs`);
      
    } catch (error) {
      console.error('❌ Erreur synchronisation strapiId:', error);
      result.errors.push(`Erreur générale: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Synchroniser les contacts avec Strapi
   */
  async syncToStrapi(contacts: Contact[], options: SyncOptions = {}): Promise<SyncResult> {
    if (!contacts || contacts.length === 0) {
      console.warn('⚠️ Aucun contact à synchroniser');
      return {
        success: true,
        created: 0,
        updated: 0,
        failed: 0,
        errors: []
      };
    }

    const token = await authService.getValidToken();
    if (!token) {
      console.error('❌ Aucun token valide pour la synchronisation');
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: ['Aucun token d\'authentification valide']
      };
    }

    const {
      batchSize = 100,
      onProgress,
      forceSync = false
    } = options;
    
    console.log('🔄 Sync contacts avec Strapi:', contacts.length);
    
    // Éviter les syncs multiples simultanées
    if (this.isSyncingState && !forceSync) {
      console.warn('⚠️ Synchronisation déjà en cours');
      return {
        success: false,
        created: 0,
        updated: 0,
        failed: 0,
        errors: ['Synchronisation déjà en cours']
      };
    }

    this.isSyncingState = true;
    this.syncStartTime = Date.now();

    const result: SyncResult = {
      success: false,
      created: 0,
      updated: 0,
      failed: 0,
      errors: []
    };
    
    try {
      // Filtrer les contacts valides
      const validContacts = contacts.filter(contact => 
        contact.nom && contact.nom.trim() && 
        contact.telephone && contact.telephone.trim()
      );

      if (validContacts.length === 0) {
        console.warn('⚠️ Aucun contact valide à synchroniser');
        result.success = true;
        return result;
      }

      // 🚀 OPTIMISATION: Pré-charger le cache des contacts existants
      if (this.existingContactsCache.size === 0 || forceSync) {
        console.log('🔄 Pré-chargement du cache des contacts existants...');
        await this.preloadExistingContacts(token);
      }

      // Initialiser le cache si nécessaire
      if (this.syncedContactsCache.size === 0 && !forceSync) {
        console.log('🔄 Initialisation du cache avec les contacts Strapi existants...');
        await this.initializeCacheFromStrapi();
      }

      // Filtrage intelligent : ne synchroniser que les contacts modifiés ou nouveaux
      const contactsToSync = forceSync ? validContacts : validContacts.filter(contact => this.hasContactChanged(contact));
      
      const skippedCount = validContacts.length - contactsToSync.length;
      
      console.log(`📊 ${validContacts.length}/${contacts.length} contacts valides`);
      console.log(`🎯 ${contactsToSync.length} contacts à synchroniser (${skippedCount} inchangés ignorés)`);
      
      if (contactsToSync.length === 0) {
        console.log('✅ Tous les contacts sont déjà à jour');
        result.success = true;
        result.created = validContacts.length;
        return result;
      }
      
      // Synchroniser par batches
      const totalBatches = Math.ceil(contactsToSync.length / batchSize);
      
      for (let i = 0; i < contactsToSync.length; i += batchSize) {
        const batch = contactsToSync.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        console.log(`📤 Batch ${batchNumber}/${totalBatches} (${batch.length} contacts)`);
        
        try {
          // Vérifier le token avant chaque batch
          const currentToken = await authService.getValidToken();
          if (!currentToken) {
            throw new Error('Token expiré pendant la synchronisation');
          }

          // Sync séquentielle pour éviter le rate limiting
          for (let j = 0; j < batch.length; j++) {
            const contact = batch[j];
            const contactIndex = i + j + 1;
            console.log(`🔄 Traitement contact ${contactIndex}/${contactsToSync.length}: ${contact.nom}`);
            
            try {
              const syncResult = await this.syncSingleContact(contact, currentToken);
              
              if (syncResult.created) {
                result.created++;
              } else if (syncResult.updated) {
                result.updated++;
              }
              
              // Marquer le contact comme synchronisé
              this.markContactAsSynced(contact);
              
              console.log(`✅ Contact ${contactIndex}/${contactsToSync.length} traité: ${contact.nom}`);
              
              // Notification de progression
              onProgress?.(Math.round((contactIndex / contactsToSync.length) * 100));
              
              // Délai minimal entre contacts
              if (j < batch.length - 1) {
                await this.sleep(100);
              }
            } catch (error) {
              const err = error as Error;
              console.error(`❌ Erreur contact ${contact.nom}:`, err);
              result.failed++;
              result.errors.push(`${contact.nom}: ${err?.message || 'Erreur inconnue'}`);
            }
          }
          
          // Délai entre batches
          if (batchNumber < totalBatches) {
            await this.sleep(500);
          }
          
        } catch (error) {
          const err = error as Error;
          console.error(`❌ Erreur batch ${batchNumber}:`, err);
          result.errors.push(`Batch ${batchNumber}: ${err.message}`);
          
          // Arrêter si erreur critique
          if (err.message.includes('Token') || err.message.includes('401')) {
            console.error('❌ Erreur critique d\'authentification, arrêt de la sync');
            break;
          }
        }
      }
      
      result.success = (result.created + result.updated) > 0 || contactsToSync.length === 0;
      
      console.log(`✅ Sync terminée: ${result.created} créés, ${result.updated} mis à jour, ${result.failed} échoués`);
      
      return result;
      
    } catch (error) {
      const err = error as Error;
      console.error('❌ Erreur sync globale:', err);
      result.errors.push(`Erreur globale: ${err.message}`);
      return result;
    } finally {
      this.isSyncingState = false;
    }
  }

  /**
   * 🚀 OPTIMISÉ: Synchroniser un contact individuel avec cache
   */
  private async syncSingleContact(contact: Contact, token: string): Promise<{ created: boolean; updated: boolean }> {
    console.log('🔄 syncSingleContact - Début pour:', contact.nom);
    
    try {
      // Validation du contact
      if (!contact.nom?.trim() || !contact.telephone?.trim()) {
        throw new Error('Contact invalide: nom ou téléphone manquant');
      }

      // Normaliser le numéro de téléphone
      const normalizedPhone = this.normalizePhoneNumber(contact.telephone);
      console.log('📞 Téléphone normalisé:', normalizedPhone);
      
      // 🚀 OPTIMISATION: Vérifier le cache AVANT tout appel réseau
      const existingContactId = this.existingContactsCache.get(normalizedPhone);
      
      if (existingContactId) {
        console.log('🔍 Contact existant trouvé dans le cache:', existingContactId);
        // 🚀 ULTRA OPTIMISATION: Contact existe dans le cache = SKIP COMPLÈTEMENT
        // Pour les imports massifs, on privilégie la vitesse sur les micro mises à jour
        
        console.log('⚡ Contact ignoré (existe dans cache) - gain max performance');
        return { created: false, updated: false };
        
      } else {
        // 🚀 Contact n'existe pas dans le cache - créer directement
        console.log(`➕ Création nouveau contact (pas dans cache): ${contact.nom}`);
        
        // Séparer nom et prénom intelligemment
        const { nom, prenom } = this.parseFullName(contact.nom.trim());
        
        const contactData = {
          nom,
          prenom,
          telephone: normalizedPhone,
          email: contact.email?.trim(),
        };
        
        try {
          const newContact = await contactsService.createContact(contactData, token);
          
          // 🔧 Ajouter au cache après création réussie
          if (newContact.id) {
            this.existingContactsCache.set(normalizedPhone, newContact.id);
            
            // 🔧 CRITIQUE: Mettre à jour le contact local avec l'ID Strapi (documentId)
            try {
              await this.repository.update(contact.telephone, { 
                strapiId: newContact.id, // C'est déjà le documentId d'après contacts.service.ts:446
                documentId: newContact.id, // Assigner aussi documentId pour cohérence
                internalId: newContact.internalId, // Garder aussi l'internalId
                source: 'repertoire' // S'assurer que le contact est marqué comme répertoire
              });
              console.log(`💾 Contact mis à jour avec strapiId/documentId: ${newContact.id}`);
            } catch (updateError) {
              console.warn(`⚠️ Impossible de mettre à jour le strapiId:`, updateError);
              // Ne pas faire échouer la création pour autant
            }
          }
          
          console.log('✅ Contact créé avec succès');
          return { created: true, updated: false };
        } catch (createError: any) {
          // Si erreur 409, le contact existe malgré le cache - mettre à jour le cache
          if (createError.message?.includes('409') || createError.message?.includes('existe déjà')) {
            console.log('📋 Contact existe finalement (409) - cache désynchronisé, mais OK');
            // 🚀 OPTIMISATION: Pas besoin de récupérer le contact, juste l'ajouter au cache avec un ID générique
            this.existingContactsCache.set(normalizedPhone, `exists_${Date.now()}`);
            return { created: false, updated: false }; // Contact existait déjà
          }
          throw createError; // Autres erreurs
        }
      }
    } catch (error) {
      console.error('❌ syncSingleContact - Erreur:', error);
      throw error;
    }
  }

  /**
   * Détecter qui a Bob parmi les contacts
   */
  async detectBobUsers(contacts?: Contact[]): Promise<BobVerificationResult> {
    console.log('🔍 Détection utilisateurs Bob');
    
    const telephones = contacts 
      ? contacts.map(c => c.telephone).filter(Boolean)
      : [];

    if (telephones.length === 0) {
      return {
        bobUsers: {},
        totalChecked: 0,
        bobFound: 0,
        errors: []
      };
    }

    const token = await authService.getValidToken();
    if (!token) {
      return {
        bobUsers: {},
        totalChecked: 0,
        bobFound: 0,
        errors: ['Aucun token d\'authentification valide']
      };
    }

    const result: BobVerificationResult = {
      bobUsers: {},
      totalChecked: 0,
      bobFound: 0,
      errors: []
    };
    
    try {
      // Créer un mapping entre numéros originaux et normalisés
      const phoneMapping: Record<string, string> = {};
      telephones
        .filter(tel => tel && tel.trim())
        .forEach(original => {
          const normalized = this.normalizePhoneNumber(original);
          phoneMapping[normalized] = original;
        });

      const normalizedPhones = [...new Set(Object.keys(phoneMapping))];
      result.totalChecked = normalizedPhones.length;
      
      // Debug réduit
      if (process.env.NODE_ENV === 'development' && normalizedPhones.includes('+3361234567')) {
        console.log('🧪 testbob trouvé dans les contacts à vérifier');
      }
      
      // 🚀 OPTIMISATION: Trier par priorité (contacts avec invitations d'abord)
      const priorityPhones = this.sortContactsByPriority(normalizedPhones, contacts);
      console.log(`📋 Contacts triés par priorité: ${priorityPhones.high.length} haute priorité, ${priorityPhones.normal.length} normale`);
      
      // Vérifier par chunks avec décompte
      const chunkSize = 50;
      const allPhonesToCheck = [...priorityPhones.high, ...priorityPhones.normal];
      let processedCount = 0;
      
      for (let i = 0; i < allPhonesToCheck.length; i += chunkSize) {
        const chunk = allPhonesToCheck.slice(i, i + chunkSize);
        
        try {
          const currentToken = await authService.getValidToken();
          if (!currentToken) {
            throw new Error('Token expiré pendant la vérification');
          }

          // Vérifier individuellement avec décompte en temps réel
          for (const tel of chunk) {
            try {
              processedCount++;
              const progress = Math.round((processedCount / allPhonesToCheck.length) * 100);
              console.log(`🔍 Vérification Bob: ${processedCount}/${allPhonesToCheck.length} (${progress}%)`);
              
              const hasBob = await this.checkSinglePhone(tel, currentToken);
              const originalPhone = phoneMapping[tel];
              if (originalPhone) {
                result.bobUsers[originalPhone] = hasBob;
                if (hasBob) {
                  result.bobFound++;
                  console.log(`✅ Utilisateur Bob trouvé: ${originalPhone} (${result.bobFound} au total)`);
                }
              }
              await this.sleep(200);
            } catch (error) {
              console.error(`❌ Erreur vérification ${tel}:`, error);
              const originalPhone = phoneMapping[tel];
              if (originalPhone) {
                result.bobUsers[originalPhone] = false;
              }
              result.errors.push(`Erreur vérification ${tel}`);
            }
          }
          
        } catch (chunkError) {
          console.error('❌ Erreur chunk vérification:', chunkError);
          result.errors.push(`Erreur chunk ${i / chunkSize + 1}`);
        }
        
        // Délai entre chunks
        if (i + chunkSize < normalizedPhones.length) {
          await this.sleep(1000);
        }
      }
      
      console.log(`✅ Vérification terminée: ${result.bobFound}/${result.totalChecked} utilisateurs Bob trouvés`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur vérification globale:', error);
      result.errors.push(`Erreur globale: ${(error as Error).message}`);
      
      // Fallback: marquer tous comme non Bob
      telephones.forEach(tel => {
        if (tel && tel.trim()) {
          result.bobUsers[tel] = false;
        }
      });
      
      return result;
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * 🚀 OPTIMISATION: Pré-charger le cache des contacts existants pour éviter les doubles appels
   */
  private async preloadExistingContacts(token: string): Promise<void> {
    try {
      const now = Date.now();
      
      // Cache encore valide ? Pas besoin de recharger
      if (now - this.existingCacheTimestamp < this.CACHE_TTL && this.existingContactsCache.size > 0) {
        console.log(`✅ Cache existants encore valide: ${this.existingContactsCache.size} contacts`);
        return;
      }

      console.log('🔄 Rechargement cache contacts existants...');
      
      const response = await apiClient.get('/contacts?pagination[limit]=2000&sort=createdAt:desc', token);
      
      if (!response.ok) {
        console.warn('⚠️ Impossible de pré-charger le cache des contacts existants');
        return;
      }

      const data = await response.json();
      const existingContacts = data.data || [];
      
      this.existingContactsCache.clear();
      let cacheCount = 0;
      
      existingContacts.forEach((contact: any) => {
        if (contact.telephone) {
          const normalized = this.normalizePhoneNumber(contact.telephone);
          const contactId = contact.documentId || contact.id?.toString();
          
          if (contactId) {
            this.existingContactsCache.set(normalized, contactId);
            cacheCount++;
          }
        }
      });
      
      this.existingCacheTimestamp = now;
      console.log(`✅ Cache existants mis à jour: ${cacheCount} contacts (sur ${existingContacts.length} trouvés)`);
      
    } catch (error) {
      console.error('❌ Erreur preload cache contacts existants:', error);
    }
  }

  /**
   * 🚀 OPTIMISATION: Charger le cache des utilisateurs Bob une seule fois
   */
  private async loadBobUsersOnce(token: string): Promise<void> {
    try {
      const now = Date.now();
      
      // Cache encore valide ? Pas besoin de recharger
      if (now - this.bobCacheTimestamp < this.CACHE_TTL && this.bobUsersCache.size > 0) {
        console.log(`✅ Cache Bob encore valide: ${this.bobUsersCache.size} utilisateurs`);
        return;
      }

      console.log('🔄 Rechargement cache utilisateurs Bob...');
      
      let allUsers: any[] = [];
      let page = 1;
      let hasMore = true;
      
      // Pagination pour récupérer tous les utilisateurs Bob
      while (hasMore && page <= 10) { // Limite sécurité à 10 pages
        const response = await apiClient.get(`/users?pagination[page]=${page}&pagination[pageSize]=100`, token);
        
        if (!response.ok) {
          console.error(`❌ Erreur récupération utilisateurs page ${page}:`, response.status);
          break;
        }
        
        const data = await response.json();
        const users = Array.isArray(data) ? data : (data.data || []);
        
        if (users.length === 0) {
          hasMore = false;
        } else {
          allUsers.push(...users);
          page++;
          
          // Si moins de 100 utilisateurs, on a atteint la fin
          if (users.length < 100) {
            hasMore = false;
          }
        }
        
        // Petit délai pour éviter le rate limiting
        if (hasMore) {
          await this.sleep(50);
        }
      }
      
      this.bobUsersCache.clear();
      let bobCount = 0;
      
      allUsers.forEach((user: any) => {
        if (user.telephone) {
          const normalized = this.normalizePhoneNumber(user.telephone);
          this.bobUsersCache.set(normalized, user);
          bobCount++;
        }
      });
      
      this.bobCacheTimestamp = now;
      console.log(`✅ Cache Bob mis à jour: ${bobCount} utilisateurs actifs (sur ${allUsers.length} trouvés)`);
      
      // 🧪 DEBUG: Afficher tous les numéros Bob pour diagnostic
      const bobNumbers = Array.from(this.bobUsersCache.keys());
      console.log('🧪 DEBUG: Numéros Bob dans le cache:', bobNumbers);
      
      // 🧪 DEBUG: Chercher le numéro spécifique
      const targetNumber = '+3361234567';
      const hasTarget = bobNumbers.includes(targetNumber);
      console.log(`🧪 DEBUG: Le numéro ${targetNumber} est-il dans le cache Bob? ${hasTarget}`);
      
    } catch (error) {
      console.error('❌ Erreur cache utilisateurs Bob:', error);
    }
  }

  /**
   * Créer un hash simple d'un contact pour détecter les changements
   */
  private createContactHash(contact: Contact): string {
    const normalizedPhone = this.normalizePhoneNumber(contact.telephone || '');
    return `${contact.nom?.trim() || ''}|${contact.prenom?.trim() || ''}|${normalizedPhone}|${contact.email?.trim() || ''}`;
  }

  /**
   * Vérifier si un contact a changé depuis la dernière sync
   */
  private hasContactChanged(contact: Contact): boolean {
    const normalizedPhone = this.normalizePhoneNumber(contact.telephone || '');
    const currentHash = this.createContactHash(contact);
    const cachedHash = this.syncedContactsCache.get(normalizedPhone);
    
    return !cachedHash || cachedHash !== currentHash;
  }

  /**
   * Marquer un contact comme synchronisé
   */
  private markContactAsSynced(contact: Contact): void {
    const normalizedPhone = this.normalizePhoneNumber(contact.telephone || '');
    const hash = this.createContactHash(contact);
    this.syncedContactsCache.set(normalizedPhone, hash);
  }

  /**
   * Initialiser le cache avec les contacts existants dans Strapi
   */
  private async initializeCacheFromStrapi(): Promise<void> {
    try {
      const token = await authService.getValidToken();
      if (!token) {
        console.warn('⚠️ Pas de token pour initialiser le cache');
        return;
      }

      const response = await apiClient.get('/contacts?pagination[pageSize]=2000&sort=nom:asc', token);
      if (!response.ok) {
        console.warn('⚠️ Impossible de récupérer les contacts Strapi pour le cache');
        return;
      }

      const data = await response.json();
      const strapiContacts = data.data || [];

      console.log(`📥 Initialisation du cache avec ${strapiContacts.length} contacts Strapi`);

      for (const strapiContact of strapiContacts) {
        if (strapiContact.telephone) {
          const normalizedPhone = this.normalizePhoneNumber(strapiContact.telephone);
          
          const contactForHash = {
            nom: strapiContact.nom || '',
            prenom: strapiContact.prenom || '',
            telephone: strapiContact.telephone || '',
            email: strapiContact.email || ''
          };
          
          const hash = this.createContactHash(contactForHash);
          this.syncedContactsCache.set(normalizedPhone, hash);
        }
      }

      console.log(`✅ Cache initialisé avec ${this.syncedContactsCache.size} contacts`);
    } catch (error) {
      console.error('❌ Erreur initialisation cache:', error);
    }
  }

  /**
   * Trouver un contact par téléphone
   */
  private async findContactByPhone(telephone: string, token: string): Promise<Contact | null> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(telephone);
      const url = `/contacts?filters[telephone][$eq]=${encodeURIComponent(normalizedPhone)}`;
      
      const response = await apiClient.get(url, token);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token d\'authentification invalide');
        }
        return null;
      }
      
      const result = await response.json();
      
      const contact = result.data?.[0] ? {
        id: result.data[0].id,
        ...result.data[0].attributes
      } : null;
      
      return contact;
    } catch (error) {
      console.error('❌ findContactByPhone - Erreur:', error);
      throw error;
    }
  }

  /**
   * 🚀 OPTIMISÉ: Vérifier un seul numéro de téléphone avec cache
   */
  private async checkSinglePhone(telephone: string, token: string): Promise<boolean> {
    try {
      // 1. 🚀 Charger le cache Bob si nécessaire (une seule fois)
      await this.loadBobUsersOnce(token);
      
      // 2. 🔍 Vérifier directement dans le cache
      const normalizedPhone = this.normalizePhoneNumber(telephone);
      const isOnBob = this.bobUsersCache.has(normalizedPhone);
      
      if (isOnBob) {
        const bobUser = this.bobUsersCache.get(normalizedPhone);
        console.log(`✅ UTILISATEUR BOB TROUVÉ (cache):`, {
          id: bobUser?.id,
          username: bobUser?.username,
          telephone: bobUser?.telephone,
          normalized: normalizedPhone
        });
        return true;
      } else {
        // 🧪 DEBUG TEMPORAIRE: Afficher quelques exemples de non-match
        if (process.env.NODE_ENV === 'development' && Math.random() < 0.05) {
          const bobNumbers = Array.from(this.bobUsersCache.keys()).slice(0, 3);
          console.log(`❌ DEBUG: ${normalizedPhone} pas trouvé. Bob users: [${bobNumbers.join(', ')}]`);
        }
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur vérification téléphone:', error);
      return false;
    }
  }

  /**
   * Trier les contacts par priorité pour optimiser la détection Bob
   */
  private sortContactsByPriority(phones: string[], contacts?: Contact[]): {
    high: string[];
    normal: string[];
  } {
    if (!contacts) {
      return { high: [], normal: phones };
    }

    const high: string[] = [];
    const normal: string[] = [];
    
    // Créer un index des contacts par téléphone
    const contactsByPhone = new Map<string, Contact>();
    contacts.forEach(contact => {
      if (contact.telephone) {
        const normalized = this.normalizePhoneNumber(contact.telephone);
        contactsByPhone.set(normalized, contact);
      }
    });

    phones.forEach(phone => {
      const contact = contactsByPhone.get(phone);
      if (!contact) {
        normal.push(phone);
        return;
      }

      // 🔥 PRIORITÉ HAUTE: Contacts avec invitations ou récents
      const isHighPriority = 
        // Contacts ayant reçu des invitations
        (contact.source === 'invited') ||
        // Contacts avec des invitations en cours
        (contact.invitation && ['envoye', 'en_attente'].includes(contact.invitation.statut)) ||
        // Contacts ajoutés récemment (dernières 24h)
        (contact.dateAjout && new Date(contact.dateAjout) > new Date(Date.now() - 24 * 60 * 60 * 1000)) ||
        // Contacts avec email (plus susceptibles d'être des vrais utilisateurs)
        (contact.email && contact.email.includes('@')) ||
        // Contacts avec noms complets (plus fiables)
        (contact.nom && contact.prenom);

      if (isHighPriority) {
        high.push(phone);
      } else {
        normal.push(phone);
      }
    });

    return { high, normal };
  }

  /**
   * Normaliser un numéro de téléphone - PRÉSERVER LE NUMÉRO ORIGINAL
   */
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

  /**
   * Séparer un nom complet en nom et prénom
   */
  private parseFullName(fullName: string): { nom: string; prenom: string } {
    if (!fullName || !fullName.trim()) {
      return { nom: '', prenom: '' };
    }

    const cleaned = fullName.trim();
    
    // Cas spéciaux avec séparateurs
    if (cleaned.includes(' - ')) {
      const parts = cleaned.split(' - ');
      return {
        prenom: parts[1]?.trim() || '',
        nom: parts[0]?.trim() || '',
      };
    }
    
    // Séparation standard par espaces
    const parts = cleaned.split(' ');
    
    if (parts.length === 1) {
      return { nom: parts[0], prenom: '' };
    }
    
    if (parts.length === 2) {
      return {
        prenom: parts[0],
        nom: parts[1],
      };
    }
    
    // Plus de 2 mots → dernier mot = nom, le reste = prénom
    const nom = parts[parts.length - 1];
    const prenom = parts.slice(0, -1).join(' ');
    
    return { nom, prenom };
  }

  /**
   * Délai utilitaire
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // === MÉTHODES PUBLIQUES D'ÉTAT ===

  /**
   * Vérifier si une synchronisation est en cours
   */
  isSyncing(): boolean {
    return this.isSyncingState;
  }

  /**
   * Arrêter une synchronisation en cours
   */
  stopSync(): void {
    console.log('🛑 Arrêt forcé de la synchronisation');
    this.isSyncingState = false;
  }

  /**
   * Réinitialiser le cache de synchronisation
   */
  resetCache(): void {
    console.log('🔄 Réinitialisation du cache de synchronisation');
    this.syncedContactsCache.clear();
    
    // 🚀 NOUVEAU: Réinitialiser aussi les caches optimisés
    this.existingContactsCache.clear();
    this.bobUsersCache.clear();
    this.existingCacheTimestamp = 0;
    this.bobCacheTimestamp = 0;
  }

  /**
   * Obtenir des statistiques sur le cache
   */
  getCacheStats(): { cachedContacts: number; existingContacts: number; bobUsers: number } {
    return {
      cachedContacts: this.syncedContactsCache.size,
      existingContacts: this.existingContactsCache.size,
      bobUsers: this.bobUsersCache.size
    };
  }
}