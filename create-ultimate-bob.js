// create-ultimate-bob.js - Créer un Bob avec TOUS les champs disponibles actuellement
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

async function createUltimateBob() {
  console.log('🚀 Création d\'un Bob ULTIME avec TOUS les champs disponibles...\n');
  
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
    
    // 2. Créer un Bob ultra-détaillé avec TOUS les champs disponibles
    console.log('🎯 Création Bob "Kit Outils Professionnel Makita"...\n');
    
    const ultimateBobData = {
      data: {
        // ===============================================
        // TOUS LES CHAMPS ACTUELLEMENT SUPPORTÉS
        // ===============================================
        
        // === INFORMATIONS DE BASE ===
        titre: "Kit Outils Professionnel Makita DLX2131 - Perceuse + Visseuse 18V",
        
        description: `🔥 **KIT PROFESSIONNEL MAKITA DLX2131 - État neuf**

🛠️ **Composition complète:**
• Perceuse à percussion DHP482 18V (62 Nm, mandrin 13mm)
• Visseuse à chocs DTD152 18V (165 Nm, embouts magnétiques)
• 2 batteries Li-Ion BL1850B 18V 5.0Ah (indicateur charge)
• Chargeur rapide DC18RC (30 min pour 80%)
• Mallette de transport Makpac Connecteur Case 3
• Coffret 38 pièces (forets, embouts, adaptateurs)

⚡ **Performances:**
• Vitesses variables avec gâchette progressive
• Éclairage LED intégré sur les 2 outils
• Poignées ergonomiques antidérapantes
• Système de protection contre surcharge
• Compatible toute la gamme Makita 18V LXT

💎 **État exceptionnel:**
• Acheté il y a 2 mois (facture disponible)
• Utilisé 3 fois seulement pour montage meubles
• Aucune rayure, aucun choc
• Batteries encore sous garantie (2 ans)
• Notice et certificats inclus

🎯 **Utilisation recommandée:**
• Bricolage intensif, rénovation
• Travaux professionnels légers
• Montage/démontage mobilier
• Perçage béton, bois, métal
• Vissage précision haute cadence

💰 **Valeur neuve:** 449€ (prix actuel magasins)
🤝 **Échange de confiance** - Matériel de qualité professionnelle`,

        type: "pret",
        statut: "actif",
        
        // === CONDITIONS DÉTAILLÉES ===
        dureeJours: 5, // Plus long car kit complet
        
        conditions: `📋 **CONDITIONS D'UTILISATION STRICTES**

✅ **Utilisation autorisée:**
• Bricolage, rénovation, montage meubles
• Usage domestique et semi-professionnel
• Respect des consignes sécurité Makita
• Port EPI obligatoire (lunettes, gants)

🚫 **Utilisations interdites:**
• Travaux de chantier intensifs > 4h/jour
• Prêt ou sous-location à des tiers
• Perçage diamètre > 13mm sans foret adapté
• Usage sous intempéries (outils non étanches)
• Modification ou réparation par utilisateur

🔒 **Sécurité et retour:**
• État identique au prêt (photos avant/après)
• Batteries rechargées avant retour
• Nettoyage complet (soufflette + chiffon)
• Vérification mallette complète (38 pièces)
• Retour dans mallette d'origine obligatoire

💰 **Caution:** 150€ (restituée intégralement si respect conditions)
⏰ **Flexibilité:** Prolongation possible si demandée 24h avant échéance
🚨 **Urgence:** Retour immédiat en cas problème technique`,

        // === ÉCONOMIE BOBIZ ===
        bobizGagnes: 85, // Kit professionnel = plus de Bobiz
        
        // === GÉOLOCALISATION PRÉCISE ===
        adresse: "12 Rue des Artisans, Quartier République, 75011 Paris",
        latitude: 48.8631,
        longitude: 2.3708,
        
        // === DATES ET PLANNING ===
        dateExpiration: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // Expire dans 14 jours
        dateCreation: new Date().toISOString(),
        dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Disponible demain
        dateFin: new Date(Date.now() + 19 * 24 * 60 * 60 * 1000).toISOString()  // Fin dans 19 jours
      }
    };
    
    console.log('📊 CHAMPS UTILISÉS (actuellement supportés):');
    console.log(`• titre: ${ultimateBobData.data.titre.length} caractères`);
    console.log(`• description: ${ultimateBobData.data.description.length} caractères`);
    console.log(`• conditions: ${ultimateBobData.data.conditions.length} caractères`);
    console.log(`• bobizGagnes: ${ultimateBobData.data.bobizGagnes} points`);
    console.log(`• géolocalisation: Précise (latitude/longitude)`);
    console.log(`• dates: Planification complète sur 19 jours`);
    console.log('');
    
    // 3. Créer le Bob ultime
    console.log('🔄 Envoi vers Strapi...\n');
    
    const response = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ultimateBobData)
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (response.status === 201) {
      const createdBob = JSON.parse(response.body);
      
      console.log('🎉 BOB ULTIME CRÉÉ AVEC SUCCÈS!\n');
      console.log('📋 === RÉSUMÉ DU BOB CRÉÉ ===');
      console.log(`🆔 ID: ${createdBob.data.id}`);
      console.log(`📄 Titre: ${createdBob.data.titre}`);
      console.log(`🏆 Bobiz: ${createdBob.data.bobizGagnes}`);
      console.log(`📍 Adresse: ${createdBob.data.adresse}`);
      console.log(`🗺️ Coordonnées: ${createdBob.data.latitude}, ${createdBob.data.longitude}`);
      console.log(`⏱️ Durée: ${createdBob.data.dureeJours} jours`);
      console.log(`📅 Expire le: ${new Date(createdBob.data.dateExpiration).toLocaleDateString('fr-FR')}`);
      console.log(`🚀 Début: ${new Date(createdBob.data.dateDebut).toLocaleDateString('fr-FR')}`);
      console.log(`🏁 Fin: ${new Date(createdBob.data.dateFin).toLocaleDateString('fr-FR')}`);
      
      console.log('\n📊 === STATISTIQUES DE SAUVEGARDE ===');
      const totalFields = Object.keys(createdBob.data).length;
      const customFields = totalFields - 5; // Exclure les champs Strapi auto
      const descriptionSize = createdBob.data.description.length;
      const conditionsSize = createdBob.data.conditions.length;
      const totalTextSize = descriptionSize + conditionsSize + createdBob.data.titre.length;
      
      console.log(`🏗️ Total champs sauvegardés: ${totalFields}`);
      console.log(`🎯 Champs personnalisés: ${customFields}`);
      console.log(`📝 Taille totale texte: ${totalTextSize} caractères`);
      console.log(`💾 Description: ${descriptionSize} caractères`);
      console.log(`📋 Conditions: ${conditionsSize} caractères`);
      console.log(`📍 Géolocalisation: Précise avec coordonnées`);
      console.log(`📅 Planification: Dates complètes sur ${Math.round((new Date(createdBob.data.dateFin) - new Date(createdBob.data.dateDebut)) / (1000*60*60*24))} jours`);
      
      console.log('\n🎯 === COMPARAISON AVANT/APRÈS EXTENSION ===');
      console.log('📊 ACTUELLEMENT SAUVEGARDÉ:');
      console.log(`   • ${customFields} champs personnalisés`);
      console.log(`   • ${totalTextSize} caractères de contenu`);
      console.log(`   • Géolocalisation de base`);
      console.log(`   • Dates essentielles`);
      console.log('');
      console.log('🚀 APRÈS EXTENSION STRAPI (selon notre architecture):');
      console.log('   • 30+ champs personnalisés (+25 champs)');
      console.log('   • Métadonnées JSON illimitées');
      console.log('   • Géolocalisation avancée (rayon, livraison, ville)');
      console.log('   • Interaction sociale (vues, partages, signalements)');
      console.log('   • Catégorisation (urgence, tags, mots-clés)');
      console.log('   • Économie avancée (négociation, propositions)');
      console.log('   • Chat intégré (messages, actions)');
      console.log('   • Relations (créateur, participants, contacts)');
      
      console.log('\n📄 === DONNÉES COMPLÈTES SAUVEGARDÉES ===');
      console.log(JSON.stringify(createdBob.data, null, 2));
      
      // 4. Test de récupération pour vérifier persistance
      console.log('\n🔍 === VÉRIFICATION PERSISTANCE ===');
      
      const verifyResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${createdBob.data.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (verifyResponse.status === 200) {
        console.log('✅ Bob correctement persisté en base');
        console.log('✅ Toutes les données sont récupérables');
      }
      
      // 5. Lister tous les Bobs pour voir la collection
      console.log('\n📚 === COLLECTION ACTUELLE ===');
      
      const listResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (listResponse.status === 200) {
        const allBobs = JSON.parse(listResponse.body);
        console.log(`📊 Total Bobs en base: ${allBobs.data.length}`);
        console.log('\n📋 Liste des Bobs:');
        allBobs.data.forEach((bob, index) => {
          console.log(`   ${index + 1}. "${bob.titre}" (${bob.type}, ${bob.bobizGagnes} Bobiz)`);
        });
      }
      
    } else {
      console.log('❌ Échec création Bob');
      console.log('📄 Réponse:', response.body);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createUltimateBob();