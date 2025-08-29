// Test de connexion simple pour diagnostiquer
const axios = require('axios');

async function testConnection() {
  console.log('🧪 Test de connexion Strapi simple...\n');
  
  const endpoints = [
    'http://localhost:1337',
    'http://localhost:1337/api',
    'http://localhost:1337/api/users/me',
    'http://localhost:1337/admin',
    'http://127.0.0.1:1337',
    'http://127.0.0.1:1337/api'
  ];
  
  for (const url of endpoints) {
    try {
      console.log(`🔍 Test: ${url}`);
      const response = await axios.get(url, { timeout: 3000 });
      console.log(`✅ SUCCÈS: ${url} - Status: ${response.status}`);
      console.log(`   Réponse: ${JSON.stringify(response.data).substring(0, 100)}...\n`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ CONNEXION REFUSÉE: ${url} - Strapi ne semble pas démarré`);
      } else if (error.response) {
        console.log(`⚠️ RÉPONSE: ${url} - Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.statusText}\n`);
      } else {
        console.log(`❌ ERREUR: ${url} - ${error.message}\n`);
      }
    }
  }
  
  // Test de création utilisateur si une URL fonctionne
  try {
    console.log('🔐 Tentative création utilisateur de test...');
    const registerData = {
      email: 'test-simple@bob.com',
      password: 'TestPassword123!',
      username: 'test_simple'
    };
    
    const response = await axios.post('http://localhost:1337/api/auth/local/register', registerData, { timeout: 5000 });
    console.log('✅ Utilisateur créé avec succès !');
    console.log('   JWT Token:', response.data.jwt.substring(0, 30) + '...');
    console.log('   User ID:', response.data.user.id);
    
  } catch (error) {
    console.log('❌ Échec création utilisateur:', error.response?.data?.error?.message || error.message);
    if (error.response?.data) {
      console.log('   Détails:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testConnection().catch(console.error);