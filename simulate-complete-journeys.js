// Simuler parcours complets prêt/emprunt/service avec interactions et finalisation
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

// Base d'utilisateurs simulés avec profils détaillés
const utilisateurs = [
  {
    email: 'marie@bob.com',
    password: 'password123',
    profile: {
      nom: 'Marie',
      prenom: 'Dubois',
      specialites: ['bricolage', 'jardinage'],
      bobizBalance: 150,
      niveau: 'Experte',
      groupes: ['Bricoleurs', 'Voisins', 'Jardiniers']
    }
  },
  {
    email: 'thomas@bob.com', 
    password: 'password123',
    profile: {
      nom: 'Thomas',
      prenom: 'Martin',
      specialites: ['cuisine', 'tech'],
      bobizBalance: 120,
      niveau: 'Avancé',
      groupes: ['Cuisiniers', 'Tech', 'Amis']
    }
  },
  {
    email: 'sophie@bob.com',
    password: 'password123',
    profile: {
      nom: 'Sophie',
      prenom: 'Laurent',
      specialites: ['jardinage', 'bio'],
      bobizBalance: 90,
      niveau: 'Intermédiaire',
      groupes: ['Jardiniers', 'Famille', 'Voisins']
    }
  },
  {
    email: 'lucas@bob.com',
    password: 'password123',
    profile: {
      nom: 'Lucas',
      prenom: 'Bernard',
      specialites: ['tech', 'auto'],
      bobizBalance: 200,
      niveau: 'Expert',
      groupes: ['Tech', 'Bricoleurs', 'Amis']
    }
  }
];

