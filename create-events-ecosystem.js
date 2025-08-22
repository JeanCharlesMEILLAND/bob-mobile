// Système Events complet avec soirées, listes besoins, et logique "qui apporte quoi"
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

async function createDiverseEvents() {
  console.log('🎉 === CRÉATION ÉVÉNEMENTS AVEC LISTES BESOINS ===');
  
  const eventScenarios = [
    {
      organisateur: 'marie@bob.com',
      event: {
        titre: '🍕 Soirée Pizza Party Bricoleurs',
        description: 'Soirée conviviale entre passionnés bricolage ! On partage techniques, outils, et on mange des pizzas maison. Ambiance détendue garantie !',
        dateDebut: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // Dans 1 semaine
        dateFin: new Date(Date.now() + 7*24*60*60*1000 + 4*60*60*1000).toISOString(), // +4h
        adresse: '12 rue des Lilas, 75015 Paris - Chez Marie',
        maxParticipants: 8,
        bobizRecompense: 25,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Pizzas margherita', quantite: 3, type: 'nourriture', assigne: null, urgent: true },
        { item: 'Pizzas 4 fromages', quantite: 2, type: 'nourriture', assigne: null, urgent: true },
        { item: 'Salade verte', quantite: 1, type: 'nourriture', assigne: null, urgent: false },
        { item: 'Boissons softs variées', quantite: 8, type: 'boisson', assigne: null, urgent: true },
        { item: 'Bières artisanales', quantite: 6, type: 'boisson', assigne: null, urgent: false },
        { item: 'Dessert surprise', quantite: 1, type: 'dessert', assigne: null, urgent: false },
        { item: 'Enceinte bluetooth', quantite: 1, type: 'materiel', assigne: null, urgent: true },
        { item: 'Jeux société bricolage', quantite: 2, type: 'animation', assigne: null, urgent: false }
      ]
    },
    
    {
      organisateur: 'thomas@bob.com',
      event: {
        titre: '👨‍🍳 Atelier Cuisine Collaborative',
        description: 'Cuisinons ensemble un menu 3 services ! Chacun participe selon ses compétences. Apprentissage, partage et dégustation au programme !',
        dateDebut: new Date(Date.now() + 10*24*60*60*1000).toISOString(), // Dans 10 jours
        dateFin: new Date(Date.now() + 10*24*60*60*1000 + 5*60*60*1000).toISOString(), // +5h
        adresse: '45 avenue Parmentier, 75011 Paris - Chez Thomas',
        maxParticipants: 6,
        bobizRecompense: 40,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Saumon frais (1kg)', quantite: 1, type: 'ingredient', assigne: null, urgent: true },
        { item: 'Légumes de saison', quantite: 1, type: 'ingredient', assigne: null, urgent: true },
        { item: 'Épices exotiques', quantite: 1, type: 'ingredient', assigne: null, urgent: false },
        { item: 'Vin blanc cuisine', quantite: 1, type: 'ingredient', assigne: null, urgent: true },
        { item: 'Fromages plateau', quantite: 1, type: 'ingredient', assigne: null, urgent: false },
        { item: 'Couteaux professionnels', quantite: 2, type: 'materiel', assigne: null, urgent: true },
        { item: 'Tabliers cuisine', quantite: 6, type: 'materiel', assigne: null, urgent: false },
        { item: 'Appareil photo recettes', quantite: 1, type: 'materiel', assigne: null, urgent: false }
      ]
    },
    
    {
      organisateur: 'sophie@bob.com',
      event: {
        titre: '🌱 Atelier Jardinage Collectif',
        description: 'Créons ensemble un potager urbain ! Plantation, conseils bio, échange graines et boutures. Parfait pour débutants et confirmés !',
        dateDebut: new Date(Date.now() + 14*24*60*60*1000).toISOString(), // Dans 2 semaines
        dateFin: new Date(Date.now() + 14*24*60*60*1000 + 3*60*60*1000).toISOString(), // +3h
        adresse: '8 avenue Mozart, 75016 Paris - Terrasse Sophie',
        maxParticipants: 10,
        bobizRecompense: 30,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Plants tomates cerises', quantite: 6, type: 'plante', assigne: null, urgent: true },
        { item: 'Plants basilic', quantite: 4, type: 'plante', assigne: null, urgent: true },
        { item: 'Terreau bio', quantite: 3, type: 'materiel', assigne: null, urgent: true },
        { item: 'Pots terre cuite', quantite: 12, type: 'materiel', assigne: null, urgent: true },
        { item: 'Outils jardinage petits', quantite: 5, type: 'materiel', assigne: null, urgent: true },
        { item: 'Arrosoir', quantite: 2, type: 'materiel', assigne: null, urgent: true },
        { item: 'Graines bio variées', quantite: 1, type: 'plante', assigne: null, urgent: false },
        { item: 'Livres jardinage bio', quantite: 2, type: 'reference', assigne: null, urgent: false },
        { item: 'Rafraîchissements', quantite: 10, type: 'boisson', assigne: null, urgent: false }
      ]
    },
    
    {
      organisateur: 'lucas@bob.com',
      event: {
        titre: '💻 Coding Party & Game Jam',
        description: 'Soirée code en équipe ! Développement collaboratif, partage techniques, mini game jam. Tous niveaux bienvenus, apprentissage mutuel !',
        dateDebut: new Date(Date.now() + 21*24*60*60*1000).toISOString(), // Dans 3 semaines
        dateFin: new Date(Date.now() + 21*24*60*60*1000 + 6*60*60*1000).toISOString(), // +6h
        adresse: '25 rue de la Paix, 75002 Paris - Chez Lucas',
        maxParticipants: 8,
        bobizRecompense: 35,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Laptops supplémentaires', quantite: 3, type: 'materiel', assigne: null, urgent: true },
        { item: 'Écrans externes', quantite: 4, type: 'materiel', assigne: null, urgent: true },
        { item: 'Clavier/souris USB', quantite: 3, type: 'materiel', assigne: null, urgent: true },
        { item: 'Cables HDMI/USB', quantite: 5, type: 'materiel', assigne: null, urgent: true },
        { item: 'Pizza développeurs', quantite: 4, type: 'nourriture', assigne: null, urgent: true },
        { item: 'Energy drinks', quantite: 12, type: 'boisson', assigne: null, urgent: true },
        { item: 'Café de qualité', quantite: 1, type: 'boisson', assigne: null, urgent: true },
        { item: 'Snacks variés', quantite: 1, type: 'nourriture', assigne: null, urgent: false },
        { item: 'Tableau blanc', quantite: 1, type: 'materiel', assigne: null, urgent: false }
      ]
    }
  ];
  
  const createdEvents = [];
  
  for (const eventInfo of eventScenarios) {
    const auth = await authenticateUser(eventInfo.organisateur);
    if (!auth) continue;
    
    try {
      console.log(`\n🎉 Création événement: ${eventInfo.event.titre}`);
      
      // Créer l'événement principal
      const eventResponse = await axios.post(`${STRAPI_URL}/evenements`, {
        data: {
          ...eventInfo.event,
          createur: auth.user.id,
          dateCreation: new Date().toISOString()
        }
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const event = eventResponse.data.data;
      console.log(`✅ Événement créé (ID: ${event.id})`);
      
      // Stocker les besoins dans metadata JSON (en attendant collection séparée)
      const metadataWithBesoins = {
        besoins: eventInfo.besoins,
        participants: [],
        organisateur: auth.user.username
      };
      
      // Mettre à jour avec metadata
      await axios.put(`${STRAPI_URL}/evenements/${event.documentId}`, {
        data: {
          metadata: metadataWithBesoins
        }
      }, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📋 ${eventInfo.besoins.length} besoins ajoutés à la liste`);
      
      createdEvents.push({
        ...event,
        auth,
        besoins: eventInfo.besoins,
        documentId: event.documentId
      });
      
    } catch (error) {
      console.log(`❌ Erreur création événement: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return createdEvents;
}

async function simulateEventParticipations(events) {
  console.log('\n👥 === SIMULATIONS PARTICIPATIONS ÉVÉNEMENTS ===');
  
  const allUsers = ['marie@bob.com', 'thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com'];
  
  for (const event of events) {
    console.log(`\n🎉 Participations pour: ${event.titre}`);
    
    // Autres utilisateurs s'inscrivent (pas l'organisateur)
    const otherUsers = allUsers.filter(email => email !== event.auth.user.email);
    
    for (const userEmail of otherUsers) {
      const participantAuth = await authenticateUser(userEmail);
      if (!participantAuth) continue;
      
      try {
        // Message d'intérêt pour l'événement
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: `Salut ! Ton événement "${event.titre}" m'intéresse énormément ! Je peux participer ? 😊`,
            typeConversation: 'evenement',
            dateEnvoi: new Date().toISOString(),
            expediteur: participantAuth.user.id,
            evenement: event.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`💬 ${participantAuth.user.username} s'inscrit`);
        
        // Réponse de l'organisateur
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: `Super ${participantAuth.user.username} ! Bienvenue dans l'événement ! 🎉 Regarde la liste des besoins, tu peux prendre ce qui t'arrange !`,
            typeConversation: 'evenement',
            dateEnvoi: new Date(Date.now() + 60000).toISOString(),
            expediteur: event.auth.user.id,
            evenement: event.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${event.auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ ${event.auth.user.username} confirme inscription`);
        
      } catch (error) {
        console.log(`❌ Erreur inscription: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

async function simulateQuiApporteQuoi(events) {
  console.log('\n📋 === SIMULATION "QUI APPORTE QUOI" ===');
  
  const allUsers = ['marie@bob.com', 'thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com'];
  
  for (const event of events) {
    console.log(`\n📋 Attribution besoins pour: ${event.titre}`);
    
    const otherUsers = allUsers.filter(email => email !== event.auth.user.email);
    
    // Chaque participant prend quelques besoins
    for (let i = 0; i < otherUsers.length; i++) {
      const userEmail = otherUsers[i];
      const participantAuth = await authenticateUser(userEmail);
      if (!participantAuth) continue;
      
      // Prendre 2-3 besoins par participant
      const besoinsAPrend = event.besoins.slice(i * 2, (i * 2) + 2);
      
      for (const besoin of besoinsAPrend) {
        try {
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `🙋‍♀️ Je prends "${besoin.item}" ! ${besoin.urgent ? '⚡ Urgent fait !' : 'Pas de souci pour moi'}`,
              typeConversation: 'evenement',
              dateEnvoi: new Date().toISOString(),
              expediteur: participantAuth.user.id,
              evenement: event.id
            }
          }, {
            headers: {
              'Authorization': `Bearer ${participantAuth.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`✅ ${participantAuth.user.username} prend: ${besoin.item}`);
          
          // Réponse organisateur
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `Perfect ${participantAuth.user.username} ! Merci pour "${besoin.item}" ! 🙏 Un truc en moins à gérer !`,
              typeConversation: 'evenement',
              dateEnvoi: new Date(Date.now() + 30000).toISOString(),
              expediteur: event.auth.user.id,
              evenement: event.id
            }
          }, {
            headers: {
              'Authorization': `Bearer ${event.auth.token}`,
              'Content-Type': 'application/json'
            }
          });
          
        } catch (error) {
          console.log(`❌ Erreur attribution: ${error.response?.data?.error?.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Messages de coordination
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `📋 RÉCAP FINAL ! Super équipe ! On a presque tout couvert ! Quelqu'un peut s'occuper des derniers détails ? L'événement va être génial ! 🎉`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: event.auth.user.id,
          evenement: event.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`📋 Coordination finale organisée`);
      
    } catch (error) {
      console.log(`❌ Erreur coordination: ${error.response?.data?.error?.message}`);
    }
  }
}

async function finalizeEventsStatus(events) {
  console.log('\n🏁 === FINALISATION STATUTS ÉVÉNEMENTS ===');
  
  for (const event of events) {
    try {
      console.log(`\n🎯 Finalisation: ${event.titre}`);
      
      // Passer en "en_cours" 
      await axios.put(`${STRAPI_URL}/evenements/${event.documentId}`, {
        data: {
          statut: 'en_cours'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Statut: planifié → en_cours');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Messages pendant l'événement
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎉 L'ÉVÉNEMENT A COMMENCÉ ! Merci à tous d'être là ! Ambiance au top ! 🥳`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: event.auth.user.id,
          evenement: event.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Finaliser l'événement
      await axios.put(`${STRAPI_URL}/evenements/${event.documentId}`, {
        data: {
          statut: 'termine'
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Statut: en_cours → terminé');
      
      // Message de remerciement final
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🙏 MERCI À TOUS ! Événement RÉUSSI grâce à votre super organisation ! Tout le monde a adoré ! À très bientôt pour le prochain ! ❤️`,
          typeConversation: 'evenement',
          dateEnvoi: new Date().toISOString(),
          expediteur: event.auth.user.id,
          evenement: event.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Attribution BOBIZ aux participants
      const allUsers = ['marie@bob.com', 'thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com'];
      
      for (const userEmail of allUsers) {
        const userAuth = await authenticateUser(userEmail);
        if (!userAuth) continue;
        
        try {
          await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
            data: {
              points: event.bobizRecompense,
              type: 'gain',
              source: 'evenement_participe',
              description: `Participation événement: ${event.titre}`,
              dateTransaction: new Date().toISOString(),
              user: userAuth.user.id,
              evenement: event.id
            }
          }, {
            headers: {
              'Authorization': `Bearer ${userAuth.token}`,
              'Content-Type': 'application/json'
            }
          });
          
        } catch (error) {
          console.log(`❌ BOBIZ ${userEmail}: ${error.response?.data?.error?.message}`);
        }
      }
      
      console.log(`💎 ${event.bobizRecompense} BOBIZ attribués à tous les participants`);
      
    } catch (error) {
      console.log(`❌ Erreur finalisation: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

async function generateEventsReport() {
  console.log('\n📊 === RAPPORT ÉVÉNEMENTS COMPLET ===');
  
  const auth = await authenticateUser('marie@bob.com');
  if (!auth) return;
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    const [eventsResp, messagesResp, transactionsResp] = await Promise.all([
      axios.get(`${STRAPI_URL}/evenements`, { headers }),
      axios.get(`${STRAPI_URL}/messages`, { headers }),
      axios.get(`${STRAPI_URL}/bobiz-transactions`, { headers })
    ]);
    
    const events = eventsResp.data.data;
    const messages = messagesResp.data.data;
    const transactions = transactionsResp.data.data;
    
    const eventMessages = messages.filter(m => m.typeConversation === 'evenement');
    const eventTransactions = transactions.filter(t => t.source === 'evenement_participe');
    const totalEventBobiz = eventTransactions.reduce((sum, t) => sum + t.points, 0);
    
    console.log(`🎉 SYSTÈME ÉVÉNEMENTS CRÉÉ:`);
    console.log(`  📋 ${events.length} événements organisés`);
    console.log(`  💬 ${eventMessages.length} messages coordination`);
    console.log(`  💰 ${eventTransactions.length} transactions événements`);
    console.log(`  💎 ${totalEventBobiz} BOBIZ distribués aux participants`);
    
    console.log(`\n🎯 TYPES D'ÉVÉNEMENTS:`);
    events.forEach(event => {
      console.log(`  🎉 ${event.titre} (${event.statut})`);
    });
    
    console.log(`\n✅ FONCTIONNALITÉS IMPLÉMENTÉES:`);
    console.log(`  🎉 Création événements avec détails complets`);
    console.log(`  📋 Listes de besoins "qui apporte quoi"`);
    console.log(`  👥 Inscriptions et confirmations participants`);
    console.log(`  💬 Messagerie coordination événement`);
    console.log(`  📈 Statuts évolutifs (planifié → en_cours → terminé)`);
    console.log(`  💎 Distribution BOBIZ aux participants`);
    console.log(`  🗂️ Stockage metadata pour extensions futures`);
    
    console.log(`\n🚀 PRÊT POUR EXTENSIONS:`);
    console.log(`  📱 QR codes partage événements`);
    console.log(`  💌 Invitations automatiques`);
    console.log(`  🔔 Notifications rappels`);
    console.log(`  📅 Intégration calendrier`);
    console.log(`  📊 Analytics participation`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport événements: ${error.message}`);
  }
}

async function main() {
  console.log('🎉 === SYSTÈME ÉVÉNEMENTS COMPLET ===\n');
  console.log('🎯 Objectif: Soirées avec listes besoins et coordination\n');
  
  // 1. Créer événements diversifiés
  const events = await createDiverseEvents();
  
  if (events.length === 0) {
    console.log('❌ Aucun événement créé');
    return;
  }
  
  // 2. Simulations participations
  await simulateEventParticipations(events);
  
  // 3. Logique "qui apporte quoi"
  await simulateQuiApporteQuoi(events);
  
  // 4. Finalisation événements
  await finalizeEventsStatus(events);
  
  // 5. Rapport complet
  await generateEventsReport();
  
  console.log('\n✨ === SYSTÈME ÉVÉNEMENTS TERMINÉ ! ===');
  console.log('🎉 Events avec coordination complète créés !');
  console.log('🚀 Prêt pour QR codes et invitations !');
}

main().catch(console.error);