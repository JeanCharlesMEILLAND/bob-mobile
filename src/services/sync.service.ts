// src/services/sync.service.ts - Version complète et corrigée
import { apiClient } from './api';
import { contactsService } from './contacts.service';
import { invitationsService } from './invitations.service';
import { authService } from './auth.service';

// Types pour une meilleure sécurité de type
import type { Contact, Groupe, UserProfile } from '../types/contacts.types';

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
  forceSync?: boolean; // Force la sync même si déjà fait
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
  
  // ==========================================
  // MÉTHODES PRINCIPALES DE SYNCHRONISATION
  // ==========================================

  // Synchroniser les contacts du téléphone avec Strapi (version robuste)
  async syncContactsAvecStrapi(
    contacts: Contact[],
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    // Validation des entrées
    if (!contacts || contacts.length === 0) {
      console.warn('⚠️ Aucun contact à synchroniser');
      return {
        success: true,
        contactsSync: 0,
        errors: [],
        timestamp: new Date().toISOString(),
      };
    }

    // Obtenir un token valide
    const token = await authService.getValidToken();
    if (!token) {
      console.error('❌ Aucun token valide pour la synchronisation');
      return {
        success: false,
        contactsSync: 0,
        errors: ['Aucun token d\'authentification valide'],
        timestamp: new Date().toISOString(),
      };
    }

    const {
      createGroup = true,
      groupName = 'Mes contacts',
      batchSize = 1, // 1 seul contact par batch pour éviter le rate limiting
      onProgress,
      forceSync = false
    } = options;
    
    console.log('🔄 Sync contacts avec Strapi:', contacts.length);
    
    // Éviter les syncs multiples simultanées
    if (this.issyncing && !forceSync) {
      console.warn('⚠️ Synchronisation déjà en cours');
      return {
        success: false,
        contactsSync: 0,
        errors: ['Synchronisation déjà en cours'],
        timestamp: new Date().toISOString(),
      };
    }

    this.issyncing = true;

    const result: SyncResult = {
      success: false,
      contactsSync: 0,
      errors: [],
      timestamp: new Date().toISOString(),
    };
    
    try {
      // 1. Créer/récupérer le groupe "Mes contacts"
      let groupeMesContacts: Groupe | null = null;
      
      if (createGroup) {
        try {
          groupeMesContacts = await this.getOrCreateGroup(groupName, token);
          if (groupeMesContacts) {
            console.log('✅ Groupe disponible:', groupeMesContacts.id);
          }
        } catch (error) {
          console.error('⚠️ Erreur gestion groupe:', error);
          result.errors.push('Erreur création/récupération groupe');
          // Continuer sans groupe
        }
      }
      
      // 2. Filtrer les contacts valides
      const validContacts = contacts.filter(contact => 
        contact.nom && contact.nom.trim() && 
        contact.telephone && contact.telephone.trim()
      );

      if (validContacts.length === 0) {
        console.warn('⚠️ Aucun contact valide à synchroniser');
        result.success = true;
        return result;
      }

      console.log(`📊 ${validContacts.length}/${contacts.length} contacts valides à synchroniser`);
      
      // 3. Synchroniser par batches avec gestion d'erreurs
      const totalBatches = Math.ceil(validContacts.length / batchSize);
      
      for (let i = 0; i < validContacts.length; i += batchSize) {
        const batch = validContacts.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        
        console.log(`📤 Batch ${batchNumber}/${totalBatches} (${batch.length} contacts)`);
        
        try {
          // Vérifier que le token est toujours valide
          const currentToken = await authService.getValidToken();
          if (!currentToken) {
            throw new Error('Token expiré pendant la synchronisation');
          }

          // Sync individuelle SÉQUENTIELLE pour éviter le rate limiting
          for (let j = 0; j < batch.length; j++) {
            const contact = batch[j];
            try {
              await this.syncSingleContact(contact, currentToken, groupeMesContacts?.id);
              result.contactsSync++;
              console.log(`✅ Contact ${j + 1}/${batch.length} du batch ${batchNumber} synchronisé`);
              
              // Délai entre chaque contact pour éviter le rate limiting
              if (j < batch.length - 1) {
                await this.sleep(8000); // 8 secondes entre chaque contact
              }
            } catch (error) {
              const err = error as Error;
              console.error(`❌ Erreur contact ${contact.nom}:`, err);
              result.errors.push(`${contact.nom}: ${err?.message || 'Erreur inconnue'}`);
            }
          }
          
          // Mise à jour du progrès
          const progress = Math.round(((i + batch.length) / validContacts.length) * 100);
          onProgress?.(progress);
          
          // Délai plus long entre batches pour éviter le rate limiting
          if (batchNumber < totalBatches) {
            await this.sleep(10000); // 10 secondes entre batches
          }
          
        } catch (error) {
          const err = error as Error;
          console.error(`❌ Erreur batch ${batchNumber}:`, err);
          result.errors.push(`Batch ${batchNumber}: ${err.message}`);
          
          // En cas d'erreur critique (token expiré), arrêter la sync
          if (err.message.includes('Token') || err.message.includes('401')) {
            console.error('❌ Erreur critique d\'authentification, arrêt de la sync');
            break;
          }
        }
      }
      
      result.success = result.contactsSync > 0 || validContacts.length === 0;
      
      console.log(`✅ Sync terminée: ${result.contactsSync}/${validContacts.length} contacts synchronisés`);
      
      if (result.errors.length > 0) {
        console.warn(`⚠️ ${result.errors.length} erreurs pendant la sync`);
      }
      
      return result;
      
    } catch (error) {
      const err = error as Error;
      console.error('❌ Erreur sync globale:', err);
      result.errors.push(`Erreur globale: ${err.message}`);
      return result;
    } finally {
      this.issyncing = false;
    }
  }

  // Synchroniser un contact individuel
  async syncSingleContact(
    contact: Contact,
    token: string,
    groupeId?: number
  ): Promise<Contact> {
    try {
      // Validation du contact
      if (!contact.nom?.trim() || !contact.telephone?.trim()) {
        throw new Error('Contact invalide: nom ou téléphone manquant');
      }

      // Normaliser le numéro de téléphone
      const normalizedPhone = this.normalizePhoneNumber(contact.telephone);
      
      // Vérifier si le contact existe déjà
      const existing = await this.findContactByPhone(normalizedPhone, token);
      
      if (existing) {
        // Mettre à jour si nécessaire
        const needsUpdate = existing.nom !== contact.nom || 
                           existing.email !== contact.email ||
                           existing.telephone !== normalizedPhone;
                           
        if (needsUpdate) {
          console.log(`🔄 Mise à jour contact: ${contact.nom}`);
          return await contactsService.updateContact(existing.id!, {
            nom: contact.nom.trim(),
            email: contact.email?.trim(),
            telephone: normalizedPhone,
          }, token);
        }
        return existing;
      } else {
        // Créer nouveau contact
        console.log(`➕ Création contact: ${contact.nom}`);
        
        // Séparer nom et prénom intelligemment
        const { nom, prenom } = this.parseFullName(contact.nom.trim());
        
        const newContact = await contactsService.createContact({
          nom,
          prenom,
          telephone: normalizedPhone,
          email: contact.email?.trim(),
          groupeIds: groupeId ? [groupeId] : [],
        }, token);
        
        // Délai plus long entre créations pour éviter le rate limiting
        await this.sleep(2000);
        
        return newContact;
      }
    } catch (error) {
      console.error('❌ Erreur sync contact individuel:', error);
      throw error;
    }
  }

  // ==========================================
  // TRANSFORMATION CONTACTS → USERS
  // ==========================================

  // Transformer automatiquement les contacts avec Bob en users
  async transformContactsToUsers(contacts: Contact[], token: string): Promise<Contact[]> {
    console.log('🔄 Transformation contacts → users:', contacts.length);
    
    if (!contacts.length) return contacts;

    try {
      // 1. Récupérer tous les utilisateurs Bob enregistrés (vraie source de vérité)
      const usersResponse = await apiClient.get('/users', token);
      const bobUsers = usersResponse.ok ? (await usersResponse.json()) : [];
      
      console.log('👥 Utilisateurs Bob inscrits:', bobUsers.length);

      // 2. Créer un mapping téléphone → utilisateur Bob (vraie détection)
      const bobUsersByPhone: Record<string, any> = {};
      bobUsers.forEach((bobUser: any) => {
        if (bobUser.telephone) {
          const normalizedPhone = this.normalizePhoneNumber(bobUser.telephone);
          bobUsersByPhone[normalizedPhone] = bobUser;
          console.log(`📞 Utilisateur Bob détecté: ${bobUser.username} (${bobUser.telephone})`);
        }
      });

      // 3. Enrichir les contacts avec les données utilisateur (utiliser les vrais users)
      const enrichedContacts = contacts.map(contact => {
        if (!contact.telephone) return contact;

        const normalizedPhone = this.normalizePhoneNumber(contact.telephone);
        const bobUser = bobUsersByPhone[normalizedPhone];

        if (bobUser) {
          console.log(`✅ Contact ${contact.nom} → User Bob trouvé (ID: ${bobUser.documentId})`);
          
          return {
            ...contact,
            userId: bobUser.id,
            aSurBob: true,
            userProfile: {
              id: bobUser.documentId,
              nom: bobUser.nom || contact.nom,
              prenom: bobUser.prenom || contact.prenom,
              email: bobUser.email,
              telephone: bobUser.telephone,
              avatar: bobUser.avatar,
              bobizPoints: bobUser.bobizPoints || 0,
              niveau: bobUser.niveau || 'Débutant',
              estEnLigne: bobUser.estEnLigne || false,
              derniereActivite: bobUser.dernierConnexion || new Date().toISOString(),
              dateInscription: bobUser.dateInscription || new Date().toISOString(),
            }
          };
        }

        return {
          ...contact,
          userId: undefined,
          aSurBob: false,
          userProfile: undefined
        };
      });

      // 4. Mettre à jour les contacts dans Strapi avec les nouvelles infos
      await this.updateContactsWithUserInfo(enrichedContacts.filter(c => c.userId), token);

      console.log(`✅ Transformation terminée: ${enrichedContacts.filter(c => c.aSurBob).length} contacts sont des users Bob`);
      
      return enrichedContacts;

    } catch (error) {
      console.error('❌ Erreur transformation contacts → users:', error);
      // Retourner les contacts originaux avec aSurBob = false en cas d'erreur
      return contacts.map(contact => ({
        ...contact,
        userId: undefined,
        aSurBob: false,
        userProfile: undefined
      }));
    }
  }

  // Mettre à jour les contacts dans Strapi avec les infos utilisateur
  private async updateContactsWithUserInfo(contactsWithUsers: Contact[], token: string): Promise<void> {
    console.log('💾 Mise à jour des contacts avec infos users:', contactsWithUsers.length);

    for (const contact of contactsWithUsers) {
      if (!contact.id || !contact.userId) continue;

      try {
        await contactsService.updateContact(contact.id, {
          userId: contact.userId,
          aSurBob: true,
        } as any, token);

        console.log(`✅ Contact ${contact.nom} mis à jour avec user ID ${contact.userId}`);
        
        // Petit délai pour éviter le rate limiting
        await this.sleep(100);
        
      } catch (error) {
        console.error(`❌ Erreur mise à jour contact ${contact.nom}:`, error);
      }
    }
  }

  // Calculer le niveau d'un utilisateur basé sur ses points
  private calculateUserLevel(bobizPoints: number): 'Débutant' | 'Ami fidèle' | 'Super Bob' | 'Légende' {
    if (bobizPoints >= 1000) return 'Légende';
    if (bobizPoints >= 500) return 'Super Bob';
    if (bobizPoints >= 200) return 'Ami fidèle';
    return 'Débutant';
  }

  // ==========================================
  // VÉRIFICATION DES UTILISATEURS BOB
  // ==========================================

  // Vérifier qui a Bob parmi mes contacts (version optimisée et robuste)
  async verifierContactsBob(
    telephones: string[]
  ): Promise<BobVerificationResult> {
    console.log('🔍 Vérification contacts Bob:', telephones.length);
    
    const result: BobVerificationResult = {
      bobUsers: {},
      totalChecked: 0,
      bobFound: 0,
      errors: []
    };

    if (telephones.length === 0) {
      return result;
    }

    // Obtenir un token valide
    const token = await authService.getValidToken();
    if (!token) {
      result.errors.push('Aucun token d\'authentification valide');
      return result;
    }
    
    try {
      // Créer un mapping entre les numéros originaux et normalisés
      const phoneMapping: Record<string, string> = {};
      telephones
        .filter(tel => tel && tel.trim())
        .forEach(original => {
          const normalized = this.normalizePhoneNumber(original);
          phoneMapping[normalized] = original;
        });

      const normalizedPhones = [...new Set(Object.keys(phoneMapping))];
      result.totalChecked = normalizedPhones.length;
      
      // Diviser en chunks pour éviter les URLs trop longues
      const chunkSize = 50;
      
      for (let i = 0; i < normalizedPhones.length; i += chunkSize) {
        const chunk = normalizedPhones.slice(i, i + chunkSize);
        
        try {
          // Vérifier que le token est toujours valide
          const currentToken = await authService.getValidToken();
          if (!currentToken) {
            throw new Error('Token expiré pendant la vérification');
          }

          // Essayer d'abord l'endpoint optimisé
          let chunkResults: Record<string, boolean> = {};
          
          try {
            const response = await apiClient.post('/users/check-phones', {
              telephones: chunk
            }, currentToken);
            
            if (response.ok) {
              const data = await response.json();
              chunkResults = data.results || {};
              console.log(`✅ Vérification batch réussie: ${chunk.length} numéros`);
            } else {
              throw new Error(`API check-phones failed: ${response.status}`);
            }
          } catch (apiError) {
            console.warn('⚠️ Endpoint check-phones indisponible, fallback individuel');
            
            // Fallback: vérifier individuellement
            for (const tel of chunk) {
              try {
                chunkResults[tel] = await this.checkSinglePhone(tel, currentToken);
                await this.sleep(200); // Pause plus longue entre vérifications
              } catch (error) {
                console.error(`❌ Erreur vérification ${tel}:`, error);
                chunkResults[tel] = false;
                result.errors.push(`Erreur vérification ${tel}`);
              }
            }
          }

          // Mapper les résultats aux numéros originaux
          Object.entries(chunkResults).forEach(([normalizedPhone, hasBob]) => {
            const originalPhone = phoneMapping[normalizedPhone];
            if (originalPhone) {
              result.bobUsers[originalPhone] = hasBob;
            }
          });
          
        } catch (chunkError) {
          console.error('❌ Erreur chunk vérification:', chunkError);
          result.errors.push(`Erreur chunk ${i / chunkSize + 1}`);
          
          // Marquer tous les numéros du chunk comme non Bob en cas d'erreur
          for (const normalizedTel of chunk) {
            const originalTel = phoneMapping[normalizedTel];
            if (originalTel) {
              result.bobUsers[originalTel] = false;
            }
          }
        }
        
        // Délai plus long entre chunks
        if (i + chunkSize < normalizedPhones.length) {
          await this.sleep(1000); // 1 seconde entre chunks
        }
      }
      
      // Compter les utilisateurs Bob trouvés
      result.bobFound = Object.values(result.bobUsers).filter(Boolean).length;
      
      console.log(`✅ Vérification terminée: ${result.bobFound}/${result.totalChecked} utilisateurs Bob trouvés`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erreur vérification globale:', error);
      result.errors.push(`Erreur globale: ${(error as Error).message}`);
      
      // Fallback complet: marquer tous comme non Bob
      telephones.forEach(tel => {
        if (tel && tel.trim()) {
          result.bobUsers[tel] = false;
        }
      });
      
      return result;
    }
  }

  // ==========================================
  // MÉTHODES DE RECHERCHE ET UTILITAIRES
  // ==========================================

  // Trouver un contact par téléphone
  async findContactByPhone(telephone: string, token: string): Promise<Contact | null> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(telephone);
      const response = await apiClient.get(
        `/contacts?filters[telephone][$eq]=${encodeURIComponent(normalizedPhone)}`,
        token
      );
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token d\'authentification invalide');
        }
        return null;
      }
      
      const result = await response.json();
      return result.data?.[0] ? {
        id: result.data[0].id,
        ...result.data[0].attributes
      } : null;
    } catch (error) {
      console.error('❌ Erreur recherche contact:', error);
      throw error;
    }
  }

  // Vérifier un seul numéro (méthode helper)
  private async checkSinglePhone(telephone: string, token: string): Promise<boolean> {
    try {
      const normalizedPhone = this.normalizePhoneNumber(telephone);
      const response = await apiClient.get(
        `/users?filters[telephone][$eq]=${encodeURIComponent(normalizedPhone)}`,
        token
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.data && data.data.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Erreur vérification téléphone individuel:', error);
      return false;
    }
  }

  // Obtenir ou créer un groupe
  private async getOrCreateGroup(groupName: string, token: string): Promise<Groupe | null> {
    try {
      const groupes = await contactsService.getMyGroupes(token);
      let groupe = groupes.find((g: Groupe) => g.nom === groupName) || null;
      
      if (!groupe) {
        console.log(`📁 Création du groupe: ${groupName}`);
        groupe = await contactsService.createGroupe({
          nom: groupName,
          description: 'Contacts importés du téléphone',
          type: 'custom',
          couleur: '#2196F3',
        }, token);
      }
      
      return groupe;
    } catch (error) {
      console.error('❌ Erreur gestion groupe:', error);
      return null;
    }
  }

  // Normaliser un numéro de téléphone
  private normalizePhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Supprimer tous les caractères non numériques sauf + au début
    let normalized = phone.replace(/[^\d+]/g, '');
    
    // Si commence par 0, remplacer par +33 (France)
    if (normalized.startsWith('0')) {
      normalized = '+33' + normalized.substring(1);
    }
    
    // Si ne commence pas par +, ajouter +33
    if (!normalized.startsWith('+')) {
      normalized = '+33' + normalized;
    }
    
    return normalized;
  }

  // ==========================================
  // GESTION D'ÉTAT ET NETTOYAGE
  // ==========================================

  // Récupérer l'état complet depuis Strapi (optimisé)
  async getFullState(): Promise<FullState> {
    console.log('📊 Récupération état complet depuis Strapi');
    
    const token = await authService.getValidToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification valide');
    }
    
    try {
      // Récupération parallèle pour optimiser les performances
      const [groupesResult, invitationsResult, contactsResult] = await Promise.allSettled([
        contactsService.getMyGroupes(token),
        invitationsService.getMyInvitations(token),
        apiClient.get('/contacts?populate=*&sort=nom:asc', token)
      ]);
      
      // Traiter les résultats
      const finalGroupes = groupesResult.status === 'fulfilled' ? groupesResult.value : [];
      const finalInvitations = invitationsResult.status === 'fulfilled' ? invitationsResult.value : [];
      
      let finalContacts: Contact[] = [];
      if (contactsResult.status === 'fulfilled' && contactsResult.value.ok) {
        try {
          const contactsData = await contactsResult.value.json();
          
          // Debug: voir la vraie structure des données
          console.log('🔍 DEBUG API /contacts response:', JSON.stringify(contactsData, null, 2));
          if (contactsData.data && contactsData.data[0]) {
            console.log('🔍 DEBUG Premier contact:', JSON.stringify(contactsData.data[0], null, 2));
          }
          
          // Strapi 5 : structure plate, pas d'attributes, documentId au lieu d'id
          finalContacts = contactsData.data?.map((item: any) => ({
            id: item.documentId || item.id, // Strapi 5 utilise documentId
            nom: item.nom,
            prenom: item.prenom, 
            telephone: item.telephone,
            email: item.email,
            actif: item.actif,
            aSurBob: item.aSurBob,
            estInvite: item.estInvite,
            dateAjout: item.dateAjout,
            source: item.source,
            groupes: item.groupes || []
          })) || [];
        } catch (jsonError) {
          console.error('❌ Erreur parsing JSON contacts:', jsonError);
        }
      }
      
      // Enrichir les contacts avec les informations de groupes
      const enrichedContacts = finalContacts.map(contact => ({
        ...contact,
        groupes: finalGroupes.filter((groupe: Groupe) => 
          groupe.membres?.some((m: Contact) => m.id === contact.id)
        ),
        // Ajouter aussi les IDs pour compatibilité
        groupeIds: finalGroupes
          .filter((groupe: Groupe) => 
            groupe.membres?.some((m: Contact) => m.id === contact.id)
          )
          .map(groupe => groupe.id)
      }));
      
      console.log(`✅ État récupéré: ${finalGroupes.length} groupes, ${enrichedContacts.length} contacts, ${finalInvitations.length} invitations`);
      
      return {
        groupes: finalGroupes,
        contacts: enrichedContacts,
        invitations: finalInvitations,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error) {
      console.error('❌ Erreur getFullState:', error);
      throw error;
    }
  }

  // Nettoyer les doublons et données incohérentes
  async cleanupData(): Promise<CleanupResult> {
    console.log('🧹 Nettoyage des données...');
    
    const token = await authService.getValidToken();
    if (!token) {
      throw new Error('Aucun token d\'authentification valide');
    }
    
    try {
      const { contacts } = await this.getFullState();
      
      // Détecter les doublons par téléphone
      const phoneMap = new Map<string, Contact[]>();
      contacts.forEach(contact => {
        if (contact.telephone) {
          const normalized = this.normalizePhoneNumber(contact.telephone);
          if (!phoneMap.has(normalized)) {
            phoneMap.set(normalized, []);
          }
          phoneMap.get(normalized)!.push(contact);
        }
      });
      
      let duplicatesRemoved = 0;
      
      // Supprimer les doublons (garder le plus récent)
      for (const [phone, duplicates] of phoneMap.entries()) {
        if (duplicates.length > 1) {
          console.log(`🔍 Doublons détectés pour ${phone}:`, duplicates.length);
          
          // Trier par date de création (plus récent en premier)
          duplicates.sort((a, b) => {
            const dateA = a.dateAjout ? new Date(a.dateAjout).getTime() : 0;
            const dateB = b.dateAjout ? new Date(b.dateAjout).getTime() : 0;
            return dateB - dateA;
          });
          
          // Supprimer tous sauf le premier
          for (let i = 1; i < duplicates.length; i++) {
            try {
              if (duplicates[i].id) {
                await contactsService.deleteContact(duplicates[i].id!, token);
                duplicatesRemoved++;
                console.log(`🗑️ Doublon supprimé:`, duplicates[i].nom);
                
                // Petit délai pour éviter le rate limiting
                await this.sleep(100);
              }
            } catch (error) {
              console.error('❌ Erreur suppression doublon:', error);
            }
          }
        }
      }
      
      console.log(`✅ Nettoyage terminé: ${duplicatesRemoved} doublons supprimés`);
      
      return {
        duplicatesRemoved,
        orphansRemoved: 0, // À implémenter si nécessaire
      };
      
    } catch (error) {
      console.error('❌ Erreur nettoyage:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTHODES UTILITAIRES
  // ==========================================

  // Méthode utilitaire pour les délais
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Corriger les problèmes d'encodage UTF-8
  private fixTextEncoding(text: string): string {
    if (!text) return text;
    
    // Corrections d'encodage courantes
    const corrections: Record<string, string> = {
      '√Ø': 'ï', // Marie Patalago√Øty → Marie Patalagoïty
      '√´': 'é',
      '√¢': 'â',
      '√™': 'è',
      '√ß': 'à',
      '√π': 'ù',
      '√¨': 'è',
      '√®': 'î',
      '√•': 'å', // √• pour å
      '√¥': 'ä', // √¥ pour ä seulement
      '√¶': 'ö',
      '√º': 'ú',
      '√≠': 'í',
      '√≥': 'ó',
    };
    
    let correctedText = text;
    for (const [wrong, correct] of Object.entries(corrections)) {
      correctedText = correctedText.replace(new RegExp(wrong, 'g'), correct);
    }
    
    return correctedText;
  }

  // Séparer un nom complet en nom et prénom
  private parseFullName(fullName: string): { nom: string; prenom: string } {
    if (!fullName || !fullName.trim()) {
      return { nom: '', prenom: '' };
    }

    // Corriger l'encodage avant le traitement
    const cleaned = this.fixTextEncoding(fullName.trim());
    
    // Cas spéciaux avec séparateurs
    if (cleaned.includes(' - ')) {
      // "Nautivela - Julien" → prenom: "Julien", nom: "Nautivela"
      const parts = cleaned.split(' - ');
      return {
        prenom: parts[1]?.trim() || '',
        nom: parts[0]?.trim() || '',
      };
    }
    
    // Séparation standard par espaces
    const parts = cleaned.split(' ');
    
    if (parts.length === 1) {
      // Un seul mot → tout dans nom
      return { nom: parts[0], prenom: '' };
    }
    
    if (parts.length === 2) {
      // "Marie Patalagoïty" → prenom: "Marie", nom: "Patalagoïty"
      return {
        prenom: parts[0],
        nom: parts[1],
      };
    }
    
    // Plus de 2 mots → dernier mot = nom, le reste = prénom
    // "Jean-Charles MEILLAND" → prenom: "Jean-Charles", nom: "MEILLAND"
    const nom = parts[parts.length - 1];
    const prenom = parts.slice(0, -1).join(' ');
    
    return { nom, prenom };
  }

  // Vérifier si une synchronisation est en cours
  isSyncing(): boolean {
    return this.issyncing;
  }

  // Arrêter une synchronisation en cours (pour les cas d'urgence)
  stopSync(): void {
    console.log('🛑 Arrêt forcé de la synchronisation');
    this.issyncing = false;
  }

  // Statistiques rapides
  async getQuickStats(): Promise<{
    contactsCount: number;
    groupesCount: number;
    invitationsCount: number;
  }> {
    try {
      const token = await authService.getValidToken();
      if (!token) {
        return { contactsCount: 0, groupesCount: 0, invitationsCount: 0 };
      }

      const [contactsResponse, groupesResponse, invitationsResponse] = await Promise.allSettled([
        apiClient.get('/contacts?pagination[pageSize]=1', token),
        apiClient.get('/groupes?pagination[pageSize]=1', token),
        apiClient.get('/invitations?pagination[pageSize]=1', token)
      ]);

      const contactsCount = contactsResponse.status === 'fulfilled' && contactsResponse.value.ok 
        ? (await contactsResponse.value.json()).meta?.pagination?.total || 0 
        : 0;
        
      const groupesCount = groupesResponse.status === 'fulfilled' && groupesResponse.value.ok 
        ? (await groupesResponse.value.json()).meta?.pagination?.total || 0 
        : 0;
        
      const invitationsCount = invitationsResponse.status === 'fulfilled' && invitationsResponse.value.ok 
        ? (await invitationsResponse.value.json()).meta?.pagination?.total || 0 
        : 0;

      return { contactsCount, groupesCount, invitationsCount };
    } catch (error) {
      console.error('❌ Erreur récupération statistiques:', error);
      return { contactsCount: 0, groupesCount: 0, invitationsCount: 0 };
    }
  }
}

// Exporter une instance singleton
export const syncService = new SyncService();