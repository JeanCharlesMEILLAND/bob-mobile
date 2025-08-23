// src/hooks/useContactsRealTime.ts - Hook avec synchronisation temps réel
import { useState, useCallback, useEffect } from 'react';
import { useContactsBob } from './useContactsBob';
import { realTimeSync, useRealTimeSync } from '../utils/realTimeSync';
import { logger, logContacts } from '../utils/logger';
import { useNotifications } from '../components/common/SmartNotifications';
import { contactsService } from '../services/contacts.service';
import { authService } from '../services/auth.service';

export const useContactsRealTime = () => {
  const originalHook = useContactsBob();
  const rtSync = useRealTimeSync();
  const notifications = useNotifications();
  
  // État local optimiste (ce que voit l'utilisateur immédiatement)
  const [optimisticRepertoire, setOptimisticRepertoire] = useState(originalHook.repertoire);
  const [optimisticInvitations, setOptimisticInvitations] = useState(originalHook.invitations);

  // Sync l'état optimiste avec l'état réel + détection Bob au démarrage
  useEffect(() => {
    setOptimisticRepertoire(originalHook.repertoire);
    
    // Détection automatique des utilisateurs Bob au chargement des contacts
    if (originalHook.repertoire.length > 0) {
      console.log('🔎 Démarrage détection utilisateurs Bob avec délai anti-rate-limiting...');
      // Délai pour éviter le rate limiting au démarrage
      setTimeout(async () => {
        try {
          const token = await authService.getValidToken();
          if (token && optimisticRepertoire.length > 0) {
            // Vérifier si déjà fait
            const bobUsersCount = optimisticRepertoire.filter(c => c.estUtilisateurBob === true || c.aSurBob === true).length;
            if (bobUsersCount === 0) {
              console.log('🔍 Lancement détection utilisateurs Bob au démarrage...');
              const result = await contactsService.detectRealBobUsers(token);
              if (result.contactsWithBob.length > 0) {
                setOptimisticRepertoire(prev => {
                  const updatedContacts = prev.map(contact => {
                    const enrichedContact = result.contactsWithBob.find(c => c.id === contact.id);
                    return enrichedContact || contact;
                  });
                  console.log(`✅ Détection démarrage: ${result.contactsWithBob.length} utilisateurs Bob enrichis`);
                  return updatedContacts;
                });
              }
            } else {
              console.log('💡 Utilisateurs Bob déjà présents dans le cache');
            }
          }
        } catch (error) {
          console.warn('⚠️ Erreur détection démarrage (pas grave):', error);
        }
      }, 3000); // 3 secondes de délai
    }
  }, [originalHook.repertoire]);

  useEffect(() => {
    setOptimisticInvitations(originalHook.invitations);
  }, [originalHook.invitations]);

  // 🔧 SYNCHRONISATION COMPLÈTEMENT DÉSACTIVÉE - Pas de boucle infinie
  // useEffect(() => {
  //   // Cette synchronisation créait une boucle infinie, désactivée
  // }, [originalHook.repertoire, optimisticRepertoire]);

  // **AJOUTER CONTACT AU RÉPERTOIRE** - TEMPS RÉEL
  const addContactToRepertoire = useCallback(async (contact: any) => {
    logContacts('Ajout contact temps réel', { nom: contact.nom });

    try {
      await rtSync.addContact(
        contact,
        // 1. 🚀 UPDATE LOCAL IMMÉDIAT (utilisateur voit le changement instantané)
        () => {
          const newContact = {
            id: `temp_${Date.now()}`,
            nom: contact.nom,
            telephone: contact.telephone,
            email: contact.email,
            aSurBob: false,
            estInvite: false,
            dateInvitation: undefined,
            nombreInvitations: 0,
            lastUpdated: new Date().toISOString(),
            source: 'manual' as const
          };
          
          setOptimisticRepertoire(prev => [...prev, newContact]);
          
          // ✅ Notification immédiate (que tu aimes !)
          notifications.success(
            'Contact ajouté', 
            `${contact.nom} est dans votre répertoire`,
            { category: 'contacts_add' }
          );
        },
        // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN
        async () => {
          const token = await authService.getValidToken();
          if (!token) throw new Error('Token manquant');

          const strapiContact = await contactsService.createContact({
            nom: contact.nom,
            prenom: contact.prenom || '',
            email: contact.email || '',
            telephone: contact.telephone,
            groupeIds: []
          }, token);

          logContacts('Contact créé dans Strapi', { id: strapiContact.id });
          
          // Mettre à jour l'ID temporaire avec l'ID Strapi
          setOptimisticRepertoire(prev => prev.map(c => 
            c.nom === contact.nom && c.telephone === contact.telephone 
              ? { ...c, id: strapiContact.id.toString() }
              : c
          ));
        }
      );

    } catch (error) {
      logger.error('contacts', 'Erreur ajout contact temps réel', error);
      
      // Rollback local en cas d'erreur
      setOptimisticRepertoire(prev => 
        prev.filter(c => !(c.nom === contact.nom && c.telephone === contact.telephone))
      );
      
      notifications.error(
        'Erreur d\'ajout',
        `Impossible d'ajouter ${contact.nom}`,
        {
          action: {
            label: 'Réessayer',
            onPress: () => addContactToRepertoire(contact)
          }
        }
      );
    }
  }, [rtSync, notifications]);

  // **SUPPRIMER CONTACT** - TEMPS RÉEL
  const removeContactFromRepertoire = useCallback(async (contactId: string) => {
    const contactToRemove = optimisticRepertoire.find(c => c.id === contactId);
    if (!contactToRemove) return;

    logContacts('Suppression contact temps réel', { id: contactId });

    try {
      await rtSync.removeContact(
        contactId,
        // 1. 🚀 UPDATE LOCAL IMMÉDIAT
        () => {
          setOptimisticRepertoire(prev => prev.filter(c => c.id !== contactId));
          
          notifications.info(
            'Contact supprimé',
            `${contactToRemove.nom} retiré du répertoire`,
            { category: 'contacts_remove' }
          );
        },
        // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN
        async () => {
          const token = await authService.getValidToken();
          if (!token) throw new Error('Token manquant');

          await contactsService.deleteContact(parseInt(contactId), token);
          logContacts('Contact supprimé dans Strapi', { id: contactId });
        }
      );

    } catch (error) {
      logger.error('contacts', 'Erreur suppression contact', error);
      
      // Rollback local
      setOptimisticRepertoire(prev => [...prev, contactToRemove]);
      
      notifications.error(
        'Erreur de suppression',
        `Impossible de supprimer ${contactToRemove.nom}`,
        {
          action: {
            label: 'Réessayer', 
            onPress: () => removeContactFromRepertoire(contactId)
          }
        }
      );
    }
  }, [rtSync, notifications, optimisticRepertoire]);

  // **ENVOYER INVITATION** - TEMPS RÉEL
  const sendInvitationRealTime = useCallback(async (contactId: string, method: 'sms' | 'whatsapp' = 'sms') => {
    const contact = optimisticRepertoire.find(c => c.id === contactId);
    if (!contact) return;

    logContacts('Envoi invitation temps réel', { contactId, method });

    try {
      await rtSync.sendInvitation(
        { contactId, method, telephone: contact.telephone },
        // 1. 🚀 UPDATE LOCAL IMMÉDIAT
        () => {
          // Marquer comme invité dans le répertoire
          setOptimisticRepertoire(prev => prev.map(c => 
            c.id === contactId 
              ? { 
                  ...c, 
                  estInvite: true, 
                  dateInvitation: new Date().toISOString(),
                  nombreInvitations: (c.nombreInvitations || 0) + 1
                }
              : c
          ));

          // Ajouter à la liste des invitations
          const newInvitation = {
            id: Date.now(),
            telephone: contact.telephone,
            nom: contact.nom,
            type: method,
            statut: 'envoye' as const,
            dateEnvoi: new Date().toISOString(),
            nombreRelances: 0,
            codeParrainage: `BOB${Date.now().toString().slice(-4)}`
          };
          
          setOptimisticInvitations(prev => [...prev, newInvitation]);
          
          notifications.success(
            'Invitation envoyée',
            `${contact.nom} a reçu votre invitation Bob`,
            { category: 'invitations_send' }
          );
        },
        // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN
        async () => {
          // Ici tu aurais ton service d'invitation Strapi
          // await invitationsService.send(contactId, method);
          
          // Pour l'instant, simulons
          await new Promise(resolve => setTimeout(resolve, 1000));
          logContacts('Invitation envoyée dans Strapi', { contactId });
        }
      );

    } catch (error) {
      logger.error('contacts', 'Erreur envoi invitation', error);
      
      // Rollback local
      setOptimisticRepertoire(prev => prev.map(c => 
        c.id === contactId 
          ? { ...c, estInvite: false, dateInvitation: undefined }
          : c
      ));
      
      setOptimisticInvitations(prev => 
        prev.filter(i => i.telephone !== contact.telephone)
      );
      
      notifications.error(
        'Erreur d\'invitation',
        `Impossible d'inviter ${contact.nom}`,
        {
          action: {
            label: 'Réessayer',
            onPress: () => sendInvitationRealTime(contactId, method)
          }
        }
      );
    }
  }, [rtSync, notifications, optimisticRepertoire]);

  // **BULK ADD CONTACTS** - Optimisé pour ton cas d'usage
  const addMultipleContactsRealTime = useCallback(async (contacts: any[]) => {
    logContacts('Ajout multiple contacts temps réel', { count: contacts.length });

    // 1. 🚀 UPDATE LOCAL IMMÉDIAT - L'utilisateur voit tous les contacts
    const tempContacts = contacts.map((contact, index) => ({
      id: `temp_${Date.now()}_${index}`,
      nom: contact.nom || contact.name || 'Nom manquant',
      telephone: contact.telephone || contact.phoneNumber,
      email: contact.email,
      aSurBob: false,
      estInvite: false,
      dateInvitation: undefined,
      nombreInvitations: 0,
      lastUpdated: new Date().toISOString(),
      source: 'manual' as const
    }));
    
    console.log(`🔧 AVANT ajout optimiste: ${optimisticRepertoire.length} contacts`);
    setOptimisticRepertoire(prev => {
      const newRepertoire = [...prev, ...tempContacts];
      console.log(`🔧 APRÈS ajout optimiste: ${newRepertoire.length} contacts (ajouté ${tempContacts.length})`);
      return newRepertoire;
    });
    
    // ✅ Notification de succès multiple (que tu aimes !)
    notifications.success(
      'Contacts ajoutés',
      `${contacts.length} contacts ajoutés à votre répertoire`,
      { 
        category: 'contacts_bulk_add',
        action: {
          label: 'Voir',
          onPress: () => {} // Navigation vers contacts
        }
      }
    );

    // 2. 📤 SYNC STRAPI EN ARRIÈRE-PLAN (en batch pour performance)
    try {
      const token = await authService.getValidToken();
      if (!token) throw new Error('Token manquant');

      // 🔧 DEBUG: Loguer chaque contact avant création
      contacts.forEach((contact, index) => {
        console.log(`📋 Contact ${index + 1}/${contacts.length} à créer:`, {
          nom: contact.nom || contact.name || 'Nom manquant',
          prenom: contact.prenom || '',
          telephone: contact.telephone || contact.phoneNumber,
          email: contact.email || ''
        });
      });

      // Batch create dans Strapi
      const strapiContacts = await Promise.allSettled(
        contacts.map((contact, index) => {
          console.log(`🚀 Création Strapi ${index + 1}/${contacts.length}: ${contact.nom || contact.name}`);
          return contactsService.createContact({
            nom: contact.nom || contact.name || 'Nom manquant',
            prenom: contact.prenom || '',
            email: contact.email || '',
            telephone: contact.telephone || contact.phoneNumber,
            groupeIds: []
          }, token);
        })
      );

      // 🔧 ANALYSE DÉTAILLÉE DES RÉSULTATS
      const successfulContacts: any[] = [];
      const failedContacts: any[] = [];
      
      strapiContacts.forEach((result, index) => {
        const contact = contacts[index];
        if (result.status === 'fulfilled') {
          successfulContacts.push({
            strapiContact: result.value,
            originalContact: contact
          });
          console.log(`✅ Contact ${index + 1} créé:`, contact.nom || contact.name);
        } else {
          failedContacts.push({
            originalContact: contact,
            error: result.reason
          });
          console.error(`❌ Contact ${index + 1} ÉCHEC:`, {
            nom: contact.nom || contact.name,
            telephone: contact.telephone || contact.phoneNumber,
            erreur: result.reason?.message || result.reason
          });
        }
      });

      // Mettre à jour les IDs temporaires avec les IDs Strapi pour les succès
      setOptimisticRepertoire(prev => {
        const updatedRepertoire = prev.map(c => {
          const match = successfulContacts.find(sc => 
            (sc.originalContact.nom === c.nom || sc.originalContact.name === c.nom) && 
            (sc.originalContact.telephone === c.telephone || sc.originalContact.phoneNumber === c.telephone)
          );
          return match ? { ...c, id: match.strapiContact.id.toString() } : c;
        });
        console.log(`🔧 État optimiste après mise à jour IDs: ${updatedRepertoire.length} contacts`);
        return updatedRepertoire;
      });

      logContacts('Bulk create terminé', { 
        success: successfulContacts.length, 
        failed: failedContacts.length,
        total: contacts.length 
      });

      // 🔧 FORCER la synchronisation du hook original après création Strapi
      if (successfulContacts.length > 0) {
        console.log('🔄 FORCE sync hook original après création Strapi');
        
        // Attendre que Strapi ait propagé les changements
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
          // 🔧 BYPASS scannerRepertoire - utiliser directement l'API contacts
          const token = await authService.getValidToken();
          const allContacts = await contactsService.getMyContacts(token);
          console.log(`🔧 DIRECT API: ${allContacts.length} contacts récupérés depuis Strapi`);
          
          // Mettre à jour directement l'état optimiste avec les vraies données Strapi
          setOptimisticRepertoire(allContacts.map(contact => ({
            id: contact.id,
            nom: contact.nom,
            prenom: contact.prenom,
            telephone: contact.telephone,
            email: contact.email,
            aSurBob: contact.aSurBob || false,
            estInvite: contact.estInvite || false,
            dateInvitation: contact.dateAjout,
            nombreInvitations: 0,
            lastUpdated: contact.dateAjout || new Date().toISOString(),
            source: contact.source || 'strapi'
          })));
          
          console.log(`✅ État optimiste mis à jour avec ${allContacts.length} contacts depuis API directe`);
        } catch (error) {
          console.warn('⚠️ Erreur sync direct API:', error);
          
          // Fallback vers scannerRepertoire
          try {
            await originalHook.scannerRepertoire();
            console.log('✅ Hook original synchronisé (fallback)');
          } catch (fallbackError) {
            console.warn('⚠️ Erreur fallback scannerRepertoire:', fallbackError);
          }
        }
      }

      // 🔧 LOGUER LES ÉCHECS EN DÉTAIL
      if (failedContacts.length > 0) {
        console.error('🚨 ÉCHECS DE CRÉATION STRAPI:');
        failedContacts.forEach((fail, index) => {
          console.error(`❌ Échec ${index + 1}:`, {
            contact: fail.originalContact.nom || fail.originalContact.name,
            telephone: fail.originalContact.telephone || fail.originalContact.phoneNumber,
            erreur: fail.error?.message || fail.error
          });
        });
      }

      // 🔧 FORCER la mise à jour du hook original même si Strapi échoue
      // pour que le dashboard affiche les contacts locaux
      if (successfulContacts.length === 0) {
        console.log('⚠️ Aucun contact sync Strapi - forcer MAJ locale pour dashboard');
        // Ajouter les contacts au hook original avec IDs temporaires
        const tempContactsForOriginal = contacts.map(contact => ({
          id: `temp_${Date.now()}_${Math.random()}`,
          nom: contact.nom || contact.name || 'Nom manquant',
          telephone: contact.telephone || contact.phoneNumber,
          email: contact.email || '',
          aSurBob: false,
          estInvite: false,
          dateInvitation: undefined,
          nombreInvitations: 0,
          lastUpdated: new Date().toISOString(),
          source: 'manual_failed' as const
        }));
        
        // Forcer la mise à jour du répertoire original
        originalHook.setRepertoire?.(prev => [...prev, ...tempContactsForOriginal]);
      }

      // 🔧 Notifications finales désactivées
      // if (successfulContacts.length === contacts.length) {
      //   notifications.success(
      //     'Synchronisation terminée',
      //     'Tous vos contacts sont sauvegardés',
      //     { category: 'sync_complete' }
      //   );
      // } else {
      //   notifications.warning(
      //     'Synchronisation partielle',
      //     `${successfulContacts.length}/${contacts.length} contacts sauvegardés`,
      //     { category: 'sync_partial' }
      //   );
      // }

    } catch (error) {
      logger.error('contacts', 'Erreur bulk add', error);
      // 🔧 Notification d'erreur désactivée
      // notifications.error(
      //   'Erreur de synchronisation',
      //   'Certains contacts pourraient ne pas être sauvegardés',
      //   { persistent: true }
      // );
    }
  }, [notifications]);

  // 🔧 CACHE COURT pour éviter trop d'appels API simultanés
  let lastStatsCache: any = null;
  let lastStatsCacheTime = 0;
  const CACHE_DURATION = 2000; // 2 secondes

  // 🔧 SOLUTION SIMPLE: Récupérer directement depuis Strapi avec cache court
  const getRealTimeStats = useCallback(async () => {
    try {
      // 🔧 UTILISER LE CACHE si récent (éviter rate limiting)
      const now = Date.now();
      if (lastStatsCache && (now - lastStatsCacheTime) < CACHE_DURATION) {
        console.log('🔄 Utilisation cache stats (évite rate limiting)');
        return lastStatsCache;
      }

      console.log('🔄 NOUVEAU: Récupération directe depuis Strapi...');
      
      // 🔧 RÉCUPÉRATION DIRECTE depuis Strapi (plus fiable)
      const token = await authService.getValidToken();
      const allContacts = await contactsService.getMyContacts(token);
      
      console.log(`🔧 DIRECT STRAPI: ${allContacts.length} contacts récupérés`);
      
      // 🔧 CALCUL DIRECT des stats sans passer par le hook original
      const mesContacts = allContacts.length;
      
      // 🔧 CORRECTION: Utiliser la VRAIE logique de détection des utilisateurs Bob
      const contactsAvecBob = allContacts.filter(c => {
        // 1. Vérifier le vrai champ Strapi : estUtilisateurBob
        if (c.estUtilisateurBob === true) return true;
        
        // 2. Vérifier s'il a un profil utilisateur Bob lié
        if (c.utilisateurBobProfile && c.utilisateurBobProfile.id) return true;
        
        // 3. Fallback vers l'ancien champ pour compatibilité
        if (c.aSurBob === true) return true;
        
        return false;
      }).length;
      
      console.log('🔍 DEBUG - Contacts avec Bob détectés:', {
        total: mesContacts,
        avecBob: contactsAvecBob,
        premiers3Contacts: allContacts.slice(0, 3).map(c => ({
          nom: c.nom,
          estUtilisateurBob: c.estUtilisateurBob,
          utilisateurBobProfile: c.utilisateurBobProfile ? 'OUI' : 'NON',
          aSurBob: c.aSurBob // Fallback pour debug
        }))
      });
      
      const contactsInvites = allContacts.filter(c => c.estInvite === true).length;
      const contactsSansBob = mesContacts - contactsAvecBob - contactsInvites;
      const pourcentageBob = mesContacts > 0 ? Math.round((contactsAvecBob / mesContacts) * 100) : 0;
      
      // 🔧 CORRECTION: Calculer les contacts disponibles à ajouter depuis le répertoire téléphone
      let contactsDisponibles = 0;
      try {
        // Récupérer les contacts du téléphone depuis le hook original
        const contactsRepertoire = originalHook.contactsBruts || [];
        const contactsDejaAjoutes = allContacts.map(c => c.telephone);
        contactsDisponibles = contactsRepertoire.filter(c => 
          c.telephone && !contactsDejaAjoutes.includes(c.telephone)
        ).length;
        
        console.log('🔍 Contacts disponibles:', {
          repertoire: contactsRepertoire.length,
          dejaAjoutes: contactsDejaAjoutes.length,
          disponibles: contactsDisponibles
        });
      } catch (error) {
        console.warn('⚠️ Erreur calcul contacts disponibles:', error);
      }
      
      // 🔧 CRÉER des stats complètes basées sur Strapi
      const directStats = {
        mesContacts,
        contactsAvecBob,
        contactsSansBob: Math.max(0, contactsSansBob),
        contactsInvites,
        pourcentageBob,
        // Valeurs calculées correctement
        totalContactsTelephone: mesContacts,
        contactsAvecEmail: allContacts.filter(c => c.email).length,
        contactsComplets: allContacts.length,
        contactsDisponibles, // 🔧 MAINTENANT CALCULÉ CORRECTEMENT
        tauxCuration: mesContacts > 0 ? Math.round((allContacts.filter(c => c.nom && c.telephone).length / mesContacts) * 100) : 0,
        invitationsEnCours: contactsInvites,
        invitationsAcceptees: 0,
        contactsEnLigne: contactsAvecBob,
        nouveauxDepuisScan: 0,
        totalContactsBob: contactsAvecBob,
        totalInvitationsEnvoyees: contactsInvites,
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Stats DIRECTES depuis Strapi:', {
        mesContacts: directStats.mesContacts,
        contactsAvecBob: directStats.contactsAvecBob,
        contactsSansBob: directStats.contactsSansBob,
        contactsInvites: directStats.contactsInvites,
        pourcentageBob: directStats.pourcentageBob
      });
      
      // 🔧 MISE À JOUR DU CACHE
      lastStatsCache = directStats;
      lastStatsCacheTime = now;
      
      return directStats;
    } catch (error) {
      // Fallback vers les stats originales en cas d'erreur
      console.error('❌ Erreur getStats direct Strapi:', error);
      return originalHook.getStats();
    }
  }, []); // Pas de dépendances - toujours récupérer fresh depuis Strapi

  return {
    // États temps réel (optimistes)
    repertoire: optimisticRepertoire,
    invitations: optimisticInvitations,
    
    // États originaux pour fallback
    ...originalHook,
    
    // Méthodes temps réel
    addContact: addContactToRepertoire,
    removeContact: removeContactFromRepertoire,
    sendInvitation: sendInvitationRealTime,
    addMultipleContacts: addMultipleContactsRealTime,
    
    // Stats temps réel (utilise le cache pour éviter rate limiting)
    getStats: async () => {
      // 🔧 ANTI-RATE-LIMITING: Utiliser le cache au lieu d'appeler l'API
      console.log('📦 Calcul stats depuis le CACHE (pas d\'API)');
      
      // Calculer les stats depuis l'état local optimiste (qui contient les données du cache)
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
        const contactsRepertoire = originalHook.contactsBruts || [];
        const contactsDejaAjoutes = optimisticRepertoire.map(c => c.telephone);
        contactsDisponibles = contactsRepertoire.filter(c => 
          c.telephone && !contactsDejaAjoutes.includes(c.telephone)
        ).length;
      } catch (error) {
        console.warn('⚠️ Erreur calcul contacts disponibles:', error);
      }
      
      const statsFromCache = {
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
        mesContacts: statsFromCache.mesContacts,
        contactsAvecBob: statsFromCache.contactsAvecBob,
        contactsSansBob: statsFromCache.contactsSansBob,
        contactsDisponibles: statsFromCache.contactsDisponibles
      });
      
      return statsFromCache;
    },
    
    // Informations de sync
    syncState: rtSync.syncState,
    syncStats: rtSync.stats,
    
    // Force refresh si besoin
    forcePullFromStrapi: () => rtSync.forcePull(() => originalHook.importerContactsEtSync([])),
    
    // Détecter et synchroniser les vrais utilisateurs Bob (utilisation manuelle)
    detectBobUsers: async () => {
      try {
        console.log('🔍 Démarrage détection manuelle des utilisateurs Bob...');
        const token = await authService.getValidToken();
        if (!token) {
          console.error('❌ Pas de token pour détecter les utilisateurs Bob');
          return { success: false, error: 'Pas de token' };
        }
        
        const result = await contactsService.detectRealBobUsers(token);
        
        // Mettre à jour l'état optimiste avec les nouveaux contacts enrichis
        setOptimisticRepertoire(prev => {
          const updatedContacts = prev.map(contact => {
            const enrichedContact = result.contactsWithBob.find(c => c.id === contact.id);
            if (enrichedContact) {
              console.log(`🔄 Contact ${contact.nom} enrichi avec profil Bob`);
              return enrichedContact;
            }
            return contact;
          });
          
          console.log(`✅ ${result.contactsWithBob.length} utilisateurs Bob détectés et enrichis`);
          return updatedContacts;
        });
        
        return {
          success: true,
          bobUsersDetected: result.contactsWithBob.length,
          totalUsers: result.stats.totalUsers,
          contactsUpdated: result.stats.contactsUpdated
        };
        
      } catch (error) {
        console.error('❌ Erreur détection utilisateurs Bob:', error);
        return { success: false, error: (error as Error).message };
      }
    },
    
  };
};