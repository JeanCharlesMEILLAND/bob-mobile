// src/screens/contacts/ContactsSelectionScreen.tsx - Écran dédié à la sélection de contacts
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ContactsSelectionInterface } from '../../components/contacts/ContactsSelectionInterface';
import { useContacts } from '../../hooks/contacts/useContacts';
import { useSimpleNavigation } from '../../navigation/SimpleNavigation';
import { useNotifications } from '../../components/common/SmartNotifications';
import { SmartNotifications } from '../../components/common/SmartNotifications';

export const ContactsSelectionScreen: React.FC = () => {
  const navigation = useSimpleNavigation();
  const notifications = useNotifications();
  const {
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    isLoading,
    importerContactsSelectionnes,
    importerContactsEtSync
  } = useContacts();
  
  // State local pour contrôler le loader du bouton d'import
  const [isImporting, setIsImporting] = React.useState(false);

  // Debug: vérifier les données reçues
  React.useEffect(() => {
    console.log('🔍 ContactsSelectionScreen - Données reçues du hook:', {
      contactsBrutsLength: contactsBruts?.length || 0,
      repertoireLength: repertoire?.length || 0,
      isLoading,
      contactsBrutsExample: contactsBruts?.slice(0, 3),
      hookInstance: 'nouveau hook dans ContactsSelectionScreen'
    });
    
    if (contactsBruts?.length === 0) {
      console.log('⚠️ PROBLÈME: ContactsSelectionScreen a des contactsBruts vides!');
      console.log('🔍 Cela suggère que le hook se réinitialise à chaque navigation');
    }
  }, [contactsBruts, repertoire, isLoading]);

  const handleClose = () => {
    console.log('🔙 Retour sans import - ContactsSelectionScreen');
    console.log('📊 État lors du retour:', {
      repertoireLength: repertoire?.length || 0,
      contactsBrutsLength: contactsBruts?.length || 0
    });
    navigation.goBack();
  };

  const handleImportSelected = async (selectedIds: string[]) => {
    console.log('🎯🎯🎯 BOUTON IMPORT PRESSED - handleImportSelected appelé avec:', selectedIds.length, 'contacts');
    
    // Debug pour voir le répertoire
    console.log('🔍 DEBUG SCREEN - Répertoire passé au composant:', {
      length: repertoire?.length || 0,
      premier: repertoire?.[0]?.nom || 'AUCUN',
      exemple: repertoire?.slice(0, 3).map(c => ({ nom: c.nom, telephone: c.telephone })) || []
    });
    try {
      console.log(`📥 Import de ${selectedIds.length} contacts sélectionnés`);
      console.log('📊 Données avant import:', {
        repertoireLength: repertoire?.length || 0,
        contactsBrutsLength: contactsBruts?.length || 0
      });
      
      // 🔧 Lancer l'import en arrière-plan et afficher immédiatement la notification de succès
      importerContactsEtSync?.(selectedIds);
      
      // 🎉 Afficher notification de succès dans le même style que la suppression de contacts
      notifications.success(
        'Contacts ajoutés', 
        `${selectedIds.length} contact${selectedIds.length > 1 ? 's' : ''} ajouté${selectedIds.length > 1 ? 's' : ''} à votre répertoire Bob.`,
        { category: 'contacts_import' }
      );
      
      console.log('✅ Notification affichée, retour à l\'écran précédent');
      navigation.goBack();
    } catch (error) {
      console.error('❌ Erreur import contacts:', error);
    }
  };

  // Debug au rendu du screen
  console.log('🔍 ContactsSelectionScreen RENDER - Données:', {
    contactsBruts: contactsBruts?.length || 0,
    repertoire: repertoire?.length || 0,
    premierRepertoire: repertoire?.[0]?.nom || 'AUCUN'
  });

  return (
    <View style={styles.container}>
      <ContactsSelectionInterface
        contactsBruts={contactsBruts || []}
        repertoire={repertoire || []}
        isLoading={isImporting}
        onClose={handleClose}
        onImportSelected={handleImportSelected}
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