// BOB COLLECTIF - Système fonctionnel avec positionnements et BOB individuels
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

async function createBobCollectifCracovie() {
  console.log('🎯 === CRÉATION BOB COLLECTIF - WEEK-END CRACOVIE ===');
  
  const organisateur = await authenticateUser('marie@bob.com');
  if (!organisateur) return null;
  
  const bobCollectifData = {
    titre: '✈️ Week-end à Cracovie - BOB Collectif',
    description: 'Salut tout le monde ! Je pars en week-end à Cracovie du 15 au 17 septembre et j\'aurais besoin de votre aide pour quelques trucs ! Qui peut m\'aider ? 😊',
    dateDebut: new Date(Date.now() + 20*24*60*60*1000).toISOString(),
    dateFin: new Date(Date.now() + 22*24*60*60*1000).toISOString(),
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
    
    // Besoins détaillés pour Cracovie
    const besoins = [
      {
        id: 'besoin_1',
        item: 'Appareil photo numérique',
        description: 'Pour immortaliser Cracovie ! Un bon appareil avec objectif',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: true,
        assignations: []
      },
      {
        id: 'besoin_2', 
        item: 'Transport aéroport aller (6h matin)',
        description: 'Quelqu\'un pour m\'emmener à CDG - Départ très tôt !',
        quantite_demandee: 1,
        type: 'service',
        urgent: true,
        assignations: []
      },
      {
        id: 'besoin_3',
        item: 'Valise grande taille',
        description: 'Une grosse valise pour 3 jours, la mienne est cassée',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: false,
        assignations: []
      },
      {
        id: 'besoin_4',
        item: 'Aide transport valise (4 personnes)',
        description: 'Pour descendre/monter la valise (4ème étage sans ascenseur)',
        quantite_demandee: 4,
        type: 'service',
        urgent: false,
        assignations: []
      },
      {
        id: 'besoin_5',
        item: 'Chargeur portable puissant',
        description: 'Power bank pour le voyage, le mien ne tient plus',
        quantite_demandee: 1,
        type: 'materiel',
        urgent: false,
        assignations: []
      },
      {
        id: 'besoin_6',
        item: 'Conseils/guide Cracovie',
        description: 'Quelqu\'un qui y est déjà allé pour des bons plans !',
        quantite_demandee: 1,
        type: 'service',
        urgent: false,
        assignations: []
      }
    ];
    
    const participants_invites = [
      'thomas@bob.com',
      'sophie@bob.com', 
      'lucas@bob.com'
    ];
    
    console.log(`📋 ${besoins.length} besoins définis pour Cracovie`);
    console.log(`👥 ${participants_invites.length} amis invités`);
    
    return {
      bobCollectif,
      besoins,
      participants_invites,
      organisateur
    };
    
  } catch (error) {
    console.log(`❌ Erreur création: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

async function envoyerInvitationsCollectives(data) {
  console.log('\n📨 === INVITATIONS BOB COLLECTIF ===');
  
  const { bobCollectif, besoins, participants_invites, organisateur } = data;
  
  // Message d'invitation détaillé
  const listeBesoins = besoins.map((besoin, index) => 
    `${index + 1}. ${besoin.item}${besoin.urgent ? ' ⚡ URGENT' : ''}\n   📝 ${besoin.description}\n   👥 ${besoin.quantite_demandee} ${besoin.quantite_demandee > 1 ? 'personnes' : 'personne'} recherchée(s)`
  ).join('\n\n');
  
  for (const participantEmail of participants_invites) {
    const participant = await authenticateUser(participantEmail);
    if (!participant) continue;
    
    try {
      const messageInvitation = `🎯 INVITATION BOB COLLECTIF ! 🎯\n\nSalut ${participant.user.username} !\n\n${organisateur.user.username} part en week-end à Cracovie et a besoin d'aide ! ✈️\n\n"${bobCollectif.titre}"\n\n📋 LISTE DES BESOINS :\n\n${listeBesoins}\n\n💡 Comment ça marche :\n1️⃣ Tu choisis un ou plusieurs besoins\n2️⃣ Tu te positionnes en commentant \n3️⃣ Ça crée automatiquement un BOB individuel entre vous !\n4️⃣ Tout le monde voit qui s'est positionné sur quoi\n\nQui peut aider Marie ? 😊🤝`;
      
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
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Réponse enthousiaste
      const reponses = [
        `Salut Marie ! Cracovie c'est magnifique ! 🇵🇱 Je regarde ce que je peux faire !`,
        `Super projet ! J'adore l'idée du BOB Collectif ! Laisse-moi voir la liste ! 🎯`,
        `Coucou ! Ça va être génial ! Je vais regarder comment je peux t'aider ! ✨`
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
      console.log(`❌ Erreur invitation: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function simulerPositionnements(data) {
  console.log('\n🎯 === POSITIONNEMENTS ET CRÉATION BOB INDIVIDUELS ===');
  
  const { bobCollectif, besoins, participants_invites, organisateur } = data;
  const bobsIndividuelsCreés = [];
  
  // Thomas se positionne sur l'appareil photo
  const thomas = await authenticateUser('thomas@bob.com');
  if (thomas) {
    const besoinAppareil = besoins[0];
    
    console.log(`\n📸 ${thomas.user.username} se positionne sur "${besoinAppareil.item}"`);
    
    try {
      // Message de positionnement
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `📸 JE ME POSITIONNE !\n\n${thomas.user.username} → "${besoinAppareil.item}"\n\n✅ Pas de problème Marie ! J'ai un excellent Canon EOS avec plusieurs objectifs ! Parfait pour Cracovie ! 📷\n\n🤝 Un BOB prêt va être créé automatiquement entre nous !`,
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
          description: `Prêt d'appareil photo Canon EOS de ${thomas.user.username} à ${organisateur.user.username} pour le week-end à Cracovie.\n\n🎯 Issu du BOB Collectif "${bobCollectif.titre}"\n\n📅 Dates: 15-17 septembre\n📍 Récupération: Chez Thomas\n🔄 Retour: Lundi 18 septembre`,
          type: 'pret',
          bobizGagnes: 15,
          statut: 'actif',
          createur: thomas.user.id,
          demandeur: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${thomas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB individuel créé: ID ${bobIndividuel.data.data.id}`);
      bobsIndividuelsCreés.push(bobIndividuel.data.data);
      
      besoinAppareil.assignations.push({
        participant: thomas.user.username,
        participant_id: thomas.user.id,
        bob_individuel_id: bobIndividuel.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
      // Message confirmation visible par tous
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎉 BESOIN ASSIGNÉ !\n\n✅ "${besoinAppareil.item}" → ${thomas.user.username}\n\n📦 BOB individuel créé (ID: ${bobIndividuel.data.data.id})\n💎 ${bobIndividuel.data.data.bobizGagnes} BOBIZ\n\n👀 Visible par tous : ${thomas.user.username} s'occupe de l'appareil photo !`,
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
      
    } catch (error) {
      console.log(`❌ Erreur Thomas: ${error.response?.data?.error?.message}`);
    }
  }
  
  // Sophie se positionne sur le transport
  const sophie = await authenticateUser('sophie@bob.com');
  if (sophie) {
    const besoinTransport = besoins[1];
    
    console.log(`\n🚗 ${sophie.user.username} se positionne sur "${besoinTransport.item}"`);
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🚗 JE ME POSITIONNE !\n\n${sophie.user.username} → "${besoinTransport.item}"\n\n✅ Aucun souci Marie ! Je me lève tôt de toute façon ! Je peux t'emmener à CDG ! 🚗\n\nRDV chez toi à 5h45 ! ⏰`,
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
      
      const bobService = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          titre: `🚗 Transport aéroport CDG - Cracovie`,
          description: `Service transport de ${sophie.user.username} à ${organisateur.user.username} pour l'aéroport CDG.\n\n🎯 Issu du BOB Collectif "${bobCollectif.titre}"\n\n📅 Vendredi 15 septembre - 6h\n📍 Départ: Chez Marie\n✈️ Arrivée: Terminal CDG`,
          type: 'service_offert',
          bobizGagnes: 25,
          statut: 'actif',
          createur: sophie.user.id,
          demandeur: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${sophie.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB service créé: ID ${bobService.data.data.id}`);
      bobsIndividuelsCreés.push(bobService.data.data);
      
      besoinTransport.assignations.push({
        participant: sophie.user.username,
        participant_id: sophie.user.id,
        bob_individuel_id: bobService.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎉 BESOIN ASSIGNÉ !\n\n✅ "${besoinTransport.item}" → ${sophie.user.username}\n\n🚗 BOB service créé (ID: ${bobService.data.data.id})\n💎 ${bobService.data.data.bobizGagnes} BOBIZ\n\n👀 Sophie s'occupe du transport aéroport !`,
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
      
    } catch (error) {
      console.log(`❌ Erreur Sophie: ${error.response?.data?.error?.message}`);
    }
  }
  
  // Lucas se positionne sur l'aide (besoin multiple)
  const lucas = await authenticateUser('lucas@bob.com');
  if (lucas) {
    const besoinAide = besoins[3];
    
    console.log(`\n💪 ${lucas.user.username} se positionne sur "${besoinAide.item}" (1/${besoinAide.quantite_demandee})`);
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `💪 JE ME POSITIONNE !\n\n${lucas.user.username} → "${besoinAide.item}"\n\n✅ Compte sur moi Marie ! Je serai là jeudi 19h pour t'aider ! 💪\n\n👥 Plus que ${besoinAide.quantite_demandee - 1} personnes recherchées pour ce besoin !`,
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
          titre: `💪 Aide transport valise - Cracovie (1/4)`,
          description: `Service aide transport valise de ${lucas.user.username} à ${organisateur.user.username}.\n\n🎯 Issu du BOB Collectif "${bobCollectif.titre}"\n\n📅 Jeudi 14 septembre - 19h\n📍 Chez Marie (4ème étage)\n💪 Descendre grosse valise`,
          type: 'service_offert',
          bobizGagnes: 10,
          statut: 'actif',
          createur: lucas.user.id,
          demandeur: organisateur.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${lucas.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ BOB aide créé: ID ${bobAide.data.data.id}`);
      bobsIndividuelsCreés.push(bobAide.data.data);
      
      besoinAide.assignations.push({
        participant: lucas.user.username,
        participant_id: lucas.user.id,
        bob_individuel_id: bobAide.data.data.id,
        assigné_le: new Date().toISOString()
      });
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎉 BESOIN PARTIELLEMENT ASSIGNÉ !\n\n✅ "${besoinAide.item}" → ${lucas.user.username} (1/${besoinAide.quantite_demandee})\n\n💪 BOB aide créé (ID: ${bobAide.data.data.id})\n💎 ${bobAide.data.data.bobizGagnes} BOBIZ\n\n⏳ Encore ${besoinAide.quantite_demandee - 1} personnes recherchées !`,
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
      
    } catch (error) {
      console.log(`❌ Erreur Lucas: ${error.response?.data?.error?.message}`);
    }
  }
  
  return { besoins, bobsIndividuelsCreés };
}

async function afficherRecapFinal(data, updatedData) {
  console.log('\n📊 === RÉCAPITULATIF FINAL BOB COLLECTIF ===');
  
  const { bobCollectif, organisateur } = data;
  const { besoins, bobsIndividuelsCreés } = updatedData;
  
  try {
    const besoinsComplets = besoins.filter(b => b.assignations.length >= b.quantite_demandee).length;
    const besoinsPartiels = besoins.filter(b => b.assignations.length > 0 && b.assignations.length < b.quantite_demandee).length;
    const besoinsNonCouvert = besoins.filter(b => b.assignations.length === 0).length;
    
    const besoinsStatus = besoins.map(besoin => {
      const assigned = besoin.assignations.length;
      const needed = besoin.quantite_demandee;
      let status;
      if (assigned >= needed) status = '✅ COMPLET';
      else if (assigned > 0) status = `🔄 PARTIEL (${assigned}/${needed})`;
      else status = '⏳ LIBRE';
      
      const assignedNames = besoin.assignations.map(a => a.participant).join(', ');
      
      return `${besoin.item}: ${status}${assignedNames ? ` → ${assignedNames}` : ''}`;
    }).join('\n');
    
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `📊 RÉCAPITULATIF BOB COLLECTIF CRACOVIE\n\n🎯 Statut des besoins :\n\n${besoinsStatus}\n\n📈 RÉSULTATS :\n✅ Besoins complets: ${besoinsComplets}/${besoins.length}\n🔄 Besoins partiels: ${besoinsPartiels}\n⏳ Besoins libres: ${besoinsNonCouvert}\n\n🤝 ${bobsIndividuelsCreés.length} BOB individuels créés automatiquement !\n\nMerci à tous ! Cracovie me voilà ! ✈️🇵🇱\n\nLes échanges individuels sont actifs pour organiser les détails ! 🚀`,
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
    
    console.log(`\n🎯 BOB COLLECTIF "${bobCollectif.titre}" - RÉSULTATS`);
    console.log(`👤 Organisateur: ${organisateur.user.username}`);
    console.log(`🌍 Destination: Cracovie, Pologne`);
    console.log(`📋 Besoins définis: ${besoins.length}`);
    console.log(`✅ Besoins complets: ${besoinsComplets}`);
    console.log(`🔄 Besoins partiels: ${besoinsPartiels}`);
    console.log(`⏳ Besoins libres: ${besoinsNonCouvert}`);
    console.log(`🤝 BOB individuels créés: ${bobsIndividuelsCreés.length}`);
    
    console.log(`\n📋 DÉTAIL DES BESOINS:`);
    besoins.forEach(besoin => {
      const assigned = besoin.assignations.length;
      const needed = besoin.quantite_demandee;
      const status = assigned >= needed ? '✅' : assigned > 0 ? '🔄' : '⏳';
      
      console.log(`  ${status} ${besoin.item}: ${assigned}/${needed}`);
      besoin.assignations.forEach(assign => {
        console.log(`     → ${assign.participant} (BOB #${assign.bob_individuel_id})`);
      });
    });
    
    console.log(`\n🔄 BOB INDIVIDUELS CRÉÉS AUTOMATIQUEMENT:`);
    bobsIndividuelsCreés.forEach(bob => {
      console.log(`  📦 ${bob.titre}`);
      console.log(`     🆔 ID: ${bob.id} | 💎 ${bob.bobizGagnes} BOBIZ | 📊 ${bob.statut}`);
    });
    
    console.log(`\n✅ CONCEPT BOB COLLECTIF DÉMONTRÉ:`);
    console.log(`  🎯 Événement avec liste de besoins structurée`);
    console.log(`  👥 Invitation groupe de participants`);
    console.log(`  📋 Positionnement libre et visible par tous`);
    console.log(`  🤝 Création automatique BOB individuels`);
    console.log(`  👀 Transparence: qui s'occupe de quoi`);
    console.log(`  📊 Suivi temps réel besoins couverts`);
    console.log(`  🔄 Gestion besoins multiples (ex: 4 personnes)`);
    console.log(`  💬 Chat collectif + échanges individuels parallèles`);
    console.log(`  ⚡ Distinction urgence/non-urgence`);
    console.log(`  🎁 Distribution BOBIZ selon contribution`);
    
  } catch (error) {
    console.log(`❌ Erreur récap: ${error.response?.data?.error?.message}`);
  }
}

async function main() {
  console.log('🎯 === BOB COLLECTIF - WEEK-END CRACOVIE ===\n');
  console.log('💡 Concept: Marie part à Cracovie → Liste besoins → Amis se positionnent → BOB individuels créés automatiquement\n');
  
  // 1. Créer le BOB Collectif
  const data = await createBobCollectifCracovie();
  if (!data) {
    console.log('❌ Impossible de créer le BOB Collectif');
    return;
  }
  
  // 2. Envoyer les invitations collectives
  await envoyerInvitationsCollectives(data);
  
  // 3. Simuler les positionnements et créations BOB
  const updatedData = await simulerPositionnements(data);
  
  // 4. Récapitulatif final
  await afficherRecapFinal(data, updatedData);
  
  console.log('\n✨ === BOB COLLECTIF CRACOVIE TERMINÉ ! ===');
  console.log('🎯 Événement → Besoins → Positionnements → BOB individuels ✅');
  console.log('🤝 Système collectif ET individuel opérationnel !');
  console.log('🇵🇱 Marie est prête pour Cracovie grâce à ses amis !');
}

main().catch(console.error);