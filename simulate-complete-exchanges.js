// simulate-complete-exchanges.js - Simuler des échanges Bob complets
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

// Scénarios d'échanges complets à simuler
const exchangeScenarios = [
  {
    name: "Marie prête sa scie à Thomas",
    lender: "marie-bricoleuse",
    borrower: "thomas-chef", 
    bobTitle: "Scie circulaire Makita",
    scenario: [
      {
        phase: "interet",
        message: "Salut Marie ! Ta scie circulaire m'intéresse pour refaire ma cuisine. Elle est toujours disponible ?",
        sender: "borrower"
      },
      {
        phase: "details",
        message: "Salut Thomas ! Oui elle est dispo. C'est pour découper du bois ? Elle a une lame carbure neuve, parfaite pour ça.",
        sender: "lender"
      },
      {
        phase: "conditions", 
        message: "Parfait ! C'est pour découper des planches mélaminé. Tu peux me la prêter ce weekend ?",
        sender: "borrower"
      },
      {
        phase: "acceptation",
        message: "Pas de souci ! Tu peux la récupérer samedi matin. Je te montre comment bien s'en servir.",
        sender: "lender"
      },
      {
        phase: "organisation",
        message: "Super ! Je passe vers 9h30 samedi. J'amène mes lunettes de protection. Merci beaucoup !",
        sender: "borrower"
      },
      {
        phase: "remerciement",
        message: "Parfait ! N'hésite pas si tu as des questions. À samedi !",
        sender: "lender"
      }
    ],
    evaluation: {
      note: 5,
      commentaire: "Excellent échange ! Scie en parfait état, Marie très sympa et de bon conseil. Je recommande !"
    }
  },
  {
    name: "Sophie demande une consultation jardinage à Thomas (service croisé)",
    lender: "thomas-chef",
    borrower: "sophie-jardin",
    bobTitle: "Cours de cuisine italienne",
    scenario: [
      {
        phase: "interet",
        message: "Coucou Thomas ! Ton cours de pâtes fraîches me tente ! En échange, je peux te faire un diagnostic jardin ?",
        sender: "borrower"
      },
      {
        phase: "details",
        message: "Salut Sophie ! Excellente idée ! Mon balcon a besoin d'aide... Tes conseils contre mon cours ?",
        sender: "lender"
      },
      {
        phase: "organisation",
        message: "Parfait ! Je peux venir voir ton balcon mardi, et tu me fais le cours jeudi ?",
        sender: "borrower"
      },
      {
        phase: "acceptation",
        message: "Deal ! Mardi 18h pour le diagnostic, jeudi 19h pour les pâtes. Ça marche !",
        sender: "lender"
      }
    ],
    evaluation: {
      note: 5,
      commentaire: "Échange de services parfait ! Diagnostic très professionnel, et le cours était fantastique !"
    }
  },
  {
    name: "Lucas emprunte l'imprimante 3D de Sophie (échange technique)",
    lender: "lucas-tech",
    borrower: "sophie-jardin", 
    bobTitle: "Imprimante 3D Prusa",
    scenario: [
      {
        phase: "interet",
        message: "Salut Lucas ! Ton imprimante 3D pourrait m'aider pour des supports de plantes. Tu peux me former ?",
        sender: "borrower"
      },
      {
        phase: "expertise",
        message: "Avec plaisir Sophie ! J'ai plein de modèles de pots et supports. Formation incluse bien sûr !",
        sender: "lender"
      },
      {
        phase: "technique",
        message: "Génial ! J'aimerais imprimer des étiquettes de jardin aussi. C'est faisable ?",
        sender: "borrower"
      },
      {
        phase: "solution",
        message: "Absolument ! J'ai tout : filaments couleur, modèles personnalisables. On fait ça quand ?",
        sender: "lender"
      },
      {
        phase: "planification",
        message: "Parfait ! Mercredi soir pour la formation ? Et je garde l'imprimante le weekend ?",
        sender: "borrower"
      }
    ],
    evaluation: {
      note: 5,
      commentaire: "Lucas est un excellent professeur ! Formation top, matériel parfait. Mes plantes ont de beaux supports maintenant !"
    }
  }
];

// Messages système pour les différentes phases
const systemMessages = {
  bob_interesse: "🔔 {borrower} s'intéresse à votre Bob \"{bobTitle}\"",
  bob_accepte: "✅ {lender} a accepté votre demande pour \"{bobTitle}\"",
  bob_refuse: "❌ {lender} a décliné votre demande pour \"{bobTitle}\"", 
  echange_organise: "📅 Échange organisé entre {lender} et {borrower}",
  echange_termine: "✅ Échange terminé : \"{bobTitle}\"",
  evaluation_recue: "⭐ Nouvelle évaluation reçue de {user}"
};

