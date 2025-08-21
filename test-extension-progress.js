// test-extension-progress.js - Tester la progression des extensions Strapi
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

// Tests progressifs par priorité
const progressTests = {
  
  // PRIORITÉ 1: Messages fonctionnels
  messages_basic: {
    name: "Messages - Champs de base",
    test: async (token) => {
      const messageData = {
        data: {
          contenu: "Test message basique",
          type: "texte",
          lu: false,
          supprime: false
        }
      };
      
      const response = await makeRequest(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      return {
        success: response.status === 201 || response.status === 200,
        status: response.status,
        details: response.status === 200 ? "Messages basiques fonctionnels" : "Champs manquants"
      };
    }
  },
  
  messages_advanced: {
    name: "Messages - Champs avancés",
    test: async (token) => {
      const messageData = {
        data: {
          contenu: "Test message avancé",
          type: "texte",
          expediteur_id: 4,
          destinataire_id: 5,
          echange_id: 6,
          lu: false,
          metadataMessage: {
            phase: "test",
            conversation_id: "conv_test_123"
          },
          version: "1.0"
        }
      };
      
      const response = await makeRequest(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      });
      
      return {
        success: response.status === 201 || response.status === 200,
        status: response.status,
        details: response.status === 200 ? "Messages avancés fonctionnels" : "Relations ou métadonnées manquantes"
      };
    }
  },
  
  // PRIORITÉ 2: Statuts Bobs étendus
  bobs_status: {
    name: "Bobs - Statuts étendus",
    test: async (token) => {
      // Créer un Bob de test
      const bobData = {
        data: {
          titre: "Test Statuts",
          description: "Test des statuts étendus",
          type: "pret",
          statut: "actif",
          bobizGagnes: 10
        }
      };
      
      const createResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bobData)
      });
      
      if (createResponse.status !== 201) {
        return { success: false, status: createResponse.status, details: "Création Bob échouée" };
      }
      
      const createdBob = JSON.parse(createResponse.body);
      
      // Tester changement vers "en_cours"
      const updateResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${createdBob.data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          data: { statut: "en_cours" }
        })
      });
      
      return {
        success: updateResponse.status === 200,
        status: updateResponse.status,
        details: updateResponse.status === 200 ? "Statuts étendus fonctionnels" : "Statut en_cours non supporté"
      };
    }
  },
  
  bobs_metadata: {
    name: "Bobs - Métadonnées JSON",
    test: async (token) => {
      const bobData = {
        data: {
          titre: "Test Métadonnées",
          description: "Test des métadonnées JSON",
          type: "pret",
          statut: "actif",
          bobizGagnes: 15,
          metadata: {
            brand: "TestBrand",
            specifications: { weight: "5kg" },
            features: ["portable", "durable"]
          }
        }
      };
      
      const response = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bobData)
      });
      
      return {
        success: response.status === 201,
        status: response.status,
        details: response.status === 201 ? "Métadonnées JSON fonctionnelles" : "Champ metadata manquant"
      };
    }
  },
  
  // PRIORITÉ 3: Collection Évaluations
  evaluations: {
    name: "Évaluations - Collection",
    test: async (token) => {
      const evaluationData = {
        data: {
          note: 5,
          commentaire: "Test évaluation",
          type: "bob",
          ponctualite: 5,
          communication: 5,
          recommande: true,
          publique: true
        }
      };
      
      const response = await makeRequest(`${API_BASE_URL}/api/evaluations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evaluationData)
      });
      
      return {
        success: response.status === 201 || response.status === 200,
        status: response.status,
        details: response.status === 201 ? "Collection évaluations fonctionnelle" : 
                response.status === 404 ? "Collection évaluations inexistante" : "Champs manquants"
      };
    }
  },
  
  // PRIORITÉ 4: Contacts étendus
  contacts_extended: {
    name: "Contacts - Champs étendus",
    test: async (token) => {
      const contactData = {
        data: {
          nom: "TestExtended",
          prenom: "Contact",
          surnom: "Testeur",
          statut: "ami",
          confiance: "forte",
          aBob: true,
          invitationAcceptee: true,
          nombreBobsEnsemble: 2,
          noteRelation: 4.5,
          favoris: true,
          metadata: {
            trust_score: 4.5,
            shared_interests: ["test"]
          }
        }
      };
      
      const response = await makeRequest(`${API_BASE_URL}/api/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contactData)
      });
      
      return {
        success: response.status === 201 || response.status === 200,
        status: response.status,
        details: response.status === 200 ? "Contacts étendus fonctionnels" : "Champs étendus manquants"
      };
    }
  }
};

