// src/hooks/useMessageComposer.ts - Hook pour composer et envoyer des messages
import { useState, useCallback, useMemo } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { 
  MessageChannel, 
  MessageType, 
  generateMessage, 
  getBestTemplateForContact 
} from '../constants/messageTemplates';
import { Contact, GroupeType } from '../types/contacts.types';

interface UseMessageComposerProps {
  contacts?: Contact[];
  defaultType?: MessageType;
  defaultChannel?: MessageChannel;
}

interface MessageVariables {
  prenom?: string;
  objet?: string;
  duree?: string;
  evenement?: string;
  date?: string;
  service?: string;
  lien?: string;
}

export const useMessageComposer = ({
  contacts = [],
  defaultType = 'invitation',
  defaultChannel = 'sms'
}: UseMessageComposerProps = {}) => {
  const [messageType, setMessageType] = useState<MessageType>(defaultType);
  const [channel, setChannel] = useState<MessageChannel>(defaultChannel);
  const [customVariables, setCustomVariables] = useState<MessageVariables>({
    lien: 'bob-app.com/invite'
  });

  const contactsByGroupType = useMemo(() => {
    const grouped: Record<string, Contact[]> = {};
    
    contacts.forEach(contact => {
      const templateType = getBestTemplateForContact(contact);
      if (!grouped[templateType]) {
        grouped[templateType] = [];
      }
      grouped[templateType].push(contact);
    });
    
    return grouped;
  }, [contacts]);

  const getMessageForContact = useCallback((
    contact: Contact,
    variables?: MessageVariables
  ): string => {
    const groupType = getBestTemplateForContact(contact);
    const groupeTypeOrUndefined = groupType === 'default' ? undefined : groupType as GroupeType;
    const finalVariables = {
      prenom: contact.prenom || contact.nom.split(' ')[0],
      ...customVariables,
      ...variables
    };
    
    return generateMessage(channel, messageType, groupeTypeOrUndefined, finalVariables);
  }, [channel, messageType, customVariables]);

  const getMessagePreviews = useCallback((): Array<{
    groupType: string;
    contacts: Contact[];
    message: string;
  }> => {
    return Object.entries(contactsByGroupType).map(([groupType, groupContacts]) => {
      const groupeTypeOrUndefined = groupType === 'default' ? undefined : groupType as GroupeType;
      return {
        groupType,
        contacts: groupContacts,
        message: generateMessage(
          channel, 
          messageType, 
          groupeTypeOrUndefined,
          {
            prenom: '[Prénom]',
            ...customVariables
          }
        )
      };
    });
  }, [contactsByGroupType, channel, messageType, customVariables]);

  const sendSMS = useCallback(async (contact: Contact, customVars?: MessageVariables) => {
    if (!contact.telephone) {
      Alert.alert('Erreur', "Ce contact n'a pas de numéro de téléphone");
      return false;
    }

    const message = getMessageForContact(contact, customVars);
    const url = `sms:${contact.telephone}?body=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('Erreur', "Impossible d'ouvrir l'app SMS");
        return false;
      }
    } catch (error) {
      Alert.alert('Erreur', "Erreur lors de l'envoi du SMS");
      return false;
    }
  }, [getMessageForContact]);

  const sendWhatsApp = useCallback(async (contact: Contact, customVars?: MessageVariables) => {
    if (!contact.telephone) {
      Alert.alert('Erreur', "Ce contact n'a pas de numéro de téléphone");
      return false;
    }

    const message = getMessageForContact(contact, customVars);
    const phoneNumber = contact.telephone.replace(/[\\s\\-\\(\\)]/g, '');
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert(
          'WhatsApp non installé',
          "WhatsApp n'est pas installé sur votre appareil",
          [
            { text: 'Annuler', style: 'cancel' },
            { 
              text: 'Installer', 
              onPress: () => {
                const storeUrl = Platform.OS === 'ios' 
                  ? 'https://apps.apple.com/app/whatsapp-messenger/id310633997'
                  : 'https://play.google.com/store/apps/details?id=com.whatsapp';
                Linking.openURL(storeUrl);
              }
            }
          ]
        );
        return false;
      }
    } catch (error) {
      Alert.alert('Erreur', 'Erreur lors de l\'envoi WhatsApp');
      return false;
    }
  }, [getMessageForContact]);

  const sendMessage = useCallback(async (
    contact: Contact, 
    customVars?: MessageVariables
  ): Promise<boolean> => {
    switch (channel) {
      case 'sms':
        return sendSMS(contact, customVars);
      case 'whatsapp':
        return sendWhatsApp(contact, customVars);
      case 'notification':
        console.log('Notification:', getMessageForContact(contact, customVars));
        return true;
      case 'link':
        const message = getMessageForContact(contact, customVars);
        Clipboard.setString(message);
        Alert.alert('Lien copié', 'Le message avec le lien a été copié dans le presse-papier');
        return true;
      default:
        return false;
    }
  }, [channel, sendSMS, sendWhatsApp, getMessageForContact]);

  const sendBulkMessages = useCallback(async (
    selectedContacts: Contact[] = contacts,
    customVars?: MessageVariables
  ): Promise<{
    sent: number;
    failed: number;
    results: Array<{ contact: Contact; success: boolean }>;
  }> => {
    const results: Array<{ contact: Contact; success: boolean }> = [];
    let sent = 0;
    let failed = 0;

    const grouped = selectedContacts.reduce((acc, contact) => {
      const groupType = getBestTemplateForContact(contact);
      if (!acc[groupType]) acc[groupType] = [];
      acc[groupType].push(contact);
      return acc;
    }, {} as Record<string, Contact[]>);

    const totalContacts = selectedContacts.length;
    const groupCount = Object.keys(grouped).length;
    
    return new Promise((resolve) => {
      Alert.alert(
        "Confirmer l'envoi",
        `Envoyer ${totalContacts} message(s) personnalisé(s) via ${channel.toUpperCase()} ?\\n\\n${groupCount} type(s) de message différent(s)`,
        [
          { 
            text: 'Annuler', 
            style: 'cancel',
            onPress: () => resolve({ sent: 0, failed: 0, results: [] })
          },
          {
            text: 'Envoyer',
            onPress: async () => {
              for (const contact of selectedContacts) {
                const success = await sendMessage(contact, customVars);
                results.push({ contact, success });
                if (success) sent++;
                else failed++;
                
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              
              if (sent > 0) {
                Alert.alert(
                  'Envoi terminé',
                  `✅ ${sent} message(s) envoyé(s)\\n${failed > 0 ? `❌ ${failed} échec(s)` : ''}`
                );
              }
              
              resolve({ sent, failed, results });
            }
          }
        ]
      );
    });
  }, [contacts, sendMessage, getBestTemplateForContact, channel]);

  const copyMessage = useCallback(async (contact: Contact, customVars?: MessageVariables) => {
    const message = getMessageForContact(contact, customVars);
    Clipboard.setString(message);
    Alert.alert('Copié', 'Message copié dans le presse-papier');
  }, [getMessageForContact]);

  return {
    messageType,
    channel,
    customVariables,
    contactsByGroupType,
    
    setMessageType,
    setChannel,
    setCustomVariables: (vars: MessageVariables) => 
      setCustomVariables(prev => ({ ...prev, ...vars })),
    
    getMessageForContact,
    getMessagePreviews,
    sendMessage,
    sendSMS,
    sendWhatsApp,
    sendBulkMessages,
    copyMessage,
    
    getBestTemplateForContact,
  };
};