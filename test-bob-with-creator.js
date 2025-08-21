// Tester création de Bob avec créateur obligatoire
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function authenticate() {
  console.log('🔐 Authentification...');
  
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'test@bob.com',
      password: 'password123'
    });
    
    console.log('✅ Authentifié avec succès');
    return {
      token: response.data.jwt,
      user: response.data.user
    };
    
  } catch (error) {
    console.log('❌ Erreur authentification:', error.response?.data?.error?.message);
    return null;
  }
}

async function testBobCreationScenarios(authData) {
  console.log('\n🎯 === TESTS CRÉATION BOB ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json'
  };
  
  const currentUser = authData.user;
  console.log(`👤 Utilisateur connecté: ${currentUser.nom || currentUser.username} (ID: ${currentUser.id})`);
  
  // Récupérer un groupe pour les tests
  let targetGroup = null;
  try {
    const groupsResponse = await axios.get(`${STRAPI_URL}/groupes`, { headers });
    if (groupsResponse.data.data && groupsResponse.data.data.length > 0) {
      targetGroup = groupsResponse.data.data[0].id;
      console.log(`🏷️ Groupe cible: ${groupsResponse.data.data[0].attributes?.nom || 'Groupe 1'}`);
    }
  } catch (error) {
    console.log('⚠️ Impossible de récupérer les groupes');
  }
  
  const testScenarios = [
    {
      name: 'Bob avec créateur',
      data: {
        type: 'pret',
        titre: 'Test Bob avec créateur',
        description: 'Test de création avec créateur défini',
        createur: currentUser.id,
        statut: 'actif',
        bobizGagnes: 10,
        dateCreation: new Date().toISOString()
      }
    },
    {
      name: 'Bob sans créateur (devrait échouer)',
      data: {
        type: 'emprunt',
        titre: 'Test Bob SANS créateur',
        description: 'Test de création SANS créateur (devrait échouer)',
        statut: 'actif',
        bobizGagnes: 10,
        dateCreation: new Date().toISOString()
      }
    },
    {
      name: 'Bob avec responsable seulement',
      data: {
        type: 'service_offert',
        titre: 'Test Bob avec responsable',
        description: 'Test avec responsable mais sans créateur',
        responsable: currentUser.id,
        statut: 'actif',
        bobizGagnes: 15,
        dateCreation: new Date().toISOString()
      }
    },
    {
      name: 'Bob complet avec groupe',
      data: {
        type: 'service_demande',
        titre: 'Test Bob complet',
        description: 'Test avec créateur, responsable ET groupe cible',
        createur: currentUser.id,
        responsable: currentUser.id,
        groupeCible: targetGroup,
        statut: 'actif',
        bobizGagnes: 20,
        dateCreation: new Date().toISOString()
      }
    }
  ];
  
  const results = [];
  
  for (const scenario of testScenarios) {
    console.log(`\n🧪 Test: ${scenario.name}`);
    
    try {
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: scenario.data
      }, { headers });
      
      console.log(`✅ Bob créé avec succès (ID: ${response.data.data.id})`);
      results.push({ scenario: scenario.name, success: true, id: response.data.data.id });
      
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`❌ Erreur: ${errorMsg}`);
      results.push({ scenario: scenario.name, success: false, error: errorMsg });
    }
    
    // Pause entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}

async function validateBobRelations(authData, results) {
  console.log('\n🔍 === VALIDATION RELATIONS ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`
  };
  
  try {
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges?populate=*`, { headers });
    const bobs = bobsResponse.data.data;
    
    console.log(`🎯 ${bobs.length} Bobs total en base`);
    
    // Vérifier les Bobs créés dans ce test
    const testBobIds = results.filter(r => r.success).map(r => r.id);
    
    console.log(`\n🧪 Validation des Bobs de test:`);
    
    for (const bobId of testBobIds) {
      const bob = bobs.find(b => b.id == bobId);
      
      if (bob) {
        const attrs = bob.attributes;
        const hasCreator = attrs.createur?.data?.id;
        const hasResponsable = attrs.responsable?.data?.id;
        const hasDemandeur = attrs.demandeur?.data?.id;
        const hasGroup = attrs.groupeCible?.data?.id;
        
        console.log(`\n📋 ${attrs.titre}:`);
        console.log(`  - Créateur: ${hasCreator ? '✅' : '❌'}`);
        console.log(`  - Responsable: ${hasResponsable ? '✅' : '❌'}`);
        console.log(`  - Demandeur: ${hasDemandeur ? '✅' : '❌'}`);
        console.log(`  - Groupe: ${hasGroup ? '✅' : '❌'}`);
        
        if (!hasCreator && !hasResponsable) {
          console.log(`  🚨 BOB ORPHELIN DÉTECTÉ !`);
        } else {
          console.log(`  ✅ Bob valide`);
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Erreur validation:', error.response?.data?.error?.message || error.message);
  }
}

async function cleanupTestBobs(authData, results) {
  console.log('\n🗑️ === NETTOYAGE BOBS TEST ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`
  };
  
  const testBobIds = results.filter(r => r.success).map(r => r.id);
  
  for (const bobId of testBobIds) {
    try {
      await axios.delete(`${STRAPI_URL}/echanges/${bobId}`, { headers });
      console.log(`🗑️ Bob ${bobId} supprimé`);
      
    } catch (error) {
      console.log(`❌ Erreur suppression Bob ${bobId}: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  console.log(`\n✅ ${testBobIds.length} Bobs de test nettoyés`);
}

async function main() {
  console.log('🚀 === TEST CRÉATION BOBS AVEC CRÉATEUR OBLIGATOIRE ===\n');
  
  // 1. Authentification
  const authData = await authenticate();
  
  if (!authData) {
    console.log('❌ Impossible de continuer sans authentification');
    return;
  }
  
  // 2. Tests de création
  const results = await testBobCreationScenarios(authData);
  
  // 3. Validation des relations
  await validateBobRelations(authData, results);
  
  // 4. Nettoyage (optionnel)
  console.log('\n❓ Voulez-vous nettoyer les Bobs de test ? (Ils seront supprimés dans 3 secondes)');
  await new Promise(resolve => setTimeout(resolve, 3000));
  await cleanupTestBobs(authData, results);
  
  // 5. Résumé
  console.log('\n📊 === RÉSUMÉ ===');
  console.log('Tests effectués:');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.scenario}`);
    if (!result.success && result.error) {
      console.log(`    → ${result.error}`);
    }
  });
  
  console.log('\n✨ SCRIPT TERMINÉ ✨');
}

main().catch(console.error);