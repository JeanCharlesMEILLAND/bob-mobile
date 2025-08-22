// Simulation fonctionnelle avec structure validée
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function authenticate() {
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'marie@bob.com',
      password: 'password123'
    });
    
    return {
      token: response.data.jwt,
      user: response.data.user
    };
  } catch (error) {
    console.log('❌ Erreur auth');
    return null;
  }
}

async function createWorkingBobs(auth) {
  console.log('🎯 === CRÉATION BOBS STRUCTURE FONCTIONNELLE ===');
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Structure qui fonctionne (validée par le test précédent)
  const workingBobs = [
    {
      titre: 'Perceuse Bosch Pro + Mallette',
      description: 'Perceuse sans fil professionnelle 18V avec mallette complète : forets béton, bois, métal, niveau laser intégré. Parfaite pour tous travaux de bricolage et rénovation.',
      type: 'pret',
      createur: auth.user.id
    },
    {
      titre: 'Cours cuisine méditerranéenne', 
      description: 'Cours personnalisés de cuisine du sud : paella authentique, ratatouille provençale, tapenade maison. Recettes traditionnelles et dégustation incluses !',
      type: 'service_offert',
      createur: auth.user.id
    },
    {
      titre: 'RECHERCHE Robot cuiseur Thermomix',
      description: 'Jeune maman recherche robot cuiseur pour préparer purées bio pour bébé 6 mois. Usage ponctuel 2-3 fois par semaine. Très respectueuse du matériel !',
      type: 'emprunt',
      createur: auth.user.id
    },
    {
      titre: 'Formation informatique seniors',
      description: 'Accompagnement personnalisé pour seniors : configuration tablette/smartphone, sécurité internet, visioconférences famille. Patience et pédagogie assurées.',
      type: 'service_offert',
      createur: auth.user.id
    }
  ];
  
  const createdBobs = [];
  
  for (const bobData of workingBobs) {
    try {
      console.log(`\n🎯 Création: ${bobData.titre}`);
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: bobData
      }, { headers });
      
      const bob = response.data.data;
      console.log(`✅ Créé (ID: ${bob.id})`);
      
      createdBobs.push({
        id: bob.id,
        titre: bob.titre,
        type: bob.type,
        description: bob.description
      });
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n✅ ${createdBobs.length} Bobs créés avec succès !`);
  return createdBobs;
}

async function simulateRichConversation(bob, auth) {
  console.log(`\n💬 Conversation riche pour: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Conversations adaptées au type de Bob
  const conversations = {
    'pret': [
      'Salut ! Ta perceuse m\'intéresse beaucoup, j\'ai du béton à percer pour fixer une grande étagère.',
      'Super ! Elle est parfaite pour ça. Tu peux passer la récupérer quand ?',
      'Génial ! Je peux passer demain matin vers 10h si ça te convient ?',
      'Parfait ! RDV devant chez moi. Je te montrerai les différents forets et le mode percussion 👍',
      'Top ! Merci beaucoup, tu me sauves vraiment la mise ! 🙏'
    ],
    'service_offert': [
      'Salut ! Tes cours de cuisine m\'intéressent énormément ! Tu fais vraiment de la paella authentique ?',
      'Oui ! Recette familiale de ma grand-mère valencienne 😊 Tu préfères chez toi ou chez moi ?',
      'Chez moi ce serait parfait ! J\'ai une grande cuisine. Tu apportes tout ?',
      'Oui, tous les ingrédients frais + le matériel spécialisé. On dit samedi 14h ?',
      'Parfait ! J\'ai hâte de découvrir tes secrets de cuisine ! 🥘'
    ],
    'emprunt': [
      'Salut ! J\'ai vu que tu cherches un robot cuiseur. J\'ai un Thermomix TM6 qui traîne !',
      'Oh génial ! Tu es sûr ? C\'est un appareil super cher...',
      'Aucun souci, on se connaît ! Je te fais confiance. Tu veux des recettes spécial bébé aussi ?',
      'Tu es un ange ! Oui pour les recettes, surtout bio et adaptation 6 mois + 👶💚',
      'Parfait ! Je passe te l\'apporter demain avec le livre de recettes bio + mes conseils perso !'
    ]
  };
  
  const messageList = conversations[bob.type] || conversations['pret'];
  
  for (let i = 0; i < messageList.length; i++) {
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: messageList[i],
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 90000).toISOString(), // Messages espacés de 1min30
          expediteur: auth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      console.log(`📤 Message ${i + 1}: ${messageList[i]}`);
      
    } catch (error) {
      console.log(`❌ Message ${i + 1}: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log(`✅ ${messageList.length} messages de conversation`);
}

async function progressBobLifecycle(bob, auth) {
  console.log(`\n📈 Cycle de vie complet: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // 1. Acceptation et passage en cours
    console.log('⏳ Acceptation et début d\'échange...');
    
    await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
      data: {
        statut: 'en_cours',
        dateDebut: new Date().toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: actif → en_cours');
    
    // Message de confirmation début
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: '🎯 ÉCHANGE COMMENCÉ ! Merci encore pour cette belle opportunité Bob.',
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 2. Finalisation après "utilisation"
    console.log('🏁 Finalisation d\'échange...');
    
    const endDate = new Date(Date.now() + (bob.type === 'service_offert' ? 3*60*60*1000 : 7*24*60*60*1000));
    
    await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
      data: {
        statut: 'termine',
        dateFin: endDate.toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: en_cours → terminé');
    console.log(`📅 Bob archivé dans l'historique`);
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur cycle de vie: ${error.response?.data?.error?.message}`);
    return false;
  }
}

async function distributeBobiz(bob, auth) {
  console.log(`\n💰 Distribution BOBIZ pour: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Calcul BOBIZ selon type et complexité
  const bobizMap = {
    'pret': 30,
    'emprunt': 40, 
    'service_offert': 70,
    'service_demande': 60
  };
  
  const bobizAmount = bobizMap[bob.type] || 25;
  
  try {
    await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
      data: {
        points: bobizAmount,
        type: 'gain',
        source: 'echange_complete',
        description: `Échange réussi: ${bob.titre}`,
        dateTransaction: new Date().toISOString(),
        user: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log(`💎 +${bobizAmount} BOBIZ attribués !`);
    
    // Message de confirmation BOBIZ
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `💰 BOBIZ GAGNÉS ! +${bobizAmount} BOBIZ ajoutés à votre compte pour cet échange réussi ! 🎉`,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    return bobizAmount;
    
  } catch (error) {
    console.log(`❌ Distribution BOBIZ: ${error.response?.data?.error?.message}`);
    return 0;
  }
}

async function addFinalEvaluation(bob, auth) {
  console.log(`\n⭐ Évaluation finale pour: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Évaluations adaptées au type
  const evaluations = {
    'pret': '⭐ ÉVALUATION 5/5 ⭐\nMatériel en parfait état, très bon échange ! La perceuse était exactement comme décrite. Propriétaire fiable et sympa. Recommande vivement ! 👍',
    'service_offert': '⭐ ÉVALUATION 5/5 ⭐\nCours exceptionnel ! Pédagogie parfaite, recettes délicieuses testées et approuvées. Une vraie passion transmise avec générosité ! 🍴✨',
    'emprunt': '⭐ ÉVALUATION 5/5 ⭐\nPersonne incroyablement généreuse ! Matériel prêté avec confiance + conseils bonus. Échange humain au top, merci infiniment ! 🤝💚'
  };
  
  const evaluationText = evaluations[bob.type] || evaluations['pret'];
  
  try {
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: evaluationText,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log('⭐ Évaluation 5/5 ajoutée avec commentaire personnalisé');
    
  } catch (error) {
    console.log(`❌ Évaluation: ${error.response?.data?.error?.message}`);
  }
}

async function runCompleteBobJourney(bob, auth) {
  console.log(`\n🎬 === PARCOURS COMPLET: ${bob.titre} ===`);
  console.log(`📋 Type: ${bob.type}`);
  
  // 1. Conversation riche et réaliste
  await simulateRichConversation(bob, auth);
  
  // 2. Cycle de vie complet
  const lifecycleSuccess = await progressBobLifecycle(bob, auth);
  
  if (!lifecycleSuccess) {
    console.log('⚠️ Problème cycle de vie - parcours incomplet');
    return false;
  }
  
  // 3. Distribution BOBIZ
  const bobizGained = await distributeBobiz(bob, auth);
  
  // 4. Évaluation finale
  await addFinalEvaluation(bob, auth);
  
  console.log(`🎉 PARCOURS ${bob.type.toUpperCase()} TERMINÉ !`);
  console.log(`   ✅ Conversation réaliste simulée`);
  console.log(`   ✅ Statuts: actif → en_cours → terminé`);
  console.log(`   ✅ ${bobizGained} BOBIZ distribués`);
  console.log(`   ✅ Évaluation 5/5 enregistrée`);
  console.log(`   ✅ Bob archivé dans historique`);
  
  return {
    success: true,
    bobizGained,
    type: bob.type
  };
}

async function generateComprehensiveReport(results, auth) {
  console.log('\n📊 === RAPPORT FINAL SIMULATION COMPLÈTE ===');
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    const [bobsResp, messagesResp, transactionsResp, groupsResp] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`, { headers }),
      axios.get(`${STRAPI_URL}/messages`, { headers }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, { headers }),
      axios.get(`${STRAPI_URL}/groupes`, { headers })
    ]);
    
    const bobs = bobsResp.data.data;
    const messages = messagesResp.data.data;
    const transactions = transactionsResp.data.data;
    const groups = groupsResp.data.data;
    
    const successfulResults = results.filter(r => r && r.success);
    const totalBobizDistributed = successfulResults.reduce((sum, r) => sum + r.bobizGained, 0);
    const terminatedBobs = bobs.filter(b => b.statut === 'termine');
    
    console.log(`🎯 PARCOURS SIMULÉS:`);
    console.log(`  ✅ ${successfulResults.length} parcours complets réussis`);
    
    successfulResults.forEach(result => {
      console.log(`    → ${result.type}: +${result.bobizGained} BOBIZ`);
    });
    
    console.log(`\n📈 STATISTIQUES ÉCOSYSTÈME:`);
    console.log(`  📋 ${bobs.length} Bobs total (${terminatedBobs.length} dans l'historique)`);
    console.log(`  💬 ${messages.length} messages de conversation`);
    console.log(`  💰 ${transactions.length} transactions BOBIZ`);
    console.log(`  🏷️ ${groups.length} groupes disponibles`);
    console.log(`  💎 ${totalBobizDistributed} BOBIZ distribués dans cette session`);
    
    // Analyser types de Bobs
    const bobTypes = bobs.reduce((acc, bob) => {
      acc[bob.type] = (acc[bob.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 RÉPARTITION TYPES BOBS:`);
    Object.entries(bobTypes).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} Bobs`);
    });
    
    console.log(`\n🏆 === ÉCOSYSTÈME BOB VIVANT CRÉÉ ! ===`);
    console.log(`  ✅ Parcours prêt/emprunt/service avec vraies données`);
    console.log(`  ✅ Conversations riches et contextuelles`);
    console.log(`  ✅ Évolution statuts complète: actif → en_cours → terminé`);
    console.log(`  ✅ BOBIZ distribués automatiquement par type`);
    console.log(`  ✅ Évaluations détaillées et personnalisées`);
    console.log(`  ✅ Historique des échanges terminés disponible`);
    console.log(`  ✅ Données réalistes pour tests et développement`);
    
  } catch (error) {
    console.log(`❌ Erreur génération rapport: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 === SIMULATION COMPLÈTE PARCOURS BOB ===\n');
  
  // 1. Authentification
  const auth = await authenticate();
  if (!auth) return;
  
  console.log(`👤 Utilisateur: ${auth.user.username}\n`);
  
  // 2. Créer Bobs avec structure fonctionnelle
  const createdBobs = await createWorkingBobs(auth);
  
  if (createdBobs.length === 0) {
    console.log('❌ Aucun Bob créé - arrêt simulation');
    return;
  }
  
  // 3. Simuler parcours complet pour chaque Bob
  console.log(`\n🎬 Simulation de ${createdBobs.length} parcours complets...`);
  
  const results = [];
  
  for (const bob of createdBobs) {
    const result = await runCompleteBobJourney(bob, auth);
    results.push(result);
    
    // Pause entre parcours
    console.log(`\n⏳ Pause avant prochain parcours...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 4. Rapport final complet
  await generateComprehensiveReport(results, auth);
  
  console.log('\n✨ === SIMULATION RÉUSSIE ! ===');
  console.log('🎉 Écosystème Bob maintenant riche en données et interactions complètes !');
  console.log('💡 Prêt pour développement interface et nouvelles fonctionnalités !');
}

main().catch(console.error);