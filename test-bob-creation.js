// test-bob-creation.js - Test rapide création Bob avec structure corrigée
const https = require('https');
const http = require('http');

const API_BASE_URL = 'http://46.202.153.43:1337';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: data
      }));
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function testBobCreation() {
  console.log('🧪 Test création Bob avec structure corrigée...');
  
  try {
    // 1. Se connecter pour obtenir un token
    console.log('\n🔑 1. Connexion...');
    const loginResponse = await makeRequest(`${API_BASE_URL}/api/auth/local`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'debug-user',
        password: 'DebugTest123!'
      })
    });
    
    if (loginResponse.status !== 200) {
      throw new Error(`Erreur login: ${loginResponse.status}`);
    }
    
    const loginData = JSON.parse(loginResponse.body);
    const token = loginData.jwt;
    console.log('✅ Token obtenu');
    
    // 2. Créer un Bob avec la nouvelle structure
    console.log('\n📝 2. Création Bob de prêt "Perceuse"...');
    
    const bobData = {
      data: {
        titre: 'Perceuse Bosch',
        description: 'Perceuse sans fil 18V en excellent état. Parfaite pour petits travaux de bricolage.',
        type: 'pret',
        statut: 'actif',
        dureeJours: 7,
        conditions: 'Utilisation soigneuse demandée. Retour propre.',
        bobizGagnes: 15
      }
    };
    
    console.log('📦 Données envoyées:', JSON.stringify(bobData, null, 2));
    
    const createResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bobData)
    });
    
    console.log(`📊 Status: ${createResponse.status}`);
    console.log('📄 Réponse:', createResponse.body);
    
    if (createResponse.status === 201) {
      const createdBob = JSON.parse(createResponse.body);
      console.log('🎉 SUCCESS! Bob créé avec ID:', createdBob.data.id);
      console.log('📋 Titre:', createdBob.data.titre);
      console.log('🏆 Bobiz:', createdBob.data.bobizGagnes);
      
      // 3. Vérifier que le Bob est bien sauvé
      console.log('\n🔍 3. Vérification sauvegarde...');
      
      const verifyResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (verifyResponse.status === 200) {
        const bobs = JSON.parse(verifyResponse.body);
        console.log(`✅ ${bobs.data.length} Bob(s) trouvé(s) dans Strapi`);
        
        const lastBob = bobs.data[bobs.data.length - 1];
        if (lastBob && lastBob.titre === 'Perceuse Bosch') {
          console.log('🎯 Le Bob "Perceuse Bosch" est bien présent!');
          console.log('🕐 Créé le:', lastBob.createdAt);
        }
      }
      
    } else {
      console.log('❌ Échec création Bob');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testBobCreation();