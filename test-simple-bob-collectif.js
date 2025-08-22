// Test simple BOB Collectif sans metadata (en attendant restart Strapi)
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

async function testSimpleBobCollectif() {
  console.log('🎯 === TEST SIMPLE BOB COLLECTIF ===\n');
  
  const auth = await authenticateUser('marie@bob.com');
  if (!auth) return;
  
  console.log(`✅ Authentifié : ${auth.user.username}`);
  
  // Créer événement simple (sans metadata pour l'instant)
  try {
    console.log('\n🎯 Création événement simple...');
    
    const response = await axios.post(`${STRAPI_URL}/evenements`, {
      data: {
        titre: '✈️ Week-end Cracovie - BOB Collectif Simple',
        description: 'Salut ! Je pars à Cracovie et j\'ai besoin d\'aide ! Qui peut m\'aider avec mes besoins ?',
        dateDebut: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
        dateFin: new Date(Date.now() + 17*24*60*60*1000).toISOString(),
        adresse: 'Cracovie, Pologne (départ Paris)',
        maxParticipants: 8,
        bobizRecompense: 45,
        statut: 'planifie',
        createur: auth.user.id,
        dateCreation: new Date().toISOString()
      }
    }, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const event = response.data.data;
    console.log(`✅ BOB Collectif créé: ID ${event.id}`);
    console.log(`📱 ${event.titre}`);
    console.log(`📍 ${event.adresse}`);
    console.log(`💎 ${event.bobizRecompense} BOBIZ`);
    
    // Message expliquant les besoins dans la conversation
    const besoinsMessage = `📋 BESOINS POUR CRACOVIE:\n\n1. 📸 Appareil photo numérique\n   Pour immortaliser le voyage !\n\n2. 🚗 Transport aéroport (6h matin)\n   Qui peut m'emmener à CDG ?\n\n3. 💼 Valise grande taille\n   La mienne est cassée !\n\n4. 💪 Aide transport valise (4 personnes)\n   4ème étage sans ascenseur...\n\n5. 🔋 Chargeur portable puissant\n   Le mien ne tient plus !\n\n🎯 Qui peut m'aider ? Répondez en indiquant ce que vous pouvez faire !`;
    
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: besoinsMessage,
        typeConversation: 'evenement',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        evenement: event.id
      }
    }, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`💬 Liste des besoins ajoutée à la conversation`);
    
    // Simuler réponses des participants
    const participants = ['thomas@bob.com', 'sophie@bob.com', 'lucas@bob.com'];
    
    for (const participantEmail of participants) {
      const participantAuth = await authenticateUser(participantEmail);
      if (!participantAuth) continue;
      
      console.log(`\n👥 ${participantAuth.user.username} répond...`);
      
      let reponse = '';
      if (participantEmail === 'thomas@bob.com') {
        reponse = `📸 Je peux te prêter mon appareil photo Canon ! Excellent pour les voyages ! Je te le donne vendredi soir.`;
        
        // Créer BOB individuel
        const bobResponse = await axios.post(`${STRAPI_URL}/echanges`, {
          data: {
            titre: `📸 Prêt appareil photo Canon - Cracovie`,
            description: `Prêt d'appareil photo Canon de ${participantAuth.user.username} à ${auth.user.username} pour le week-end à Cracovie.\n\nIssu de l'événement "${event.titre}"`,
            type: 'pret',
            bobizGagnes: 15,
            statut: 'actif',
            createur: participantAuth.user.id,
            demandeur: auth.user.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🤝 BOB créé: ${bobResponse.data.data.titre} (ID: ${bobResponse.data.data.id})`);
        
      } else if (participantEmail === 'sophie@bob.com') {
        reponse = `🚗 Transport aéroport, aucun problème ! Je me lève tôt de toute façon. RDV chez toi à 5h45 !`;
        
        const bobResponse = await axios.post(`${STRAPI_URL}/echanges`, {
          data: {
            titre: `🚗 Transport aéroport CDG - Cracovie`,
            description: `Service transport de ${participantAuth.user.username} à ${auth.user.username} vers CDG.\n\nDépart: 6h du matin\nIssu de l'événement "${event.titre}"`,
            type: 'service_offert',
            bobizGagnes: 25,
            statut: 'actif',
            createur: participantAuth.user.id,
            demandeur: auth.user.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🤝 BOB créé: ${bobResponse.data.data.titre} (ID: ${bobResponse.data.data.id})`);
        
      } else if (participantEmail === 'lucas@bob.com') {
        reponse = `💪 Je peux aider pour la valise ! Compte sur moi jeudi soir ! J'amène un pote aussi si besoin.`;
        
        const bobResponse = await axios.post(`${STRAPI_URL}/echanges`, {
          data: {
            titre: `💪 Aide transport valise - Cracovie`,
            description: `Service aide transport valise de ${participantAuth.user.username} à ${auth.user.username}.\n\nJeudi soir pour descendre la valise\nIssu de l'événement "${event.titre}"`,
            type: 'service_offert',
            bobizGagnes: 10,
            statut: 'actif',
            createur: participantAuth.user.id,
            demandeur: auth.user.id
          }
        }, {
          headers: {
            'Authorization': `Bearer ${participantAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`🤝 BOB créé: ${bobResponse.data.data.titre} (ID: ${bobResponse.data.data.id})`);
      }
      
      // Message de réponse
      await axios.post(`${STRAPI_URL}/messages`, {
        data: {
          contenu: reponse,
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
      
      console.log(`💬 Réponse ajoutée à la conversation`);
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Message de remerciement de Marie
    await axios.post(`${STRAPI_URL}/messages`, {
      data: {
        contenu: `🙏 MERCI À TOUS !\n\n✅ Appareil photo: Thomas\n✅ Transport aéroport: Sophie  \n✅ Aide valise: Lucas\n\nVous êtes géniaux ! 3 BOB individuels créés automatiquement ! Cracovie me voilà ! 🇵🇱✈️`,
        typeConversation: 'evenement',
        dateEnvoi: new Date().toISOString(),
        expediteur: auth.user.id,
        evenement: event.id
      }
    }, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n🎉 Récapitulatif Marie ajouté`);
    
    // Récupérer tous les BOB créés pour cet événement
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`
      }
    });
    
    const bobsCracovie = bobsResponse.data.data.filter(bob => 
      bob.description && bob.description.includes('Cracovie')
    );
    
    console.log(`\n📊 === RÉSULTATS BOB COLLECTIF ===`);
    console.log(`🎯 Événement: ${event.titre}`);
    console.log(`👥 3 participants ont répondu`);
    console.log(`🤝 ${bobsCracovie.length} BOB individuels créés:`);
    
    bobsCracovie.forEach(bob => {
      console.log(`   📦 ${bob.titre}`);
      console.log(`      💎 ${bob.bobizGagnes} BOBIZ`);
      console.log(`      📊 ${bob.statut}`);
    });
    
    const totalBobiz = bobsCracovie.reduce((sum, bob) => sum + bob.bobizGagnes, 0);
    console.log(`\n💰 Total BOBIZ générés: ${totalBobiz}`);
    console.log(`💎 BOBIZ événement: ${event.bobizRecompense}`);
    console.log(`🎯 Total écosystème: ${totalBobiz + event.bobizRecompense} BOBIZ`);
    
    console.log(`\n✅ === CONCEPT BOB COLLECTIF FONCTIONNEL ! ===`);
    console.log(`🎯 Événement → Besoins → Réponses → BOB individuels`);
    console.log(`📱 Interface mobile prête pour l'intégration complète !`);
    
  } catch (error) {
    console.log(`❌ Erreur: ${error.response?.data?.error?.message || error.message}`);
  }
}

testSimpleBobCollectif().catch(console.error);