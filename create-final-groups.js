// Créer les groupes définitifs dans Strapi
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

const groupesDefinitifs = [
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
    description: 'Passionnés de jardinage et espaces verts',
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
    description: 'Communauté tech, numérique et innovation',
    couleur: '#9C27B0',
    type: 'custom',
    actif: true
  },
  {
    nom: 'Parents',
    description: 'Réseau d\'entraide pour les parents',
    couleur: '#E91E63',
    type: 'custom',
    actif: true
  },
  {
    nom: 'Étudiants',
    description: 'Communauté étudiante et académique',
    couleur: '#3F51B5',
    type: 'custom',
    actif: true
  },
  {
    nom: 'Sportifs',
    description: 'Passionnés de sport et activités physiques',
    couleur: '#FF5722',
    type: 'custom',
    actif: true
  }
];

async function authenticate() {
  console.log('🔐 Authentification...');
  
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: 'test@bob.com',
      password: 'password123'
    });
    
    console.log('✅ Authentifié avec succès');
    return response.data.jwt;
    
  } catch (error) {
    console.log('❌ Erreur authentification:', error.response?.data?.error?.message);
    return null;
  }
}

async function createGroupsWithAuth() {
  console.log('\n🏷️ === CRÉATION GROUPES DÉFINITIFS ===');
  
  const token = await authenticate();
  
  if (!token) {
    console.log('❌ Impossible de s\'authentifier');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  // Vérifier les groupes existants
  try {
    const existingResponse = await axios.get(`${STRAPI_URL}/groupes`, { headers });
    const existingGroups = existingResponse.data.data;
    const existingNames = existingGroups.map(g => g.attributes.nom);
    
    console.log(`📋 ${existingGroups.length} groupes existants: ${existingNames.join(', ')}`);
    
  } catch (error) {
    console.log('⚠️ Erreur récupération groupes existants');
  }
  
  let groupsCreated = 0;
  let groupsSkipped = 0;
  
  for (const groupData of groupesDefinitifs) {
    try {
      const response = await axios.post(`${STRAPI_URL}/groupes`, {
        data: {
          ...groupData,
          dateCreation: new Date().toISOString()
        }
      }, { headers });
      
      console.log(`✅ ${groupData.nom} - ${groupData.description}`);
      groupsCreated++;
      
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      
      if (errorMsg.includes('already exists') || errorMsg.includes('duplicate') || 
          errorMsg.includes('unique') || errorMsg.includes('constraint')) {
        console.log(`⚠️ ${groupData.nom} - Existe déjà`);
        groupsSkipped++;
      } else {
        console.log(`❌ ${groupData.nom} - Erreur: ${errorMsg}`);
      }
    }
    
    // Pause pour éviter le spam
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`\n📊 RÉSUMÉ:`);
  console.log(`✅ Groupes créés: ${groupsCreated}`);
  console.log(`⚠️ Groupes existants: ${groupsSkipped}`);
  console.log(`📋 Total: ${groupsCreated + groupsSkipped}/${groupesDefinitifs.length}`);
}

async function verifyGroupsCreated() {
  console.log('\n✅ === VÉRIFICATION GROUPES ===');
  
  const token = await authenticate();
  
  if (!token) {
    console.log('❌ Impossible de vérifier');
    return;
  }
  
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  try {
    const response = await axios.get(`${STRAPI_URL}/groupes`, { headers });
    const groups = response.data.data;
    
    console.log(`🏷️ ${groups.length} groupes total en base:`);
    
    groups.forEach((group, index) => {
      const attrs = group.attributes;
      console.log(`${index + 1}. ${attrs.nom} (${attrs.type}) - ${attrs.couleur}`);
    });
    
    // Vérifier qu'on a tous les groupes essentiels
    const essentialGroups = ['Bricoleurs', 'Voisins', 'Famille', 'Amis'];
    const groupNames = groups.map(g => g.attributes.nom);
    
    const missingGroups = essentialGroups.filter(name => !groupNames.includes(name));
    
    if (missingGroups.length === 0) {
      console.log('\n🎉 Tous les groupes essentiels sont présents !');
    } else {
      console.log(`\n⚠️ Groupes manquants: ${missingGroups.join(', ')}`);
    }
    
  } catch (error) {
    console.log('❌ Erreur vérification:', error.response?.data?.error?.message || error.message);
  }
}

async function main() {
  console.log('🚀 === CRÉATION GROUPES BOB ===\n');
  
  // 1. Créer les groupes
  await createGroupsWithAuth();
  
  // 2. Vérifier le résultat
  await verifyGroupsCreated();
  
  console.log('\n✨ SCRIPT TERMINÉ ✨');
  console.log('\n💡 Prochaines étapes:');
  console.log('1. Configurer l\'admin Strapi pour gérer les groupes');
  console.log('2. Assigner les utilisateurs aux groupes');
  console.log('3. Tester la création de Bobs avec groupes cibles');
}

main().catch(console.error);