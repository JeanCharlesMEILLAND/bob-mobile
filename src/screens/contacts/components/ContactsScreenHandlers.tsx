// src/screens/contacts/components/ContactsScreenHandlers.tsx
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { logger, logContacts } from '../../../utils/logger';

interface UseContactsScreenHandlersProps {
  scannerRepertoire: () => Promise<void>;
  addMultipleContacts: (contacts: any[]) => Promise<void>;
  getStats: () => Promise<any>;
  isLoading: boolean;
  setRefreshing: (value: boolean) => void;
  setShowPermissionModal: (value: boolean) => void;
  setShowSelectionInterface: (value: boolean) => void;
  setStats: (stats: any) => void;
}

export const useContactsScreenHandlers = ({
  scannerRepertoire,
  addMultipleContacts,
  getStats,
  isLoading,
  setRefreshing,
  setShowPermissionModal,
  setShowSelectionInterface,
  setStats
}: UseContactsScreenHandlersProps) => {

  const handleGetStarted = useCallback(async () => {
    logger.info('contacts', 'Utilisateur démarre onboarding contacts');
    logContacts('Démarrage processus contacts', {});

    try {
      await scannerRepertoire();
      
      // Calculer les stats immédiatement après scan
      const newStats = await getStats();
      setStats(newStats);
      
      logger.info('contacts', 'Scan initial terminé avec succès', { 
        contactsDisponibles: newStats.contactsDisponibles 
      });

      if (newStats.contactsDisponibles > 0) {
        setTimeout(() => {
          Alert.alert(
            'Répertoire scanné !',
            `${newStats.contactsDisponibles} contacts trouvés. Choisissez ceux que vous souhaitez ajouter à votre réseau Bob.`,
            [{ text: 'Choisir maintenant', onPress: () => setShowSelectionInterface(true) }]
          );
        }, 500);
      } else {
        setTimeout(() => {
          Alert.alert(
            'Répertoire vide',
            'Aucun contact trouvé dans votre répertoire.',
            [{ text: 'OK' }]
          );
        }, 500);
      }
      
    } catch (error) {
      logger.error('contacts', 'Erreur scan initial', error);
      
      // Gérer les erreurs de permission
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
          setShowPermissionModal(true);
          return;
        }
      }
      
      Alert.alert(
        'Erreur de scan',
        'Impossible de scanner votre répertoire. Vérifiez les permissions.',
        [
          { text: 'Paramètres', onPress: () => setShowPermissionModal(true) },
          { text: 'Réessayer', onPress: handleGetStarted }
        ]
      );
    }
  }, [scannerRepertoire, getStats, setStats, setShowSelectionInterface, setShowPermissionModal]);

  const handleScanRepertoire = useCallback(async () => {
    if (isLoading) return;
    
    logger.info('contacts', 'Scan manuel du répertoire');
    logContacts('Scan manuel répertoire', {});
    
    try {
      await scannerRepertoire();
      
      const newStats = await getStats();
      setStats(newStats);
      
      Alert.alert(
        'Scan terminé',
        `Votre répertoire a été mis à jour. ${newStats.contactsDisponibles} contacts disponibles.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      logger.error('contacts', 'Erreur scan manuel', error);
      
      Alert.alert(
        'Erreur de scan',
        'Impossible de scanner votre répertoire.',
        [{ text: 'OK' }]
      );
    }
  }, [scannerRepertoire, getStats, isLoading, setStats]);

  const handleImportSelected = useCallback(async (contactIds: string[]) => {
    if (contactIds.length === 0) {
      Alert.alert('Aucune sélection', 'Veuillez sélectionner au moins un contact.');
      return;
    }

    try {
      logger.info('contacts', 'Import contacts sélectionnés', { count: contactIds.length });
      logContacts('Import multiple contacts', { count: contactIds.length });

      // Convertir les IDs en objets contacts simples
      const contactsToAdd = contactIds.map(id => ({
        id,
        nom: `Contact ${id}`,
        telephone: `+33${id}`
      }));

      await addMultipleContacts(contactsToAdd);
      
      const newStats = await getStats();
      setStats(newStats);

      Alert.alert(
        'Contacts ajoutés !',
        `${contactIds.length} contact(s) ajouté(s) à votre répertoire Bob avec succès !`,
        [{ text: 'Super !' }]
      );

    } catch (error) {
      logger.error('contacts', 'Erreur import contacts', error);
      
      Alert.alert(
        'Erreur d\'import',
        'Certains contacts n\'ont pas pu être ajoutés.',
        [{ text: 'OK' }]
      );
    }
  }, [addMultipleContacts, getStats, setStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    
    try {
      await scannerRepertoire();
      const newStats = await getStats();
      setStats(newStats);
    } catch (error) {
      logger.error('contacts', 'Erreur refresh', error);
    } finally {
      setRefreshing(false);
    }
  }, [scannerRepertoire, getStats, setStats, setRefreshing]);

  return {
    handleGetStarted,
    handleScanRepertoire,
    handleImportSelected,
    handleRefresh
  };
};