// Scénarios de parcours complets
const scenarios = [
  {
    id: 'pret_perceuse',
    type: 'pret',
    title: '🔨 Parcours Prêt - Perceuse de Marie',
    createur: 'marie@bob.com',
    demandeur: 'thomas@bob.com',
    bobData: {
      titre: 'Perceuse Bosch Professional',
      description: 'Perceuse sans fil 18V avec mallette complète, idéale pour tous travaux de bricolage. Disponible avec forets et visseuses.',
      type: 'pret',
      dureeJours: 7,
      conditions: 'Utilisation soignée, retour propre. Caution 50€ en Bobiz.',
      bobizGagnes: 30,
      adresse: '12 rue des Lilas, 75015 Paris',
      latitude: 48.8534,
      longitude: 2.2945
    },
    conversation: [
      { expediteur: 'thomas@bob.com', message: 'Salut Marie ! Ta perceuse m\'intéresse beaucoup, je dois percer du béton pour fixer une étagère.' },
      { expediteur: 'marie@bob.com', message: 'Parfait Thomas ! Elle est nickel pour le béton. Tu peux passer la prendre quand ?' },
      { expediteur: 'thomas@bob.com', message: 'Je peux passer demain matin vers 10h si ça te va ?' },
      { expediteur: 'marie@bob.com', message: 'Parfait ! RDV devant chez moi. Je te montrerai comment bien l\'utiliser 👍' }
    ],
    finalisation: {
      dateDebut: new Date(Date.now() + 24*60*60*1000), // Demain
      dateFin: new Date(Date.now() + 8*24*60*60*1000), // Dans 8 jours
      statut: 'termine',
      evaluation: {
        noteCreateur: 5,
        noteDemandeur: 5,
        commentaireCreateur: 'Thomas très soigneux, perceuse rendue impeccable !',
        commentaireDemandeur: 'Matériel pro, Marie super sympa. Top échange !'
      },
      bobizTransaction: {
        createur: +30, // Gagne 30 Bobiz
        demandeur: -30 // Paie 30 Bobiz
      }
    }
  },
  
  {
    id: 'emprunt_robot',
    type: 'emprunt',
    title: '🤖 Parcours Emprunt - Robot cuiseur recherché',
    createur: 'sophie@bob.com', // Celle qui cherche
    demandeur: 'lucas@bob.com', // Celui qui répond/prête
    bobData: {
      titre: 'Recherche Robot cuiseur Thermomix',
      description: 'Je cherche un robot cuiseur pour préparer des purées bio pour mon bébé. Utilisation ponctuelle (2-3 fois par semaine).',
      type: 'emprunt',
      dureeJours: 14,
      conditions: 'Usage familial uniquement, nettoyage après chaque utilisation.',
      bobizGagnes: 45,
      adresse: '8 avenue Mozart, 75016 Paris',
      latitude: 48.8584,
      longitude: 2.2756
    },
    conversation: [
      { expediteur: 'lucas@bob.com', message: 'Salut Sophie ! J\'ai un Thermomix TM6 qui traîne. Je peux te le prêter sans souci.' },
      { expediteur: 'sophie@bob.com', message: 'Oh génial Lucas ! Tu es sûr ? C\'est un appareil cher...' },
      { expediteur: 'lucas@bob.com', message: 'Aucun souci, on se connaît ! Je te fais confiance. Tu veux que je t\'apporte quelques recettes aussi ?' },
      { expediteur: 'sophie@bob.com', message: 'Tu es un ange ! Oui pour les recettes, surtout pour bébé 👶' },
      { expediteur: 'lucas@bob.com', message: 'Je passe te l\'apporter demain avec le livre de recettes bio !' }
    ],
    finalisation: {
      dateDebut: new Date(Date.now() + 24*60*60*1000),
      dateFin: new Date(Date.now() + 15*24*60*60*1000),
      statut: 'termine',
      evaluation: {
        noteCreateur: 5,
        noteDemandeur: 5,
        commentaireCreateur: 'Lucas incroyable ! M\'a même apporté des recettes et conseils.',
        commentaireDemandeur: 'Sophie très respectueuse, robot rendu nickel avec petits pots en bonus ! 😊'
      },
      bobizTransaction: {
        createur: -45, // Sophie paie
        demandeur: +45  // Lucas gagne
      }
    }
  },

  {
    id: 'service_cours',
    type: 'service_offert',
    title: '📚 Parcours Service - Cours informatique',
    createur: 'lucas@bob.com',
    demandeur: 'marie@bob.com',
    bobData: {
      titre: 'Cours informatique personnalisés',
      description: 'Formation sur mesure : bureautique, internet, smartphone. Patience et pédagogie garanties !',
      type: 'service_offert',
      dureeJours: 1, // Service ponctuel
      conditions: 'Chez vous ou chez moi. Matériel fourni si besoin.',
      bobizGagnes: 60,
      adresse: '25 rue de la Paix, 75002 Paris',
      latitude: 48.8692,
      longitude: 2.3317
    },
    conversation: [
      { expediteur: 'marie@bob.com', message: 'Salut Lucas ! J\'ai besoin d\'aide pour configurer ma nouvelle tablette et apprendre quelques trucs.' },
      { expediteur: 'lucas@bob.com', message: 'Avec plaisir Marie ! Tablette Android ou iPad ?' },
      { expediteur: 'marie@bob.com', message: 'iPad ! Et j\'aimerais aussi apprendre à faire des visios avec ma fille.' },
      { expediteur: 'lucas@bob.com', message: 'Parfait ! Je peux venir samedi matin ? On fera ça tranquillement avec un café ☕' },
      { expediteur: 'marie@bob.com', message: 'Super ! 10h ça va ? Je préparerai des croissants 🥐' }
    ],
    finalisation: {
      dateDebut: new Date(Date.now() + 2*24*60*60*1000), // Samedi
      dateFin: new Date(Date.now() + 2*24*60*60*1000 + 3*60*60*1000), // +3h
      statut: 'termine',
      evaluation: {
        noteCreateur: 5,
        noteDemandeur: 5,
        commentaireCreateur: 'Lucas excellent pédagogue ! Ma tablette n\'a plus de secrets.',
        commentaireDemandeur: 'Marie super accueillante, croissants délicieux ! Bon échange.'
      },
      bobizTransaction: {
        createur: +60, // Lucas gagne
        demandeur: -60 // Marie paie
      }
    }
  }
];

let authTokens = {}; // Stockage des tokens par utilisateur

async function authenticateUser(userEmail, userPassword) {
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: userEmail,
      password: userPassword
    });
    
    return {
      token: response.data.jwt,
      user: response.data.user
    };
  } catch (error) {
    // Essayer de créer l'utilisateur s'il n'existe pas
    try {
      const userProfile = utilisateurs.find(u => u.email === userEmail);
      if (userProfile) {
        const registerResponse = await axios.post(`${STRAPI_URL}/auth/local/register`, {
          username: userProfile.profile.prenom.toLowerCase(),
          email: userEmail,
          password: userPassword,
          nom: userProfile.profile.nom,
          prenom: userProfile.profile.prenom
        });
        
        return {
          token: registerResponse.data.jwt,
          user: registerResponse.data.user
        };
      }
    } catch (registerError) {
      console.log(`❌ Impossible d'authentifier/créer ${userEmail}`);
      return null;
    }
  }
}

