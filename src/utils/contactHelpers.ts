// src/utils/contactHelpers.ts - Fonctions utilitaires pour les contacts

/**
 * Calcule un score intelligent pour suggérer les contacts les plus pertinents
 * @param contact - Le contact à scorer
 * @returns Score entre 0 et 100
 */
export function calculateSmartScore(contact: any): number {
  let score = 0;
  const nom = contact.nom.toLowerCase();
  
  // Favoriser les prénoms familiaux courants
  const prenomsFamille = ['marie', 'pierre', 'jean', 'sophie', 'paul', 'anne', 'julie', 'thomas', 'nicolas', 'isabelle'];
  if (prenomsFamille.some(p => nom.includes(p))) score += 20;
  
  // Favoriser les contacts avec email (plus complets)
  if (contact.email) score += 15;
  
  // Favoriser les contacts avec photo
  if (contact.hasPhoto) score += 10;
  
  // Pénaliser les entreprises
  const motsEntreprise = ['sarl', 'sas', 'entreprise', 'garage', 'restaurant', 'hotel', 'cabinet', 'société', 'service'];
  if (motsEntreprise.some(m => nom.includes(m))) score -= 30;
  
  // Pénaliser les numéros de service
  if (contact.telephone && (contact.telephone.startsWith('08') || contact.telephone.startsWith('09'))) score -= 20;
  
  // Favoriser les noms courts (probablement des proches)
  if (nom.length < 15 && !nom.includes(' ')) score += 10;
  
  // Favoriser les contacts avec plusieurs numéros (famille proche)
  if (contact.phoneNumbers && contact.phoneNumbers.length > 1) score += 5;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Nettoie et formate un numéro de téléphone
 * @param phoneNumber - Le numéro à nettoyer
 * @returns Numéro formaté ou chaîne vide si invalide
 */
export function cleanPhoneNumber(phoneNumber: string): string {
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
 * Formate un numéro de téléphone pour l'affichage
 * @param phoneNumber - Le numéro à formater
 * @returns Numéro formaté pour l'affichage
 */
export function formatPhoneDisplay(phoneNumber: string): string {
  const cleaned = cleanPhoneNumber(phoneNumber);
  if (!cleaned) return phoneNumber;
  
  // Format français
  if (cleaned.startsWith('+33')) {
    const number = cleaned.substring(3);
    // Format: +33 6 12 34 56 78
    return `+33 ${number.replace(/(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`;
  }
  
  // Autres formats internationaux
  if (cleaned.startsWith('+')) {
    // Format générique: +XX XXX XXX XXXX
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4');
  }
  
  return cleaned;
}

/**
 * Formate un numéro de téléphone spécifiquement pour WhatsApp
 * @param phoneNumber - Le numéro à formater
 * @returns Numéro formaté pour WhatsApp avec code international
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Utiliser la fonction de nettoyage existante qui gère tous les cas
  const cleaned = cleanPhoneNumber(phoneNumber);
  
  console.log(`📱 WhatsApp - Formatage: "${phoneNumber}" → "${cleaned}"`);
  
  // WhatsApp nécessite un format international avec +
  if (!cleaned.startsWith('+')) {
    console.warn(`⚠️ WhatsApp - Numéro sans code pays: ${cleaned}, ajout de +33`);
    return '+33' + cleaned;
  }
  
  return cleaned;
}

/**
 * Groupe les contacts par première lettre
 * @param contacts - Liste des contacts
 * @returns Objet avec les contacts groupés par lettre
 */
export function groupContactsByLetter(contacts: any[]): { [key: string]: any[] } {
  const grouped: { [key: string]: any[] } = {};
  
  contacts.forEach(contact => {
    const firstLetter = contact.nom.charAt(0).toUpperCase();
    const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(contact);
  });
  
  // Trier les contacts dans chaque groupe
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => a.nom.localeCompare(b.nom));
  });
  
  return grouped;
}

/**
 * Détermine si un contact est probablement un proche
 * @param contact - Le contact à analyser
 * @returns true si probablement un proche
 */
export function isLikelyCloseContact(contact: any): boolean {
  const score = calculateSmartScore(contact);
  return score > 30;
}

