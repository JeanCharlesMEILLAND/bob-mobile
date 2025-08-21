// Créer les groupes dans Strapi avec authentification
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';
let authToken = null;

const groupesDefinis = [
  {
    nom: 'Bricoleurs',
    description: 'Communauté d\'entraide pour le bricolage et les outils',
    couleur: '#FF6B35',
    type: 'bricoleurs',
    actif: true
  },
  {
    nom: 'Voisins', 
    description: 'Réseau de voisinage pour services de proximité',
    couleur: '#4ECDC4',
    type: 'voisins',
    actif: true
  },
  {
    nom: 'Famille',
    description: 'Cercle familial pour échanges intimes',
    couleur: '#45B7D1', 
    type: 'famille',
    actif: true
  },
  {
    nom: 'Amis',
    description: 'Groupe d\'amis pour partage décontracté',
    couleur: '#96CEB4',
    type: 'amis',
    actif: true
  }
];

async function authenticate() {
  console.log('🔐 Authentification...');
  
  try {
    // Essayer avec un utilisateur existant
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'marie@bob.com',
      password: 'password123'
    });
    
    authToken = response.data.jwt;
    console.log('✅ Authentifié avec Marie');
    return true;
    
  } catch (error) {
    console.log('❌ Échec authentification Marie:', error.response?.data?.error?.message);
    
    // Essayer avec un autre utilisateur
    try {
      const response2 = await axios.post(`${STRAPI_URL}/auth/local`, {
        identifier: 'admin@bob.com',
        password: 'password123'
      });
      
      authToken = response2.data.jwt;
      console.log('✅ Authentifié avec Admin');
      return true;
      
    } catch (error2) {
      console.log('❌ Échec authentification Admin:', error2.response?.data?.error?.message);
      return false;
    }
  }
}

async function createGroupsAuthenticated() {
  console.log('\n🏷️ === CRÉATION GROUPES ===');
  
  if (!authToken) {
    console.log('❌ Pas de token d\'authentification');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  let groupsCreated = 0;
  
  for (const groupData of groupesDefinis) {
    try {
      const response = await axios.post(`${STRAPI_URL}/groupes`, {
        data: {
          ...groupData,
          dateCreation: new Date().toISOString()
        }
      }, { headers });
      
      console.log(`✅ Groupe créé: ${groupData.nom}`);
      groupsCreated++;
      
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate')) {
        console.log(`⚠️ Groupe ${groupData.nom} existe déjà`);
      } else {
        console.log(`❌ Erreur ${groupData.nom}: ${errorMsg}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📊 ${groupsCreated} nouveaux groupes créés`);
}

async function fixBobsAuthenticated() {
  console.log('\n🔧 === CORRECTION BOBS ===');
  
  if (!authToken) {
    console.log('❌ Pas de token d\'authentification');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Récupérer les Bobs
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges?populate=*`, { headers });
    const bobs = bobsResponse.data.data;
    
    console.log(`🎯 ${bobs.length} Bobs trouvés`);
    
    // Récupérer l'utilisateur connecté
    const userResponse = await axios.get(`${STRAPI_URL}/users/me`, { headers });
    const currentUser = userResponse.data;
    
    console.log(`👤 Utilisateur connecté: ${currentUser.nom || currentUser.username}`);
    
    let bobsFixed = 0;
    
    for (const bob of bobs) {
      const attrs = bob.attributes;
      const hasCreator = attrs.createur?.data?.id;
      const hasDemandeur = attrs.demandeur?.data?.id;
      
      console.log(`\n🎯 Bob: ${attrs.titre}`);
      console.log(`  - Créateur: ${hasCreator ? attrs.createur.data.attributes.nom || 'Oui' : 'Non'}`);
      console.log(`  - Demandeur: ${hasDemandeur ? attrs.demandeur.data.attributes.nom || 'Oui' : 'Non'}`);
      
      if (!hasCreator && !hasDemandeur) {
        console.log(`  🚨 BOB ORPHELIN - Assignation du créateur`);
        
        try {
          await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
            data: {
              createur: currentUser.id,
              responsable: currentUser.id
            }
          }, { headers });
          
          console.log(`  ✅ Créateur assigné: ${currentUser.nom || currentUser.username}`);
          bobsFixed++;
          
        } catch (error) {
          console.log(`  ❌ Erreur assignation: ${error.response?.data?.error?.message || error.message}`);
        }
      } else {
        console.log(`  ✅ Bob valide`);
      }
    }
    
    console.log(`\n🎉 ${bobsFixed} Bobs corrigés !`);
    
  } catch (error) {
    console.log('❌ Erreur correction Bobs:', error.response?.data?.error?.message || error.message);
  }
}

async function main() {
  console.log('🚀 === CRÉATION GROUPES & CORRECTION BOBS AUTHENTIFIÉS ===\n');
  
  // 1. S'authentifier
  const authenticated = await authenticate();
  
  if (!authenticated) {
    console.log('❌ Impossible de s\'authentifier. Vérifier les credentials.');
    return;
  }
  
  // 2. Créer les groupes
  await createGroupsAuthenticated();
  
  // 3. Corriger les Bobs orphelins
  await fixBobsAuthenticated();
  
  console.log('\n✨ SCRIPT TERMINÉ ✨');
}

main().catch(console.error);