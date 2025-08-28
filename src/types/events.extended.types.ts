// src/types/events.extended.types.ts

// =================== ÉVÉNEMENT BOB COMPLET ===================
export interface BobEvent {
  // Informations de base
  id: string;
  documentId: string;
  titre: string;
  description: string;
  photo?: string; // URL de la photo d'événement
  
  // Dates et lieu
  dateDebut: string;
  dateFin?: string;
  lieu: {
    adresse: string;
    latitude?: number;
    longitude?: number;
    details?: string; // Infos complémentaires sur le lieu
  };
  
  // Gestion participants
  maxParticipants?: number;
  organisateur: {
    id: number;
    nom: string;
    avatar?: string;
  };
  
  // Besoins de l'événement
  besoins: BesoinEvenement[];
  
  // Statut et métadonnées
  statut: 'planifie' | 'en_cours' | 'termine' | 'annule';
  bobizRecompense: number;
  dateCreation: string;
  metadata?: {
    ciblage: CiblageEvenement;
    bobsIndividuelsCreés: number[];
    chatGroupeId?: string;
    invitationsEnvoyees?: boolean;
  };
}

// =================== BESOINS D'ÉVÉNEMENT ===================
export interface BesoinEvenement {
  id: string;
  type: 'emprunt' | 'service';
  categorie: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
  
  // Informations de base
  titre: string;
  description: string;
  
  // Gestion des quantités flexibles
  quantite?: {
    demandee: number;
    flexible: boolean; // Si on peut accepter moins/plus
    min?: number; // Minimum acceptable si flexible
    max?: number; // Maximum acceptable si flexible
  };
  
  // Pour les services collectifs
  maxPersonnes?: number;
  
  // Dates spécifiques au besoin
  dateRemise?: string; // Date limite de remise/exécution
  timing?: 'avant' | 'pendant' | 'apres'; // Timing par rapport à l'événement
  
  // Positionnement de l'organisateur
  organisateurPositionne: boolean;
  
  // Assignations et réponses
  assignations: AssignationBesoin[];
  statut: 'ouvert' | 'partiellement_comble' | 'complet' | 'ferme';
}

// =================== ASSIGNATIONS SUR BESOINS ===================
export interface AssignationBesoin {
  id: string;
  participantId: number;
  participantNom: string;
  quantiteProposee: number;
  bobIndividuelId?: number; // Si un BOB individuel a été créé
  dateAssignation: string;
  statut: 'propose' | 'accepte' | 'en_cours' | 'termine' | 'annule';
  commentaire?: string;
}

// =================== CIBLAGE ÉVÉNEMENT ===================
export interface CiblageEvenement {
  type: 'all' | 'groups' | 'contacts' | 'mixte';
  groupes?: string[];
  contacts?: string[];
  // Nouveaux champs pour gestion mixte
  includeUtilisateursBob: boolean;
  includeContactsSansBob: boolean;
  filtresAvances?: {
    niveauxBobiz?: string[]; // Pour utilisateurs Bob
    groupesSpecifiques?: string[];
    exclusions?: string[]; // Téléphones à exclure
  };
}

// =================== INVITATIONS D'ÉVÉNEMENTS ÉTENDUES ===================
export interface EventInvitationExtended {
  id: string;
  evenement: {
    id: number;
    titre: string;
    dateDebut: string;
    adresse?: string;
    photo?: string;
  };
  destinataire: {
    id?: number; // Si c'est un utilisateur Bob existant
    nom: string;
    prenom?: string;
    telephone: string;
    email?: string;
    avatar?: string;
    estUtilisateurBob: boolean; // Clé principale
    groupeOrigine?: string;
  };
  statut: InvitationStatus;
  type: InvitationType;
  dateEnvoi: string;
  dateVue?: string;
  dateReponse?: string;
  messagePersonnalise?: string;
  metadata?: {
    groupeOrigine?: string;
    typeInvitation: 'directe' | 'groupe' | 'publique';
    canalPreferentiel: 'sms' | 'whatsapp' | 'email' | 'push';
    languePreferee?: 'fr' | 'en' | 'pl';
  };
}

