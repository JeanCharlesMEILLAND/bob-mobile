// debug-strapi.js - Test direct Strapi
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

async function testStrapiConnection() {
  console.log('🔍 Test de connexion Strapi...');
  console.log('🌐 URL:', API_BASE_URL);
  
  try {
    // Test 1: Ping général
    console.log('\n📡 Test 1: Ping API...');
    const pingResponse = await makeRequest(`${API_BASE_URL}`);
    console.log('Status ping:', pingResponse.status);
    console.log('Headers ping:', pingResponse.headers);
    
    // Test 2: Vérifier les endpoints disponibles
    console.log('\n📡 Test 2: Test endpoints...');
    
    const endpoints = [
      '/api',
      '/api/echanges',
      '/echanges',
      '/api/exchanges',
      '/exchanges'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\n🔗 Test ${endpoint}...`);
        const response = await makeRequest(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Content-Type: ${response.headers['content-type']}`);
        
        if (response.status < 500) {
          console.log(`   Body (100 chars): ${response.body.substring(0, 100)}...`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur: ${error.message}`);
      }
    }
    
    // Test 3: Essayer un POST simple sans auth
    console.log('\n📡 Test 3: POST simple sans auth...');
    
    const testData = {
      data: {
        titre: 'Test Debug',
        description: 'Test de debug direct',
        type: 'pret',
        categorie: 'test',
        statut: 'actif',
        bobizRecompense: 10,
        dateCreation: new Date().toISOString()
      }
    };
    
    try {
      const postResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      console.log('POST Status:', postResponse.status);
      console.log('POST Response:', postResponse.body);
      
    } catch (postError) {
      console.log('❌ Erreur POST:', postError.message);
    }
    
    // Test 4: Essayer de créer un utilisateur pour avoir un token
    console.log('\n📡 Test 4: Création/Login utilisateur test...');
    
    const testUser = {
      username: 'debug-user',
      email: 'debug@test.com',
      password: 'DebugTest123!'
    };
    
    try {
      // Essayer de s'inscrire
      const registerResponse = await makeRequest(`${API_BASE_URL}/api/auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUser)
      });
      
      console.log('REGISTER Status:', registerResponse.status);
      console.log('REGISTER Response:', registerResponse.body.substring(0, 200));
      
      let token = null;
      
      if (registerResponse.status === 200) {
        const registerData = JSON.parse(registerResponse.body);
        token = registerData.jwt;
        console.log('✅ Token obtenu depuis register:', token ? 'OUI' : 'NON');
      } else {
        // Essayer de se connecter si déjà existant
        console.log('\n📡 Tentative login...');
        const loginResponse = await makeRequest(`${API_BASE_URL}/api/auth/local`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: testUser.username,
            password: testUser.password
          })
        });
        
        console.log('LOGIN Status:', loginResponse.status);
        console.log('LOGIN Response:', loginResponse.body.substring(0, 200));
        
        if (loginResponse.status === 200) {
          const loginData = JSON.parse(loginResponse.body);
          token = loginData.jwt;
          console.log('✅ Token obtenu depuis login:', token ? 'OUI' : 'NON');
        }
      }
      
      // Test 5: POST avec token - Essayer différentes structures
      if (token) {
        console.log('\n📡 Test 5: POST avec token - Structure complète...');
        
        const authPostResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(testData)
        });
        
        console.log('AUTH POST Status:', authPostResponse.status);
        console.log('AUTH POST Response:', authPostResponse.body);
        
        // Test 6: Essayer structure simplifiée
        console.log('\n📡 Test 6: Structure minimaliste...');
        
        const minimalData = {
          data: {
            titre: 'Test Minimal',
            description: 'Test de structure minimale',
            type: 'pret',
            statut: 'actif'
          }
        };
        
        const minimalResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(minimalData)
        });
        
        console.log('MINIMAL POST Status:', minimalResponse.status);
        console.log('MINIMAL POST Response:', minimalResponse.body);
        
        // Test 7: Essayer champ par champ
        const fieldsToTest = [
          'titre',
          'description', 
          'type',
          'statut',
          'bobizRecompense',
          'dateCreation',
          'dureeJours',
          'conditions',
          'category',
          'metadata'
        ];
        
        console.log('\n📡 Test 7: Validation champs individuels...');
        
        for (const field of fieldsToTest) {
          const fieldData = {
            data: {
              titre: 'Test Field',
              description: 'Test',
              type: 'pret',
              [field]: field === 'bobizRecompense' ? 10 : 
                       field === 'dureeJours' ? 7 :
                       field === 'metadata' ? {} : 
                       `test-${field}`
            }
          };
          
          try {
            const fieldResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(fieldData)
            });
            
            console.log(`   ${field}: ${fieldResponse.status === 400 ? '❌' : fieldResponse.status === 201 ? '✅' : '?'} (${fieldResponse.status})`);
            
            if (fieldResponse.status === 201) {
              console.log(`   ✅ SUCCESS avec ${field}! Enregistrement créé`);
              break; // Arrêter au premier succès
            }
            
          } catch (err) {
            console.log(`   ${field}: ❌ Erreur`);
          }
        }
      }
      
    } catch (authError) {
      console.log('❌ Erreur authentification:', authError.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

testStrapiConnection();