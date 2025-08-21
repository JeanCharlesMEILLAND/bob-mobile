// strapi-schema-analyzer.js - Analyser l'état actuel de Strapi
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

async function analyzeStrapi() {
  console.log('🔍 Analyse de l\'architecture Strapi actuelle...\n');
  
  try {
    // 1. Se connecter
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
    
    const token = JSON.parse(loginResponse.body).jwt;
    console.log('✅ Connexion réussie\n');
    
    // 2. Analyser les collections existantes
    console.log('📊 === COLLECTIONS EXISTANTES ===\n');
    
    const collections = [
      'users',
      'echanges', 
      'contacts',
      'categories',
      'messages',
      'notifications',
      'transactions',
      'evaluations',
      'medias'
    ];
    
    for (const collection of collections) {
      try {
        const response = await makeRequest(`${API_BASE_URL}/api/${collection}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 200) {
          const data = JSON.parse(response.body);
          console.log(`✅ /${collection} - ${data.data?.length || 0} entrée(s)`);
          
          // Analyser un échantillon pour voir la structure
          if (data.data && data.data.length > 0) {
            const sample = data.data[0];
            const fields = Object.keys(sample).filter(key => 
              !['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt'].includes(key)
            );
            console.log(`   📋 Champs: ${fields.join(', ')}`);
          }
        } else if (response.status === 404) {
          console.log(`❌ /${collection} - Collection inexistante`);
        } else {
          console.log(`⚠️ /${collection} - Status ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ /${collection} - Erreur: ${error.message}`);
      }
      console.log('');
    }
    
    // 3. Analyser la structure de la collection Users
    console.log('👤 === ANALYSE COLLECTION USERS ===\n');
    
    try {
      const usersResponse = await makeRequest(`${API_BASE_URL}/api/users/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (usersResponse.status === 200) {
        const user = JSON.parse(usersResponse.body);
        console.log('✅ Structure User actuelle:');
        console.log(JSON.stringify(user, null, 2));
      }
    } catch (error) {
      console.log(`❌ Erreur analyse users: ${error.message}`);
    }
    
    // 4. Analyser la structure de la collection Echanges
    console.log('\n🔄 === ANALYSE COLLECTION ECHANGES ===\n');
    
    try {
      const echangesResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (echangesResponse.status === 200) {
        const echanges = JSON.parse(echangesResponse.body);
        console.log(`✅ ${echanges.data.length} échange(s) trouvé(s)`);
        
        if (echanges.data.length > 0) {
          console.log('📋 Structure Echange actuelle:');
          console.log(JSON.stringify(echanges.data[0], null, 2));
        }
      }
    } catch (error) {
      console.log(`❌ Erreur analyse echanges: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

analyzeStrapi();