async function createBobWithDetails(scenario, authData) {
  console.log(`\n🎯 Création Bob: ${scenario.title}`);
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    const response = await axios.post(`${STRAPI_URL}/echanges`, {
      data: {
        ...scenario.bobData,
        createur: authData.user.id,
        dateCreation: new Date().toISOString(),
        statut: 'actif'
      }
    }, { headers });
    
    const bobId = response.data.data.id;
    console.log(`✅ Bob créé (ID: ${bobId}): ${scenario.bobData.titre}`);
    return bobId;
    
  } catch (error) {
    console.log(`❌ Erreur création Bob: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

async function simulateConversation(scenario, bobId) {
  console.log(`\n💬 Simulation conversation (${scenario.conversation.length} messages)`);
  
  for (let i = 0; i < scenario.conversation.length; i++) {
    const msg = scenario.conversation[i];
    const authData = authTokens[msg.expediteur];
    
    if (!authData) {
      console.log(`⚠️ Token manquant pour ${msg.expediteur}`);
      continue;
    }
    
    try {
      const headers = {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: msg.message,
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 60000).toISOString(), // Messages espacés
          expediteur: authData.user.id,
          echange: bobId
        }
      }, { headers });
      
      const userName = utilisateurs.find(u => u.email === msg.expediteur)?.profile?.prenom || 'Utilisateur';
      console.log(`📤 ${userName}: ${msg.message.substring(0, 50)}...`);
      
    } catch (error) {
      console.log(`❌ Erreur envoi message: ${error.response?.data?.error?.message}`);
    }
    
    // Pause entre messages pour simuler conversation naturelle
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function finalizeExchange(scenario, bobId) {
  console.log(`\n🎯 Finalisation échange: ${scenario.title}`);
  
  const createurAuth = authTokens[scenario.createur];
  if (!createurAuth) return;
  
  const headers = {
    'Authorization': `Bearer ${createurAuth.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Marquer l'échange comme "en_cours"
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'en_cours',
        dateDebut: scenario.finalisation.dateDebut.toISOString()
      }
    }, { headers });
    
    console.log(`✅ Échange passé en "en_cours"`);
    
    // Simulation du temps qui passe...
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 2. Marquer l'échange comme "terminé"
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'termine',
        dateFin: scenario.finalisation.dateFin.toISOString()
      }
    }, { headers });
    
    console.log(`✅ Échange terminé avec succès`);
    
    // 3. Créer les transactions Bobiz
    await createBobizTransactions(scenario, bobId);
    
    // 4. Créer les évaluations
    await createEvaluations(scenario, bobId);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur finalisation: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function createBobizTransactions(scenario, bobId) {
  console.log(`\n💰 Création transactions Bobiz`);
  
  const createurAuth = authTokens[scenario.createur];
  const demandeurAuth = authTokens[scenario.demandeur];
  
  if (!createurAuth || !demandeurAuth) return;
  
  const transactions = [
    {
      auth: createurAuth,
      amount: scenario.finalisation.bobizTransaction.createur,
      description: `${scenario.finalisation.bobizTransaction.createur > 0 ? 'Gain' : 'Dépense'} - ${scenario.bobData.titre}`
    },
    {
      auth: demandeurAuth, 
      amount: scenario.finalisation.bobizTransaction.demandeur,
      description: `${scenario.finalisation.bobizTransaction.demandeur > 0 ? 'Gain' : 'Dépense'} - ${scenario.bobData.titre}`
    }
  ];
  
  for (const transaction of transactions) {
    try {
      const headers = {
        'Authorization': `Bearer ${transaction.auth.token}`,
        'Content-Type': 'application/json'
      };
      
      await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
        data: {
          points: Math.abs(transaction.amount),
          type: transaction.amount > 0 ? 'gain' : 'depense',
          source: 'echange_complete',
          description: transaction.description,
          dateTransaction: new Date().toISOString(),
          user: transaction.auth.user.id,
          echange: bobId
        }
      }, { headers });
      
      const userName = utilisateurs.find(u => u.email === Object.keys(authTokens).find(email => authTokens[email] === transaction.auth))?.profile?.prenom || 'User';
      console.log(`💰 ${userName}: ${transaction.amount > 0 ? '+' : ''}${transaction.amount} Bobiz`);
      
    } catch (error) {
      console.log(`❌ Erreur transaction Bobiz: ${error.response?.data?.error?.message}`);
    }
  }
}

