// strapi-collection-creator.js - Créer les collections manquantes dans Strapi
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

// Définitions des collections à créer/étendre
const collectionsToCreate = {
  
  // 1. Categories - Organisation du contenu
  categories: {
    data: {
      nom: "Bricolage",
      description: "Outils et matériel de bricolage",
      icone: "🔨",
      couleur: "#3B82F6",
      active: true,
      populaire: true,
      nombreBobs: 0,
      ordre: 1,
      metadata: {}
    }
  },
  
  // 2. Tags - Étiquetage libre
  tags: {
    data: {
      nom: "urgent",
      description: "Élément nécessaire rapidement",
      couleur: "#EF4444",
      nombreUtilisations: 0,
      populaire: false,
      metadata: {}
    }
  },
  
  // 3. Transactions - Économie Bobiz
  transactions: {
    data: {
      montant: 10,
      type: "gain",
      statut: "validee",
      source: "bob_termine",
      description: "Bobiz gagnés pour prêt de perceuse",
      automatique: true,
      metadata: {}
    }
  },
  
  // 4. Evaluations - Système de notation
  evaluations: {
    data: {
      note: 5,
      commentaire: "Excellent échange, très satisfait!",
      type: "bob",
      ponctualite: 5,
      communication: 5,
      qualiteService: 5,
      confiance: 5,
      recommande: true,
      publique: true,
      signale: false,
      utile: 0,
      metadata: {}
    }
  },
  
  // 5. Notifications - Système d'alertes
  notifications: {
    data: {
      titre: "Nouveau Bob disponible",
      message: "Thomas propose de prêter sa perceuse dans votre quartier",
      type: "bob",
      lue: false,
      archivee: false,
      actionRequise: false,
      canalEnvoi: "app",
      tentativesEnvoi: 0,
      priorite: "normale",
      metadata: {}
    }
  },
  
  // 6. GroupesContacts - Organisation des contacts
  'groupes-contacts': {
    data: {
      nom: "Bricoleurs du quartier",
      description: "Mes amis bricoleurs",
      icone: "🔨",
      couleur: "#3B82F6",
      type: "bricoleurs",
      prive: true,
      nombreMembres: 0,
      nombreBobsGroupe: 0,
      metadata: {}
    }
  }
};

// Extensions pour les collections existantes
const collectionsToExtend = {
  
  // Extension de la collection Echanges (Bobs)
  echanges: {
    data: {
      titre: "Bob de test étendu",
      description: "Test avec champs étendus",
      type: "pret",
      statut: "actif",
      dureeJours: 7,
      conditions: "Utilisation soigneuse",
      bobizGagnes: 15,
      // Nouveaux champs
      urgence: "normale",
      flexibiliteHoraire: true,
      ville: "Paris",
      rayonAcceptable: 10,
      livraisonPossible: false,
      bobizProposed: 15,
      negociable: true,
      vues: 0,
      interessesCount: 0,
      partages: 0,
      chatActif: true,
      messagesCount: 0,
      sourceCreation: "app",
      metadata: {
        keywords: ["bricolage", "outils"],
        priority: "normal"
      }
    }
  },
  
  // Extension de la collection Contacts
  contacts: {
    data: {
      nom: "Dupont",
      prenom: "Marie",
      telephone: "+33612345678",
      email: "marie.dupont@example.com",
      surnom: "Marie la Bricoleuse",
      statut: "ami",
      relation: "Voisine",
      confiance: "forte",
      aBob: true,
      invitationAcceptee: true,
      nombreInvitationsEnvoyees: 1,
      nombreBobsEnsemble: 3,
      noteRelation: 4.5,
      favoris: true,
      dateAjout: new Date().toISOString(),
      sourceAjout: "telephone",
      notes: "Excellente bricoleuse, toujours disponible",
      metadata: {
        groups: ["bricoleurs", "voisins"],
        lastInteraction: new Date().toISOString()
      }
    }
  },
  
  // Extension de la collection Messages
  messages: {
    data: {
      contenu: "Salut ! Ta perceuse est-elle toujours disponible ?",
      type: "texte",
      lu: false,
      supprime: false,
      edite: false,
      actionType: null,
      metadataMessage: {
        platform: "mobile",
        version: "1.0.0"
      },
      version: "1.0"
    }
  }
};

async function createCollections() {
  console.log('🏗️ Création des collections Strapi manquantes...\n');
  
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
    
    // 2. Créer/tester les nouvelles collections
    console.log('📊 === CRÉATION DES NOUVELLES COLLECTIONS ===\n');
    
    for (const [collectionName, sampleData] of Object.entries(collectionsToCreate)) {
      try {
        console.log(`🔄 Test création /${collectionName}...`);
        
        const response = await makeRequest(`${API_BASE_URL}/api/${collectionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(sampleData)
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 201) {
          const result = JSON.parse(response.body);
          console.log(`   ✅ Collection /${collectionName} créée avec ID: ${result.data.id}`);
          console.log(`   📄 Exemple: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`);
        } else if (response.status === 404) {
          console.log(`   ❌ Collection /${collectionName} n'existe pas dans Strapi`);
          console.log(`   💡 Vous devez d'abord créer cette collection dans l'admin Strapi`);
        } else {
          console.log(`   ⚠️ Erreur: ${response.body.substring(0, 200)}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur ${collectionName}: ${error.message}`);
      }
      console.log('');
    }
    
    // 3. Étendre les collections existantes
    console.log('🔧 === EXTENSION DES COLLECTIONS EXISTANTES ===\n');
    
    for (const [collectionName, sampleData] of Object.entries(collectionsToExtend)) {
      try {
        console.log(`🔄 Test extension /${collectionName}...`);
        
        const response = await makeRequest(`${API_BASE_URL}/api/${collectionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(sampleData)
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 201) {
          const result = JSON.parse(response.body);
          console.log(`   ✅ Extension /${collectionName} testée avec succès`);
          console.log(`   📄 ID créé: ${result.data.id}`);
        } else {
          console.log(`   ⚠️ Certains champs peuvent manquer: ${response.body.substring(0, 150)}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur ${collectionName}: ${error.message}`);
      }
      console.log('');
    }
    
    // 4. Résumé et instructions
    console.log('📋 === RÉSUMÉ ET INSTRUCTIONS ===\n');
    console.log('Pour compléter la configuration Strapi :');
    console.log('');
    console.log('1. 🎛️ Dans l\'admin Strapi (http://46.202.153.43:1337/admin) :');
    console.log('   - Créez les collections manquantes (categories, tags, etc.)');
    console.log('   - Ajoutez les champs manquants aux collections existantes');
    console.log('   - Configurez les relations entre collections');
    console.log('');
    console.log('2. 🔐 Permissions :');
    console.log('   - Authenticated : CRUD sur ses propres données');
    console.log('   - Public : Lecture des categories');
    console.log('');
    console.log('3. 🔗 Relations importantes à configurer :');
    console.log('   - Users → Bobs (1:n)');
    console.log('   - Bobs → Categories (n:1)');
    console.log('   - Users → Contacts (1:n)');
    console.log('   - Bobs → Messages (1:n)');
    console.log('   - Users → Transactions (1:n)');
    console.log('');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createCollections();