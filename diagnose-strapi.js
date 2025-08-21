// Diagnostiquer l'état actuel de Strapi
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function testConnection() {
  console.log('🌐 === TEST CONNEXION STRAPI ===');
  
  try {
    const response = await axios.get(`${STRAPI_URL}/users`);
    console.log('❌ Accès public aux utilisateurs (problème de sécurité!)');
    console.log(`Nombre d'utilisateurs: ${response.data.length}`);
    
    response.data.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nom || user.username || user.email} (ID: ${user.id})`);
    });
    
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('✅ Accès aux utilisateurs protégé (c\'est normal)');
    } else {
      console.log('❌ Erreur connexion:', error.response?.data || error.message);
    }
  }
}

async function testPublicAccess() {
  console.log('\n📋 === TEST ACCÈS PUBLIC ===');
  
  const endpoints = [
    '/groupes',
    '/echanges', 
    '/contacts',
    '/invitations',
    '/messages',
    '/bobiz-transactions'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${STRAPI_URL}${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.data.data?.length || 0} éléments`);
      
    } catch (error) {
      const status = error.response?.status;
      if (status === 403) {
        console.log(`🔒 ${endpoint}: Accès protégé (authentification requise)`);
      } else if (status === 404) {
        console.log(`❓ ${endpoint}: Collection inexistante`);
      } else {
        console.log(`❌ ${endpoint}: Erreur ${status} - ${error.response?.data?.error?.message || error.message}`);
      }
    }
  }
}

async function tryRegistration() {
  console.log('\n👤 === CRÉATION UTILISATEUR TEST ===');
  
  const testUser = {
    username: 'testuser',
    email: 'test@bob.com',
    password: 'password123'
  };
  
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local/register`, testUser);
    console.log('✅ Utilisateur créé avec succès !');
    console.log(`Token JWT: ${response.data.jwt.substring(0, 50)}...`);
    
    return {
      user: response.data.user,
      token: response.data.jwt
    };
    
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    
    if (errorMsg.includes('already taken') || errorMsg.includes('already exists')) {
      console.log('⚠️ Utilisateur test existe déjà');
      
      // Essayer de se connecter
      try {
        const loginResponse = await axios.post(`${STRAPI_URL}/auth/local`, {
          identifier: 'test@bob.com',
          password: 'password123'
        });
        
        console.log('✅ Connexion réussie avec utilisateur existant');
        return {
          user: loginResponse.data.user,
          token: loginResponse.data.jwt
        };
        
      } catch (loginError) {
        console.log('❌ Connexion échouée:', loginError.response?.data?.error?.message);
        return null;
      }
    } else {
      console.log('❌ Erreur création utilisateur:', errorMsg);
      return null;
    }
  }
}

async function testWithAuth(authData) {
  if (!authData) {
    console.log('\n❌ Aucune authentification disponible');
    return;
  }
  
  console.log('\n🔐 === TESTS AVEC AUTHENTIFICATION ===');
  
  const headers = {
    'Authorization': `Bearer ${authData.token}`,
    'Content-Type': 'application/json'
  };
  
  console.log(`👤 Connecté en tant que: ${authData.user.nom || authData.user.username}`);
  
  // Tester accès aux Bobs
  try {
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges?populate=*`, { headers });
    const bobs = bobsResponse.data.data;
    
    console.log(`🎯 ${bobs.length} Bobs accessibles:`);
    
    bobs.forEach((bob, index) => {
      const attrs = bob.attributes;
      const creator = attrs.createur?.data?.attributes?.nom || 'Anonyme';
      console.log(`${index + 1}. ${attrs.titre} (par ${creator})`);
    });
    
  } catch (error) {
    console.log('❌ Erreur accès Bobs:', error.response?.data?.error?.message || error.message);
  }
  
  // Tester création de groupe
  try {
    const testGroup = {
      nom: 'Test Group',
      description: 'Groupe de test automatique',
      couleur: '#FF0000',
      type: 'custom',
      actif: true,
      dateCreation: new Date().toISOString()
    };
    
    const response = await axios.post(`${STRAPI_URL}/groupes`, {
      data: testGroup
    }, { headers });
    
    console.log('✅ Groupe test créé avec succès');
    
    // Le supprimer immédiatement
    await axios.delete(`${STRAPI_URL}/groupes/${response.data.data.id}`, { headers });
    console.log('🗑️ Groupe test supprimé');
    
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.log(`❌ Test création groupe: ${errorMsg}`);
  }
}

async function main() {
  console.log('🔍 === DIAGNOSTIC STRAPI COMPLET ===\n');
  
  // 1. Test de connexion basique
  await testConnection();
  
  // 2. Test accès public aux collections
  await testPublicAccess();
  
  // 3. Création/connexion utilisateur test
  const authData = await tryRegistration();
  
  // 4. Tests avec authentification
  await testWithAuth(authData);
  
  console.log('\n✨ DIAGNOSTIC TERMINÉ ✨');
}

main().catch(console.error);