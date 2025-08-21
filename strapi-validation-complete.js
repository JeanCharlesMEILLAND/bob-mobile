// strapi-validation-complete.js - Test complet de l'architecture Strapi configurée
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

// Données de test complètes pour valider l'architecture
const testData = {
  
  // 1. Catégorie
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
      niveau: 0,
      mots_cles: "outils, bricolage, réparation, construction",
      metadata: {
        keywords: ["bricolage", "outils"],
        created_by: "system"
      }
    }
  },
  
  // 2. Tag
  tags: {
    data: {
      nom: "urgent",
      description: "Élément nécessaire rapidement",
      couleur: "#EF4444",
      nombreUtilisations: 0,
      populaire: false,
      metadata: {
        usage_context: "time_sensitive"
      }
    }
  },
  
  // 3. Bob complet avec tous les nouveaux champs
  echanges: {
    data: {
      titre: "Perceuse Bosch Pro 18V",
      description: "Perceuse sans fil professionnelle en excellent état. Batterie neuve, mallette complète avec forets.",
      type: "pret",
      statut: "actif",
      dureeJours: 7,
      conditions: "Utilisation soigneuse demandée. Retour propre avec tous les accessoires.",
      bobizGagnes: 25,
      
      // Nouveaux champs de catégorisation
      urgence: "normale",
      mots_cles: "perceuse, bricolage, pro, 18V",
      
      // Géolocalisation avancée
      ville: "Paris",
      rayonAcceptable: 15,
      livraisonPossible: true,
      
      // Économie avancée
      bobizProposed: 25,
      negociable: true,
      
      // Dates détaillées
      dateRenduPrevu: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      
      // Interaction sociale
      vues: 0,
      interessesCount: 0,
      partages: 0,
      signalements: 0,
      
      // Chat
      chatActif: true,
      messagesCount: 0,
      
      // Métadonnées
      flexibiliteHoraire: true,
      sourceCreation: "app",
      versionApp: "1.0.0",
      metadata: {
        brand: "Bosch",
        model: "GSR 18V-28",
        year: "2023",
        accessories: ["charger", "battery", "drill_bits", "case"],
        condition: "excellent",
        estimated_value: 200
      }
    }
  },
  
  // 4. Contact complet
  contacts: {
    data: {
      nom: "Martin",
      prenom: "Pierre",
      telephone: "+33612345679",
      email: "pierre.martin@example.com",
      surnom: "Pierre le Bricoleur",
      
      // Relation sociale
      statut: "ami",
      relation: "Voisin du dessus, bricoleur expérimenté",
      confiance: "forte",
      
      // État Bob
      aBob: true,
      invitationAcceptee: true,
      nombreInvitationsEnvoyees: 1,
      
      // Interaction
      nombreBobsEnsemble: 5,
      dernierBobEnsemble: new Date().toISOString(),
      noteRelation: 4.8,
      favoris: true,
      
      // Historique
      dateAjout: new Date().toISOString(),
      dernierContact: new Date().toISOString(),
      sourceAjout: "telephone",
      
      // Notes
      notes: "Très fiable, excellent bricoleur. Toujours prêt à aider.",
      metadata: {
        specialites: ["plomberie", "électricité", "menuiserie"],
        disponibilite: "weekend_soir",
        tools_owned: ["perceuse", "scie", "niveau"]
      }
    }
  },
  
  // 5. Message complet
  messages: {
    data: {
      contenu: "Salut Pierre ! Ta perceuse est-elle toujours disponible pour ce weekend ?",
      type: "texte",
      
      // État message
      lu: false,
      supprime: false,
      edite: false,
      
      // Métadonnées
      metadataMessage: {
        platform: "mobile",
        app_version: "1.0.0",
        message_id: "msg_" + Date.now()
      },
      version: "1.0"
    }
  },
  
  // 6. Transaction complète
  transactions: {
    data: {
      montant: 25,
      type: "gain",
      statut: "validee",
      source: "bob_termine",
      description: "Bobiz gagnés pour prêt de perceuse à Pierre",
      automatique: true,
      dateValidation: new Date().toISOString(),
      referenceExterne: "bob_" + Date.now(),
      metadata: {
        bob_id: null, // Sera lié après création du Bob
        transaction_type: "peer_to_peer",
        fees: 0
      }
    }
  },
  
  // 7. Évaluation complète
  evaluations: {
    data: {
      note: 5,
      commentaire: "Excellent échange ! Perceuse en parfait état, Pierre très sympa et ponctuel. Je recommande à 100% !",
      type: "bob",
      
      // Critères détaillés
      ponctualite: 5,
      communication: 5,
      qualiteService: 5,
      confiance: 5,
      recommande: true,
      
      // Visibilité
      publique: true,
      signale: false,
      utile: 0,
      
      metadata: {
        review_id: "review_" + Date.now(),
        helpful_votes: 0,
        review_length: "detailed"
      }
    }
  },
  
  // 8. Notification complète
  notifications: {
    data: {
      titre: "Bob accepté !",
      message: "Pierre a accepté votre demande de prêt pour la perceuse Bosch. Vous pouvez maintenant organiser la remise.",
      type: "bob",
      
      // État
      lue: false,
      archivee: false,
      
      // Action
      actionRequise: true,
      actionType: "organize_handover",
      actionData: {
        bob_id: null, // Sera lié après création
        next_step: "contact_lender",
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      },
      actionUrl: "/bobs/organize-handover",
      
      // Delivery
      canalEnvoi: "app",
      dateEnvoi: new Date().toISOString(),
      tentativesEnvoi: 1,
      
      // Priorité
      priorite: "haute",
      
      metadata: {
        notification_id: "notif_" + Date.now(),
        auto_generated: true,
        category: "bob_interaction"
      }
    }
  },
  
  // 9. Groupe de contacts
  'groupes-contacts': {
    data: {
      nom: "Bricoleurs du quartier",
      description: "Mes amis bricoleurs et voisins serviables",
      icone: "🔨",
      couleur: "#3B82F6",
      type: "bricoleurs",
      prive: true,
      nombreMembres: 0,
      nombreBobsGroupe: 0,
      metadata: {
        created_date: new Date().toISOString(),
        group_type: "hobby_based",
        activity_level: "high"
      }
    }
  }
};

