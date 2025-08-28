// src/hooks/contacts/useContactsData.ts - Hook principal pour les données contacts

import { useState, useEffect, useMemo } from 'react';
import { ContactsManager } from '../../services/contacts/ContactsManager';
import { 
  Contact, 
  ContactsStats, 
  ContactChangeType,
  PhoneContact,
  BobContact,
  InvitedContact,
  RepertoireContact 
} from '../../types/contacts.unified';

export interface UseContactsDataReturn {
  // Données principales
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  
  // Contacts par type (computed)
  phoneContacts: PhoneContact[];
  repertoireContacts: RepertoireContact[];
  bobContacts: BobContact[];
  invitedContacts: InvitedContact[];
  availableContacts: PhoneContact[];
  
  // Statistiques en temps réel
  stats: ContactsStats | null;
  
  // États dérivés (compatibilité avec ancien système)
  contactsBruts: PhoneContact[];
  repertoire: (RepertoireContact | BobContact)[];
  invitations: InvitedContact[];
  
  // Informations sur le système
  isLoaded: boolean;
  isSyncBlocked: boolean;
  lastUpdate: number;
}

export const useContactsData = (): UseContactsDataReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ContactsStats | null>(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const manager = useMemo(() => ContactsManager.getInstance(), []);

  // Chargement initial et abonnement aux changements
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      try {
        console.log('🚀 useContactsData - Chargement initial...');
        setLoading(true);
        setError(null);

        // Charger les contacts
        const allContacts = await manager.repository.getAll();
        
        if (mounted) {
          setContacts(allContacts);
          setLoading(false);
          setLastUpdate(Date.now());
          console.log(`✅ useContactsData - ${allContacts.length} contacts chargés`);
        }

        // Calculer les stats initiales
        const initialStats = await manager.getStats();
        if (mounted) {
          setStats(initialStats);
        }

      } catch (err) {
        console.error('❌ Erreur chargement useContactsData:', err);
        if (mounted) {
          setError((err as Error).message);
          setLoading(false);
        }
      }
    };

    // Abonnement aux changements du repository
    const unsubscribe = manager.repository.subscribe(async (type: ContactChangeType, data) => {
      if (!mounted) return;

      console.log(`🔄 useContactsData - Changement détecté:`, type);
      
      try {
        // Recharger les contacts
        const updatedContacts = await manager.repository.getAll();
        setContacts(updatedContacts);
        setLastUpdate(Date.now());

        // Recalculer les stats
        const updatedStats = await manager.getStats();
        setStats(updatedStats);

        // Log pour debug
        if (type === 'add' && data && typeof data === 'object' && 'nom' in data) {
          console.log(`➕ Contact ajouté: ${data.nom}`);
        } else if (type === 'remove' && typeof data === 'string') {
          console.log(`➖ Contact supprimé: ${data}`);
        } else if (type === 'load') {
          console.log(`📥 Contacts rechargés: ${updatedContacts.length}`);
        }

      } catch (err) {
        console.error('❌ Erreur mise à jour useContactsData:', err);
        setError((err as Error).message);
      }
    });

    loadInitialData();

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [manager]);

  // Contacts par type (memoized pour performance)
  const phoneContacts = useMemo(() => 
    contacts.filter(c => c.source === 'phone') as PhoneContact[], 
    [contacts]
  );

  const repertoireContacts = useMemo(() => 
    contacts.filter(c => c.source === 'repertoire') as RepertoireContact[], 
    [contacts]
  );

  const bobContacts = useMemo(() => 
    contacts.filter(c => c.source === 'bob') as BobContact[], 
    [contacts]
  );

  const invitedContacts = useMemo(() => 
    contacts.filter(c => c.source === 'invited') as InvitedContact[], 
    [contacts]
  );

  const availableContacts = useMemo(() => {
    const repertoireTelephones = new Set([
      ...repertoireContacts.map(c => c.telephone),
      ...bobContacts.map(c => c.telephone),
      ...invitedContacts.map(c => c.telephone)
    ]);
    
    return phoneContacts.filter(c => !repertoireTelephones.has(c.telephone));
  }, [phoneContacts, repertoireContacts, bobContacts, invitedContacts]);

  // États dérivés pour compatibilité avec l'ancien système
  const contactsBruts = phoneContacts;
  const repertoire = [...repertoireContacts, ...bobContacts];
  const invitations = invitedContacts;

  return {
    // Données principales
    contacts,
    loading,
    error,
    
    // Contacts par type
    phoneContacts,
    repertoireContacts,
    bobContacts,
    invitedContacts,
    availableContacts,
    
    // Statistiques
    stats,
    
    // Compatibilité ancien système
    contactsBruts,
    repertoire,
    invitations,
    
    // Informations système
    isLoaded: !loading,
    isSyncBlocked: manager?.isSyncBlockedStatus?.() || false,
    lastUpdate
  };
};