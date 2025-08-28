// src/hooks/contacts/useContacts.ts - Hook unifié remplaçant useContactsBob + useContactsRealTime

import { useContactsData } from './useContactsData';
import { useContactsActions } from './useContactsActions';
import { useContactsStats } from './useContactsStats';
import { Contact } from '../../types/contacts.unified';
import { ContactsManager } from '../../services/contacts/ContactsManager';
import { authService } from '../../services/auth.service';
import { apiClient } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper function for country detection (simplified)
const detectCountryFromPhone = (phone: string): string => {
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
};

// Helper function for performance recommendations
const generatePerformanceRecommendations = (metrics: any): string[] => {
  const recommendations: string[] = [];
  
  if (metrics.avgSearchTime > 100) {
    recommendations.push('⚠️ Recherches lentes - Considérer rebuild des index');
  }
  
  if (parseFloat(metrics.cacheHitRate) < 50) {
    recommendations.push('📈 Faible taux de cache - Queries répétées détectées');
  }
  
  if (metrics.queryCacheSize > 100) {
    recommendations.push('🧹 Cache de requêtes volumineux - Nettoyage recommandé');
  }
  
  if (metrics.totalSearches > 1000 && parseFloat(metrics.hitRate) < 80) {
    recommendations.push('🎯 Taux de succès bas - Optimiser les termes de recherche');
  }
  
  if (metrics.indexSizes.search < 100) {
    recommendations.push('🚀 Index léger - Performance optimale maintenue');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('✅ Performance optimale - Système fonctionnant parfaitement');
  }
  
  return recommendations;
};

export interface UseContactsReturn {
  // === DONNÉES ===
  // Nouveau système unifié
  contacts: Contact[];
  phoneContacts: Contact[];
  repertoireContacts: Contact[];
  bobContacts: Contact[];
  invitedContacts: Contact[];
  availableContacts: Contact[];
  
  // Compatibilité ancien système (DEPRECATED mais nécessaire pour migration)
  contactsBruts: Contact[];
  repertoire: Contact[];
  invitations: Contact[];
  
  // États
  loading: boolean;
  error: string | null;
  isLoaded: boolean;
  isSyncBlocked: boolean;
  
  // === STATISTIQUES ===
  stats: any; // ContactsStats mais compatible ancien format
  formattedStats: any;
  getStats: () => Promise<any>; // Fonction legacy
  
  // === ACTIONS PRINCIPALES ===
  // Scan et import
  scannerRepertoireBrut: () => Promise<any>;
  scannerRepertoire: () => Promise<any>; // Alias
  importerTousLesContactsAutomatique: () => Promise<any>;
  importerContactsSelectionnes: (identifiers: string[]) => Promise<any>;
  importerContactsEtSync: (identifiers: string[]) => Promise<any>;
  
  // Gestion contacts
  addContact: (telephone: string) => Promise<void>;
  removeContact: (telephone: string) => Promise<void>;
  inviterContact: (telephone: string) => Promise<any>;
  sendInvitation: (telephone: string) => Promise<void>; // Alias
  
  // === SYNCHRONISATION ===
  syncContactsToStrapi: (contacts?: Contact[]) => Promise<any>;
  syncAvecStrapi: () => Promise<any>; // Legacy
  detectBobUsers: () => Promise<any>;
  forcePullFromStrapi: () => Promise<void>;
  
  // === NETTOYAGE ===
  viderToutStrapiPourUtilisateur: () => Promise<number>;
  supprimerTousLesContacts: () => Promise<void>;
  clearAllDataAndCache: () => Promise<void>;
  clearCache: () => Promise<void>; // Alias legacy pour compatibilité
  blockSync: () => void;
  unblockSync: () => void;
  debloquerSync: () => void; // Alias legacy
  
  // === UTILITAIRES ===
  forcerMiseAJourNoms: () => Promise<void>;
  emergencyStopAll: () => void;
  refreshData: () => Promise<void>;
  
  // === 🚀 NOUVELLES APIs AVANCÉES ===
  
