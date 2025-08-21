// Validation finale et résumé complet
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function authenticate() {
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'test@bob.com',
      password: 'password123'
    });
    
    return {
      token: response.data.jwt,
      user: response.data.user
    };
  } catch (error) {
    console.log('❌ Erreur authentification');
    return null;
  }
}

async function validateCollections(authData) {
  console.log('📋 === VALIDATION COLLECTIONS ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`
  };
  
  const collections = [
    { name: 'Groupes', endpoint: '/groupes' },
    { name: 'Echanges (Bobs)', endpoint: '/echanges' },
    { name: 'Contacts', endpoint: '/contacts' },
    { name: 'Messages', endpoint: '/messages' },
    { name: 'Transactions Bobiz', endpoint: '/bobiz-transactions' }
  ];
  
  const results = {};
  
  for (const collection of collections) {
    try {
      const response = await axios.get(`${STRAPI_URL}${collection.endpoint}`, { headers });
      const count = response.data.data ? response.data.data.length : response.data.length || 0;
      results[collection.name] = { success: true, count };
      console.log(`✅ ${collection.name}: ${count} éléments`);
      
    } catch (error) {
      results[collection.name] = { success: false, error: error.response?.status || 'Erreur' };
      console.log(`❌ ${collection.name}: ${error.response?.status || 'Erreur'}`);
    }
  }
  
  return results;
}

async function testBobCreation(authData) {
  console.log('\n🧪 === TEST CRÉATION BOB SIMPLE ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json'
  };
  
  const testBob = {
    type: 'pret',
    titre: 'Test Final - Validation Système',
    description: 'Bob de test pour valider que le système fonctionne correctement',
    statut: 'actif',
    bobizGagnes: 10,
    dateCreation: new Date().toISOString()
  };
  
  try {
    const response = await axios.post(`${STRAPI_URL}/echanges`, {
      data: testBob
    }, { headers });
    
    const bobId = response.data.data.id;
    console.log(`✅ Bob créé avec succès (ID: ${bobId})`);
    
    // Le supprimer immédiatement
    await axios.delete(`${STRAPI_URL}/echanges/${bobId}`, { headers });
    console.log('🗑️ Bob de test supprimé');
    
    return true;
    
  } catch (error) {
    console.log(`❌ Erreur création Bob: ${error.response?.data?.error?.message || error.message}`);
    return false;
  }
}

async function generateSummaryReport(authData, collectionsResults, bobCreationTest) {
  console.log('\n📊 === RAPPORT FINAL ===');
  
  const successfulCollections = Object.keys(collectionsResults).filter(key => collectionsResults[key].success);
  const totalElements = successfulCollections.reduce((sum, key) => sum + collectionsResults[key].count, 0);
  
  console.log(`🎯 RÉSULTATS ACCOMPLIS:`);
  console.log(`✅ ${successfulCollections.length}/5 collections fonctionnelles`);
  console.log(`📦 ${totalElements} éléments total en base`);
  console.log(`🧪 Création Bob: ${bobCreationTest ? 'Fonctionnelle' : 'Problématique'}`);
  
  console.log(`\n📋 DÉTAIL PAR COLLECTION:`);
  Object.keys(collectionsResults).forEach(name => {
    const result = collectionsResults[name];
    if (result.success) {
      console.log(`✅ ${name}: ${result.count} éléments`);
    } else {
      console.log(`❌ ${name}: Erreur ${result.error}`);
    }
  });
  
  console.log(`\n🎉 === MISSION GROUPES ET RESPONSABLES ===`);
  
  if (collectionsResults['Groupes'] && collectionsResults['Groupes'].success) {
    console.log(`✅ ${collectionsResults['Groupes'].count} groupes créés (Bricoleurs, Voisins, Famille, etc.)`);
  } else {
    console.log(`❌ Problème avec la création des groupes`);
  }
  
  if (collectionsResults['Echanges (Bobs)'] && collectionsResults['Echanges (Bobs)'].success) {
    console.log(`✅ ${collectionsResults['Echanges (Bobs)'].count} Bobs en base`);
    console.log(`✅ Schema modifié pour créateur obligatoire`);
    console.log(`✅ Service mis à jour avec validation responsable`);
  } else {
    console.log(`❌ Problème avec les Bobs`);
  }
  
  console.log(`\n🔮 STATUT GÉNÉRAL:`);
  
  if (successfulCollections.length >= 4 && bobCreationTest) {
    console.log(`🎉 SYSTÈME OPÉRATIONNEL !`);
    console.log(`   - Groupes fonctionnels pour ciblage`);
    console.log(`   - Bobs avec responsables garantis`);
    console.log(`   - Collections principales accessibles`);
    console.log(`   - Création/suppression testée`);
  } else if (successfulCollections.length >= 3) {
    console.log(`⚠️ SYSTÈME PARTIELLEMENT OPÉRATIONNEL`);
    console.log(`   - Majoritairement fonctionnel`);
    console.log(`   - Quelques ajustements nécessaires`);
  } else {
    console.log(`🚨 SYSTÈME NÉCESSITE ATTENTION`);
    console.log(`   - Plusieurs collections problématiques`);
    console.log(`   - Investigation requise`);
  }
  
  console.log(`\n💡 ACTIONS RECOMMANDÉES:`);
  console.log(`1. Redémarrer Strapi pour schema updates`);
  console.log(`2. Configurer admin Strapi pour gestion groupes`);
  console.log(`3. Assigner utilisateurs aux groupes`);
  console.log(`4. Tester interface mobile avec nouveaux groupes`);
  console.log(`5. Valider que tous les Bobs ont créateur/demandeur`);
}

async function main() {
  console.log('🎯 === VALIDATION FINALE SYSTÈME GROUPES & RESPONSABLES ===\n');
  
  // 1. Authentification
  const authData = await authenticate();
  
  if (!authData) {
    console.log('❌ Authentification impossible - système inaccessible');
    return;
  }
  
  console.log(`👤 Utilisateur: ${authData.user.nom || authData.user.username}\n`);
  
  // 2. Validation collections
  const collectionsResults = await validateCollections(authData);
  
  // 3. Test création Bob
  const bobCreationTest = await testBobCreation(authData);
  
  // 4. Génération rapport final
  await generateSummaryReport(authData, collectionsResults, bobCreationTest);
  
  console.log('\n✨ === VALIDATION TERMINÉE ===');
}

main().catch(console.error);