async function testExtensionProgress() {
  console.log('📊 TEST DE PROGRESSION DES EXTENSIONS STRAPI\n');
  console.log('🎯 Objectif: Mesurer quelles extensions ont été ajoutées');
  console.log('📋 Tests: 6 fonctionnalités critiques par priorité\n');
  
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
    
    // 2. Exécuter tous les tests
    console.log('🧪 === TESTS DE PROGRESSION ===\n');
    
    const results = {};
    let totalTests = Object.keys(progressTests).length;
    let passedTests = 0;
    
    for (const [testKey, testConfig] of Object.entries(progressTests)) {
      console.log(`🔄 ${testConfig.name}...`);
      
      try {
        const result = await testConfig.test(token);
        results[testKey] = result;
        
        if (result.success) {
          passedTests++;
          console.log(`   ✅ ${result.details}`);
        } else {
          console.log(`   ❌ ${result.details} (Status: ${result.status})`);
        }
        
      } catch (error) {
        results[testKey] = {
          success: false,
          status: 'error',
          details: error.message
        };
        console.log(`   ❌ Erreur: ${error.message}`);
      }
      
      console.log('');
    }
    
    // 3. Résumé de progression
    console.log('📊 === RÉSUMÉ DE PROGRESSION ===\n');
    
    const progressPercent = Math.round((passedTests / totalTests) * 100);
    
    console.log(`🎯 Progression globale: ${passedTests}/${totalTests} (${progressPercent}%)`);
    console.log('');
    
    // Détail par priorité
    const priorityStatus = {
      "PRIORITÉ 1 - Messages": {
        tests: ['messages_basic', 'messages_advanced'],
        status: []
      },
      "PRIORITÉ 2 - Bobs étendus": {
        tests: ['bobs_status', 'bobs_metadata'],
        status: []
      },
      "PRIORITÉ 3 - Évaluations": {
        tests: ['evaluations'],
        status: []
      },
      "PRIORITÉ 4 - Contacts": {
        tests: ['contacts_extended'],
        status: []
      }
    };
    
    // Calculer le statut par priorité
    for (const [priority, config] of Object.entries(priorityStatus)) {
      config.status = config.tests.map(test => results[test]?.success || false);
      const passed = config.status.filter(s => s).length;
      const total = config.status.length;
      const percent = Math.round((passed / total) * 100);
      
      console.log(`📋 ${priority}: ${passed}/${total} (${percent}%)`);
      config.tests.forEach((test, i) => {
        const icon = config.status[i] ? '✅' : '❌';
        console.log(`   ${icon} ${progressTests[test].name}`);
      });
      console.log('');
    }
    
    // 4. Instructions prochaines étapes
    console.log('🎯 === PROCHAINES ÉTAPES ===\n');
    
    if (progressPercent === 100) {
      console.log('🎉 TOUTES LES EXTENSIONS SONT FONCTIONNELLES !');
      console.log('🚀 Vous pouvez maintenant:');
      console.log('   • Lancer simulate-complete-exchanges.js');
      console.log('   • Créer des échanges avec conversations complètes');
      console.log('   • Utiliser toutes les fonctionnalités avancées');
      
    } else if (progressPercent >= 75) {
      console.log('🌟 Excellente progression ! Finalisez les derniers détails:');
      Object.entries(results).forEach(([test, result]) => {
        if (!result.success) {
          console.log(`   • ${progressTests[test].name}: ${result.details}`);
        }
      });
      
    } else if (progressPercent >= 50) {
      console.log('👍 Bonne progression ! Priorités restantes:');
      console.log('   1. Consulter STRAPI-EXTENSION-GUIDE.md');
      console.log('   2. Ajouter les champs manquants dans l\'admin Strapi');
      console.log('   3. Relancer ce test pour mesurer les améliorations');
      
    } else {
      console.log('📖 Démarrage des extensions recommandé:');
      console.log('   1. Ouvrir http://46.202.153.43:1337/admin');
      console.log('   2. Suivre STRAPI-EXTENSION-GUIDE.md étape par étape');
      console.log('   3. Commencer par PRIORITÉ 1 (Messages)');
    }
    
    console.log('\n📋 Guide détaillé: STRAPI-EXTENSION-GUIDE.md');
    console.log('🧪 Test suivant: node simulate-complete-exchanges.js');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

testExtensionProgress();