/**
 * Extrait les initiales d'un nom
 * @param name - Le nom complet
 * @returns Les initiales (max 2 caractères)
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Détermine la couleur de l'avatar selon le statut
 * @param contact - Le contact
 * @returns Code couleur hexadécimal
 */
export function getAvatarColor(contact: any): string {
  if (contact.aSurBob) return '#4CAF50'; // Vert pour ceux qui ont Bob
  if (contact.estInvite) return '#FF9800'; // Orange pour les invités
  if (isLikelyCloseContact(contact)) return '#2196F3'; // Bleu pour les proches suggérés
  return '#9E9E9E'; // Gris pour les autres
}

/**
 * Trie les contacts intelligemment
 * @param contacts - Liste des contacts
 * @param sortBy - Critère de tri
 * @returns Liste triée
 */
export function sortContacts(contacts: any[], sortBy: 'smart' | 'name' | 'recent' | 'status'): any[] {
  const sorted = [...contacts];
  
  switch (sortBy) {
    case 'smart':
      // Tri par score intelligent (proches en premier)
      sorted.sort((a, b) => {
        const scoreA = calculateSmartScore(a);
        const scoreB = calculateSmartScore(b);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.nom.localeCompare(b.nom);
      });
      break;
      
    case 'name':
      // Tri alphabétique simple
      sorted.sort((a, b) => a.nom.localeCompare(b.nom));
      break;
      
    case 'recent':
      // Tri par date d'ajout (simulé par ordre inverse pour l'instant)
      sorted.sort((a, b) => {
        if (a.dateAjout && b.dateAjout) {
          return new Date(b.dateAjout).getTime() - new Date(a.dateAjout).getTime();
        }
        return b.nom.localeCompare(a.nom);
      });
      break;
      
    case 'status':
      // Tri par statut (Bob > Invité > Autres)
      sorted.sort((a, b) => {
        if (a.aSurBob && !b.aSurBob) return -1;
        if (!a.aSurBob && b.aSurBob) return 1;
        if (a.estInvite && !b.estInvite) return -1;
        if (!a.estInvite && b.estInvite) return 1;
        return a.nom.localeCompare(b.nom);
      });
      break;
  }
  
  return sorted;
}

/**
 * Filtre les contacts selon un terme de recherche
 * @param contacts - Liste des contacts
 * @param searchTerm - Terme de recherche
 * @returns Liste filtrée
 */
export function searchContacts(contacts: any[], searchTerm: string): any[] {
  if (!searchTerm.trim()) return contacts;
  
  const search = searchTerm.toLowerCase().trim();
  
  return contacts.filter(contact => {
    // Recherche dans le nom
    if (contact.nom.toLowerCase().includes(search)) return true;
    
    // Recherche dans le téléphone
    if (contact.telephone && contact.telephone.includes(search)) return true;
    
    // Recherche dans l'email
    if (contact.email && contact.email.toLowerCase().includes(search)) return true;
    
    // Recherche dans la ville
    if (contact.ville && contact.ville.toLowerCase().includes(search)) return true;
    
    return false;
  });
}

/**
 * Compte les contacts par catégorie
 * @param contacts - Liste des contacts
 * @returns Objet avec les statistiques
 */
export function getContactsStats(contacts: any[]): {
  total: number;
  avecBob: number;
  sansBob: number;
  invites: number;
  proches: number;
  entreprises: number;
} {
  const stats = {
    total: contacts.length,
    avecBob: 0,
    sansBob: 0,
    invites: 0,
    proches: 0,
    entreprises: 0,
  };
  
  contacts.forEach(contact => {
    if (contact.aSurBob) {
      stats.avecBob++;
    } else {
      stats.sansBob++;
    }
    
    if (contact.estInvite) {
      stats.invites++;
    }
    
    if (isLikelyCloseContact(contact)) {
      stats.proches++;
    }
    
    const nom = contact.nom.toLowerCase();
    const motsEntreprise = ['sarl', 'sas', 'entreprise', 'garage', 'restaurant', 'hotel', 'cabinet'];
    if (motsEntreprise.some(m => nom.includes(m))) {
      stats.entreprises++;
    }
  });
  
  return stats;
}