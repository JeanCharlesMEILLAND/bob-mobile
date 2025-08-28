// COPIÉ depuis Flutter - Modèle utilisateur complet
// Contient toute la logique de numéro de téléphone et validation
// À adapter en TypeScript pour React Native

// UserModel - Utilisateur principal
export interface User {
  id?: number;
  documentId?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  username?: string;
  confirmed?: boolean;
  provider?: string;
  profilImageUrl?: any;
  jwt?: string;
  description?: string;
  phone_number?: UserPhoneNumber;
  userParent?: string;
  fcmToken?: string;
  invitationStatus?: string; // for pending contact only
  invitationLink?: string; // for pending contact only
  bobies?: number;
  createdAt?: string;
}

// UserPhoneNumber - Gestion complète numéros téléphone
export interface UserPhoneNumber {
  id?: number;
  documentId?: string;
  countryISOCode?: string;
  countryCode?: string;
  number?: string;
  completeNumber?: string;
  e164?: string;
  international_readable_f1?: string;
  international_readable_f2?: string;
  international_00_compact?: string;
  international_00_readable?: string;
  national?: string;
  national_compact?: string;
  nsn_formatted?: string;
}

// Méthodes utiles à porter :
// - toSignUp() : Préparation données inscription
// - toSignIn() : Préparation données connexion
// - containsPhoneNumber() : Comparaison numéros téléphone
// - getLastnameInitial() : Affichage nom + initiale
// - fromSharedPreferences() : Chargement depuis stockage local

// IMPORTANT : La logique de parsing des numéros de téléphone
// est très sophistiquée dans Flutter - à conserver !