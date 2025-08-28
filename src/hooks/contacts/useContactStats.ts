// src/hooks/contacts/useContactStats.ts
import { useCallback } from 'react';
import { Contact } from '../../types/contacts.types';

export const useContactStats = () => {
  const calculateStats = useCallback((
    optimisticRepertoire: Contact[], 
    originalContactsBruts: any[] = []
  ) => {
    console.log('📦 Calcul stats depuis le CACHE (pas d\'API)');
    
    const mesContacts = optimisticRepertoire.length;
    const contactsAvecBob = optimisticRepertoire.filter(c => 
      c.estUtilisateurBob === true || c.aSurBob === true
    ).length;
    const contactsInvites = optimisticRepertoire.filter(c => c.estInvite === true).length;
    const contactsSansBob = mesContacts - contactsAvecBob - contactsInvites;
    const pourcentageBob = mesContacts > 0 ? Math.round((contactsAvecBob / mesContacts) * 100) : 0;
    
    // Calculer contacts disponibles depuis contactsBruts (cache)
    let contactsDisponibles = 0;
    try {
      const contactsRepertoire = originalContactsBruts || [];
      const contactsDejaAjoutes = optimisticRepertoire.map(c => c.telephone);
      contactsDisponibles = contactsRepertoire.filter(c => 
        c.telephone && !contactsDejaAjoutes.includes(c.telephone)
      ).length;
    } catch (error) {
      console.warn('⚠️ Erreur calcul contacts disponibles:', error);
    }
    
    const stats = {
      mesContacts,
      contactsAvecBob,
      contactsSansBob: Math.max(0, contactsSansBob),
      contactsInvites,
      pourcentageBob,
      totalContactsTelephone: mesContacts,
      contactsAvecEmail: optimisticRepertoire.filter(c => c.email).length,
      contactsComplets: mesContacts,
      contactsDisponibles,
      tauxCuration: mesContacts > 0 ? Math.round((optimisticRepertoire.filter(c => c.nom && c.telephone).length / mesContacts) * 100) : 0,
      invitationsEnCours: contactsInvites,
      invitationsAcceptees: 0,
      contactsEnLigne: contactsAvecBob,
      nouveauxDepuisScan: 0,
      totalContactsBob: contactsAvecBob,
      totalInvitationsEnvoyees: contactsInvites,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Stats depuis CACHE:', {
      mesContacts: stats.mesContacts,
      contactsAvecBob: stats.contactsAvecBob,
      contactsSansBob: stats.contactsSansBob,
      contactsDisponibles: stats.contactsDisponibles
    });
    
    return stats;
  }, []);

  return {
    calculateStats
  };
};