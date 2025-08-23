// src/types/contacts.types.ts

// =================== GROUPE ===================
export interface Groupe {
  id: number;
  nom: string;
  description?: string;
  couleur: string;
  type: GroupeType;
  createur: {
    id: number;
    username: string;
  };
  membres?: Contact[];
  dateCreation: string;
  actif: boolean;
}

export type GroupeType = 'famille' | 'amis' | 'voisins' | 'bricoleurs' | 'custom';

export interface CreateGroupeData {
  nom: string;
  description?: string;
  couleur?: string;
  type: GroupeType;
}

export interface UpdateGroupeData {
  nom?: string;
  description?: string;
  couleur?: string;
  type?: GroupeType;
  actif?: boolean;
}

// =================== USER BOB ===================
export interface UserProfile {
  id: string | number; // Strapi 5 peut utiliser documentId (string) ou id (number)
  username: string;
  email: string;
  telephone: string;
  nom?: string;
  prenom?: string;
  avatar?: string;
  bobizPoints: number;
  niveau: 'Débutant' | 'Ami fidèle' | 'Super Bob' | 'Légende';
  estEnLigne: boolean;
  derniereActivite: string;
  dateInscription: string;
}

// =================== CONTACT ===================
export interface Contact {
  id: string; // Strapi 5 utilise documentId comme clé primaire
  internalId?: number; // ID numérique interne Strapi
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  avatar?: string;
  groupes: Groupe[];
  dateAjout: string;
  actif: boolean;
  source?: string;
  // 🔧 STRAPI 5: Nouveaux champs pour détection utilisateurs Bob
  estUtilisateurBob?: boolean; // Champ principal Strapi 5
  utilisateurBobProfile?: any; // Relation vers plugin::users-permissions.user
  estInvite?: boolean;
  // Champs de compatibilité
  userId?: number; // ID de l'utilisateur Bob correspondant
  aSurBob?: boolean; // Indique si ce contact utilise Bob (calculé)
  userProfile?: UserProfile; // Profil de l'utilisateur Bob (quand disponible)
}

export interface CreateContactData {
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  groupeIds: number[]; // IDs des groupes auxquels ajouter le contact
}

export interface UpdateContactData {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  groupeIds?: number[];
  actif?: boolean;
  source?: string;
  // 🔧 STRAPI 5: Champs pour la relation avec les utilisateurs Bob
  estUtilisateurBob?: boolean;
  utilisateurBobProfile?: string | number; // documentId ou id de l'utilisateur
  estInvite?: boolean;
  // Champs de compatibilité
  userId?: number;
  aSurBob?: boolean;
}

// =================== HELPERS ===================
export interface GroupeWithContactCount extends Groupe {
  contactCount: number;
}

export interface ContactsByGroupe {
  [groupeId: number]: {
    groupe: Groupe;
    contacts: Contact[];
  };
}

// =================== FORMS ===================
export interface GroupeFormData {
  nom: string;
  description: string;
  couleur: string;
  type: GroupeType;
}

export interface ContactFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  selectedGroupes: number[];
}

// =================== CONSTANTS ===================
export const GROUPE_TYPES: { value: GroupeType; label: string; icon: string; description: string }[] = [
  {
    value: 'famille',
    label: 'Famille',
    icon: '👨‍👩‍👧‍👦',
    description: 'Parents, frères, sœurs, enfants...'
  },
  {
    value: 'amis',
    label: 'Amis',
    icon: '👫',
    description: 'Amis proches, amis de longue date...'
  },
  {
    value: 'voisins',
    label: 'Voisins',
    icon: '🏘️',
    description: 'Voisins de quartier, syndic...'
  },
  {
    value: 'bricoleurs',
    label: 'Bricoleurs',
    icon: '🔧',
    description: 'Experts en bricolage, jardinage...'
  },
  {
    value: 'custom',
    label: 'Personnalisé',
    icon: '⭐',
    description: 'Créez votre propre catégorie'
  },
];

export const GROUPE_COLORS = [
  '#3B82F6', // Bleu
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#EF4444', // Rouge
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange foncé
  '#EC4899', // Pink
  '#6B7280', // Gris
] as const;