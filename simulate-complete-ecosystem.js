// simulate-complete-ecosystem.js - Simuler un écosystème Bob complet
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

// Données des utilisateurs Bob à créer
const bobUsers = [
  {
    username: 'marie-bricoleuse',
    email: 'marie.martin@example.com',
    password: 'BobPassword123!',
    profile: {
      prenom: 'Marie',
      nom: 'Martin',
      bio: 'Passionnée de bricolage et de jardinage. 15 ans d\'expérience en rénovation. Toujours prête à aider mes voisins !',
      adresse: '45 Rue de la République, 75011 Paris',
      ville: 'Paris',
      specialites: ['bricolage', 'jardinage', 'décoration'],
      niveau: 'expert'
    }
  },
  {
    username: 'thomas-chef',
    email: 'thomas.dupont@example.com', 
    password: 'BobPassword123!',
    profile: {
      prenom: 'Thomas',
      nom: 'Dupont',
      bio: 'Chef cuisinier professionnel. J\'adore partager ma passion et mes ustensiles de cuisine. Spécialiste pâtisserie.',
      adresse: '12 Avenue des Chefs, 75010 Paris',
      ville: 'Paris',
      specialites: ['cuisine', 'pâtisserie', 'ustensiles'],
      niveau: 'professionnel'
    }
  },
  {
    username: 'sophie-jardin',
    email: 'sophie.bernard@example.com',
    password: 'BobPassword123!',
    profile: {
      prenom: 'Sophie',
      nom: 'Bernard', 
      bio: 'Ingénieure agronome et passionnée de permaculture. Mon balcon est un petit paradis vert !',
      adresse: '8 Rue des Jardins, 75012 Paris',
      ville: 'Paris',
      specialites: ['jardinage', 'permaculture', 'plantes'],
      niveau: 'expert'
    }
  },
  {
    username: 'lucas-tech',
    email: 'lucas.moreau@example.com',
    password: 'BobPassword123!', 
    profile: {
      prenom: 'Lucas',
      nom: 'Moreau',
      bio: 'Développeur et maker. Expert en électronique, impression 3D et domotique. Toujours de nouveaux projets !',
      adresse: '33 Boulevard Tech, 75013 Paris',
      ville: 'Paris',
      specialites: ['électronique', 'impression3d', 'domotique'],
      niveau: 'expert'
    }
  }
];

