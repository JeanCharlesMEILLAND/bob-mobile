// src/hooks/useContactsBob.ts - Version complète avec connexion Strapi
// 🚨 DÉPRÉCIÉ: Utilisez useContacts() depuis hooks/contacts/useContacts.ts
// Ce hook sera supprimé dans une version future
import React, { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storage.service';
import { syncService } from '../services/sync.service';
import { invitationsService } from '../services/invitations.service';
import { authService } from '../services/auth.service';
import { contactsService } from '../services/contacts.service';
import { apiClient } from '../services/api';
import type { Contact } from '../types/contacts.types';

interface ContactBob {
  id: number;
  username: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  avatar?: string;
  bobizPoints: number;
  niveau: 'Débutant' | 'Ami fidèle' | 'Super Bob' | 'Légende';
  estEnLigne: boolean;
  derniereActivite: string;
  statut: 'ami' | 'en_attente' | 'invite' | 'bloque';
  dateAjout: string;
}

interface ContactBrut {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  hasEmail: boolean;
  isComplete: boolean;
  rawContact?: any;
}

interface ContactRepertoire {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  aSurBob: boolean;
  estInvite: boolean;
  dateInvitation?: string;
  nombreInvitations?: number;
  lastUpdated?: string;
  source?: 'curation' | 'import' | 'manual' | 'strapi';
}

interface InvitationContact {
  id: number;
  telephone: string;
  nom: string;
  type: 'sms' | 'whatsapp' | 'email';
  statut: 'envoye' | 'accepte' | 'refuse' | 'expire' | 'annule';
  dateEnvoi: string;
  dateRelance?: string;
  nombreRelances?: number;
  codeParrainage: string;
}

interface ScanProgress {
  phase: 'permissions' | 'reading' | 'processing' | 'complete';
  progress: number;
  currentCount?: number;
  totalCount?: number;
  message?: string;
}

// 🆕 NOUVEAU: Status de synchronisation
interface SyncStatus {
  state: 'idle' | 'uploading' | 'downloading' | 'success' | 'error' | 'retrying';
  progress: number;
  message: string;
  lastSync?: string;
  errors?: string[];
  retryCount?: number;
  maxRetries?: number;
}

const STORAGE_KEYS = {
  CONTACTS_BRUTS: '@bob_contacts_bruts',
  REPERTOIRE: '@bob_repertoire_cache',
  CONTACTS_BOB: '@bob_contacts_bob',
  INVITATIONS: '@bob_invitations',
  INVITATIONS_HISTORY: '@bob_invitations_history',
  LAST_SCAN: '@bob_last_scan',
  SCAN_METADATA: '@bob_scan_metadata',
};

const createMockUsersBob = (): ContactBob[] => [
  {
    id: 1,
    username: 'marie_d',
    nom: 'Dupont',
    prenom: 'Marie',
    telephone: '+33612345678',
    email: 'marie@email.com',
    bobizPoints: 150,
    niveau: 'Ami fidèle',
    estEnLigne: true,
    derniereActivite: '2025-08-20T10:30:00Z',
    statut: 'ami',
    dateAjout: '2025-08-15T08:00:00Z',
  },
  {
    id: 2,
    username: 'pierre_m',
    nom: 'Martin',
    prenom: 'Pierre',
    telephone: '+33687654321',
    email: 'pierre@email.com',
    bobizPoints: 89,
    niveau: 'Débutant',
    estEnLigne: false,
    derniereActivite: '2025-08-19T18:45:00Z',
    statut: 'ami',
    dateAjout: '2025-08-16T14:00:00Z',
  },
  {
    id: 3,
    username: 'sophie_b',
    nom: 'Bernard',
    prenom: 'Sophie',
    telephone: '+33611223344',
    bobizPoints: 310,
    niveau: 'Super Bob',
    estEnLigne: true,
    derniereActivite: '2025-08-20T11:15:00Z',
    statut: 'en_attente',
    dateAjout: '2025-08-17T09:00:00Z',
  },
];

export const useContactsBob = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncBlocked, setIsSyncBlocked] = useState(false); // 🚫 Bloquer sync après reset

  // 🔧 Helper: Parser nom complet en nom/prénom (copie de sync.service.ts)
  const parseFullNameHelper = (fullName: string): { nom: string; prenom: string } => {
    if (!fullName || !fullName.trim()) {
      return { nom: '', prenom: '' };
    }

    const cleaned = fullName.trim();
    
    // Cas spéciaux avec séparateurs
    if (cleaned.includes(' - ')) {
      // "Nautivela - Julien" → prenom: "Julien", nom: "Nautivela"
      const parts = cleaned.split(' - ');
      return {
        prenom: parts[1]?.trim() || '',
        nom: parts[0]?.trim() || '',
      };
    }
    
    // Séparation standard par espaces
    const parts = cleaned.split(' ');
    
    if (parts.length === 1) {
      // Un seul mot → tout dans nom
      return { nom: parts[0], prenom: '' };
    }
    
    if (parts.length === 2) {
      // "Marie Patalagoïty" → prenom: "Marie", nom: "Patalagoïty"
      return {
        prenom: parts[0],
        nom: parts[1],
      };
    }
    
    // Plus de 2 mots → dernier mot = nom, le reste = prénom
    // "Jean-Charles MEILLAND" → prenom: "Jean-Charles", nom: "MEILLAND"
    const nom = parts[parts.length - 1];
    const prenom = parts.slice(0, -1).join(' ');
    
    return { nom, prenom };
  };
  const [isSyncInProgress, setIsSyncInProgress] = useState(false); // 🆕 Flag pour éviter les opérations concurrentes
  const [token, setToken] = useState<string | null>(null); // 🆕 NOUVEAU: Token JWT
  
  const [contactsBruts, setContactsBruts] = useState<ContactBrut[]>([]);
  const [repertoire, setRepertoire] = useState<ContactRepertoire[]>([]);
  const [contacts, setContacts] = useState<ContactBob[]>([]);
  const [invitations, setInvitations] = useState<InvitationContact[]>([]);
  
  // Debug: Log quand contactsBruts change
  React.useEffect(() => {
    console.log('🔍 contactsBruts STATE CHANGED:', {
      length: contactsBruts.length,
      timestamp: new Date().toISOString(),
      stack: new Error().stack?.split('\n')[1], // Pour voir d'où ça vient
      isZero: contactsBruts.length === 0,
      warning: contactsBruts.length === 0 ? '⚠️ CONTACTSBRUTS REMIS À ZÉRO!' : '✅ ContactsBruts contient des données'
    });
    
    // Si contactsBruts passe à zéro de manière inattendue, log plus d'infos
    if (contactsBruts.length === 0) {
      console.log('💥 DÉTAIL DE LA REMISE À ZÉRO:', {
        repertoireLength: repertoire.length,
        contactsLength: contacts.length,
        isLoadingState: isLoading,
        fullStackTrace: new Error().stack
      });
    }
  }, [contactsBruts.length]);
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    phase: 'complete',
    progress: 0,
  });
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  
  // 🚨 FLAG D'ARRÊT D'URGENCE GLOBAL
  const [emergencyStop, setEmergencyStop] = useState(false);

  // 🆕 NOUVEAU: Status de synchronisation
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'idle',
    progress: 0,
    message: 'Prêt à synchroniser',
    maxRetries: 3,
    retryCount: 0,
  });

  // 🆕 NOUVEAU: Charger le token au démarrage (après le cache)
  useEffect(() => {
    const loadTokenAndSync = async () => {
      const storedToken = await storageService.getToken();
      setToken(storedToken);
      // Token sync will be handled by the token useEffect below
    };
    
    loadTokenAndSync();
  }, []);

  useEffect(() => {
    const logTimeout = setTimeout(() => {
      console.log('🔄 Hook state changed:');
      console.log('  📲 contactsBruts:', contactsBruts.length);
      console.log('  📱 repertoire (mes contacts):', repertoire.length);
      console.log('  👥 contacts Bob:', contacts.length);
      console.log('  📤 invitations:', invitations.length);
      console.log('  🔑 token:', token ? 'PRÉSENT' : 'ABSENT');
    }, 100);

    return () => clearTimeout(logTimeout);
  }, [contactsBruts.length, repertoire.length, contacts.length, invitations.length, token]);
  
  // 🆕 NOUVEAU: Synchroniser avec Strapi (version avec token direct)
  const syncAvecStrapiWithToken = useCallback(async (directToken?: string, specificContacts?: any[]) => {
    // 🚫 Vérifier si la sync est bloquée après reset
    if (isSyncBlocked) {
      console.warn('🚫 Synchronisation bloquée après reset Strapi - Utilisez "Débloquer sync" pour réactiver');
      return;
    }
    
    const tokenToUse = directToken || token;
    if (!tokenToUse) {
      console.warn('⚠️ Pas de token pour sync Strapi');
      return;
    }

    // 🔧 UTILISER les contacts spécifiques ou le répertoire complet
    const contactsToSync = specificContacts || repertoire;
    console.log('📋 syncAvecStrapiWithToken - Mode:', specificContacts ? 'Contacts spécifiques' : 'Répertoire complet');
    console.log('📊 syncAvecStrapiWithToken - Contacts à traiter:', contactsToSync.length);
    
    try {
      console.log('🔄 Synchronisation avec Strapi avec token direct...');
      setIsLoading(true);
      
      // 🚀 SI contacts spécifiques fournis, les pousser vers Strapi AVANT de récupérer l'état
      if (specificContacts && specificContacts.length > 0) {
        console.log('📤 PUSH des nouveaux contacts vers Strapi...');
        const syncResult = await syncService.syncContactsAvecStrapi(contactsToSync, {
          batchSize: 1, // Un par un pour éviter les erreurs
          forceSync: true
        });
        console.log('✅ Résultat sync vers Strapi:', {
          success: syncResult.success,
          contactsSync: syncResult.contactsSync,
          errors: syncResult.errors.length
        });
      }
      
      // 1. Récupérer l'état depuis Strapi (après avoir poussé les nouveaux)
      const strapiState = await syncService.getFullState();
      
      // 2. Mettre à jour les invitations depuis Strapi
      const invitationsStrapi = strapiState.invitations.map((inv: any) => ({
        id: inv.documentId || inv.id, // Utiliser documentId en priorité pour Strapi 5
        documentId: inv.documentId,
        numericId: inv.id, // Garder l'ID numérique pour les opérations
        telephone: inv.telephone,
        nom: inv.nom,
        type: inv.type as 'sms' | 'whatsapp',
        statut: inv.statut,
        dateEnvoi: inv.dateEnvoi,
        nombreRelances: inv.nombreRelances || 0,
        codeParrainage: inv.codeParrainage,
      }));
      
      setInvitations(invitationsStrapi);
      
      // 3. 🆕 RÉCUPÉRER LES CONTACTS EXISTANTS depuis Strapi
      let currentRepertoire = repertoire;
      if (strapiState.contacts && strapiState.contacts.length > 0) {
        console.log(`📥 Récupération de ${strapiState.contacts.length} contacts depuis Strapi...`);
        
        const contactsStrapi: ContactRepertoire[] = strapiState.contacts.map((contact: any, index: number) => {
          // console.log(`🔍 DEBUG Contact ${index}:`, { 
          //   id: contact.id, 
          //   nom: contact.nom, 
          //   prenom: contact.prenom, 
          //   telephone: contact.telephone 
          // }); // Commenté pour réduire les logs
          
          const nomFinal = contact.prenom && contact.nom 
            ? `${contact.prenom} ${contact.nom}` 
            : contact.nom || contact.prenom || 'Contact';
            
          // console.log(`📝 Nom final: "${nomFinal}"`); // Commenté pour réduire les logs
          
          return {
            id: contact.id ? contact.id.toString() : `strapi-${index}-${Date.now()}`,
            nom: nomFinal,
            telephone: contact.telephone || '',
            email: contact.email || undefined,
            aSurBob: contact.aSurBob || false,
            estInvite: !!contact.estInvite,
            dateInvitation: contact.dateInvitation,
            nombreInvitations: contact.nombreInvitations || 0,
            lastUpdated: contact.lastUpdated || new Date().toISOString(),
            source: 'strapi',
          };
        });
        
        // Éliminer les doublons par ID
        const uniqueContactsStrapi = contactsStrapi.filter((contact, index, self) => 
          self.findIndex(c => c.id === contact.id) === index
        );
        
        currentRepertoire = uniqueContactsStrapi;
        setRepertoire(uniqueContactsStrapi);
        console.log(`✅ ${uniqueContactsStrapi.length} contacts importés depuis Strapi dans le répertoire local (${contactsStrapi.length - uniqueContactsStrapi.length} doublons éliminés)`);
        
        // Sauvegarder immédiatement
        await saveCachedData(contactsBruts, uniqueContactsStrapi, contacts, invitationsStrapi);
      }
      
      // 4. Transformer les contacts en users automatiquement (utiliser currentRepertoire)
      if (currentRepertoire.length > 0) {
        console.log('🔄 Transformation automatique contacts → users...');
        // Convertir ContactRepertoire[] vers Contact[] pour l'API
        const contactsForApi: Contact[] = currentRepertoire.map(r => ({
          id: r.id, // Keep as string for Contact interface
          nom: r.nom,
          telephone: r.telephone || '',
          email: r.email,
          groupes: [],
          dateAjout: r.lastUpdated || new Date().toISOString(),
          actif: true,
          aSurBob: r.aSurBob,
        }));
        
        const enrichedContacts = await syncService.transformContactsToUsers(contactsForApi, tokenToUse);
        
        // Convertir Contact[] vers ContactRepertoire[] pour l'état local
        const enrichedRepertoire: ContactRepertoire[] = enrichedContacts.map(c => {
          const originalContact = currentRepertoire.find(r => r.telephone === c.telephone);
          return {
            id: originalContact?.id || c.id.toString(),
            nom: c.nom,
            telephone: c.telephone || '',
            email: c.email,
            aSurBob: c.aSurBob || false,
            estInvite: originalContact?.estInvite || false,
            dateInvitation: originalContact?.dateInvitation,
            nombreInvitations: originalContact?.nombreInvitations,
            lastUpdated: new Date().toISOString(),
            source: originalContact?.source || 'curation',
          };
        });
        
        // Extraire les contacts Bob depuis le répertoire enrichi
        const contactsBobDetectes: ContactBob[] = enrichedContacts
          .filter(c => c.aSurBob)
          .map(c => ({
            id: c.id.toString(),
            nom: c.nom,
            telephone: c.telephone || '',
            email: c.email,
            aSurBob: true,
            estInvite: false,
            dateInvitation: null,
            nombreInvitations: 0,
            lastUpdated: new Date().toISOString(),
            source: 'strapi',
          }));

        setRepertoire(enrichedRepertoire);
        setContacts(contactsBobDetectes); // 🔧 Mettre à jour l'état des contacts Bob
        await saveCachedData(contactsBruts, enrichedRepertoire, contactsBobDetectes, invitationsStrapi);
        
        console.log(`✅ ${enrichedRepertoire.filter(c => c.aSurBob).length} contacts transformés en users Bob`);
      }
      
      console.log('✅ Sync Strapi terminée');
      console.log('  📤 Invitations Strapi:', invitationsStrapi.length);
      console.log('  🔍 DEBUG Invitations détaillées:', invitationsStrapi.map(i => ({
        id: i.id,
        documentId: i.documentId,
        telephone: i.telephone,
        statut: i.statut,
        nom: i.nom
      })));
      console.log('  📱 Contacts vérifiés:', repertoire.length);
      
    } catch (error) {
      console.error('❌ Erreur sync Strapi:', error);
    } finally {
      setIsLoading(false);
    }
  }, [contactsBruts, invitations]); // Keep minimal deps needed for operations

  // 🆕 NOUVEAU: Synchroniser avec Strapi (version originale)
    const syncAvecStrapi = useCallback(async () => {
      if (!token) {
        console.warn('⚠️ Pas de token pour sync Strapi');
        return;
      }
      
      try {
        console.log('🔄 Synchronisation avec Strapi...');
        setIsLoading(true);
        
        // 1. Récupérer l'état depuis Strapi
        const strapiState = await syncService.getFullState();
        
        // 2. Mettre à jour les invitations depuis Strapi
        const invitationsStrapi = strapiState.invitations.map((inv: any) => ({
          id: inv.id,
          telephone: inv.telephone,
          nom: inv.nom,
          type: inv.type as 'sms' | 'whatsapp',
          statut: inv.statut,
          dateEnvoi: inv.dateEnvoi,
          nombreRelances: inv.nombreRelances || 0,
          codeParrainage: inv.codeParrainage,
        }));
        
        setInvitations(invitationsStrapi);
        
        // 3. 🆕 RÉCUPÉRER LES CONTACTS EXISTANTS depuis Strapi
        let currentRepertoire = repertoire;
        if (strapiState.contacts && strapiState.contacts.length > 0) {
          console.log(`📥 Récupération de ${strapiState.contacts.length} contacts depuis Strapi...`);
          
          const contactsStrapi: ContactRepertoire[] = strapiState.contacts.map((contact: any, index: number) => {
            // console.log(`🔍 DEBUG Contact ${index} (autre endroit):`, { 
            //   id: contact.id, 
            //   nom: contact.nom, 
            //   prenom: contact.prenom, 
            //   telephone: contact.telephone 
            // }); // Commenté pour réduire les logs
            
            const nomFinal = contact.prenom && contact.nom 
              ? `${contact.prenom} ${contact.nom}` 
              : contact.nom || contact.prenom || 'Contact';
              
            // console.log(`📝 Nom final (autre endroit): "${nomFinal}"`); // Commenté pour réduire les logs
            
            return {
              id: contact.id ? contact.id.toString() : `strapi-${index}-${Date.now()}`,
              nom: nomFinal,
              telephone: contact.telephone || '',
              email: contact.email || undefined,
              aSurBob: contact.aSurBob || false,
              estInvite: !!contact.estInvite,
              dateInvitation: contact.dateInvitation,
              nombreInvitations: contact.nombreInvitations || 0,
              lastUpdated: contact.lastUpdated || new Date().toISOString(),
              source: 'strapi',
            };
          });
          
          // Éliminer les doublons par ID
          const uniqueContactsStrapi = contactsStrapi.filter((contact, index, self) => 
            self.findIndex(c => c.id === contact.id) === index
          );
          
          currentRepertoire = uniqueContactsStrapi;
          setRepertoire(uniqueContactsStrapi);
          console.log(`✅ ${uniqueContactsStrapi.length} contacts importés depuis Strapi dans le répertoire local (${contactsStrapi.length - uniqueContactsStrapi.length} doublons éliminés)`);
          
          // Sauvegarder immédiatement
          await saveCachedData(contactsBruts, uniqueContactsStrapi, contacts, invitationsStrapi);
        }
        
        // 4. Transformer les contacts en users automatiquement (utiliser currentRepertoire)
        if (currentRepertoire.length > 0) {
          console.log('🔄 Transformation automatique contacts → users...');
          // Convertir ContactRepertoire[] vers Contact[] pour l'API
          const contactsForApi: Contact[] = currentRepertoire.map(r => ({
            id: typeof r.id === 'string' ? parseInt(r.id) || 0 : r.id,
            nom: r.nom,
            telephone: r.telephone,
            email: r.email,
            groupes: [],
            dateAjout: r.lastUpdated || new Date().toISOString(),
            actif: true,
            aSurBob: r.aSurBob,
          }));
          
          const enrichedContacts = await syncService.transformContactsToUsers(contactsForApi, token);
          
          // Convertir Contact[] vers ContactRepertoire[] pour l'état local
          const enrichedRepertoire: ContactRepertoire[] = enrichedContacts.map(c => {
            const originalContact = currentRepertoire.find(r => r.telephone === c.telephone);
            return {
              id: originalContact?.id || c.id.toString(),
              nom: c.nom,
              telephone: c.telephone || '',
              email: c.email,
              aSurBob: c.aSurBob || false,
              estInvite: originalContact?.estInvite || false,
              dateInvitation: originalContact?.dateInvitation,
              nombreInvitations: originalContact?.nombreInvitations,
              lastUpdated: new Date().toISOString(),
              source: originalContact?.source || 'curation',
            };
          });
          
          // Extraire les contacts Bob depuis le répertoire enrichi  
          const contactsBobDetectes: ContactBob[] = enrichedContacts
            .filter(c => c.aSurBob)
            .map(c => ({
              id: c.id.toString(),
              nom: c.nom,
              telephone: c.telephone || '',
              email: c.email,
              aSurBob: true,
              estInvite: false,
              dateInvitation: null,
              nombreInvitations: 0,
              lastUpdated: new Date().toISOString(),
              source: 'strapi',
            }));

          setRepertoire(enrichedRepertoire);
          setContacts(contactsBobDetectes); // 🔧 Mettre à jour l'état des contacts Bob
          await saveCachedData(contactsBruts, enrichedRepertoire, contactsBobDetectes, invitationsStrapi);
          
          console.log(`✅ ${enrichedRepertoire.filter(c => c.aSurBob).length} contacts transformés en users Bob`);
        }
        
        console.log('✅ Sync Strapi terminée');
        console.log('  📤 Invitations Strapi:', invitationsStrapi.length);
        console.log('  📱 Contacts vérifiés:', repertoire.length);
        
      } catch (error) {
        console.error('❌ Erreur sync Strapi:', error);
      } finally {
        setIsLoading(false);
      }
    }, [token]);

  const migrateOldCache = async () => {
    try {
      console.log('🔄 Vérification migration cache...');
      
      const scanMetadata = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_METADATA);
      let currentVersion = '1.0.0';
      
      if (scanMetadata) {
        const metadata = JSON.parse(scanMetadata);
        currentVersion = metadata.version || '1.0.0';
      }
      
      console.log('📊 Version cache actuelle:', currentVersion);
      
      if (currentVersion === '1.1.0' || currentVersion === '1.0.0') {
        console.log('🔄 Migration cache v1.x → v2.0...');
        
        const oldRepertoire = await AsyncStorage.getItem(STORAGE_KEYS.REPERTOIRE);
        if (oldRepertoire) {
          const oldContacts = JSON.parse(oldRepertoire);
          console.log(`📱 Migration: ${oldContacts.length} contacts de l'ancien répertoire`);
          
          const contactsBrutsFromOld: ContactBrut[] = oldContacts.map((contact: any, index: number) => ({
            id: contact.id || `migrated_${index}`,
            nom: contact.nom,
            telephone: contact.telephone,
            email: contact.email,
            hasEmail: !!contact.email,
            isComplete: !!(contact.nom && contact.telephone && contact.email),
          }));
          
          await AsyncStorage.setItem(STORAGE_KEYS.CONTACTS_BRUTS, JSON.stringify(contactsBrutsFromOld));
          console.log('✅ ContactsBruts migrés');
          
          await AsyncStorage.removeItem(STORAGE_KEYS.REPERTOIRE);
          console.log('🗑️ Ancien répertoire vidé pour re-sélection');
        }
        
        const newMetadata = {
          lastScanDate: new Date().toISOString(),
          contactsBrutsCount: 0,
          repertoireCount: 0,
          bobUsersCount: 0,
          invitationsCount: 0,
          version: '2.0.0',
          migrated: true,
          migrationDate: new Date().toISOString(),
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.SCAN_METADATA, JSON.stringify(newMetadata));
        console.log('✅ Migration terminée vers v2.0.0');
        
        return true;
      }
      
      console.log('✅ Cache déjà à jour');
      return false;
      
    } catch (error) {
      console.error('❌ Erreur migration cache:', error);
      return false;
    }
  };

  // Charger les données cache en priorité
  useEffect(() => {
    console.log('🚀 DEBUT - Lancement loadCachedData au montage du hook');
    loadCachedData();
  }, []);

  // 🔧 DÉSACTIVÉE: Synchronisation automatique pour éviter de re-sync les contacts existants
  // Maintenant on ne synchronise que lors d'imports spécifiques
  useEffect(() => {
    console.log('🔍 Token effect:', { token: !!token, isLoading });
    if (token && !isLoading) {
      console.log('✅ Token disponible - Synchronisation automatique désactivée (sync seulement lors d\'imports)');
      // syncAvecStrapiWithToken(token).catch(error => {
      //   console.warn('⚠️ Erreur sync Strapi au démarrage:', error);
      // });
    }
  }, [token]); // Removed syncAvecStrapiWithToken from dependencies to prevent loop

  // Surveillance du state repertoire pour le dashboard
  useEffect(() => {
    if (repertoire.length > 0) {
      console.log('✅ Répertoire chargé, dashboard prêt:', repertoire.length, 'contacts');
    }
  }, [repertoire.length]);

  const loadCachedData = async () => {
    try {
      console.log('📂 Chargement cache...');
      
      const migrationDone = await migrateOldCache();
      
      if (migrationDone) {
        setTimeout(() => {
          Alert.alert(
            'Migration effectuée',
            'Vos contacts ont été migrés vers la nouvelle version. Vous devez maintenant re-sélectionner vos contacts depuis votre répertoire téléphonique.',
            [{ text: 'Compris', style: 'default' }]
          );
        }, 1000);
      }
      
      // PRIORITY: Charger le répertoire en premier pour le dashboard
      const cachedRepertoire = await AsyncStorage.getItem(STORAGE_KEYS.REPERTOIRE);
      if (cachedRepertoire) {
        const parsed = JSON.parse(cachedRepertoire);
        console.log('📱 🚀 PRIORITÉ - Cache repertoire trouvé:', parsed.length, 'mes contacts Bob');
        setRepertoire(parsed);
      }
      
      // Puis charger le reste en parallèle
      const [
        cachedContactsBruts,
        cachedContacts, 
        cachedInvitations, 
        lastScan, 
        scanMetadata
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_BRUTS),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_BOB),
        AsyncStorage.getItem(STORAGE_KEYS.INVITATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN),
        AsyncStorage.getItem(STORAGE_KEYS.SCAN_METADATA),
      ]);

      let loadedCount = 1; // Répertoire déjà chargé

      if (cachedContactsBruts) {
        const parsed = JSON.parse(cachedContactsBruts);
        console.log('📲 Cache contacts bruts trouvé:', parsed.length, 'contacts du téléphone');
        console.log('🔍 Exemple contacts bruts du cache:', parsed.slice(0, 2));
        setContactsBruts(parsed);
        loadedCount++;
      } else {
        console.log('⚠️ Aucun cache contacts bruts trouvé - vous devez scanner votre répertoire téléphonique');
      }
      
      if (cachedContacts) {
        const parsed = JSON.parse(cachedContacts);
        console.log('👥 Cache contacts Bob trouvé:', parsed.length, 'utilisateurs Bob');
        setContacts(parsed);
        loadedCount++;
      }
      
      if (cachedInvitations) {
        const parsed = JSON.parse(cachedInvitations);
        console.log('📤 Cache invitations trouvé:', parsed.length, 'invitations');
        setInvitations(parsed);
        loadedCount++;
      }
      
      if (lastScan) {
        setLastScanDate(lastScan);
        console.log('⏰ Dernier scan:', lastScan);
      }

      if (scanMetadata) {
        const metadata = JSON.parse(scanMetadata);
        console.log('📊 Métadonnées scan:', metadata);
      }

      console.log(`✅ Cache chargé: ${loadedCount} collections trouvées`);
    } catch (error) {
      console.error('❌ Erreur chargement cache contacts:', error);
    }
  };

  const saveCachedData = async (
    newContactsBruts?: ContactBrut[],
    newRepertoire?: ContactRepertoire[], 
    newContacts?: ContactBob[], 
    newInvitations?: InvitationContact[]
  ) => {
    try {
      console.log('💾 Sauvegarde cache...');
      
      const contactsBrutsToSave = newContactsBruts || contactsBruts;
      const repertoireToSave = newRepertoire || repertoire;
      const contactsToSave = newContacts || contacts;
      const invitationsToSave = newInvitations || invitations;
      
      const scanMetadata = {
        lastScanDate: new Date().toISOString(),
        contactsBrutsCount: contactsBrutsToSave.length,
        repertoireCount: repertoireToSave.length,
        bobUsersCount: contactsToSave.length,
        invitationsCount: invitationsToSave.length,
        version: '2.0.0',
      };
      
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CONTACTS_BRUTS, JSON.stringify(contactsBrutsToSave)),
        AsyncStorage.setItem(STORAGE_KEYS.REPERTOIRE, JSON.stringify(repertoireToSave)),
        AsyncStorage.setItem(STORAGE_KEYS.CONTACTS_BOB, JSON.stringify(contactsToSave)),
        AsyncStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitationsToSave)),
        AsyncStorage.setItem(STORAGE_KEYS.LAST_SCAN, new Date().toISOString()),
        AsyncStorage.setItem(STORAGE_KEYS.SCAN_METADATA, JSON.stringify(scanMetadata)),
      ]);
      
      console.log('✅ Cache sauvegardé avec succès');
      console.log('📊 Données sauvegardées:', {
        contactsBruts: contactsBrutsToSave.length,
        repertoire: repertoireToSave.length, 
        contacts: contactsToSave.length,
        invitations: invitationsToSave.length
      });
      // console.log('🔍 DEBUG Contacts Bob sauvés:', contactsToSave.map(c => ({ nom: c.nom, telephone: c.telephone, aSurBob: c.aSurBob })));
      
      // ⚠️ ALERTE si on sauvegarde des contacts bruts vides alors qu'on en avait
      if (contactsBrutsToSave.length === 0 && contactsBruts.length > 0) {
        console.error('🚨 ALERTE: Tentative de sauvegarde de contactsBruts vides alors qu\'on en a', contactsBruts.length);
        console.error('🚨 Cela peut indiquer un bug de synchronisation !');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
    }
  };

  const scannerRepertoireBrut = useCallback(async (): Promise<ContactBrut[]> => {
    // 🚫 Empêcher le scan pendant une sync
    if (isSyncInProgress) {
      console.log('🚫 Scan bloqué : synchronisation en cours');
      throw new Error('Une synchronisation est déjà en cours');
    }

    setIsLoading(true);
    setError(null);
    
    setScanProgress({ phase: 'permissions', progress: 0, message: 'Vérification des permissions...' });

    try {
      console.log('📲 Début scan contacts bruts du téléphone...');

      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission d\'accès aux contacts refusée');
      }

      setScanProgress({ phase: 'reading', progress: 10, message: 'Lecture des contacts...' });

      let allContacts: Contacts.Contact[] = [];
      let hasMore = true;
      let pageOffset = 0;
      const pageSize = 100;

      while (hasMore) {
        const { data: pageContacts, hasNextPage } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.PhoneNumbers, 
            Contacts.Fields.Name, 
            Contacts.Fields.Emails,
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.ID,
          ],
          sort: Contacts.SortTypes.FirstName,
          pageSize,
          pageOffset,
        });

        allContacts = [...allContacts, ...pageContacts];
        hasMore = hasNextPage;
        pageOffset += pageSize;

        const readProgress = Math.min(10 + (allContacts.length / 1500) * 40, 50);
        setScanProgress({ 
          phase: 'reading', 
          progress: readProgress, 
          currentCount: allContacts.length,
          message: `${allContacts.length} contacts lus...`
        });
      }

      setScanProgress({ phase: 'processing', progress: 60, message: 'Traitement des contacts...' });

      const contactsBrutsFormates: ContactBrut[] = [];
      
      for (let i = 0; i < allContacts.length; i++) {
        const contact = allContacts[i];
        
        if (i % 50 === 0) {
          const processProgress = 60 + (i / allContacts.length) * 30;
          setScanProgress({
            phase: 'processing',
            progress: processProgress,
            currentCount: i,
            totalCount: allContacts.length,
            message: `Traitement ${i}/${allContacts.length}...`
          });
        }

        if (!contact.phoneNumbers?.length || !contact.name?.trim()) {
          continue;
        }

        const telephone = cleanPhoneNumber(contact.phoneNumbers[0].number || '');
        if (!telephone || telephone.length < 8) {
          continue;
        }

        if (contactsBrutsFormates.some(c => c.telephone === telephone)) {
          continue;
        }

        const email = contact.emails?.[0]?.email?.trim();
        const hasEmail = !!email;
        const isComplete = !!(contact.name?.trim() && telephone && email);

        contactsBrutsFormates.push({
          id: contact.id || `contact_${i}`,
          nom: contact.name.trim(),
          telephone,
          email,
          hasEmail,
          isComplete,
          rawContact: contact,
        });
      }

      setScanProgress({ phase: 'complete', progress: 100, message: `${contactsBrutsFormates.length} contacts disponibles` });

      setContactsBruts(contactsBrutsFormates);
      setLastScanDate(new Date().toISOString());
      await saveCachedData(contactsBrutsFormates, repertoire, contacts, invitations);

      console.log(`✅ Scan brut terminé: ${contactsBrutsFormates.length} contacts récupérés`);

      setTimeout(() => {
        setScanProgress({ phase: 'complete', progress: 0 });
      }, 2000);

      return contactsBrutsFormates;

    } catch (err: any) {
      console.error('❌ Erreur scan contacts bruts:', err);
      setError(err.message);
      setScanProgress({ phase: 'complete', progress: 0 });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [repertoire, contacts, invitations, isSyncInProgress]);

  const cleanPhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+33' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+') && /^[67]/.test(cleaned) && cleaned.length === 10) {
      cleaned = '+33' + cleaned;
    } else if (!cleaned.startsWith('+') && cleaned.length >= 8) {
      if (cleaned.length === 10 && cleaned.startsWith('1')) {
        cleaned = '+1' + cleaned;
      } else if (cleaned.length === 11 && cleaned.startsWith('44')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length >= 9) {
        cleaned = '+33' + cleaned;
      }
    }
    
    return cleaned.length >= 10 ? cleaned : '';
  };

  const importerContactsSelectionnes = useCallback(async (contactIds: string[]): Promise<void> => {
    setIsLoading(true);
    
    try {
      console.log(`📥 Import de ${contactIds.length} contacts sélectionnés...`);
      console.log(`🔍 ContactsBruts disponibles: ${contactsBruts.length}`);

      // 🔧 FIX: Si contactsBruts est vide, essayer de charger depuis le cache AsyncStorage
      let sourceContactsBruts = contactsBruts;
      
      if (contactsBruts.length === 0) {
        console.log('⚠️ ContactsBruts vide, tentative de chargement depuis le cache...');
        try {
          const cachedData = await AsyncStorage.getItem('@bob_contacts_bruts_cache');
          if (cachedData) {
            sourceContactsBruts = JSON.parse(cachedData);
            console.log(`✅ Chargé ${sourceContactsBruts.length} contacts depuis le cache AsyncStorage`);
          }
        } catch (error) {
          console.warn('⚠️ Erreur chargement cache pour import:', error);
        }
      }

      const contactsAImporter = sourceContactsBruts.filter(c => contactIds.includes(c.id));
      
      console.log(`🔍 Contacts trouvés: ${contactsAImporter.length}/${contactIds.length}`);
      
      if (contactsAImporter.length === 0) {
        throw new Error(`Aucun contact trouvé à importer. Source: ${sourceContactsBruts.length} contacts, IDs: ${contactIds.slice(0, 3)}`);
      }

      const nouveauxContacts: ContactRepertoire[] = contactsAImporter.map(contact => ({
        id: contact.id,
        nom: contact.nom,
        telephone: contact.telephone,
        email: contact.email,
        aSurBob: false,
        estInvite: false,
        nombreInvitations: 0,
        lastUpdated: new Date().toISOString(),
        source: 'curation',
      }));

      const utilisateursBobMock = createMockUsersBob();
      const telephonesBob = utilisateursBobMock.map(u => u.telephone);

      const contactsAvecStatutBob = nouveauxContacts.map(contact => ({
        ...contact,
        aSurBob: telephonesBob.includes(contact.telephone),
      }));

      const nouveauxUtilisateursBob = utilisateursBobMock.filter(user => 
        !contacts.some(c => c.id === user.id) &&
        contactsAvecStatutBob.some(r => r.telephone === user.telephone)
      );

      // Éviter les doublons lors de l'ajout
      setRepertoire(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const nouveauxContacts = contactsAvecStatutBob.filter(c => !existingIds.has(c.id));
        console.log(`📊 Ajout au répertoire: ${nouveauxContacts.length} nouveaux (${contactsAvecStatutBob.length - nouveauxContacts.length} déjà présents)`);
        return [...prev, ...nouveauxContacts];
      });

      if (nouveauxUtilisateursBob.length > 0) {
        setContacts(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const nouveauxUsers = nouveauxUtilisateursBob.filter(c => !existingIds.has(c.id));
          console.log(`👥 Ajout utilisateurs Bob: ${nouveauxUsers.length} nouveaux (${nouveauxUtilisateursBob.length - nouveauxUsers.length} déjà présents)`);
          return [...prev, ...nouveauxUsers];
        });
      }

      // Reconstituer les arrays pour le cache en évitant les doublons
      const existingRepertoireIds = new Set(repertoire.map(c => c.id));
      const nouveauxContactsRepertoire = contactsAvecStatutBob.filter(c => !existingRepertoireIds.has(c.id));
      const nouveauRepertoire = [...repertoire, ...nouveauxContactsRepertoire];

      const existingContactsIds = new Set(contacts.map(c => c.id));
      const nouveauxContactsBobUniques = nouveauxUtilisateursBob.filter(c => !existingContactsIds.has(c.id));
      const nouveauxContactsBob = [...contacts, ...nouveauxContactsBobUniques];
      await saveCachedData(contactsBruts, nouveauRepertoire, nouveauxContactsBob, invitations);

      console.log(`✅ Import terminé: ${contactsAImporter.length} contacts, ${nouveauxUtilisateursBob.length} nouveaux utilisateurs Bob`);
      
      // Logs pour debug
      console.log('📊 État après import:', {
        contactsBruts: contactsBruts.length,
        repertoire: nouveauRepertoire.length,
        contacts: nouveauxContactsBob.length,
        invitations: invitations.length
      });

      // 🔧 FIX: SYNCHRONISER AVEC STRAPI seulement les nouveaux contacts importés
      if (token && contactsAImporter.length > 0) {
        console.log('🔄 IMPORT - Synchronisation des nouveaux contacts avec Strapi...');
        console.log('📋 IMPORT - Contacts à synchroniser:', contactsAImporter.length);
        // console.log('📊 IMPORT - Exemple contact à sync:', contactsAImporter[0]);
        try {
          // 🚀 UTILISER syncAvecStrapiWithToken avec les contacts spécifiques
          console.log('🚀 IMPORT - Appel syncAvecStrapiWithToken avec contacts spécifiques');
          await syncAvecStrapiWithToken(token, contactsAImporter);
          console.log('✅ IMPORT - Synchronisation Strapi terminée après import');
        } catch (syncError) {
          console.error('❌ IMPORT - Erreur sync Strapi après import:', syncError);
          // Ne pas faire échouer tout l'import pour une erreur de sync
        }
      } else {
        console.log('⚠️ IMPORT - Pas de synchronisation:', { hasToken: !!token, contactsCount: contactsAImporter.length });
      }

    } catch (err: any) {
      console.error('❌ Erreur import contacts:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contactsBruts, repertoire, contacts, invitations]);

  // 🆕 OPTIMISÉ: Importer TOUS les contacts automatiquement par tranches
  const importerTousLesContactsAutomatique = useCallback(async () => {
    console.log('🚀 IMPORT AUTOMATIQUE DE TOUS LES CONTACTS - DÉBUT');
    
    // 🚨 FLAG D'ARRÊT D'URGENCE - Seulement si arrêt explicite demandé
    if (emergencyStop) {
      console.log('⏹️ ARRÊT D\'URGENCE: Import automatique annulé - arrêt d\'urgence');
      return;
    }
    
    try {
      // 🔧 FIX: Vérifier et recharger contactsBruts si nécessaire
      console.log(`🔍 État contactsBruts: ${contactsBruts.length} contacts`);
      
      let currentContactsBruts = contactsBruts;
      if (contactsBruts.length === 0) {
        console.log('⚠️ ContactsBruts vide, rechargement direct depuis le cache...');
        
        try {
          const cachedData = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_BRUTS);
          if (cachedData) {
            currentContactsBruts = JSON.parse(cachedData);
            console.log(`✅ Rechargé ${currentContactsBruts.length} contacts depuis le cache`);
            setContactsBruts(currentContactsBruts);
          } else {
            console.log('❌ Aucun cache trouvé - Lancement scan automatique...');
            const scannedContacts = await scannerRepertoireBrut();
            currentContactsBruts = scannedContacts;
          }
        } catch (error) {
          console.error('❌ Erreur rechargement cache:', error);
          return;
        }
      }
      
      // Identifier les contacts non importés
      const telephonesExistants = new Set(repertoire?.map(c => c.telephone?.replace(/[^\+\d]/g, '')) || []);
      const contactsNonImportes = currentContactsBruts.filter(c => 
        c.telephone && !telephonesExistants.has(c.telephone.replace(/[^\+\d]/g, ''))
      );
      
      const totalContacts = contactsNonImportes.length;
      console.log(`📊 ${totalContacts} nouveaux contacts à importer (${currentContactsBruts.length - totalContacts} déjà importés)`);
      
      if (totalContacts === 0) {
        console.log('✅ Aucun nouveau contact à importer');
        return;
      }
      
      // 📱 NOTIFICATION: Début d'import avec progression
      console.log(`🚀 Démarrage import de ${totalContacts} contacts...`);
      
      const currentToken = await authService.getValidToken();
      if (!currentToken) {
        throw new Error('Token d\'authentification requis');
      }
      
      setIsSyncInProgress(true);
      
      // 🚫 BLOQUER autres processus pendant l'import
      console.log('🚫 Blocage autres processus pendant import...');
      
      // ⚠️ PROTECTION: Éviter conflits avec détection Bob automatique
      const importStartTime = Date.now();
      
      // 🎯 IMPORT PAR TRANCHES AUTOMATIQUE - OPTIMISÉ
      const BATCH_SIZE = 500; // Augmenté pour plus de vitesse
      const totalBatches = Math.ceil(totalContacts / BATCH_SIZE);
      let totalProcessed = 0;
      let totalSuccess = 0;
      
      console.log(`📊 Import séquentiel: ${totalBatches} tranches de ${BATCH_SIZE} contacts`);
      
      // Conserver le répertoire de base
      let currentRepertoire = [...repertoire];
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * BATCH_SIZE;
        const endIndex = Math.min(startIndex + BATCH_SIZE, totalContacts);
        const contactsBatch = contactsNonImportes.slice(startIndex, endIndex);
        const batchSize = contactsBatch.length;

        // Logs simplifiés pour la vitesse
        if (batchIndex === 0 || batchIndex === totalBatches - 1 || (batchIndex + 1) % 5 === 0) {
          console.log(`⚡ TRANCHE ${batchIndex + 1}/${totalBatches}: ${batchSize} contacts`);
        }

        try {
          // 🔍 Détection utilisateurs Bob pour cette tranche
          const utilisateursBob = contacts.filter(c => c.aSurBob === true) || [];
          const telephonesBob = utilisateursBob.map(c => c.telephone);
          
          const nouveauxContacts = contactsBatch.map(c => ({
            id: `local-${Date.now()}-${Math.random()}`,
            telephone: c.telephone,
            nom: c.nom,
            email: c.email,
            aSurBob: telephonesBob.includes(c.telephone), // 🔧 FIX: Détecter les utilisateurs Bob
            estInvite: false,
            dateInvitation: undefined,
            nombreInvitations: 0,
            lastUpdated: new Date().toISOString(),
            source: 'import' as const,
          }));
          
          const contactsAvecBobDansLot = nouveauxContacts.filter(c => c.aSurBob).length;
          if (contactsAvecBobDansLot > 0) {
            console.log(`👥 Tranche ${batchIndex + 1}: ${contactsAvecBobDansLot} utilisateurs Bob détectés !`);
          }
          
          // Mise à jour du répertoire local pour cette tranche
          currentRepertoire = [...currentRepertoire, ...nouveauxContacts];
          setRepertoire(currentRepertoire);
          
          // Synchroniser cette tranche avec Strapi directement
          if (currentToken) {
            try {
              // Préparer les contacts pour Strapi avec parsing nom/prénom
              const contactsASync = nouveauxContacts.map(c => {
                const { nom, prenom } = parseFullNameHelper(c.nom || '');
                return {
                  nom,
                  prenom,
                  email: c.email || undefined,
                  telephone: c.telephone || '',
                  source: 'import_repertoire' as const,
                  groupeIds: [] // Aucun groupe par défaut
                };
              });
              
              console.log(`🚀 Sync ${contactsASync.length} contacts avec Strapi...`);
              
              // Import bulk si > 5 contacts, sinon unitaire
              if (contactsASync.length > 5) {
                console.log(`📦 Import BULK de ${contactsASync.length} contacts...`);
                try {
                  const bulkResults = await contactsService.createContactsBulk(contactsASync, currentToken);
                  console.log(`✅ Import bulk réussi: ${bulkResults.length}/${contactsASync.length} contacts créés`);
                  totalSuccess += bulkResults.length;
                } catch (bulkError: any) {
                  console.warn('⚠️ Import bulk échoué, fallback vers import unitaire:', bulkError.message);
                  let unitarySuccess = 0;
                  for (const contact of contactsASync) {
                    try {
                      await contactsService.createContact(contact, currentToken);
                      unitarySuccess++;
                    } catch (unitError) {
                      console.warn(`⚠️ Échec import unitaire contact ${contact.telephone}:`, unitError);
                    }
                  }
                  totalSuccess += unitarySuccess;
                  console.log(`✅ Import unitaire: ${unitarySuccess}/${contactsASync.length} contacts créés`);
                }
              } else {
                console.log(`📝 Import unitaire de ${contactsASync.length} contacts...`);
                let unitarySuccess = 0;
                for (const contact of contactsASync) {
                  try {
                    await contactsService.createContact(contact, currentToken);
                    unitarySuccess++;
                  } catch (unitError) {
                    console.warn(`⚠️ Échec import unitaire contact ${contact.telephone}:`, unitError);
                  }
                }
                totalSuccess += unitarySuccess;
                // Logs réduits pour vitesse
              }
            } catch (syncError: any) {
              console.error(`❌ Erreur sync Strapi tranche ${batchIndex + 1}:`, syncError);
            }
          }
          
          totalProcessed += batchSize;
          const pourcentage = Math.round((totalProcessed / totalContacts) * 100);
          const tempsTrancheMs = Date.now() - (Date.now()); // On calculera le temps réel plus tard
          
          // Affichage progression seulement aux étapes importantes
          if (batchIndex === 0 || batchIndex === totalBatches - 1 || pourcentage % 25 === 0) {
            console.log(`🚀 PROGRESSION: ${pourcentage}% (${totalProcessed}/${totalContacts})`);
          }
          
          // Performance monitoring supprimé pour vitesse
          
          // 🚨 CHECK ARRÊT D'URGENCE entre chaque tranche
          if (emergencyStop) {
            console.log('🚨 ARRÊT D\'URGENCE DÉTECTÉ - Interruption de l\'import automatique');
            break;
          }

          // Import continu sans pause ni logs excessifs
        
        } catch (batchError: any) {
          console.error(`❌ Erreur tranche ${batchIndex + 1}:`, batchError);
        }
      }
      
      console.log(`\n🎉 Import TURBO terminé: ${totalSuccess}/${totalContacts} contacts créés`);
      
      // 🔍 DÉTECTION FINALE UNIQUEMENT
      try {
        // Forcer une synchronisation avec Strapi pour obtenir les utilisateurs Bob
        await syncAvecStrapiWithToken(currentToken);
        console.log('✅ Synchronisation post-import terminée');
      } catch (syncError) {
        console.warn('⚠️ Erreur sync post-import:', syncError);
      }
      
      // 📱 NOTIFICATION: Fin d'import avec résumé
      const contactsAvecBobTotal = currentRepertoire.filter(c => c.aSurBob).length;
      console.log(`📱 Notification finale: Import terminé ! ${totalSuccess} contacts ajoutés, détection Bob en cours...`);
      
    } catch (error: any) {
      console.error('❌ Erreur import automatique:', error);
      // 📱 NOTIFICATION: Erreur
      console.log('📱 Notification erreur: Import échoué');
      throw error;
    } finally {
      setIsSyncInProgress(false);
    }
  }, [contactsBruts, repertoire, authService, scannerRepertoireBrut]);

  // 🔧 LEGACY: Fonction pour compatibilité avec les anciens appels
  const importerContactsEtSync = useCallback(async (contactIds: string[]) => {
    console.log('🔄 importerContactsEtSync appelé avec', contactIds.length, 'IDs - Redirection vers import automatique');
    return importerTousLesContactsAutomatique();
  }, [importerTousLesContactsAutomatique]);


  // 🧹 NETTOYAGE COMPLET: Vider totalement Strapi pour l'utilisateur connecté
  const viderToutStrapiPourUtilisateur = useCallback(async (): Promise<number> => {
    console.log('🧹 NETTOYAGE COMPLET STRAPI - Recherche de TOUS vos contacts...');
    let totalSupprime = 0;
    
    try {
      const currentToken = await authService.getValidToken();
      if (!currentToken) {
        console.error('❌ Pas de token pour nettoyage Strapi');
        return 0;
      }

      // Récupérer TOUS les contacts de l'utilisateur connecté (pagination)
      let page = 1;
      let contacts = [];
      
      do {
        try {
          console.log(`🔍 Récupération page ${page} des contacts Strapi...`);
          const response = await apiClient.get(`/contacts?pagination[page]=${page}&pagination[pageSize]=500`, currentToken);
          
          // Strapi 5 structure: { ok: true, data: { data: [...], meta: {...} } }
          const responseData = await response.json();
          console.log('🔍 DEBUG - Structure réponse:', { ok: response.ok, hasData: !!responseData.data, dataType: typeof responseData.data });
          
          if (response.ok && responseData.data && Array.isArray(responseData.data)) {
            contacts = responseData.data;
            console.log(`📄 Page ${page}: ${contacts.length} contacts trouvés`);
            
            // Supprimer par batch de 50 contacts en parallèle pour optimiser
            const batchSize = 50;
            for (let batchStart = 0; batchStart < contacts.length; batchStart += batchSize) {
              const batch = contacts.slice(batchStart, batchStart + batchSize);
              console.log(`🗑️ Traitement batch ${Math.floor(batchStart/batchSize) + 1}: ${batch.length} contacts...`);
              
              // Supprimer en parallèle le batch actuel
              const deletePromises = batch.map(async (contact) => {
                try {
                  const deleteResponse = await apiClient.delete(`/contacts/${contact.documentId || contact.id}`, currentToken);
                  if (deleteResponse.ok) {
                    return { success: true, contact };
                  } else {
                    console.warn(`⚠️ Échec suppression ${contact.nom || contact.documentId}`);
                    return { success: false, contact };
                  }
                } catch (delError) {
                  console.warn(`⚠️ Erreur suppression ${contact.nom || contact.documentId}:`, delError.message);
                  return { success: false, contact };
                }
              });
              
              // Attendre que tout le batch soit traité
              const results = await Promise.all(deletePromises);
              const successCount = results.filter(r => r.success).length;
              totalSupprime += successCount;
              
              const pourcentageGlobal = Math.round((totalSupprime / responseData.meta?.pagination?.total || totalSupprime) * 100);
              console.log(`✅ Batch terminé: ${successCount}/${batch.length} supprimés (Total: ${totalSupprime} - ${pourcentageGlobal}%)`);
              
              // Affichage progress bar tous les 100 contacts
              if (totalSupprime % 100 === 0 || batchStart + batchSize >= contacts.length) {
                const barre = '●'.repeat(Math.floor(pourcentageGlobal / 5)) + '○'.repeat(20 - Math.floor(pourcentageGlobal / 5));
                console.log(`📊 ${totalSupprime} contacts supprimés ${barre} ${pourcentageGlobal}%`);
              }
            }
            
            page++;
          } else {
            contacts = [];
          }
        } catch (pageError) {
          console.error(`❌ Erreur récupération page ${page}:`, pageError);
          contacts = [];
        }
      } while (contacts.length > 0);
      
      console.log(`🧹 NETTOYAGE TERMINÉ: ${totalSupprime} contacts supprimés de Strapi`);
      
      // 🔄 Mise à jour des stats après suppression
      if (totalSupprime > 0) {
        console.log('🔄 Mise à jour des états locaux après nettoyage...');
        
        // Vider le répertoire local puisque Strapi est vidé
        setRepertoire([]);
        setContacts([]);
        setInvitations([]);
        
        // 🚫 BLOQUER les synchronisations automatiques
        setIsSyncBlocked(true);
        console.log('🚫 Synchronisation automatique BLOQUÉE après reset - Utilisez le bouton "Débloquer sync" pour réactiver');
        
        // Forcer le rafraîchissement des stats
        console.log('📊 Recalcul des stats après suppression...');
        console.log('✅ Stats remises à zéro après nettoyage Strapi');
      }
      
      return totalSupprime;
      
    } catch (error) {
      console.error('❌ Erreur nettoyage complet Strapi:', error);
      return totalSupprime;
    }
  }, []);

  // 🗑️ NOUVEAU: Supprimer tous les contacts en masse avec TURBO  
  const supprimerTousLesContacts = useCallback(async (): Promise<void> => {
    console.log('🗑️ supprimerTousLesContacts - DEBUT avec', repertoire.length, 'contacts');
    try {
      if (repertoire.length === 0) {
        console.log('⚠️ Aucun contact à supprimer');
        return;
      }

      // 🧹 OPTION 1: Nettoyage complet Strapi (plus sûr)
      console.log('🧹 Lancement nettoyage complet Strapi...');
      const totalNettoye = await viderToutStrapiPourUtilisateur();
      console.log(`✅ Nettoyage Strapi terminé: ${totalNettoye} contacts supprimés`);

      // 🗑️ OPTION 2: Si le nettoyage complet échoue, essayer l'ancienne méthode
      if (totalNettoye === 0) {
        console.log('⚠️ Nettoyage complet échoué, tentative avec IDs locaux...');
        
        const contactIds = repertoire
          .map(contact => contact.strapiId || contact.documentId || contact.id)
          .filter(id => id && typeof id === 'string');

        console.log(`🎯 ${contactIds.length} contacts avec IDs locaux à supprimer`);

      // 🗑️ SUPPRESSION PAR TRANCHES DE 200 (modèle import TURBO)
      const currentToken = await authService.getValidToken();
      if (currentToken && contactIds.length > 0) {
        console.log('🗑️ Suppression TURBO démarrée...');
        
        setIsSyncInProgress(true);
        
        try {
          const totalContacts = contactIds.length;
          const BATCH_SIZE_DELETE = 750; // Plus gros car suppression plus rapide
          const totalBatches = Math.ceil(totalContacts / BATCH_SIZE_DELETE);
          let totalDeleted = 0;
          
          console.log(`🚀 Suppression: ${totalBatches} tranches de ${BATCH_SIZE_DELETE} contacts`);
          
          for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
            const startIndex = batchIndex * BATCH_SIZE_DELETE;
            const endIndex = Math.min(startIndex + BATCH_SIZE_DELETE, totalContacts);
            const batchIds = contactIds.slice(startIndex, endIndex);
            const batchSize = batchIds.length;
            
            // Logs simplifiés pour vitesse
            if (batchIndex === 0 || batchIndex === totalBatches - 1) {
              console.log(`🗑️ Suppression tranche ${batchIndex + 1}/${totalBatches}: ${batchSize} contacts`);
            }
            
            try {
              // ⚡ SUPPRESSION DIRECTE avec les IDs corrects des contacts importés
              const deletePromises = batchIds.map(async (contactId) => {
                try {
                  const response = await apiClient.delete(`/contacts/${contactId}`, currentToken);
                  if (response.ok) {
                    return true;
                  } else {
                    console.warn(`⚠️ Suppression échouée ${contactId}: status ${response.status}`);
                    return false;
                  }
                } catch (error: any) {
                  console.error(`❌ Erreur suppression ${contactId}:`, error.message);
                  return false;
                }
              });
              
              const results = await Promise.all(deletePromises);
              const successCount = results.filter(success => success === true).length;
              totalDeleted += successCount;
              
              const pourcentage = Math.round((totalDeleted / totalContacts) * 100);
              
              // Affichage progression seulement aux étapes importantes
              if (batchIndex === 0 || batchIndex === totalBatches - 1 || pourcentage % 50 === 0) {
                console.log(`🗑️ PROGRESSION: ${pourcentage}% (${totalDeleted}/${totalContacts})`);
              }
              
            } catch (batchError) {
              console.error(`❌ Erreur tranche suppression ${batchIndex + 1}:`, batchError);
            }
          }
          
          console.log(`🎉 Suppression TURBO terminée: ${totalDeleted}/${totalContacts} contacts supprimés de Strapi`);
          
          // 🆘 Si peu de suppressions réussies, tenter suppression par téléphone
          if (totalDeleted < totalContacts * 0.5) { // Si moins de 50% supprimés
            console.warn(`⚠️ Seulement ${totalDeleted}/${totalContacts} supprimés avec IDs. Tentative par téléphone...`);
            
            try {
              // 📱 SUPPRESSION DE SECOURS par téléphone (simple et rapide)
              let deletedByPhone = 0;
              for (const contact of repertoire.slice(0, Math.min(50, repertoire.length))) { // Augmenter la limite
                try {
                  const searchResponse = await apiClient.get(`/contacts?filters[telephone][$eq]=${encodeURIComponent(contact.telephone)}`, currentToken);
                  
                  if (searchResponse.data && searchResponse.data.length > 0) {
                    const strapiContact = searchResponse.data[0];
                    const deleteResponse = await apiClient.delete(`/contacts/${strapiContact.documentId || strapiContact.id}`, currentToken);
                    if (deleteResponse.ok) {
                      deletedByPhone++;
                    }
                  }
                } catch (phoneError) {
                  // Ignorer les erreurs pour aller plus vite
                }
              }
              console.log(`📱 Suppression par téléphone: ${deletedByPhone} contacts supprimés`);
            } catch (phoneSuppressionError) {
              console.error('❌ Erreur suppression par téléphone:', phoneSuppressionError);
            }
          }
          
        } catch (error: any) {
          console.error('❌ Erreur suppression TURBO Strapi:', error);
          console.warn('⚠️ Continuing with local deletion...');
        } finally {
          setIsSyncInProgress(false);
        }
      } else {
        console.warn('⚠️ Pas de token valide ou pas de contacts avec IDs Strapi, suppression locale uniquement');
      }
      
      } // 🔧 FIX: Fermeture du bloc if (totalNettoye === 0)

      // Suppression locale (toujours faire même si Strapi échoue)
      console.log('🗑️ Suppression locale de tous les contacts...');
      setRepertoire([]);
      setContacts([]);
      setInvitations([]);
      
      // Sauvegarde du cache local vidé
      await saveCachedData(contactsBruts, [], [], []);
      
      console.log(`✅ Suppression terminée: tous les contacts ont été supprimés`);
      console.log(`📊 État après suppression: {"contacts": 0, "contactsBruts": ${contactsBruts.length}, "invitations": 0, "repertoire": 0}`);
      
    } catch (error: any) {
      console.error('❌ Erreur supprimerTousLesContacts:', error);
      throw error;
    }
  }, [repertoire, contacts, invitations, contactsBruts]);

  const repartirAZero = useCallback(async (): Promise<void> => {
    try {
      console.log('🗑️ Remise à zéro du répertoire...');
      
      setRepertoire([]);
      setContacts([]);
      setInvitations([]);
      
      await saveCachedData(contactsBruts, [], [], []);
      
      console.log('✅ Répertoire remis à zéro');
    } catch (error) {
      console.error('❌ Erreur remise à zéro:', error);
      throw error;
    }
  }, [contactsBruts]);

  const retirerContactsDuRepertoire = useCallback(async (contactIds: string[]): Promise<void> => {
    try {
      console.log(`🗑️ Suppression de ${contactIds.length} contacts du répertoire...`);
      
      const nouveauRepertoire = repertoire.filter(c => !contactIds.includes(c.id));
      const nouvellesInvitations = invitations.filter(inv => 
        !contactIds.some(id => {
          const contact = repertoire.find(c => c.id === id);
          return contact && inv.telephone === contact.telephone;
        })
      );
      
      setRepertoire(nouveauRepertoire);
      setInvitations(nouvellesInvitations);
      
      await saveCachedData(contactsBruts, nouveauRepertoire, contacts, nouvellesInvitations);
      
      console.log(`✅ ${contactIds.length} contacts supprimés du répertoire`);
    } catch (error) {
      console.error('❌ Erreur suppression contacts:', error);
      throw error;
    }
  }, [repertoire, invitations, contacts, contactsBruts]);

  // MODIFIÉ: inviterContact avec Strapi
  const inviterContact = useCallback(async (
    contact: ContactRepertoire, 
    type: 'sms' | 'whatsapp' = 'sms'
  ): Promise<InvitationContact> => {
    setIsLoading(true);
    
    try {
      console.log(`📨 Invitation ${type} à ${contact.nom}`);
      
      const codeParrainage = generateParrainageCode();
      
      // 🆕 NOUVEAU: Créer dans Strapi si token disponible
      let invitationStrapi = null;
      
      if (token) {
        try {
          invitationStrapi = await invitationsService.createInvitation({
            telephone: contact.telephone,
            nom: contact.nom,
            type,
          }, token);
          
          console.log('✅ Invitation créée dans Strapi:', invitationStrapi.id);
        } catch (error: any) {
          console.warn('⚠️ Erreur Strapi, continuant en local:', error);
          
          // Gestion spécifique des erreurs d'invitation
          if (error.message?.includes('invalif') || error.message?.includes('invalid') || error.message?.includes('hook')) {
            console.error('❌ Erreur de validation Strapi (hook invalide):', error.message);
            setError('Erreur de configuration du système d\'invitation. Contactez le support.');
          } else if ((error as any)?.response?.status === 400) {
            console.error('❌ Données invalides pour l\'invitation:', error.message);
            setError('Les données du contact sont invalides pour l\'invitation.');
          } else if ((error as any)?.response?.status === 401) {
            console.error('❌ Token d\'authentification invalide');
            setError('Session expirée. Veuillez vous reconnecter.');
          } else {
            console.error('❌ Erreur inattendue lors de l\'invitation:', error.message);
            setError('Erreur temporaire du serveur. Réessayez plus tard.');
          }
        }
      }
      
      // Créer l'invitation locale (toujours, pour le cache)
      const nouvelleInvitation: InvitationContact = {
        id: invitationStrapi?.id || Date.now() + Math.random(),
        telephone: contact.telephone,
        nom: contact.nom,
        type,
        statut: 'envoye',
        dateEnvoi: invitationStrapi?.dateEnvoi || new Date().toISOString(),
        nombreRelances: 0,
        codeParrainage: invitationStrapi?.codeParrainage || codeParrainage,
      };

      const nouvellesInvitations = [...invitations, nouvelleInvitation];
      const nouveauRepertoire = repertoire.map(c => 
        c.id === contact.id 
          ? { 
              ...c, 
              estInvite: true, 
              dateInvitation: nouvelleInvitation.dateEnvoi,
              nombreInvitations: (c.nombreInvitations || 0) + 1,
              lastUpdated: new Date().toISOString(),
            }
          : c
      );

      setInvitations(nouvellesInvitations);
      setRepertoire(nouveauRepertoire);
      await saveCachedData(contactsBruts, nouveauRepertoire, contacts, nouvellesInvitations);

      console.log(`✅ Invitation envoyée à ${contact.nom}`);
      return nouvelleInvitation;

    } catch (err: any) {
      console.error(`❌ Erreur invitation:`, err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [repertoire, invitations, contacts, contactsBruts, token]);

  // 🆕 NOUVEAU: Relancer une invitation
  const relancerInvitation = useCallback(async (
    contact: ContactRepertoire,
    type: 'sms' | 'whatsapp' = 'sms'
  ): Promise<void> => {
    try {
      console.log(`🔄 Relance invitation ${type} à ${contact.nom}`);
      
      const invitation = invitations.find(inv => inv.telephone === contact.telephone);
      if (!invitation) {
        throw new Error('Invitation introuvable');
      }
      
      // Mettre à jour dans Strapi si connecté
      if (token && invitation.id) {
        try {
          await invitationsService.relanceInvitation(invitation.id, token);
          console.log('✅ Relance enregistrée dans Strapi');
        } catch (error) {
          console.warn('⚠️ Erreur Strapi relance:', error);
        }
      }
      
      // Mettre à jour localement
      const updatedInvitations = invitations.map(inv => 
        inv.id === invitation.id
          ? {
              ...inv,
              nombreRelances: (inv.nombreRelances || 0) + 1,
              dateRelance: new Date().toISOString(),
            }
          : inv
      );
      
      setInvitations(updatedInvitations);
      await saveCachedData(contactsBruts, repertoire, contacts, updatedInvitations);
      
      console.log('✅ Invitation relancée');
    } catch (error) {
      console.error('❌ Erreur relance:', error);
      throw error;
    }
  }, [invitations, repertoire, contacts, contactsBruts, token]);

  // 🆕 NOUVEAU: Annuler une invitation
  const annulerInvitation = useCallback(async (contact: ContactRepertoire): Promise<void> => {
    try {
      console.log(`❌ Annulation invitation ${contact.nom}`);
      
      const updatedInvitations = invitations.map(inv => 
        inv.telephone === contact.telephone
          ? { ...inv, statut: 'annule' as const }
          : inv
      );
      
      const updatedRepertoire = repertoire.map(c => 
        c.id === contact.id
          ? { ...c, estInvite: false, dateInvitation: undefined }
          : c
      );
      
      setInvitations(updatedInvitations);
      setRepertoire(updatedRepertoire);
      await saveCachedData(contactsBruts, updatedRepertoire, contacts, updatedInvitations);
      
      console.log('✅ Invitation annulée');
    } catch (error) {
      console.error('❌ Erreur annulation:', error);
      throw error;
    }
  }, [invitations, repertoire, contacts, contactsBruts]);

  // 🆕 AMÉLIORÉ: Synchroniser les contacts vers Strapi avec retry/batch
  const syncContactsToStrapi = useCallback(async (options?: {
    forceRetry?: boolean;
    batchSize?: number;
  }): Promise<{
    success: boolean;
    created: number;
    updated: number;
    errors: string[];
  }> => {
    const { forceRetry = false, batchSize = 100 } = options || {}; // Augmenter le batchSize par défaut (rate limiting désactivé)
    
    if (!token) {
      throw new Error('Token d\'authentification requis');
    }

    // Reset retry count si force retry
    if (forceRetry) {
      setSyncStatus(prev => ({ ...prev, retryCount: 0 }));
    }

    const attempt = async (retryCount: number): Promise<any> => {
      try {
        console.log(`📤 Synchronisation contacts vers Strapi (tentative ${retryCount + 1})...`);
        
        setSyncStatus({
          state: 'uploading',
          progress: 0,
          message: `Envoi vers Strapi (tentative ${retryCount + 1})...`,
          retryCount,
          maxRetries: 3,
          lastSync: new Date().toISOString(),
        });

        // Préparer les données pour l'API
        const contactsData = repertoire.map(contact => ({
          nom: contact.nom,
          telephone: contact.telephone,
          email: contact.email || null,
          // 🔧 FORCER la source à 'import_repertoire' pour la sync mobile
          source: 'import_repertoire', 
          dateAjout: contact.lastUpdated || new Date().toISOString(),
          actif: true,
          metadata: {
            nombreInvitations: contact.nombreInvitations || 0,
            dateInvitation: contact.dateInvitation,
            importSource: 'mobile',
          },
        }));

        console.log('📋 syncAvecStrapiWithToken - Exemple de données préparées:', {
          premier: contactsData[0],
          total: contactsData.length
        });

        setSyncStatus(prev => ({
          ...prev,
          progress: 25,
          message: `Envoi ${contactsData.length} contacts...`,
        }));

        // 🔧 NOUVELLE APPROCHE: Utiliser le service de synchronisation en batches au lieu d'une seule requête
        console.log('🌐 syncAvecStrapiWithToken - Utilisation du service de sync en batches');
        console.log('📤 syncAvecStrapiWithToken - Nombre de contacts à sync:', contactsData.length);
        console.log('🔑 syncAvecStrapiWithToken - Token présent:', token ? 'Oui' : 'Non');

        // Convertir contactsData vers le format Contact[] attendu par syncService
        const contactsForSync: Contact[] = contactsData.map((c: any) => ({
          id: c.id || Date.now() + Math.random(),
          nom: c.nom || '',
          telephone: c.telephone || '',
          email: c.email || undefined,
          groupes: [],
          dateAjout: c.dateAjout || new Date().toISOString(),
          actif: true,
          aSurBob: false,
        }));

        // Utiliser le service de synchronisation avec batches optimisés (rate limiting désactivé sur serveur)
        const syncResult = await syncService.syncContactsAvecStrapi(contactsForSync, {
          batchSize: 100, // 100 contacts par batch (rate limiting désactivé, performance maximale)
          forceSync: true,
          onProgress: (progress) => {
            setSyncStatus(prev => ({
              ...prev,
              progress: Math.round(progress * 70), // 70% max pour cette étape
              message: `Synchronisation en cours... ${Math.round(progress * 100)}%`,
            }));
          }
        });

        if (!syncResult.success) {
          throw new Error(`Erreur sync service: ${syncResult.errors.join(', ')}`);
        }

        setSyncStatus(prev => ({
          ...prev,
          progress: 75,
          message: 'Traitement de la réponse...',
        }));

        setSyncStatus({
          state: 'success',
          progress: 100,
          message: `Sync réussie: ${syncResult.contactsSync} contacts synchronisés`,
          lastSync: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
        });

        console.log('✅ Synchronisation terminée:', {
          'synchronisés': syncResult.contactsSync,
          'erreurs': syncResult.errors.length,
          'success': syncResult.success,
        });
        
        // 📋 LOGS DÉTAILLÉS DES ERREURS
        if (syncResult.errors && syncResult.errors.length > 0) {
          console.log('❌ Détail des erreurs de synchronisation:');
          syncResult.errors.forEach((error, index) => {
            console.log(`❌ Erreur ${index + 1}:`, error);
          });
        }

        return {
          success: syncResult.success,
          created: syncResult.contactsSync,
          updated: 0, // Le service ne retourne pas cette info séparément
          errors: syncResult.errors,
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error(`❌ Erreur sync (tentative ${retryCount + 1}):`, errorMessage);
        
        // Retry logic
        if (retryCount < 2) { // Max 3 tentatives (0, 1, 2)
          const nextRetry = retryCount + 1;
          const retryDelay = Math.pow(2, nextRetry) * 1000; // Backoff exponentiel: 2s, 4s
          
          setSyncStatus({
            state: 'retrying',
            progress: 0,
            message: `Erreur: ${errorMessage}. Nouvelle tentative dans ${retryDelay/1000}s...`,
            retryCount: nextRetry,
            maxRetries: 3,
            errors: [errorMessage],
          });
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attempt(nextRetry);
        } else {
          // Échec définitif
          setSyncStatus({
            state: 'error',
            progress: 0,
            message: `Échec après 3 tentatives: ${errorMessage}`,
            retryCount: retryCount + 1,
            maxRetries: 3,
            errors: [errorMessage],
          });
          
          return {
            success: false,
            created: 0,
            updated: 0,
            errors: [errorMessage],
          };
        }
      }
    };

    setIsLoading(true);
    try {
      return await attempt(syncStatus.retryCount || 0);
    } finally {
      setIsLoading(false);
    }
  }, [repertoire, token, syncStatus.retryCount]);

  // 🆕 NOUVEAU: Récupérer les contacts depuis Strapi
  const fetchContactsFromStrapi = useCallback(async () => {
    if (!token) {
      console.warn('⚠️ Pas de token pour récupération Strapi');
      return;
    }

    try {
      console.log('📥 Récupération contacts depuis Strapi...');
      setIsLoading(true);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/contacts/my-contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();
      
      // Convertir les données Strapi vers ContactRepertoire
      const strapiContacts: ContactRepertoire[] = result.data.map((contact: any) => ({
        id: contact.id.toString(),
        nom: contact.nom,
        telephone: contact.telephone,
        email: contact.email,
        aSurBob: contact.aSurBob || false,
        estInvite: !!contact.dernierStatutInvitation,
        dateInvitation: contact.derniereDateInvitation,
        nombreInvitations: contact.invitations?.length || 0,
        lastUpdated: contact.derniereActivite || contact.dateAjout,
        source: contact.source || 'strapi',
      }));

      setRepertoire(strapiContacts);
      await saveCachedData(contactsBruts, strapiContacts, contacts, invitations);
      
      console.log(`✅ ${strapiContacts.length} contacts récupérés depuis Strapi`);
      console.log(`  📊 Meta: ${result.meta?.total} total, ${result.meta?.bobUsers} utilisateurs Bob`);

    } catch (error) {
      console.error('❌ Erreur récupération contacts Strapi:', error);
      setError(`Erreur récupération: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  }, [token, contactsBruts, contacts, invitations]);

  const generateParrainageCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // 🆕 NOUVEAU: Fonction de vérification complète Strapi
  const verifierEtatStrapi = useCallback(async (): Promise<{
    contactsStrapi: number;
    contactsAvecBob: number;
    contactsTelephone: number;
    syncOk: boolean;
    details: any;
  }> => {
    if (!token) {
      throw new Error('Token d\'authentification requis pour vérifier Strapi');
    }

    try {
      console.log('🔍 Début vérification état Strapi...');
      setIsLoading(true);

      // 1. Récupérer tous les contacts depuis Strapi
      const strapiContacts = await contactsService.getMyContacts(token);
      console.log(`📊 Contacts dans Strapi: ${strapiContacts.length}`);

      // 2. Vérifier qui a Bob
      const phonesArray = strapiContacts
        .map(c => c.telephone)
        .filter((phone): phone is string => Boolean(phone));
      
      const bobVerification = await syncService.verifierContactsBob(phonesArray);
      const contactsAvecBob = bobVerification.bobFound;
      
      console.log(`👥 Contacts avec Bob: ${contactsAvecBob}/${phonesArray.length}`);

      // 3. Comparer avec le téléphone
      const contactsTelephone = contactsBruts.length;
      const contactsRepertoire = repertoire.length;

      // 4. Détails pour debug
      const details = {
        strapi: {
          total: strapiContacts.length,
          avecTelephone: phonesArray.length,
          avecBob: contactsAvecBob,
          examples: strapiContacts.slice(0, 3).map(c => ({
            nom: c.nom,
            telephone: c.telephone,
            aSurBob: bobVerification.bobUsers[c.telephone || ''] || false
          }))
        },
        telephone: {
          bruts: contactsTelephone,
          repertoire: contactsRepertoire
        },
        bobUsers: Object.entries(bobVerification.bobUsers)
          .filter(([_, hasBob]) => hasBob)
          .map(([phone, _]) => ({
            phone,
            contact: strapiContacts.find(c => c.telephone === phone)?.nom || 'Inconnu'
          }))
      };

      console.log('📋 Détails vérification:', details);

      const syncOk = Math.abs(contactsRepertoire - strapiContacts.length) <= 2; // Tolérance de 2 contacts

      return {
        contactsStrapi: strapiContacts.length,
        contactsAvecBob,
        contactsTelephone,
        syncOk,
        details
      };

    } catch (error) {
      console.error('❌ Erreur vérification Strapi:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [token, contactsBruts.length, repertoire.length]);

  const getStats = useCallback(async () => {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.INVITATIONS_HISTORY);
      const history = historyData ? JSON.parse(historyData) : {};
      
      let contactsAvecBob = 0;
      let contactsInvitesMaisPasBob = 0;
      let contactsJamaisInvites = 0;
      let invitationsEnCours = 0;
      let invitationsAcceptees = 0;
      
      repertoire.forEach(contact => {
        const contactHistory = history[contact.id];
        
        if (contact.aSurBob || (contactHistory && contactHistory.statut === 'sur_bob')) {
          contactsAvecBob++;
          invitationsAcceptees++;
        } else if (contact.estInvite || (contactHistory && (contactHistory.statut === 'invite' || contactHistory.statut === 'relance'))) {
          contactsInvitesMaisPasBob++;
          invitationsEnCours++;
        } else {
          contactsJamaisInvites++;
        }
      });
      
      const stats = {
        totalContactsTelephone: contactsBruts.length,
        contactsAvecEmail: contactsBruts.filter(c => c.hasEmail).length,
        contactsComplets: contactsBruts.filter(c => c.isComplete).length,
        
        mesContacts: repertoire.length,
        contactsAvecBob: contactsAvecBob,
        contactsSansBob: contactsJamaisInvites, // 🔧 FIX: Seulement les contacts jamais invités
        contactsInvites: contactsInvitesMaisPasBob, // Contacts invités mais pas encore sur Bob
        
        totalContactsBob: contacts.length,
        contactsEnLigne: contacts.filter(c => c.estEnLigne).length,
        
        invitationsEnCours: invitationsEnCours,
        invitationsAcceptees: invitationsAcceptees,
        totalInvitationsEnvoyees: invitations.filter(i => i.statut !== 'annule').length,
        
        tauxCuration: contactsBruts.length > 0 ? Math.round((repertoire.length / contactsBruts.length) * 100) : 0,
        contactsDisponibles: (() => {
          // 🔧 FIX: Calcul correct qui gère le cas où contactsBruts est vidé après import
          
          // Si contactsBruts est vide, essayer de charger depuis le cache pour le calcul
          let sourceContactsBruts = contactsBruts;
          
          if (contactsBruts.length === 0) {
            try {
              const cachedDataStr = AsyncStorage.getItem('@bob_contacts_bruts_cache');
              cachedDataStr.then(data => {
                if (data) {
                  console.log('📥 Chargement cache pour calcul contactsDisponibles');
                }
              });
            } catch (error) {
              console.warn('⚠️ Cache non disponible pour calcul');
            }
            
            // Pour l'instant, utiliser totalContactsTelephone comme référence
            // Si repertoire > 1000, on assume que la plupart des contacts ont été importés
            if (repertoire.length > 1000) {
              console.log('🔧 Calcul contactsDisponibles avec import massif détecté');
              return 0; // Tous importés probablement
            }
          }
          
          // Calcul normal si contactsBruts disponible
          const telephonesRepertoire = new Set(repertoire.map(c => c.telephone));
          const contactsNonImportes = sourceContactsBruts.filter(c => 
            c.telephone && !telephonesRepertoire.has(c.telephone)
          );
          
          console.log('🔧 Calcul contactsDisponibles:', {
            contactsBrutsTotal: sourceContactsBruts.length,
            repertoireTotal: repertoire.length,
            telephonesRepertoire: telephonesRepertoire.size,
            contactsNonImportes: contactsNonImportes.length,
            isPostMassImport: repertoire.length > 1000
          });
          
          return Math.max(0, contactsNonImportes.length);
        })(),
        pourcentageBob: repertoire.length > 0 ? Math.round((contactsAvecBob / repertoire.length) * 100) : 0,
        nouveauxDepuisScan: 0,
      };
      
      console.log('📊 Stats calculées:', {
        'Mes contacts': stats.mesContacts,
        'Ont Bob': stats.contactsAvecBob,
        'À inviter (jamais invités)': stats.contactsSansBob,
        'Invités en attente': stats.contactsInvites,
        'Pourcentage Bob': stats.pourcentageBob + '%',
        'Contacts bruts': contactsBruts.length,
        'Contacts répertoire': repertoire.length,
        'Contacts disponibles': stats.contactsDisponibles,
        'Calcul détaillé': `${contactsBruts.length} - ${repertoire.length} = ${contactsBruts.length - repertoire.length}`,
        timestamp: new Date().toISOString()
      });
      
      return stats;
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      
      return {
        totalContactsTelephone: contactsBruts.length,
        contactsAvecEmail: contactsBruts.filter(c => c.hasEmail).length,
        contactsComplets: contactsBruts.filter(c => c.isComplete).length,
        mesContacts: repertoire.length,
        contactsAvecBob: repertoire.filter(c => c.aSurBob).length,
        contactsSansBob: repertoire.filter(c => !c.aSurBob).length, // Tous ceux qui n'ont pas Bob
        contactsInvites: repertoire.filter(c => c.estInvite && !c.aSurBob).length, // Invités mais pas sur Bob
        totalContactsBob: contacts.length,
        contactsEnLigne: contacts.filter(c => c.estEnLigne).length,
        invitationsEnCours: invitations.filter(i => i.statut === 'envoye').length,
        invitationsAcceptees: invitations.filter(i => i.statut === 'accepte').length,
        totalInvitationsEnvoyees: invitations.filter(i => i.statut !== 'annule').length,
        tauxCuration: contactsBruts.length > 0 ? Math.round((repertoire.length / contactsBruts.length) * 100) : 0,
        contactsDisponibles: (() => {
          // 🔧 FIX: Même correction pour le fallback - gère l'import massif
          if (repertoire.length > 1000) {
            console.log('🔧 Fallback: Import massif détecté, contactsDisponibles = 0');
            return 0;
          }
          
          const telephonesRepertoire = new Set(repertoire.map(c => c.telephone));
          const contactsNonImportes = contactsBruts.filter(c => 
            c.telephone && !telephonesRepertoire.has(c.telephone)
          );
          return Math.max(0, contactsNonImportes.length);
        })(),
        pourcentageBob: 0,
        nouveauxDepuisScan: 0,
      };
    }
  }, [contactsBruts, repertoire, contacts, invitations]);

  const needsRefreshScan = useCallback((): boolean => {
    if (!lastScanDate) return true;
    
    const lastScan = new Date(lastScanDate);
    const now = new Date();
    const diffHours = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
    
    return diffHours > 24;
  }, [lastScanDate]);

  // 🆕 NOUVEAU: Validation de l'état des données
  const validateDataConsistency = useCallback(() => {
    const issues: string[] = [];
    
    // Vérifier que les contacts du répertoire sont cohérents
    const duplicatePhones = new Set();
    const phoneCounts = new Map();
    
    repertoire.forEach(contact => {
      if (contact.telephone) {
        const count = phoneCounts.get(contact.telephone) || 0;
        phoneCounts.set(contact.telephone, count + 1);
        if (count > 0) duplicatePhones.add(contact.telephone);
      }
    });
    
    if (duplicatePhones.size > 0) {
      issues.push(`${duplicatePhones.size} numéros en double dans le répertoire`);
    }
    
    // Vérifier la cohérence des compteurs
    const contactsAvecBob = repertoire.filter(c => c.aSurBob).length;
    const contactsInvites = repertoire.filter(c => c.estInvite).length;
    const contactsSansBob = repertoire.filter(c => !c.aSurBob && !c.estInvite).length;
    const totalCalcule = contactsAvecBob + contactsInvites + contactsSansBob;
    
    if (totalCalcule !== repertoire.length) {
      issues.push(`Incohérence compteurs: ${totalCalcule} calculé vs ${repertoire.length} réel`);
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ Problèmes de cohérence détectés:', issues);
    } else {
      console.log('✅ Données cohérentes');
    }
    
    return issues;
  }, [repertoire]);

  // 🆕 NOUVELLE FONCTION: Nettoyage complet sans erreurs API
  const clearCacheLocal = useCallback(async (): Promise<void> => {
    try {
      console.log('🗑️ Début nettoyage complet (local uniquement)...');
      setIsLoading(true);
      setIsSyncInProgress(true); // 🚫 Bloquer les autres opérations
      
      // 1. Nettoyage local complet
      console.log('🧹 Nettoyage local...');
      setContactsBruts([]);
      setRepertoire([]);
      setContacts([]);
      setInvitations([]);
      setLastScanDate(null);
      
      // 2. Vider le cache AsyncStorage
      const keys = Object.values(STORAGE_KEYS);
      await Promise.all(keys.map(key => AsyncStorage.removeItem(key)));
      
      console.log('✅ Cache local vidé complètement');
      
      // 3. Suppression côté Strapi avec plusieurs stratégies
      if (token) {
        try {
          console.log('🗑️ Début suppression côté Strapi...');
          
          // Stratégie 1: Endpoint de suppression en masse (idéal)
          try {
            console.log('🔄 Tentative endpoint suppression en masse...');
            const response = await fetch(`${process.env.EXPO_PUBLIC_STRAPI_URL}/api/contacts/bulk-delete`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ deleteAll: true })
            });
            
            if (response.ok) {
              console.log('✅ Suppression en masse réussie !');
            } else if (response.status === 404) {
              throw new Error('Endpoint bulk-delete non disponible');
            } else {
              const errorText = await response.text();
              console.warn('⚠️ Suppression en masse échouée:', response.status, errorText);
              throw new Error(`Suppression en masse échouée: ${response.status}`);
            }
          } catch (bulkError) {
            console.log('⚠️ Suppression en masse échouée, tentative méthode alternative...');
            
            // Stratégie 2: Récupérer d'abord tous les contacts puis les supprimer intelligemment
            try {
              const contactsResponse = await fetch(`${process.env.EXPO_PUBLIC_STRAPI_URL}/api/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (contactsResponse.ok) {
                const contactsData = await contactsResponse.json();
                const contacts = contactsData.data || [];
                
                console.log(`🗑️ ${contacts.length} contacts à supprimer sur Strapi`);
                
                if (contacts.length > 0) {
                  // Stratégie 2a: Essayer suppression par batch de 10
                  const batchSize = 10;
                  let totalDeleted = 0;
                  let totalErrors = 0;
                  
                  for (let i = 0; i < contacts.length; i += batchSize) {
                    const batch = contacts.slice(i, i + batchSize);
                    const batchPromises = batch.map(async (contact) => {
                      try {
                        // Utiliser l'ID numérique interne pour DELETE (pas le documentId)
                        const deleteId = contact.id; // ID numérique requis
                        const deleteResponse = await fetch(`${process.env.EXPO_PUBLIC_STRAPI_URL}/api/contacts/${deleteId}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (deleteResponse.ok) {
                          totalDeleted++;
                          console.log(`✅ Contact ${contact.nom} supprimé (${totalDeleted})`);
                        } else {
                          totalErrors++;
                          console.warn(`⚠️ Échec suppression ${contact.nom}: ${deleteResponse.status}`);
                        }
                      } catch (contactError) {
                        totalErrors++;
                        console.warn(`⚠️ Erreur suppression ${contact.nom}:`, contactError);
                      }
                    });
                    
                    await Promise.allSettled(batchPromises);
                    
                    // Pause entre les batches pour éviter le rate limiting
                    if (i + batchSize < contacts.length) {
                      await new Promise(resolve => setTimeout(resolve, 200));
                    }
                  }
                  
                  console.log(`📊 Suppression Strapi terminée: ${totalDeleted} supprimés, ${totalErrors} erreurs`);
                  
                  if (totalDeleted > 0) {
                    console.log('✅ Au moins quelques contacts supprimés sur Strapi');
                  }
                }
              } else {
                console.warn('⚠️ Impossible de récupérer les contacts pour suppression');
              }
            } catch (individualError) {
              console.warn('⚠️ Suppression individuelle échouée aussi:', individualError);
              console.log('💡 Nettoyage local uniquement - les contacts reviendront au prochain sync');
            }
          }
          
        } catch (strapiError) {
          console.warn('⚠️ Toutes les stratégies Strapi ont échoué:', strapiError);
          console.log('💡 Nettoyage local effectué - attention aux conflits au redémarrage');
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur clearCacheLocal:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsSyncInProgress(false);
    }
  }, [token]);

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      console.log('🗑️ Début suppression complète (local + Strapi)...');
      setIsLoading(true);
      setIsSyncInProgress(true); // 🚫 Bloquer les autres opérations
      
      // 🔧 CORRECTION: Utiliser la nouvelle méthode qui évite les erreurs 405
      await clearCacheLocal();
      
    } catch (error) {
      console.error('❌ Erreur clearCache:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsSyncInProgress(false);
    }
  }, [clearCacheLocal]);

  // 🆕 Fonction pour forcer la mise à jour des noms depuis Strapi
  const forcerMiseAJourNoms = useCallback(async () => {
    if (!token) {
      console.warn('⚠️ Pas de token pour mise à jour des noms');
      return;
    }

    try {
      console.log('🔄 Force mise à jour des noms depuis Strapi...');
      await syncAvecStrapiWithToken(token);
    } catch (error) {
      console.error('❌ Erreur mise à jour noms:', error);
    }
  }, [token, syncAvecStrapiWithToken]);

  return {
    // États
    isLoading,
    error,
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    scanProgress,
    lastScanDate,
    syncStatus,
    
    // Méthodes principales
    scannerRepertoireBrut,
    scannerRepertoire: scannerRepertoireBrut,
    importerContactsSelectionnes,
    repartirAZero,
    retirerContactsDuRepertoire,
    inviterContact,
    clearCache,
    forcerMiseAJourNoms,
    
    // 🆕 NOUVEAU: Méthodes Strapi
    syncAvecStrapi,
    importerContactsEtSync,
    supprimerTousLesContacts,
    relancerInvitation,
    annulerInvitation,
    syncContactsToStrapi,
    fetchContactsFromStrapi,
    verifierEtatStrapi,
    
    // Simulation
    simulerAcceptationInvitation: async (telephone: string): Promise<boolean> => {
      try {
        console.log('🎭 Simulation acceptation invitation pour:', telephone);
        
        const token = await authService.getValidToken();
        if (!token) throw new Error('Token invalide');

        // 1. Debug - lister toutes les invitations disponibles
        console.log('🔍 DEBUG - Toutes les invitations:', invitations.map(i => ({
          id: i.id,
          documentId: i.documentId,
          telephone: i.telephone,
          statut: i.statut,
          nom: i.nom
        })));

        // 2. Trouver l'invitation en cours
        const invitation = invitations.find(i => 
          i.telephone?.replace(/[\s\-\(\)\.]/g, '') === telephone.replace(/[\s\-\(\)\.]/g, '') &&
          i.statut === 'envoye'
        );

        if (!invitation) {
          throw new Error('Aucune invitation en cours trouvée pour ce numéro');
        }

        console.log('📤 Invitation trouvée:', invitation);
        console.log('📤 ID à utiliser:', invitation.id);
        console.log('📤 DocumentId à utiliser:', invitation.documentId);
        console.log('📤 NumericId à utiliser:', invitation.numericId);

        // 2. Essayer d'abord avec l'ID numérique (depuis les logs: id=10)
        // Si ça ne marche pas, on essaiera avec le documentId
        const idToUse = invitation.numericId || invitation.id;
        console.log('📤 ID final choisi:', idToUse);
        
        await invitationsService.simulateAcceptInvitation(idToUse, token);

        // 3. Vérifier le type d'invitation (répertoire vs externe)
        const contactRepertoire = repertoire.find(c => 
          c.telephone?.replace(/[\s\-\(\)\.]/g, '') === telephone.replace(/[\s\-\(\)\.]/g, '')
        );

        const isInvitationRepertoire = !!contactRepertoire;
        console.log('📋 Type invitation:', isInvitationRepertoire ? 'REPERTOIRE' : 'EXTERNE');

        let contactInfo;
        if (isInvitationRepertoire) {
          // Contact déjà dans le répertoire
          contactInfo = {
            nom: contactRepertoire.nom,
            prenom: contactRepertoire.prenom,
            telephone: contactRepertoire.telephone,
            email: contactRepertoire.email,
          };
          console.log('📱 Contact trouvé dans répertoire:', contactInfo);
        } else {
          // Invitation externe (QR code, etc.) - utiliser les données de l'invitation
          contactInfo = {
            nom: invitation.nom || 'Utilisateur',
            prenom: invitation.prenom || '',
            telephone: invitation.telephone,
            email: invitation.email || `user${Date.now()}@example.com`,
          };
          console.log('🔗 Invitation externe:', contactInfo);
        }

        // 4. Créer l'utilisateur Bob (toujours créer dans contacts pour qu'il devienne "user")
        const nouveauUserBob = {
          nom: contactInfo.nom,
          prenom: contactInfo.prenom,
          telephone: contactInfo.telephone,
          email: contactInfo.email,
          statut: 'actif',
          dateInscription: new Date().toISOString(),
          estEnLigne: Math.random() > 0.5, // 50% de chance d'être en ligne
          dernierConnexion: new Date().toISOString(),
          // Données simulées
          nombreEchanges: Math.floor(Math.random() * 10),
          bobizGagnes: Math.floor(Math.random() * 100) + 50,
          localisation: 'France',
        };

        console.log('👤 Création utilisateur Bob:', nouveauUserBob);

        // 5. Créer l'utilisateur dans Strapi (collection contacts = utilisateurs actifs)
        const userCree = await contactsService.createContact(nouveauUserBob, token);
        console.log('✅ Utilisateur Bob créé:', userCree);

        // 6. Si invitation externe, ajouter aussi au répertoire
        if (!isInvitationRepertoire) {
          console.log('📝 Ajout contact externe au répertoire...');
          // TODO: Ajouter le contact au répertoire via le service approprié
          // Pour l'instant on se contente de créer l'utilisateur
        }

        // 7. Forcer le refresh des données
        await syncAvecStrapi();

        console.log('🎉 Simulation terminée avec succès !');
        return true;

      } catch (error: any) {
        console.error('❌ Erreur simulation acceptation:', error);
        setError(`Erreur simulation: ${error.message}`);
        return false;
      }
    },

    // Utilitaires
    getStats,
    needsRefreshScan,
    validateDataConsistency,
    clearError: () => setError(null),
    
    // 🆕 Import automatique sans limitation
    importerTousLesContactsAutomatique,
    
    // 🚨 ARRÊT D'URGENCE de toutes les opérations
    emergencyStopAll: useCallback(() => {
      console.log('🚨 ARRÊT D\'URGENCE DÉCLENCHÉ - Toutes les opérations vont s\'arrêter');
      setEmergencyStop(true);
      setIsLoading(false);
      setIsSyncInProgress(false);
      
      // Reset après 5 secondes
      setTimeout(() => {
        console.log('✅ Reset du flag d\'arrêt d\'urgence');
        setEmergencyStop(false);
      }, 5000);
    }, []),
    
    // 🔓 Débloquer la synchronisation
    debloquerSync: useCallback(() => {
      console.log('🔓 Synchronisation DÉBLOQUÉE - Les sync automatiques vont reprendre');
      setIsSyncBlocked(false);
    }, []),
    
    // 🧹 NOUVEAU: Nettoyage complet Strapi seul
    viderToutStrapiPourUtilisateur,
    
    // 🧹 NOUVEAU: Nettoyage complet pour restart
    clearAllDataAndCache: useCallback(async () => {
      console.log('🧹 NETTOYAGE COMPLET - Suppression de toutes les données...');
      
      try {
        // 1. Vider les states
        setContactsBruts([]);
        setRepertoire([]);
        setContacts([]);
        setInvitations([]);
        setError(null);
        
        // 2. Vider AsyncStorage complètement
        const keys = [
          STORAGE_KEYS.CONTACTS_BRUTS,
          STORAGE_KEYS.REPERTOIRE,
          STORAGE_KEYS.CONTACTS,
          STORAGE_KEYS.INVITATIONS,
          STORAGE_KEYS.INVITATIONS_HISTORY,
          STORAGE_KEYS.LAST_SCAN_DATE,
          '@bob_contacts_bruts_cache',
          '@bob_repertoire_cache',
          '@bob_contacts_cache',
          '@bob_invitations_cache'
        ];
        
        for (const key of keys) {
          try {
            await AsyncStorage.removeItem(key);
            console.log(`✅ Cache supprimé: ${key}`);
          } catch (err) {
            console.warn(`⚠️ Erreur suppression ${key}:`, err);
          }
        }
        
        console.log('🧹 Nettoyage complet terminé - App prête pour restart');
        return true;
      } catch (error) {
        console.error('❌ Erreur nettoyage complet:', error);
        return false;
      }
    }, []),
  };
};