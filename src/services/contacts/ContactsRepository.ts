// src/services/contacts/ContactsRepository.ts - Repository unifié pour tous les contacts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Contact, 
  ContactsStats, 
  ContactChangeType, 
  ContactsChangeCallback, 
  UnsubscribeFn,
  CACHE_KEYS,
  CONTACTS_CONFIG 
} from '../../types/contacts.unified';
import { ContactsStatsCalculator } from './ContactsStats';

export class ContactsRepository {
  private contacts = new Map<string, Contact>(); // Cache en mémoire, key = telephone
  private subscribers = new Set<ContactsChangeCallback>();
  private isLoaded = false;
  private loadPromise: Promise<void> | null = null;
  
  // === 🚀 OPTIMISATIONS PERFORMANCE ===
  
  // Index de recherche pour accès O(1) au lieu de O(n)
  private searchIndex = new Map<string, Set<string>>(); // terme → Set<telephone>
  private nameIndex = new Map<string, Set<string>>(); // prénom/nom normalisé → Set<telephone>
  private emailIndex = new Map<string, Set<string>>(); // domaine email → Set<telephone>
  private countryIndex = new Map<string, Set<string>>(); // pays → Set<telephone>
  
  // Cache des requêtes fréquentes pour éviter recalculs
  private queryCache = new Map<string, { result: Contact[], timestamp: number }>();
  private readonly QUERY_CACHE_TTL = 2 * 60 * 1000; // 2 minutes
  
  // Métriques de performance
  private performanceMetrics = {
    searchHits: 0,
    searchMisses: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgSearchTime: 0,
    totalSearches: 0
  };

  constructor() {
    this.loadFromCache();
  }

  // === GESTION DU CACHE ===

  private async loadFromCache(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;
    
    this.loadPromise = this._loadFromCache();
    return this.loadPromise;
  }

