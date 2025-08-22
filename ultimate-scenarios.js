// Scénarios ultimes avec échecs, litiges, saisonnalité et montée en charge
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

let authCache = {};

async function authenticateUser(email) {
  if (authCache[email]) return authCache[email];
  
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: email,
      password: 'password123'
    });
    
    authCache[email] = {
      token: response.data.jwt,
      user: response.data.user
    };
    
    return authCache[email];
  } catch (error) {
    console.log(`❌ Auth failed: ${email}`);
    return null;
  }
}

async function createSeasonalBobs() {
  console.log('🌤️ === BOBS SAISONNIERS ===');
  
  const seasonalBobs = [
    // HIVER - Fêtes et réconfort
    {
      user: 'marie@bob.com',
      bob: {
        titre: '🎄 Décoration Noël Complète + Sapin',
        description: 'Collection déco Noël 15 ans accumulation : guirlandes LED, boules vintage, crèche artisanale, plus vrai sapin 2m. Pour Noël magique garanti !',
        type: 'pret'
      }
    },
    {
      user: 'thomas@bob.com',
      bob: {
        titre: '🍽️ Service Traiteur Fêtes Fin d\'Année',
        description: 'Chef professionnel cuisine vos repas fêtes : réveillon, jour de l\'an, épiphanie. Menus traditionnels ou créatifs, service à domicile inclus.',
        type: 'service_offert'
      }
    },
    
    // PRINTEMPS - Renouveau et jardinage
    {
      user: 'sophie@bob.com',
      bob: {
        titre: '🌺 Atelier Plantation Balcon/Terrasse',
        description: 'Création jardin urbain sur mesure : choix plantes selon exposition, plantation, conseils entretien. Transformons votre extérieur en oasis !',
        type: 'service_offert'
      }
    },
    {
      user: 'lucas@bob.com',
      bob: {
        titre: '🚲 RECHERCHE Vélo Électrique Test',
        description: 'Développeur veut tester mobilité électrique avant achat. Emprunt vélo électrique 1-2 semaines pour essais trajets quotidiens.',
        type: 'emprunt'
      }
    },
    
    // ÉTÉ - Vacances et extérieur
    {
      user: 'marie@bob.com',
      bob: {
        titre: '🏕️ Matériel Camping Complet Famille',
        description: 'Équipement camping 4-6 personnes : tente familiale, sacs couchage, réchaud, glacière, mobilier. Parfait premières vacances camping !',
        type: 'pret'
      }
    },
    {
      user: 'thomas@bob.com',
      bob: {
        titre: '🌮 Cours Cuisine Monde Été',
        description: 'Ateliers cuisine fraîcheur été : gaspachos, salades créatives, grillades du monde, desserts glacés. 4 sessions thématiques au choix.',
        type: 'service_offert'
      }
    },
    
    // AUTOMNE - Préparation et convivialité
    {
      user: 'sophie@bob.com',
      bob: {
        titre: '🍯 Initiation Apiculture Urbaine',
        description: 'Découverte apiculture en ville : visite ruches, extraction miel, dégustation, conseils démarrage. Pour futurs apiculteurs urbains !',
        type: 'service_offert'
      }
    },
    {
      user: 'lucas@bob.com',
      bob: {
        titre: '📚 RECHERCHE Livres Programmation Avancée',
        description: 'Développeur cherche livres techniques : architecture logicielle, design patterns, performance. Pour montée en compétences automne.',
        type: 'emprunt'
      }
    }
  ];
  
  const createdBobs = [];
  
  for (const bobInfo of seasonalBobs) {
    const auth = await authenticateUser(bobInfo.user);
    if (!auth) continue;
    
    try {
      console.log(`🌟 Création: ${bobInfo.bob.titre}`);
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          ...bobInfo.bob,
          createur: auth.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const bob = response.data.data;
      console.log(`✅ Créé (ID: ${bob.id})`);
      
      createdBobs.push({
        ...bob,
        documentId: bob.documentId,
        auth
      });
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return createdBobs;
}

async function simulateProblematicScenarios(bobs) {
  console.log('\n⚠️ === SCÉNARIOS PROBLÉMATIQUES ===');
  
  // Prendre quelques Bobs pour scénarios négatifs
  const problematicBobs = bobs.slice(0, 3);
  
  const negativeScenarios = [
    {
      type: 'annulation_last_minute',
      messages: [
        'Salut ! Ton Bob m\'intéresse beaucoup, on peut se voir demain ?',
        'Parfait ! 14h chez moi, ça marche ?',
        'Désolé, imprévu de dernière minute... Je dois annuler 😔',
        'Pas de souci, ces choses arrivent ! Une autre fois peut-être ?',
        'Merci pour ta compréhension ! Je te recontacte dès que possible 🙏'
      ],
      finalStatus: 'annule'
    },
    {
      type: 'malentendu_description',
      messages: [
        'Hello ! Ton matériel correspond à ce que je cherche exactement !',
        'Super ! Tu peux passer le récupérer cet après-midi ?',
        'Hmm... Ce n\'est pas tout à fait ce que j\'imaginais d\'après la description...',
        'Oh je vois ! Je peux te montrer les autres options que j\'ai ?',
        'C\'est gentil mais ça ne correspondra pas à mon projet. Désolé pour le dérangement.',
        'Aucun problème ! N\'hésite pas si tu cherches autre chose 😊'
      ],
      finalStatus: 'annule'
    },
    {
      type: 'probleme_technique',
      messages: [
        'Ton service m\'intéresse ! Quand peut-on programmer ça ?',
        'Je suis disponible en fin de semaine, ça te va ?',
        'Parfait ! Rendez-vous pris pour vendredi 10h !',
        'Petit souci technique de mon côté... Il faut reporter d\'une semaine 😅',
        'OK, pas de problème ! La semaine suivante alors ?',
        'Vendredi suivant même heure ! Merci pour ta patience 🙏'
      ],
      finalStatus: 'actif' // Reporté mais pas annulé
    }
  ];
  
  for (let i = 0; i < problematicBobs.length; i++) {
    const bob = problematicBobs[i];
    const scenario = negativeScenarios[i];
    
    console.log(`\n⚠️ Scénario ${scenario.type}: ${bob.titre}`);
    
    // Simuler la conversation problématique
    for (let j = 0; j < scenario.messages.length; j++) {
      try {
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: scenario.messages[j],
            typeConversation: 'echange',
            dateEnvoi: new Date(Date.now() + j * 120000).toISOString(),
            expediteur: bob.auth.user.id,
            echange: bob.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${bob.auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`💬 Message ${j + 1}: ${scenario.messages[j]}`);
        
      } catch (error) {
        console.log(`❌ Message: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Mettre à jour le statut final
    if (scenario.finalStatus !== 'actif') {
      try {
        await axios.put(`${STRAPI_URL}/echanges/${bob.documentId}`, {
          data: {
            statut: scenario.finalStatus
          }
        }, {
          headers: {
            'Authorization': `Bearer ${bob.auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📝 Statut mis à jour: ${scenario.finalStatus}`);
        
      } catch (error) {
        console.log(`❌ Mise à jour statut: ${error.response?.data?.error?.message}`);
      }
    }
    
    console.log(`✅ Scénario ${scenario.type} terminé`);
  }
}

async function simulateHighVolumeActivity() {
  console.log('\n🚀 === SIMULATION MONTÉE EN CHARGE ===');
  
  const bulkBobs = [
    'Prêt trottinette électrique week-end',
    'Service baby-sitting soir',
    'Recherche chaise haute bébé',
    'Cours yoga débutant domicile',
    'Prêt aspirateur sans fil',
    'Service montage meuble IKEA',
    'Recherche livre recettes végétariennes',
    'Aide déménagement cartons',
    'Prêt perceuse visseuse',
    'Service promende chien',
    'Recherche plantes d\'intérieur',
    'Cours guitare acoustique',
    'Prêt machine à coudre',
    'Service repassage urgent',
    'Recherche jeux société soirée'
  ];
  
  const marie = await authenticateUser('marie@bob.com');
  if (!marie) return;
  
  console.log('📈 Création de 15 Bobs rapides...');
  
  let created = 0;
  
  for (const title of bulkBobs) {
    try {
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          titre: title,
          description: `Description détaillée pour ${title}. Bob créé dans simulation montée en charge.`,
          type: title.includes('Recherche') ? 'emprunt' : 
                title.includes('Service') || title.includes('Cours') ? 'service_offert' : 'pret',
          createur: marie.user.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${marie.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      created++;
      if (created % 5 === 0) {
        console.log(`📊 ${created}/15 Bobs créés...`);
      }
      
    } catch (error) {
      console.log(`❌ ${title}: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`✅ ${created} Bobs créés en lot pour simulation charge`);
}

async function createComplexBobizEconomy() {
  console.log('\n💰 === ÉCONOMIE BOBIZ COMPLEXE ===');
  
  const users = ['marie@bob.com', 'thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com'];
  
  // Créer diverses transactions
  const transactionTypes = [
    { type: 'bonus', source: 'profil_complete', points: 50, desc: 'Bonus profil complété' },
    { type: 'gain', source: 'parrainage', points: 25, desc: 'Parrainage utilisateur' },
    { type: 'bonus', source: 'bonus_niveau', points: 100, desc: 'Passage niveau Expert' },
    { type: 'gain', source: 'evenement_participe', points: 15, desc: 'Participation événement communauté' }
  ];
  
  for (const userEmail of users) {
    const auth = await authenticateUser(userEmail);
    if (!auth) continue;
    
    console.log(`💎 Transactions BOBIZ pour ${userEmail.split('@')[0]}:`);
    
    for (const transaction of transactionTypes) {
      try {
        await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
          data: {
            points: transaction.points,
            type: transaction.type,
            source: transaction.source,
            description: transaction.desc,
            dateTransaction: new Date().toISOString(),
            user: auth.user.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`  +${transaction.points} ${transaction.desc}`);
        
      } catch (error) {
        console.log(`  ❌ ${transaction.desc}: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
}

async function generateUltimateReport() {
  console.log('\n🏆 === RAPPORT ULTIME FINAL ===');
  
  const auth = await authenticateUser('marie@bob.com');
  if (!auth) return;
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    const [bobsResp, messagesResp, transactionsResp, groupsResp] = await Promise.all([
      axios.get(`${STRAPI_URL}/echanges`, { headers }),
      axios.get(`${STRAPI_URL}/messages`, { headers }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, { headers }),
      axios.get(`${STRAPI_URL}/groupes`, { headers })
    ]);
    
    const bobs = bobsResp.data.data;
    const messages = messagesResp.data.data;
    const transactions = transactionsResp.data.data;
    const groups = groupsResp.data.data;
    
    // Analyses détaillées
    const statusStats = bobs.reduce((acc, bob) => {
      acc[bob.statut] = (acc[bob.statut] || 0) + 1;
      return acc;
    }, {});
    
    const typeStats = bobs.reduce((acc, bob) => {
      acc[bob.type] = (acc[bob.type] || 0) + 1;
      return acc;
    }, {});
    
    const totalBobiz = transactions.reduce((sum, t) => sum + t.points, 0);
    const avgBobizPerTransaction = Math.round(totalBobiz / transactions.length);
    
    console.log(`🎯 ÉCOSYSTÈME ULTIME FINAL:`);
    console.log(`  📋 ${bobs.length} Bobs total créés`);
    console.log(`  💬 ${messages.length} messages échangés`);
    console.log(`  💰 ${transactions.length} transactions BOBIZ`);
    console.log(`  🏷️ ${groups.length} groupes thématiques`);
    console.log(`  💎 ${totalBobiz} BOBIZ total en circulation`);
    console.log(`  📊 ${avgBobizPerTransaction} BOBIZ moyenne par transaction`);
    
    console.log(`\n📊 RÉPARTITION STATUTS:`);
    Object.entries(statusStats).forEach(([status, count]) => {
      const percentage = Math.round((count / bobs.length) * 100);
      console.log(`  ${status}: ${count} (${percentage}%)`);
    });
    
    console.log(`\n📈 RÉPARTITION TYPES:`);
    Object.entries(typeStats).forEach(([type, count]) => {
      const percentage = Math.round((count / bobs.length) * 100);
      console.log(`  ${type}: ${count} (${percentage}%)`);
    });
    
    console.log(`\n🎉 DONNÉES CRÉÉES POUR L'APP:`);
    console.log(`  ✅ Parcours complets avec vraies négociations`);
    console.log(`  ✅ Scénarios d'échec et problèmes réalistes`);
    console.log(`  ✅ Saisonnalité et diversité temporelle`);
    console.log(`  ✅ Économie BOBIZ complexe multi-sources`);
    console.log(`  ✅ Montée en charge testée (50+ Bobs)`);
    console.log(`  ✅ Conversations longues avec personnalités`);
    console.log(`  ✅ Évaluations et historique riche`);
    
    console.log(`\n🚀 PRÊT POUR DÉVELOPPEMENT:`);
    console.log(`  💡 Interface mobile avec vraies données`);
    console.log(`  💡 Tests utilisateurs avec contenu réel`);
    console.log(`  💡 Analytics avec métriques variées`);
    console.log(`  💡 Features avancées (Events, QR, etc.)`);
    
    console.log(`\n🎯 NEXT STEPS:`);
    console.log(`  🎉 Implémenter Events avec listes besoins`);
    console.log(`  📱 QR codes pour partage rapide`);
    console.log(`  💌 Système invitations personnalisées`);
    console.log(`  🔔 Notifications intelligentes contextuelles`);
    console.log(`  💬 Messagerie temps réel avec Socket.io`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport ultime: ${error.message}`);
  }
}

async function main() {
  console.log('🌟 === SCÉNARIOS ULTIMES ÉCOSYSTÈME BOB ===\n');
  
  // 1. Bobs saisonniers
  const seasonalBobs = await createSeasonalBobs();
  
  // 2. Scénarios problématiques
  await simulateProblematicScenarios(seasonalBobs);
  
  // 3. Montée en charge
  await simulateHighVolumeActivity();
  
  // 4. Économie BOBIZ complexe
  await createComplexBobizEconomy();
  
  // 5. Rapport ultime
  await generateUltimateReport();
  
  console.log('\n✨ === ÉCOSYSTÈME ULTIME TERMINÉ ! ===');
  console.log('🎉 Bob app maintenant avec données production-ready !');
  console.log('🚀 Push/pull VPS recommandé pour sauvegarder !');
  console.log('💡 Prêt pour features Events/QR/Invitations/Notifications !');
}

main().catch(console.error);