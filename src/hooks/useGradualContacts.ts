// src/hooks/useGradualContacts.ts - Version intégrée à votre architecture
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

interface ContactAdded {
  id: string;
  nom: string;
  telephone: string;
  email?: string;
  dateAjout: string;
  source: 'repertoire' | 'invitation' | 'manuel';
  bobizGagnes?: number;
}

interface ContactSession {
  sessionId: string;
  date: string;
  contactsAjoutes: number;
  contacts: ContactAdded[];
}

interface ContactsStats {
  totalContacts: number;
  thisWeekAdded: number;
  totalSessions: number;
  totalBobizGained: number;
  avgPerSession: number;
  sourceStats: { [key: string]: number };
  lastContact: ContactAdded | null;
  recommendations: {
    shouldAddMore: boolean;
    recommendedCount: number;
    reason: string;
    motivation: string;
  };
}

const STORAGE_KEYS = {
  CONTACTS_ADDED: '@bob_contacts_added',
  SESSIONS_HISTORY: '@bob_sessions_history',
  WEEKLY_STATS: '@bob_weekly_stats',
} as const;

export const useGradualContacts = () => {
  const { user } = useAuth();
  const [contactsAdded, setContactsAdded] = useState<ContactAdded[]>([]);
  const [sessionsHistory, setSessionsHistory] = useState<ContactSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger les données au démarrage
  useEffect(() => {
    if (user) {
      loadStoredData();
    }
  }, [user]);

  const loadStoredData = async () => {
    try {
      const userPrefix = user?.id ? `_${user.id}` : '';
      const [storedContacts, storedSessions] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONTACTS_ADDED + userPrefix),
        AsyncStorage.getItem(STORAGE_KEYS.SESSIONS_HISTORY + userPrefix),
      ]);

      if (storedContacts) {
        setContactsAdded(JSON.parse(storedContacts));
      }

      if (storedSessions) {
        setSessionsHistory(JSON.parse(storedSessions));
      }

      console.log('📊 Données contacts graduel chargées pour utilisateur', user?.username);
    } catch (error) {
      console.error('❌ Erreur chargement données contacts:', error);
      setError('Erreur de chargement des données');
    }
  };

  // Ajouter des contacts (session)
  const addContactsBatch = useCallback(async (
    newContacts: Array<{
      id: string;
      nom: string;
      telephone: string;
      email?: string;
    }>,
    source: 'repertoire' | 'invitation' | 'manuel' = 'repertoire'
  ): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non connecté');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📱 Ajout de ${newContacts.length} contacts pour ${user.username}...`);

      // Créer les objets ContactAdded
      const contactsToAdd: ContactAdded[] = newContacts.map(contact => ({
        ...contact,
        dateAjout: new Date().toISOString(),
        source,
        bobizGagnes: calculateBobizGains(source, newContacts.length),
      }));

      // Éviter les doublons par téléphone
      const existingPhones = new Set(contactsAdded.map(c => c.telephone));
      const uniqueContacts = contactsToAdd.filter(c => !existingPhones.has(c.telephone));

      if (uniqueContacts.length === 0) {
        throw new Error('Tous ces contacts ont déjà été ajoutés');
      }

      // Mettre à jour la liste
      const updatedContacts = [...contactsAdded, ...uniqueContacts];
      setContactsAdded(updatedContacts);

      // Créer la session
      const newSession: ContactSession = {
        sessionId: `session_${Date.now()}`,
        date: new Date().toISOString(),
        contactsAjoutes: uniqueContacts.length,
        contacts: uniqueContacts,
      };

      const updatedSessions = [newSession, ...sessionsHistory].slice(0, 50);
      setSessionsHistory(updatedSessions);

      // Sauvegarder avec préfixe utilisateur
      const userPrefix = user.id ? `_${user.id}` : '';
      await Promise.all([
        AsyncStorage.setItem(
          STORAGE_KEYS.CONTACTS_ADDED + userPrefix, 
          JSON.stringify(updatedContacts)
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.SESSIONS_HISTORY + userPrefix, 
          JSON.stringify(updatedSessions)
        ),
      ]);

      // Mettre à jour les stats hebdomadaires
      await updateWeeklyStats(uniqueContacts.length);

      console.log(`✅ ${uniqueContacts.length} contacts ajoutés avec succès`);

      // TODO: Synchroniser avec le backend Bob
      // await syncContactsWithBob(uniqueContacts);

      return true;
    } catch (err: any) {
      console.error('❌ Erreur ajout contacts:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contactsAdded, sessionsHistory, user]);

  // Calculer les gains Bobiz selon la source et quantité
  const calculateBobizGains = (source: string, count: number): number => {
    let basePoints = 0;
    
    switch (source) {
      case 'repertoire':
        basePoints = 5; // 5 points par contact du répertoire
        break;
      case 'invitation':
        basePoints = 10; // 10 points par contact invité qui rejoint
        break;
      case 'manuel':
        basePoints = 3; // 3 points par contact ajouté manuellement
        break;
    }

    // Bonus pour ajout groupé
    const bonus = count >= 5 ? Math.floor(count / 5) * 2 : 0;
    
    return basePoints + bonus;
  };

  // Mettre à jour les stats hebdomadaires
  const updateWeeklyStats = async (newContactsCount: number) => {
    try {
      const userPrefix = user?.id ? `_${user.id}` : '';
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_STATS + userPrefix);
      const stats = stored ? JSON.parse(stored) : {};
      
      const weekKey = getWeekKey(new Date());
      stats[weekKey] = (stats[weekKey] || 0) + newContactsCount;
      
      // Garder seulement les 12 dernières semaines
      const sortedWeeks = Object.keys(stats).sort().slice(-12);
      const trimmedStats: { [key: string]: number } = {};
      sortedWeeks.forEach(week => {
        trimmedStats[week] = stats[week];
      });
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.WEEKLY_STATS + userPrefix, 
        JSON.stringify(trimmedStats)
      );
    } catch (error) {
      console.error('❌ Erreur mise à jour stats:', error);
    }
  };

  // Obtenir la clé de semaine (YYYY-WW)
  const getWeekKey = (date: Date): string => {
    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    return `${year}-${weekNumber.toString().padStart(2, '0')}`;
  };

  // Calculer le numéro de semaine
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Supprimer un contact
  const removeContact = useCallback(async (contactId: string): Promise<boolean> => {
    try {
      const updatedContacts = contactsAdded.filter(c => c.id !== contactId);
      setContactsAdded(updatedContacts);
      
      const userPrefix = user?.id ? `_${user.id}` : '';
      await AsyncStorage.setItem(
        STORAGE_KEYS.CONTACTS_ADDED + userPrefix, 
        JSON.stringify(updatedContacts)
      );
      
      console.log(`🗑️ Contact ${contactId} supprimé`);
      return true;
    } catch (error) {
      console.error('❌ Erreur suppression contact:', error);
      setError('Erreur lors de la suppression');
      return false;
    }
  }, [contactsAdded, user]);

  // Obtenir les recommandations de contacts à ajouter
  const getRecommendations = useCallback((): ContactsStats['recommendations'] => {
    const totalContacts = contactsAdded.length;
    const thisWeekAdded = getThisWeekContactsCount();
    const lastSessionDate = sessionsHistory[0]?.date;
    const daysSinceLastSession = lastSessionDate 
      ? Math.floor((Date.now() - new Date(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    // Logique de recommandation intelligente
    if (totalContacts === 0) {
      return {
        shouldAddMore: true,
        recommendedCount: 5,
        reason: 'Premier ajout',
        motivation: 'Commencez par ajouter vos 5 contacts les plus proches pour découvrir Bob !',
      };
    }

    if (totalContacts < 10) {
      return {
        shouldAddMore: true,
        recommendedCount: Math.min(5, 10 - totalContacts),
        reason: 'Réseau initial',
        motivation: 'Ajoutez encore quelques proches pour avoir un réseau d\'entraide solide.',
      };
    }

    if (thisWeekAdded === 0 && daysSinceLastSession > 7) {
      return {
        shouldAddMore: true,
        recommendedCount: 3,
        reason: 'Entretien réseau',
        motivation: 'Pensez à élargir votre réseau avec 2-3 nouveaux contacts cette semaine.',
      };
    }

    if (totalContacts < 25 && thisWeekAdded < 3) {
      return {
        shouldAddMore: true,
        recommendedCount: 2,
        reason: 'Croissance progressive',
        motivation: 'Votre réseau grandit bien ! Ajoutez encore 1-2 personnes.',
      };
    }

    return {
      shouldAddMore: false,
      recommendedCount: 0,
      reason: 'Réseau bien développé',
      motivation: 'Excellent ! Votre réseau est solide. Concentrez-vous sur les échanges.',
    };
  }, [contactsAdded, sessionsHistory]);

  // Compter les contacts ajoutés cette semaine
  const getThisWeekContactsCount = (): number => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    return contactsAdded.filter(contact => 
      new Date(contact.dateAjout) >= weekStart
    ).length;
  };

  // Obtenir les statistiques complètes
  const getStats = useCallback((): ContactsStats => {
    const totalContacts = contactsAdded.length;
    const thisWeekAdded = getThisWeekContactsCount();
    const totalSessions = sessionsHistory.length;
    const totalBobizGained = contactsAdded.reduce((sum, contact) => sum + (contact.bobizGagnes || 0), 0);
    
    // Répartition par source
    const sourceStats = contactsAdded.reduce((acc, contact) => {
      acc[contact.source] = (acc[contact.source] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    // Moyenne par session
    const avgPerSession = totalSessions > 0 ? Math.round(totalContacts / totalSessions * 10) / 10 : 0;

    // Contact le plus récent
    const lastContact = contactsAdded.length > 0 
      ? contactsAdded.reduce((latest, contact) => 
          new Date(contact.dateAjout) > new Date(latest.dateAjout) ? contact : latest
        )
      : null;

    return {
      totalContacts,
      thisWeekAdded,
      totalSessions,
      totalBobizGained,
      avgPerSession,
      sourceStats,
      lastContact,
      recommendations: getRecommendations(),
    };
  }, [contactsAdded, sessionsHistory, getRecommendations]);

  // Obtenir l'historique des sessions avec détails
  const getSessionsWithDetails = useCallback(() => {
    return sessionsHistory.map(session => ({
      ...session,
      relativeDate: getRelativeDate(session.date),
      bobizGained: session.contacts.reduce((sum, c) => sum + (c.bobizGagnes || 0), 0),
    }));
  }, [sessionsHistory]);

  // Date relative (il y a X jours)
  const getRelativeDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  // Vérifier si un téléphone existe déjà
  const isPhoneAlreadyAdded = useCallback((phone: string): boolean => {
    return contactsAdded.some(contact => contact.telephone === phone);
  }, [contactsAdded]);

  // Nettoyer les anciennes données (utilitaire)
  const cleanupOldData = async () => {
    try {
      // Garder seulement les contacts des 6 derniers mois
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentContacts = contactsAdded.filter(contact => 
        new Date(contact.dateAjout) >= sixMonthsAgo
      );
      
      if (recentContacts.length !== contactsAdded.length) {
        setContactsAdded(recentContacts);
        const userPrefix = user?.id ? `_${user.id}` : '';
        await AsyncStorage.setItem(
          STORAGE_KEYS.CONTACTS_ADDED + userPrefix, 
          JSON.stringify(recentContacts)
        );
        console.log(`🧹 ${contactsAdded.length - recentContacts.length} anciens contacts nettoyés`);
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
    }
  };

  return {
    // État
    contactsAdded,
    sessionsHistory,
    isLoading,
    error,
    
    // Actions principales
    addContactsBatch,
    removeContact,
    
    // Informations et stats
    getStats,
    getSessionsWithDetails,
    isPhoneAlreadyAdded,
    
    // Utilitaires
    cleanupOldData,
    clearError: () => setError(null),
  };
};