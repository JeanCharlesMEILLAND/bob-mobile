// src/hooks/contacts/useOptimisticState.ts
import { useState, useCallback } from 'react';
import { Contact } from '../../types/contacts.types';

export const useOptimisticState = (initialRepertoire: Contact[], initialInvitations: any[]) => {
  const [optimisticRepertoire, setOptimisticRepertoire] = useState(initialRepertoire);
  const [optimisticInvitations, setOptimisticInvitations] = useState(initialInvitations);

  const addContactOptimistic = useCallback((contact: Partial<Contact>) => {
    const newContact: Contact = {
      id: `temp_${Date.now()}`,
      nom: contact.nom || '',
      telephone: contact.telephone || '',
      email: contact.email,
      groupes: [],
      dateAjout: new Date().toISOString(),
      actif: true,
      source: 'manual',
      aSurBob: false,
      estInvite: false,
      ...contact
    };
    
    setOptimisticRepertoire(prev => [...prev, newContact]);
    return newContact;
  }, []);

  const addMultipleContactsOptimistic = useCallback((contacts: any[]) => {
    const tempContacts: Contact[] = contacts.map((contact, index) => ({
      id: `temp_${Date.now()}_${index}`,
      nom: contact.nom || contact.name || 'Nom manquant',
      telephone: contact.telephone || contact.phoneNumber,
      email: contact.email,
      groupes: [],
      dateAjout: new Date().toISOString(),
      actif: true,
      source: 'manual',
      aSurBob: false,
      estInvite: false
    }));
    
    setOptimisticRepertoire(prev => [...prev, ...tempContacts]);
    return tempContacts;
  }, []);

  const removeContactOptimistic = useCallback((contactId: string) => {
    setOptimisticRepertoire(prev => prev.filter(c => c.id !== contactId));
  }, []);

  const markAsInvitedOptimistic = useCallback((contactId: string) => {
    setOptimisticRepertoire(prev => prev.map(c => 
      c.id === contactId 
        ? { 
            ...c, 
            estInvite: true
          }
        : c
    ));
  }, []);

  const addInvitationOptimistic = useCallback((invitation: any) => {
    setOptimisticInvitations(prev => [...prev, invitation]);
  }, []);

  const rollbackInvitation = useCallback((contactId: string, contactPhone: string) => {
    setOptimisticRepertoire(prev => prev.map(c => 
      c.id === contactId 
        ? { ...c, estInvite: false }
        : c
    ));
    
    setOptimisticInvitations(prev => 
      prev.filter(i => i.telephone !== contactPhone)
    );
  }, []);

  const updateContactsFromBobDetection = useCallback((enrichedContacts: Contact[]) => {
    setOptimisticRepertoire(prev => {
      return prev.map(contact => {
        const enrichedContact = enrichedContacts.find(c => c.id === contact.id);
        return enrichedContact || contact;
      });
    });
  }, []);

  return {
    optimisticRepertoire,
    optimisticInvitations,
    setOptimisticRepertoire,
    setOptimisticInvitations,
    addContactOptimistic,
    addMultipleContactsOptimistic,
    removeContactOptimistic,
    markAsInvitedOptimistic,
    addInvitationOptimistic,
    rollbackInvitation,
    updateContactsFromBobDetection
  };
};