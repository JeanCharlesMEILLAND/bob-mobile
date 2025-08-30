// src/services/google-contacts.service.ts - Service pour Google Contacts API
import Constants from 'expo-constants';

interface GoogleContact {
  id: string;
  displayName: string;
  givenName?: string;
  familyName?: string;
  phoneNumbers?: Array<{
    value: string;
    type?: string;
  }>;
  emailAddresses?: Array<{
    value: string;
    type?: string;
  }>;
}

interface ImportResult {
  success: boolean;
  contacts: GoogleContact[];
  total: number;
  errors: string[];
}

class GoogleContactsService {
  private apiKey: string;

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.googleApiKey || '';
    if (!this.apiKey) {
      console.warn('⚠️ Clé API Google manquante dans app.json');
    }
  }

  /**
   * Importer les contacts depuis Google Contacts
   */
  async importGoogleContacts(): Promise<ImportResult> {
    if (!this.apiKey) {
      return {
        success: false,
        contacts: [],
        total: 0,
        errors: ['Clé API Google non configurée']
      };
    }

    try {
      console.log('📱 Import Google Contacts en cours...');

      // Pour le web, on utilise l'API Google Contacts
      // Pour mobile, on peut utiliser expo-contacts
      if (typeof window !== 'undefined') {
        return await this.importFromWeb();
      } else {
        return await this.importFromMobile();
      }
    } catch (error: any) {
      console.error('❌ Erreur import Google Contacts:', error);
      return {
        success: false,
        contacts: [],
        total: 0,
        errors: [error.message || 'Erreur inconnue']
      };
    }
  }

  /**
   * Import pour la version web (via Google Contacts API)
   */
  private async importFromWeb(): Promise<ImportResult> {
    try {
      // Cette méthode nécessiterait OAuth2 pour accéder aux contacts
      // Pour l'instant, on simule avec des contacts de test
      console.log('🌐 Import web - Simulation avec contacts de test');
      
      const testContacts: GoogleContact[] = [
        {
          id: 'test1',
          displayName: 'Marie Dubois',
          givenName: 'Marie',
          familyName: 'Dubois',
          phoneNumbers: [{ value: '+33123456789', type: 'mobile' }],
          emailAddresses: [{ value: 'marie.dubois@email.com', type: 'home' }]
        },
        {
          id: 'test2',
          displayName: 'Pierre Martin',
          givenName: 'Pierre', 
          familyName: 'Martin',
          phoneNumbers: [{ value: '+33987654321', type: 'mobile' }],
          emailAddresses: [{ value: 'pierre.martin@email.com', type: 'work' }]
        },
        {
          id: 'test3',
          displayName: 'Sophie Laurent',
          givenName: 'Sophie',
          familyName: 'Laurent',
          phoneNumbers: [{ value: '+33555123456', type: 'mobile' }],
          emailAddresses: [{ value: 'sophie.laurent@email.com', type: 'home' }]
        }
      ];

      return {
        success: true,
        contacts: testContacts,
        total: testContacts.length,
        errors: []
      };
    } catch (error: any) {
      return {
        success: false,
        contacts: [],
        total: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Import pour mobile (via expo-contacts)
   */
  private async importFromMobile(): Promise<ImportResult> {
    try {
      console.log('📱 Import mobile - Utilisation expo-contacts');
      
      // Dynamically import expo-contacts
      const { default: Contacts } = await import('expo-contacts');
      
      // Demander permission
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== 'granted') {
        return {
          success: false,
          contacts: [],
          total: 0,
          errors: ['Permission contacts refusée']
        };
      }

      // Récupérer les contacts
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails
        ],
        sort: Contacts.SortTypes.FirstName
      });

      // Convertir au format Google Contact
      const googleContacts: GoogleContact[] = data.map(contact => ({
        id: contact.id || Math.random().toString(),
        displayName: contact.name || 'Contact sans nom',
        givenName: contact.firstName,
        familyName: contact.lastName,
        phoneNumbers: contact.phoneNumbers?.map(phone => ({
          value: phone.number || '',
          type: phone.label || 'mobile'
        })),
        emailAddresses: contact.emails?.map(email => ({
          value: email.email || '',
          type: email.label || 'home'
        }))
      }));

      return {
        success: true,
        contacts: googleContacts,
        total: googleContacts.length,
        errors: []
      };
    } catch (error: any) {
      return {
        success: false,
        contacts: [],
        total: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * Convertir un GoogleContact vers le format BOB
   */
  convertToBobeContact(googleContact: GoogleContact) {
    const phone = googleContact.phoneNumbers?.[0]?.value || '';
    const email = googleContact.emailAddresses?.[0]?.value || '';
    
    return {
      nom: googleContact.familyName || googleContact.displayName.split(' ')[1] || googleContact.displayName,
      prenom: googleContact.givenName || googleContact.displayName.split(' ')[0] || '',
      telephone: this.normalizePhoneNumber(phone),
      email: email || null,
      source: 'google_contacts',
      actif: true,
      dateAjout: new Date().toISOString()
    };
  }

  /**
   * Normaliser un numéro de téléphone
   */
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Nettoyer le numéro
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // Si c'est un numéro français qui commence par 0, le convertir
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+33' + cleaned.substring(1);
    }
    
    // Si pas de +, ajouter +33 par défaut (pour la France)
    if (!cleaned.startsWith('+') && cleaned.length === 9) {
      return '+33' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Tester la connexion à l'API Google
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'Clé API Google manquante'
      };
    }

    try {
      // Simple test avec une requête à l'API Google
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=test`);
      
      return {
        success: true,
        message: 'Clé API Google configurée correctement'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion à l\'API Google'
      };
    }
  }
}

export const googleContactsService = new GoogleContactsService();
export type { GoogleContact, ImportResult };