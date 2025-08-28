// src/services/contacts/ContactsStats.ts - Service dédié aux calculs de statistiques contacts

import { Contact, ContactsStats } from '../../types/contacts.unified';

export class ContactsStatsCalculator {
  
  /**
   * Calculer toutes les statistiques des contacts
   */
  static calculateStats(contacts: Contact[]): ContactsStats {
    console.log(`📊 Calcul des statistiques pour ${contacts.length} contacts`);
    
    // Séparer les contacts par source
    const phoneContacts = contacts.filter(c => c.source === 'phone');
    const repertoireContacts = contacts.filter(c => c.source === 'repertoire');
    const bobContacts = contacts.filter(c => c.source === 'bob' || c.aSurBob === true);
    const invitedContacts = contacts.filter(c => c.source === 'invited');
    
    // Calculer les métriques de base
    const totalTelephone = phoneContacts.length;
    const totalContacts = contacts.length; // TOTAL RÉEL de tous les contacts
    // 🔧 CORRECTION TEMPORAIRE: Si on a des contacts phone avec strapiId, ils sont importés
    const contactsAvecStrapiId = contacts.filter(c => c.source === 'phone' && (c.strapiId || c.documentId)).length;
    const contactsRepertoireOfficiel = contacts.filter(c => c.source === 'repertoire' || c.source === 'bob' || c.source === 'invited').length;
    
    // Contacts "dans le répertoire" = officiel + phone avec strapiId
    const mesContacts = contactsRepertoireOfficiel + contactsAvecStrapiId;
    
    // Contacts vraiment disponibles = phone SANS strapiId
    const contactsDisponiblesReels = contacts.filter(c => c.source === 'phone' && !c.strapiId && !c.documentId).length;
    const contactsAvecBob = bobContacts.length;
    const contactsSansBob = mesContacts - contactsAvecBob; // CORRECTION: Total répertoire - contacts avec Bob
    
    // Les contacts disponibles = contacts phone qui ne sont pas dans le répertoire
    const contactsDisponibles = contactsDisponiblesReels;
    
    const invitationsEnCours = invitedContacts.filter(c => 
      !c.invitation || c.invitation.statut === 'envoye' || c.invitation.statut === 'en_attente'
    ).length;
    const invitationsAcceptees = invitedContacts.filter(c => 
      c.invitation && (c.invitation.statut === 'acceptee' || c.aSurBob === true)
    ).length;
    
    // Calculer les pourcentages - CORRECTION: utiliser totalContacts au lieu de totalTelephone
    const tauxCuration = totalContacts > 0 
      ? Math.round((mesContacts / totalContacts) * 100) 
      : 0;
    const pourcentageBob = mesContacts > 0 
      ? Math.round((contactsAvecBob / mesContacts) * 100) 
      : 0;
    
    // Calculer les métriques avancées
    const contactsAvecEmail = contacts.filter(c => c.hasEmail || (c.email && c.email.trim().length > 0)).length;
    const contactsComplets = contacts.filter(c => 
      c.isComplete || (c.nom && c.prenom && c.telephone && c.email)
    ).length;
    
    // Statistiques par source
    const statsParSource = {
      phone: phoneContacts.length,
      repertoire: repertoireContacts.length,
      bob: bobContacts.length,
      invited: invitedContacts.length
    };
    
    // Répartition géographique (basée sur les préfixes téléphoniques)
    const repartitionGeo = this.calculateGeographicDistribution(contacts);
    
    // Statistiques temporelles
    const statsTemporelles = this.calculateTemporalStats(contacts);
    
    const stats: ContactsStats = {
      // Métriques principales
      totalTelephone: totalContacts, // CORRECTION: retourner le total réel
      mesContacts,
      contactsAvecBob,
      contactsSansBob,
      contactsDisponibles,
      invitationsEnCours,
      invitationsAcceptees,
      
      // Métriques de qualité
      contactsAvecEmail,
      contactsComplets,
      tauxCuration,
      pourcentageBob,
      
      // Répartitions
      statsParSource,
      repartitionGeo,
      statsTemporelles,
      
      // Métadonnées
      lastCalculated: new Date().toISOString(),
      version: '2.0'
    };
    
    // Logs réduits - seulement si changements significatifs
    const bobWithFlag = contacts.filter(c => c.aSurBob === true);
    if (bobWithFlag.length > 0 || process.env.NODE_ENV === 'development') {
      console.log('📊 Stats:', { total: totalContacts, bob: bobContacts.length, repertoire: mesContacts, bob_flag: bobWithFlag.length });
    }
    
    // 🔍 DEBUG: Afficher les détails du calcul
    console.log('📊 CALCUL DÉTAILLÉ:', {
      contactsRepertoireOfficiel,
      contactsAvecStrapiId,
      mesContactsCalcule: mesContacts,
      contactsDisponiblesReels,
      totalContacts
    });
    
    // Log final seulement si changements importants
    if (bobWithFlag.length > 0 || contactsAvecBob > 0 || mesContacts > 0) {
      console.log('📊 Stats finales:', { repertoire: mesContacts, bob: contactsAvecBob, sansBob: contactsSansBob, invitations: invitationsEnCours });
    }
    
    return stats;
  }
  
