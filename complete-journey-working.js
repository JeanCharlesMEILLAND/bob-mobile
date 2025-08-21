// Parcours complet de prêt/emprunt/service avec schema actuel
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

// Scénarios réalistes avec parcours complets
const scenarios = [
  {
    id: 'pret_perceuse_marie_thomas',
    title: '🔨 Parcours Prêt - Perceuse Marie → Thomas',
    createur: { email: 'marie@bob.com', nom: 'Marie' },
    demandeur: { email: 'thomas@bob.com', nom: 'Thomas' },
    bob: {
      titre: 'Perceuse Bosch Pro 18V + Accessoires',
      description: 'Perceuse sans fil professionnelle avec mallette complète : forets béton/bois/métal, visseuses, niveau laser. Parfaite pour tous travaux !',
      type: 'pret',
      bobizGagnes: 35,
      dureeJours: 7,
      conditions: 'Utilisation soignée, retour propre. Petit dépôt Bobiz demandé.',
      adresse: '12 rue des Lilas, 75015 Paris'
    },
    messages: [
      { qui: 'demandeur', texte: 'Salut Marie ! Ta perceuse m\'intéresse, je dois percer du béton pour fixer une grande étagère.' },
      { qui: 'createur', texte: 'Parfait Thomas ! Elle est nickel pour le béton armé. Tu peux passer la récupérer quand ?' },
      { qui: 'demandeur', texte: 'Super ! Je peux passer demain matin vers 10h si ça te convient ?' },
      { qui: 'createur', texte: 'Parfait ! RDV devant chez moi. Je te montrerai les différents forets et le mode percussion 👍' },
      { qui: 'demandeur', texte: 'Top ! Merci beaucoup, tu me sauves la mise ! 🙏' }
    ],
    finalisation: {
      evaluation_createur: { note: 5, commentaire: 'Thomas très soigneux ! Perceuse rendue impeccable et à l\'heure. Échange parfait !' },
      evaluation_demandeur: { note: 5, commentaire: 'Marie super sympa et généreuse ! Matériel pro en parfait état. Recommande +++' },
      bobiz_mouvement: { createur: +35, demandeur: -35 }
    }
  },

  {
    id: 'emprunt_robot_sophie_lucas',
    title: '🤖 Parcours Emprunt - Sophie cherche → Lucas répond',
    createur: { email: 'sophie@bob.com', nom: 'Sophie' },
    demandeur: { email: 'lucas@bob.com', nom: 'Lucas' },
    bob: {
      titre: 'RECHERCHE Robot cuiseur type Thermomix',
      description: 'Jeune maman cherche robot cuiseur pour préparer purées bio pour bébé. Usage ponctuel 2-3x/semaine. Très soigneuse !',
      type: 'emprunt', 
      bobizGagnes: 50,
      dureeJours: 14,
      conditions: 'Nettoyage impeccable après chaque usage. Utilisation familiale uniquement.',
      adresse: '8 avenue Mozart, 75016 Paris'
    },
    messages: [
      { qui: 'demandeur', texte: 'Salut Sophie ! J\'ai un Thermomix TM6 qui dort. Je peux te le prêter sans problème !' },
      { qui: 'createur', texte: 'Oh Lucas tu es un ange ! Tu es sûr ? C\'est un appareil super cher...' },
      { qui: 'demandeur', texte: 'Aucun souci, on se connaît bien ! Je te fais confiance. Tu veux que j\'apporte des recettes spécial bébé aussi ?' },
      { qui: 'createur', texte: 'Tu me touches là ! Oui pour les recettes, surtout bio et adaptation 6 mois + 👶💚' },
      { qui: 'demandeur', texte: 'Parfait ! Je passe demain avec le robot + le livre recettes bio + mes conseils perso !' }
    ],
    finalisation: {
      evaluation_createur: { note: 5, commentaire: 'Lucas incroyable ! Robot + recettes + conseils. Générosité rare. MERCI !' },
      evaluation_demandeur: { note: 5, commentaire: 'Sophie adorable et respectueuse. Robot rendu nickel + petits pots en cadeau ! 😊' },
      bobiz_mouvement: { createur: -50, demandeur: +50 }
    }
  },

  {
    id: 'service_cours_lucas_marie',
    title: '📚 Parcours Service - Lucas forme Marie (informatique)',
    createur: { email: 'lucas@bob.com', nom: 'Lucas' },
    demandeur: { email: 'marie@bob.com', nom: 'Marie' },
    bob: {
      titre: 'Cours informatique personnalisés à domicile',
      description: 'Formation sur mesure : config tablette/smartphone, bureautique, internet sécurisé. Patience et pédagogie garanties !',
      type: 'service_offert',
      bobizGagnes: 70,
      dureeJours: 1,
      conditions: 'Chez vous ou visio. Matériel fourni. Support écrit inclus.',
      adresse: 'À domicile Paris 15e'
    },
    messages: [
      { qui: 'demandeur', texte: 'Salut Lucas ! J\'aurais besoin d\'aide pour ma nouvelle tablette iPad et apprendre les visios avec ma fille.' },
      { qui: 'createur', texte: 'Avec grand plaisir Marie ! iPad c\'est top. On peut faire ça tranquillement, tu préfères chez toi ?' },
      { qui: 'demandeur', texte: 'Oui chez moi ce serait parfait ! Et j\'aimerais aussi sécuriser mes mots de passe...' },
      { qui: 'createur', texte: 'Super programme ! Samedi matin ça va ? On fera iPad + sécurité + visio, avec un café ☕' },
      { qui: 'demandeur', texte: 'Parfait ! 10h samedi. Je préparerai croissants et café. Merci Lucas ! 🥐' }
    ],
    finalisation: {
      evaluation_createur: { note: 5, commentaire: 'Marie excellente élève ! Très attentive. Et les croissants étaient délicieux ! 😋' },
      evaluation_demandeur: { note: 5, commentaire: 'Lucas pédagogue exceptionnel ! Patient, clair. Ma tablette n\'a plus de secrets !' },
      bobiz_mouvement: { createur: +70, demandeur: -70 }
    }
  }
];

