// extend-strapi-collections.js - Étendre les collections Strapi existantes
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

// Champs à tester un par un pour les collections existantes
const fieldsToTest = {
  
  // === EXTENSION COLLECTION ECHANGES ===
  echanges: {
    // Catégorisation
    urgence: "normale",
    mots_cles: "test, simulation, strapi",
    categorie_simple: "bricolage",
    
    // Géolocalisation avancée
    ville: "Paris",
    codePostal: "75011",
    rayonAcceptable: 10,
    livraisonPossible: true,
    
    // Économie avancée
    bobizProposed: 25,
    negociable: true,
    caution: 50,
    
    // Dates détaillées
    dateRenduPrevu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    dateRenduReel: null,
    
    // Interaction sociale
    vues: 0,
    interessesCount: 0,
    partages: 0,
    signalements: 0,
    
    // Chat et communication
    chatActif: true,
    messagesCount: 0,
    dernierMessage: null,
    
    // Métadonnées et flexibilité
    flexibiliteHoraire: true,
    sourceCreation: "app",
    versionApp: "1.0.0",
    
    // État et suivi
    etatObjet: "excellent",
    photos: [],
    valeurEstimee: 100,
    
    // JSON pour extensibilité
    metadata: {
      brand: "Test",
      model: "TestModel",
      specifications: {
        weight: "5kg",
        dimensions: "30x20x15cm"
      },
      owner_notes: "Test d'extension Strapi",
      tags: ["test", "simulation"],
      features: ["portable", "efficace"],
      maintenance: {
        last_service: "2024-08-01",
        next_service: "2025-02-01"
      }
    }
  },
  
  // === EXTENSION COLLECTION MESSAGES ===
  messages: {
    // Type de message étendu
    type: "texte",
    
    // Participants étendus
    expediteur_id: null, // À remplir avec un vrai ID
    destinataire_id: null, // À remplir avec un vrai ID
    echange_id: null, // À remplir avec un vrai ID Bob
    
    // État du message
    lu: false,
    dateLu: null,
    supprime: false,
    edite: false,
    dateEdition: null,
    
    // Contenu riche
    media_url: null,
    fichier_url: null,
    
    // Messages système/action
    actionType: null,
    actionData: null,
    
    // Réponse/Thread
    repondA_id: null,
    
    // Métadonnées étendues
    metadataMessage: {
      platform: "mobile",
      app_version: "1.0.0",
      message_id: "msg_" + Date.now(),
      conversation_id: "conv_" + Date.now(),
      device_info: "iPhone 13",
      location: "Paris",
      read_receipts: true,
      priority: "normal"
    },
    
    // Versioning
    version: "1.0"
  },
  
  // === EXTENSION COLLECTION CONTACTS ===
  contacts: {
    // Informations étendues (déjà testées mais on rajoute)
    surnom: "Test Contact",
    entreprise: "Test Corp",
    fonction: "Testeur",
    
    // Statut relation étendu
    statut: "ami",
    relation: "Collègue testeur",
    confiance: "forte",
    priorite: "normale",
    
    // État Bob étendu
    aBob: true,
    versionBob: "1.0.0",
    dateInscriptionBob: new Date().toISOString(),
    statusInvitation: "acceptee",
    codeParrainage: "TEST123",
    
    // Interaction étendue
    dernierMessage: new Date().toISOString(),
    frequenceContact: "hebdomadaire",
    typeRelation: "professionnelle",
    
    // Géolocalisation contact
    adresse_contact: "Paris, France",
    distance: 5.2,
    memeQuartier: true,
    
    // Groupes et catégories
    groupes: ["testeurs", "professionnels"],
    categories: ["technique", "fiable"],
    
    // Préférences contact
    notificationsActives: true,
    partageLocalisation: false,
    
    // Métadonnées contact étendues
    metadata: {
      source_ajout: "simulation",
      verified: true,
      trust_score: 4.5,
      interaction_frequency: "high",
      shared_interests: ["technologie", "test"],
      contact_preferences: {
        preferred_time: "evening",
        preferred_method: "message",
        language: "fr"
      },
      bob_history: {
        exchanges_count: 3,
        last_exchange: "2024-08-15",
        total_bobiz: 45,
        ratings: [5, 4, 5]
      }
    }
  }
};

