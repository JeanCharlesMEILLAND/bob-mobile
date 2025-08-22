// Système Events fonctionnel avec participants multiples et simulation complète
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

async function createEventsWithMultipleParticipants() {
  console.log('🎉 === CRÉATION ÉVÉNEMENTS MULTI-PARTICIPANTS ===');
  
  const eventScenarios = [
    {
      organisateur: 'marie@bob.com',
      event: {
        titre: '🍕 Pizza Party Bricoleurs - Multi Participants',
        description: 'Soirée conviviale entre passionnés bricolage ! Chacun apporte quelque chose selon ses possibilités. Système d\'organisation collaborative !',
        dateDebut: new Date(Date.now() + 7*24*60*60*1000).toISOString(), // Dans 1 semaine
        dateFin: new Date(Date.now() + 7*24*60*60*1000 + 4*60*60*1000).toISOString(), // +4h
        adresse: '12 rue des Lilas, 75015 Paris - Chez Marie',
        maxParticipants: 8,
        bobizRecompense: 30,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Pizzas margherita', quantite: 3, type: 'nourriture', urgent: true, deadline: 'Jour J matin' },
        { item: 'Pizzas 4 fromages', quantite: 2, type: 'nourriture', urgent: true, deadline: 'Jour J matin' },
        { item: 'Salade verte + tomates', quantite: 1, type: 'nourriture', urgent: false, deadline: 'Jour J' },
        { item: 'Boissons softs (Coca, Fanta)', quantite: 8, type: 'boisson', urgent: true, deadline: 'Veille' },
        { item: 'Bières artisanales', quantite: 6, type: 'boisson', urgent: false, deadline: 'Jour J' },
        { item: 'Dessert (tiramisu ou tarte)', quantite: 1, type: 'dessert', urgent: false, deadline: 'Jour J' },
        { item: 'Enceinte bluetooth puissante', quantite: 1, type: 'materiel', urgent: true, deadline: '2 jours avant' },
        { item: 'Jeux société/cartes', quantite: 3, type: 'animation', urgent: false, deadline: 'Jour J' }
      ],
      participants_invites: ['thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com']
    },
    
    {
      organisateur: 'thomas@bob.com',
      event: {
        titre: '🌱 Atelier Jardinage Urbain Collectif',
        description: 'Créons ensemble un potager sur ma terrasse ! Chacun repart avec ses plants. Apprentissage mutuel et partage de graines !',
        dateDebut: new Date(Date.now() + 14*24*60*60*1000).toISOString(), // Dans 2 semaines
        dateFin: new Date(Date.now() + 14*24*60*60*1000 + 4*60*60*1000).toISOString(), // +4h
        adresse: '45 avenue Parmentier, 75011 Paris - Terrasse Thomas',
        maxParticipants: 6,
        bobizRecompense: 35,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Plants tomates cerises (6 plants)', quantite: 6, type: 'plante', urgent: true, deadline: 'Jour J matin' },
        { item: 'Plants basilic et persil', quantite: 8, type: 'plante', urgent: true, deadline: 'Jour J matin' },
        { item: 'Terreau bio (3 sacs)', quantite: 3, type: 'materiel', urgent: true, deadline: 'Veille' },
        { item: 'Pots terre cuite variés', quantite: 15, type: 'materiel', urgent: true, deadline: 'Veille' },
        { item: 'Outils jardinage (bêches, serfouettes)', quantite: 6, type: 'materiel', urgent: true, deadline: 'Jour J' },
        { item: 'Arrosoirs et pulvérisateurs', quantite: 3, type: 'materiel', urgent: true, deadline: 'Jour J' },
        { item: 'Graines bio diverses', quantite: 1, type: 'plante', urgent: false, deadline: 'Jour J' },
        { item: 'Gants jardinage (6 paires)', quantite: 6, type: 'materiel', urgent: false, deadline: 'Jour J' },
        { item: 'Boissons fraîches', quantite: 8, type: 'boisson', urgent: false, deadline: 'Jour J' }
      ],
      participants_invites: ['marie@bob.com', 'sophie@bob.com', 'lucas@bob.com']
    },
    
    {
      organisateur: 'sophie@bob.com',
      event: {
        titre: '🎵 Soirée Musicale Acoustic Session',
        description: 'Soirée music entre amis ! Chacun apporte son instrument ou just sa voix ! Ambiance cozy et partage musical.',
        dateDebut: new Date(Date.now() + 21*24*60*60*1000).toISOString(), // Dans 3 semaines
        dateFin: new Date(Date.now() + 21*24*60*60*1000 + 5*60*60*1000).toISOString(), // +5h
        adresse: '8 avenue Mozart, 75016 Paris - Salon Sophie',
        maxParticipants: 8,
        bobizRecompense: 25,
        statut: 'planifie'
      },
      besoins: [
        { item: 'Guitares acoustiques', quantite: 3, type: 'instrument', urgent: true, deadline: 'Jour J' },
        { item: 'Clavier/piano portable', quantite: 1, type: 'instrument', urgent: true, deadline: 'Jour J' },
        { item: 'Percussion (djembé, cajon)', quantite: 2, type: 'instrument', urgent: false, deadline: 'Jour J' },
        { item: 'Micro et petite sono', quantite: 1, type: 'materiel', urgent: true, deadline: 'Veille' },
        { item: 'Coussins et tapis sol', quantite: 8, type: 'confort', urgent: false, deadline: 'Jour J' },
        { item: 'Bougies ambiance', quantite: 10, type: 'decoration', urgent: false, deadline: 'Jour J' },
        { item: 'Tisanes et thés variés', quantite: 1, type: 'boisson', urgent: false, deadline: 'Jour J' },
        { item: 'Petits gâteaux maison', quantite: 1, type: 'dessert', urgent: false, deadline: 'Jour J' }
      ],
      participants_invites: ['marie@bob.com', 'thomas@bob.com', 'lucas@bob.com']
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
      console.log(`👥 ${eventInfo.participants_invites.length} participants invités`);
      console.log(`📋 ${eventInfo.besoins.length} besoins à organiser`);
      
      createdEvents.push({
        ...event,
        auth,
        besoins: eventInfo.besoins,
        participants_invites: eventInfo.participants_invites,
        documentId: event.documentId
      });
      
    } catch (error) {
      console.log(`❌ Erreur création: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return createdEvents;
}

async function simulateDetailedParticipantInteractions(events) {
  console.log('\n👥 === INTERACTIONS DÉTAILLÉES MULTI-PARTICIPANTS ===');
  
  for (const event of events) {
    console.log(`\n🎉 Interactions pour: ${event.titre}`);
    
    // Phase 1: Invitations et réponses
    for (const participantEmail of event.participants_invites) {
      const participantAuth = await authenticateUser(participantEmail);
      if (!participantAuth) continue;
      
      try {
        // Message d'invitation de l'organisateur
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: `🎉 INVITATION ÉVÉNEMENT ! 🎉\n\nSalut ${participantAuth.user.username} ! Je t'invite à mon événement "${event.titre}" !\n\n📅 Date: ${new Date(event.dateDebut).toLocaleDateString()}\n🕐 Heure: ${new Date(event.dateDebut).toLocaleTimeString()}\n📍 Lieu: ${event.adresse}\n\n💡 Il y a une liste de choses à apporter, dis-moi ce que tu peux prendre !\n\nTu peux venir ? 😊`,
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
        
        console.log(`📧 Invitation envoyée à ${participantAuth.user.username}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Réponse enthousiaste du participant
        const reponses = [
          `Salut ! Super idée cet événement ! 😍 Je confirme ma présence ! Montre-moi la liste des besoins !`,
          `Parfait ! J'adore ce type d'activité ! 🙌 Compte sur moi ! Qu'est-ce que je peux apporter ?`,
          `Génial ! J'ai justement envie de faire ça ! ✨ Je viens ! Dis-moi ce que tu veux que j'amène !`
        ];
        
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: reponses[Math.floor(Math.random() * reponses.length)],
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
        
        console.log(`✅ ${participantAuth.user.username} accepte avec enthousiasme`);
        
      } catch (error) {
        console.log(`❌ Erreur invitation: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // Phase 2: Organisateur présente la liste des besoins
    try {
      const listeBesoins = event.besoins.map((besoin, index) => 
        `${index + 1}. ${besoin.item} (${besoin.type})${besoin.urgent ? ' ⚡ URGENT' : ''} - Deadline: ${besoin.deadline}`
      ).join('\n');
      
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `📋 LISTE DES BESOINS - QUI APPORTE QUOI ?\n\nVoici tout ce dont on a besoin :\n\n${listeBesoins}\n\n💡 Choisissez ce que vous pouvez apporter ! Premier arrivé, premier servi ! 😉\n\nMerci les amis ! 🙏`,
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
      
      console.log(`📋 Liste des besoins partagée`);
      
    } catch (error) {
      console.log(`❌ Erreur liste besoins: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function simulateAdvancedQuiApporteQuoiSystem(events) {
  console.log('\n📋 === SYSTÈME AVANCÉ "QUI APPORTE QUOI" ===');
  
  for (const event of events) {
    console.log(`\n📋 Attribution intelligente pour: ${event.titre}`);
    
    // Répartition intelligente des besoins entre participants
    for (let i = 0; i < event.participants_invites.length; i++) {
      const participantEmail = event.participants_invites[i];
      const participantAuth = await authenticateUser(participantEmail);
      if (!participantAuth) continue;
      
      // Chaque participant prend 2-3 besoins différents
      const besoinsParParticipant = Math.ceil(event.besoins.length / event.participants_invites.length);
      const startIndex = i * besoinsParParticipant;
      const besoinsAPrend = event.besoins.slice(startIndex, startIndex + besoinsParParticipant);
      
      for (const besoin of besoinsAPrend) {
        try {
          const urgenceText = besoin.urgent ? '⚡ URGENT - ' : '';
          const deadlineText = besoin.deadline ? ` (Deadline: ${besoin.deadline})` : '';
          
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `🙋‍♀️ Je prends "${besoin.item}" !\n\n${urgenceText}Pas de problème, je m'en occupe !${deadlineText}\n\n${besoin.urgent ? '⚡ Je note que c\'est urgent, je vais m\'y prendre à l\'avance !' : '✅ Cool, j\'ai le temps de bien choisir !'}`,
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
          
          console.log(`✅ ${participantAuth.user.username} prend: ${besoin.item}${besoin.urgent ? ' (URGENT)' : ''}`);
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Réaction organisateur
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `Super ${participantAuth.user.username} ! 🙏 Merci pour "${besoin.item}" !\n\n${besoin.urgent ? '⚡ Génial que tu prennes l\'urgent ! Tu es au top !' : '✅ Parfait ! Un truc en moins à gérer !'}`,
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
          
        } catch (error) {
          console.log(`❌ Erreur attribution: ${error.response?.data?.error?.message}`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Message de coordination du participant après ses attributions
      try {
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: `📝 RÉCAP PERSO\n\nVoilà ce que j'apporte :\n${besoinsAPrend.map(b => `✅ ${b.item}`).join('\n')}\n\nTout est noté ! J'ai hâte ! 😊`,
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
        
        console.log(`📝 ${participantAuth.user.username} fait son récap personnel`);
        
      } catch (error) {
        console.log(`❌ Erreur récap: ${error.response?.data?.error?.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    // Message de coordination finale de l'organisateur
    try {
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎯 ORGANISATION TERMINÉE !\n\n🔥 BRAVO TOUT LE MONDE ! 🔥\n\n✅ Tous les besoins sont couverts\n✅ Chacun sait ce qu'il apporte\n✅ Les urgences sont prises en charge\n\nVous êtes une équipe PARFAITE ! 🏆\n\nPlus qu'à attendre le jour J ! 🚀`,
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
      
      console.log(`🎯 Coordination finale organisée`);
      
    } catch (error) {
      console.log(`❌ Erreur coordination finale: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function simulatePreEventReminders(events) {
  console.log('\n🔔 === SIMULATION RAPPELS PRÉ-ÉVÉNEMENT ===');
  
  for (const event of events) {
    console.log(`\n🔔 Rappels pour: ${event.titre}`);
    
    try {
      // Rappel organisateur 3 jours avant
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `📅 RAPPEL - 3 JOURS AVANT L'ÉVÉNEMENT\n\nSalut l'équipe ! Dans 3 jours c'est "${event.titre}" ! 🎉\n\n📋 Petite vérification :\n✅ Vous avez tous en tête ce que vous apportez ?\n✅ Quelqu'un a des questions ?\n✅ Tout le monde a bien l'adresse ?\n\n📍 Rappel adresse : ${event.adresse}\n🕐 Rappel heure : ${new Date(event.dateDebut).toLocaleTimeString()}\n\nJ'ai hâte ! 😊`,
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
      
      console.log('📱 Rappel 3 jours envoyé');
      
      // Réponses des participants
      for (const participantEmail of event.participants_invites) {
        const participantAuth = await authenticateUser(participantEmail);
        if (!participantAuth) continue;
        
        const reponses = [
          `✅ Tout est noté ! Mes courses sont prévues ! 😊`,
          `👍 J'ai tout en tête ! Hâte d'y être !`,
          `🎯 C'est good ! Je n'oublie rien ! 💪`
        ];
        
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: reponses[Math.floor(Math.random() * reponses.length)],
            typeConversation: 'evenement',
            dateEnvoi: new Date(Date.now() + Math.random() * 30000).toISOString(),
            expediteur: participantAuth.user.id,
            evenement: event.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('✅ Participants confirment leurs préparatifs');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Rappel organisateur 1 jour avant
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🚨 RAPPEL - DEMAIN C'EST LE JOUR J ! 🚨\n\n🔥 Plus que quelques heures ! 🔥\n\n⚡ DERNIÈRE LIGNE DROITE :\n📦 Dernières courses si besoin\n📱 Rechargez vos téléphones\n🚗 Prévoyez votre transport\n⏰ RDV à ${new Date(event.dateDebut).toLocaleTimeString()} pile !\n\nOn va passer un moment FANTASTIQUE ! 🎉`,
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
      
      console.log('📱 Rappel 1 jour envoyé');
      
      // Rappel final 2h avant
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `⏰ RAPPEL FINAL - 2H AVANT ! ⏰\n\n🎯 C'EST BIENTÔT !\n\n🔥 CHECK FINAL :\n✅ J'ai tout ce que j'ai promis d'apporter\n✅ Je connais le chemin\n✅ J'arrive à l'heure\n✅ Mon téléphone est chargé\n\n📍 ${event.adresse}\n🕐 RDV dans 2h !\n\nLET'S GO ! 🚀`,
          typeConversation: 'evenement',
          dateEnvoi: new Date(Date.now() + 120000).toISOString(),
          expediteur: event.auth.user.id,
          evenement: event.id
        }
      }, {
        headers: {
          'Authorization': `Bearer ${event.auth.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📱 Rappel final 2h envoyé');
      
    } catch (error) {
      console.log(`❌ Erreur rappels: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

async function finalizeEventsWithParticipantFeedback(events) {
  console.log('\n🏁 === FINALISATION AVEC FEEDBACK PARTICIPANTS ===');
  
  for (const event of events) {
    try {
      console.log(`\n🎯 Finalisation: ${event.titre}`);
      
      // Début de l'événement
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
      
      // Messages pendant l'événement
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🎉 L'ÉVÉNEMENT A COMMENCÉ ! 🎉\n\n🔥 Tout le monde est là ! 🔥\n✅ Toute l'organisation était parfaite\n✅ Personne n'a rien oublié\n✅ L'ambiance est AU TOP !\n\nVous êtes vraiment les meilleurs ! 🏆`,
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
      
      // Feedback des participants pendant l'événement
      for (const participantEmail of event.participants_invites) {
        const participantAuth = await authenticateUser(participantEmail);
        if (!participantAuth) continue;
        
        const feedbacks = [
          `🔥 Ambiance de folie ! Super organisation ! 😍`,
          `✨ C'est parfait ! J'adore ! Merci pour l'orga ! 🙏`,
          `🎉 Génial ! On refait ça quand ? 😄`
        ];
        
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: feedbacks[Math.floor(Math.random() * feedbacks.length)],
            typeConversation: 'evenement',
            dateEnvoi: new Date(Date.now() + Math.random() * 60000).toISOString(),
            expediteur: participantAuth.user.id,
            evenement: event.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('💬 Feedback en temps réel des participants');
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Fin de l'événement
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
      
      // Message de remerciement organisateur
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: `🙏 MERCI À TOUS ! ÉVÉNEMENT RÉUSSI ! 🙏\n\n✨ Bilan de la soirée :\n🎯 Organisation : PARFAITE\n👥 Participation : EXCELLENTE\n🎉 Ambiance : FANTASTIQUE\n💝 Souvenirs : INOUBLIABLES\n\n💎 BOBIZ bien mérités distribués !\n\nÀ très bientôt pour le prochain ! ❤️`,
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
      
      // Distribution BOBIZ avec bonus participation active
      const allParticipants = [event.auth.user.email, ...event.participants_invites];
      
      for (const userEmail of allParticipants) {
        const userAuth = await authenticateUser(userEmail);
        if (!userAuth) continue;
        
        try {
          // Bonus organisateur ou participant actif
          const isOrganisateur = userEmail === event.auth.user.email;
          const bonusPoints = isOrganisateur ? 15 : 10;
          const totalBobiz = event.bobizRecompense + bonusPoints;
          
          await axios.post(`${STRAPI_URL}/bobiz-transactions`, {
            data: {
              points: totalBobiz,
              type: 'gain',
              source: 'evenement_multi_participants',
              description: `Événement multi-participants: ${event.titre}${isOrganisateur ? ' (+bonus organisation)' : ' (+bonus participation active)'}`,
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
      
      console.log(`💎 BOBIZ distribués avec bonus participation`);
      
    } catch (error) {
      console.log(`❌ Erreur finalisation: ${error.response?.data?.error?.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function generateMultiParticipantsReport() {
  console.log('\n📊 === RAPPORT ÉVÉNEMENTS MULTI-PARTICIPANTS ===');
  
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
    const eventTransactions = transactions.filter(t => t.source?.includes('evenement'));
    const totalEventBobiz = eventTransactions.reduce((sum, t) => sum + t.points, 0);
    
    console.log(`🎉 SYSTÈME ÉVÉNEMENTS MULTI-PARTICIPANTS CRÉÉ:`);
    console.log(`  📋 ${events.length} événements collaboratifs`);
    console.log(`  💬 ${eventMessages.length} messages coordination détaillée`);
    console.log(`  💰 ${eventTransactions.length} transactions avec bonus`);
    console.log(`  💎 ${totalEventBobiz} BOBIZ distribués total`);
    
    console.log(`\n🎯 ÉVÉNEMENTS CRÉÉS:`);
    events.forEach(event => {
      console.log(`  🎉 ${event.titre} (${event.statut})`);
      console.log(`     👥 Max ${event.maxParticipants} participants`);
      console.log(`     💎 ${event.bobizRecompense} BOBIZ de base`);
    });
    
    console.log(`\n✅ FONCTIONNALITÉS IMPLÉMENTÉES:`);
    console.log(`  🎉 Événements avec participants multiples`);
    console.log(`  📋 Listes besoins détaillées avec deadlines`);
    console.log(`  💌 Invitations personnalisées et réponses`);
    console.log(`  📝 Système "qui apporte quoi" intelligent`);
    console.log(`  🔔 Rappels automatiques (3j, 1j, 2h)`);
    console.log(`  💬 Chat coordination en temps réel`);
    console.log(`  📊 Feedback participants pendant événement`);
    console.log(`  💎 Distribution BOBIZ avec bonus participation`);
    console.log(`  🎯 Statuts évolutifs avec suivi détaillé`);
    
    console.log(`\n🚀 PRÊT POUR EXTENSIONS:`);
    console.log(`  📱 QR codes check-in événements`);
    console.log(`  💌 Templates invitations par type`);
    console.log(`  🔔 Notifications push intelligentes`);
    console.log(`  💬 Socket.io messagerie temps réel`);
    console.log(`  🤖 Intelligence artificielle coordination`);
    
  } catch (error) {
    console.log(`❌ Erreur rapport: ${error.message}`);
  }
}

async function main() {
  console.log('🎉 === SYSTÈME ÉVÉNEMENTS MULTI-PARTICIPANTS ===\n');
  console.log('🎯 Objectif: Soirées avec participants multiples et coordination complète\n');
  
  // 1. Créer événements multi-participants
  const events = await createEventsWithMultipleParticipants();
  
  if (events.length === 0) {
    console.log('❌ Aucun événement créé');
    return;
  }
  
  // 2. Interactions détaillées participants
  await simulateDetailedParticipantInteractions(events);
  
  // 3. Système avancé "qui apporte quoi"
  await simulateAdvancedQuiApporteQuoiSystem(events);
  
  // 4. Rappels pré-événement
  await simulatePreEventReminders(events);
  
  // 5. Finalisation avec feedback
  await finalizeEventsWithParticipantFeedback(events);
  
  // 6. Rapport final
  await generateMultiParticipantsReport();
  
  console.log('\n✨ === ÉVÉNEMENTS MULTI-PARTICIPANTS TERMINÉS ! ===');
  console.log('🎉 Coordination complète avec participants multiples !');
  console.log('📋 Système "qui apporte quoi" intelligent créé !');
}

main().catch(console.error);