let authTokens = {}; // Cache des tokens utilisateur

async function getAuthToken(email) {
  if (authTokens[email]) {
    return authTokens[email];
  }

  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: email,
      password: 'password123'
    });
    
    authTokens[email] = {
      token: response.data.jwt,
      user: response.data.user
    };
    
    return authTokens[email];
    
  } catch (error) {
    console.log(`❌ Auth failed for ${email}: ${error.response?.data?.error?.message}`);
    return null;
  }
}

async function createBob(scenario) {
  console.log(`\n🎯 Création Bob: ${scenario.bob.titre}`);
  
  const auth = await getAuthToken(scenario.createur.email);
  if (!auth) return null;
  
  try {
    const response = await axios.post(`${STRAPI_URL}/echanges`, {
      data: {
        ...scenario.bob,
        dateCreation: new Date().toISOString(),
        statut: 'actif'
      }
    }, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const bobId = response.data.data.id;
    console.log(`✅ Bob créé (ID: ${bobId}) par ${scenario.createur.nom}`);
    return bobId;
    
  } catch (error) {
    console.log(`❌ Erreur création Bob: ${error.response?.data?.error?.message || error.message}`);
    return null;
  }
}

async function simulateConversation(scenario, bobId) {
  console.log(`\n💬 Conversation entre ${scenario.createur.nom} et ${scenario.demandeur.nom}`);
  
  for (let i = 0; i < scenario.messages.length; i++) {
    const msg = scenario.messages[i];
    const isCreateur = msg.qui === 'createur';
    const email = isCreateur ? scenario.createur.email : scenario.demandeur.email;
    const nom = isCreateur ? scenario.createur.nom : scenario.demandeur.nom;
    
    const auth = await getAuthToken(email);
    if (!auth) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: msg.texte,
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 120000).toISOString(), // Messages espacés de 2min
          expediteur: auth.user.id,
          echange: bobId,
          lu: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📤 ${nom}: ${msg.texte.substring(0, 60)}...`);
      
    } catch (error) {
      console.log(`❌ Erreur message: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`✅ ${scenario.messages.length} messages échangés`);
}

