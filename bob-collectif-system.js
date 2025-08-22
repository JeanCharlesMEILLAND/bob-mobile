// BOB COLLECTIF - Événements avec besoins et positionnement des participants
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

let authCache = {};

async function authenticateUser(email) {
  if (authCache[email]) return authCache[email];
  
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: email,
      password: 'password123'
    });
    
    authCache[email] = {
      token: response.data.jwt,
      user: response.data.user
    };
    
    return authCache[email];
  } catch (error) {
    console.log(`❌ Auth failed: ${email}`);
    return null;
  }
}

async function createBobCollectif() {
  console.log('🎯 === CRÉATION BOB COLLECTIF - WEEK-END CRACOVIE ===');
  
  const organisateur = await authenticateUser('marie@bob.com');
  if (!organisateur) return null;
  
  // Créer l'événement BOB Collectif
  const bobCollectifData = {
    titre: '✈️ Week-end à Cracovie - BOB Collectif',
    description: 'Salut tout le monde ! Je pars en week-end à Cracovie du 15 au 17 septembre et j\'aurais besoin de votre aide pour quelques trucs ! Qui peut m\'aider ? 😊',
    dateDebut: new Date(Date.now() + 20*24*60*60*1000).toISOString(), // Dans 20 jours
    dateFin: new Date(Date.now() + 22*24*60*60*1000).toISOString(), // +2 jours
    adresse: 'Cracovie, Pologne (départ Paris)',
    maxParticipants: 10,
    bobizRecompense: 50,
    statut: 'planifie'
  };
  
  try {
    const eventResponse = await axios.post(`${STRAPI_URL}/evenements`, {
      data: {
        ...bobCollectifData,
        createur: organisateur.user.id,
        dateCreation: new Date().toISOString()
      }
    }, {
      headers: {
        'Authorization': `Bearer ${organisateur.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const bobCollectif = eventResponse.data.data;
    console.log(`✅ BOB Collectif créé: ${bobCollectif.titre}`);
    console.log(`🆔 ID: ${bobCollectif.id}`);
    
    // Liste des besoins détaillée
    const besoins = [
      {
        id: 'besoin_1',
        item: 'Appareil photo numérique',
        description: 'Pour immortaliser les moments ! Un bon appareil avec objectif',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: true,
        date_besoin: 'Vendredi 14 sept (veille départ)',
        date_retour: 'Lundi 18 sept',
        assignations: []
      },
      {
        id: 'besoin_2', 
        item: 'Transport aéroport (aller)',
        description: 'Quelqu\'un pour m\'emmener à CDG - Départ 6h du matin !',
        quantite_demandee: 1,
        type: 'service',
        urgent: true,
        date_besoin: 'Vendredi 15 sept - 6h',
        date_retour: null,
        assignations: []
      },
      {
        id: 'besoin_3',
        item: 'Valise grande taille',
        description: 'Une grosse valise pour 3 jours, la mienne est cassée',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: false,
        date_besoin: 'Jeudi 14 sept',
        date_retour: 'Lundi 18 sept',
        assignations: []
      },
      {
        id: 'besoin_4',
        item: 'Aide déménagement valise',
        description: 'Pour descendre/monter la valise (4ème étage sans ascenseur)',
        quantite_demandee: 4,
        type: 'service',
        urgent: false,
        date_besoin: 'Jeudi 14 sept - 19h',
        date_retour: null,
        assignations: []
      },
      {
        id: 'besoin_5',
        item: 'Chargeur portable',
        description: 'Power bank pour le voyage, le mien ne tient plus',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: false,
        date_besoin: 'Vendredi 14 sept',
        date_retour: 'Lundi 18 sept',
        assignations: []
      },
      {
        id: 'besoin_6',
        item: 'Guide/conseils Cracovie',
        description: 'Quelqu\'un qui y est déjà allé pour des bons plans !',
        quantite_demandee: 1,
        type: 'service',
        urgent: false,
        date_besoin: 'Dès maintenant',
        date_retour: null,
        assignations: []
      }
    ];
    
    // Participants invités
    const participants_invites = [
      'thomas@bob.com',
      'sophie@bob.com', 
      'lucas@bob.com'
    ];
    
    console.log(`📋 ${besoins.length} besoins définis`);
    console.log(`👥 ${participants_invites.length} personnes invitées`);
    
    return {
      bobCollectif,
      besoins,
      participants_invites,
      organisateur
    };
    
  } catch (error) {
    console.log(`❌ Erreur création BOB Collectif: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

async function envoyerInvitationsBobCollectif(data) {
  console.log('\n📨 === ENVOI INVITATIONS BOB COLLECTIF ===');
  
  const { bobCollectif, besoins, participants_invites, organisateur } = data;
  
  for (const participantEmail of participants_invites) {
    const participant = await authenticateUser(participantEmail);
    if (!participant) continue;
    
    try {
      // Message d'invitation avec liste des besoins
      const listeBesoins = besoins.map((besoin, index) => 
        `${index + 1}. ${besoin.item}${besoin.urgent ? ' ⚡' : ''}\n   ${besoin.description}\n   📅 ${besoin.date_besoin}${besoin.date_retour ? ` → ${besoin.date_retour}` : ''}\n   👥 ${besoin.quantite_demandee} ${besoin.quantite_demandee > 1 ? 'personnes' : 'personne'} recherchée(s)`
      ).join('\n\n');
      
      const messageInvitation = `🎯 INVITATION BOB COLLECTIF ! 🎯\n\nSalut ${participant.user.username} !\n\n${organisateur.user.username} t'invite à participer à son BOB Collectif :\n"${bobCollectif.titre}"\n\n✈️ ${bobCollectif.description}\n\n📋 LISTE DES BESOINS :\n\n${listeBesoins}\n\n💡 Tu peux te positionner sur un ou plusieurs besoins !\nQuand tu acceptes, ça crée automatiquement un échange entre vous deux ! 🤝\n\nQui peut aider ${organisateur.user.username} ? 😊`;
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: messageInvitation,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: organisateur.user.id,
          evenement: bobCollectif.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${organisateur.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📧 Invitation envoyée à ${participant.user.username}`);
      
      // Réponse du participant
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reponses = [
        `Salut ${organisateur.user.username} ! Super projet ! 😍 Je regarde ce que je peux faire pour t'aider !`,
        `Cracovie ! 🇵🇱 Ça va être génial ! Laisse-moi voir la liste !`,
        `Coucou ! J'adore l'idée du BOB Collectif ! Je vais regarder ça ! 🎯`
      ];
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: reponses[Math.floor(Math.random() * reponses.length)],
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: participant.user.id,
          evenement: bobCollectif.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${participant.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ ${participant.user.username} répond positivement`);
      
    } catch (error) {
      console.log(`❌ Erreur invitation ${participantEmail}: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function simulerPositionnements(data) {
  console.log('\n🎯 === POSITIONNEMENTS SUR LES BESOINS ===');
  
  const { bobCollectif, besoins, participants_invites, organisateur } = data;
  const bobsIndividuelsCreés = [];
  
  // Thomas se positionne sur l'appareil photo
  const thomas = await authenticateUser('thomas@bob.com');
  if (thomas) {
    const besoinAppareil = besoins[0]; // Appareil photo
    
    console.log(`\n📸 ${thomas.user.username} se positionne sur "${besoinAppareil.item}"`);
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `📸 JE ME POSITIONNE !\n\n${thomas.user.username} se positionne sur :\n"${besoinAppareil.item}"\n\n✅ Pas de problème ${organisateur.user.username} ! J'ai un excellent Canon EOS avec plusieurs objectifs ! Je peux te le prêter du ${besoinAppareil.date_besoin} au ${besoinAppareil.date_retour} !\n\n📱 Ça va créer un BOB individuel entre nous pour organiser le prêt ! 🤝`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: thomas.user.id,
          evenement: bobCollectif.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${thomas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Créer le BOB individuel automatiquement
      const bobIndividuel = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          titre: `📸 Prêt appareil photo - Week-end Cracovie`,
          description: `Prêt d'appareil photo Canon EOS de ${thomas.user.username} à ${organisateur.user.username} pour le week-end à Cracovie.\n\nIssu du BOB Collectif "${bobCollectif.titre}"`,
          type: 'pret',
          bobizEchange: 15,
          statut: 'actif',
          createur: thomas.user.id,
          responsable: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${thomas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB individuel créé: ${bobIndividuel.data.data.titre}`);
      bobsIndividuelsCreés.push(bobIndividuel.data.data);
      
      besoinAppareil.assignations.push({
        participant: thomas.user.username,
        participant_id: thomas.user.id,
        bob_individuel_id: bobIndividuel.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Erreur positionnement Thomas: ${error.response?.data?.error?.message}`);
    }
  }
  
  // Sophie se positionne sur le transport aéroport
  const sophie = await authenticateUser('sophie@bob.com');
  if (sophie) {
    const besoinTransport = besoins[1]; // Transport aéroport
    
    console.log(`\n🚗 ${sophie.user.username} se positionne sur "${besoinTransport.item}"`);
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🚗 JE ME POSITIONNE !\n\n${sophie.user.username} se positionne sur :\n"${besoinTransport.item}"\n\n✅ Aucun souci ${organisateur.user.username} ! Je peux t'emmener à CDG ! Je me lève tôt de toute façon ! 😊\n\nRDV ${besoinTransport.date_besoin} chez toi !\n\n🤝 Un BOB service va être créé entre nous !`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: sophie.user.id,
          evenement: bobCollectif.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${sophie.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Créer le BOB service
      const bobService = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          titre: `🚗 Transport aéroport CDG - Cracovie`,
          description: `Service transport de ${sophie.user.username} à ${organisateur.user.username} pour l'aéroport CDG.\n\nIssu du BOB Collectif "${bobCollectif.titre}"\n\nDépart: ${besoinTransport.date_besoin}`,
          type: 'service_offert',
          bobizEchange: 25,
          statut: 'actif',
          createur: sophie.user.id,
          responsable: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${sophie.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB service créé: ${bobService.data.data.titre}`);
      bobsIndividuelsCreés.push(bobService.data.data);
      
      besoinTransport.assignations.push({
        participant: sophie.user.username,
        participant_id: sophie.user.id,
        bob_individuel_id: bobService.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Erreur positionnement Sophie: ${error.response?.data?.error?.message}`);
    }
  }
  
  // Lucas se positionne sur l'aide déménagement (besoin multiple)
  const lucas = await authenticateUser('lucas@bob.com');
  if (lucas) {
    const besoinAide = besoins[3]; // Aide déménagement valise
    
    console.log(`\n💪 ${lucas.user.username} se positionne sur "${besoinAide.item}" (1/${besoinAide.quantite_demandee})`);
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `💪 JE ME POSITIONNE !\n\n${lucas.user.username} se positionne sur :\n"${besoinAide.item}"\n\n✅ Compte sur moi ${organisateur.user.username} ! Je serai là ${besoinAide.date_besoin} pour t'aider ! 💪\n\n👥 Plus que ${besoinAide.quantite_demandee - 1} personnes recherchées pour ce besoin !\n\n🤝 BOB service créé entre nous !`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: lucas.user.id,
          evenement: bobCollectif.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${lucas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const bobAide = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          titre: `💪 Aide déménagement valise - Cracovie`,
          description: `Service aide déménagement de ${lucas.user.username} à ${organisateur.user.username}.\n\nIssu du BOB Collectif "${bobCollectif.titre}"\n\nRDV: ${besoinAide.date_besoin}`,
          type: 'service_offert',
          bobizEchange: 10,
          statut: 'actif',
          createur: lucas.user.id,
          responsable: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${lucas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB aide créé: ${bobAide.data.data.titre}`);
      bobsIndividuelsCreés.push(bobAide.data.data);
      
      besoinAide.assignations.push({
        participant: lucas.user.username,
        participant_id: lucas.user.id,
        bob_individuel_id: bobAide.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Erreur positionnement Lucas: ${error.response?.data?.error?.message}`);
    }
  }
  
  return { besoins, bobsIndividuelsCreés };
}

async function afficherRecapitulatif(data, updatedData) {
  console.log('\n📊 === RÉCAPITULATIF BOB COLLECTIF ===');
  
  const { bobCollectif, organisateur } = data;
  const { besoins, bobsIndividuelsCreés } = updatedData;
  
  try {
    // Message récapitulatif dans l'événement
    const besoinsStatus = besoins.map(besoin => {
      const assigned = besoin.assignations.length;
      const needed = besoin.quantite_demandee;
      const status = assigned >= needed ? '✅ COMPLET' : `⏳ ${assigned}/${needed}`;
      const assignedNames = besoin.assignations.map(a => a.participant).join(', ');
      
      return `${besoin.item}: ${status}${assignedNames ? ` (${assignedNames})` : ''}`;
    }).join('\n');
    
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `📊 RÉCAPITULATIF BOB COLLECTIF\n\n🎯 Statut des besoins :\n\n${besoinsStatus}\n\n🤝 ${bobsIndividuelsCreés.length} BOB individuels créés automatiquement !\n\nMerci à tous pour votre aide ! ❤️\n\nLes échanges individuels sont maintenant actifs pour organiser les détails ! 🚀`,
        typeConversation: 'evenement',
        dateEnvoi: new Date().toISOString(),
        expediteur: organisateur.user.id,
        evenement: bobCollectif.id
      }
    }, {
      headers: {
        'Authorization': `Bearer ${organisateur.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n🎯 BOB COLLECTIF "${bobCollectif.titre}"`);
    console.log(`👤 Organisateur: ${organisateur.user.username}`);
    console.log(`📋 Besoins définis: ${besoins.length}`);
    console.log(`✅ Besoins couverts: ${besoins.filter(b => b.assignations.length >= b.quantite_demandee).length}`);
    console.log(`🤝 BOB individuels créés: ${bobsIndividuelsCreés.length}`);
    
    console.log(`\n📋 DÉTAIL DES BESOINS:`);
    besoins.forEach(besoin => {
      const assigned = besoin.assignations.length;
      const needed = besoin.quantite_demandee;
      const status = assigned >= needed ? '✅' : '⏳';
      
      console.log(`  ${status} ${besoin.item}: ${assigned}/${needed} personnes`);
      besoin.assignations.forEach(assign => {
        console.log(`     → ${assign.participant} (BOB #${assign.bob_individuel_id})`);
      });
    });
    
    console.log(`\n🔄 BOB INDIVIDUELS CRÉÉS:`);
    bobsIndividuelsCreés.forEach(bob => {
      console.log(`  📦 ${bob.titre} (ID: ${bob.id})`);
      console.log(`     💎 ${bob.bobizEchange} BOBIZ`);
    });
    
    console.log(`\n✅ FONCTIONNALITÉS BOB COLLECTIF DÉMONSTRÉES:`);
    console.log(`  🎯 Création événement avec liste de besoins`);
    console.log(`  👥 Invitation groupe de participants`);
    console.log(`  📋 Positionnement libre sur les besoins`);
    console.log(`  🤝 Création automatique BOB individuels`);
    console.log(`  👀 Visibilité des assignations pour tous`);
    console.log(`  📊 Suivi temps réel des besoins couverts`);
    console.log(`  🔄 Gestion besoins multiples (quantité > 1)`);
    console.log(`  💬 Chat collectif + échanges individuels`);
    
  } catch (error) {
    console.log(`❌ Erreur récapitulatif: ${error.response?.data?.error?.message}`);
  }
}

async function main() {
  console.log('🎯 === BOB COLLECTIF - WEEK-END CRACOVIE ===\n');
  console.log('💡 Concept: Événement avec besoins → Positionnements → BOB individuels automatiques\n');
  
  // 1. Créer le BOB Collectif
  const data = await createBobCollectif();
  if (!data) {
    console.log('❌ Impossible de créer le BOB Collectif');
    return;
  }
  
  // 2. Envoyer les invitations
  await envoyerInvitationsBobCollectif(data);
  
  // 3. Simuler les positionnements
  const updatedData = await simulerPositionnements(data);
  
  // 4. Afficher le récapitulatif
  await afficherRecapitulatif(data, updatedData);
  
  console.log('\n✨ === BOB COLLECTIF TERMINÉ ! ===');
  console.log('🎯 Système événement → besoins → positionnements → BOB individuels opérationnel !');
  console.log('🤝 Échanges collectifs ET individuels créés automatiquement !');
}

main().catch(console.error);