// create-missing-collections.js - Créer les collections manquantes et corriger les relations
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

// Collections à créer/tester avec données d'exemple
const collectionsToCreate = {
  
  // 1. GROUPES - Organisation des contacts
  'groupes': {
    description: "Groupes de contacts pour organiser le réseau social",
    testData: {
      data: {
        nom: "Bricoleurs du Quartier",
        description: "Groupe des passionnés de bricolage dans le quartier République",
        icone: "🔨",
        couleur: "#3B82F6",
        type: "bricoleurs",
        prive: true,
        nombreMembres: 3,
        nombreBobsGroupe: 8,
        dernierBobGroupe: new Date().toISOString(),
        actif: true,
        dateCreation: new Date().toISOString(),
        metadata: {
          specialites: ["menuiserie", "plomberie", "électricité"],
          niveau_moyen: "expert",
          zone_geographique: "Paris 11ème",
          created_by: "marie-bricoleuse",
          tags: ["outils", "entraide", "voisinage"]
        }
      }
    }
  },
  
  // 2. CATEGORIES - Organisation du contenu
  'categories': {
    description: "Catégories pour organiser les Bobs par type d'objet/service",
    testData: {
      data: {
        nom: "Bricolage & Outils",
        description: "Outils de bricolage, matériel de construction, équipement de rénovation",
        icone: "🔨",
        couleur: "#3B82F6",
        active: true,
        populaire: true,
        nombreBobs: 0,
        ordre: 1,
        niveau: 0,
        mots_cles: "outils, bricolage, réparation, construction, perceuse, scie, marteau",
        parent_id: null,
        metadata: {
          sous_categories: ["Outils électriques", "Outils manuels", "Matériel mesure"],
          prix_moyen: 150,
          duree_moyenne: 3,
          popularite_score: 8.5
        }
      }
    }
  },
  
  // 3. TAGS - Étiquetage libre
  'tags': {
    description: "Tags libres pour catégoriser finement les Bobs",
    testData: {
      data: {
        nom: "urgent",
        description: "Pour les demandes urgentes nécessitant une réponse rapide",
        couleur: "#EF4444",
        nombreUtilisations: 0,
        populaire: false,
        actif: true,
        metadata: {
          usage_context: "time_sensitive",
          typical_duration: "24h",
          priority_level: "high"
        }
      }
    }
  },
  
  // 4. EVALUATIONS - Système d'avis
  'evaluations': {
    description: "Évaluations et avis sur les échanges Bob",
    testData: {
      data: {
        note: 5,
        commentaire: "Excellent échange ! Matériel en parfait état, propriétaire très sympa et de bon conseil. Communication fluide, remise ponctuelle. Je recommande vivement !",
        type: "bob",
        ponctualite: 5,
        communication: 5,
        qualiteService: 5,
        confiance: 5,
        recommande: true,
        publique: true,
        signale: false,
        utile: 0,
        verifie: true,
        dateEvaluation: new Date().toISOString(),
        metadata: {
          evaluation_id: "eval_" + Date.now(),
          helpful_votes: 0,
          review_length: "detailed",
          response_time: "24h",
          recommandation_strength: "forte"
        }
      }
    }
  },
  
  // 5. TRANSACTIONS - Économie Bobiz
  'transactions': {
    description: "Transactions Bobiz pour l'économie de l'écosystème",
    testData: {
      data: {
        montant: 25,
        type: "gain",
        statut: "validee",
        source: "bob_termine",
        description: "Bobiz gagnés pour prêt de scie circulaire à Thomas",
        automatique: true,
        dateValidation: new Date().toISOString(),
        dateTransaction: new Date().toISOString(),
        referenceExterne: "bob_scie_marie_thomas_" + Date.now(),
        fees: 0,
        metadata: {
          transaction_type: "peer_to_peer",
          bob_category: "bricolage",
          exchange_duration: "3_days",
          user_level: "expert"
        }
      }
    }
  },
  
  // 6. NOTIFICATIONS - Système d'alertes
  'notifications': {
    description: "Notifications pour informer les utilisateurs des événements",
    testData: {
      data: {
        titre: "Nouveau Bob dans votre quartier !",
        message: "Thomas propose de prêter son robot pâtissier KitchenAid dans votre quartier. Parfait pour vos projets culinaires !",
        type: "bob_nouveau",
        lue: false,
        archivee: false,
        actionRequise: false,
        actionType: "voir_bob",
        actionData: {
          bob_id: null,
          action_url: "/bobs/details",
          expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        canalEnvoi: "app",
        dateEnvoi: new Date().toISOString(),
        tentativesEnvoi: 1,
        priorite: "normale",
        metadata: {
          notification_id: "notif_" + Date.now(),
          auto_generated: true,
          category: "bob_discovery",
          geographic_relevance: "high"
        }
      }
    }
  }
};

// Groupes de base à créer
const defaultGroups = [
  {
    nom: "Bricoleurs du Quartier",
    description: "Passionnés de bricolage, rénovation et outillage",
    icone: "🔨",
    couleur: "#3B82F6",
    type: "bricoleurs",
    specialites: ["menuiserie", "plomberie", "électricité"]
  },
  {
    nom: "Chefs & Gourmets", 
    description: "Amateurs de cuisine, pâtisserie et gastronomie",
    icone: "👨‍🍳",
    couleur: "#F59E0B",
    type: "cuisine",
    specialites: ["cuisine", "pâtisserie", "ustensiles"]
  },
  {
    nom: "Jardiniers & Nature",
    description: "Experts du jardinage, permaculture et plantes",
    icone: "🌱", 
    couleur: "#10B981",
    type: "jardinage",
    specialites: ["jardinage", "permaculture", "plantes"]
  },
  {
    nom: "Tech & Innovation",
    description: "Passionnés de technologie, électronique et innovation",
    icone: "💻",
    couleur: "#8B5CF6", 
    type: "technologie",
    specialites: ["électronique", "impression3d", "domotique"]
  },
  {
    nom: "Voisins de Confiance",
    description: "Réseau de voisins proches géographiquement",
    icone: "🏘️",
    couleur: "#6B7280",
    type: "voisinage",
    specialites: ["entraide", "proximité", "confiance"]
  }
];

// Catégories de base à créer
const defaultCategories = [
  {
    nom: "Bricolage & Outils",
    description: "Outils de bricolage, matériel de construction",
    icone: "🔨",
    couleur: "#3B82F6",
    mots_cles: "outils, bricolage, perceuse, scie, marteau"
  },
  {
    nom: "Cuisine & Électroménager",
    description: "Appareils de cuisine, ustensiles, robot culinaire",
    icone: "🍳",
    couleur: "#F59E0B", 
    mots_cles: "cuisine, robot, four, ustensiles, pâtisserie"
  },
  {
    nom: "Jardinage & Extérieur",
    description: "Outils de jardin, tondeuse, matériel extérieur",
    icone: "🌱",
    couleur: "#10B981",
    mots_cles: "jardin, tondeuse, bêche, arrosage, plantes"
  },
  {
    nom: "High-Tech & Électronique",
    description: "Matériel informatique, électronique, innovation",
    icone: "💻",
    couleur: "#8B5CF6",
    mots_cles: "tech, ordinateur, imprimante, électronique"
  },
  {
    nom: "Services & Formations",
    description: "Cours, consultations, services personnalisés",
    icone: "🎓",
    couleur: "#EF4444",
    mots_cles: "cours, formation, conseil, service, expertise"
  }
];

async function createMissingCollections() {
  console.log('🏗️ CRÉATION DES COLLECTIONS MANQUANTES DANS STRAPI\n');
  console.log('🎯 Objectif: Créer groupes, catégories, évaluations, etc.');
  console.log('📋 Focus: Relations créateur/demandeur dans les Bobs\n');
  
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
    
    // 2. Tester la création de chaque collection
    console.log('📊 === TEST DES COLLECTIONS MANQUANTES ===\n');
    
    const createdCollections = {};
    
    for (const [collectionName, config] of Object.entries(collectionsToCreate)) {
      console.log(`🔄 Test collection ${collectionName}...`);
      console.log(`   📋 ${config.description}`);
      
      try {
        const response = await makeRequest(`${API_BASE_URL}/api/${collectionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(config.testData)
        });
        
        if (response.status === 201 || response.status === 200) {
          const result = JSON.parse(response.body);
          createdCollections[collectionName] = result.data;
          console.log(`   ✅ Collection ${collectionName} fonctionnelle (ID: ${result.data.id})`);
          
          // Compter les champs sauvegardés
          const fieldsCount = Object.keys(result.data).length - 5;
          console.log(`   📊 ${fieldsCount} champs personnalisés sauvegardés`);
          
        } else if (response.status === 404 || response.status === 405) {
          console.log(`   ❌ Collection ${collectionName} n'existe pas dans Strapi`);
          console.log(`   💡 À créer manuellement dans l'admin`);
          
        } else {
          const errorBody = JSON.parse(response.body);
          console.log(`   ⚠️ ${collectionName}: ${errorBody.error?.message || 'Erreur'}`);
          console.log(`   💡 Champs manquants à ajouter`);
        }
        
      } catch (error) {
        console.log(`   ❌ ${collectionName}: ${error.message}`);
      }
      console.log('');
    }
    
    // 3. Créer les groupes par défaut si la collection existe
    if (createdCollections['groupes']) {
      console.log('👥 === CRÉATION DES GROUPES PAR DÉFAUT ===\n');
      
      for (const groupData of defaultGroups) {
        try {
          const groupPayload = {
            data: {
              ...groupData,
              prive: true,
              nombreMembres: 0,
              nombreBobsGroupe: 0,
              actif: true,
              dateCreation: new Date().toISOString(),
              metadata: {
                specialites: groupData.specialites,
                created_by: "system",
                auto_generated: true
              }
            }
          };
          
          const response = await makeRequest(`${API_BASE_URL}/api/groupes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(groupPayload)
          });
          
          if (response.status === 201 || response.status === 200) {
            console.log(`   ✅ Groupe "${groupData.nom}" créé`);
          } else {
            console.log(`   ⚠️ Groupe "${groupData.nom}": Erreur`);
          }
          
        } catch (error) {
          console.log(`   ❌ Groupe "${groupData.nom}": ${error.message}`);
        }
      }
      console.log('');
    }
    
    // 4. Créer les catégories par défaut si la collection existe
    if (createdCollections['categories']) {
      console.log('🏷️ === CRÉATION DES CATÉGORIES PAR DÉFAUT ===\n');
      
      for (const [index, categoryData] of defaultCategories.entries()) {
        try {
          const categoryPayload = {
            data: {
              ...categoryData,
              active: true,
              populaire: index < 3, // Les 3 premières sont populaires
              nombreBobs: 0,
              ordre: index + 1,
              niveau: 0,
              parent_id: null,
              metadata: {
                created_by: "system",
                auto_generated: true,
                priority: index < 3 ? "high" : "normal"
              }
            }
          };
          
          const response = await makeRequest(`${API_BASE_URL}/api/categories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(categoryPayload)
          });
          
          if (response.status === 201 || response.status === 200) {
            console.log(`   ✅ Catégorie "${categoryData.nom}" créée`);
          } else {
            console.log(`   ⚠️ Catégorie "${categoryData.nom}": Erreur`);
          }
          
        } catch (error) {
          console.log(`   ❌ Catégorie "${categoryData.nom}": ${error.message}`);
        }
      }
      console.log('');
    }
    
    // 5. Corriger les relations créateur/demandeur dans les Bobs existants
    console.log('🔗 === CORRECTION DES RELATIONS BOBS ===\n');
    
    // Récupérer tous les utilisateurs
    const usersResponse = await makeRequest(`${API_BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let users = [];
    if (usersResponse.status === 200) {
      users = JSON.parse(usersResponse.body);
      console.log(`👥 ${users.length} utilisateurs trouvés`);
    }
    
    // Récupérer tous les Bobs
    const bobsResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (bobsResponse.status === 200) {
      const bobs = JSON.parse(bobsResponse.body);
      console.log(`📦 ${bobs.data.length} Bobs à corriger\n`);
      
      // Assigner les créateurs aux Bobs en fonction du contenu
      const userMapping = {
        'marie': users.find(u => u.username === 'marie-bricoleuse')?.id,
        'thomas': users.find(u => u.username === 'thomas-chef')?.id,
        'sophie': users.find(u => u.username === 'sophie-jardin')?.id,
        'lucas': users.find(u => u.username === 'lucas-tech')?.id
      };
      
      for (const bob of bobs.data) {
        try {
          // Déterminer le créateur basé sur le titre
          let createurId = null;
          const titre = bob.titre.toLowerCase();
          
          if (titre.includes('scie') || titre.includes('peinture')) {
            createurId = userMapping.marie;
          } else if (titre.includes('robot') || titre.includes('cours') || titre.includes('cuisine')) {
            createurId = userMapping.thomas;
          } else if (titre.includes('motoculteur') || titre.includes('consultation') || titre.includes('jardinage')) {
            createurId = userMapping.sophie;
          } else if (titre.includes('imprimante') || titre.includes('domotique') || titre.includes('tech')) {
            createurId = userMapping.lucas;
          } else {
            createurId = userMapping.marie; // Par défaut
          }
          
          if (createurId) {
            console.log(`🔄 Bob "${bob.titre}" → Créateur ID: ${createurId}`);
            
            const updateData = {
              data: {
                createur_id: createurId,
                // Ajouter d'autres champs de relation si disponibles
                dateCreation: bob.dateCreation || new Date().toISOString(),
                metadata: {
                  ...bob.metadata,
                  createur_assigné: true,
                  assignment_date: new Date().toISOString()
                }
              }
            };
            
            const updateResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${bob.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(updateData)
            });
            
            if (updateResponse.status === 200) {
              console.log(`   ✅ Relation créateur ajoutée`);
            } else {
              console.log(`   ⚠️ Champ createur_id non disponible`);
            }
          }
          
        } catch (error) {
          console.log(`   ❌ Erreur Bob ${bob.id}: ${error.message}`);
        }
      }
    }
    
    // 6. Résumé et instructions
    console.log('\n📊 === RÉSUMÉ DES CRÉATIONS ===\n');
    
    const successCount = Object.keys(createdCollections).length;
    const totalCount = Object.keys(collectionsToCreate).length;
    
    console.log(`✅ Collections fonctionnelles: ${successCount}/${totalCount}`);
    console.log('');
    
    if (successCount > 0) {
      console.log('🎉 Collections créées avec succès:');
      Object.keys(createdCollections).forEach(name => {
        console.log(`   • ${name}`);
      });
      console.log('');
    }
    
    const missingCount = totalCount - successCount;
    if (missingCount > 0) {
      console.log('💡 Collections à créer manuellement dans Strapi admin:');
      Object.keys(collectionsToCreate).forEach(name => {
        if (!createdCollections[name]) {
          console.log(`   • ${name}: ${collectionsToCreate[name].description}`);
        }
      });
      console.log('');
    }
    
    console.log('🎯 Prochaines étapes importantes:');
    console.log('   1. Créer les collections manquantes dans l\'admin Strapi');
    console.log('   2. Ajouter les champs de relation createur_id/demandeur_id aux Bobs');
    console.log('   3. Configurer les relations Many-to-One vers Users');
    console.log('   4. Tester avec: node test-extension-progress.js');
    console.log('');
    console.log('📋 Guide: STRAPI-EXTENSION-GUIDE.md');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

createMissingCollections();