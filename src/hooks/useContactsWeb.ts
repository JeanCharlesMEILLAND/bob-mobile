// src/hooks/useContactsWeb.ts - Hook optimisé pour la version web
import { useState, useCallback, useEffect } from 'react';
import { storageService } from '../services/storage.service';
import { authService } from '../services/auth.service';
import type { Contact } from '../types/contacts.types';

interface ContactWeb {
  id: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  aSurBob: boolean;
  groupes: Array<{
    id: string;
    nom: string;
    couleur: string;
    type: string;
  }>;
  dernierStatutInvitation?: string | null;
  derniereDateInvitation?: string | null;
  dateAjout: string;
  source: string;
}

interface WebSyncStatus {
  state: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  message: string;
  lastSync?: string;
  totalContacts?: number;
  bobUsers?: number;
  errors?: string[];
}

export const useContactsWeb = () => {
  const [contacts, setContacts] = useState<ContactWeb[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  
  const [syncStatus, setSyncStatus] = useState<WebSyncStatus>({
    state: 'idle',
    message: 'Prêt à charger vos contacts',
  });

  // Charger le token au démarrage
  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await storageService.getToken();
      setToken(storedToken);
      
      if (storedToken) {
        console.log('🔑 Token trouvé pour version web');
        await fetchContacts();
      } else {
        setSyncStatus({
          state: 'error',
          message: 'Authentification requise',
        });
      }
    };
    
    loadToken();
  }, []);

  // Récupérer les contacts depuis Strapi
  const fetchContacts = useCallback(async (force = false) => {
    if (!token) {
      setSyncStatus({
        state: 'error',
        message: 'Token d\'authentification manquant',
      });
      return;
    }

    try {
      console.log('🌐 Récupération contacts web depuis Strapi...');
      setIsLoading(true);
      setSyncStatus({
        state: 'loading',
        message: 'Chargement de vos contacts...',
      });

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/contacts/my-contacts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(`Erreur API: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.data || result.data.length === 0) {
        setSyncStatus({
          state: 'empty',
          message: 'Aucun contact trouvé. Importez vos contacts depuis l\'application mobile.',
          lastSync: new Date().toISOString(),
          totalContacts: 0,
          bobUsers: 0,
        });
        setContacts([]);
        return;
      }

      // Convertir les données Strapi vers ContactWeb
      const webContacts: ContactWeb[] = result.data.map((contact: any) => ({
        id: contact.id.toString(),
        nom: contact.nom,
        prenom: contact.prenom,
        telephone: contact.telephone,
        email: contact.email,
        aSurBob: contact.aSurBob || false,
        groupes: contact.groupes || [],
        dernierStatutInvitation: contact.dernierStatutInvitation,
        derniereDateInvitation: contact.derniereDateInvitation,
        dateAjout: contact.dateAjout,
        source: contact.source || 'unknown',
      }));

      setContacts(webContacts);
      setSyncStatus({
        state: 'success',
        message: `${webContacts.length} contacts chargés avec succès`,
        lastSync: new Date().toISOString(),
        totalContacts: result.meta?.total || webContacts.length,
        bobUsers: result.meta?.bobUsers || webContacts.filter(c => c.aSurBob).length,
      });

      console.log('✅ Contacts web chargés:', {
        total: webContacts.length,
        bobUsers: webContacts.filter(c => c.aSurBob).length,
        groupes: result.meta?.groupes || 0,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement';
      console.error('❌ Erreur chargement contacts web:', errorMessage);
      
      setError(errorMessage);
      setSyncStatus({
        state: 'error',
        message: errorMessage,
        errors: [errorMessage],
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Rechercher dans les contacts
  const searchContacts = useCallback((query: string) => {
    if (!query.trim()) {
      return contacts;
    }

    const searchTerm = query.toLowerCase();
    return contacts.filter(contact => 
      contact.nom.toLowerCase().includes(searchTerm) ||
      contact.prenom?.toLowerCase().includes(searchTerm) ||
      contact.telephone.includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchTerm)
    );
  }, [contacts]);

  // Filtrer par statut Bob
  const filterByBobStatus = useCallback((hasBob: boolean | null = null) => {
    if (hasBob === null) {
      return contacts;
    }
    return contacts.filter(contact => contact.aSurBob === hasBob);
  }, [contacts]);

  // Obtenir les statistiques
  const getStats = useCallback(() => {
    return {
      total: contacts.length,
      bobUsers: contacts.filter(c => c.aSurBob).length,
      nonBobUsers: contacts.filter(c => !c.aSurBob).length,
      withEmail: contacts.filter(c => c.email).length,
      recentlyAdded: contacts.filter(c => {
        const addDate = new Date(c.dateAjout);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return addDate > weekAgo;
      }).length,
      groupes: [...new Set(contacts.flatMap(c => c.groupes.map(g => g.id)))].length,
      sources: {
        mobile: contacts.filter(c => c.source === 'import_repertoire').length,
        manual: contacts.filter(c => c.source === 'ajout_manuel').length,
        invitation: contacts.filter(c => c.source === 'invitation_acceptee').length,
      },
    };
  }, [contacts]);

  // Refresh manuel
  const refresh = useCallback(() => {
    return fetchContacts(true);
  }, [fetchContacts]);

  return {
    // États
    contacts,
    isLoading,
    error,
    syncStatus,
    
    // Méthodes
    fetchContacts,
    refresh,
    searchContacts,
    filterByBobStatus,
    getStats,
    
    // Utilitaires
    clearError: () => setError(null),
  };
};