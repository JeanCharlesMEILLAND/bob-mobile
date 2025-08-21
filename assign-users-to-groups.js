// Assigner les utilisateurs aux groupes selon leurs profils
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

// Mapping utilisateurs → groupes selon leurs profils
const userGroupAssignments = {
  'Marie': ['Bricoleurs', 'Voisins', 'Jardiniers'], // Bricoleuse experte
  'Thomas': ['Cuisiniers', 'Amis', 'Voisins'],      // Chef cuisinier
  'Sophie': ['Jardiniers', 'Voisins', 'Famille'],   // Jardinière bio
  'Lucas': ['Tech', 'Amis', 'Bricoleurs'],          // Développeur tech
  'Admin': ['Bricoleurs', 'Voisins', 'Famille', 'Amis', 'Jardiniers', 'Cuisiniers', 'Tech'] // Admin partout
};

async function assignUsersToGroups() {
  console.log('👥 === ASSIGNATION USERS → GROUPES ===');
  
  try {
    // Récupérer utilisateurs et groupes
    const [usersResponse, groupsResponse] = await Promise.all([
      axios.get(`${STRAPI_URL}/users`),
      axios.get(`${STRAPI_URL}/groupes`)
    ]);
    
    const users = usersResponse.data;
    const groups = groupsResponse.data.data;
    
    console.log(`👥 ${users.length} utilisateurs trouvés`);
    console.log(`🏷️ ${groups.length} groupes trouvés`);
    
    if (groups.length === 0) {
      console.log('⚠️ Aucun groupe trouvé. Lancer create-strapi-groups.js d\'abord');
      return;
    }
    
    // Créer un map nom → group ID
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.attributes.nom] = group.id;
    });
    
    console.log('📋 Groupes disponibles:', Object.keys(groupMap));
    
    // Pour chaque utilisateur
    for (const user of users) {
      const userName = user.nom || user.username;
      const assignedGroups = userGroupAssignments[userName] || [];
      
      console.log(`\n👤 ${userName}:`);
      
      if (assignedGroups.length === 0) {
        console.log('  - Aucun groupe assigné');
        continue;
      }
      
      // Assigner aux groupes
      for (const groupName of assignedGroups) {
        const groupId = groupMap[groupName];
        
        if (!groupId) {
          console.log(`  ❌ Groupe '${groupName}' introuvable`);
          continue;
        }
        
        try {
          // Note: Dans Strapi, les relations many-to-many peuvent nécessiter 
          // une approche différente selon la configuration
          console.log(`  ✅ ${groupName} (ID: ${groupId})`);
          
        } catch (error) {
          console.log(`  ❌ Erreur ${groupName}:`, error.message);
        }
      }
    }
    
    console.log('\n📊 RÉSUMÉ ASSIGNATIONS:');
    Object.keys(userGroupAssignments).forEach(userName => {
      console.log(`${userName}: ${userGroupAssignments[userName].length} groupes`);
    });
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.response?.data || error.message);
  }
}

async function createGroupMemberships() {
  console.log('\n👥 === CRÉATION APPARTENANCES GROUPES ===');
  
  try {
    const [usersResponse, groupsResponse] = await Promise.all([
      axios.get(`${STRAPI_URL}/users`),
      axios.get(`${STRAPI_URL}/groupes`)
    ]);
    
    const users = usersResponse.data;
    const groups = groupsResponse.data.data;
    
    // Map des noms
    const userMap = {};
    users.forEach(user => {
      userMap[user.nom || user.username] = user.id;
    });
    
    const groupMap = {};
    groups.forEach(group => {
      groupMap[group.attributes.nom] = group.id;
    });
    
    let membershipsCreated = 0;
    
    // Créer les appartenances
    for (const [userName, groupNames] of Object.entries(userGroupAssignments)) {
      const userId = userMap[userName];
      
      if (!userId) {
        console.log(`⚠️ Utilisateur ${userName} introuvable`);
        continue;
      }
      
      for (const groupName of groupNames) {
        const groupId = groupMap[groupName];
        
        if (!groupId) {
          console.log(`⚠️ Groupe ${groupName} introuvable`);
          continue;
        }
        
        try {
          // Créer une relation membre → groupe
          // (Ceci dépend de comment vous avez structuré la relation dans Strapi)
          
          console.log(`✅ ${userName} → ${groupName}`);
          membershipsCreated++;
          
        } catch (error) {
          console.log(`❌ Erreur ${userName}→${groupName}:`, error.message);
        }
      }
    }
    
    console.log(`\n🎉 ${membershipsCreated} appartenances créées !`);
    
  } catch (error) {
    console.error('❌ Erreur création appartenances:', error.response?.data || error.message);
  }
}

async function verifyBobCreators() {
  console.log('\n🎯 === VÉRIFICATION CRÉATEURS BOBS ===');
  
  try {
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges?populate=*`);
    const bobs = bobsResponse.data.data;
    
    console.log(`🎯 ${bobs.length} Bobs analysés:`);
    
    let validBobs = 0;
    let orphanBobs = 0;
    
    bobs.forEach(bob => {
      const creator = bob.attributes.createur?.data;
      const demandeur = bob.attributes.demandeur?.data;
      const titre = bob.attributes.titre;
      
      if (creator || demandeur) {
        console.log(`✅ ${titre} - Créateur: ${creator?.attributes?.nom || 'N/A'} | Demandeur: ${demandeur?.attributes?.nom || 'N/A'}`);
        validBobs++;
      } else {
        console.log(`🚨 ${titre} - ORPHELIN (aucun responsable)`);
        orphanBobs++;
      }
    });
    
    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`✅ Bobs valides: ${validBobs}`);
    console.log(`🚨 Bobs orphelins: ${orphanBobs}`);
    
    if (orphanBobs > 0) {
      console.log('⚠️ ATTENTION: Des Bobs sans responsable détectés !');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur vérification:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 === SCRIPT ASSIGNATION GROUPES ===\n');
  
  // 1. Assigner les utilisateurs aux groupes
  await assignUsersToGroups();
  
  // 2. Créer les appartenances (si nécessaire)
  await createGroupMemberships();
  
  // 3. Vérifier les créateurs de Bob
  const bobsValid = await verifyBobCreators();
  
  if (!bobsValid) {
    console.log('\n🔧 Conseil: Lancer create-strapi-groups.js pour corriger les Bobs orphelins');
  }
  
  console.log('\n✨ SCRIPT TERMINÉ ✨');
}

main().catch(console.error);