async function validateCompleteArchitecture() {
  console.log('🏗️ Validation complète de l\'architecture Strapi Bob...\n');
  
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
    
    // 2. Tester chaque collection avec données complètes
    console.log('🧪 === TEST COMPLET DES COLLECTIONS ===\n');
    
    const results = {};
    
    for (const [collectionName, data] of Object.entries(testData)) {
      try {
        console.log(`🔄 Test complet /${collectionName}...`);
        
        const response = await makeRequest(`${API_BASE_URL}/api/${collectionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.status === 201) {
          const result = JSON.parse(response.body);
          results[collectionName] = result.data;
          
          console.log(`   ✅ ${collectionName} - Création réussie avec ID: ${result.data.id}`);
          
          // Compter les champs sauvegardés
          const fieldsCount = Object.keys(result.data).length - 5; // Exclure les champs Strapi auto
          console.log(`   📊 ${fieldsCount} champs personnalisés sauvegardés`);
          
          // Vérifier les champs metadata
          if (result.data.metadata) {
            console.log(`   🔗 Métadonnées JSON: ${Object.keys(result.data.metadata).length} propriétés`);
          }
          
        } else if (response.status === 404) {
          console.log(`   ❌ Collection /${collectionName} n'existe pas - À créer dans Strapi admin`);
          results[collectionName] = { error: 'Collection manquante' };
          
        } else if (response.status === 400) {
          const errorBody = JSON.parse(response.body);
          console.log(`   ⚠️ Champs manquants - ${errorBody.error?.message}`);
          console.log(`   💡 Champ invalide: ${errorBody.error?.details?.key}`);
          results[collectionName] = { error: 'Champs manquants', details: errorBody.error?.details };
          
        } else {
          console.log(`   ❌ Erreur ${response.status}: ${response.body.substring(0, 100)}`);
          results[collectionName] = { error: `Status ${response.status}` };
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur réseau: ${error.message}`);
        results[collectionName] = { error: error.message };
      }
      console.log('');
    }
    
    // 3. Résumé des résultats
    console.log('📊 === RÉSUMÉ DE LA VALIDATION ===\n');
    
    const successful = Object.entries(results).filter(([_, result]) => result.id).length;
    const missing = Object.entries(results).filter(([_, result]) => result.error === 'Collection manquante').length;
    const incomplete = Object.entries(results).filter(([_, result]) => result.error === 'Champs manquants').length;
    const errors = Object.entries(results).filter(([_, result]) => result.error && !['Collection manquante', 'Champs manquants'].includes(result.error)).length;
    
    console.log(`✅ Collections fonctionnelles: ${successful}/9`);
    console.log(`❌ Collections manquantes: ${missing}/9`);
    console.log(`⚠️ Collections incomplètes: ${incomplete}/9`);
    console.log(`🔥 Erreurs techniques: ${errors}/9`);
    console.log('');
    
    // 4. Plan d'action
    console.log('📋 === PLAN D\'ACTION ===\n');
    
    if (missing > 0) {
      console.log('🏗️ Collections à créer dans Strapi admin:');
      Object.entries(results).forEach(([name, result]) => {
        if (result.error === 'Collection manquante') {
          console.log(`   - ${name}`);
        }
      });
      console.log('');
    }
    
    if (incomplete > 0) {
      console.log('🔧 Collections à compléter (champs manquants):');
      Object.entries(results).forEach(([name, result]) => {
        if (result.error === 'Champs manquants') {
          console.log(`   - ${name}: ${result.details?.key || 'Voir détails'}`);
        }
      });
      console.log('');
    }
    
    if (successful === 9) {
      console.log('🎉 SUCCÈS COMPLET ! Architecture Strapi parfaitement configurée !');
      console.log('🚀 Vous pouvez maintenant sauvegarder TOUT l\'écosystème Bob !');
    } else {
      console.log(`📈 Progression: ${Math.round(successful/9*100)}% de l'architecture configurée`);
      console.log('📖 Consultez STRAPI-CONFIGURATION-GUIDE.md pour compléter');
    }
    
    // 5. Test des relations (si collections créées)
    if (successful >= 3) {
      console.log('\n🔗 === TEST DES RELATIONS ===\n');
      console.log('💡 Une fois toutes les collections créées, tester les relations:');
      console.log('   - User → Echanges (créateur)');
      console.log('   - Echanges → Categories'); 
      console.log('   - Echanges → Tags');
      console.log('   - User → Contacts');
      console.log('   - Echanges → Messages');
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

validateCompleteArchitecture();