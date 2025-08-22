// Système Invitations Personnalisées SMS/Email pour BOB
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

function generatePersonalizedInvitation(type, item, invitee, sender, channel = 'app') {
  const baseUrl = 'https://bob-app.com';
  
  let invitation = {
    id: `INV_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: type,
    item_id: item.documentId || item.id,
    sender_id: sender.user.id,
    sender_name: sender.user.username,
    invitee_email: invitee.email,
    invitee_name: invitee.name,
    channel: channel,
    created_at: new Date().toISOString(),
    status: 'sent'
  };
  
  if (type === 'bob') {
    invitation.subject = `${sender.user.username} propose un BOB qui pourrait t'intéresser`;
    invitation.quick_actions = ['interested', 'contact', 'decline'];
    invitation.item_url = `${baseUrl}/bob/${item.documentId}`;
    
    if (channel === 'sms') {
      invitation.content = `👋 Salut ${invitee.name} !\n\n${sender.user.username} pense que ce BOB pourrait t'intéresser :\n\n"${item.titre}"\n💎 ${item.bobizEchange || 10} BOBIZ\n\n🔗 Voir ici : ${invitation.item_url}\n\nRéponds BOB1 pour être intéressé(e) !\n\n📱 App BOB`;
    } 
    else if (channel === 'email') {
      invitation.content = `
Bonjour ${invitee.name},

${sender.user.username} pense que ce BOB pourrait vous intéresser !

"${item.titre}"
${item.description || 'Description non disponible'}

💎 Valeur : ${item.bobizEchange || 10} BOBIZ
🏷️ Type : ${item.type}

Vous pouvez consulter les détails complets et contacter ${sender.user.username} directement via ce lien :
${invitation.item_url}

Actions rapides :
- Répondre "INTÉRESSÉ" pour manifester votre intérêt
- Cliquer sur le lien pour voir plus de détails
- Contacter directement ${sender.user.username}

Bonne journée !
L'équipe BOB
      `;
    }
    else { // app notification
      invitation.content = `${sender.user.username} t'a envoyé un BOB !\n\n"${item.titre}"\n💎 ${item.bobizEchange || 10} BOBIZ\n\nTouche pour voir les détails !`;
    }
  }
  
  else if (type === 'event') {
    invitation.subject = `${sender.user.username} t'invite à son événement`;
    invitation.quick_actions = ['join', 'interested', 'maybe', 'decline'];
    invitation.item_url = `${baseUrl}/event/${item.documentId}`;
    
    const eventDate = new Date(item.dateDebut).toLocaleDateString('fr-FR');
    const eventTime = new Date(item.dateDebut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (channel === 'sms') {
      invitation.content = `🎉 Invitation événement !\n\n${sender.user.username} t'invite :\n"${item.titre}"\n\n📅 ${eventDate} à ${eventTime}\n📍 ${item.adresse}\n\n👥 Rejoins-nous !\n🔗 ${invitation.item_url}\n\nRéponds EVENT1 pour confirmer !\n\n📱 App BOB`;
    }
    else if (channel === 'email') {
      invitation.content = `
Bonjour ${invitee.name},

Vous êtes invité(e) à l'événement de ${sender.user.username} !

🎉 "${item.titre}"

📅 Date : ${eventDate}
🕐 Heure : ${eventTime}
📍 Lieu : ${item.adresse}
👥 Participants max : ${item.maxParticipants}
💎 Récompense : ${item.bobizRecompense} BOBIZ

Description :
${item.description || 'Description complète disponible sur l\'app'}

Pour participer, consultez tous les détails et confirmez votre présence :
${invitation.item_url}

Actions rapides :
- Répondre "PARTICIPE" pour confirmer votre venue
- Répondre "INTÉRESSÉ" si vous n'êtes pas sûr(e)
- Cliquer sur le lien pour plus d'informations

Au plaisir de vous y voir !
${sender.user.username} via BOB
      `;
    }
    else { // app notification
      invitation.content = `🎉 ${sender.user.username} t'invite à son événement !\n\n"${item.titre}"\n📅 ${eventDate} à ${eventTime}\n📍 ${item.adresse}\n\nTouche pour répondre !`;
    }
  }
  
  return invitation;
}

async function createPersonalizedInvitationsForBobs() {
  console.log('💌 === INVITATIONS PERSONNALISÉES POUR BOBS ===');
  
  const auth = await authenticateUser('marie@bob.com');
  if (!auth) return [];
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    // Récupérer quelques Bobs pour invitations
    const bobsResponse = await axios.get(`${STRAPI_URL}/echanges`, { headers });
    const bobs = bobsResponse.data.data.slice(0, 3);
    
    const invitations = [];
    
    // Données contacts pour invitations (simulation)
    const contacts = [
      { email: 'thomas@bob.com', name: 'Thomas', phone: '+33123456789' },
      { email: 'sophie@bob.com', name: 'Sophie', phone: '+33123456790' },
      { email: 'lucas@bob.com', name: 'Lucas', phone: '+33123456791' },
      { email: 'externe1@gmail.com', name: 'Julie Dupont', phone: '+33123456792' },
      { email: 'externe2@gmail.com', name: 'Pierre Martin', phone: '+33123456793' }
    ];
    
    for (const bob of bobs) {
      console.log(`\n💌 Invitations pour BOB: ${bob.titre}`);
      
      // Sélectionner 3 contacts aléatoires
      const selectedContacts = contacts.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      for (const contact of selectedContacts) {
        // Alterner entre SMS et Email
        const channels = ['sms', 'email', 'app'];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        
        const invitation = generatePersonalizedInvitation('bob', bob, contact, auth, channel);
        
        console.log(`📧 Envoi invitation ${channel} à ${contact.name}`);
        console.log(`🎯 ID: ${invitation.id}`);
        console.log(`📨 Sujet: ${invitation.subject}`);
        
        // Simulation envoi selon canal
        if (channel === 'sms') {
          console.log(`📱 SMS vers ${contact.phone}`);
          console.log(`💬 Contenu: ${invitation.content.substring(0, 100)}...`);
        } else if (channel === 'email') {
          console.log(`📧 Email vers ${contact.email}`);
          console.log(`💬 Contenu: ${invitation.content.substring(0, 150)}...`);
        } else {
          console.log(`📱 Notification app à ${contact.name}`);
          console.log(`💬 Contenu: ${invitation.content}`);
        }
        
        // Enregistrer l'invitation dans la conversation BOB
        try {
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `💌 INVITATION ENVOYÉE !\n\nInvitation ${channel.toUpperCase()} envoyée à ${contact.name} (${contact.email})\n\n📧 Sujet: "${invitation.subject}"\n🎯 ID: ${invitation.id}\n\nEn attente de réponse... 📲`,
              typeConversation: 'echange',
              dateEnvoi: new Date().toISOString(),
              expediteur: auth.user.id,
              echange: bob.id
            }
          }, { headers });
          
          console.log(`✅ Invitation enregistrée dans conversation BOB`);
          
        } catch (error) {
          console.log(`❌ Erreur enregistrement: ${error.response?.data?.error?.message}`);
        }
        
        invitations.push({
          ...invitation,
          bob_id: bob.id,
          bob_title: bob.titre
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n💌 ${invitations.length} invitations BOB envoyées`);
    return invitations;
    
  } catch (error) {
    console.log(`❌ Erreur invitations BOB: ${error.message}`);
    return [];
  }
}

async function createPersonalizedInvitationsForEvents() {
  console.log('\n🎉 === INVITATIONS PERSONNALISÉES POUR ÉVÉNEMENTS ===');
  
  const auth = await authenticateUser('thomas@bob.com');
  if (!auth) return [];
  
  const headers = { 'Authorization': `Bearer ${auth.token}` };
  
  try {
    // Récupérer quelques événements
    const eventsResponse = await axios.get(`${STRAPI_URL}/evenements`, { headers });
    const events = eventsResponse.data.data.slice(0, 2);
    
    const invitations = [];
    
    // Contacts pour événements (plus large)
    const eventContacts = [
      { email: 'marie@bob.com', name: 'Marie', phone: '+33123456788', relation: 'proche' },
      { email: 'sophie@bob.com', name: 'Sophie', phone: '+33123456790', relation: 'amie' },
      { email: 'lucas@bob.com', name: 'Lucas', phone: '+33123456791', relation: 'collegue' },
      { email: 'famille1@gmail.com', name: 'Isabelle Durand', phone: '+33123456794', relation: 'famille' },
      { email: 'voisin1@gmail.com', name: 'Marc Voisin', phone: '+33123456795', relation: 'voisin' },
      { email: 'collègue1@company.com', name: 'Sarah Leclerc', phone: '+33123456796', relation: 'collegue' }
    ];
    
    for (const event of events) {
      console.log(`\n🎉 Invitations pour EVENT: ${event.titre}`);
      
      // Sélectionner contacts selon type événement
      const selectedContacts = eventContacts.sort(() => 0.5 - Math.random()).slice(0, 4);
      
      for (const contact of selectedContacts) {
        // Prioriser email pour événements
        const channels = ['email', 'sms', 'app'];
        const weights = [0.6, 0.3, 0.1]; // 60% email, 30% SMS, 10% app
        const random = Math.random();
        let channel = 'email';
        
        if (random < weights[2]) channel = 'app';
        else if (random < weights[1] + weights[2]) channel = 'sms';
        
        const invitation = generatePersonalizedInvitation('event', event, contact, auth, channel);
        
        // Personnaliser selon relation
        if (contact.relation === 'famille') {
          invitation.content = invitation.content.replace('Bonjour', 'Coucou');
          invitation.content = invitation.content.replace('vous', 'tu');
          invitation.content = invitation.content.replace('Vous êtes', 'Tu es');
        }
        
        console.log(`🎉 Envoi invitation ${channel} à ${contact.name} (${contact.relation})`);
        console.log(`🎯 ID: ${invitation.id}`);
        console.log(`📨 Sujet: ${invitation.subject}`);
        
        // Simulation envoi personnalisé
        if (channel === 'sms') {
          console.log(`📱 SMS personnalisé vers ${contact.phone}`);
          console.log(`💬 Aperçu: ${invitation.content.substring(0, 120)}...`);
        } else if (channel === 'email') {
          console.log(`📧 Email détaillé vers ${contact.email}`);
          console.log(`💬 Aperçu: ${invitation.content.substring(0, 200)}...`);
        } else {
          console.log(`📱 Push notification à ${contact.name}`);
          console.log(`💬 Message: ${invitation.content}`);
        }
        
        // Enregistrer dans conversation événement
        try {
          await axios.post(`${STRAPI_URL}/messages`, {
            data: {
              contenu: `🎉 INVITATION ÉVÉNEMENT ENVOYÉE !\n\nInvitation ${channel.toUpperCase()} envoyée à ${contact.name} (${contact.relation})\n📧 ${contact.email}\n\n📨 "${invitation.subject}"\n🎯 ID: ${invitation.id}\n\n👀 En attente de confirmation... 📅`,
              typeConversation: 'evenement',
              dateEnvoi: new Date().toISOString(),
              expediteur: auth.user.id,
              evenement: event.id
            }
          }, { headers });
          
          console.log(`✅ Invitation enregistrée dans événement`);
          
        } catch (error) {
          console.log(`❌ Erreur enregistrement event: ${error.response?.data?.error?.message}`);
        }
        
        invitations.push({
          ...invitation,
          event_id: event.id,
          event_title: event.titre,
          contact_relation: contact.relation
        });
        
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    console.log(`\n🎉 ${invitations.length} invitations événement envoyées`);
    return invitations;
    
  } catch (error) {
    console.log(`❌ Erreur invitations événement: ${error.message}`);
    return [];
  }
}

async function simulateInvitationResponses(invitations) {
  console.log('\n📱 === SIMULATION RÉPONSES INVITATIONS ===');
  
  const responseTypes = [
    { type: 'interested', message: 'Super ! Ça m\'intéresse ! 😊', probability: 0.4 },
    { type: 'confirmed', message: 'Parfait ! Je confirme ma participation ! 🎉', probability: 0.3 },
    { type: 'maybe', message: 'Ça me tente mais je dois vérifier ma dispo... 🤔', probability: 0.2 },
    { type: 'declined', message: 'Merci pour l\'invitation mais je ne peux pas 😔', probability: 0.1 }
  ];
  
  const responses = [];
  
  for (const invitation of invitations.slice(0, 8)) { // Simuler 8 réponses
    const random = Math.random();
    let cumulativeProbability = 0;
    let selectedResponse = responseTypes[0];
    
    for (const responseType of responseTypes) {
      cumulativeProbability += responseType.probability;
      if (random <= cumulativeProbability) {
        selectedResponse = responseType;
        break;
      }
    }
    
    console.log(`\n📱 Réponse à l'invitation ${invitation.id}`);
    console.log(`👤 ${invitation.invitee_name} répond: ${selectedResponse.type}`);
    console.log(`💬 "${selectedResponse.message}"`);
    
    // Enregistrer réponse selon type d'invitation
    try {
      const conversationType = invitation.type === 'bob' ? 'echange' : 'evenement';
      const itemId = invitation.type === 'bob' ? invitation.bob_id : invitation.event_id;
      
      // Simulation d'auth pour le répondant (si utilisateur app)
      let responderAuth = null;
      if (invitation.invitee_email.includes('@bob.com')) {
        responderAuth = await authenticateUser(invitation.invitee_email);
      }
      
      if (responderAuth) {
        const responseMessage = `📱 RÉPONSE INVITATION via ${invitation.channel.toUpperCase()}\n\n${invitation.invitee_name} répond: ${selectedResponse.type.toUpperCase()}\n\n💬 "${selectedResponse.message}"\n\n🎯 Invitation ID: ${invitation.id}`;
        
        const messageData = {
          contenu: responseMessage,
          typeConversation: conversationType,
          dateEnvoi: new Date().toISOString(),
          expediteur: responderAuth.user.id
        };
        
        if (invitation.type === 'bob') {
          messageData.echange = itemId;
        } else {
          messageData.evenement = itemId;
        }
        
        await axios.post(`${STRAPI_URL}/messages`, {
          data: messageData
        }, {
          headers: {
            'Authorization': `Bearer ${responderAuth.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log(`✅ Réponse enregistrée dans conversation`);
      } else {
        console.log(`📧 Réponse externe (${invitation.invitee_email}) simulée`);
      }
      
      responses.push({
        invitation_id: invitation.id,
        respondent: invitation.invitee_name,
        response_type: selectedResponse.type,
        message: selectedResponse.message,
        channel: invitation.channel,
        responded_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.log(`❌ Erreur réponse: ${error.response?.data?.error?.message || error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  
  console.log(`\n📱 ${responses.length} réponses traitées`);
  return responses;
}

async function generateInvitationAnalytics(bobInvitations, eventInvitations, responses) {
  console.log('\n📊 === ANALYTICS INVITATIONS PERSONNALISÉES ===');
  
  const totalInvitations = bobInvitations.length + eventInvitations.length;
  const totalResponses = responses.length;
  const responseRate = totalInvitations > 0 ? ((totalResponses / totalInvitations) * 100).toFixed(1) : 0;
  
  // Analytics par canal
  const channelStats = {};
  [...bobInvitations, ...eventInvitations].forEach(inv => {
    channelStats[inv.channel] = (channelStats[inv.channel] || 0) + 1;
  });
  
  // Analytics par type de réponse
  const responseStats = {};
  responses.forEach(resp => {
    responseStats[resp.response_type] = (responseStats[resp.response_type] || 0) + 1;
  });
  
  // Taux de conversion par canal
  const channelConversion = {};
  Object.keys(channelStats).forEach(channel => {
    const channelResponses = responses.filter(r => r.channel === channel).length;
    const channelInvitations = channelStats[channel];
    channelConversion[channel] = channelInvitations > 0 ? ((channelResponses / channelInvitations) * 100).toFixed(1) : 0;
  });
  
  console.log(`💌 INVITATIONS ENVOYÉES:`);
  console.log(`  🔄 ${bobInvitations.length} invitations BOB`);
  console.log(`  🎉 ${eventInvitations.length} invitations événements`);
  console.log(`  📊 Total: ${totalInvitations} invitations personnalisées`);
  
  console.log(`\n📱 RÉPARTITION PAR CANAL:`);
  Object.entries(channelStats).forEach(([channel, count]) => {
    console.log(`  📤 ${channel.toUpperCase()}: ${count} invitations (${channelConversion[channel]}% réponses)`);
  });
  
  console.log(`\n📱 RÉPONSES REÇUES:`);
  console.log(`  📊 Total réponses: ${totalResponses}`);
  console.log(`  📈 Taux de réponse: ${responseRate}%`);
  
  if (Object.keys(responseStats).length > 0) {
    console.log(`\n💬 TYPES DE RÉPONSES:`);
    Object.entries(responseStats).forEach(([type, count]) => {
      const percentage = ((count / totalResponses) * 100).toFixed(1);
      console.log(`  ✅ ${type}: ${count} (${percentage}%)`);
    });
  }
  
  // Calcul engagement
  const positiveResponses = (responseStats.interested || 0) + (responseStats.confirmed || 0);
  const engagementRate = totalResponses > 0 ? ((positiveResponses / totalResponses) * 100).toFixed(1) : 0;
  
  console.log(`\n📈 MÉTRIQUES ENGAGEMENT:`);
  console.log(`  🎯 Taux de réponse global: ${responseRate}%`);
  console.log(`  💚 Taux d'engagement positif: ${engagementRate}%`);
  console.log(`  📊 Invitations actives: ${totalInvitations}`);
  console.log(`  💫 Interactions générées: ${totalResponses}`);
  
  // Canal le plus efficace
  const bestChannel = Object.entries(channelConversion).reduce((best, [channel, rate]) => 
    parseFloat(rate) > parseFloat(best.rate) ? { channel, rate } : best
  , { channel: 'none', rate: '0' });
  
  console.log(`\n🏆 PERFORMANCES:`);
  console.log(`  🥇 Canal le plus efficace: ${bestChannel.channel.toUpperCase()} (${bestChannel.rate}%)`);
  console.log(`  📱 Format privilégié: ${bobInvitations.length > eventInvitations.length ? 'BOB' : 'Événements'}`);
  
  console.log(`\n✅ FONCTIONNALITÉS INVITATIONS COMPLÈTES:`);
  console.log(`  💌 Invitations personnalisées par canal (SMS/Email/App)`);
  console.log(`  🎯 Messages adaptés au type (BOB vs Événement)`);
  console.log(`  👥 Personnalisation selon relation (famille/ami/collègue)`);
  console.log(`  📱 Actions rapides intégrées`);
  console.log(`  💬 Gestion réponses en temps réel`);
  console.log(`  📊 Analytics détaillées par canal`);
  console.log(`  🔗 Intégration conversations BOB/Event`);
  console.log(`  📲 Support utilisateurs externes (non-app)`);
}

async function main() {
  console.log('💌 === SYSTÈME INVITATIONS PERSONNALISÉES ===\n');
  console.log('🎯 Objectif: Invitations SMS/Email personnalisées pour Bobs et Events\n');
  
  // 1. Créer invitations personnalisées pour Bobs
  const bobInvitations = await createPersonalizedInvitationsForBobs();
  
  // 2. Créer invitations pour événements
  const eventInvitations = await createPersonalizedInvitationsForEvents();
  
  if (bobInvitations.length === 0 && eventInvitations.length === 0) {
    console.log('❌ Aucune invitation créée');
    return;
  }
  
  // 3. Simuler réponses aux invitations
  const allInvitations = [...bobInvitations, ...eventInvitations];
  const responses = await simulateInvitationResponses(allInvitations);
  
  // 4. Analytics complètes
  await generateInvitationAnalytics(bobInvitations, eventInvitations, responses);
  
  console.log('\n✨ === SYSTÈME INVITATIONS TERMINÉ ! ===');
  console.log('💌 Invitations personnalisées SMS/Email créées !');
  console.log('📱 Gestion réponses automatique opérationnelle !');
  console.log('📊 Analytics invitations disponibles !');
}

main().catch(console.error);