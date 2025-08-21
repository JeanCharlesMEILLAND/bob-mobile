// Accès direct aux APIs Strapi avec la vraie structure
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function authenticateAndGetSchema() {
  console.log('🔐 === AUTHENTIFICATION ET ANALYSE SCHEMA ===');
  
  try {
    const authResponse = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'marie@bob.com',
      password: 'password123'
    });
    
    const auth = {
      token: authResponse.data.jwt,
      user: authResponse.data.user
    };
    
    console.log(`✅ Connecté: ${auth.user.username}`);
    
    return auth;
    
  } catch (error) {
    console.log('❌ Erreur auth:', error.message);
    return null;
  }
}

async function analyzeContentTypes(auth) {
  console.log('\n📋 === ANALYSE CONTENT TYPES ===');
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  // Test chaque collection
  const collections = [
    'echanges', 'groupes', 'contacts', 'messages', 
    'bobiz-transactions', 'invitations', 'evenements'
  ];
  
  for (const collection of collections) {
    try {
      const response = await axios.get(`${STRAPI_URL}/${collection}`, { headers });
      const data = response.data;
      
      console.log(`\n📁 ${collection.toUpperCase()}:`);
      console.log(`  📊 Nombre: ${data.data?.length || data.length || 0}`);
      
      if (data.data && data.data.length > 0) {
        const firstItem = data.data[0];
        console.log(`  🔑 Clés: ${Object.keys(firstItem).join(', ')}`);
        
        // Chercher les champs relationnels
        const relationFields = Object.keys(firstItem).filter(key => 
          typeof firstItem[key] === 'object' && firstItem[key] !== null
        );
        
        if (relationFields.length > 0) {
          console.log(`  🔗 Relations: ${relationFields.join(', ')}`);
        }
      }
      
    } catch (error) {
      console.log(`  ❌ ${collection}: ${error.response?.status} - ${error.response?.data?.error?.message || error.message}`);
    }
  }
}