// Bobs à créer pour chaque utilisateur
const bobsData = {
  'marie-bricoleuse': [
    {
      titre: 'Scie circulaire Makita 1400W - Lame neuve',
      description: 'Scie circulaire professionnelle en parfait état. Lame carbure neuve 24 dents. Parfaite pour découpes précises bois, aggloméré, mélaminé.',
      type: 'pret',
      dureeJours: 3,
      bobizGagnes: 25,
      conditions: 'Usage soigneux, port EPI obligatoire. Retour propre.'
    },
    {
      titre: 'Kit peinture complet - Rouleaux et pinceaux pros',
      description: 'Kit peinture professionnel : bac, rouleaux laqueur, pinceaux rechampir, perche télescopique. Parfait pour repeindre une pièce.',
      type: 'pret', 
      dureeJours: 5,
      bobizGagnes: 15,
      conditions: 'Nettoyage complet avant retour. Solvants fournis.'
    }
  ],
  'thomas-chef': [
    {
      titre: 'Robot pâtissier KitchenAid - Bol inox 5L',
      description: 'Robot pâtissier professionnel rouge. Bol inox 5L + fouet + crochet pétrisseur + batteur plat. Parfait pour toutes vos pâtisseries !',
      type: 'pret',
      dureeJours: 2,
      bobizGagnes: 30,
      conditions: 'Nettoyage minutieux obligatoire. Usage alimentaire uniquement.'
    },
    {
      titre: 'Cours de cuisine italienne - Pâtes fraîches',
      description: 'Je propose un cours de 3h pour apprendre à faire des pâtes fraîches authentiques : tagliatelles, raviolis, gnocchis. Recettes de famille !',
      type: 'service_offert',
      dureeJours: 1,
      bobizGagnes: 45,
      conditions: 'Ingrédients fournis. Maximum 4 personnes. Chez moi ou chez vous.'
    }
  ],
  'sophie-jardin': [
    {
      titre: 'Motoculteur Honda - Fraises neuves',
      description: 'Motoculteur Honda GC135 4 temps. Fraises neuves, démarrage facile. Idéal pour préparer potager ou retourner terre.',
      type: 'pret',
      dureeJours: 4,
      bobizGagnes: 40,
      conditions: 'Réservoir plein au retour. Usage terrain sec uniquement.'
    },
    {
      titre: 'Consultation jardinage - Diagnostic potager',
      description: 'Ingénieure agronome, je propose un diagnostic de votre potager/jardin avec conseils personnalisés et plan d\'action.',
      type: 'service_offert',
      dureeJours: 1,
      bobizGagnes: 35,
      conditions: 'Visite à domicile. Rapport écrit fourni.'
    }
  ],
  'lucas-tech': [
    {
      titre: 'Imprimante 3D Prusa i3 MK3S+ - Filaments inclus',
      description: 'Imprimante 3D professionnelle calibrée. Filaments PLA couleurs + PETG inclus. Logiciel Prusa Slicer pré-configuré.',
      type: 'pret',
      dureeJours: 7,
      bobizGagnes: 50,
      conditions: 'Formation rapide incluse. Pas de modifications matériel.'
    },
    {
      titre: 'Installation domotique - Éclairage connecté',
      description: 'J\'installe votre système d\'éclairage connecté : Philips Hue, interrupteurs intelligents, programmation scénarios.',
      type: 'service_offert',
      dureeJours: 1,
      bobizGagnes: 55,
      conditions: 'Matériel à votre charge. Installation et configuration incluses.'
    }
  ]
};

// Messages types pour simuler des conversations
const messageTemplates = {
  interesse: [
    "Salut ! Ton {item} m'intéresse beaucoup. Est-il toujours disponible ?",
    "Hello ! J'aurais besoin de {item} pour {usage}. C'est possible ?",
    "Bonsoir ! Super {item} ! Serait-il dispo ce weekend ?"
  ],
  details: [
    "Peux-tu me donner plus de détails sur l'état ?",
    "Est-ce que tu peux m'expliquer comment ça fonctionne ?", 
    "Y a-t-il des accessoires inclus ?",
    "Quelle est la marque exacte ?"
  ],
  proposition: [
    "Ça marche pour moi ! Quand peut-on organiser l'échange ?",
    "Parfait ! Je peux passer le chercher quand tu veux",
    "Super ! Je suis très soigneux, pas d'inquiétude",
    "Excellent ! On peut se voir demain ?"
  ],
  remerciement: [
    "Merci beaucoup pour ce prêt ! Très satisfait",
    "Parfait ! Matériel en excellent état comme annoncé",
    "Super échange ! Je recommande",
    "Merci ! Tout s'est très bien passé"
  ]
};