  // Recherche et filtrage
  searchContacts: (query: string) => Promise<Contact[]>;
  getContactsBySource: (source: Contact['source']) => Promise<Contact[]>;
  getContactsWithEmail: () => Promise<Contact[]>;
  getContactsWithoutPhone: () => Promise<Contact[]>;
  getContactsByDateRange: (start: Date, end: Date) => Promise<Contact[]>;
  getRecentlyAdded: (days: number) => Promise<Contact[]>;
  getDuplicateContacts: () => Promise<Contact[][]>;
  groupContactsByCountry: () => Promise<Record<string, Contact[]>>;
  
  // Analytics avancés
  getEngagementMetrics: () => Promise<any>;
  getTrendAnalysis: () => Promise<any>;
  getContactGrowth: () => Promise<any>;
  getGeolocationInsights: () => Promise<any>;
  getContactQualityScore: () => Promise<any>;
  getBobAdoptionRate: () => Promise<any>;
  
  // Cache et performance
  getCacheStats: () => Promise<{ cachedContacts: number; existingContacts: number; bobUsers: number }>;
  getCacheStatus: () => Promise<any>;
  preloadContacts: () => Promise<void>;
  getDebugInfo: () => Promise<any>;
  
  // 🚀 NOUVELLES APIs PERFORMANCE ULTRA-OPTIMISÉES
  
  // Recherche ultra-rapide avec index
  searchContactsOptimized: (query: string) => Promise<Contact[]>;
  getContactsByEmailDomain: (domain: string) => Promise<Contact[]>;
  getContactsByCountryOptimized: (country: string) => Promise<Contact[]>;
  
