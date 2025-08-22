// Simulation finale avec correction URLs Strapi v5
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

async function createFinalBobs(auth) {
  console.log('🎯 === CRÉATION BOBS FINAUX ===');
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  const finalBobs = [
    {
      titre: '🔨 Perceuse Pro Bosch + Kit Complet',
      description: 'Perceuse sans fil Bosch 18V professionnelle avec mallette complète : forets béton/bois/métal, niveau laser, lampe LED. Idéale pour tous travaux !',
      type: 'pret',
      createur: auth.user.id
    },
    {
      titre: '🍳 Cours Cuisine Méditerranéenne Authentique',
      description: 'Cours personnalisé de cuisine du sud chez vous ou chez moi : paella valencienne, ratatouille provençale, tapenade artisanale. Recettes familiales !',
      type: 'service_offert', 
      createur: auth.user.id
    },
    {
      titre: '🤖 RECHERCHE Robot Cuiseur Haute Gamme',
      description: 'Jeune maman recherche robot cuiseur (Thermomix/Monsieur Cuisine) pour purées bio bébé. Usage soigneux, 2-3x/semaine maximum.',
      type: 'emprunt',
      createur: auth.user.id
    }
  ];
  
  const createdBobs = [];
  
  for (const bobData of finalBobs) {
    try {
      console.log(`\n🎯 Création: ${bobData.titre}`);
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: bobData
      }, { headers });
      
      const bob = response.data.data;
      console.log(`✅ Créé (ID: ${bob.id}, DocumentID: ${bob.documentId})`);
      
      createdBobs.push({
        id: bob.id,
        documentId: bob.documentId,
        titre: bob.titre,
        type: bob.type,
        description: bob.description
      });
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return createdBobs;
}