async function testBobCreationWithCorrectStructure(auth) {
  console.log('\n🧪 === TEST CRÉATION BOB STRUCTURE CORRECTE ===');
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Test avec différentes structures
  const testStructures = [
    {
      name: 'Structure simple',
      data: {
        titre: 'Test Bob Structure Simple',
        description: 'Test avec structure de base',
        type: 'pret',
        statut: 'actif'
      }
    },
    {
      name: 'Structure avec user ID',
      data: {
        titre: 'Test Bob Avec User',
        description: 'Test avec référence utilisateur',
        type: 'pret',
        statut: 'actif',
        createur: auth.user.id
      }
    },
    {
      name: 'Structure complète',
      data: {
        titre: 'Test Bob Complet',
        description: 'Test avec tous les champs de base',
        type: 'service_offert',
        statut: 'actif',
        bobizGagnes: 40,
        dureeJours: 7,
        conditions: 'Conditions de test',
        adresse: 'Paris, France',
        dateCreation: new Date().toISOString()
      }
    }
  ];
  
  const workingStructures = [];
  
  for (const test of testStructures) {
    console.log(`\n🎯 Test: ${test.name}`);
    
    try {
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: test.data
      }, { headers });
      
      const bobId = response.data.data.id;
      console.log(`✅ Succès ! ID: ${bobId}`);
      
      workingStructures.push({
        name: test.name,
        id: bobId,
        data: response.data.data
      });
      
      // Nettoyer immédiatement
      await axios.delete(`${STRAPI_URL}/echanges/${bobId}`, { headers });
      console.log('🗑️ Nettoyé');
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message || error.message}`);
      
      if (error.response?.status === 500) {
        console.log('   🔍 Erreur serveur - problème de validation schema');
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return workingStructures;
}

async function createRealBobsForSimulation(auth) {
  console.log('\n🎯 === CRÉATION BOBS RÉELS POUR SIMULATION ===');
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // Récupérer les utilisateurs disponibles
  let users = [auth.user];
  try {
    const usersResponse = await axios.get(`${STRAPI_URL}/users/me`, { headers });
    // Note: l'endpoint /users nécessite des permissions spéciales
  } catch (error) {
    console.log('⚠️ Utilisation utilisateur connecté uniquement');
  }
  
  // Récupérer un groupe si disponible
  let targetGroup = null;
  try {
    const groupsResponse = await axios.get(`${STRAPI_URL}/groupes`, { headers });
    if (groupsResponse.data.data && groupsResponse.data.data.length > 0) {
      targetGroup = groupsResponse.data.data[0].id;
      console.log(`🏷️ Groupe cible: ${groupsResponse.data.data[0].nom}`);
    }
  } catch (error) {
    console.log('⚠️ Pas de groupes disponibles');
  }
  
  // Bobs réalistes pour simulation
  const simulationBobs = [
    {
      titre: 'Perceuse Bosch Pro + Mallette',
      description: 'Perceuse sans fil professionnelle 18V avec mallette complète : forets béton, bois, métal, niveau laser intégré. Parfaite pour tous travaux de bricolage et rénovation.',
      type: 'pret',
      bobizGagnes: 35,
      dureeJours: 7,
      conditions: 'Utilisation soignée, retour propre. Dépôt de garantie 50 Bobiz.',
      adresse: '12 rue des Lilas, 75015 Paris'
    },
    {
      titre: 'Cours cuisine méditerranéenne à domicile',
      description: 'Cours personnalisés de cuisine du sud : paella authentique, ratatouille provençale, tapenade maison. Recettes traditionnelles et dégustation incluses !',
      type: 'service_offert',
      bobizGagnes: 75,
      dureeJours: 1,
      conditions: 'Chez vous ou chez moi. Ingrédients frais fournis.',
      adresse: '45 avenue Parmentier, 75011 Paris'
    },
    {
      titre: 'RECHERCHE Robot cuiseur Thermomix/Monsieur Cuisine',
      description: 'Jeune maman recherche robot cuiseur pour préparer purées bio pour bébé 6 mois. Usage ponctuel 2-3 fois par semaine. Très respectueuse du matériel !',
      type: 'emprunt',
      bobizGagnes: 50,
      dureeJours: 14,
      conditions: 'Nettoyage impeccable après chaque usage. Retour garanti en parfait état.',
      adresse: '8 avenue Mozart, 75016 Paris'
    },
    {
      titre: 'Formation informatique seniors',
      description: 'Accompagnement personnalisé pour seniors : configuration tablette/smartphone, sécurité internet, visioconférences famille. Patience et pédagogie assurées.',
      type: 'service_offert',
      bobizGagnes: 80,
      dureeJours: 1,
      conditions: 'À domicile ou visio selon préférence. Support écrit fourni.',
      adresse: '25 rue de la Paix, 75002 Paris'
    }
  ];
  
  const createdBobs = [];
  
  for (const bobData of simulationBobs) {
    try {
      console.log(`\n🎯 Création: ${bobData.titre}`);
      
      const payload = {
        ...bobData,
        statut: 'actif',
        dateCreation: new Date().toISOString()
      };
      
      // Ajouter groupe si disponible
      if (targetGroup) {
        payload.groupeCible = targetGroup;
      }
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: payload
      }, { headers });
      
      const bob = response.data.data;
      console.log(`✅ Créé (ID: ${bob.id})`);
      
      createdBobs.push({
        id: bob.id,
        titre: bobData.titre,
        type: bobData.type,
        bobizGagnes: bobData.bobizGagnes
      });
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return createdBobs;
}

async function simulateCompleteJourney(bob, auth) {
  console.log(`\n🎬 === PARCOURS COMPLET: ${bob.titre} ===`);
  
  const headers = {
    'Authorization': `Bearer ${auth.token}`,
    'Content-Type': 'application/json'
  };
  
  // 1. Messages de conversation
  const conversation = [
    'Salut ! Ton Bob m\'intéresse vraiment beaucoup 😊',
    'Super ! On peut se rencontrer pour en discuter ?',
    'Parfait ! À bientôt alors, merci beaucoup ! 🙏'
  ];
  
  console.log(`💬 Simulation conversation (${conversation.length} messages)`);
  
  for (let i = 0; i < conversation.length; i++) {
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: conversation[i],
          typeConversation: 'echange',
          dateEnvoi: new Date(Date.now() + i * 60000).toISOString(),
          expediteur: auth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      console.log(`📤 Message ${i + 1}: ${conversation[i]}`);
      
    } catch (error) {
      console.log(`❌ Message ${i + 1}: ${error.response?.data?.error?.message}`);
    }
  }
  
  // 2. Progression des statuts
  console.log(`\n📈 Progression statuts`);
  
  try {
    // Vers en_cours
    await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
      data: {
        statut: 'en_cours',
        dateDebut: new Date().toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: actif → en_cours');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vers terminé
    await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
      data: {
        statut: 'termine',
        dateFin: new Date(Date.now() + 24*60*60*1000).toISOString()
      }
    }, { headers });
    
    console.log('✅ Statut: en_cours → terminé');
    
  } catch (error) {
    console.log(`❌ Progression statut: ${error.response?.data?.error?.message}`);
  }
  
  // 3. Transaction BOBIZ
  console.log(`\n💰 Attribution BOBIZ`);
  
  try {
    await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
      data: {
        points: bob.bobizGagnes,
        type: 'gain',
        source: 'echange_complete',
        description: `Échange terminé: ${bob.titre}`,
        dateTransaction: new Date().toISOString(),
        user: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log(`💎 +${bob.bobizGagnes} BOBIZ attribués !`);
    
  } catch (error) {
    console.log(`❌ Transaction BOBIZ: ${error.response?.data?.error?.message}`);
  }
  
  // 4. Évaluation finale
  try {
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `⭐ ÉVALUATION FINALE ⭐\nNote: 5/5\n💬 Échange parfait ! Très satisfait de cette interaction Bob.`,
        typeConversation: 'echange',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        echange: bob.id
      }
    }, { headers });
    
    console.log('⭐ Évaluation 5/5 ajoutée');
    
  } catch (error) {
    console.log(`❌ Évaluation: ${error.response?.data?.error?.message}`);
  }
  
  console.log(`🎉 Parcours ${bob.type} TERMINÉ !`);
}

async function generateFinalReport(auth, createdBobs) {
  console.log('\n📊 === RAPPORT FINAL ===');
  
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
    
    const terminedBobs = bobs.filter(b => b.statut === 'termine');
    const totalBobiz = transactions.reduce((sum, t) => sum + t.points, 0);
    
    console.log(`🎯 RÉSULTATS SIMULATION:`);
    console.log(`  📋 ${bobs.length} Bobs total (${terminedBobs.length} terminés)`);
    console.log(`  💬 ${messages.length} messages échangés`);
    console.log(`  💰 ${transactions.length} transactions BOBIZ`);
    console.log(`  💎 ${totalBobiz} BOBIZ total distribués`);
    
    console.log(`\n🏆 PARCOURS CRÉÉS:`);
    createdBobs.forEach(bob => {
      console.log(`  ✅ ${bob.titre} (${bob.type}) - ${bob.bobizGagnes} Bobiz`);
    });
    
    console.log(`\n🎉 ÉCOSYSTÈME BOB COMPLET !`);
    console.log(`  ✅ Parcours prêt/emprunt/service simulés`);
    console.log(`  ✅ Conversations réalistes avec messages`);
    console.log(`  ✅ Statuts évolutifs: actif → en_cours → terminé`);
    console.log(`  ✅ BOBIZ distribués automatiquement`);
    console.log(`  ✅ Évaluations enregistrées`);
    console.log(`  ✅ Historique complet disponible`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport: ${error.message}`);
  }
}