  // Pagination intelligente
  getContactsPaginated: (page?: number, pageSize?: number, sortBy?: 'nom' | 'date' | 'pays') => Promise<{
    contacts: Contact[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>;
  
  // Métriques performance en temps réel
  getPerformanceMetrics: () => Promise<any>;
  
  // Export/Import avancé
  exportContacts: (format: 'json' | 'csv' | 'vcard') => Promise<string>;
  importFromFile: (data: any, format: 'json' | 'csv' | 'vcard') => Promise<any>;
  
  // Gestion avancée
  exists: (telephone: string) => Promise<boolean>;
  isEmpty: () => Promise<boolean>;
  count: () => Promise<number>;
  
  // === ÉTATS LEGACY (pour compatibilité) ===
  scanProgress: { current: number; total: number; percentage: number } | null;
  lastScanDate: string | null;
  syncStatus: string;
  syncState: any;
  syncStats: any;
}

export const useContacts = (): UseContactsReturn => {
  // Utiliser les hooks spécialisés
  const data = useContactsData();
  const actions = useContactsActions();
  const statsHook = useContactsStats();

  // === MAPPAGE VERS FORMAT LEGACY ===

  // Fonction getStats legacy - VERSION CACHE SEULEMENT (pas d'API)
  const getStats = async () => {
    // 🚫 DÉSACTIVÉ: Ne plus appeler refreshData qui cause la boucle API
    // await actions.refreshData();
    
    // 🔧 FIX: Obtenir les stats directement du manager au lieu d'utiliser l'état du hook
    const manager = ContactsManager.getInstance();
    const currentStats = await manager.getStats();
    
    console.log('🎯 getStats - Stats utilisées:', currentStats);
    
    // Format attendu par l'ancien système  
    return {
      totalContactsTelephone: currentStats?.totalTelephone || data.phoneContacts.length,
      contactsAvecEmail: currentStats?.contactsAvecEmail || data.phoneContacts.filter(c => c.email).length,
      contactsComplets: currentStats?.contactsComplets || data.phoneContacts.filter(c => (c as any).isComplete).length,
      mesContacts: currentStats?.mesContacts || data.repertoireContacts.length,
      contactsAvecBob: currentStats?.contactsAvecBob || data.bobContacts.length,
      contactsSansBob: currentStats?.contactsSansBob || ((currentStats?.mesContacts || 0) - (currentStats?.contactsAvecBob || 0)),
      contactsDisponibles: currentStats?.contactsDisponibles || data.availableContacts.length,
      contactsInvites: currentStats?.invitationsEnCours || data.invitedContacts.length,
      invitationsEnCours: currentStats?.invitations || data.invitedContacts.length,
      invitationsAcceptees: 0, // TODO: Calculer depuis les invitations acceptées
      totalInvitationsEnvoyees: currentStats?.invitations || data.invitedContacts.length,
      tauxCuration: currentStats?.tauxCuration || '0%',
      pourcentageBob: currentStats?.pourcentageBob || '0%'
    };
  };

  // Actions mappées vers format legacy
  const scannerRepertoireBrut = async () => {
    const result = await actions.scanPhoneContacts();
    return {
      success: result.errors.length === 0,
      contacts: result.imported,
      errors: result.errors
    };
  };

  const importerTousLesContactsAutomatique = async () => {
    const result = await actions.importAllContacts();
    return {
      success: result.errors.length === 0,
      imported: result.imported,
      total: result.total,
      errors: result.errors
    };
  };

  const importerContactsSelectionnes = async (identifiers: string[]) => {
    const result = await actions.importSelectedContacts(identifiers);
    return {
      success: result.errors.length === 0,
      imported: result.imported,
      total: result.total,
      errors: result.errors
    };
  };

  const importerContactsEtSync = async (identifiers: string[], progressCallback?: (current: number, total: number) => void) => {
    // Import + sync immédiate (en mode silencieux pour éviter double notification)
    const importResult = await actions.importSelectedContacts(identifiers, { 
      silent: true,
      onComplete: async () => {
        // Callback pour mise à jour des stats après import
        console.log('🔄 Mise à jour stats après import...');
        try {
          if (actions.refreshData) {
            await actions.refreshData();
          }
        } catch (error) {
          console.warn('⚠️ Erreur callback refreshData:', error);
        }
      },
      onProgress: progressCallback
    });
    
    if (importResult.imported > 0) {
      const syncResult = await actions.syncToStrapi();
      return {
        ...importResult,
        syncSuccess: syncResult.success,
        syncCreated: syncResult.created,
        syncUpdated: syncResult.updated
      };
    }
    
    return importResult;
  };

  const addContact = async (telephone: string) => {
    // Trouver le contact dans les disponibles et l'importer
    const available = data.availableContacts.find(c => c.telephone === telephone);
    if (available) {
      await actions.importSelectedContacts([telephone]);
    }
  };

  const inviterContact = async (telephone: string, method: 'sms' | 'whatsapp' = 'sms') => {
    await actions.inviteContact(telephone, method);
    return { success: true };
  };

  const syncContactsToStrapi = async (contacts?: Contact[]) => {
    return await actions.syncToStrapi(contacts);
  };

  const syncAvecStrapi = async () => {
    return await actions.syncToStrapi();
  };

  const detectBobUsers = async () => {
    // 🔧 FIX: Utiliser directement le repository pour éviter les problèmes de timing
    const manager = ContactsManager.getInstance();
    const currentRepertoire = await manager.repository.getRepertoireContacts();
    console.log(`🔍 Détection Bob pour ${currentRepertoire.length} contacts du répertoire`);
    
    if (currentRepertoire.length === 0) {
      console.warn('⚠️ Aucun contact dans le répertoire pour la détection Bob');
      return { success: false, message: 'Aucun contact à vérifier' };
    }
    
    await actions.detectBobUsers(currentRepertoire);
    // 🔧 FIX: Forcer la mise à jour des stats après détection Bob
    await statsHook.refreshStats();
    return { success: true };
  };

  const forcePullFromStrapi = async () => {
    console.log('🔄 FORCE PULL FROM STRAPI - Resynchronisation complète...');
    
    try {
      // 1. 🌐 Récupérer tous les contacts depuis Strapi
      console.log('📥 1/4 - Récupération des contacts depuis Strapi...');
      
      const manager = ContactsManager.getInstance();
      const token = await authService.getValidToken();
      
      if (!token) {
        console.error('❌ Pas de token d\'authentification pour la sync Strapi');
        throw new Error('Token d\'authentification manquant');
      }
      const response = await apiClient.get('/contacts?pagination[limit]=1000', token);
      
      if (!response.ok) {
        console.error('❌ Erreur récupération contacts Strapi:', response.status);
        throw new Error(`Erreur serveur: ${response.status}`);
      }
      
      const strapiData = await response.json();
      const strapiContacts = strapiData.data || [];
      
      console.log(`📊 ${strapiContacts.length} contacts trouvés sur Strapi`);
      
      // 2. 🔄 Synchroniser les contacts dans le cache local
      console.log('💾 2/4 - Synchronisation dans le cache local...');
      
      if (strapiContacts.length > 0) {
        // Convertir les contacts Strapi vers le format local
        const localContacts = strapiContacts.map((sc: any) => ({
          id: sc.documentId || sc.id?.toString() || `temp_${Date.now()}_${Math.random()}`,
          documentId: sc.documentId,
          strapiId: sc.id?.toString(),
          nom: sc.nom || sc.attributes?.nom || 'Contact',
          prenom: sc.prenom || sc.attributes?.prenom || '',
          telephone: sc.telephone || sc.attributes?.telephone || '',
          email: sc.email || sc.attributes?.email || '',
          isOnBob: true, // Tous les contacts de Strapi sont des utilisateurs Bob
          dateAjout: sc.createdAt || sc.attributes?.createdAt || new Date().toISOString(),
          source: 'strapi'
        }));
        
        // Stocker ces contacts directement dans le repository via AsyncStorage
        
        // Sauvegarder en tant que contacts répertoire (contacts ajoutés)
        await AsyncStorage.setItem('CONTACTS_REPERTOIRE', JSON.stringify(localContacts));
        console.log(`💾 ${localContacts.length} contacts sauvegardés dans le cache répertoire`);
        
        // Aussi les marquer comme contacts Bob détectés
        const bobContacts = localContacts.map(c => ({ ...c, isOnBob: true }));
        await AsyncStorage.setItem('CONTACTS_BOB_DETECTED', JSON.stringify(bobContacts));
        console.log(`👥 ${bobContacts.length} contacts marqués comme utilisateurs Bob`);
      } else {
        console.log('ℹ️ Aucun contact à synchroniser depuis Strapi');
      }
      
      // 3. 🔄 Rafraîchir les données du cache
      console.log('🔄 3/4 - Rafraîchissement des données...');
      await actions.refreshData();
      
      // 4. 📊 Forcer la mise à jour des statistiques
      console.log('📊 4/4 - Mise à jour des statistiques...');
      await statsHook.refreshStats();
      
      console.log('✅ FORCE PULL FROM STRAPI terminé avec succès');
      
      // Retourner un résumé pour l'interface
      return {
        success: true,
        contactsFound: strapiContacts.length,
        message: strapiContacts.length > 0 
          ? `${strapiContacts.length} contacts synchronisés depuis Strapi`
          : 'Aucun contact trouvé sur Strapi'
      };
      
    } catch (error) {
      console.error('❌ Erreur lors du force pull depuis Strapi:', error);
      
      // En cas d'erreur, essayer au moins un refresh local
      try {
        await actions.refreshData();
        await statsHook.refreshStats();
      } catch (refreshError) {
        console.error('❌ Échec même du refresh local:', refreshError);
      }
      
      throw error;
    }
  };

  const forcerMiseAJourNoms = async () => {
    // Forcer une sync pour mettre à jour les noms
    await actions.syncToStrapi();
  };

  const emergencyStopAll = () => {
    actions.blockSync();
    console.log('🚨 ARRÊT D\'URGENCE - Synchronisation bloquée');
  };

  // === COMPATIBILITÉ LEGACY ===

  const scanProgress = data.loading ? { current: 0, total: 100, percentage: 0 } : null;
  const lastScanDate = new Date().toISOString(); // Simplification
  const syncStatus = data.loading ? 'sync' : 'idle';
  const syncState = { isSync: data.loading };
  const syncStats = { processed: data.contacts.length };

  return {
    // === DONNÉES NOUVELLES ===
    contacts: data.bobContacts,        // ✅ CORRECTION: contacts = utilisateurs Bob uniquement
    phoneContacts: data.phoneContacts,
    repertoireContacts: data.repertoireContacts,
    bobContacts: data.bobContacts,
    invitedContacts: data.invitedContacts,
    availableContacts: data.availableContacts,
    // allContacts: data.contacts,        // ✅ NOUVEAU: tous les contacts si besoin (commenté pour éviter erreur TS)
    
    // === COMPATIBILITÉ LEGACY ===
    contactsBruts: data.contactsBruts,
    repertoire: data.repertoire,
    invitations: data.invitations,
    
    // États
    loading: data.loading,
    error: data.error,
    isLoaded: data.isLoaded,
    isSyncBlocked: data.isSyncBlocked,
    
    // === STATISTIQUES ===
    stats: statsHook.stats,
    formattedStats: statsHook.formattedStats,
    getStats,
    
    // === ACTIONS PRINCIPALES ===
    scannerRepertoireBrut,
    scannerRepertoire: scannerRepertoireBrut, // Alias
    importerTousLesContactsAutomatique,
    importerContactsSelectionnes,
    importerContactsEtSync,
    
    // Gestion contacts
    addContact,
    removeContact: actions.removeContact,
    inviterContact,
    sendInvitation: actions.inviteContact, // Alias
    
    // === SYNCHRONISATION ===
    syncContactsToStrapi,
    syncAvecStrapi,
    detectBobUsers,
    forcePullFromStrapi: async () => await forcePullFromStrapi(),
    
    // === NETTOYAGE ===
    viderToutStrapiPourUtilisateur: actions.deleteAllFromStrapi,
    supprimerTousLesContacts: actions.clearAllData,
    clearAllDataAndCache: actions.clearAllData,
    clearCache: actions.clearAllData, // Alias legacy pour compatibilité
    blockSync: actions.blockSync,
    unblockSync: actions.unblockSync,
    debloquerSync: actions.unblockSync, // Alias legacy
    
    // === UTILITAIRES ===
    forcerMiseAJourNoms,
    emergencyStopAll,
    refreshData: actions.refreshData,
    
    // === 🚀 NOUVELLES APIs AVANCÉES ===
    
    // Recherche et filtrage
    searchContacts: async (query: string) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.searchContacts(query);
    },
    
    getContactsBySource: async (source: Contact['source']) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.getBySource(source);
    },
    
    getContactsWithEmail: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      return allContacts.filter(contact => contact.email && contact.email.trim().length > 0);
    },
    