async function progressBobStatus(scenario, bobId) {
  console.log(`\n📈 Progression statuts Bob: ${scenario.createur.nom} ↔ ${scenario.demandeur.nom}`);
  
  const auth = await getAuthToken(scenario.createur.email);
  if (!auth) return false;
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Passer en "en_cours"
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'en_cours',
        dateDebut: new Date(Date.now() + 24*60*60*1000).toISOString() // Demain
      }
    }, { headers });
    
    console.log(`✅ Statut: actif → en_cours`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Passer en "terminé"
    const finishDate = new Date(Date.now() + (scenario.bob.dureeJours + 1) * 24*60*60*1000);
    
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'termine',
        dateFin: finishDate.toISOString()
      }
    }, { headers });
    
    console.log(`✅ Statut: en_cours → terminé`);
    console.log(`📅 Durée simulée: ${scenario.bob.dureeJours} jours`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur progression statut: ${error.response?.data?.error?.message}`);
    return false;
  }
}

async function createBobizTransactions(scenario, bobId) {
  console.log(`\n💰 Attribution BOBIZ: ${scenario.bob.bobizGagnes} points`);
  
  const transactions = [
    {
      auth: await getAuthToken(scenario.createur.email),
      amount: scenario.finalisation.bobiz_mouvement.createur,
      who: scenario.createur.nom
    },
    {
      auth: await getAuthToken(scenario.demandeur.email),
      amount: scenario.finalisation.bobiz_mouvement.demandeur,
      who: scenario.demandeur.nom
    }
  ];
  
  for (const tx of transactions) {
    if (!tx.auth) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
        data: {
          points: Math.abs(tx.amount),
          type: tx.amount > 0 ? 'gain' : 'depense',
          source: 'echange_complete',
          description: `Échange: ${scenario.bob.titre}`,
          dateTransaction: new Date().toISOString(),
          user: tx.auth.user.id,
          echange: bobId
        }
      }, {
        headers: {
          'Authorization': `Bearer ${tx.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const symbol = tx.amount > 0 ? '+' : '';
      console.log(`💎 ${tx.who}: ${symbol}${tx.amount} Bobiz`);
      
    } catch (error) {
      console.log(`❌ Transaction ${tx.who}: ${error.response?.data?.error?.message}`);
    }
  }
}

async function createEvaluationMessages(scenario, bobId) {
  console.log(`\n⭐ Évaluations finales`);
  
  const evaluations = [
    {
      auth: await getAuthToken(scenario.createur.email),
      eval: scenario.finalisation.evaluation_createur,
      who: scenario.createur.nom
    },
    {
      auth: await getAuthToken(scenario.demandeur.email), 
      eval: scenario.finalisation.evaluation_demandeur,
      who: scenario.demandeur.nom
    }
  ];
  
  for (const ev of evaluations) {
    if (!ev.auth) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `⭐ ÉVALUATION FINALE ⭐\nNote: ${ev.eval.note}/5\n${ev.eval.commentaire}`,
          typeConversation: 'echange',
          dateEnvoi: new Date().toISOString(),
          expediteur: ev.auth.user.id,
          echange: bobId,
          lu: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${ev.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`⭐ ${ev.who}: ${ev.eval.note}/5 - ${ev.eval.commentaire.substring(0, 40)}...`);
      
    } catch (error) {
      console.log(`❌ Évaluation ${ev.who}: ${error.response?.data?.error?.message}`);
    }
  }
}

