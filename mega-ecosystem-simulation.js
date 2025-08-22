// Écosystème Bob méga-complet avec interactions réalistes multi-utilisateurs
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

// Utilisateurs avec profils détaillés et personnalités
const bobbers = [
  {
    email: 'marie@bob.com', nom: 'Marie', age: 42, quartier: 'Montparnasse',
    personnalite: 'bricoler_experte', specialites: ['outillage', 'renovation', 'jardinage'],
    style: 'professionnelle et généreuse', bobiz: 250
  },
  {
    email: 'thomas@bob.com', nom: 'Thomas', age: 35, quartier: 'République', 
    personnalite: 'chef_passione', specialites: ['cuisine', 'reception', 'gastronomie'],
    style: 'créatif et perfectionniste', bobiz: 180
  },
  {
    email: 'sophie@bob.com', nom: 'Sophie', age: 29, quartier: 'Trocadéro',
    personnalite: 'maman_green', specialites: ['bio', 'enfants', 'eco-responsable'],
    style: 'bienveillante et consciencieuse', bobiz: 120
  },
  {
    email: 'lucas@bob.com', nom: 'Lucas', age: 31, quartier: 'Marais',
    personnalite: 'geek_solidaire', specialites: ['tech', 'formation', 'innovation'],
    style: 'patient et pédagogue', bobiz: 300
  }
];

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
      user: response.data.user,
      profile: bobbers.find(b => b.email === email)
    };
    
    return authCache[email];
  } catch (error) {
    console.log(`❌ Auth failed: ${email}`);
    return null;
  }
}

