// src/services/contacts/ContactsScanner.ts - Service dédié au scan des contacts téléphone

import * as Contacts from 'expo-contacts';
import { Contact, ScanResult } from '../../types/contacts.unified';

export class ContactsScanner {
  
  /**
   * Scanner tous les contacts du téléphone
   */
  async scanPhoneContacts(): Promise<ScanResult> {
    console.log('📱 Début du scan du répertoire téléphone...');
    
    try {
      // 1. Demander les permissions
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('❌ Permission contacts refusée');
        return {
          contacts: [],
          total: 0,
          hasPermission: false,
          errors: ['Permission d\'accès aux contacts refusée']
        };
      }

      console.log('✅ Permission contacts accordée');

      // 2. Récupérer tous les contacts avec les champs nécessaires
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.Emails
        ],
        sort: Contacts.SortTypes.FirstName
      });

      console.log(`📱 ${data.length} contacts bruts trouvés dans le téléphone`);

      // 3. Traitement et filtrage des contacts
      const processedContacts = this.processRawContacts(data);
      
      console.log(`✅ Scan terminé: ${processedContacts.length} contacts valides`);

      return {
        contacts: processedContacts,
        total: processedContacts.length,
        hasPermission: true,
        errors: []
      };

    } catch (error) {
      console.error('❌ Erreur lors du scan des contacts téléphone:', error);
      return {
        contacts: [],
        total: 0,
        hasPermission: false,
        errors: [error.message || 'Erreur inconnue lors du scan']
      };
    }
  }

  /**
   * Traiter et filtrer les contacts bruts du téléphone
   */
  private processRawContacts(rawContacts: Contacts.Contact[]): Contact[] {
    const processedContacts: Contact[] = [];
    const seenPhones = new Set<string>();

    for (const contact of rawContacts) {
      try {
        // Ignorer les contacts sans numéro de téléphone
        if (!contact.phoneNumbers || contact.phoneNumbers.length === 0) {
          continue;
        }

        // Prendre le premier numéro de téléphone
        const phoneNumber = contact.phoneNumbers[0].number;
        if (!phoneNumber || phoneNumber.trim().length === 0) {
          continue;
        }

        // Utiliser la méthode testée pour WhatsApp/SMS
        const normalizedPhone = this.cleanPhoneNumber(phoneNumber);
        
        // Ignorer les numéros trop courts ou invalides
        if (normalizedPhone.length < 8) {
          continue;
        }

        // Éviter les doublons par numéro de téléphone
        if (seenPhones.has(normalizedPhone)) {
          continue;
        }
        seenPhones.add(normalizedPhone);

        // Construire le nom complet
        const fullName = this.buildFullName(contact);
        if (!fullName || fullName.trim().length === 0) {
          continue; // Ignorer les contacts sans nom
        }

        // Construire l'objet Contact
        const processedContact: Contact = {
          id: contact.id || `phone_${normalizedPhone}`,
          telephone: normalizedPhone,
          nom: fullName,
          prenom: contact.firstName,
          email: contact.emails?.[0]?.email,
          source: 'phone',
          dateAjout: new Date().toISOString(),
          
          // Métadonnées pour le contact téléphone
          rawData: {
            id: contact.id,
            originalName: contact.name,
            firstName: contact.firstName,
            lastName: contact.lastName,
            phoneNumbers: contact.phoneNumbers,
            emails: contact.emails
          },
          
          // Indicateurs de qualité
          hasEmail: !!(contact.emails && contact.emails.length > 0),
          isComplete: !!(fullName && normalizedPhone && contact.firstName),
        };

        processedContacts.push(processedContact);

      } catch (error) {
        console.warn(`⚠️ Erreur traitement contact ${contact.name || 'Inconnu'}:`, error);
        // Continuer avec les autres contacts
      }
    }

    console.log(`📊 Traitement terminé: ${processedContacts.length} contacts valides sur ${rawContacts.length} bruts`);
    
    // Trier par nom pour un affichage cohérent
    return processedContacts.sort((a, b) => a.nom.localeCompare(b.nom));
  }

  /**
   * Construire le nom complet à partir des données du contact
   */
  private buildFullName(contact: Contacts.Contact): string {
    // Priority: name > firstName + lastName > firstName > lastName
    if (contact.name && contact.name.trim()) {
      return contact.name.trim();
    }

    const parts: string[] = [];
    
    if (contact.firstName && contact.firstName.trim()) {
      parts.push(contact.firstName.trim());
    }
    
    if (contact.lastName && contact.lastName.trim()) {
      parts.push(contact.lastName.trim());
    }

    return parts.join(' ');
  }

  /**
   * Nettoie et formate un numéro de téléphone (méthode testée pour WhatsApp/SMS)
   */
  private cleanPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Enlever tous les caractères non numériques sauf +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Si commence par 00, remplacer par +
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.substring(2);
    }
    
    // Si commence par 0 et pas de +, ajouter +33 (France)
    if (cleaned.startsWith('0') && !cleaned.startsWith('+')) {
      cleaned = '+33' + cleaned.substring(1);
    }
    
    // Si pas de + et commence par 6/7 (mobile français), ajouter +33
    if (!cleaned.startsWith('+') && /^[67]/.test(cleaned)) {
      cleaned = '+33' + cleaned;
    }
    
    // Si pas de + et plus de 8 chiffres, ajouter +33
    if (!cleaned.startsWith('+') && cleaned.length >= 8) {
      cleaned = '+33' + cleaned;
    }
    
    // Vérifier la longueur minimale
    if (cleaned.length < 8) return '';
    
    return cleaned;
  }

  /**
   * Obtenir des statistiques sur les contacts téléphone
   */
  async getPhoneContactsStats(): Promise<{
    totalContacts: number;
    contactsWithEmails: number;
    completeContacts: number;
    averagePhoneNumbers: number;
  }> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission contacts refusée');
      }

      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Name,
          Contacts.Fields.FirstName,
          Contacts.Fields.Emails
        ]
      });

      const withEmails = data.filter(c => c.emails && c.emails.length > 0).length;
      const complete = data.filter(c => 
        c.name && c.phoneNumbers && c.phoneNumbers.length > 0 && c.firstName
      ).length;
      const totalPhoneNumbers = data.reduce((sum, c) => 
        sum + (c.phoneNumbers ? c.phoneNumbers.length : 0), 0
      );
      const averagePhoneNumbers = data.length > 0 ? totalPhoneNumbers / data.length : 0;

      return {
        totalContacts: data.length,
        contactsWithEmails: withEmails,
        completeContacts: complete,
        averagePhoneNumbers: Math.round(averagePhoneNumbers * 100) / 100
      };

    } catch (error) {
      console.error('❌ Erreur calcul statistiques téléphone:', error);
      return {
        totalContacts: 0,
        contactsWithEmails: 0,
        completeContacts: 0,
        averagePhoneNumbers: 0
      };
    }
  }

  /**
   * Vérifier si l'accès aux contacts est disponible
   */
  async checkContactsPermission(): Promise<{
    granted: boolean;
    canAskAgain: boolean;
    status: string;
  }> {
    try {
      const permission = await Contacts.getPermissionsAsync();
      
      return {
        granted: permission.status === 'granted',
        canAskAgain: permission.canAskAgain !== false,
        status: permission.status
      };
    } catch (error) {
      console.error('❌ Erreur vérification permission contacts:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error'
      };
    }
  }

  /**
   * Demander la permission d'accès aux contacts
   */
  async requestContactsPermission(): Promise<boolean> {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      const granted = status === 'granted';
      
      console.log(`📱 Permission contacts: ${granted ? 'accordée' : 'refusée'} (${status})`);
      return granted;
    } catch (error) {
      console.error('❌ Erreur demande permission contacts:', error);
      return false;
    }
  }
}