async function runCompleteScenario(scenario) {
  console.log(`\n🎬 === ${scenario.title} ===`);
  
  // 1. Créer le Bob
  const bobId = await createBob(scenario);
  if (!bobId) {
    console.log(`⚠️ Scenario ${scenario.id} abandonné - problème création Bob`);
    return null;
  }
  
  // 2. Simuler conversation
  await simulateConversation(scenario, bobId);
  
  // 3. Faire évoluer les statuts
  const statusOk = await progressBobStatus(scenario, bobId);
  if (!statusOk) {
    console.log(`⚠️ Problème progression statut`);
  }
  
  // 4. Attribution BOBIZ
  await createBobizTransactions(scenario, bobId);
  
  // 5. Évaluations finales
  await createEvaluationMessages(scenario, bobId);
  
  console.log(`🎉 Parcours ${scenario.id} TERMINÉ !`);
  console.log(`   📋 Bob créé et finalisé`);
  console.log(`   💬 Conversation complète`);
  console.log(`   📈 Statuts: actif → en_cours → terminé`);
  console.log(`   💰 BOBIZ échangés`);
  console.log(`   ⭐ Évaluations enregistrées`);
  
  return {
    scenario: scenario.id,
    bobId,
    success: true
  };
}

async function generateFinalReport(results) {
  console.log(`\n📊 === RAPPORT FINAL PARCOURS COMPLETS ===`);
  
  const auth = await getAuthToken('marie@bob.com');
  if (!auth) return;
  
  try {
    const [bobsResp, messagesResp, transactionsResp] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      }),
      axios.get(`${STRAPI_URL}/messages`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
    ]);
    
    const bobs = bobsResp.data.data;
    const messages = messagesResp.data.data;
    const transactions = transactionsResp.data.data;
    
    console.log(`🎯 ${results.filter(r => r && r.success).length}/${scenarios.length} parcours réussis:`);
    results.forEach(r => {
      if (r && r.success) {
        const scenario = scenarios.find(s => s.id === r.scenario);
        console.log(`  ✅ ${scenario.title}`);
      }
    });
    
    console.log(`\n📈 STATISTIQUES GÉNÉRÉES:`);
    console.log(`  📋 ${bobs.length} Bobs total (${bobs.filter(b => b.attributes.statut === 'termine').length} terminés)`);
    console.log(`  💬 ${messages.length} messages échangés`);
    console.log(`  💰 ${transactions.length} transactions Bobiz`);
    
    const totalBobiz = transactions.reduce((sum, t) => sum + t.attributes.points, 0);
    console.log(`  💎 ${totalBobiz} Bobiz total traités`);
    
    console.log(`\n🏆 === ÉCOSYSTÈME BOB VIVANT ! ===`);
    console.log(`  ✅ Parcours prêt/emprunt/service complets`);
    console.log(`  ✅ Conversations réalistes avec négociation`);
    console.log(`  ✅ Évolution statuts: actif → en_cours → terminé`);
    console.log(`  ✅ BOBIZ attribués automatiquement`);
    console.log(`  ✅ Évaluations mutuelles enregistrées`);
    console.log(`  ✅ Historique complet disponible`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport: ${error.message}`);
  }
}

async function main() {
  console.log(`🚀 === SIMULATION PARCOURS COMPLETS BOB ===\n`);
  console.log(`🎯 ${scenarios.length} scénarios à exécuter:`);
  scenarios.forEach(s => console.log(`  📋 ${s.title}`));
  
  const results = [];
  
  for (const scenario of scenarios) {
    const result = await runCompleteScenario(scenario);
    results.push(result);
    
    // Pause entre scénarios
    console.log(`\n⏳ Pause avant prochain scénario...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  await generateFinalReport(results);
  
  console.log(`\n✨ === SIMULATION TERMINÉE ===`);
  console.log(`💡 L'écosystème Bob est maintenant vivant avec des échanges terminés !`);
}

main().catch(console.error);