  /**
   * Calculer la répartition géographique basée sur les préfixes téléphoniques
   */
  private static calculateGeographicDistribution(contacts: Contact[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const contact of contacts) {
      if (!contact.telephone) continue;
      
      const pays = this.detectCountryFromPhone(contact.telephone);
      distribution[pays] = (distribution[pays] || 0) + 1;
    }
    
    return distribution;
  }
  
  /**
   * Détecter le pays à partir d'un numéro de téléphone
   */
  private static detectCountryFromPhone(telephone: string): string {
    const normalized = telephone.replace(/[^\d+]/g, '');
    
    if (normalized.startsWith('+33') || normalized.startsWith('33')) {
      return 'France';
    } else if (normalized.startsWith('+1')) {
      return 'USA/Canada';
    } else if (normalized.startsWith('+44')) {
      return 'Royaume-Uni';
    } else if (normalized.startsWith('+49')) {
      return 'Allemagne';
    } else if (normalized.startsWith('+39')) {
      return 'Italie';
    } else if (normalized.startsWith('+34')) {
      return 'Espagne';
    } else if (normalized.startsWith('+32')) {
      return 'Belgique';
    } else if (normalized.startsWith('+41')) {
      return 'Suisse';
    } else if (normalized.startsWith('+212')) {
      return 'Maroc';
    } else if (normalized.startsWith('+213')) {
      return 'Algérie';
    } else if (normalized.startsWith('+216')) {
      return 'Tunisie';
    } else if (normalized.startsWith('+225')) {
      return 'Côte d\'Ivoire';
    } else if (normalized.startsWith('+221')) {
      return 'Sénégal';
    } else {
      return 'Autre';
    }
  }
  
  /**
   * Calculer les statistiques temporelles
   */
  private static calculateTemporalStats(contacts: Contact[]): {
    ajoutsAujourdhui: number;
    ajoutsCetteSemaine: number;
    ajoutsCeMois: number;
    dernierAjout: string | null;
  } {
    const maintenant = new Date();
    const aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    const debutSemaine = new Date(aujourdhui);
    debutSemaine.setDate(aujourdhui.getDate() - aujourdhui.getDay());
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    
    let ajoutsAujourdhui = 0;
    let ajoutsCetteSemaine = 0;
    let ajoutsCeMois = 0;
    let dernierAjout: string | null = null;
    let dernierAjoutDate: Date | null = null;
    
    for (const contact of contacts) {
      const dateAjout = contact.dateAjout || contact.dateImport;
      if (!dateAjout) continue;
      
      const date = new Date(dateAjout);
      
      // Compter les ajouts
      if (date >= aujourdhui) {
        ajoutsAujourdhui++;
      }
      if (date >= debutSemaine) {
        ajoutsCetteSemaine++;
      }
      if (date >= debutMois) {
        ajoutsCeMois++;
      }
      
      // Trouver le dernier ajout
      if (!dernierAjoutDate || date > dernierAjoutDate) {
        dernierAjoutDate = date;
        dernierAjout = dateAjout;
      }
    }
    
    return {
      ajoutsAujourdhui,
      ajoutsCetteSemaine,
      ajoutsCeMois,
      dernierAjout
    };
  }
  
  /**
   * Calculer des statistiques spécifiques aux invitations
   */
  static calculateInvitationStats(contacts: Contact[]): {
    totalInvitations: number;
    invitationsEnvoyees: number;
    invitationsAcceptees: number;
    invitationsRefusees: number;
    invitationsEnAttente: number;
    tauxAcceptation: number;
    dernièreInvitation: string | null;
  } {
    const invitedContacts = contacts.filter(c => c.source === 'invited' || c.invitation);
    
    const invitationsEnvoyees = invitedContacts.length;
    const invitationsAcceptees = invitedContacts.filter(c => 
      c.invitation && (c.invitation.statut === 'acceptee' || c.aSurBob === true)
    ).length;
    const invitationsRefusees = invitedContacts.filter(c => 
      c.invitation && c.invitation.statut === 'refusee'
    ).length;
    const invitationsEnAttente = invitedContacts.filter(c => 
      c.invitation && (c.invitation.statut === 'envoye' || c.invitation.statut === 'en_attente')
    ).length;
    
    const tauxAcceptation = invitationsEnvoyees > 0 
      ? Math.round((invitationsAcceptees / invitationsEnvoyees) * 100) 
      : 0;
    
    // Trouver la dernière invitation
    let dernièreInvitation: string | null = null;
    let dernièreDate: Date | null = null;
    
    for (const contact of invitedContacts) {
      if (contact.invitation && contact.invitation.dateEnvoi) {
        const date = new Date(contact.invitation.dateEnvoi);
        if (!dernièreDate || date > dernièreDate) {
          dernièreDate = date;
          dernièreInvitation = contact.invitation.dateEnvoi;
        }
      }
    }
    
    return {
      totalInvitations: invitedContacts.length,
      invitationsEnvoyees,
      invitationsAcceptees,
      invitationsRefusees,
      invitationsEnAttente,
      tauxAcceptation,
      dernièreInvitation
    };
  }
  
