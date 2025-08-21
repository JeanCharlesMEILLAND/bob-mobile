// Créer les groupes dans Strapi et corriger les relations Bob
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

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
  },
  {
    nom: 'Jardiniers',
    description: 'Passionnés de jardinage et végétaux',
    couleur: '#4CAF50',
    type: 'custom',
    actif: true
  },
  {
    nom: 'Cuisiniers',
    description: 'Amoureux de cuisine et gastronomie',
    couleur: '#FF9800',
    type: 'custom',
    actif: true
  },
  {
    nom: 'Tech',
    description: 'Communauté tech et numérique',
    couleur: '#9C27B0',
    type: 'custom',
    actif: true
  }
];

async function createGroups() {
  console.log('🏷️ === CRÉATION DES GROUPES STRAPI ===');
  
  try {
    // Récupérer les utilisateurs existants
    const usersResponse = await axios.get(`${STRAPI_URL}/users`);
    const users = usersResponse.data;
    console.log(`👥 ${users.length} utilisateurs trouvés`);
    
    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur - création d\'un utilisateur admin');
      const adminUser = {
        username: 'admin',
        email: 'admin@bob.com',
        password: 'password123',
        nom: 'Admin',
        prenom: 'Bob',
        telephone: '+33600000000',
        confirmed: true
      };
      
      const userResponse = await axios.post(`${STRAPI_URL}/auth/local/register`, adminUser);
      users.push(userResponse.data.user);
      console.log('✅ Utilisateur admin créé');
    }
    
    // Créer les groupes
    let groupsCreated = 0;
    
    for (const groupData of groupesDefinis) {
      try {
        // Assigner un créateur aléatoire
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const groupeComplet = {
          ...groupData,
          dateCreation: new Date().toISOString(),
          createur: randomUser.id
        };
        
        const response = await axios.post(`${STRAPI_URL}/groupes`, {
          data: groupeComplet
        });
        
        console.log(`✅ Groupe créé: ${groupData.nom} (créateur: ${randomUser.nom || randomUser.username})`);
        groupsCreated++;
        
        // Petite pause pour éviter spam
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Erreur création groupe ${groupData.nom}:`, error.response?.data || error.message);
      }
    }
    
    console.log(`\n🎉 ${groupsCreated} groupes créés avec succès !`);
    
    // Vérifier les groupes créés
    const groupesResponse = await axios.get(`${STRAPI_URL}/groupes`);
    console.log(`📊 Total groupes en base: ${groupesResponse.data.data.length}`);
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

async function verifyBobRelations() {
  console.log('\n🔍 === VÉRIFICATION RELATIONS BOB ===');
  
  try {
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges?populate=*`);
    const bobs = bobsResponse.data.data;
    
    console.log(`🎯 ${bobs.length} Bobs à vérifier`);
    
    let bobsWithoutCreator = 0;
    let bobsWithoutResponsible = 0;
    
    bobs.forEach(bob => {
      const hasCreator = bob.attributes.createur?.data?.id;
      const hasDemandeur = bob.attributes.demandeur?.data?.id;
      
      if (!hasCreator) {
        console.log(`⚠️ Bob sans créateur: ${bob.attributes.titre} (ID: ${bob.id})`);
        bobsWithoutCreator++;
      }
      
      if (!hasCreator && !hasDemandeur) {
        console.log(`🚨 Bob ORPHELIN (ni créateur ni demandeur): ${bob.attributes.titre}`);
        bobsWithoutResponsible++;
      }
      
      if (hasCreator && hasDemandeur) {
        console.log(`✅ Bob complet: ${bob.attributes.titre} (créateur ET demandeur)`);
      }
    });
    
    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`- Bobs sans créateur: ${bobsWithoutCreator}`);
    console.log(`- Bobs orphelins: ${bobsWithoutResponsible}`);
    console.log(`- Bobs valides: ${bobs.length - bobsWithoutResponsible}`);
    
    if (bobsWithoutResponsible > 0) {
      console.log(`\n🔧 CORRECTION NÉCESSAIRE: ${bobsWithoutResponsible} Bobs orphelins à corriger`);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur vérification Bobs:', error.response?.data || error.message);
    return false;
  }
}

async function fixOrphanBobs() {
  console.log('\n🔧 === CORRECTION BOBS ORPHELINS ===');
  
  try {
    const [bobsResponse, usersResponse] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`),
      axios.get(`${STRAPI_URL}/users`)
    ]);
    
    const bobs = bobsResponse.data.data;
    const users = usersResponse.data;
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur pour corriger les Bobs');
      return;
    }
    
    let bobsFixed = 0;
    
    for (const bob of bobs) {
      const hasCreator = bob.attributes.createur;
      const hasDemandeur = bob.attributes.demandeur;
      
      if (!hasCreator && !hasDemandeur) {
        // Assigner un créateur aléatoire
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
        try {
          await axios.put(`${STRAPI_URL}/echanges/${bob.id}`, {
            data: {
              createur: randomUser.id
            }
          });
          
          console.log(`✅ Bob corrigé: ${bob.attributes.titre} → créateur: ${randomUser.nom || randomUser.username}`);
          bobsFixed++;
          
        } catch (error) {
          console.log(`❌ Erreur correction Bob ${bob.id}:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log(`\n🎉 ${bobsFixed} Bobs corrigés !`);
    
  } catch (error) {
    console.error('❌ Erreur correction Bobs:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 === SCRIPT CRÉATION GROUPES & CORRECTION BOBS ===\n');
  
  // 1. Créer les groupes
  await createGroups();
  
  // 2. Vérifier les relations Bob
  const bobsValid = await verifyBobRelations();
  
  // 3. Corriger si nécessaire
  if (!bobsValid) {
    await fixOrphanBobs();
    
    // Re-vérifier après correction
    console.log('\n🔍 RE-VÉRIFICATION après correction...');
    await verifyBobRelations();
  }
  
  console.log('\n✨ SCRIPT TERMINÉ ✨');
}

main().catch(console.error);