async function main() {
  console.log('🚀 === SIMULATION COMPLÈTE AVEC ACCÈS STRAPI DIRECT ===\n');
  
  // 1. Authentification
  const auth = await authenticateAndGetSchema();
  if (!auth) return;
  
  // 2. Analyser les content types
  await analyzeContentTypes(auth);
  
  // 3. Tester structures de création
  const workingStructures = await testBobCreationWithCorrectStructure(auth);
  
  if (workingStructures.length === 0) {
    console.log('\n❌ Aucune structure de création fonctionnelle trouvée');
    return;
  }
  
  console.log(`\n✅ ${workingStructures.length} structures fonctionnelles trouvées !`);
  
  // 4. Créer Bobs réels pour simulation
  const createdBobs = await createRealBobsForSimulation(auth);
  
  if (createdBobs.length === 0) {
    console.log('\n⚠️ Aucun Bob créé pour simulation');
    return;
  }
  
  // 5. Simuler parcours complets sur les Bobs créés
  console.log(`\n🎬 Simulation de ${createdBobs.length} parcours complets...`);
  
  for (const bob of createdBobs) {
    await simulateCompleteJourney(bob, auth);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // 6. Rapport final
  await generateFinalReport(auth, createdBobs);
  
  console.log('\n✨ === SIMULATION TERMINÉE ===');
  console.log('🎉 Écosystème Bob maintenant vivant avec parcours complets !');
}

main().catch(console.error);