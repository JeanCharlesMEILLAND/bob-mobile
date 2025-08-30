// src/services/contacts/ContactsManager.ts
import { Contact, ContactsStats } from '../../types/contacts.unified';
import { storageService } from '../storage.service';
import { logger } from '../../utils/logger';

export class ContactsManager {
  private static instance: ContactsManager;
  private contacts: Contact[] = [];
  private stats: ContactsStats = {
    total: 0,
    bob: 0,
    active: 0,
    offline: 0,
    new: 0,
    favorites: 0,
    groups: 0,
    lastSync: null
  };

  private constructor() {}

  static getInstance(): ContactsManager {
    if (!ContactsManager.instance) {
      ContactsManager.instance = new ContactsManager();
    }
    return ContactsManager.instance;
  }

  async getContacts(): Promise<Contact[]> {
    try {
      if (this.contacts.length === 0) {
        const stored = await storageService.get('cached_contacts');
        if (stored) {
          this.contacts = JSON.parse(stored);
        }
      }
      return this.contacts;
    } catch (error) {
      logger.error('contacts', 'Erreur récupération contacts', error);
      return [];
    }
  }

  async getStats(): Promise<ContactsStats> {
    await this.updateStats();
    return this.stats;
  }

  async updateStats(): Promise<void> {
    try {
      const contacts = await this.getContacts();
      
      this.stats = {
        total: contacts.length,
        bob: contacts.filter(c => c.isOnBob).length,
        active: contacts.filter(c => c.isActive && c.isOnBob).length,
        offline: contacts.filter(c => !c.isActive && c.isOnBob).length,
        new: contacts.filter(c => c.isNew).length,
        favorites: contacts.filter(c => c.isFavorite).length,
        groups: 0, // À implémenter si nécessaire
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      logger.error('contacts', 'Erreur mise à jour stats', error);
    }
  }

  async clearAllData(): Promise<void> {
    try {
      this.contacts = [];
      this.stats = {
        total: 0,
        bob: 0,
        active: 0,
        offline: 0,
        new: 0,
        favorites: 0,
        groups: 0,
        lastSync: null
      };
      
      await storageService.remove('cached_contacts');
      logger.debug('contacts', 'Données contacts supprimées');
    } catch (error) {
      logger.error('contacts', 'Erreur suppression données', error);
    }
  }

  async syncContacts(): Promise<void> {
    try {
      // Simulation d'une synchronisation
      logger.debug('contacts', 'Synchronisation contacts...');
      await this.updateStats();
    } catch (error) {
      logger.error('contacts', 'Erreur synchronisation', error);
    }
  }
}

export { ContactsManager as default };