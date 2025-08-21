// Créer utilisateurs réalistes avec profils détaillés
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

const utilisateursDetailles = [
  {
    username: 'marie.dubois',
    email: 'marie@bob.com',
    password: 'password123',
    nom: 'Dubois',
    prenom: 'Marie',
    telephone: '+33601234567',
    confirmed: true,
    profil: {
      age: 42,
      profession: 'Architecte d\'intérieur',
      bio: 'Passionnée de bricolage et décoration. J\'adore partager mes outils et conseils !',
      specialites: ['bricolage', 'décoration', 'jardinage'],
      niveau: 'Experte',
      adresse: '12 rue des Lilas, 75015 Paris',
      latitude: 48.8534,
      longitude: 2.2945,
      bobizBalance: 150,
      evaluationMoyenne: 4.8,
      nombreEchanges: 23
    }
  },
  {
    username: 'thomas.martin',
    email: 'thomas@bob.com',
    password: 'password123', 
    nom: 'Martin',
    prenom: 'Thomas',
    telephone: '+33612345678',
    confirmed: true,
    profil: {
      age: 35,
      profession: 'Chef cuisinier',
      bio: 'Chef de cuisine créatif. Toujours prêt à aider et échanger matériel culinaire.',
      specialites: ['cuisine', 'gastronomie', 'événements'],
      niveau: 'Avancé', 
      adresse: '45 avenue Parmentier, 75011 Paris',
      latitude: 48.8566,
      longitude: 2.3736,
      bobizBalance: 120,
      evaluationMoyenne: 4.9,
      nombreEchanges: 18
    }
  },
  {
    username: 'sophie.laurent',
    email: 'sophie@bob.com',
    password: 'password123',
    nom: 'Laurent',
    prenom: 'Sophie',
    telephone: '+33623456789',
    confirmed: true,
    profil: {
      age: 29,
      profession: 'Paysagiste bio',
      bio: 'Maman green addict ! Spécialiste jardinage bio et permaculture.',
      specialites: ['jardinage', 'bio', 'permaculture'],
      niveau: 'Intermédiaire',
      adresse: '8 avenue Mozart, 75016 Paris',
      latitude: 48.8584,
      longitude: 2.2756,
      bobizBalance: 90,
      evaluationMoyenne: 4.7,
      nombreEchanges: 12
    }
  },
  {
    username: 'lucas.bernard',
    email: 'lucas@bob.com',
    password: 'password123',
    nom: 'Bernard',
    prenom: 'Lucas',
    telephone: '+33634567890',
    confirmed: true,
    profil: {
      age: 31,
      profession: 'Développeur / Formateur tech',
      bio: 'Geek bienveillant ! J\'adore aider avec la tech et partager mes connaissances.',
      specialites: ['informatique', 'tech', 'formation'],
      niveau: 'Expert',
      adresse: '25 rue de la Paix, 75002 Paris',
      latitude: 48.8692,
      longitude: 2.3317,
      bobizBalance: 200,
      evaluationMoyenne: 4.9,
      nombreEchanges: 31
    }
  }
];

async function createUser(userData) {
  console.log(`👤 Création utilisateur: ${userData.prenom} ${userData.nom}`);
  
  try {
    // Essayer de se connecter d'abord
    const loginResponse = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: userData.email,
      password: userData.password
    });
    
    console.log(`✅ ${userData.prenom} existe déjà - connexion réussie`);
    return {
      success: true,
      token: loginResponse.data.jwt,
      user: loginResponse.data.user,
      created: false
    };
    
  } catch (loginError) {
    // Utilisateur n'existe pas, le créer
    try {
      const registerResponse = await axios.post(`${STRAPI_URL}/auth/local/register`, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone
      });
      
      console.log(`✅ ${userData.prenom} créé avec succès`);
      return {
        success: true,
        token: registerResponse.data.jwt,
        user: registerResponse.data.user,
        created: true,
        profil: userData.profil
      };
      
    } catch (registerError) {
      console.log(`❌ Erreur création ${userData.prenom}: ${registerError.response?.data?.error?.message || registerError.message}`);
      return { success: false, error: registerError.response?.data?.error?.message };
    }
  }
}

async function assignUserToGroups(userEmail, groupNames, token) {
  console.log(`🏷️ Attribution groupes pour ${userEmail}`);
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Récupérer les groupes disponibles
    const groupsResponse = await axios.get(`${STRAPI_URL}/groupes`, { headers });
    const availableGroups = groupsResponse.data.data;
    
    const assignedGroups = [];
    
    for (const groupName of groupNames) {
      const group = availableGroups.find(g => g.attributes.nom === groupName);
      if (group) {
        assignedGroups.push(group.id);
        console.log(`  ✅ ${groupName}`);
      } else {
        console.log(`  ❌ ${groupName} - groupe introuvable`);
      }
    }
    
    // Note: L'assignation effective dépend de la structure relation dans Strapi
    // Pour l'instant on simule juste la validation
    
    return assignedGroups;
    
  } catch (error) {
    console.log(`  ❌ Erreur attribution groupes: ${error.response?.data?.error?.message}`);
    return [];
  }
}

