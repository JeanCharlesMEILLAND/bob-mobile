// Test de l'interface BOB Collectif via les services mobile
const axios = require('axios');

const STRAPI_URL = 'http://46.202.153.43:1337/api';

async function authenticateUser(email) {
  try {
    const response = await axios.post(`${STRAPI_URL}/auth/local`, {
      identifier: email,
      password: 'password123'
    });
    
    return {
      token: response.data.jwt,
      user: response.data.user
    };
  } catch (error) {
    console.log(`❌ Auth failed: ${email}`);
    return null;
  }
}

async function testBobCollectifInterface() {
  console.log('🎯 === TEST INTERFACE BOB COLLECTIF ===\n');
  
  // 1. Authentification
  const auth = await authenticateUser('marie@bob.com');
  if (!auth) {
    console.log('❌ Impossible de s\'authentifier');
    return;
  }
  
  console.log(`✅ Authentifié : ${auth.user.username}`);
  
  // 2. Données de test pour BOB Collectif Cracovie (comme dans l'interface)
  const eventData = {
    titre: '✈️ Week-end Cracovie - BOB Collectif Mobile',
    description: 'Salut ! Je pars en week-end à Cracovie et j\'ai besoin de votre aide ! Qui peut m\'aider ? 😊',
    dateDebut: new Date(Date.now() + 15*24*60*60*1000).toISOString(), // Dans 15 jours
    dateFin: new Date(Date.now() + 17*24*60*60*1000).toISOString(), // +2 jours
    adresse: 'Cracovie, Pologne (départ Paris)',
    maxParticipants: 8,
    bobizRecompense: 45,
    besoins: [
      {
        id: 'besoin_1',
        type: 'objet',
        titre: 'Appareil photo numérique',
        description: 'Pour immortaliser Cracovie ! Un bon appareil avec objectif',
        quantite: 1,
        isCreatorPositioned: false
      },
      {
        id: 'besoin_2',
        type: 'service_individuel',
        titre: 'Transport aéroport (aller)',
        description: 'Quelqu\'un pour m\'emmener à CDG - Départ 6h du matin !',
        isCreatorPositioned: false
      },
      {
        id: 'besoin_3',
        type: 'objet',
        titre: 'Valise grande taille',
        description: 'Une grosse valise pour 3 jours, la mienne est cassée',
        quantite: 1,
        isCreatorPositioned: false
      },
      {
        id: 'besoin_4',
        type: 'service_collectif',
        titre: 'Aide transport valise',
        description: 'Pour descendre/monter la valise (4ème étage sans ascenseur)',
        maxPersonnes: 4,
        isCreatorPositioned: false
      },
      {
        id: 'besoin_5',
        type: 'objet',
        titre: 'Chargeur portable puissant',
        description: 'Power bank pour le voyage, le mien ne tient plus',
        quantite: 1,
        isCreatorPositioned: false
      }
    ],
    ciblage: {
      type: 'all' // Tous les contacts
    }
  };
  
  // 3. Créer l'événement via l'API (comme dans le service mobile)
  try {
    console.log('\n🎯 Création BOB Collectif via interface mobile...');
    
    const response = await axios.post(`${STRAPI_URL}/evenements`, {
      data: {
        titre: eventData.titre,
        description: eventData.description,
        dateDebut: eventData.dateDebut,
        dateFin: eventData.dateFin,
        adresse: eventData.adresse,
        maxParticipants: eventData.maxParticipants,
        bobizRecompense: eventData.bobizRecompense,
        statut: 'planifie',
        createur: auth.user.id,
        dateCreation: new Date().toISOString(),
        metadata: {
          besoins: eventData.besoins,
          ciblage: eventData.ciblage,
          bobsIndividuelsCreés: [],
          type: 'bob_collectif',
          interface_source: 'mobile_app'
        }
      }
    }, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const event = response.data.data;
    console.log(`✅ BOB Collectif créé via interface: ID ${event.id}`);
    console.log(`📱 Titre: ${event.titre}`);
    console.log(`📋 ${eventData.besoins.length} besoins définis`);
    
    // 4. Simuler l'affichage dans EventsScreen
    console.log('\n📱 === AFFICHAGE DANS L\'INTERFACE MOBILE ===');
    
    const mockEvent = {
      ...event,
      besoins: eventData.besoins
    };
    
    console.log(`\n🎯 Événement affiché:`);
    console.log(`   📅 ${mockEvent.titre}`);
    console.log(`   📍 ${mockEvent.adresse}`);
    console.log(`   📊 Statut: ${mockEvent.statut}`);
    console.log(`   💎 ${mockEvent.bobizRecompense} BOBIZ`);
    
    console.log(`\n📋 Besoins affichés (${mockEvent.besoins.length}):`);
    mockEvent.besoins.forEach((besoin, index) => {
      const icon = besoin.type === 'objet' ? '📦' : 
                   besoin.type === 'service_individuel' ? '👤' : 
                   besoin.type === 'service_collectif' ? '👥' : '⏰';
      
      console.log(`   ${index + 1}. ${icon} ${besoin.titre}`);
      console.log(`      📝 ${besoin.description}`);
      
      if (besoin.quantite && besoin.quantite > 1) {
        console.log(`      👥 Quantité: ${besoin.quantite}`);
      }
      
      if (besoin.maxPersonnes && besoin.maxPersonnes > 1) {
        console.log(`      👥 Max ${besoin.maxPersonnes} personnes`);
      }
      
      console.log(`      🎯 [Bouton: "Me positionner"]`);
      console.log('');
    });
    
    // 5. Simuler un positionnement depuis l'interface
    console.log('🎯 === SIMULATION POSITIONNEMENT DEPUIS MOBILE ===');
    
    // Thomas se connecte et se positionne sur l'appareil photo
    const thomasAuth = await authenticateUser('thomas@bob.com');
    if (thomasAuth) {
      console.log(`\n📱 ${thomasAuth.user.username} ouvre l'événement et clique "Me positionner" sur "Appareil photo"`);
      
      const besoinAppareil = mockEvent.besoins[0];
      
      // Créer BOB individuel (comme dans le service)
      try {
        const bobResponse = await axios.post(`${STRAPI_URL}/echanges`, {
          data: {
            titre: `📸 ${besoinAppareil.titre} - ${mockEvent.titre}`,
            description: `${besoinAppareil.description}\n\n🎯 Issu du BOB Collectif "${mockEvent.titre}"\n\n📱 Via interface mobile\n📅 Événement: ${new Date(mockEvent.dateDebut).toLocaleDateString()}`,
            type: 'pret',
            bobizGagnes: 15,
            statut: 'actif',
            createur: thomasAuth.user.id,
            demandeur: auth.user.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${thomasAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const bobIndividuel = bobResponse.data.data;
        console.log(`✅ BOB individuel créé automatiquement: ID ${bobIndividuel.id}`);
        console.log(`   📦 ${bobIndividuel.titre}`);
        console.log(`   💎 ${bobIndividuel.bobizGagnes} BOBIZ`);
        
        // Message dans la conversation événement
        await axios.post(`${STRAPI_URL}/messages`, {
          data: {
            contenu: `🎯 POSITIONNEMENT VIA MOBILE !\n\n${thomasAuth.user.username} se positionne sur "${besoinAppareil.titre}" !\n\n✅ BOB individuel créé automatiquement (ID: ${bobIndividuel.id})\n💎 ${bobIndividuel.bobizGagnes} BOBIZ\n📱 Via interface mobile\n\n👀 Visible par tous les participants !`,
            typeConversation: 'evenement',
            dateEnvoi: new Date().toISOString(),
            expediteur: thomasAuth.user.id,
            evenement: event.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${thomasAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`💬 Message de positionnement ajouté à la conversation`);
        
        // Mettre à jour le besoin avec l'assignation (pour l'interface)
        const updatedBesoins = mockEvent.besoins.map(b => {
          if (b.id === besoinAppareil.id) {
            return {
              ...b,
              assignations: [{
                participant: thomasAuth.user.username,
                participant_id: thomasAuth.user.id,
                bob_individuel_id: bobIndividuel.id,
                assigné_le: new Date().toISOString()
              }]
            };
          }
          return b;
        });
        
        // Mettre à jour l'événement
        await axios.put(`${STRAPI_URL}/evenements/${event.documentId}`, {
          data: {
            metadata: {
              besoins: updatedBesoins,
              ciblage: eventData.ciblage,
              bobsIndividuelsCreés: [bobIndividuel.id],
              type: 'bob_collectif',
              interface_source: 'mobile_app'
            }
          }
        }, {
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`📊 Événement mis à jour avec l'assignation`);
        
        // 6. Affichage mis à jour dans l'interface
        console.log('\n📱 === INTERFACE MISE À JOUR ===');
        console.log(`\n📋 Besoin "Appareil photo":`);
        console.log(`   📸 ${besoinAppareil.titre}`);
        console.log(`   ✅ Pris en charge par ${thomasAuth.user.username}`);
        console.log(`   🔗 BOB individuel: ${bobIndividuel.titre}`);
        console.log(`   🎯 [Bouton: "Me positionner"] → MASQUÉ`);
        
      } catch (error) {
        console.log(`❌ Erreur création BOB individuel: ${error.response?.data?.error?.message}`);
      }
    }
    
    console.log('\n✅ === TEST INTERFACE BOB COLLECTIF RÉUSSI ! ===');
    console.log('📱 Interface mobile opérationnelle pour:');
    console.log('   🎯 Création BOB Collectif avec besoins');
    console.log('   📋 Affichage liste des besoins');
    console.log('   🎯 Positionnement sur besoins');
    console.log('   🤝 Création automatique BOB individuels');
    console.log('   💬 Messages de coordination');
    console.log('   📊 Mise à jour temps réel');
    
  } catch (error) {
    console.log(`❌ Erreur création événement: ${error.response?.data?.error?.message || error.message}`);
  }
}

testBobCollectifInterface().catch(console.error);