  /**
   * Calculer des métriques de qualité des contacts
   */
  static calculateQualityMetrics(contacts: Contact[]): {
    scoreQualiteMoyen: number;
    contactsTresComplets: number;
    contactsMinimaux: number;
    contactsAvecPhoto: number;
    doublonsPotentiels: number;
  } {
    let scoreTotal = 0;
    let contactsTresComplets = 0;
    let contactsMinimaux = 0;
    let contactsAvecPhoto = 0;
    const numerosVus = new Map<string, Contact[]>();
    
    // Analyser chaque contact
    for (const contact of contacts) {
      // Calculer le score de qualité (sur 100)
      let score = 0;
      
      // Nom et prénom (30 points)
      if (contact.nom && contact.nom.trim()) score += 15;
      if (contact.prenom && contact.prenom.trim()) score += 15;
      
      // Téléphone (obligatoire - 25 points)
      if (contact.telephone && contact.telephone.length > 8) score += 25;
      
      // Email (20 points)
      if (contact.email && contact.email.includes('@')) score += 20;
      
      // Photo/Avatar (10 points)
      if (contact.avatar || (contact.rawData && contact.rawData.imageAvailable)) {
        score += 10;
        contactsAvecPhoto++;
      }
      
      // Informations Bob (15 points bonus)
      if (contact.aSurBob) score += 10;
      if (contact.username) score += 5;
      
      scoreTotal += score;
      
      // Catégoriser le contact
      if (score >= 80) {
        contactsTresComplets++;
      } else if (score <= 40) {
        contactsMinimaux++;
      }
      
      // Détecter les doublons potentiels
      if (contact.telephone) {
        const normalizedPhone = contact.telephone.replace(/[^\d]/g, '');
        if (!numerosVus.has(normalizedPhone)) {
          numerosVus.set(normalizedPhone, []);
        }
        numerosVus.get(normalizedPhone)!.push(contact);
      }
    }
    
    // Compter les doublons
    let doublonsPotentiels = 0;
    for (const [phone, contactsWithSamePhone] of numerosVus) {
      if (contactsWithSamePhone.length > 1) {
        doublonsPotentiels += contactsWithSamePhone.length - 1;
      }
    }
    
    const scoreQualiteMoyen = contacts.length > 0 
      ? Math.round(scoreTotal / contacts.length) 
      : 0;
    
    return {
      scoreQualiteMoyen,
      contactsTresComplets,
      contactsMinimaux,
      contactsAvecPhoto,
      doublonsPotentiels
    };
  }
  
  /**
   * Générer un rapport complet des statistiques
   */
  static generateStatsReport(contacts: Contact[]): {
    stats: ContactsStats;
    qualityMetrics: ReturnType<typeof ContactsStatsCalculator.calculateQualityMetrics>;
    invitationStats: ReturnType<typeof ContactsStatsCalculator.calculateInvitationStats>;
    summary: string;
  } {
    const stats = this.calculateStats(contacts);
    const qualityMetrics = this.calculateQualityMetrics(contacts);
    const invitationStats = this.calculateInvitationStats(contacts);
    
    const summary = this.generateSummaryText(stats, qualityMetrics, invitationStats);
    
    return {
      stats,
      qualityMetrics,
      invitationStats,
      summary
    };
  }
  
  /**
   * Générer un résumé textuel des statistiques
   */
  private static generateSummaryText(
    stats: ContactsStats, 
    quality: ReturnType<typeof ContactsStatsCalculator.calculateQualityMetrics>,
    invitations: ReturnType<typeof ContactsStatsCalculator.calculateInvitationStats>
  ): string {
    const lignes = [];
    
    lignes.push(`📱 ${stats.totalTelephone} contacts dans votre téléphone`);
    lignes.push(`👥 ${stats.mesContacts} contacts dans votre réseau Bob (${stats.tauxCuration}%)`);
    lignes.push(`✅ ${stats.contactsAvecBob} contacts ont Bob (${stats.pourcentageBob}%)`);
    
    if (stats.contactsDisponibles > 0) {
      lignes.push(`📥 ${stats.contactsDisponibles} contacts disponibles à ajouter`);
    }
    
    if (invitations.totalInvitations > 0) {
      lignes.push(`📤 ${invitations.invitationsEnvoyees} invitations envoyées`);
      lignes.push(`🎯 ${invitations.tauxAcceptation}% de taux d'acceptation`);
    }
    
    lignes.push(`⭐ Score qualité moyen: ${quality.scoreQualiteMoyen}/100`);
    
    if (quality.doublonsPotentiels > 0) {
      lignes.push(`⚠️ ${quality.doublonsPotentiels} doublons potentiels détectés`);
    }
    
    return lignes.join('\n');
  }
}