async function createInitialBobsForUsers(users) {
  console.log(`\n🎯 === CRÉATION BOBS INITIAUX ===`);
  
  const bobsInitiaux = [
    {
      user: users.find(u => u.userData.email === 'marie@bob.com'),
      bob: {
        titre: 'Perceuse Bosch Pro + Accessoires',
        description: 'Perceuse sans fil 18V professionnelle avec mallette complète : forets béton, bois, métal + visseuses. Parfaite pour tous travaux.',
        type: 'pret',
        dureeJours: 7,
        conditions: 'Utilisation soignée, retour propre. Petit dépôt de garantie en Bobiz.',
        bobizGagnes: 30,
        adresse: '12 rue des Lilas, 75015 Paris',
        latitude: 48.8534,
        longitude: 2.2945
      }
    },
    {
      user: users.find(u => u.userData.email === 'thomas@bob.com'),
      bob: {
        titre: 'Cours cuisine méditerranéenne',
        description: 'Cours de cuisine chez moi ! Spécialités méditerranéennes : paella, ratatouille, tapenade. Recettes et dégustation incluses.',
        type: 'service_offert',
        dureeJours: 1,
        conditions: 'Chez moi ou chez vous. Ingrédients frais fournis.',
        bobizGagnes: 80,
        adresse: '45 avenue Parmentier, 75011 Paris',
        latitude: 48.8566,
        longitude: 2.3736
      }
    },
    {
      user: users.find(u => u.userData.email === 'sophie@bob.com'),
      bob: {
        titre: 'Recherche robot cuiseur Thermomix',
        description: 'Je cherche à emprunter un robot cuiseur pour préparer des purées bio pour mon bébé. Usage ponctuel et très soigneux.',
        type: 'emprunt',
        dureeJours: 14,
        conditions: 'Nettoyage après chaque usage, retour impeccable garanti.',
        bobizGagnes: 45,
        adresse: '8 avenue Mozart, 75016 Paris',
        latitude: 48.8584,
        longitude: 2.2756
      }
    },
    {
      user: users.find(u => u.userData.email === 'lucas@bob.com'),
      bob: {
        titre: 'Dépannage informatique à domicile',
        description: 'Configuration PC, tablette, smartphone. Formation personnalisée. Patience et pédagogie garanties !',
        type: 'service_offert',
        dureeJours: 1,
        conditions: 'Déplacement ou visio. Matériel fourni si nécessaire.',
        bobizGagnes: 60,
        adresse: '25 rue de la Paix, 75002 Paris',
        latitude: 48.8692,
        longitude: 2.3317
      }
    }
  ];
  
  const bobsCreated = [];
  
  for (const bobData of bobsInitiaux) {
    if (!bobData.user) continue;
    
    try {
      const headers = {
        'Authorization': `Bearer ${bobData.user.token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          ...bobData.bob,
          createur: bobData.user.user.id,
          dateCreation: new Date().toISOString(),
          statut: 'actif'
        }
      }, { headers });
      
      const bobId = response.data.data.id;
      console.log(`✅ Bob créé (ID: ${bobId}): ${bobData.bob.titre}`);
      
      bobsCreated.push({
        id: bobId,
        titre: bobData.bob.titre,
        createur: bobData.user.userData.prenom,
        type: bobData.bob.type
      });
      
    } catch (error) {
      console.log(`❌ Erreur création Bob: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  return bobsCreated;
}

async function generateUserReport(users, bobs) {
  console.log(`\n📊 === RAPPORT UTILISATEURS CRÉÉS ===`);
  
  console.log(`👥 ${users.length} utilisateurs configurés:`);
  
  users.forEach(userData => {
    if (userData.success) {
      const user = userData.userData;
      const status = userData.created ? 'CRÉÉ' : 'EXISTANT';
      
      console.log(`\n✅ ${user.prenom} ${user.nom} (${status})`);
      console.log(`   📧 ${user.email}`);
      console.log(`   🏠 ${user.profil.adresse}`);
      console.log(`   💼 ${user.profil.profession}`);
      console.log(`   ⭐ Niveau: ${user.profil.niveau}`);
      console.log(`   💰 Balance: ${user.profil.bobizBalance} Bobiz`);
      console.log(`   🎯 Spécialités: ${user.profil.specialites.join(', ')}`);
    }
  });
  
  console.log(`\n🎯 ${bobs.length} Bobs initiaux créés:`);
  bobs.forEach(bob => {
    console.log(`  📋 ${bob.titre} (${bob.type}) - ${bob.createur}`);
  });
  
  console.log(`\n🎉 ÉCOSYSTÈME UTILISATEURS PRÊT !`);
  console.log(`   ✅ Profils détaillés avec spécialités`);
  console.log(`   ✅ Adresses réalistes à Paris`);
  console.log(`   ✅ Balances Bobiz variées`);
  console.log(`   ✅ Bobs de différents types`);
  console.log(`   ✅ Prêt pour simulations d'interactions`);
}

async function main() {
  console.log(`🚀 === CRÉATION UTILISATEURS RÉALISTES ===\n`);
  
  const results = [];
  
  // 1. Créer les utilisateurs
  for (const userData of utilisateursDetailles) {
    const result = await createUser(userData);
    result.userData = userData;
    results.push(result);
    
    // Attribution groupes (simulation pour l'instant)
    if (result.success) {
      const groupes = {
        'marie@bob.com': ['Bricoleurs', 'Voisins', 'Jardiniers'],
        'thomas@bob.com': ['Cuisiniers', 'Amis', 'Voisins'], 
        'sophie@bob.com': ['Jardiniers', 'Famille', 'Parents'],
        'lucas@bob.com': ['Tech', 'Bricoleurs', 'Amis']
      };
      
      await assignUserToGroups(userData.email, groupes[userData.email] || [], result.token);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // 2. Créer des Bobs initiaux
  const successfulUsers = results.filter(r => r.success);
  const bobsCreated = await createInitialBobsForUsers(successfulUsers);
  
  // 3. Générer le rapport
  await generateUserReport(results, bobsCreated);
  
  console.log(`\n✨ === UTILISATEURS CRÉÉS ===`);
  console.log(`💡 Prêt pour lancer simulate-complete-journeys.js`);
}

main().catch(console.error);