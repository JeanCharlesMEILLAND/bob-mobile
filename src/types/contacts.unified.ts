// src/types/contacts.unified.ts - Types unifiés pour le système de contacts

export interface BaseContact {
  id: string;                    // UUID unifié pour tous les contacts
  telephone: string;             // Clé primaire métier (normalisé +33...)
  nom: string;                   // Nom d'affichage
  prenom?: string;              // Prénom optionnel
  email?: string;               // Email optionnel
  avatar?: string;              // URL de l'avatar
  dateAjout: string;            // ISO date de création
  strapiId?: string;            // ID Strapi si synchronisé
  internalId?: number;          // ID interne Strapi
}

// Contact du téléphone (source: répertoire local)
export interface PhoneContact extends BaseContact {
  source: 'phone';
  rawData?: any;                // Données brutes d'expo-contacts
  hasEmail: boolean;            // Indicateur présence email
  isComplete: boolean;          // Indicateur données complètes
}

// Contact Bob (utilisateur inscrit sur Bob)
export interface BobContact extends BaseContact {
  source: 'bob';
  username: string;             // Nom d'utilisateur Bob
  bobizPoints: number;          // Points dans l'app
  niveau: 'Débutant' | 'Ami fidèle' | 'Super Bob' | 'Légende';
  estEnLigne: boolean;          // Statut en ligne
  derniereActivite: string;     // ISO date dernière activité
  statut: 'ami' | 'en_attente' | 'invite' | 'bloque';
  aSurBob: true;               // Toujours true pour BobContact
}

// Contact invité (invitation envoyée)
export interface InvitedContact extends BaseContact {
  source: 'invited';
  invitation: {
    id: string;
    documentId?: string;
    statut: 'envoye' | 'accepte' | 'refuse' | 'annule';
    dateEnvoi: string;
    dateReponse?: string;
    type: 'sms' | 'email' | 'notification';
    message?: string;
  };
  aSurBob: false;              // Toujours false pour InvitedContact
}

// Contact du répertoire (importé dans Bob mais pas encore détecté)
export interface RepertoireContact extends BaseContact {
  source: 'repertoire';
  aSurBob?: boolean;           // null = pas encore détecté, true/false = détecté
  dateImport: string;          // Date d'import dans Bob
}

// Union type principal
export type Contact = PhoneContact | BobContact | InvitedContact | RepertoireContact;

// Types pour les opérations
export interface ContactsStats {
  totalTelephone: number;       // Contacts du téléphone
  mesContacts: number;         // Contacts dans le répertoire Bob
  contactsAvecBob: number;     // Contacts qui ont Bob
  contactsSansBob: number;     // Contacts sans Bob
  contactsDisponibles: number; // Contacts disponibles à importer
  invitationsEnCours: number;  // Invitations en attente
  invitationsAcceptees: number; // Invitations acceptées
  tauxCuration: number;        // % de contacts importés
  pourcentageBob: number;      // % de contacts avec Bob
  timestamp: number;           // Timestamp du calcul
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  total: number;
}

export interface SyncResult {
  success: boolean;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
}

export interface ScanResult {
  contacts: PhoneContact[];
  total: number;
  hasPermission: boolean;
  errors: string[];
}

// Types pour les callbacks
export type ContactChangeType = 'add' | 'remove' | 'update' | 'load' | 'clear' | 'bulk_update' | 'scan_needed';
export type ContactsChangeCallback = (type: ContactChangeType, data?: Contact | Contact[] | string) => void;
export type StatsChangeCallback = (stats: ContactsStats) => void;
export type UnsubscribeFn = () => void;

// Types pour les opérations batch
export interface BatchOperation<T> {
  data: T[];
  size: number;
  onProgress?: (current: number, total: number) => void;
  onBatchComplete?: (batch: T[], index: number) => void;
}

// Types pour la configuration
export interface ContactsConfig {
  syncBatchSize: number;        // Taille des batches pour sync (défaut: 100)
  deleteBatchSize: number;      // Taille des batches pour suppression (défaut: 50)
  cacheVersion: string;         // Version du cache (défaut: "3.0.0")
  autoSyncEnabled: boolean;     // Sync automatique (défaut: true)
  rateLimitDelay: number;       // Délai entre requêtes (défaut: 200ms)
}

// Constantes
export const CONTACTS_CONFIG: ContactsConfig = {
  syncBatchSize: 100,
  deleteBatchSize: 50,
  cacheVersion: "3.0.0",
  autoSyncEnabled: true,
  rateLimitDelay: 200
};

export const CACHE_KEYS = {
  CONTACTS_BRUTS: '@bob_contacts_bruts_v3',
  REPERTOIRE: '@bob_repertoire_v3',
  BOB_USERS: '@bob_users_v3',
  INVITATIONS: '@bob_invitations_v3',
  METADATA: '@bob_contacts_metadata_v3',
  CONFIG: '@bob_contacts_config_v3'
} as const;