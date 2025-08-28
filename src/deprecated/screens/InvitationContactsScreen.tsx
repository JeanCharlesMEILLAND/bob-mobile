// src/screens/contacts/InvitationContactsScreen.tsx - Écran d'invitation complètement indépendant
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { InvitationInterface } from '../../components/contacts/InvitationInterface';
import { useContacts } from '../../hooks/contacts/useContacts';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';

export const InvitationContactsScreen: React.FC = () => {
  const navigation = useSimpleNavigation();
  
  // Hook indépendant pour cet écran uniquement
  const {
    phoneContacts,      // Remplace contactsBruts
    repertoireContacts, // Remplace repertoire
    bobContacts,        // Remplace contacts
    invitedContacts,    // Remplace invitations
    loading,            // Remplace isLoading
    sendInvitation,
    removeContact,
    refreshData         // Remplace updateRealStats
  } = useContacts();

  // Debug des données de cet écran
  React.useEffect(() => {
    console.log('🎯 InvitationContactsScreen - Données indépendantes:', {
      contactsSansBob: repertoireContacts?.filter(c => !c.aSurBob)?.length || 0,
      contactsAvecBob: bobContacts?.length || 0,
      invitations: invitedContacts?.length || 0,
      loading,
      screenInstance: 'InvitationContactsScreen indépendant'
    });
  }, [repertoireContacts, bobContacts, invitedContacts, loading]);

  const handleClose = () => {
    console.log('🔙 Fermeture InvitationContactsScreen - SANS HARD REFRESH');
    navigation.goBack();
  };

  const handleInvitationSent = async () => {
    console.log('✅ Invitation envoyée - Mise à jour soft des stats');
    try {
      // Juste mettre à jour les stats, pas de vidage de cache
      await refreshData?.();
      console.log('✅ Stats mises à jour après invitation');
    } catch (error) {
      console.warn('⚠️ Erreur mise à jour stats post-invitation:', error);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    console.log('🗑️ Suppression contact depuis écran indépendant');
    try {
      await removeContact?.(contactId);
      console.log('✅ Contact supprimé, pas de refresh nécessaire');
    } catch (error) {
      console.error('❌ Erreur suppression contact:', error);
    }
  };

  const handleSaveGroupAssignments = (assignments: { contactId: string; groupes: any[] }[]) => {
    console.log('📋 Sauvegarde groupes depuis écran indépendant:', assignments);
    // La logique de sauvegarde est gérée par InvitationInterface
  };

  return (
    <View style={styles.container}>
      <InvitationInterface
        contactsSansBob={repertoireContacts?.filter(c => !c.aSurBob) || []}
        contactsAvecBob={bobContacts || []}
        contactsBruts={phoneContacts || []}
        onClose={handleClose}
        onInvitationSent={handleInvitationSent}
        onSaveGroupAssignments={handleSaveGroupAssignments}
        sendInvitationFromHook={sendInvitation}
        onRemoveContact={handleRemoveContact}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});