  private async _loadFromCache(): Promise<void> {
    try {
      console.log('📂 ContactsRepository - Chargement cache...');
      
      // Charger tous les types de contacts en parallèle
      const [contactsBruts, repertoire, bobUsers, invitations, metadata] = await Promise.all([
        this.loadCacheCollection(CACHE_KEYS.CONTACTS_BRUTS),
        this.loadCacheCollection(CACHE_KEYS.REPERTOIRE),
        this.loadCacheCollection(CACHE_KEYS.BOB_USERS),
        this.loadCacheCollection(CACHE_KEYS.INVITATIONS),
        this.loadCacheMetadata()
      ]);

      // 🔍 DÉBOGAGE: Afficher ce qui est chargé depuis le cache
      console.log('📂 Cache chargé - contactsBruts:', contactsBruts.length);
      console.log('📂 Cache chargé - repertoire:', repertoire.length);
      console.log('📂 Cache chargé - bobUsers:', bobUsers.length);
      console.log('📂 Cache chargé - invitations:', invitations.length);
      console.log('📂 Cache metadata:', metadata);

      // Convertir et unifier tous les contacts
      this.unifyAndLoadContacts({
        contactsBruts,
        repertoire,
        bobUsers,
        invitations
      });

      this.isLoaded = true;
      console.log(`✅ ContactsRepository - ${this.contacts.size} contacts chargés`);
      
      // 🔍 DÉTECTION: Cache vide = besoin de scan téléphone
      if (this.contacts.size === 0) {
        console.log('🔍 DÉTECTION: Cache complètement vide - Scan téléphone nécessaire');
        this.notifySubscribers('scan_needed', []);
      } else {
        // Notifier les abonnés normalement
        this.notifySubscribers('load', Array.from(this.contacts.values()));
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement cache contacts:', error);
      this.isLoaded = true; // On considère comme chargé même en cas d'erreur
    }
  }

  private async loadCacheCollection(key: string): Promise<any[]> {
    try {
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.warn(`⚠️ Erreur cache ${key}:`, error);
      return [];
    }
  }

  private async loadCacheMetadata(): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.METADATA);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      return {};
    }
  }

  private unifyAndLoadContacts(data: {
    contactsBruts: any[];
    repertoire: any[];
    bobUsers: any[];
    invitations: any[];
  }): void {
    this.contacts.clear();

    // 1. Contacts du téléphone (source: phone)
    data.contactsBruts.forEach(raw => {
      if (raw.telephone) {
        const contact: Contact = {
          id: raw.id || `phone_${raw.telephone}`,
          telephone: raw.telephone,
          nom: raw.nom,
          prenom: raw.prenom,
          email: raw.email,
          source: 'phone',
          rawData: raw.rawContact,
          hasEmail: raw.hasEmail || false,
          isComplete: raw.isComplete || false,
          dateAjout: raw.dateAjout || new Date().toISOString(),
          strapiId: raw.strapiId,
          internalId: raw.internalId
        };
        this.contacts.set(contact.telephone, contact);
      }
    });

    // 2. Contacts du répertoire Bob (source: repertoire)
    data.repertoire.forEach(rep => {
      if (rep.telephone) {
        const existing = this.contacts.get(rep.telephone);
        if (existing && existing.source === 'phone') {
          // Upgrade phone contact to repertoire contact
          const contact: Contact = {
            ...existing,
            source: 'repertoire',
            aSurBob: rep.aSurBob,
            dateImport: rep.dateAjout || rep.dateImport || new Date().toISOString(),
            strapiId: rep.strapiId || rep.documentId || rep.id,
            internalId: rep.internalId
          };
          this.contacts.set(contact.telephone, contact);
        } else if (!existing) {
          // Nouveau contact répertoire
          const contact: Contact = {
            id: rep.id || rep.documentId || `repo_${rep.telephone}`,
            telephone: rep.telephone,
            nom: rep.nom,
            prenom: rep.prenom,
            email: rep.email,
            source: 'repertoire',
            aSurBob: rep.aSurBob,
            dateAjout: rep.dateAjout || new Date().toISOString(),
            dateImport: rep.dateImport || rep.dateAjout || new Date().toISOString(),
            strapiId: rep.strapiId || rep.documentId || rep.id,
            internalId: rep.internalId
          };
          this.contacts.set(contact.telephone, contact);
        }
      }
    });

    // 3. Utilisateurs Bob (source: bob)
    data.bobUsers.forEach(bob => {
      if (bob.telephone) {
        const existing = this.contacts.get(bob.telephone);
        if (existing) {
          // Upgrade existing contact to bob contact
          const contact: Contact = {
            ...existing,
            source: 'bob',
            username: bob.username,
            bobizPoints: bob.bobizPoints || 0,
            niveau: bob.niveau || 'Débutant',
            estEnLigne: bob.estEnLigne || false,
            derniereActivite: bob.derniereActivite || new Date().toISOString(),
            statut: bob.statut || 'ami',
            aSurBob: true,
            avatar: bob.avatar
          };
          this.contacts.set(contact.telephone, contact);
        } else {
          // Nouveau utilisateur Bob
          const contact: Contact = {
            id: bob.id || `bob_${bob.telephone}`,
            telephone: bob.telephone,
            nom: bob.nom,
            prenom: bob.prenom,
            email: bob.email,
            source: 'bob',
            username: bob.username,
            bobizPoints: bob.bobizPoints || 0,
            niveau: bob.niveau || 'Débutant',
            estEnLigne: bob.estEnLigne || false,
            derniereActivite: bob.derniereActivite || new Date().toISOString(),
            statut: bob.statut || 'ami',
            aSurBob: true,
            dateAjout: bob.dateAjout || new Date().toISOString(),
            avatar: bob.avatar
          };
          this.contacts.set(contact.telephone, contact);
        }
      }
    });

    // 4. Invitations (source: invited)
    data.invitations.forEach(inv => {
      if (inv.telephone) {
        const existing = this.contacts.get(inv.telephone);
        const contact: Contact = {
          id: inv.id || inv.documentId || `inv_${inv.telephone}`,
          telephone: inv.telephone,
          nom: inv.nom,
          prenom: inv.prenom,
          email: inv.email,
          source: 'invited',
          invitation: {
            id: inv.id || inv.documentId,
            documentId: inv.documentId,
            statut: inv.statut || 'envoye',
            dateEnvoi: inv.dateEnvoi || inv.dateAjout || new Date().toISOString(),
            dateReponse: inv.dateReponse,
            type: inv.type || 'sms',
            message: inv.message
          },
          aSurBob: false,
          dateAjout: inv.dateAjout || new Date().toISOString(),
          strapiId: inv.strapiId || inv.documentId || inv.id
        };

        // Si contact existe déjà, on merge avec les données d'invitation
        if (existing) {
          Object.assign(existing, { 
            invitation: contact.invitation,
            strapiId: contact.strapiId 
          });
        } else {
          this.contacts.set(contact.telephone, contact);
        }
      }
    });

    console.log(`📊 Contacts unifiés par source:`, {
      phone: Array.from(this.contacts.values()).filter(c => c.source === 'phone').length,
      repertoire: Array.from(this.contacts.values()).filter(c => c.source === 'repertoire').length,
      bob: Array.from(this.contacts.values()).filter(c => c.source === 'bob').length,
      invited: Array.from(this.contacts.values()).filter(c => c.source === 'invited').length,
      total: this.contacts.size
    });
    
    // 🚀 Construire les index de recherche pour performance optimale
    if (this.contacts.size > 0) {
      this.buildSearchIndexes();
      
      // Démarrer le nettoyage périodique du cache (une seule fois)
      setTimeout(() => {
        setInterval(() => this.cleanupQueryCache(), 5 * 60 * 1000); // Toutes les 5 minutes
      }, 1000);
    }
  }

  private async saveToCache(): Promise<void> {
    try {
      const contacts = Array.from(this.contacts.values());
      
      // Séparer par type pour le cache legacy
      const contactsBruts = contacts.filter(c => c.source === 'phone');
      const repertoire = contacts.filter(c => c.source === 'repertoire' || c.source === 'bob');
      const bobUsers = contacts.filter(c => c.source === 'bob');
      const invitations = contacts.filter(c => c.source === 'invited');

      // Sauvegarder en parallèle
      await Promise.all([
        AsyncStorage.setItem(CACHE_KEYS.CONTACTS_BRUTS, JSON.stringify(contactsBruts)),
        AsyncStorage.setItem(CACHE_KEYS.REPERTOIRE, JSON.stringify(repertoire)),
        AsyncStorage.setItem(CACHE_KEYS.BOB_USERS, JSON.stringify(bobUsers)),
        AsyncStorage.setItem(CACHE_KEYS.INVITATIONS, JSON.stringify(invitations)),
        AsyncStorage.setItem(CACHE_KEYS.METADATA, JSON.stringify({
          version: CONTACTS_CONFIG.cacheVersion,
          lastUpdate: new Date().toISOString(),
          totalContacts: contacts.length
        }))
      ]);

      console.log(`💾 Cache sauvegardé: ${contacts.length} contacts`);
    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
    }
  }

  // === API PUBLIQUE ===

  async ensureLoaded(): Promise<void> {
    if (!this.isLoaded) {
      await this.loadFromCache();
    }
  }

  async getAll(): Promise<Contact[]> {
    await this.ensureLoaded();
    return Array.from(this.contacts.values());
  }

  async getByPhone(telephone: string): Promise<Contact | null> {
    await this.ensureLoaded();
    return this.contacts.get(telephone) || null;
  }

  async getBySource(source: Contact['source']): Promise<Contact[]> {
    await this.ensureLoaded();
    return Array.from(this.contacts.values()).filter(c => c.source === source);
  }

  async add(contact: Contact): Promise<void> {
    await this.ensureLoaded();
    this.contacts.set(contact.telephone, contact);
    
    // 🚀 Mettre à jour les index de recherche
    this.indexContact(contact);
    
    await this.saveToCache();
    this.notifySubscribers('add', contact);
  }

  async addMany(contacts: Contact[]): Promise<void> {
    await this.ensureLoaded();
    contacts.forEach(contact => {
      this.contacts.set(contact.telephone, contact);
      // 🚀 Mettre à jour les index de recherche
      this.indexContact(contact);
    });
    await this.saveToCache();
    this.notifySubscribers('load', Array.from(this.contacts.values()));
  }

  // 🚀 OPTIMISATION: Sauvegarder le cache manuellement (pour batch mode)
  async forceSaveToCache(): Promise<void> {
    await this.saveToCache();
  }

  // 🚀 OPTIMISATION: Notifier les changements manuellement (pour batch mode)
  async notifyChange(type: ContactChangeType): Promise<void> {
    this.notifySubscribers(type, Array.from(this.contacts.values()));
  }

  async update(telephone: string, updates: Partial<Contact>, skipCache = false): Promise<void> {
    await this.ensureLoaded();
    const existing = this.contacts.get(telephone);
    
    console.log(`🔧 ContactsRepository.update - Téléphone: ${telephone}`);
    console.log(`🔍 Contact existant trouvé:`, !!existing);
    
    if (existing) {
      console.log(`📝 Mise à jour contact:`, { 
        nom: existing.nom, 
        oldSource: existing.source, 
        newSource: updates.source 
      });
      
      const updated = { ...existing, ...updates };
      
      // 🚀 Mettre à jour les index de recherche
      this.removeFromIndexes(existing);
      this.indexContact(updated);
      
      this.contacts.set(telephone, updated);
      if (!skipCache) {
        await this.saveToCache();
        this.notifySubscribers('update', updated);
      }
      
      console.log(`✅ Contact mis à jour avec succès: ${updated.nom} (source: ${updated.source})`);
    } else {
      console.warn(`❌ ContactsRepository.update - Contact introuvable pour téléphone: ${telephone}`);
      console.log(`📊 Repository contient ${this.contacts.size} contacts au total`);
      
      // 🔧 DIAGNOSTIC: Afficher quelques contacts pour debug
      const phoneNumbers = Array.from(this.contacts.keys()).slice(0, 3);
      console.log(`🔍 Quelques téléphones dans le repository:`, phoneNumbers);
    }
  }

  async remove(telephone: string): Promise<void> {
    await this.ensureLoaded();
    const contact = this.contacts.get(telephone);
    const existed = this.contacts.delete(telephone);
    
    if (existed && contact) {
      // 🚀 Supprimer des index de recherche
      this.removeFromIndexes(contact);
      
      await this.saveToCache();
      this.notifySubscribers('remove', telephone);
    }
  }

  async clear(): Promise<void> {
    this.contacts.clear();
    
    // 🚀 Vider tous les index de recherche
    this.searchIndex.clear();
    this.nameIndex.clear();
    this.emailIndex.clear();
    this.countryIndex.clear();
    this.queryCache.clear();
    
    await this.saveToCache();
    this.notifySubscribers('clear');
  }

  // === REQUÊTES SPÉCIALISÉES ===

  async getPhoneContacts(): Promise<Contact[]> {
    return this.getBySource('phone');
  }

  async getRepertoireContacts(): Promise<Contact[]> {
    const repertoire = await this.getBySource('repertoire');
    const bob = await this.getBySource('bob');
    return [...repertoire, ...bob];
  }

  async getBobContacts(): Promise<Contact[]> {
    return this.getBySource('bob');
  }

  async getInvitedContacts(): Promise<Contact[]> {
    return this.getBySource('invited');
  }

  async getAvailableContacts(): Promise<Contact[]> {
    const phone = await this.getPhoneContacts();
    const repertoire = await this.getRepertoireContacts();
    const repertoireTelephones = new Set(repertoire.map(c => c.telephone));
    
    return phone.filter(c => !repertoireTelephones.has(c.telephone));
  }

  // === STATISTIQUES ===

  async calculateStats(): Promise<ContactsStats> {
    await this.ensureLoaded();
    
    console.log('📊 Calcul des stats via ContactsStatsCalculator...');
    const allContacts = Array.from(this.contacts.values());
    
    return ContactsStatsCalculator.calculateStats(allContacts);
  }

  // === OBSERVATEUR PATTERN ===

  subscribe(callback: ContactsChangeCallback): UnsubscribeFn {
    this.subscribers.add(callback);
    
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers(type: ContactChangeType, data?: Contact | Contact[] | string): void {
    this.subscribers.forEach(callback => {
      try {
        callback(type, data);
      } catch (error) {
        console.error('❌ Erreur callback subscriber:', error);
      }
    });
  }

  // === UTILITAIRES ===

  async exists(telephone: string): Promise<boolean> {
    await this.ensureLoaded();
    return this.contacts.has(telephone);
  }

  async count(): Promise<number> {
    await this.ensureLoaded();
    return this.contacts.size;
  }

  async isEmpty(): Promise<boolean> {
    await this.ensureLoaded();
    return this.contacts.size === 0;
  }

  // === 🚀 MÉTHODES D'OPTIMISATION PERFORMANCE ===

  /**
   * Construire les index de recherche pour performance optimale
   */
  private buildSearchIndexes(): void {
    console.log('🔍 Construction des index de recherche...');
    const startTime = Date.now();
    
    // Reset des index
    this.searchIndex.clear();
    this.nameIndex.clear();
    this.emailIndex.clear();
    this.countryIndex.clear();
    
    for (const [telephone, contact] of this.contacts) {
      this.indexContact(contact);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Index construits en ${duration}ms pour ${this.contacts.size} contacts`);
  }

  /**
   * Indexer un contact individuel
   */
  private indexContact(contact: Contact): void {
    const telephone = contact.telephone;
    if (!telephone) return;
    
    // Index de recherche textuelle (tous les termes)
    const searchTerms = [
      contact.nom, contact.prenom, contact.email, contact.telephone,
      `${contact.nom} ${contact.prenom}`.trim()
    ].filter(Boolean);
    
    searchTerms.forEach(term => {
      if (term) {
        // Index par mots (recherche partielle)
        const words = term.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.length >= 2) { // Ignorer les termes trop courts
            if (!this.searchIndex.has(word)) {
              this.searchIndex.set(word, new Set());
            }
            this.searchIndex.get(word)!.add(telephone);
          }
        });
      }
    });
    
    // Index des noms (exact)
    if (contact.nom) {
      const nomNorm = contact.nom.toLowerCase();
      if (!this.nameIndex.has(nomNorm)) {
        this.nameIndex.set(nomNorm, new Set());
      }
      this.nameIndex.get(nomNorm)!.add(telephone);
    }
    
    if (contact.prenom) {
      const prenomNorm = contact.prenom.toLowerCase();
      if (!this.nameIndex.has(prenomNorm)) {
        this.nameIndex.set(prenomNorm, new Set());
      }
      this.nameIndex.get(prenomNorm)!.add(telephone);
    }
    
    // Index email par domaine
    if (contact.email && contact.email.includes('@')) {
      const domain = contact.email.split('@')[1].toLowerCase();
      if (!this.emailIndex.has(domain)) {
        this.emailIndex.set(domain, new Set());
      }
      this.emailIndex.get(domain)!.add(telephone);
    }
    
    // Index par pays (détection depuis téléphone)
    const country = this.detectCountryFromPhone(contact.telephone);
    if (!this.countryIndex.has(country)) {
      this.countryIndex.set(country, new Set());
    }
    this.countryIndex.get(country)!.add(telephone);
  }

  /**
   * Supprimer un contact des index
   */
  private removeFromIndexes(contact: Contact): void {
    const telephone = contact.telephone;
    if (!telephone) return;
    
    // Parcourir tous les index et supprimer les références
    [this.searchIndex, this.nameIndex, this.emailIndex, this.countryIndex].forEach(index => {
      for (const [key, phones] of index) {
        phones.delete(telephone);
        if (phones.size === 0) {
          index.delete(key);
        }
      }
    });
  }

  /**
   * Recherche optimisée avec index (O(1) au lieu de O(n))
   */
  async searchContacts(query: string): Promise<Contact[]> {
    const startTime = Date.now();
    this.performanceMetrics.totalSearches++;
    
    // Vérifier le cache de requêtes
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = this.queryCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.QUERY_CACHE_TTL) {
      this.performanceMetrics.cacheHits++;
      console.log(`🎯 Cache hit pour recherche: "${query}"`);
      return cached.result;
    }
    
    this.performanceMetrics.cacheMisses++;
    
    // Recherche dans les index
    const queryLower = query.toLowerCase().trim();
    const matchingPhones = new Set<string>();
    
    // 1. Recherche exacte dans les noms
    if (this.nameIndex.has(queryLower)) {
      this.nameIndex.get(queryLower)!.forEach(phone => matchingPhones.add(phone));
    }
    
    // 2. Recherche par mots dans l'index général
    const queryWords = queryLower.split(/\s+/);
    queryWords.forEach(word => {
      if (word.length >= 2 && this.searchIndex.has(word)) {
        this.searchIndex.get(word)!.forEach(phone => matchingPhones.add(phone));
      }
    });
    
    // 3. Recherche partielle pour les termes courts ou non trouvés
    if (matchingPhones.size === 0 || queryLower.length < 3) {
      // Fallback: recherche dans les clés d'index
      for (const [term, phones] of this.searchIndex) {
        if (term.includes(queryLower) || queryLower.includes(term)) {
          phones.forEach(phone => matchingPhones.add(phone));
        }
      }
    }
    
    // Convertir les téléphones en contacts
    const results: Contact[] = [];
    matchingPhones.forEach(phone => {
      const contact = this.contacts.get(phone);
      if (contact) {
        results.push(contact);
      }
    });
    
    // Trier par pertinence (nom exact > nom partiel > contenu)
    results.sort((a, b) => {
      const aNameMatch = (a.nom?.toLowerCase() === queryLower || a.prenom?.toLowerCase() === queryLower) ? 3 : 0;
      const bNameMatch = (b.nom?.toLowerCase() === queryLower || b.prenom?.toLowerCase() === queryLower) ? 3 : 0;
      
      const aPartialMatch = (a.nom?.toLowerCase().includes(queryLower) || a.prenom?.toLowerCase().includes(queryLower)) ? 2 : 0;
      const bPartialMatch = (b.nom?.toLowerCase().includes(queryLower) || b.prenom?.toLowerCase().includes(queryLower)) ? 2 : 0;
      
      const aContentMatch = (a.email?.toLowerCase().includes(queryLower) || a.telephone?.includes(queryLower)) ? 1 : 0;
      const bContentMatch = (b.email?.toLowerCase().includes(queryLower) || b.telephone?.includes(queryLower)) ? 1 : 0;
      
      const scoreA = aNameMatch + aPartialMatch + aContentMatch;
      const scoreB = bNameMatch + bPartialMatch + bContentMatch;
      
      return scoreB - scoreA;
    });
    
    // Cache du résultat
    this.queryCache.set(cacheKey, {
      result: results,
      timestamp: Date.now()
    });
    
    // Métriques
    const duration = Date.now() - startTime;
    this.performanceMetrics.avgSearchTime = (this.performanceMetrics.avgSearchTime * (this.performanceMetrics.totalSearches - 1) + duration) / this.performanceMetrics.totalSearches;
    
    if (results.length > 0) {
      this.performanceMetrics.searchHits++;
    } else {
      this.performanceMetrics.searchMisses++;
    }
    
    console.log(`🔍 Recherche "${query}": ${results.length} résultats en ${duration}ms`);
    return results;
  }

  /**
   * Recherche par domaine email optimisée
   */
  async getContactsByEmailDomain(domain: string): Promise<Contact[]> {
    const domainLower = domain.toLowerCase();
    const phones = this.emailIndex.get(domainLower) || new Set();
    
    const results: Contact[] = [];
    phones.forEach(phone => {
      const contact = this.contacts.get(phone);
      if (contact) results.push(contact);
    });
    
    return results;
  }

  /**
   * Recherche par pays optimisée
   */
  async getContactsByCountry(country: string): Promise<Contact[]> {
    const phones = this.countryIndex.get(country) || new Set();
    
    const results: Contact[] = [];
    phones.forEach(phone => {
      const contact = this.contacts.get(phone);
      if (contact) results.push(contact);
    });
    
    return results;
  }

  /**
   * Pagination intelligente avec offset virtuel
   */
  async getContactsPaginated(page: number = 1, pageSize: number = 50, sortBy: 'nom' | 'date' | 'pays' = 'nom'): Promise<{
    contacts: Contact[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const allContacts = Array.from(this.contacts.values());
    
    // Tri optimisé selon le critère
    allContacts.sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return (a.nom || '').localeCompare(b.nom || '');
        case 'date':
          const dateA = a.dateAjout ? new Date(a.dateAjout).getTime() : 0;
          const dateB = b.dateAjout ? new Date(b.dateAjout).getTime() : 0;
          return dateB - dateA; // Plus récent en premier
        case 'pays':
          const countryA = this.detectCountryFromPhone(a.telephone);
          const countryB = this.detectCountryFromPhone(b.telephone);
          return countryA.localeCompare(countryB);
        default:
          return 0;
      }
    });
    
    const totalCount = allContacts.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;
    const contacts = allContacts.slice(offset, offset + pageSize);
    
    return {
      contacts,
      totalCount,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }

  /**
   * Métriques de performance
   */
  getPerformanceMetrics(): any {
    const hitRate = this.performanceMetrics.totalSearches > 0 
      ? ((this.performanceMetrics.searchHits / this.performanceMetrics.totalSearches) * 100).toFixed(1)
      : '0.0';
    
    const cacheHitRate = (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses) > 0
      ? ((this.performanceMetrics.cacheHits / (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)) * 100).toFixed(1)
      : '0.0';
    
    return {
      ...this.performanceMetrics,
      hitRate: hitRate + '%',
      cacheHitRate: cacheHitRate + '%',
      indexSizes: {
        search: this.searchIndex.size,
        names: this.nameIndex.size,
        emails: this.emailIndex.size,
        countries: this.countryIndex.size
      },
      queryCacheSize: this.queryCache.size
    };
  }

  /**
   * Nettoyage périodique du cache de requêtes
   */
  private cleanupQueryCache(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.queryCache.forEach((value, key) => {
      if (now - value.timestamp > this.QUERY_CACHE_TTL) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.queryCache.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cache nettoyé: ${keysToDelete.length} requêtes expirées supprimées`);
    }
  }

  /**
   * Détection pays depuis numéro (helper privé)
   */
  private detectCountryFromPhone(phone: string): string {
    if (!phone) return 'Autre';
    const normalized = phone.replace(/[^\d+]/g, '');
    if (normalized.startsWith('+33') || (normalized.startsWith('0') && normalized.length === 10)) return 'France';
    if (normalized.startsWith('+1')) return 'USA/Canada';
    if (normalized.startsWith('+49')) return 'Allemagne';
    if (normalized.startsWith('+44')) return 'Royaume-Uni';
    if (normalized.startsWith('+39')) return 'Italie';
    if (normalized.startsWith('+34')) return 'Espagne';
    if (normalized.startsWith('+32')) return 'Belgique';
    if (normalized.startsWith('+41')) return 'Suisse';
    if (normalized.startsWith('+212')) return 'Maroc';
    return 'Autre';
  }

  // === MIGRATION ET MAINTENANCE ===

  async migrateFromLegacyCache(): Promise<void> {
    // Migration depuis l'ancien système si nécessaire
    const legacyKeys = [
      '@bob_contacts_bruts_cache',
      '@bob_repertoire_cache', 
      '@bob_contacts_cache',
      '@bob_invitations_cache'
    ];

    for (const key of legacyKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          console.log(`🔄 Migration cache legacy: ${key}`);
          await AsyncStorage.removeItem(key); // Clean legacy
        }
      } catch (error) {
        console.warn(`⚠️ Erreur migration ${key}:`, error);
      }
    }
  }

  async clearAllCache(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEYS.CONTACTS_BRUTS),
      AsyncStorage.removeItem(CACHE_KEYS.REPERTOIRE),
      AsyncStorage.removeItem(CACHE_KEYS.BOB_USERS),
      AsyncStorage.removeItem(CACHE_KEYS.INVITATIONS),
      AsyncStorage.removeItem(CACHE_KEYS.METADATA),
      AsyncStorage.removeItem(CACHE_KEYS.CONFIG)
    ]);
    
    this.contacts.clear();
    this.notifySubscribers('clear');
    console.log('🧹 Cache contacts complètement vidé');
  }

  // === DEBUG ===

  async getDebugInfo(): Promise<any> {
    await this.ensureLoaded();
    const contacts = Array.from(this.contacts.values());
    
    return {
      totalContacts: contacts.length,
      bySource: {
        phone: contacts.filter(c => c.source === 'phone').length,
        repertoire: contacts.filter(c => c.source === 'repertoire').length,
        bob: contacts.filter(c => c.source === 'bob').length,
        invited: contacts.filter(c => c.source === 'invited').length
      },
      cacheKeys: Object.values(CACHE_KEYS),
      isLoaded: this.isLoaded,
      subscribersCount: this.subscribers.size
    };
  }
}

// Export du singleton pour réutilisation
export const contactsRepository = new ContactsRepository();