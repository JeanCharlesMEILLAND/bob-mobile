// =============================================================================
// 4. src/screens/contacts/ContactsInviteScreen.tsx - Écran dédié invitation
// =============================================================================

import React from 'react';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { useContactsBob } from '../../hooks/useContactsBob';

interface ContactsInviteScreenProps {
  onBack?: () => void;
}

export const ContactsInviteScreen: React.FC<ContactsInviteScreenProps> = ({ onBack }) => {
  const {
    contactsBruts,
    repertoire,
    importerContactsEtSync,
    isLoading,
  } = useContactsBob();

  const handleImportSelected = async (contactIds: string[]) => {
    try {
      await importerContactsEtSync(contactIds);
      onBack?.();
    } catch (error) {
      console.error('Erreur import contacts:', error);
    }
  };

  return (
    <ContactsSelectionInterface
      contactsBruts={contactsBruts}
      contactsDejaSelectionnes={repertoire.map(c => c.id)}
      onClose={onBack || (() => {})}
      onImportSelected={handleImportSelected}
      isLoading={isLoading}
    />
  );
};