// Contacts à créer pour simuler le réseau
const contactsData = {
  'marie-bricoleuse': [
    { nom: 'Dupont', prenom: 'Thomas', relation: 'Voisin chef cuisinier', confiance: 'forte' },
    { nom: 'Bernard', prenom: 'Sophie', relation: 'Amie jardinière', confiance: 'totale' },
    { nom: 'Moreau', prenom: 'Lucas', relation: 'Collègue tech', confiance: 'moyenne' }
  ],
  'thomas-chef': [
    { nom: 'Martin', prenom: 'Marie', relation: 'Voisine bricoleuse', confiance: 'forte' },
    { nom: 'Bernard', prenom: 'Sophie', relation: 'Cliente jardinage', confiance: 'moyenne' },
    { nom: 'Moreau', prenom: 'Lucas', relation: 'Ami geek', confiance: 'forte' }
  ],
  'sophie-jardin': [
    { nom: 'Martin', prenom: 'Marie', relation: 'Experte bricolage', confiance: 'totale' },
    { nom: 'Dupont', prenom: 'Thomas', relation: 'Chef sympa', confiance: 'moyenne' },
    { nom: 'Moreau', prenom: 'Lucas', relation: 'Voisin techno', confiance: 'moyenne' }
  ],
  'lucas-tech': [
    { nom: 'Martin', prenom: 'Marie', relation: 'Voisine géniale', confiance: 'forte' },
    { nom: 'Dupont', prenom: 'Thomas', relation: 'Chef cool', confiance: 'forte' },
    { nom: 'Bernard', prenom: 'Sophie', relation: 'Experte plantes', confiance: 'moyenne' }
  ]
};