async function extendStrapiCollections() {
  console.log('🔧 EXTENSION DES COLLECTIONS STRAPI EXISTANTES\n');
  console.log('🎯 Objectif: Ajouter les champs manquants pour interactions complètes');
  console.log('📋 Collections à étendre: echanges, messages, contacts\n');
  
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
    
    // 2. Pour chaque collection, tester l'ajout des nouveaux champs
    for (const [collectionName, fields] of Object.entries(fieldsToTest)) {
      console.log(`🔧 === EXTENSION COLLECTION ${collectionName.toUpperCase()} ===\n`);
      
      // D'abord créer un item de test de base
      console.log(`📝 Création d'un ${collectionName} de test de base...`);
      
      let baseData = {};
      if (collectionName === 'echanges') {
        baseData = {
          data: {
            titre: `Test Extension ${collectionName}`,
            description: `Test d'extension des champs pour ${collectionName}`,
            type: "pret",
            statut: "actif",
            bobizGagnes: 10
          }
        };
      } else if (collectionName === 'messages') {
        baseData = {
          data: {
            contenu: `Message de test pour extension ${collectionName}`
          }
        };
      } else if (collectionName === 'contacts') {
        baseData = {
          data: {
            nom: "TestExtension",
            prenom: "Contact"
          }
        };
      }
      
      const createResponse = await makeRequest(`${API_BASE_URL}/api/${collectionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(baseData)
      });
      
      if (createResponse.status !== 201 && createResponse.status !== 200) {
        console.log(`❌ Impossible de créer l'item de base pour ${collectionName}`);
        continue;
      }
      
      const createdItem = JSON.parse(createResponse.body);
      const itemId = createdItem.data.id;
      console.log(`✅ Item de base créé avec ID: ${itemId}\n`);
      
      // 3. Tester chaque nouveau champ individuellement
      console.log(`🧪 Test des nouveaux champs pour ${collectionName}:`);
      
      const successfulFields = [];
      const failedFields = [];
      
      for (const [fieldName, fieldValue] of Object.entries(fields)) {
        try {
          console.log(`   🔄 Test champ: ${fieldName}...`);
          
          const updateData = {
            data: {
              [fieldName]: fieldValue
            }
          };
          
          const updateResponse = await makeRequest(`${API_BASE_URL}/api/${collectionName}/${itemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          if (updateResponse.status === 200) {
            successfulFields.push(fieldName);
            console.log(`      ✅ ${fieldName}: Accepté`);
          } else {
            failedFields.push(fieldName);
            const errorBody = JSON.parse(updateResponse.body);
            console.log(`      ❌ ${fieldName}: ${errorBody.error?.message || 'Rejeté'}`);
          }
          
        } catch (error) {
          failedFields.push(fieldName);
          console.log(`      ❌ ${fieldName}: Erreur réseau`);
        }
      }
      
      // 4. Tenter une mise à jour groupée avec tous les champs qui marchent
      if (successfulFields.length > 0) {
        console.log(`\n🔄 Mise à jour groupée avec ${successfulFields.length} champs acceptés...`);
        
        const groupedData = { data: {} };
        successfulFields.forEach(fieldName => {
          groupedData.data[fieldName] = fields[fieldName];
        });
        
        const groupedResponse = await makeRequest(`${API_BASE_URL}/api/${collectionName}/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(groupedData)
        });
        
        if (groupedResponse.status === 200) {
          console.log(`✅ Mise à jour groupée réussie !`);
        } else {
          console.log(`⚠️ Mise à jour groupée échouée`);
        }
      }
      
      // 5. Récupérer l'item final pour voir ce qui a été sauvegardé
      const finalResponse = await makeRequest(`${API_BASE_URL}/api/${collectionName}/${itemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (finalResponse.status === 200) {
        const finalItem = JSON.parse(finalResponse.body);
        const totalFields = Object.keys(finalItem.data).length;
        const baseFields = ['id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt'].length;
        const customFields = totalFields - baseFields;
        
        console.log(`\n📊 Résultat ${collectionName}:`);
        console.log(`   ✅ Champs acceptés: ${successfulFields.length}/${Object.keys(fields).length}`);
        console.log(`   📋 Total champs: ${totalFields} (${customFields} personnalisés)`);
        console.log(`   📄 Taille données: ${JSON.stringify(finalItem.data).length} caractères`);
        
        if (finalItem.data.metadata) {
          console.log(`   🗂️ Métadonnées JSON: ${Object.keys(finalItem.data.metadata).length} propriétés`);
        }
      }
      
      console.log(`\n💡 Champs à ajouter manuellement dans Strapi admin:`);
      failedFields.forEach(field => {
        console.log(`   - ${field}`);
      });
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // 6. Résumé global
    console.log('📋 === RÉSUMÉ EXTENSION COLLECTIONS ===\n');
    
    console.log('✅ Collections testées avec extensions:');
    console.log('   • Echanges: Géolocalisation, économie, interaction sociale');
    console.log('   • Messages: Types, statuts, métadonnées, threads');  
    console.log('   • Contacts: Réseau social, confiance, groupes, historique');
    console.log('');
    
    console.log('🎯 Prochaines étapes:');
    console.log('   1. Ajouter manuellement les champs rejetés dans l\'admin Strapi');
    console.log('   2. Relancer ce script pour valider les nouvelles extensions');
    console.log('   3. Lancer simulate-complete-exchanges.js pour les interactions');
    console.log('');
    
    console.log('📖 Guide: Consulter STRAPI-CONFIGURATION-GUIDE.md pour détails');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

extendStrapiCollections();