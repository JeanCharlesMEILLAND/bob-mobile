// 🚨 ANCIEN SYSTÈME DÉPRÉCIÉ 🚨
// Ce fichier est remplacé par le nouveau système dans services/contacts/
// Utilisez ContactsManager + ContactsSync à la place
// 
// src/services/sync.service.ts - Version complète et corrigée
import { apiClient } from './api';
import { contactsService } from './contacts.service';
import { invitationsService } from './invitations.service';
import { authService } from './auth.service';

// Import conditionnel pour éviter les erreurs
let notificationManager: any = null;
try {
  const SmartNotificationsModule = require('../components/common/SmartNotifications');
  notificationManager = SmartNotificationsModule.notificationManager;
} catch (error) {
  console.warn('⚠️ SmartNotifications non disponible, utilisation des logs uniquement');
}

// Types pour une meilleure sécurité de type
import type { Contact, Groupe } from '../types/contacts.types';

export interface SyncResult {
  success: boolean;
  contactsSync: number;
  errors: string[];
  timestamp: string;
}

export interface SyncOptions {
  createGroup?: boolean;
  groupName?: string;
  batchSize?: number;
  onProgress?: (progress: number) => void;
  forceSync?: boolean;
}

export interface FullState {
  groupes: Groupe[];
  contacts: Contact[];
  invitations: any[];
  timestamp: string;
}

export interface CleanupResult {
  duplicatesRemoved: number;
  orphansRemoved: number;
}

export interface BobVerificationResult {
  bobUsers: Record<string, boolean>;
  totalChecked: number;
  bobFound: number;
  errors: string[];
}

class SyncService {
  private issyncing: boolean = false;
  private syncedContactsCache: Map<string, string> = new Map();
  private lastFullSyncTimestamp: number = 0;
  private syncStartTime: number = 0;
  
  // Créer un hash simple d'un contact pour détecter les changements
  private createContactHash(contact: Contact): string {
    const normalizedPhone = this.normalizePhoneNumber(contact.telephone || '');
    return `${contact.nom?.trim() || ''}|${contact.prenom?.trim() || ''}|${normalizedPhone}|${contact.email?.trim() || ''}`;
  }

  // Normaliser un numéro de téléphone
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (!cleaned) return '';
    cleaned = cleaned.replace(/\++/g, '+');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      const secondDigit = cleaned.charAt(1);
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(secondDigit)) {
        return '+33' + cleaned.substring(1);
      }
    }
    return cleaned;
  }

  // 🚨 DÉSACTIVÉ: Synchroniser les contacts du téléphone avec Strapi
  async syncContactsAvecStrapi(
    contacts: Contact[],
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    console.warn('🚨 sync.service.syncContactsAvecStrapi est DÉSACTIVÉ - Redirection vers nouveau système');
    
    // 🚀 REDIRECTION vers le nouveau système optimisé
    try {
      const { ContactsManager } = await import('./contacts/ContactsManager');
      const manager = ContactsManager.getInstance();
      const result = await manager.syncToStrapi(contacts);
      
      return {
        success: result.success,
        contactsSync: result.created + result.updated,
        errors: result.errors,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Erreur redirection vers nouveau système:', error);
      return {
        success: false,
        contactsSync: 0,
        errors: ['Erreur migration vers nouveau système'],
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Autres méthodes dépréciées - redirection vers nouveau système
  async syncSingleContact(contact: Contact, token: string, groupeId?: number): Promise<Contact> {
    console.warn('🚨 sync.service.syncSingleContact est DÉPRÉCIÉ');
    return await contactsService.createContact({
      nom: contact.nom,
      prenom: contact.prenom || '',
      telephone: contact.telephone,
      email: contact.email,
    }, token);
  }

  async findContactByPhone(telephone: string, token: string): Promise<Contact | null> {
    console.warn('🚨 sync.service.findContactByPhone est DÉPRÉCIÉ');
    return await contactsService.findContactByPhone(telephone, token);
  }

  async getFullState(): Promise<FullState> {
    console.warn('🚨 sync.service.getFullState est DÉPRÉCIÉ');
    const token = await authService.getValidToken();
    if (!token) throw new Error('Token manquant');
    
    return {
      groupes: [],
      contacts: await contactsService.getMyContacts(token),
      invitations: [],
      timestamp: new Date().toISOString(),
    };
  }

  async transformContactsToUsers(contacts: Contact[], token: string): Promise<Contact[]> {
    console.warn('🚨 sync.service.transformContactsToUsers est DÉPRÉCIÉ');
    return contacts;
  }

  async verifierContactsBob(telephones: string[]): Promise<BobVerificationResult> {
    console.warn('🚨 sync.service.verifierContactsBob est DÉPRÉCIÉ');
    const { ContactsManager } = await import('./contacts/ContactsManager');
    const manager = ContactsManager.getInstance();
    const result = await manager.detectBobUsers();
    
    return {
      bobUsers: {},
      totalChecked: telephones.length,
      bobFound: 0,
      errors: [],
    };
  }

  // Méthodes utilitaires minimales
  private cleanupProgressNotifications(): void {
    // Nettoyage des notifications
  }

  private showSyncCompleteNotification(result: any, count: number): void {
    console.log(`✅ Sync terminée: ${count} contacts`);
  }

  private showSyncErrorNotification(error: string): void {
    console.error(`❌ Erreur sync: ${error}`);
  }
}

// Exporter une instance singleton
export const syncService = new SyncService();