async function simulateCompleteExchanges() {
  console.log('🎭 SIMULATION D\'ÉCHANGES BOB COMPLETS\n');
  console.log('🎯 Objectif: Simuler des échanges réalistes de A à Z');
  console.log('📋 Scénarios: Conversations, négociations, acceptations, évaluations\n');
  
  try {
    // 1. Se connecter et récupérer les tokens des utilisateurs
    console.log('🔑 === RÉCUPÉRATION DES TOKENS UTILISATEURS ===\n');
    
    const users = ['marie-bricoleuse', 'thomas-chef', 'sophie-jardin', 'lucas-tech'];
    const userTokens = {};
    const userProfiles = {};
    
    for (const username of users) {
      try {
        const loginResponse = await makeRequest(`${API_BASE_URL}/api/auth/local`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: username,
            password: 'BobPassword123!'
          })
        });
        
        if (loginResponse.status === 200) {
          const result = JSON.parse(loginResponse.body);
          userTokens[username] = result.jwt;
          userProfiles[username] = result.user;
          console.log(`✅ ${username} connecté (ID: ${result.user.id})`);
        }
      } catch (error) {
        console.log(`❌ ${username}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 ${Object.keys(userTokens).length}/4 utilisateurs connectés\n`);
    
    // 2. Récupérer les Bobs existants pour les échanges
    console.log('📦 === RÉCUPÉRATION DES BOBS EXISTANTS ===\n');
    
    const allBobsResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let availableBobs = [];
    if (allBobsResponse.status === 200) {
      const bobs = JSON.parse(allBobsResponse.body);
      availableBobs = bobs.data;
      console.log(`📋 ${availableBobs.length} Bobs disponibles pour échanges`);
      
      // Afficher les Bobs par utilisateur (approximatif)
      const bobsByUser = availableBobs.reduce((acc, bob) => {
        const title = bob.titre.toLowerCase();
        if (title.includes('scie') || title.includes('peinture')) acc['marie-bricoleuse'] = acc['marie-bricoleuse'] || [];
        else if (title.includes('robot') || title.includes('cours')) acc['thomas-chef'] = acc['thomas-chef'] || [];
        else if (title.includes('motoculteur') || title.includes('consultation')) acc['sophie-jardin'] = acc['sophie-jardin'] || [];
        else if (title.includes('imprimante') || title.includes('domotique')) acc['lucas-tech'] = acc['lucas-tech'] || [];
        
        if (title.includes('scie') || title.includes('peinture')) acc['marie-bricoleuse'].push(bob);
        else if (title.includes('robot') || title.includes('cours')) acc['thomas-chef'].push(bob);
        else if (title.includes('motoculteur') || title.includes('consultation')) acc['sophie-jardin'].push(bob);
        else if (title.includes('imprimante') || title.includes('domotique')) acc['lucas-tech'].push(bob);
        
        return acc;
      }, {});
      
      for (const [user, bobs] of Object.entries(bobsByUser)) {
        console.log(`   ${user}: ${bobs.length} Bob(s)`);
      }
    }
    console.log('');
    
    // 3. Simuler chaque scénario d'échange
    for (const [index, scenario] of exchangeScenarios.entries()) {
      console.log(`🎬 === SCÉNARIO ${index + 1}: ${scenario.name.toUpperCase()} ===\n`);
      
      if (!userTokens[scenario.lender] || !userTokens[scenario.borrower]) {
        console.log('❌ Utilisateurs manquants pour ce scénario\n');
        continue;
      }
      
      // Trouver le Bob correspondant
      const targetBob = availableBobs.find(bob => 
        bob.titre.toLowerCase().includes(scenario.bobTitle.toLowerCase())
      );
      
      if (!targetBob) {
        console.log(`❌ Bob "${scenario.bobTitle}" non trouvé\n`);
        continue;
      }
      
      console.log(`📦 Bob sélectionné: "${targetBob.titre}" (${targetBob.bobizGagnes} Bobiz)`);
      console.log(`👤 Prêteur: ${scenario.lender}`);
      console.log(`👤 Emprunteur: ${scenario.borrower}\n`);
      
      // 4. Simuler la conversation phase par phase
      console.log('💬 Conversation simulée:');
      
      for (const [msgIndex, msgData] of scenario.scenario.entries()) {
        const senderToken = userTokens[msgData.sender === 'lender' ? scenario.lender : scenario.borrower];
        const senderUser = msgData.sender === 'lender' ? scenario.lender : scenario.borrower;
        
        console.log(`\n   📝 Phase ${msgData.phase}:`);
        console.log(`   👤 ${senderUser}: "${msgData.message}"`);
        
        // Créer le message (avec les champs disponibles actuellement)
        const messageData = {
          data: {
            contenu: msgData.message,
            // Note: champs étendus non disponibles pour l'instant
            // type: "texte",
            // expediteur_id: userProfiles[senderUser].id,
            // echange_id: targetBob.id,
            // metadataMessage: {
            //   phase: msgData.phase,
            //   scenario: scenario.name,
            //   conversation_id: `conv_${targetBob.id}_${index}`
            // }
          }
        };
        
        try {
          const messageResponse = await makeRequest(`${API_BASE_URL}/api/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${senderToken}`
            },
            body: JSON.stringify(messageData)
          });
          
          if (messageResponse.status === 200 || messageResponse.status === 201) {
            console.log(`      ✅ Message sauvegardé`);
          } else {
            const errorBody = JSON.parse(messageResponse.body);
            console.log(`      ⚠️ Message: ${errorBody.error?.message || 'Erreur'}`);
          }
          
        } catch (error) {
          console.log(`      ❌ Message: ${error.message}`);
        }
        
        // Petite pause pour réalisme
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 5. Simuler l'acceptation et changement de statut du Bob
      console.log(`\n   🔄 Changement statut Bob: actif → en_cours`);
      
      try {
        const updateBobResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${targetBob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userTokens[scenario.lender]}`
          },
          body: JSON.stringify({
            data: {
              statut: 'en_cours',
              dateDebut: new Date().toISOString()
            }
          })
        });
        
        if (updateBobResponse.status === 200) {
          console.log(`      ✅ Bob maintenant "en_cours"`);
        } else {
          console.log(`      ⚠️ Changement statut échoué`);
        }
        
      } catch (error) {
        console.log(`      ❌ Statut: ${error.message}`);
      }
      
      // 6. Simuler la fin de l'échange et l'évaluation
      console.log(`\n   ⭐ Évaluation finale:`);
      console.log(`   Note: ${scenario.evaluation.note}/5`);
      console.log(`   Commentaire: "${scenario.evaluation.commentaire}"`);
      
      // Créer l'évaluation (si collection disponible)
      const evaluationData = {
        data: {
          note: scenario.evaluation.note,
          commentaire: scenario.evaluation.commentaire,
          type: 'bob',
          publique: true,
          recommande: scenario.evaluation.note >= 4
        }
      };
      
      try {
        const evalResponse = await makeRequest(`${API_BASE_URL}/api/evaluations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userTokens[scenario.borrower]}`
          },
          body: JSON.stringify(evaluationData)
        });
        
        if (evalResponse.status === 200 || evalResponse.status === 201) {
          console.log(`      ✅ Évaluation sauvegardée`);
        } else {
          console.log(`      ⚠️ Collection évaluations non disponible`);
        }
        
      } catch (error) {
        console.log(`      ❌ Évaluation: ${error.message}`);
      }
      
      // 7. Finaliser le Bob
      try {
        const finalizeBobResponse = await makeRequest(`${API_BASE_URL}/api/echanges/${targetBob.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userTokens[scenario.lender]}`
          },
          body: JSON.stringify({
            data: {
              statut: 'termine',
              dateFin: new Date().toISOString()
            }
          })
        });
        
        if (finalizeBobResponse.status === 200) {
          console.log(`      ✅ Bob terminé avec succès !`);
        }
        
      } catch (error) {
        console.log(`      ❌ Finalisation: ${error.message}`);
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // 8. Statistiques finales
    console.log('📊 === STATISTIQUES DES ÉCHANGES SIMULÉS ===\n');
    
    // Compter les messages créés
    const allMessagesResponse = await makeRequest(`${API_BASE_URL}/api/messages`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let totalMessages = 0;
    if (allMessagesResponse.status === 200) {
      const messages = JSON.parse(allMessagesResponse.body);
      totalMessages = messages.data.length;
    }
    
    // Compter les Bobs en cours et terminés
    const updatedBobsResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let bobsStats = { actif: 0, en_cours: 0, termine: 0 };
    if (updatedBobsResponse.status === 200) {
      const bobs = JSON.parse(updatedBobsResponse.body);
      bobs.data.forEach(bob => {
        bobsStats[bob.statut] = (bobsStats[bob.statut] || 0) + 1;
      });
    }
    
    console.log('🎉 SIMULATION D\'ÉCHANGES TERMINÉE !');
    console.log('');
    console.log(`💬 Messages de conversation: ${totalMessages}`);
    console.log(`🔄 Bobs en cours: ${bobsStats.en_cours || 0}`);
    console.log(`✅ Bobs terminés: ${bobsStats.termine || 0}`);
    console.log(`📦 Bobs actifs: ${bobsStats.actif || 0}`);
    console.log('');
    console.log('🌟 Scénarios simulés:');
    exchangeScenarios.forEach((scenario, i) => {
      console.log(`   ${i + 1}. ${scenario.name}`);
    });
    console.log('');
    console.log('🎯 L\'écosystème Bob simule maintenant des échanges complets !');
    console.log('📈 Interactions réalistes: demandes → négociations → échanges → évaluations');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

simulateCompleteExchanges();