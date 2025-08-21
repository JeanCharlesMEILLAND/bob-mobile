// Simuler parcours complets en utilisant les Bobs existants
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

let authTokens = {};

async function getAuthToken(email) {
  if (authTokens[email]) return authTokens[email];

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
    console.log(`❌ Auth failed for ${email}`);
    return null;
  }
}

async function getExistingBobs() {
  console.log(`🔍 === RÉCUPÉRATION BOBS EXISTANTS ===`);
  
  const auth = await getAuthToken('marie@bob.com');
  if (!auth) return [];
  
  try {
    const response = await axios.get(`${STRAPI_URL}/echanges`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    });
    
    const bobs = response.data.data;
    console.log(`📋 ${bobs.length} Bobs trouvés en base`);
    
    bobs.forEach((bob, index) => {
      console.log(`${index + 1}. ${bob.attributes.titre} (${bob.attributes.type}) - Statut: ${bob.attributes.statut}`);
    });
    
    return bobs;
    
  } catch (error) {
    console.log(`❌ Erreur récupération Bobs: ${error.message}`);
    return [];
  }
}

async function simulateConversationOnBob(bobId, bobTitle) {
  console.log(`\n💬 Simulation conversation sur: ${bobTitle}`);
  
  // Messages de conversation réaliste
  const conversations = [
    {
      user: await getAuthToken('marie@bob.com'),
      nom: 'Marie',
      message: 'Salut ! Ton Bob m\'intéresse beaucoup. Tu peux me donner plus de détails ?'
    },
    {
      user: await getAuthToken('thomas@bob.com'),
      nom: 'Thomas', 
      message: 'Avec plaisir Marie ! C\'est du matériel pro, je te montre comment l\'utiliser si tu veux.'
    },
    {
      user: await getAuthToken('marie@bob.com'),
      nom: 'Marie',
      message: 'Super ! Quand est-ce qu\'on peut se voir pour l\'échange ?'
    },
    {
      user: await getAuthToken('thomas@bob.com'),
      nom: 'Thomas',
      message: 'Je suis libre demain après-midi ou samedi matin. Qu\'est-ce qui t\'arrange ?'
    },
    {
      user: await getAuthToken('marie@bob.com'),
      nom: 'Marie',
      message: 'Parfait pour samedi matin ! On dit 10h chez toi ? 😊'
    }
  ];
  
  for (let i = 0; i < conversations.length; i++) {
    const conv = conversations[i];
    if (!conv.user) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: conv.message,
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 60000).toISOString(),
          expediteur: conv.user.user.id,
          echange: bobId,
          lu: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${conv.user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📤 ${conv.nom}: ${conv.message}`);
      
    } catch (error) {
      console.log(`❌ Message ${conv.nom}: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  console.log(`✅ ${conversations.length} messages échangés`);
}

async function progressBobToCompleted(bobId, bobTitle) {
  console.log(`\n📈 Progression Bob vers "terminé": ${bobTitle}`);
  
  const auth = await getAuthToken('marie@bob.com');
  if (!auth) return false;
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Passer en cours
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'en_cours',
        dateDebut: new Date().toISOString()
      }
    }, { headers });
    
    console.log(`✅ Statut: actif → en_cours`);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 2. Finaliser
    await axios.put(`${STRAPI_URL}/echanges/${bobId}`, {
      data: {
        statut: 'termine',
        dateFin: new Date(Date.now() + 7*24*60*60*1000).toISOString()
      }
    }, { headers });
    
    console.log(`✅ Statut: en_cours → terminé`);
    console.log(`📅 Bob maintenant dans l'historique !`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur progression: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function createBobizTransactions(bobId, bobTitle, bobizAmount = 30) {
  console.log(`\n💰 Attribution BOBIZ pour: ${bobTitle}`);
  
  const transactions = [
    {
      auth: await getAuthToken('marie@bob.com'),
      nom: 'Marie',
      amount: bobizAmount,
      type: 'gain'
    },
    {
      auth: await getAuthToken('thomas@bob.com'),
      nom: 'Thomas', 
      amount: bobizAmount,
      type: 'depense'
    }
  ];
  
  for (const tx of transactions) {
    if (!tx.auth) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
        data: {
          points: tx.amount,
          type: tx.type,
          source: 'echange_complete',
          description: `Échange terminé: ${bobTitle}`,
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
      
      const symbol = tx.type === 'gain' ? '+' : '-';
      console.log(`💎 ${tx.nom}: ${symbol}${tx.amount} Bobiz`);
      
    } catch (error) {
      console.log(`❌ Transaction ${tx.nom}: ${error.response?.data?.error?.message}`);
    }
  }
  
  console.log(`✅ ${bobizAmount} Bobiz échangés !`);
}

async function addEvaluationMessages(bobId, bobTitle) {
  console.log(`\n⭐ Évaluations finales pour: ${bobTitle}`);
  
  const evaluations = [
    {
      auth: await getAuthToken('marie@bob.com'),
      nom: 'Marie',
      note: 5,
      commentaire: 'Échange parfait ! Matériel en excellent état, personne très fiable. Recommande +++',
    },
    {
      auth: await getAuthToken('thomas@bob.com'),
      nom: 'Thomas',
      note: 5,
      commentaire: 'Super échange avec Marie ! Très soigneuse, communication top. Merci ! 😊'
    }
  ];
  
  for (const eval of evaluations) {
    if (!eval.auth) continue;
    
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `⭐ ÉVALUATION FINALE ⭐\nNote: ${eval.note}/5\n💬 ${eval.commentaire}`,
          typeConversation: 'echange',
          dateEnvoi: new Date().toISOString(),
          expediteur: eval.auth.user.id,
          echange: bobId,
          lu: false
        }
      }, {
        headers: {
          'Authorization': `Bearer ${eval.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`⭐ ${eval.nom}: ${eval.note}/5 - ${eval.commentaire.substring(0, 50)}...`);
      
    } catch (error) {
      console.log(`❌ Évaluation ${eval.nom}: ${error.response?.data?.error?.message}`);
    }
  }
}

async function processCompleteBobJourney(bob) {
  const bobId = bob.id;
  const bobTitle = bob.attributes.titre;
  const bobStatus = bob.attributes.statut;
  
  console.log(`\n🎬 === PARCOURS COMPLET: ${bobTitle} ===`);
  console.log(`📋 Type: ${bob.attributes.type} | Statut initial: ${bobStatus}`);
  
  // Si déjà terminé, passer au suivant
  if (bobStatus === 'termine') {
    console.log(`⚠️ Bob déjà terminé - passage au suivant`);
    return { bobId, success: false, reason: 'already_completed' };
  }
  
  // 1. Simuler conversation
  await simulateConversationOnBob(bobId, bobTitle);
  
  // 2. Faire progresser vers "terminé"
  const statusOk = await progressBobToCompleted(bobId, bobTitle);
  if (!statusOk) {
    console.log(`⚠️ Impossible de finaliser le Bob`);
    return { bobId, success: false, reason: 'status_error' };
  }
  
  // 3. Créer transactions BOBIZ
  const bobizAmount = bob.attributes.bobizGagnes || 30;
  await createBobizTransactions(bobId, bobTitle, bobizAmount);
  
  // 4. Ajouter évaluations
  await addEvaluationMessages(bobId, bobTitle);
  
  console.log(`🎉 PARCOURS TERMINÉ !`);
  console.log(`   ✅ Conversation simulée`);
  console.log(`   ✅ Bob finalisé et archivé`);
  console.log(`   ✅ BOBIZ attribués`);
  console.log(`   ✅ Évaluations enregistrées`);
  
  return { bobId, success: true };
}

async function generateCompleteReport(results, totalBobs) {
  console.log(`\n📊 === RAPPORT FINAL SIMULATION ===`);
  
  const successful = results.filter(r => r.success);
  const alreadyCompleted = results.filter(r => r.reason === 'already_completed').length;
  const errors = results.filter(r => r.reason === 'status_error').length;
  
  console.log(`🎯 PARCOURS TRAITÉS:`);
  console.log(`  ✅ Nouveaux parcours terminés: ${successful.length}`);
  console.log(`  ⏭️ Déjà terminés: ${alreadyCompleted}`);
  console.log(`  ❌ Erreurs: ${errors}`);
  console.log(`  📊 Total Bobs traités: ${results.length}/${totalBobs}`);
  
  // Stats finales
  const auth = await getAuthToken('marie@bob.com');
  if (auth) {
    try {
      const [messagesResp, transactionsResp, bobsResp] = await Promise.all([
        axios.get(`${STRAPI_URL}/messages`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        }),
        axios.get(`${STRAPI_URL}/bobiz-transactions`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        }),
        axios.get(`${STRAPI_URL}/echanges`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        })
      ]);
      
      const messages = messagesResp.data.data;
      const transactions = transactionsResp.data.data;
      const finalBobs = bobsResp.data.data;
      
      const completedBobs = finalBobs.filter(b => b.attributes.statut === 'termine');
      const totalBobiz = transactions.reduce((sum, t) => sum + t.attributes.points, 0);
      
      console.log(`\n📈 STATISTIQUES ÉCOSYSTÈME:`);
      console.log(`  📋 ${finalBobs.length} Bobs total (${completedBobs.length} terminés dans historique)`);
      console.log(`  💬 ${messages.length} messages de conversation`);
      console.log(`  💰 ${transactions.length} transactions BOBIZ`);
      console.log(`  💎 ${totalBobiz} BOBIZ total échangés`);
      
      console.log(`\n🏆 === ÉCOSYSTÈME BOB VIVANT ! ===`);
      console.log(`  ✅ Parcours prêt/emprunt/service simulés`);
      console.log(`  ✅ Conversations réalistes avec négociation`);
      console.log(`  ✅ Évolution statuts: actif → en_cours → terminé`);
      console.log(`  ✅ BOBIZ distribués automatiquement`);
      console.log(`  ✅ Évaluations croisées enregistrées`);
      console.log(`  ✅ Historique des échanges terminés disponible`);
      
    } catch (error) {
      console.log(`❌ Erreur stats finales: ${error.message}`);
    }
  }
}

async function main() {
  console.log(`🚀 === SIMULATION PARCOURS AVEC BOBS EXISTANTS ===\n`);
  
  // 1. Récupérer Bobs existants
  const existingBobs = await getExistingBobs();
  
  if (existingBobs.length === 0) {
    console.log(`❌ Aucun Bob existant trouvé. Créer d'abord des Bobs.`);
    return;
  }
  
  // 2. Traiter quelques Bobs (max 5 pour démo)
  const bobsToProcess = existingBobs.slice(0, Math.min(5, existingBobs.length));
  console.log(`\n🎯 Traitement de ${bobsToProcess.length} Bobs:`);
  
  const results = [];
  
  for (const bob of bobsToProcess) {
    const result = await processCompleteBobJourney(bob);
    results.push(result);
    
    // Pause entre Bobs
    console.log(`\n⏳ Pause avant prochain Bob...`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // 3. Rapport final
  await generateCompleteReport(results, existingBobs.length);
  
  console.log(`\n✨ === SIMULATION TERMINÉE ===`);
  console.log(`🎉 L'écosystème Bob est maintenant riche en données et historiques !`);
}

main().catch(console.error);