async function simulateCompleteEcosystem() {
  console.log('🌍 SIMULATION ÉCOSYSTÈME BOB COMPLET\n');
  console.log('🎯 Objectif: Créer un réseau social Bob réaliste avec:');
  console.log('   • 4 utilisateurs avec profils détaillés');
  console.log('   • 8 Bobs variés (outils, services, cours)');
  console.log('   • Contacts croisés entre utilisateurs');
  console.log('   • Conversations et messages réalistes');
  console.log('   • Simulations d\'échanges complets\n');
  
  const createdUsers = {};
  const createdBobs = {};
  const userTokens = {};
  
  try {
    // === PHASE 1: CRÉATION DES UTILISATEURS ===
    console.log('👥 === PHASE 1: CRÉATION DES UTILISATEURS ===\n');
    
    for (const userData of bobUsers) {
      try {
        console.log(`🔄 Création utilisateur ${userData.username}...`);
        
        const registerResponse = await makeRequest(`${API_BASE_URL}/api/auth/local/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password
          })
        });
        
        if (registerResponse.status === 200) {
          const result = JSON.parse(registerResponse.body);
          createdUsers[userData.username] = result.user;
          userTokens[userData.username] = result.jwt;
          console.log(`   ✅ ${userData.profile.prenom} ${userData.profile.nom} (ID: ${result.user.id})`);
        } else if (registerResponse.status === 400) {
          // Utilisateur existe déjà, essayer de se connecter
          console.log(`   ↻ Utilisateur existe, connexion...`);
          
          const loginResponse = await makeRequest(`${API_BASE_URL}/api/auth/local`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: userData.username,
              password: userData.password
            })
          });
          
          if (loginResponse.status === 200) {
            const result = JSON.parse(loginResponse.body);
            createdUsers[userData.username] = result.user;
            userTokens[userData.username] = result.jwt;
            console.log(`   ✅ Connecté: ${userData.profile.prenom} ${userData.profile.nom}`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Erreur ${userData.username}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Résultat: ${Object.keys(createdUsers).length}/4 utilisateurs prêts\n`);
    
    // === PHASE 2: CRÉATION DES CONTACTS ===
    console.log('🤝 === PHASE 2: CRÉATION DU RÉSEAU DE CONTACTS ===\n');
    
    for (const [username, contacts] of Object.entries(contactsData)) {
      if (!userTokens[username]) continue;
      
      console.log(`📱 Contacts de ${username}:`);
      
      for (const contact of contacts) {
        try {
          const contactData = {
            data: {
              nom: contact.nom,
              prenom: contact.prenom,
              telephone: `+336${Math.floor(Math.random() * 10000000).toString().padStart(8, '0')}`,
              email: `${contact.prenom.toLowerCase()}.${contact.nom.toLowerCase()}@example.com`,
              relation: contact.relation,
              confiance: contact.confiance,
              aBob: true,
              invitationAcceptee: true,
              nombreBobsEnsemble: Math.floor(Math.random() * 5),
              noteRelation: 4 + Math.random(),
              favoris: contact.confiance === 'totale',
              dateAjout: new Date().toISOString(),
              sourceAjout: 'invitation',
              notes: `${contact.relation}. Contact de confiance dans le réseau Bob.`,
              metadata: {
                specialites: bobUsers.find(u => u.profile.prenom === contact.prenom)?.profile.specialites || [],
                last_interaction: new Date().toISOString()
              }
            }
          };
          
          const response = await makeRequest(`${API_BASE_URL}/api/contacts`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userTokens[username]}`
            },
            body: JSON.stringify(contactData)
          });
          
          if (response.status === 200 || response.status === 201) {
            console.log(`   ✅ ${contact.prenom} ${contact.nom} (${contact.confiance})`);
          } else {
            console.log(`   ⚠️ ${contact.prenom}: Status ${response.status}`);
          }
          
        } catch (error) {
          console.log(`   ❌ ${contact.prenom}: ${error.message}`);
        }
      }
      console.log('');
    }
    
    // === PHASE 3: CRÉATION DES BOBS ===
    console.log('🔄 === PHASE 3: CRÉATION DES BOBS ===\n');
    
    for (const [username, bobs] of Object.entries(bobsData)) {
      if (!userTokens[username]) continue;
      
      const userProfile = bobUsers.find(u => u.username === username)?.profile;
      console.log(`🛠️ Bobs de ${userProfile?.prenom}:`);
      
      for (const bob of bobs) {
        try {
          const bobData = {
            data: {
              ...bob,
              statut: 'actif',
              adresse: userProfile?.adresse || 'Paris, France',
              latitude: 48.8566 + (Math.random() - 0.5) * 0.02,
              longitude: 2.3522 + (Math.random() - 0.5) * 0.02,
              dateCreation: new Date().toISOString(),
              dateExpiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          };
          
          const response = await makeRequest(`${API_BASE_URL}/api/echanges`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userTokens[username]}`
            },
            body: JSON.stringify(bobData)
          });
          
          if (response.status === 201) {
            const result = JSON.parse(response.body);
            if (!createdBobs[username]) createdBobs[username] = [];
            createdBobs[username].push(result.data);
            console.log(`   ✅ "${bob.titre}" (${bob.bobizGagnes} Bobiz)`);
          } else {
            console.log(`   ❌ "${bob.titre}": Status ${response.status}`);
          }
          
        } catch (error) {
          console.log(`   ❌ "${bob.titre}": ${error.message}`);
        }
      }
      console.log('');
    }
    
    // === PHASE 4: SIMULATION DES CONVERSATIONS ===
    console.log('💬 === PHASE 4: SIMULATION DES CONVERSATIONS ===\n');
    
    const usersList = Object.keys(createdUsers);
    
    for (let i = 0; i < 10; i++) {
      try {
        // Choisir 2 utilisateurs au hasard
        const user1 = usersList[Math.floor(Math.random() * usersList.length)];
        const user2 = usersList[Math.floor(Math.random() * usersList.length)];
        
        if (user1 === user2 || !userTokens[user1] || !userTokens[user2]) continue;
        
        // Choisir un Bob au hasard du user2
        const user2Bobs = createdBobs[user2];
        if (!user2Bobs || user2Bobs.length === 0) continue;
        
        const randomBob = user2Bobs[Math.floor(Math.random() * user2Bobs.length)];
        
        // Générer une conversation
        const user1Profile = bobUsers.find(u => u.username === user1)?.profile;
        const user2Profile = bobUsers.find(u => u.username === user2)?.profile;
        
        console.log(`💬 Conversation: ${user1Profile?.prenom} → ${user2Profile?.prenom}`);
        console.log(`   📦 Objet: "${randomBob.titre}"`);
        
        // Message d'intérêt
        const interesseMsg = messageTemplates.interesse[Math.floor(Math.random() * messageTemplates.interesse.length)]
          .replace('{item}', randomBob.titre.split(' - ')[0])
          .replace('{usage}', 'mon projet');
        
        const messageData = {
          data: {
            contenu: interesseMsg,
            type: 'texte',
            lu: false,
            supprime: false,
            edite: false,
            metadataMessage: {
              platform: 'mobile',
              conversation_id: `conv_${randomBob.id}_${Date.now()}`,
              bob_id: randomBob.id
            },
            version: '1.0'
          }
        };
        
        const messageResponse = await makeRequest(`${API_BASE_URL}/api/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userTokens[user1]}`
          },
          body: JSON.stringify(messageData)
        });
        
        if (messageResponse.status === 200 || messageResponse.status === 201) {
          console.log(`   ✅ "${interesseMsg.substring(0, 50)}..."`);
        } else {
          console.log(`   ⚠️ Message: Status ${messageResponse.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Conversation: ${error.message}`);
      }
    }
    
    // === PHASE 5: STATISTIQUES FINALES ===
    console.log('\n📊 === STATISTIQUES DE L\'ÉCOSYSTÈME CRÉÉ ===\n');
    
    // Compter les Bobs totaux
    const allBobsResponse = await makeRequest(`${API_BASE_URL}/api/echanges`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let totalBobs = 0;
    let totalBobiz = 0;
    if (allBobsResponse.status === 200) {
      const allBobs = JSON.parse(allBobsResponse.body);
      totalBobs = allBobs.data.length;
      totalBobiz = allBobs.data.reduce((sum, bob) => sum + (bob.bobizGagnes || 0), 0);
    }
    
    // Compter les contacts
    const allContactsResponse = await makeRequest(`${API_BASE_URL}/api/contacts`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let totalContacts = 0;
    if (allContactsResponse.status === 200) {
      const allContacts = JSON.parse(allContactsResponse.body);
      totalContacts = allContacts.data.length;
    }
    
    // Compter les messages
    const allMessagesResponse = await makeRequest(`${API_BASE_URL}/api/messages`, {
      headers: { 'Authorization': `Bearer ${Object.values(userTokens)[0]}` }
    });
    
    let totalMessages = 0;
    if (allMessagesResponse.status === 200) {
      const allMessages = JSON.parse(allMessagesResponse.body);
      totalMessages = allMessages.data.length;
    }
    
    console.log('🌟 ÉCOSYSTÈME BOB SIMULÉ AVEC SUCCÈS !');
    console.log('');
    console.log(`👥 Utilisateurs actifs: ${Object.keys(createdUsers).length}`);
    console.log(`🔄 Bobs créés: ${totalBobs}`);
    console.log(`🤝 Contacts dans réseau: ${totalContacts}`);
    console.log(`💬 Messages échangés: ${totalMessages}`);
    console.log(`🏆 Bobiz en circulation: ${totalBobiz}`);
    console.log('');
    console.log('📋 Types de Bobs:');
    console.log('   • Outils professionnels (scie, motoculteur, imprimante 3D)');
    console.log('   • Électroménager (robot pâtissier)');
    console.log('   • Services (cours cuisine, consultation jardinage)');
    console.log('   • Expertise technique (domotique)');
    console.log('');
    console.log('🤝 Réseau social:');
    console.log('   • Voisins qui se connaissent');
    console.log('   • Niveaux de confiance variés');
    console.log('   • Spécialités complémentaires');
    console.log('   • Historique d\'échanges');
    console.log('');
    console.log('💬 Interactions:');
    console.log('   • Conversations réalistes');
    console.log('   • Demandes d\'information');
    console.log('   • Négociations d\'échange');
    console.log('   • Métadonnées de conversation');
    console.log('');
    console.log('🎯 L\'écosystème Bob est maintenant vivant et réaliste !');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message);
  }
}

simulateCompleteEcosystem();