export type InvitationStatus = 
  | 'envoye' 
  | 'vue' 
  | 'accepte' 
  | 'refuse' 
  | 'expire'
  | 'bob_telecharge'; // Nouveau statut pour contacts sans Bob

export type InvitationType = 
  | 'push'      // Pour utilisateurs Bob existants
  | 'sms'       // Pour contacts sans Bob
  | 'whatsapp'  // Pour contacts sans Bob (si disponible)
  | 'email'     // Pour contacts sans Bob
  | 'mixte';    // Combinaison selon profil

// =================== INVITATIONS POST-CRÉATION ===================
export interface PostCreationInvitation {
  eventId: number;
  invitationFlow: 'immediate' | 'retarde' | 'manuel';
  ciblage: {
    type: 'all' | 'groups' | 'contacts' | 'mixte';
    groupes?: string[];
    contacts?: string[];
    // Nouveaux champs pour gestion mixte
    includeUtilisateursBob: boolean;
    includeContactsSansBob: boolean;
    filtresAvances?: {
      niveauxBobiz?: string[]; // Pour utilisateurs Bob
      groupesSpecifiques?: string[];
      exclusions?: string[]; // Téléphones à exclure
    };
  };
  parametres: {
    envoyerImmediatement: boolean;
    rappelsActives: boolean;
    messagePersonnalise?: string;
    canuxPreferentiels: {
      utilisateursBob: 'push' | 'push+sms';
      contactsSansBob: 'sms' | 'whatsapp' | 'email' | 'sms+email';
    };
  };
}

// =================== CIBLE D'INVITATION INTELLIGENTE ===================
export interface SmartInvitationTarget {
  id: string;
  nom: string;
  prenom?: string;
  telephone: string;
  email?: string;
  avatar?: string;
  
  // Statut Bob
  estUtilisateurBob: boolean;
  profilBob?: {
    id: number;
    username: string;
    niveau: string;
    bobizPoints: number;
    derniereActivite: string;
  };
  
  // Informations d'invitation
  canalOptimal: InvitationType;
  groupeOrigine?: string;
  historiqueInvitations?: {
    nombreInvitations: number;
    tauxAcceptation: number;
    derniereInvitation?: string;
  };
  
  // Préférences détectées
  preferences?: {
    langue: 'fr' | 'en' | 'pl';
    horairePreferentiel?: 'matin' | 'apres-midi' | 'soir';
    frequenceInvitations: 'haute' | 'normale' | 'faible';
  };
}

// =================== ÉTAT DES CONTACTS POUR INVITATION ===================
export interface ContactInvitationState {
  target: SmartInvitationTarget;
  selected: boolean;
  invitationSent: boolean;
  status?: InvitationStatus;
  canal: InvitationType;
  customMessage?: string;
}

// =================== SUIVI D'INVITATIONS ===================
export interface InvitationTrackingData {
  total: number;
  utilisateursBob: {
    envoye: number;
    vue: number;
    accepte: number;
  };
  contactsSansBob: {
    envoye: number;
    bobTelecharge: number; // Nouveau statut
    inscrit: number;
    accepteApresInscription: number;
  };
  canaux: Record<InvitationType, number>;
}

// =================== RÉSULTAT D'INVITATION EN MASSE ===================
export interface BulkInvitationResult {
  success: number;
  failed: number;
  invitations: EventInvitationExtended[];
  errors: Array<{
    contact: string;
    error: string;
  }>;
  tracking: InvitationTrackingData;
}

// =================== PROPS POUR ÉCRANS ===================
export interface InviteContactsScreenProps {
  eventId: number;
  eventTitle: string;
  eventPhoto?: string;
  onComplete: () => void;
}

export interface EventDetailScreenProps {
  eventId: number;
}

export interface InvitationStatusScreenProps {
  eventId: number;
}