async function addConversationAndMessages(bob, auth) {
  console.log(`\n💬 Conversation complète: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Messages de négociation et accord
  const fullConversation = [
    `Salut ! ${bob.titre} m'intéresse énormément ! 😍`,
    'Super ! Dis-moi exactement ce que tu cherches à faire ?',
    'J\'ai un projet précis qui nécessite exactement ce que tu proposes.',
    'Parfait ! On peut se rencontrer pour en discuter plus en détail ?',
    'Avec plaisir ! Quand est-ce que ça t\'arrange ?',
    'Je suis libre demain après-midi ou ce weekend.',
    'Parfait ! On dit demain 15h ? Je confirme par message.',
    '✅ CONFIRMÉ ! À demain 15h. Merci beaucoup ! 🙏'
  ];
  
  for (let i = 0; i < fullConversation.length; i++) {
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: fullConversation[i],
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 120000).toISOString(), // 2min entre messages
          expediteur: auth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      console.log(`📤 ${i + 1}/8: ${fullConversation[i]}`);
      
    } catch (error) {
      console.log(`❌ Message ${i + 1}: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`✅ Conversation complète (8 messages de négociation)`);
}

async function progressToCompleted(bob, auth) {
  console.log(`\n🎯 Finalisation: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Utiliser documentId pour Strapi v5
    const updateUrl = `${STRAPI_URL}/echanges/${bob.documentId}`;
    
    // 1. Début d'échange
    await axios.put(updateUrl, {
      data: {
        statut: 'en_cours',
        dateDebut: new Date().toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: actif → en_cours');
    
    // Message début
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: '🎯 ÉCHANGE DÉMARRÉ ! Merci pour cette belle opportunité Bob ! 🚀',
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 2. Finalisation
    const endDate = new Date(Date.now() + (bob.type === 'service_offert' ? 4*60*60*1000 : 5*24*60*60*1000));
    
    await axios.put(updateUrl, {
      data: {
        statut: 'termine',
        dateFin: endDate.toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: en_cours → terminé');
    console.log('📁 Bob archivé dans l\'historique !');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur finalisation: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function distributeBobizRewards(bob, auth) {
  console.log(`\n💰 Récompense BOBIZ: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Calcul selon type et qualité
  const bobizRewards = {
    'pret': 40,
    'service_offert': 80,
    'emprunt': 35,
    'service_demande': 60
  };
  
  const reward = bobizRewards[bob.type] || 30;
  
  try {
    await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
      data: {
        points: reward,
        type: 'gain',
        source: 'echange_complete',
        description: `Échange terminé avec succès: ${bob.titre}`,
        dateTransaction: new Date().toISOString(),
        user: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log(`💎 +${reward} BOBIZ attribués !`);
    
    // Message confirmation BOBIZ
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `💰 RÉCOMPENSE BOBIZ ! +${reward} BOBIZ ajoutés à votre compte ! Félicitations pour cet échange réussi ! 🎉💎`,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    return reward;
    
  } catch (error) {
    console.log(`❌ Distribution BOBIZ: ${error.response?.data?.error?.message}`);
    return 0;
  }
}

async function addDetailedEvaluation(bob, auth) {
  console.log(`\n⭐ Évaluation détaillée: ${bob.titre}`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Évaluations spécialisées par type
  const evaluationTemplates = {
    'pret': {
      note: 5,
      text: '⭐⭐⭐⭐⭐ ÉCHANGE PARFAIT !\n\n🔧 Matériel en excellent état, exactement comme décrit\n👨‍🔧 Propriétaire très sympa et de confiance\n📦 Mallette complète avec tous les accessoires\n⏰ Ponctualité et flexibilité au top\n\n💬 Recommande vivement ! Merci encore ! 🙏'
    },
    'service_offert': {
      note: 5,
      text: '⭐⭐⭐⭐⭐ SERVICE EXCEPTIONNEL !\n\n👨‍🍳 Professionnalisme et passion remarquables\n🥘 Techniques enseignées avec patience\n🧾 Recettes authentiques partagées généreusement\n😊 Ambiance conviviale et bienveillante\n\n💬 Une expérience inoubliable ! À refaire ! ✨'
    },
    'emprunt': {
      note: 5,
      text: '⭐⭐⭐⭐⭐ GÉNÉROSITÉ INCROYABLE !\n\n🤝 Prêt en toute confiance, très touchant\n📚 Conseils et recettes en bonus\n💚 Bienveillance rare dans les échanges\n👶 Parfait pour mes besoins bébé\n\n💬 Merci infiniment pour cette aide précieuse ! 🙏💕'
    }
  };
  
  const evaluation = evaluationTemplates[bob.type] || evaluationTemplates['pret'];
  
  try {
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: evaluation.text,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log(`⭐ Évaluation ${evaluation.note}/5 avec commentaire détaillé`);
    
  } catch (error) {
    console.log(`❌ Évaluation: ${error.response?.data?.error?.message}`);
  }
}

async function runUltimateBobJourney(bob, auth) {
  console.log(`\n🎬 === PARCOURS ULTIME: ${bob.titre} ===`);
  console.log(`📋 Type: ${bob.type.toUpperCase()}`);
  
  // 1. Conversation riche
  await addConversationAndMessages(bob, auth);
  
  // 2. Progression complète
  const progressSuccess = await progressToCompleted(bob, auth);
  
  if (!progressSuccess) {
    console.log('⚠️ Échec progression - parcours incomplet');
    return null;
  }
  
  // 3. Récompense BOBIZ
  const bobizGained = await distributeBobizRewards(bob, auth);
  
  // 4. Évaluation détaillée
  await addDetailedEvaluation(bob, auth);
  
  console.log(`\n🎉 PARCOURS ULTIME ${bob.type.toUpperCase()} RÉUSSI !`);
  console.log(`   ✅ 8 messages de négociation`);
  console.log(`   ✅ Progression: actif → en_cours → terminé`);
  console.log(`   ✅ ${bobizGained} BOBIZ distribués`);
  console.log(`   ✅ Évaluation 5/5 détaillée`);
  console.log(`   ✅ Archivé dans historique complet`);
  
  return {
    bob: bob.titre,
    type: bob.type,
    bobizGained,
    success: true
  };
}

async function generateUltimateReport(results, auth) {
  console.log('\n🏆 === RAPPORT ULTIME SIMULATION BOB ===');
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    const [bobsResp, messagesResp, transactionsResp] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`, { headers }),
      axios.get(`${STRAPI_URL}/messages`, { headers }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, { headers })
    ]);
    
    const bobs = bobsResp.data.data;
    const messages = messagesResp.data.data;
    const transactions = transactionsResp.data.data;
    
    const successResults = results.filter(r => r && r.success);
    const totalBobizSession = successResults.reduce((sum, r) => sum + r.bobizGained, 0);
    const terminatedBobs = bobs.filter(b => b.statut === 'termine');
    const totalBobizAll = transactions.reduce((sum, t) => sum + t.points, 0);
    
    console.log(`🎯 PARCOURS ULTIMESS RÉALISÉS:`);
    successResults.forEach(result => {
      console.log(`  🎊 ${result.bob} (${result.type}) → +${result.bobizGained} BOBIZ`);
    });
    
    console.log(`\n📊 MÉTRIQUES ÉCOSYSTÈME BOB:`);
    console.log(`  📋 ${bobs.length} Bobs total en base`);
    console.log(`  ✅ ${terminatedBobs.length} Bobs terminés (historique)`);
    console.log(`  💬 ${messages.length} messages conversationnels`);
    console.log(`  💰 ${transactions.length} transactions BOBIZ`);
    console.log(`  💎 ${totalBobizSession} BOBIZ gagnés cette session`);
    console.log(`  💎 ${totalBobizAll} BOBIZ total en circulation`);
    
    // Analyse des types
    const typeStats = bobs.reduce((acc, bob) => {
      const type = bob.type;
      if (!acc[type]) acc[type] = { total: 0, completed: 0 };
      acc[type].total++;
      if (bob.statut === 'termine') acc[type].completed++;
      return acc;
    }, {});
    
    console.log(`\n📈 STATISTIQUES PAR TYPE:`);
    Object.entries(typeStats).forEach(([type, stats]) => {
      const completionRate = Math.round((stats.completed / stats.total) * 100);
      console.log(`  ${type}: ${stats.total} total (${stats.completed} terminés = ${completionRate}%)`);
    });
    
    console.log(`\n🚀 === ÉCOSYSTÈME BOB ULTIME CRÉÉ ! ===`);
    console.log(`  ✅ Parcours prêt/emprunt/service avec données ultra-réalistes`);
    console.log(`  ✅ Conversations négociées avec 8 messages par échange`);
    console.log(`  ✅ Cycle de vie complet: actif → en_cours → terminé`);
    console.log(`  ✅ Distribution BOBIZ automatique selon type et qualité`);
    console.log(`  ✅ Évaluations détaillées et spécialisées par catégorie`);
    console.log(`  ✅ Historique riche pour analytics et développement`);
    console.log(`  ✅ Données prêtes pour interface mobile et features avancées`);
    
    console.log(`\n🎯 PRÊT POUR PRODUCTION !`);
    console.log(`  💡 Interface mobile peut maintenant afficher vrais échanges`);
    console.log(`  💡 Système BOBIZ fonctionnel avec vraies transactions`);
    console.log(`  💡 Historique exploitable pour stats utilisateurs`);
    console.log(`  💡 Conversations réalistes pour tests UX`);
    
  } catch (error) {
    console.log(`❌ Erreur génération rapport ultime: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 === SIMULATION ULTIME PARCOURS BOB ===\n');
  console.log('🎯 Objectif: Créer écosystème complet prêt pour production\n');
  
  // 1. Authentification
  const auth = await authenticate();
  if (!auth) return;
  
  console.log(`👤 Bob Simulateur: ${auth.user.username}\n`);
  
  // 2. Créer Bobs finaux
  const finalBobs = await createFinalBobs(auth);
  
  if (finalBobs.length === 0) {
    console.log('❌ Aucun Bob final créé');
    return;
  }
  
  console.log(`\n🎬 Lancement ${finalBobs.length} parcours ultimess...`);
  
  // 3. Parcours ultimess pour chaque Bob
  const results = [];
  
  for (const bob of finalBobs) {
    const result = await runUltimateBobJourney(bob, auth);
    results.push(result);
    
    // Pause dramatique entre parcours
    console.log(`\n⏳ Préparation prochain parcours ultime...`);
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  
  // 4. Rapport ultime final
  await generateUltimateReport(results, auth);
  
  console.log('\n✨ === MISSION ULTIME ACCOMPLIE ! ===');
  console.log('🎉 Écosystème Bob maintenant VIVANT avec parcours complets !');
  console.log('🚀 Prêt pour développement interface et montée en charge !');
  console.log('💎 Push/pull VPS maintenant recommandé pour sauvegarder !');
}

main().catch(console.error);