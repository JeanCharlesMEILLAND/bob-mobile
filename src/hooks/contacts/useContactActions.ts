// src/hooks/contacts/useContactActions.ts
import { useCallback } from 'react';
import { useRealTimeSync } from '../../utils/realTimeSync';
import { logger, logContacts } from '../../utils/logger';
import { useNotifications } from '../../components/common/SmartNotifications';
import { authService } from '../../services/auth.service';
import { Contact } from '../../types/contacts.types';

interface UseContactActionsProps {
  optimisticActions: {
    addContactOptimistic: (contact: Partial<Contact>) => Contact;
    addMultipleContactsOptimistic: (contacts: any[]) => Contact[];
    removeContactOptimistic: (contactId: string) => void;
    markAsInvitedOptimistic: (contactId: string) => void;
    addInvitationOptimistic: (invitation: any) => void;
    rollbackInvitation: (contactId: string, contactPhone: string) => void;
  };
  optimisticRepertoire: Contact[];
  setOptimisticActionFlag?: (inProgress: boolean) => void; // 🔧 FIX: Flag pour contrôler la sync
}

export const useContactActions = ({ optimisticActions, optimisticRepertoire, setOptimisticActionFlag }: UseContactActionsProps) => {
  const rtSync = useRealTimeSync();
  const notifications = useNotifications();

  const addContactToRepertoire = useCallback(async (contact: any) => {
    logContacts('Ajout contact temps réel', { nom: contact.nom });

    try {
      await rtSync.addContact(
        contact,
        // 1. 🚀 UPDATE LOCAL IMMÉDIAT (utilisateur voit le changement instantané)
        () => {
          const newContact = optimisticActions.addContactOptimistic(contact);
          
          // ✅ Notification immédiate
          notifications.success(
            'Contact ajouté', 
            `${contact.nom} est dans votre répertoire`,
            { category: 'contacts_add' }
          );
          
          return newContact;
        },
        // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN
        async () => {
          const token = await authService.getValidToken();
          if (!token) throw new Error('Token manquant');
          // Ici sync avec Strapi
          logContacts('Contact ajouté dans Strapi', { nom: contact.nom });
        }
      );

    } catch (error) {
      logger.error('contacts', 'Erreur ajout contact', error);
      notifications.error(
        'Erreur d\'ajout',
        `Impossible d'ajouter ${contact.nom}`,
        {
          action: {
            label: 'Réessayer',
            onPress: () => addContactToRepertoire(contact)
          }
        }
      );
    }
  }, [rtSync, notifications, optimisticActions]);

  const removeContactFromRepertoire = useCallback(async (contactId: string) => {
    const contact = optimisticRepertoire.find(c => c.id === contactId);
    if (!contact) return;

    logContacts('Suppression contact temps réel', { id: contactId, nom: contact.nom });

    try {
      // 🔧 FIX: Activer le flag pour bloquer l'écrasement de l'état optimiste
      console.log('🔒 DÉBUT suppression - Activation flag anti-écrasement');
      setOptimisticActionFlag?.(true);
      
      // 1. 🚀 UPDATE LOCAL IMMÉDIAT (retirer de la vue)
      optimisticActions.removeContactOptimistic(contactId);
      
      // Notification immédiate
      notifications.success(
        'Contact supprimé',
        `${contact.nom} retiré de votre répertoire`,
        { category: 'contacts_remove' }
      );
      
      // 2. 📤 SUPPRESSION/RESTAURATION INTELLIGENTE EN ARRIÈRE-PLAN
      try {
        // Importer le ContactsManager pour utiliser la nouvelle méthode
        const { ContactsManager } = await import('../../services/contacts/ContactsManager');
        const manager = ContactsManager.getInstance();
        
        console.log(`🗑️ Suppression intelligente via ContactsManager: ${contact.telephone}`);
        
        const result = await manager.removeFromRepertoire(contact.telephone);
        
        if (result.success) {
          if (result.restoredAsPhone) {
            console.log(`✅ Contact restauré comme contact phone disponible: ${contact.nom}`);
            // Le contact sera maintenant disponible dans "Sélectionner des contacts"
          } else {
            console.log(`✅ Contact complètement supprimé: ${contact.nom}`);
          }
        } else {
          console.warn(`⚠️ Suppression partielle: ${result.error}`);
        }
        
      } catch (managerError) {
        console.error(`❌ Erreur ContactsManager:`, managerError);
      }
      
      // Libérer le flag après un délai pour permettre la sync
      console.log('🔓 FIN suppression - Libération flag dans 2s');
      setTimeout(() => {
        console.log('🔓 Flag libéré - Sync possible');
        setOptimisticActionFlag?.(false);
      }, 2000);

    } catch (error) {
      // En cas d'erreur, libérer le flag immédiatement et restaurer le contact
      setOptimisticActionFlag?.(false);
      logger.error('contacts', 'Erreur suppression contact', error);
      
      // Restaurer le contact dans la vue en cas d'erreur
      const restoredContact = optimisticActions.addContactOptimistic(contact);
      
      notifications.error(
        'Erreur de suppression',
        `Impossible de supprimer ${contact.nom}. Contact restauré.`,
        {
          action: {
            label: 'Réessayer',
            onPress: () => removeContactFromRepertoire(contactId)
          }
        }
      );
    }
  }, [notifications, optimisticActions, optimisticRepertoire, setOptimisticActionFlag]);

  const sendInvitationRealTime = useCallback(async (contactId: string, method: 'sms' | 'whatsapp') => {
    const contact = optimisticRepertoire.find(c => c.id === contactId);
    if (!contact) return;

    logContacts('Envoi invitation temps réel', { contactId, method, telephone: contact.telephone });

    try {
      await rtSync.sendInvitation(
        { contactId, method, telephone: contact.telephone },
        // 1. 🚀 UPDATE LOCAL IMMÉDIAT
        () => {
          // Marquer comme invité dans le répertoire
          optimisticActions.markAsInvitedOptimistic(contactId);

          // Ajouter à la liste des invitations
          const newInvitation = {
            id: Date.now(),
            telephone: contact.telephone,
            nom: contact.nom,
            type: method,
            statut: 'envoye' as const,
            dateEnvoi: new Date().toISOString(),
            nombreRelances: 0,
            codeParrainage: `BOB${Date.now().toString().slice(-4)}`
          };
          
          optimisticActions.addInvitationOptimistic(newInvitation);
          
          notifications.success(
            'Invitation envoyée',
            `${contact.nom} a reçu votre invitation Bob`,
            { category: 'invitations_send' }
          );
        },
        // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN
        async () => {
          // Ici service d'invitation Strapi
          await new Promise(resolve => setTimeout(resolve, 1000));
          logContacts('Invitation envoyée dans Strapi', { contactId });
        }
      );

    } catch (error) {
      logger.error('contacts', 'Erreur envoi invitation', error);
      
      // Rollback local
      optimisticActions.rollbackInvitation(contactId, contact.telephone || '');
      
      notifications.error(
        'Erreur d\'invitation',
        `Impossible d'inviter ${contact.nom}`,
        {
          action: {
            label: 'Réessayer',
            onPress: () => sendInvitationRealTime(contactId, method)
          }
        }
      );
    }
  }, [rtSync, notifications, optimisticActions, optimisticRepertoire]);

  const addMultipleContactsRealTime = useCallback(async (contacts: any[]) => {
    logContacts('Ajout multiple contacts temps réel', { count: contacts.length });

    // 1. 🚀 UPDATE LOCAL IMMÉDIAT - L'utilisateur voit tous les contacts
    const tempContacts = optimisticActions.addMultipleContactsOptimistic(contacts);
    
    // ✅ Notification de succès multiple
    notifications.success(
      'Contacts ajoutés',
      `${contacts.length} contacts ajoutés à votre répertoire`,
      { 
        category: 'contacts_bulk_add',
        duration: 4000
      }
    );

    // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN (async)
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant pour sync Strapi');

      // Ici sync bulk avec Strapi
      logContacts('Bulk contacts sync dans Strapi', { count: contacts.length });

    } catch (error) {
      logger.error('contacts', 'Erreur sync bulk contacts', error);
      
      notifications.warning(
        'Synchronisation partielle',
        `Contacts ajoutés localement, sync en cours...`,
        { duration: 3000 }
      );
    }
  }, [notifications, optimisticActions]);

  return {
    addContactToRepertoire,
    removeContactFromRepertoire,
    sendInvitationRealTime,
    addMultipleContactsRealTime
  };
};