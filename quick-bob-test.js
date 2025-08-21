// Test rapide de création Bob avec champs basiques
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function quickTest() {
  console.log('🧪 === TEST RAPIDE CRÉATION BOB ===');
  
  // Authentification avec utilisateur existant
  try {
    const loginResponse = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'marie@bob.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.jwt;
    const user = loginResponse.data.user;
    console.log(`✅ Connecté: ${user.username}`);
    
    // Tester Bob avec champs minimum
    const bobMinimal = {
      titre: 'Test Bob Minimal',
      description: 'Bob de test avec champs de base uniquement',
      type: 'pret',
      statut: 'actif'
    };
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📋 Tentative création Bob minimal...');
    
    const response = await axios.post(`${STRAPI_URL}/echanges`, {
      data: bobMinimal
    }, { headers });
    
    console.log(`✅ Bob créé ! ID: ${response.data.data.id}`);
    console.log(`📄 Données: ${JSON.stringify(response.data.data.attributes, null, 2)}`);
    
    // Nettoyer
    await axios.delete(`${STRAPI_URL}/echanges/${response.data.data.id}`, { headers });
    console.log('🗑️ Bob nettoyé');
    
  } catch (error) {
    console.log('❌ Erreur:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.data?.error?.details) {
      console.log('🔍 Détails:', error.response.data.error.details);
    }
  }
}

quickTest();