// src/hooks/useContactsBob.ts - Version avec getStats corrigé
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';
import * as Contacts from 'expo-contacts';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [contactsBruts, setContactsBruts] = useState<ContactBrut[]>([]);
  const [repertoire, setRepertoire] = useState<ContactRepertoire[]>([]);
  const [contacts, setContacts] = useState<ContactBob[]>([]);
  const [invitations, setInvitations] = useState<InvitationContact[]>([]);
  
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    phase: 'complete',
    progress: 0,
  });
  const [lastScanDate, setLastScanDate] = useState<string | null>(null);

  useEffect(() => {
    const logTimeout = setTimeout(() => {
      console.log('🔄 Hook state changed:');
      console.log('  📲 contactsBruts:', contactsBruts.length);
      console.log('  📱 repertoire (mes contacts):', repertoire.length);
      console.log('  👥 contacts Bob:', contacts.length);
      console.log('  📤 invitations:', invitations.length);
    }, 100);

    return () => clearTimeout(logTimeout);
  }, [contactsBruts.length, repertoire.length, contacts.length, invitations.length]);

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

  useEffect(() => {
    loadCachedData();
  }, []);

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
      
      const [
        cachedContactsBruts,
        cachedRepertoire, 
        cachedContacts, 
        cachedInvitations, 
        lastScan, 
        scanMetadata
      ] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_BRUTS),
        AsyncStorage.getItem(STORAGE_KEYS.REPERTOIRE),
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_BOB),
        AsyncStorage.getItem(STORAGE_KEYS.INVITATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LAST_SCAN),
        AsyncStorage.getItem(STORAGE_KEYS.SCAN_METADATA),
      ]);

      let loadedCount = 0;

      if (cachedContactsBruts) {
        const parsed = JSON.parse(cachedContactsBruts);
        console.log('📲 Cache contacts bruts trouvé:', parsed.length, 'contacts du téléphone');
        setContactsBruts(parsed);
        loadedCount++;
      }

      if (cachedRepertoire) {
        const parsed = JSON.parse(cachedRepertoire);
        console.log('📱 Cache repertoire trouvé:', parsed.length, 'mes contacts Bob');
        setRepertoire(parsed);
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
    } catch (error) {
      console.error('❌ Erreur sauvegarde cache:', error);
    }
  };

  const scannerRepertoireBrut = useCallback(async (): Promise<ContactBrut[]> => {
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
  }, [repertoire, contacts, invitations]);

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

      setRepertoire(prev => [...prev, ...contactsAvecStatutBob]);
      if (nouveauxUtilisateursBob.length > 0) {
        setContacts(prev => [...prev, ...nouveauxUtilisateursBob]);
      }

      const nouveauRepertoire = [...repertoire, ...contactsAvecStatutBob];
      const nouveauxContactsBob = contacts.length > 0 ? [...contacts, ...nouveauxUtilisateursBob] : nouveauxUtilisateursBob;
      await saveCachedData(contactsBruts, nouveauRepertoire, nouveauxContactsBob, invitations);

      console.log(`✅ Import terminé: ${contactsAImporter.length} contacts, ${nouveauxUtilisateursBob.length} nouveaux utilisateurs Bob`);

    } catch (err: any) {
      console.error('❌ Erreur import contacts:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [contactsBruts, repertoire, contacts, invitations]);

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

  const inviterContact = useCallback(async (
    contact: ContactRepertoire, 
    type: 'sms' | 'whatsapp' = 'sms'
  ): Promise<InvitationContact> => {
    setIsLoading(true);
    
    try {
      console.log(`📨 Invitation ${type} à ${contact.nom}`);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const nouvelleInvitation: InvitationContact = {
        id: Date.now() + Math.random(),
        telephone: contact.telephone,
        nom: contact.nom,
        type,
        statut: 'envoye',
        dateEnvoi: new Date().toISOString(),
        nombreRelances: 0,
        codeParrainage: generateParrainageCode(),
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
  }, [repertoire, invitations, contacts, contactsBruts]);

  const generateParrainageCode = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

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
        'Pourcentage Bob': stats.pourcentageBob + '%'
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

  const clearCache = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CONTACTS_BRUTS),
        AsyncStorage.removeItem(STORAGE_KEYS.REPERTOIRE),
        AsyncStorage.removeItem(STORAGE_KEYS.CONTACTS_BOB),
        AsyncStorage.removeItem(STORAGE_KEYS.INVITATIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.INVITATIONS_HISTORY),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_SCAN),
        AsyncStorage.removeItem(STORAGE_KEYS.SCAN_METADATA),
      ]);
      
      setContactsBruts([]);
      setRepertoire([]);
      setContacts([]);
      setInvitations([]);
      setLastScanDate(null);
      setScanProgress({ phase: 'complete', progress: 0 });
      
      console.log('🗑️ Cache complètement vidé');
    } catch (error) {
      console.error('❌ Erreur nettoyage cache:', error);
      throw error;
    }
  }, []);

  return {
    isLoading,
    error,
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    scanProgress,
    lastScanDate,
    
    scannerRepertoireBrut,
    scannerRepertoire: scannerRepertoireBrut,
    importerContactsSelectionnes,
    repartirAZero,
    retirerContactsDuRepertoire,
    inviterContact,
    clearCache,
    
    getStats,
    needsRefreshScan,
    clearError: () => setError(null),
  };
};