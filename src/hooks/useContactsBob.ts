// src/hooks/useContactsBob.ts - Version complète avec connexion Strapi
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService } from '../services/storage.service';
import { syncService } from '../services/sync.service';
import { invitationsService } from '../services/invitations.service';
import { authService } from '../services/auth.service';
import { contactsService } from '../services/contacts.service';
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
  source?: 'curation' | 'import' | 'manual';
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
  const [isSyncInProgress, setIsSyncInProgress] = useState(false); // 🆕 Flag pour éviter les opérations concurrentes
  const [token, setToken] = useState<string | null>(null); // 🆕 NOUVEAU: Token JWT
  
  const [contactsBruts, setContactsBruts] = useState<ContactBrut[]>([]);
  const [repertoire, setRepertoire] = useState<ContactRepertoire[]>([]);
  const [contacts, setContacts] = useState<ContactBob[]>([]);
  const [invitations, setInvitations] = useState<InvitationContact[]>([]);
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    phase: 'complete',
    progress: 0,
  });
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);
  
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
      
      if (storedToken) {
        console.log('🔑 Token trouvé, synchronisation avec Strapi...');
        // Attendre un peu que les données cache soient chargées
        setTimeout(async () => {
          await syncAvecStrapiWithToken(storedToken);
        }, 1000);
      }
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
  const syncAvecStrapiWithToken = useCallback(async (directToken?: string) => {
    const tokenToUse = directToken || token;
    if (!tokenToUse) {
      console.warn('⚠️ Pas de token pour sync Strapi');
      return;
    }
    
    try {
      console.log('🔄 Synchronisation avec Strapi avec token direct...');
      setIsLoading(true);
      
      // 1. Récupérer l'état depuis Strapi
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
          console.log(`🔍 DEBUG Contact ${index}:`, { 
            id: contact.id, 
            nom: contact.nom, 
            prenom: contact.prenom, 
            telephone: contact.telephone 
          });
          
          const nomFinal = contact.prenom && contact.nom 
            ? `${contact.prenom} ${contact.nom}` 
            : contact.nom || contact.prenom || 'Contact';
            
          console.log(`📝 Nom final: "${nomFinal}"`);
          
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
        
        setRepertoire(enrichedRepertoire);
        await saveCachedData(contactsBruts, enrichedRepertoire, contacts, invitationsStrapi);
        
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
  }, [repertoire, contactsBruts, contacts]);

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
            console.log(`🔍 DEBUG Contact ${index} (autre endroit):`, { 
              id: contact.id, 
              nom: contact.nom, 
              prenom: contact.prenom, 
              telephone: contact.telephone 
            });
            
            const nomFinal = contact.prenom && contact.nom 
              ? `${contact.prenom} ${contact.nom}` 
              : contact.nom || contact.prenom || 'Contact';
              
            console.log(`📝 Nom final (autre endroit): "${nomFinal}"`);
            
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
          
          setRepertoire(enrichedRepertoire);
          await saveCachedData(contactsBruts, enrichedRepertoire, contacts, invitationsStrapi);
          
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
    }, [token, repertoire, contactsBruts, contacts]);

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
    loadCachedData();
  }, []);

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
        setContactsBruts(parsed);
        loadedCount++;
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

      const contactsAImporter = contactsBruts.filter(c => contactIds.includes(c.id));
      
      if (contactsAImporter.length === 0) {
        throw new Error('Aucun contact trouvé à importer');
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

    } catch (err: any) {
      console.error('❌ Erreur import contacts:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contactsBruts, repertoire, contacts, invitations]);

  // 🆕 NOUVEAU: Importer et synchroniser avec Strapi
  const importerContactsEtSync = useCallback(async (contactIds: string[]) => {
    try {
      // D'abord importer localement
      await importerContactsSelectionnes(contactIds);
      
      // Puis sync avec Strapi - utiliser authService directement
      const currentToken = await authService.getValidToken();
      if (currentToken) {
        console.log('🔄 Synchronisation des contacts avec Strapi...');
        setIsSyncInProgress(true); // 🚫 Bloquer les autres opérations
        
        const contactsASync = contactsBruts
          .filter(c => contactIds.includes(c.id))
          .map(c => ({
            id: typeof c.id === 'string' && !isNaN(Number(c.id)) ? Number(c.id) : Date.now() + Math.random(),
            telephone: c.telephone,
            nom: c.nom,
            email: c.email,
            groupes: [],
            dateAjout: new Date().toISOString(),
            actif: true,
          }));
        
        try {
          const syncResult = await syncService.syncContactsAvecStrapi(contactsASync);
          
          if (syncResult.success) {
            console.log('✅ Contacts synchronisés avec Strapi');
          } else if (syncResult.errors.some(e => e.includes('409') || e.includes('déjà') || e.includes('exist'))) {
            // Gestion spécifique erreur 409 - contacts déjà existants
            console.warn('⚠️ Certains contacts existent déjà sur Strapi');
            // Continuer normalement, ce n'est pas bloquant
          } else {
            console.warn('⚠️ Erreurs lors de la sync:', syncResult.errors);
          }
          
          // Pas besoin de re-sync car les données sont déjà cohérentes
          console.log('🔄 Sync terminée, données locales conservées...');
          
        } catch (error: any) {
          if (error.message?.includes('409') || error.response?.status === 409) {
            console.warn('⚠️ Erreur 409: Contacts déjà existants dans Strapi - continuant...');
            // Ne PAS faire de re-sync car ça écrase les données locales
            // Les contacts existants sont déjà gérés côté sync
          } else {
            console.warn('⚠️ Sync Strapi échouée, continuant en local:', error);
            throw error; // Propager l'erreur pour l'UI
          }
        }
      } else {
        console.warn('⚠️ Pas de token valide pour sync avec Strapi');
      }
    } catch (error: any) {
      console.error('❌ Erreur importerContactsEtSync:', error);
      throw error; // Assurer que l'erreur remonte à l'UI
    } finally {
      setIsSyncInProgress(false); // 🔓 Libérer le flag
    }
  }, [importerContactsSelectionnes, contactsBruts, syncAvecStrapiWithToken]);

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
          } else if (error.response?.status === 400) {
            console.error('❌ Données invalides pour l\'invitation:', error.message);
            setError('Les données du contact sont invalides pour l\'invitation.');
          } else if (error.response?.status === 401) {
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
    const { forceRetry = false, batchSize = 50 } = options || {};
    
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
          source: contact.source || 'import_repertoire',
          dateAjout: contact.lastUpdated || new Date().toISOString(),
          actif: true,
          metadata: {
            nombreInvitations: contact.nombreInvitations || 0,
            dateInvitation: contact.dateInvitation,
            importSource: 'mobile',
          },
        }));

        setSyncStatus(prev => ({
          ...prev,
          progress: 25,
          message: `Envoi ${contactsData.length} contacts...`,
        }));

        // Appel API avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/contacts/bulk-import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            contacts: contactsData,
            batchSize,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status} - ${response.statusText}`);
        }

        setSyncStatus(prev => ({
          ...prev,
          progress: 75,
          message: 'Traitement de la réponse...',
        }));

        const result = await response.json();
        
        setSyncStatus({
          state: 'success',
          progress: 100,
          message: `Sync réussie: ${result.data.created.length} créés, ${result.data.updated.length} mis à jour`,
          lastSync: new Date().toISOString(),
          retryCount: 0,
          maxRetries: 3,
        });

        console.log('✅ Synchronisation terminée:', {
          créés: result.data.created.length,
          'mis à jour': result.data.updated.length,
          doublons: result.data.duplicates.length,
          erreurs: result.data.errors.length,
        });

        return {
          success: true,
          created: result.data.created.length,
          updated: result.data.updated.length,
          errors: result.data.errors.map((e: any) => e.error),
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
        contactsSansBob: contactsJamaisInvites,
        contactsInvites: contactsInvitesMaisPasBob,
        
        totalContactsBob: contacts.length,
        contactsEnLigne: contacts.filter(c => c.estEnLigne).length,
        
        invitationsEnCours: invitationsEnCours,
        invitationsAcceptees: invitationsAcceptees,
        totalInvitationsEnvoyees: invitations.filter(i => i.statut !== 'annule').length,
        
        tauxCuration: contactsBruts.length > 0 ? Math.round((repertoire.length / contactsBruts.length) * 100) : 0,
        contactsDisponibles: contactsBruts.length - repertoire.length,
        pourcentageBob: repertoire.length > 0 ? Math.round((contactsAvecBob / repertoire.length) * 100) : 0,
        nouveauxDepuisScan: 0,
      };
      
      console.log('📊 Stats calculées:', {
        'Mes contacts': stats.mesContacts,
        'Ont Bob': stats.contactsAvecBob,
        'À inviter (jamais invités)': stats.contactsSansBob,
        'Invités en attente': stats.contactsInvites,
        'Pourcentage Bob': stats.pourcentageBob + '%',
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
        contactsSansBob: repertoire.filter(c => !c.aSurBob && !c.estInvite).length,
        contactsInvites: repertoire.filter(c => c.estInvite).length,
        totalContactsBob: contacts.length,
        contactsEnLigne: contacts.filter(c => c.estEnLigne).length,
        invitationsEnCours: invitations.filter(i => i.statut === 'envoye').length,
        invitationsAcceptees: invitations.filter(i => i.statut === 'accepte').length,
        totalInvitationsEnvoyees: invitations.filter(i => i.statut !== 'annule').length,
        tauxCuration: contactsBruts.length > 0 ? Math.round((repertoire.length / contactsBruts.length) * 100) : 0,
        contactsDisponibles: contactsBruts.length - repertoire.length,
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

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      console.log('🗑️ Début suppression complète (local + Strapi)...');
      setIsLoading(true);
      setIsSyncInProgress(true); // 🚫 Bloquer les autres opérations
      
      // 1. Supprimer sur Strapi si token disponible
      if (token) {
        try {
          console.log('🗑️ Suppression des contacts sur Strapi...');
          
          // Récupérer tous mes contacts depuis Strapi
          const strapiState = await syncService.getFullState();
          if (strapiState.contacts && strapiState.contacts.length > 0) {
            console.log(`🗑️ ${strapiState.contacts.length} contacts à supprimer sur Strapi`);
            
            // Supprimer chaque contact un par un (avec rate limiting)
            let deletedCount = 0;
            for (const contact of strapiState.contacts) {
              try {
                await contactsService.deleteContact(contact.id, token);
                deletedCount++;
                console.log(`🗑️ Contact ${contact.id} supprimé (${deletedCount}/${strapiState.contacts.length})`);
                
                // Petit délai pour éviter le rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (error) {
                console.warn(`⚠️ Erreur suppression contact ${contact.id}:`, error);
              }
            }
            
            console.log(`✅ ${deletedCount} contacts supprimés sur Strapi`);
          }
          
          // Supprimer aussi les invitations sur Strapi
          if (strapiState.invitations && strapiState.invitations.length > 0) {
            console.log(`🗑️ ${strapiState.invitations.length} invitations à supprimer sur Strapi`);
            
            let deletedInvitations = 0;
            for (const invitation of strapiState.invitations) {
              try {
                await invitationsService.deleteInvitation(invitation.id, token);
                deletedInvitations++;
                console.log(`🗑️ Invitation ${invitation.id} supprimée (${deletedInvitations}/${strapiState.invitations.length})`);
                
                await new Promise(resolve => setTimeout(resolve, 200));
              } catch (error) {
                console.warn(`⚠️ Erreur suppression invitation ${invitation.id}:`, error);
              }
            }
            
            console.log(`✅ ${deletedInvitations} invitations supprimées sur Strapi`);
          }
          
        } catch (error) {
          console.error('❌ Erreur suppression Strapi:', error);
          // Continuer quand même avec le nettoyage local
        }
      } else {
        console.warn('⚠️ Pas de token - suppression Strapi ignorée');
      }
      
      // 2. Nettoyer le cache local
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CONTACTS_BRUTS),
        AsyncStorage.removeItem(STORAGE_KEYS.REPERTOIRE),
        AsyncStorage.removeItem(STORAGE_KEYS.CONTACTS_BOB),
        AsyncStorage.removeItem(STORAGE_KEYS.INVITATIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.INVITATIONS_HISTORY),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_SCAN),
        AsyncStorage.removeItem(STORAGE_KEYS.SCAN_METADATA),
      ]);
      
      // 3. Réinitialiser les états
      setContactsBruts([]);
      setRepertoire([]);
      setContacts([]);
      setInvitations([]);
      setLastScanDate(null);
      setScanProgress({ phase: 'complete', progress: 0 });
      
      console.log('✅ Suppression complète terminée (local + Strapi)');
    } catch (error) {
      console.error('❌ Erreur nettoyage complet:', error);
      throw error;
    } finally {
      setIsLoading(false);
      setIsSyncInProgress(false); // 🔓 Libérer le flag
    }
  }, [token, syncService, contactsService, invitationsService]);

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
  };
};