async function createEvaluations(scenario, bobId) {
  console.log(`\n⭐ Création évaluations`);
  
  // Note: Les évaluations nécessiteraient une collection séparée
  // Pour l'instant, on simule avec des messages d'évaluation
  
  const createurAuth = authTokens[scenario.createur];
  const demandeurAuth = authTokens[scenario.demandeur];
  
  if (!createurAuth || !demandeurAuth) return;
  
  try {
    // Évaluation du créateur
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `⭐ Évaluation: ${scenario.finalisation.evaluation.noteCreateur}/5 - ${scenario.finalisation.evaluation.commentaireCreateur}`,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: createurAuth.user.id,
        echange: bobId
      }
    }, {
      headers: { 'Authorization': `Bearer ${createurAuth.token}`, 'Content-Type': 'application/json' }
    });
    
    // Évaluation du demandeur
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `⭐ Évaluation: ${scenario.finalisation.evaluation.noteDemandeur}/5 - ${scenario.finalisation.evaluation.commentaireDemandeur}`,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: demandeurAuth.user.id,
        echange: bobId
      }
    }, {
      headers: { 'Authorization': `Bearer ${demandeurAuth.token}`, 'Content-Type': 'application/json' }
    });
    
    console.log(`⭐ Évaluations créées (${scenario.finalisation.evaluation.noteCreateur}/5 et ${scenario.finalisation.evaluation.noteDemandeur}/5)`);
    
  } catch (error) {
    console.log(`❌ Erreur évaluations: ${error.response?.data?.error?.message}`);
  }
}

async function runCompleteScenario(scenario) {
  console.log(`\n🎬 === ${scenario.title} ===`);
  
  // 1. Authentifier le créateur
  const createurAuth = await authenticateUser(scenario.createur, 'password123');
  if (!createurAuth) {
    console.log(`❌ Impossible d'authentifier le créateur`);
    return;
  }
  authTokens[scenario.createur] = createurAuth;
  
  // 2. Authentifier le demandeur  
  const demandeurAuth = await authenticateUser(scenario.demandeur, 'password123');
  if (!demandeurAuth) {
    console.log(`❌ Impossible d'authentifier le demandeur`);
    return;
  }
  authTokens[scenario.demandeur] = demandeurAuth;
  
  // 3. Créer le Bob
  const bobId = await createBobWithDetails(scenario, createurAuth);
  if (!bobId) return;
  
  // 4. Simuler la conversation
  await simulateConversation(scenario, bobId);
  
  // 5. Finaliser l'échange
  const success = await finalizeExchange(scenario, bobId);
  
  if (success) {
    console.log(`🎉 Parcours ${scenario.id} terminé avec succès !`);
  } else {
    console.log(`⚠️ Parcours ${scenario.id} partiellement réalisé`);
  }
  
  return bobId;
}

async function generateFinalReport(completedScenarios) {
  console.log(`\n📊 === RAPPORT FINAL PARCOURS COMPLETS ===`);
  
  // Authentification pour récupérer les stats
  const authData = authTokens[Object.keys(authTokens)[0]];
  if (!authData) return;
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`
  };
  
  try {
    const [bobsResponse, messagesResponse, transactionsResponse] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`, { headers }),
      axios.get(`${STRAPI_URL}/messages`, { headers }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, { headers })
    ]);
    
    const bobs = bobsResponse.data.data;
    const messages = messagesResponse.data.data;
    const transactions = transactionsResponse.data.data;
    
    console.log(`🎯 ${completedScenarios.length} parcours simulés:`);
    completedScenarios.forEach(scenario => {
      console.log(`  ✅ ${scenario.title}`);
    });
    
    console.log(`\n📈 Statistiques générées:`);
    console.log(`  📋 ${bobs.length} Bobs total (dont ${bobs.filter(b => b.attributes.statut === 'termine').length} terminés)`);
    console.log(`  💬 ${messages.length} messages de conversation`);
    console.log(`  💰 ${transactions.length} transactions Bobiz`);
    
    const totalBobizMouvement = transactions.reduce((sum, t) => sum + t.attributes.points, 0);
    console.log(`  💎 ${totalBobizMouvement} Bobiz total en circulation`);
    
    console.log(`\n🏆 ÉCOSYSTÈME BOB SIMULÉ AVEC SUCCÈS !`);
    console.log(`  ✅ Parcours prêt/emprunt/service complets`);
    console.log(`  ✅ Conversations réalistes simulées`);
    console.log(`  ✅ Statuts évolutifs (actif → en_cours → terminé)`);
    console.log(`  ✅ Attribution BOBIZ automatique`);
    console.log(`  ✅ Évaluations et historique`);
    
  } catch (error) {
    console.log(`❌ Erreur génération rapport: ${error.response?.data?.error?.message || error.message}`);
  }
}

async function main() {
  console.log(`🚀 === SIMULATION PARCOURS COMPLETS BOB ===\n`);
  console.log(`🎯 ${scenarios.length} scénarios à simuler:`);
  scenarios.forEach(s => console.log(`  📋 ${s.title}`));
  
  const completedScenarios = [];
  
  for (const scenario of scenarios) {
    const bobId = await runCompleteScenario(scenario);
    if (bobId) {
      completedScenarios.push({ ...scenario, bobId });
    }
    
    // Pause entre scénarios
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  await generateFinalReport(completedScenarios);
  
  console.log(`\n✨ SIMULATION TERMINÉE ✨`);
}

main().catch(console.error);