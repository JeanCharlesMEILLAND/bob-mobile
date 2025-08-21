// =============================================================================
// 4. src/screens/contacts/ContactsInviteScreen.tsx - Écran dédié invitation
// =============================================================================

import React from 'react';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';

interface ContactsInviteScreenProps {
  onBack?: () => void;
}

export const ContactsInviteScreen: React.FC<ContactsInviteScreenProps> = ({ onBack }) => {
  return <ContactsSelectionInterface onClose={onBack} />;
};