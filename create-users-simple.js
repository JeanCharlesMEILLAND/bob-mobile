// Créer utilisateurs simples pour les simulations
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

const utilisateurs = [
  {
    username: 'marie',
    email: 'marie@bob.com',
    password: 'password123'
  },
  {
    username: 'thomas',
    email: 'thomas@bob.com',
    password: 'password123'
  },
  {
    username: 'sophie',
    email: 'sophie@bob.com',
    password: 'password123'
  },
  {
    username: 'lucas',
    email: 'lucas@bob.com',
    password: 'password123'
  }
];

async function createOrLoginUser(userData) {
  console.log(`👤 Traitement utilisateur: ${userData.username}`);
  
  try {
    // Essayer connexion d'abord
    const loginResponse = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: userData.email,
      password: userData.password
    });
    
    console.log(`✅ ${userData.username} - connexion réussie`);
    return {
      success: true,
      token: loginResponse.data.jwt,
      user: loginResponse.data.user,
      created: false
    };
    
  } catch (loginError) {
    // Créer l'utilisateur
    try {
      const registerResponse = await axios.post(`${STRAPI_URL}/auth/local/register`, {
        username: userData.username,
        email: userData.email,
        password: userData.password
      });
      
      console.log(`✅ ${userData.username} - créé avec succès`);
      return {
        success: true,
        token: registerResponse.data.jwt,
        user: registerResponse.data.user,
        created: true
      };
      
    } catch (registerError) {
      console.log(`❌ ${userData.username} - erreur: ${registerError.response?.data?.error?.message || registerError.message}`);
      return { success: false };
    }
  }
}

async function testUserAuthentication(users) {
  console.log(`\n🔐 === VALIDATION AUTHENTIFICATIONS ===`);
  
  for (const userData of users) {
    if (userData.success) {
      console.log(`✅ ${userData.user.username} - Token OK`);
    }
  }
}

async function createTestBobs(users) {
  console.log(`\n🎯 === CRÉATION BOBS DE TEST ===`);
  
  const bobsData = [
    {
      user: users.find(u => u.success && u.user.username === 'marie'),
      bob: {
        titre: 'Perceuse Bosch + Accessoires',
        description: 'Perceuse sans fil 18V avec mallette d\'accessoires complète.',
        type: 'pret',
        bobizGagnes: 30,
        statut: 'actif'
      }
    },
    {
      user: users.find(u => u.success && u.user.username === 'thomas'), 
      bob: {
        titre: 'Cours cuisine méditerranéenne',
        description: 'Cours de cuisine chez moi, spécialités du sud !',
        type: 'service_offert',
        bobizGagnes: 70,
        statut: 'actif'
      }
    },
    {
      user: users.find(u => u.success && u.user.username === 'sophie'),
      bob: {
        titre: 'Recherche robot cuiseur',
        description: 'Cherche robot cuiseur pour purées bébé bio.',
        type: 'emprunt',
        bobizGagnes: 45,
        statut: 'actif'
      }
    },
    {
      user: users.find(u => u.success && u.user.username === 'lucas'),
      bob: {
        titre: 'Dépannage informatique',
        description: 'Aide pour config PC, tablette, smartphone.',
        type: 'service_offert', 
        bobizGagnes: 60,
        statut: 'actif'
      }
    }
  ];
  
  const bobsCreated = [];
  
  for (const bobData of bobsData) {
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
          dateCreation: new Date().toISOString()
        }
      }, { headers });
      
      const bobId = response.data.data.id;
      console.log(`✅ Bob créé (${bobId}): ${bobData.bob.titre} - ${bobData.user.user.username}`);
      
      bobsCreated.push({
        id: bobId,
        titre: bobData.bob.titre,
        createur: bobData.user.user.username,
        type: bobData.bob.type,
        token: bobData.user.token
      });
      
    } catch (error) {
      console.log(`❌ Erreur Bob: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  return bobsCreated;
}

async function main() {
  console.log(`🚀 === CRÉATION UTILISATEURS SIMPLES ===\n`);
  
  // 1. Créer/connecter utilisateurs
  const users = [];
  for (const userData of utilisateurs) {
    const result = await createOrLoginUser(userData);
    users.push(result);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  // 2. Valider authentifications
  await testUserAuthentication(users);
  
  // 3. Créer Bobs de test
  const bobsCreated = await createTestBobs(users);
  
  console.log(`\n📊 === RÉSUMÉ ===`);
  console.log(`👥 ${users.filter(u => u.success).length}/${users.length} utilisateurs prêts`);
  console.log(`🎯 ${bobsCreated.length} Bobs créés`);
  
  console.log(`\n🎉 PRÊT POUR SIMULATIONS !`);
  console.log(`💡 Lancer: node simulate-complete-journeys.js`);
}

main().catch(console.error);