    getContactsWithoutPhone: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      return allContacts.filter(contact => !contact.telephone || contact.telephone.trim().length === 0);
    },
    
    getContactsByDateRange: async (start: Date, end: Date) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      return allContacts.filter(contact => {
        if (!contact.dateAjout) return false;
        const contactDate = new Date(contact.dateAjout);
        return contactDate >= start && contactDate <= end;
      });
    },
    
    getRecentlyAdded: async (days: number = 7) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      return allContacts.filter(contact => {
        if (!contact.dateAjout) return false;
        const contactDate = new Date(contact.dateAjout);
        return contactDate >= cutoffDate;
      });
    },
    
    getDuplicateContacts: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      
      const phoneMap = new Map<string, Contact[]>();
      
      allContacts.forEach(contact => {
        if (!contact.telephone) return;
        const normalizedPhone = contact.telephone.replace(/[^\d+]/g, '');
        if (!phoneMap.has(normalizedPhone)) {
          phoneMap.set(normalizedPhone, []);
        }
        phoneMap.get(normalizedPhone)!.push(contact);
      });
      
      return Array.from(phoneMap.values()).filter(group => group.length > 1);
    },
    
    groupContactsByCountry: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      
      const countryGroups: Record<string, Contact[]> = {};
      
      allContacts.forEach(contact => {
        const country = detectCountryFromPhone(contact.telephone || '') || 'Autre';
        if (!countryGroups[country]) {
          countryGroups[country] = [];
        }
        countryGroups[country].push(contact);
      });
      
      return countryGroups;
    },
    
    // Analytics avancés - Utilisation de ContactsStats
    getEngagementMetrics: async () => {
      const stats = statsHook.stats;
      return {
        totalInteractions: (stats as any)?.total || 0,
        bobAdoption: (stats as any)?.bob || 0,
        invitationRate: (stats as any)?.invitations || 0,
        activeUsers: (stats as any)?.repertoire || 0,
        lastUpdated: new Date().toISOString()
      };
    },
    
    getTrendAnalysis: async () => {
      // Analyser les trends sur les 30 derniers jours (implémentation directe pour éviter référence circulaire)
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentContacts = allContacts.filter(c => c.dateAjout && new Date(c.dateAjout) >= thirtyDaysAgo);
      const veryRecentContacts = allContacts.filter(c => c.dateAjout && new Date(c.dateAjout) >= sevenDaysAgo);
      
      return {
        monthlyGrowth: recentContacts.length,
        weeklyGrowth: veryRecentContacts.length,
        growthRate: recentContacts.length > 0 ? (veryRecentContacts.length / recentContacts.length * 100).toFixed(1) + '%' : '0%',
        trend: veryRecentContacts.length > recentContacts.length / 4 ? 'up' : 'down'
      };
    },
    
    getContactGrowth: async () => {
      await statsHook.refreshStats();
      const stats = statsHook.stats;
      
      // Implémentation directe pour éviter référence circulaire
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recent = allContacts.filter(c => c.dateAjout && new Date(c.dateAjout) >= sevenDaysAgo);
      
      return {
        total: (stats as any)?.repertoire || 0,
        recentAdditions: recent.length,
        projectedMonthly: recent.length * 4,
        qualityScore: (((stats as any)?.bob || 0) / Math.max((stats as any)?.repertoire || 1, 1) * 100).toFixed(1) + '%'
      };
    },
    
    getGeolocationInsights: async () => {
      // Implémentation directe pour éviter référence circulaire
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const allContacts = await repository.getAll();
      
      const countryGroups: Record<string, Contact[]> = {};
      allContacts.forEach(contact => {
        const country = detectCountryFromPhone(contact.telephone || '') || 'Autre';
        if (!countryGroups[country]) countryGroups[country] = [];
        countryGroups[country].push(contact);
      });
      const total = Object.values(countryGroups).reduce((sum, contacts) => sum + contacts.length, 0);
      
      const insights: Record<string, any> = {};
      Object.entries(countryGroups).forEach(([country, contacts]) => {
        insights[country] = {
          count: contacts.length,
          percentage: ((contacts.length / total) * 100).toFixed(1) + '%',
          bobUsers: contacts.filter(c => c.isOnBob).length
        };
      });
      
      return insights;
    },
    
    getContactQualityScore: async () => {
      const allContacts = await data.contacts;
      if (allContacts.length === 0) return { score: 0, details: {} };
      
      const withEmail = allContacts.filter(c => c.email).length;
      const withFullName = allContacts.filter(c => c.nom && c.prenom).length;
      const onBob = allContacts.filter(c => c.isOnBob).length;
      
      const emailScore = (withEmail / allContacts.length) * 30;
      const nameScore = (withFullName / allContacts.length) * 30;  
      const bobScore = (onBob / allContacts.length) * 40;
      
      return {
        score: Math.round(emailScore + nameScore + bobScore),
        details: {
          emailCompletion: Math.round((withEmail / allContacts.length) * 100),
          nameCompletion: Math.round((withFullName / allContacts.length) * 100),
          bobAdoption: Math.round((onBob / allContacts.length) * 100)
        }
      };
    },
    
    getBobAdoptionRate: async () => {
      await statsHook.refreshStats();
      const stats = statsHook.stats;
      const total = (stats as any)?.repertoire || 0;
      const bobUsers = (stats as any)?.bob || 0;
      
      return {
        total,
        bobUsers,
        adoptionRate: total > 0 ? ((bobUsers / total) * 100).toFixed(1) + '%' : '0%',
        remaining: total - bobUsers,
        potential: Math.max(total - bobUsers, 0)
      };
    },
    
    // Cache et performance
    getCacheStats: async () => {
      const manager = ContactsManager.getInstance();
      const sync = (manager as any).contactsSync;
      return sync.getCacheStats();
    },
    
    getCacheStatus: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.getDebugInfo();
    },
    
    preloadContacts: async () => {
      const manager = ContactsManager.getInstance();
      await manager.ensureInitialized();
      console.log('✅ Contacts préchargés');
    },
    
    getDebugInfo: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const cacheStats = await (async () => {
        const manager = ContactsManager.getInstance();
        const sync = (manager as any).contactsSync;
        return sync.getCacheStats();
      })();
      const debugInfo = await repository.getDebugInfo();
      
      return {
        ...debugInfo,
        cache: cacheStats,
        timestamp: new Date().toISOString(),
        version: '2.0-extended'
      };
    },
    
    // Export/Import avancé
    exportContacts: async (format: 'json' | 'csv' | 'vcard' = 'json') => {
      const allContacts = await data.contacts;
      
      if (format === 'json') {
        return JSON.stringify(allContacts, null, 2);
      }
      
      if (format === 'csv') {
        const headers = ['nom', 'prenom', 'telephone', 'email', 'isOnBob', 'dateAjout'];
        const csvRows = [headers.join(',')];
        
        allContacts.forEach(contact => {
          const row = headers.map(header => {
            const value = contact[header as keyof Contact];
            return typeof value === 'string' ? `"${value}"` : String(value || '');
          });
          csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
      }
      
      if (format === 'vcard') {
        return allContacts.map(contact => {
          return [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${contact.nom || ''} ${contact.prenom || ''}`,
            `N:${contact.nom || ''};${contact.prenom || ''};;;`,
            contact.telephone ? `TEL:${contact.telephone}` : '',
            contact.email ? `EMAIL:${contact.email}` : '',
            'END:VCARD'
          ].filter(Boolean).join('\n');
        }).join('\n\n');
      }
      
      return JSON.stringify(allContacts);
    },
    
    importFromFile: async (data: any, format: 'json' | 'csv' | 'vcard' = 'json') => {
      // Implémentation basique - peut être étendue
      console.log(`📥 Import depuis format ${format}:`, data);
      return { success: true, imported: 0, message: 'Import basique - à implémenter selon besoins' };
    },
    
    // Gestion avancée
    exists: async (telephone: string) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.exists(telephone);
    },
    
    isEmpty: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.isEmpty();
    },
    
    count: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.count();
    },
    
    // === 🚀 APIs PERFORMANCE ULTRA-OPTIMISÉES ===
    
    // Recherche ultra-rapide avec index (O(1) au lieu de O(n))
    searchContactsOptimized: async (query: string) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.searchContacts(query);
    },
    
    // Recherche par domaine email (Gmail, Outlook, etc.)
    getContactsByEmailDomain: async (domain: string) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.getContactsByEmailDomain(domain);
    },
    
    // Recherche par pays optimisée
    getContactsByCountryOptimized: async (country: string) => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.getContactsByCountry(country);
    },
    
    // Pagination intelligente avec tri
    getContactsPaginated: async (page: number = 1, pageSize: number = 50, sortBy: 'nom' | 'date' | 'pays' = 'nom') => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      return await repository.getContactsPaginated(page, pageSize, sortBy);
    },
    
    // Métriques de performance en temps réel
    getPerformanceMetrics: async () => {
      const manager = ContactsManager.getInstance();
      const repository = (manager as any).repository;
      const metrics = repository.getPerformanceMetrics();
      
      return {
        ...metrics,
        timestamp: new Date().toISOString(),
        summary: {
          searchPerformance: `${metrics.avgSearchTime.toFixed(1)}ms moyenne`,
          cacheEfficiency: metrics.cacheHitRate,
          indexHealth: `${metrics.indexSizes.search + metrics.indexSizes.names + metrics.indexSizes.emails + metrics.indexSizes.countries} entrées`,
          recommendations: generatePerformanceRecommendations(metrics)
        }
      };
    },
    
    // === ÉTATS LEGACY ===
    scanProgress,
    lastScanDate,
    syncStatus,
    syncState,
    syncStats
  };
};