async function createDiverseBobs() {
  console.log('🎯 === CRÉATION ÉCOSYSTÈME BOBS DIVERSIFIÉS ===');
  
  const megaBobs = [
    // PRÊTS VARIÉS
    {
      createur: 'marie@bob.com',
      data: {
        titre: '🔨 Atelier Complet Menuiserie Pro',
        description: 'Atelier menuiserie complet dans mon garage : scie circulaire, défonceuse, ponceuses, établi, serre-joints. Parfait pour projets meubles ou aménagements. Formation rapide incluse !',
        type: 'pret',
        createur: null // sera rempli dynamiquement
      }
    },
    {
      createur: 'thomas@bob.com', 
      data: {
        titre: '🍳 Batterie Cuisine Professionnelle',
        description: 'Batterie complète chef cuisinier : casseroles cuivre, couteaux japonais, mandoline, thermoplongeur, balance précision. Pour cuisiniers passionnés uniquement !',
        type: 'pret',
        createur: null
      }
    },
    {
      createur: 'sophie@bob.com',
      data: {
        titre: '🌱 Kit Jardinage Bio Complet',
        description: 'Outillage jardinage bio : bêche, serfouette, sécateur, arrosoirs, bacs compost, graines bio. Plus livre permaculture et conseils personnalisés !',
        type: 'pret', 
        createur: null
      }
    },
    
    // SERVICES OFFERTS
    {
      createur: 'marie@bob.com',
      data: {
        titre: '🏠 Rénovation Conseil + Coup de Main',
        description: 'Architecte d\'intérieur propose conseil rénovation + aide travaux : plans, choix matériaux, techniques pose. Idéal premiers travaux ou projets ambitieux.',
        type: 'service_offert',
        createur: null
      }
    },
    {
      createur: 'thomas@bob.com',
      data: {
        titre: '👨‍🍳 Chef à Domicile Événements',
        description: 'Chef professionnel pour vos événements : dîners, anniversaires, réceptions. Menu personnalisé, courses, cuisine, service. Expérience gastronomique garantie !',
        type: 'service_offert',
        createur: null
      }
    },
    {
      createur: 'lucas@bob.com',
      data: {
        titre: '💻 Formation Numérique Personnalisée',
        description: 'Développeur forme à tous niveaux : smartphone, ordinateur, réseaux sociaux, sécurité. Patience garantie, support écrit fourni. À domicile ou visio.',
        type: 'service_offert',
        createur: null
      }
    },
    
    // EMPRUNTS/RECHERCHES
    {
      createur: 'sophie@bob.com',
      data: {
        titre: '🚗 RECHERCHE Siège Auto Groupe 2/3',
        description: 'Maman cherche siège auto groupe 2/3 pour enfant 4 ans, trajets occasionnels grands-parents. Usage soigneux, courte durée (2-3 semaines max).',
        type: 'emprunt',
        createur: null
      }
    },
    {
      createur: 'lucas@bob.com',
      data: {
        titre: '🎸 RECHERCHE Guitare Acoustique Qualité',
        description: 'Développeur veut apprendre guitare ! Cherche instrument correct pour débuter sérieusement. Très respectueux matériel, motivation assurée !',
        type: 'emprunt',
        createur: null
      }
    },
    
    // SERVICES DEMANDÉS
    {
      createur: 'sophie@bob.com',
      data: {
        titre: '🧹 Aide Ménage Post-Déménagement',
        description: 'Jeune maman débordée cherche aide ménage après déménagement : cartons, nettoyage, organisation. Rémunération Bobiz généreuse + petits plats faits maison !',
        type: 'service_demande',
        createur: null
      }
    },
    {
      createur: 'marie@bob.com',
      data: {
        titre: '🌐 Création Site Web Vitrine',
        description: 'Architecte cherche création site vitrine simple : portfolio, contact, références. Échange contre conseils réno ou prêt outillage selon besoin !',
        type: 'service_demande',
        createur: null
      }
    }
  ];
  
  const createdBobs = [];
  
  for (const bobInfo of megaBobs) {
    const auth = await authenticateUser(bobInfo.createur);
    if (!auth) continue;
    
    try {
      console.log(`\n🎯 ${auth.profile.nom}: ${bobInfo.data.titre}`);
      
      const response = await axios.post(`${STRAPI_URL}/echanges`, {
        data: {
          ...bobInfo.data,
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
        createur: auth.profile,
        documentId: bob.documentId
      });
      
    } catch (error) {
      console.log(`❌ Échec: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  return createdBobs;
}

async function simulateRichInteractions(bobs) {
  console.log('\n💬 === INTERACTIONS SOCIALES RICHES ===');
  
  // Créer interactions croisées entre utilisateurs
  const interactions = [
    {
      bob: bobs.find(b => b.titre.includes('Atelier Complet')),
      interested: 'thomas@bob.com',
      scenario: 'chef_veut_fabriquer_etageres'
    },
    {
      bob: bobs.find(b => b.titre.includes('Batterie Cuisine')),
      interested: 'sophie@bob.com', 
      scenario: 'maman_veut_cuisiner_fetes'
    },
    {
      bob: bobs.find(b => b.titre.includes('Chef à Domicile')),
      interested: 'marie@bob.com',
      scenario: 'architecte_organise_reception'
    },
    {
      bob: bobs.find(b => b.titre.includes('Formation Numérique')),
      interested: 'sophie@bob.com',
      scenario: 'maman_veut_apprendre_tech'
    }
  ];
  
  const conversations = {
    'chef_veut_fabriquer_etageres': [
      'Salut Marie ! Ton atelier m\'intéresse pour fabriquer des étagères cuisine sur mesure.',
      'Salut Thomas ! Super projet ! Mon atelier est parfait pour ça. Tu as déjà travaillé le bois ?',
      'Un peu bricolage basique, mais là c\'est plus ambitieux. Tu pourrais me former aux bases ?',
      'Avec plaisir ! On peut faire ça sur 2-3 sessions. Tu veux venir voir l\'atelier d\'abord ?',
      'Excellente idée ! Je suis libre ce weekend. Ça te va samedi matin ?',
      'Parfait ! 10h chez moi. Je préparerai café et on regardera ton projet ensemble 😊',
      'Top ! Je viens avec mes plans et mes mesures. Merci Marie ! 🙏'
    ],
    
    'maman_veut_cuisiner_fetes': [
      'Coucou Thomas ! Ta batterie cuisine me fait de l\'œil pour les fêtes de fin d\'année !',
      'Salut Sophie ! Tu prépares du lourd pour les fêtes ? 😄',
      'Oui ! Menu gastronomique pour 12 personnes. Parents + beaux-parents... le stress ! 😅',
      'Ah je vois ! Ma batterie sera parfaite. Tu veux que je te donne quelques conseils en plus ?',
      'Oh oui ! J\'ai peur de rater avec du matériel que je connais pas...',
      'T\'inquiète ! On fait un petit cours avant, je te montre chaque ustensile. Deal ?',
      'Deal ! Tu me sauves la vie Thomas ! Quand est-ce qu\'on peut faire ça ? 🤗'
    ],
    
    'architecte_organise_reception': [
      'Hello Thomas ! J\'organise réception clients fin de mois, ton service chef m\'intéresse !',
      'Salut Marie ! Réception pro ? Combien d\'invités et quel style tu vises ?',
      'Une vingtaine de clients architectes. Je veux du raffinement sans être too much.',
      'Perfect ! Menu dégustation 4 services avec accord mets/vins ? Ou plus convivial ?',
      'Dégustation me tente ! L\'idée c\'est d\'impressionner sans ostentation.',
      'J\'ai exactement ce qu\'il faut ! Menu signature avec présentation élégante. On se voit pour détailler ?',
      'Oui ! Cette semaine si possible, j\'ai hâte de voir tes propositions ! ✨'
    ],
    
    'maman_veut_apprendre_tech': [
      'Salut Lucas ! J\'ai vraiment besoin de tes services formation, je rame avec le numérique...',
      'Coucou Sophie ! Pas de panique, on va arranger ça ! 😊 Quels sont tes besoins principaux ?',
      'Mon téléphone, l\'ordinateur portable, et surtout sécuriser mes données perso...',
      'Ok ! Programme sur mesure alors. On commence par quoi ? Le plus urgent ?',
      'Le téléphone ! J\'utilise 10% de ses capacités et ça me frustre énormément !',
      'Parfait point de départ ! Session 2h chez toi ? Tu seras plus à l\'aise.',
      'Super idée ! Mardi après-midi ça marche ? Pendant la sieste de bébé ? 👶'
    ]
  };
  
  for (const interaction of interactions) {
    if (!interaction.bob) continue;
    
    const interestedAuth = await authenticateUser(interaction.interested);
    if (!interestedAuth) continue;
    
    console.log(`\n💬 Conversation: ${interestedAuth.profile.nom} s'intéresse à "${interaction.bob.titre}"`);
    
    const conversationMessages = conversations[interaction.scenario];
    
    for (let i = 0; i < conversationMessages.length; i++) {
      try {
        // Alterner expéditeur (créateur bob / personne intéressée)
        const isFromInterested = i % 2 === 0;
        const senderAuth = isFromInterested ? interestedAuth : authCache[interaction.bob.createur.email];
        
        if (!senderAuth) continue;
        
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: conversationMessages[i],
            typeConversation: 'echange',
            dateEnvoi: new Date(Date.now() + i * 180000).toISOString(), // 3min entre messages
            expediteur: senderAuth.user.id,
            echange: interaction.bob.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${senderAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const senderName = isFromInterested ? interestedAuth.profile.nom : interaction.bob.createur.nom;
        console.log(`📤 ${senderName}: ${conversationMessages[i]}`);
        
      } catch (error) {
        console.log(`❌ Message: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`✅ Conversation complète (${conversationMessages.length} messages)`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function simulateComplexLifecycles(bobs) {
  console.log('\n🔄 === CYCLES DE VIE COMPLEXES ===');
  
  // Sélectionner quelques Bobs pour cycles complets
  const selectedBobs = bobs.slice(0, 4);
  
  for (const bob of selectedBobs) {
    console.log(`\n📈 Cycle complet: ${bob.titre}`);
    
    const creatorAuth = authCache[bob.createur.email];
    if (!creatorAuth) continue;
    
    try {
      const headers = {
        'Authorization': `Bearer ${creatorAuth.token}`,
        'Content-Type': 'application/json'
      };
      
      // 1. Accord et démarrage
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: '🤝 ACCORD TROUVÉ ! On démarre l\'échange, merci pour la confiance !',
          typeConversation: 'echange',
          dateEnvoi: new Date().toISOString(),
          expediteur: creatorAuth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      // 2. Passage en cours
      await axios.put(`${STRAPI_URL}/echanges/${bob.documentId}`, {
        data: {
          statut: 'en_cours',
          dateDebut: new Date().toISOString()
        }
      }, { headers });
      
      console.log('✅ en_cours - Échange démarré');
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 3. Messages pendant l'échange
      const duringMessages = [
        'Tout se passe bien de ton côté ?',
        'Parfait ! Exactement ce que j\'attendais 😊',
        'Super ! N\'hésite pas si tu as des questions !'
      ];
      
      for (let i = 0; i < duringMessages.length; i++) {
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: duringMessages[i],
            typeConversation: 'echange',
            dateEnvoi: new Date(Date.now() + i * 60000).toISOString(),
            expediteur: creatorAuth.user.id,
            echange: bob.id
          }
        }, { headers });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Finalisation
      const endDate = new Date(Date.now() + (bob.type === 'service_offert' ? 4*60*60*1000 : 6*24*60*60*1000));
      
      await axios.put(`${STRAPI_URL}/echanges/${bob.documentId}`, {
        data: {
          statut: 'termine',
          dateFin: endDate.toISOString()
        }
      }, { headers });
      
      console.log('✅ terminé - Archivé dans historique');
      
      // 5. Transaction BOBIZ selon type
      const bobizAmounts = {
        'pret': 50,
        'service_offert': 90,
        'emprunt': 40,
        'service_demande': 70
      };
      
      const bobizGain = bobizAmounts[bob.type] || 35;
      
      await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
        data: {
          points: bobizGain,
          type: 'gain',
          source: 'echange_complete',
          description: `Échange réussi: ${bob.titre}`,
          dateTransaction: new Date().toISOString(),
          user: creatorAuth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      console.log(`💎 +${bobizGain} BOBIZ attribués`);
      
      // 6. Évaluation finale détaillée
      const evaluations = {
        'pret': '⭐⭐⭐⭐⭐ PRÊT PARFAIT !\n\nMatériel impeccable, propriétaire de confiance, échange fluide du début à la fin. Exactement ce qui était promis ! Recommande sans hésitation 👍',
        'service_offert': '⭐⭐⭐⭐⭐ SERVICE EXCEPTIONNEL !\n\nProfessionnalisme remarquable, résultat au-delà des attentes. Une vraie expertise partagée avec passion et générosité. Merci encore ! 🙏',
        'emprunt': '⭐⭐⭐⭐⭐ GÉNÉROSITÉ INCROYABLE !\n\nPrêt en toute confiance, conseils en bonus, échange humain authentique. Ce genre de solidarité fait chaud au cœur ! ❤️',
        'service_demande': '⭐⭐⭐⭐⭐ AIDE PRÉCIEUSE !\n\nTravail soigné, personne fiable, mission accomplie parfaitement. Échange équitable et enrichissant pour tous ! ✨'
      };
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: evaluations[bob.type] || evaluations['pret'],
          typeConversation: 'echange',
          dateEnvoi: new Date().toISOString(),
          expediteur: creatorAuth.user.id,
          echange: bob.id
        }
      }, { headers });
      
      console.log('⭐ Évaluation 5/5 détaillée ajoutée');
      
    } catch (error) {
      console.log(`❌ Erreur cycle: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

async function generateMegaReport() {
  console.log('\n🏆 === RAPPORT MÉGA-ÉCOSYSTÈME ===');
  
  const auth = Object.values(authCache)[0];
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
    
    const completedBobs = bobs.filter(b => b.statut === 'termine');
    const totalBobiz = transactions.reduce((sum, t) => sum + t.points, 0);
    
    console.log(`🎯 MÉGA-ÉCOSYSTÈME CRÉÉ:`);
    console.log(`  📋 ${bobs.length} Bobs total (${completedBobs.length} terminés)`);
    console.log(`  💬 ${messages.length} messages conversationnels`);
    console.log(`  💰 ${transactions.length} transactions BOBIZ`);
    console.log(`  🏷️ ${groups.length} groupes disponibles`);
    console.log(`  💎 ${totalBobiz} BOBIZ en circulation`);
    
    // Stats par type
    const typeStats = bobs.reduce((acc, bob) => {
      acc[bob.type] = (acc[bob.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 RÉPARTITION TYPES:`);
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`  ${type}: ${count} Bobs`);
    });
    
    // Stats par utilisateur
    console.log(`\n👥 ACTIVITÉ UTILISATEURS:`);
    for (const user of bobbers) {
      const userBobs = bobs.filter(b => b.createur === authCache[user.email]?.user.id).length;
      const userTransactions = transactions.filter(t => t.user === authCache[user.email]?.user.id);
      const userBobiz = userTransactions.reduce((sum, t) => sum + t.points, 0);
      
      console.log(`  ${user.nom}: ${userBobs} Bobs créés, ${userBobiz} BOBIZ gagnés`);
    }
    
    console.log(`\n🚀 ÉCOSYSTÈME MÉGA-COMPLET !`);
    console.log(`  ✅ Interactions sociales croisées multi-utilisateurs`);
    console.log(`  ✅ Conversations longues et négociations réalistes`);
    console.log(`  ✅ Cycles de vie complets avec suivi détaillé`);
    console.log(`  ✅ Système BOBIZ fonctionnel avec économie réelle`);
    console.log(`  ✅ Évaluations spécialisées par type d'échange`);
    console.log(`  ✅ Données ultra-riches pour développement`);
    
    console.log(`\n💡 PRÊT POUR FEATURES AVANCÉES:`);
    console.log(`  🎉 Events/soirées avec listes de besoins`);
    console.log(`  📱 QR codes et invitations`);
    console.log(`  💬 Messagerie temps réel`);
    console.log(`  🔔 Notifications push intelligentes`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport: ${error.message}`);
  }
}

async function main() {
  console.log('🌟 === CRÉATION MÉGA-ÉCOSYSTÈME BOB ===\n');
  console.log('🎯 Objectif: Écosystème ultra-réaliste multi-utilisateurs\n');
  
  // 1. Créer Bobs diversifiés
  const megaBobs = await createDiverseBobs();
  
  if (megaBobs.length === 0) {
    console.log('❌ Aucun Bob créé');
    return;
  }
  
  // 2. Simuler interactions sociales riches
  await simulateRichInteractions(megaBobs);
  
  // 3. Cycles de vie complexes
  await simulateComplexLifecycles(megaBobs);
  
  // 4. Rapport final méga
  await generateMegaReport();
  
  console.log('\n✨ === MÉGA-ÉCOSYSTÈME TERMINÉ ! ===');
  console.log('🎉 Bob app maintenant avec données ultra-réalistes !');
  console.log('🚀 Prêt pour implémentation features Events/QR/Invitations !');
}

main().catch(console.error);