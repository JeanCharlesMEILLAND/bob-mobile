// create-rich-bob.js - Créer un Bob de prêt avec le maximum d'informations
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

async function createRichBob() {
  console.log('🎯 Création d\'un Bob de prêt enrichi avec maximum d\'informations...\n');
  
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
    
    // 2. Créer un Bob de prêt ultra-détaillé
    console.log('📝 Création Bob "Tondeuse électrique Ryobi"...\n');
    
    const richBobData = {
      data: {
        // === INFORMATIONS DE BASE ===
        titre: "Tondeuse électrique Ryobi RLM18C34H25 - Batterie 36V",
        description: `Tondeuse électrique sans fil Ryobi en excellent état, achetée il y a 6 mois. 
        
🔋 **Caractéristiques:**
- Batterie 36V (2 x 18V) avec autonomie 45 minutes
- Largeur de coupe 34cm, hauteur réglable 20-70mm
- Ramassage par bac 40L + mulching possible
- Démarrage par clé de sécurité

🛠️ **Accessoires inclus:**
- 2 batteries 18V 4.0Ah
- Chargeur rapide 2A
- Bac de ramassage 40L
- Clé de sécurité + notice

⚠️ **État:** Excellent, toujours gardée au garage. Lames affûtées récemment.
        
🏡 **Parfait pour:** Jardins jusqu'à 250m², silencieuse (idéal quartier résidentiel)`,
        
        type: "pret",
        statut: "actif",
        
        // === CONDITIONS D'UTILISATION ===
        dureeJours: 3,
        conditions: `✅ **Conditions d'utilisation:**
- Utilisation uniquement sur terrain sec
- Vider le bac après chaque usage
- Ranger à l'abri (garage/remise)
- Batteries à recharger si besoin

🚫 **Interdictions:**
- Pas de prêt à des tiers
- Ne pas tondre sous la pluie
- Ne pas forcer sur terrain très pentu

💰 **Caution:** Aucune (confiance)
🔧 **Entretien:** Nettoyage simple au jet d'eau après usage`,
        
        // === ÉCONOMIE BOBIZ ===
        bobizGagnes: 35, // Plus de Bobiz car matériel coûteux
        
        // === GÉOLOCALISATION (actuellement supportés) ===
        adresse: "15 Avenue des Champs, 75008 Paris",
        latitude: 48.8698,
        longitude: 2.3072,
        
        // === CHAMPS ÉTENDUS (testés progressivement) ===
        // Ces champs seront ajoutés un par un pour voir lesquels passent
      }
    };
    
    console.log('📦 Données de base à envoyer:');
    console.log(JSON.stringify(richBobData, null, 2));
    console.log('\n🔄 Envoi vers Strapi...\n');
    
    // 3. Créer le Bob de base
    const response = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(richBobData)
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 201) {
      const createdBob = JSON.parse(response.body);
      console.log('🎉 Bob créé avec succès!');
      console.log(`📋 ID: ${createdBob.data.id}`);
      console.log(`📄 Titre: ${createdBob.data.titre}`);
      console.log(`🏆 Bobiz: ${createdBob.data.bobizGagnes}`);
      console.log(`📍 Localisation: ${createdBob.data.adresse}`);
      console.log(`⏱️ Durée: ${createdBob.data.dureeJours} jours`);
      
      console.log('\n📋 Réponse complète:');
      console.log(JSON.stringify(createdBob.data, null, 2));
      
      // 4. Maintenant tester l'ajout de champs étendus un par un
      console.log('\n🧪 === TEST DES CHAMPS ÉTENDUS ===\n');
      
      const extendedFields = {
        // Champs probablement supportés
        ville: "Paris",
        flexibiliteHoraire: true,
        chatActif: true,
        sourceCreation: "app",
        versionApp: "1.0.0",
        
        // Champs métier spécifiques
        urgence: "normale",
        mots_cles: "tondeuse, jardin, électrique, batterie, ryobi",
        rayonAcceptable: 5,
        livraisonPossible: true,
        bobizProposed: 35,
        negociable: false,
        
        // Dates
        dateRenduPrevu: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Compteurs interaction
        vues: 0,
        interessesCount: 0,
        partages: 0,
        signalements: 0,
        messagesCount: 0,
        
        // Métadonnées JSON
        metadata: {
          brand: "Ryobi",
          model: "RLM18C34H25",
          year: 2024,
          purchase_price: 299,
          condition: "excellent",
          warranty_until: "2026-12-31",
          accessories: [
            "2x batteries 18V 4.0Ah",
            "chargeur rapide",
            "bac ramassage 40L",
            "clé sécurité",
            "notice"
          ],
          specifications: {
            cutting_width: "34cm",
            cutting_height: "20-70mm", 
            battery_life: "45min",
            collection_capacity: "40L",
            weight: "15kg",
            noise_level: "low"
          },
          usage_tips: [
            "Idéal terrain jusqu'à 250m²",
            "Très silencieuse",
            "Mulching possible",
            "Démarrage sécurisé"
          ],
          owner_notes: "Achetée neuve chez Leroy Merlin. Facture disponible. Toujours entretenue."
        }
      };
      
      // Tester l'update avec champs étendus
      for (const [fieldName, fieldValue] of Object.entries(extendedFields)) {
        try {
          console.log(`🔄 Test champ: ${fieldName}...`);
          
          const updateData = {
            data: {
              [fieldName]: fieldValue
            }
          };
          
          const updateResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${createdBob.data.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updateData)
          });
          
          if (updateResponse.status === 200) {
            console.log(`   ✅ ${fieldName}: Accepté`);
          } else {
            const errorBody = JSON.parse(updateResponse.body);
            console.log(`   ❌ ${fieldName}: Rejeté (${errorBody.error?.message || 'Erreur'})`);
          }
          
        } catch (error) {
          console.log(`   ❌ ${fieldName}: Erreur réseau`);
        }
      }
      
      // 5. Récupérer le Bob final pour voir tous les champs sauvegardés
      console.log('\n📄 === BOB FINAL SAUVEGARDÉ ===\n');
      
      const finalResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${createdBob.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (finalResponse.status === 200) {
        const finalBob = JSON.parse(finalResponse.body);
        console.log('✅ Bob final avec tous les champs acceptés:');
        console.log(JSON.stringify(finalBob.data, null, 2));
        
        // Compter les champs sauvegardés
        const totalFields = Object.keys(finalBob.data).length;
        const customFields = totalFields - 5; // Exclure id, documentId, createdAt, updatedAt, publishedAt
        
        console.log(`\n📊 STATISTIQUES:`);
        console.log(`   🏗️ Total champs: ${totalFields}`);
        console.log(`   🎯 Champs personnalisés: ${customFields}`);
        console.log(`   💾 Taille description: ${finalBob.data.description?.length || 0} caractères`);
        console.log(`   📝 Taille conditions: ${finalBob.data.conditions?.length || 0} caractères`);
        console.log(`   🗂️ Métadonnées: ${finalBob.data.metadata ? 'Présentes' : 'Absentes'}`);
      }
      
    } else {
      console.log('❌ Échec création Bob');
      console.log('📄 Réponse:', response.body);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createRichBob();