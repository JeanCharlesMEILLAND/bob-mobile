// =============================================================================
// 4. src/screens/contacts/ContactsInviteScreen.tsx - Écran dédié invitation
// =============================================================================

import React from 'react';
import { ContactSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';

interface ContactsInviteScreenProps {
  onBack?: () => void;
}

export const ContactsInviteScreen: React.FC<ContactsInviteScreenProps> = ({ onBack }) => {
  return (
    <ContactSelectionInterface
      onClose={onBack ?? (() => {})}
      contactsBruts={[]}
      contactsDejaSelectionnes={[]}
      onImportSelected={async (contactIds: string[]) => {}}
      isLoading={false}
    />
  );
};