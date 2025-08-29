/**
 * 🎯 GÉNÉRATEUR DE DONNÉES RÉALISTES POUR BOB
 * 
 * Génère des données de test réalistes pour populer la base :
 * - Utilisateurs avec profils complets
 * - Contacts diversifiés
 * - Échanges variés (prêts, emprunts, services)
 * - Événements avec besoins
 * - Relations et interactions
 */

const axios = require('axios');
const faker = require('faker');
faker.locale = 'fr';

const CONFIG = {
  API_BASE_URL: 'http://localhost:1337/api',
  ADMIN_USER: {
    email: 'admin@bob.com',
    password: 'AdminBob123!',
    username: 'admin_bob'
  }
};

class RealisticDataGenerator {
  constructor() {
    this.adminToken = null;
    this.createdUsers = [];
    this.createdContacts = [];
    this.createdExchanges = [];
    this.createdEvents = [];
  }

  log(emoji, message, data = null) {
    console.log(`${emoji} ${message}`);
    if (data) console.log('  ', JSON.stringify(data, null, 2));
  }

  async setupAdmin() {
    try {
      // Connexion admin ou création
      try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/local`, {
          identifier: CONFIG.ADMIN_USER.email,
          password: CONFIG.ADMIN_USER.password
        });
        this.adminToken = response.data.jwt;
        this.log('🔐', 'Connexion admin réussie');
      } catch (error) {
        // Créer admin si pas trouvé
        const registerResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local/register`, {
          ...CONFIG.ADMIN_USER,
          nom: 'Admin',
          prenom: 'Bob',
          telephone: '+33600000000'
        });
        this.adminToken = registerResponse.data.jwt;
        this.log('🔐', 'Admin créé et connecté');
      }
    } catch (error) {
      console.error('❌ Erreur setup admin:', error.message);
      throw error;
    }
  }

  // 👥 Génération utilisateurs réalistes
  async generateRealisticUsers(count = 10) {
    this.log('👥', `Génération de ${count} utilisateurs réalistes...`);
    
    const userProfiles = [
      { type: 'famille', niveau: 'Ami fidèle', bobizRange: [50, 200] },
      { type: 'voisin', niveau: 'Débutant', bobizRange: [0, 50] },
      { type: 'ami', niveau: 'Super Bob', bobizRange: [200, 500] },
      { type: 'bricoleur', niveau: 'Légende', bobizRange: [500, 1000] }
    ];

    const users = [];
    
    for (let i = 0; i < count; i++) {
      const profile = userProfiles[i % userProfiles.length];
      const prenom = faker.name.firstName();
      const nom = faker.name.lastName();
      
      const userData = {
        email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@bob-test.com`,
        password: 'TestPassword123!',
        username: `${prenom.toLowerCase()}_${nom.toLowerCase()}`,
        nom: nom,
        prenom: prenom,
        telephone: `+336${faker.datatype.number({ min: 10000000, max: 99999999 })}`,
        bobizPoints: faker.datatype.number(profile.bobizRange[0], profile.bobizRange[1]),
        niveau: profile.niveau,
        estEnLigne: faker.datatype.boolean()
      };

      try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/auth/local/register`, userData);
        users.push(response.data.user);
        this.log('✅', `Utilisateur créé: ${userData.prenom} ${userData.nom}`);
      } catch (error) {
        this.log('⚠️', `Échec utilisateur ${userData.prenom}: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    this.createdUsers = users;
    return users;
  }

  // 📞 Génération contacts réalistes  
  async generateRealisticContacts(userId, token, count = 20) {
    this.log('📞', `Génération de ${count} contacts pour utilisateur ${userId}...`);

    const contactTypes = [
      { type: 'famille', relations: ['maman', 'papa', 'frère', 'sœur', 'oncle', 'tante', 'cousin', 'cousine'] },
      { type: 'amis', relations: ['ami proche', 'copain', 'copine', 'ancien collègue', 'ami d\'enfance'] },
      { type: 'voisins', relations: ['voisin', 'voisine', 'syndic', 'gardien'] },
      { type: 'professionnels', relations: ['médecin', 'plombier', 'électricien', 'garagiste', 'coiffeur'] }
    ];

    const contacts = [];

    for (let i = 0; i < count; i++) {
      const typeGroup = contactTypes[i % contactTypes.length];
      const relation = faker.random.arrayElement(typeGroup.relations);
      
      const contactData = {
        nom: faker.name.lastName(),
        prenom: faker.name.firstName(),
        telephone: `+336${faker.datatype.number({ min: 10000000, max: 99999999 })}`,
        email: faker.datatype.boolean() ? faker.internet.email() : null,
        source: 'generation_realiste',
        metadata: {
          relation: relation,
          type: typeGroup.type,
          dateAjout: faker.date.recent(30).toISOString()
        }
      };

      contacts.push(contactData);
    }

    // Import bulk
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/contacts/bulk-create-single`, {
        data: contacts
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      this.log('✅', `${response.data.meta.count} contacts créés en ${response.data.meta.duration}`);
      return contacts;
    } catch (error) {
      this.log('❌', 'Échec génération contacts', error.response?.data);
      return [];
    }
  }

  // 🔄 Génération échanges réalistes
  async generateRealisticExchanges(userId, token, count = 15) {
    this.log('🔄', `Génération de ${count} échanges réalistes...`);

    const realExchanges = [
      // PRÊTS
      {
        type: 'pret',
        titre: 'Perceuse Bosch GSB 13 RE',
        description: 'Perceuse à percussion, parfaite pour percer béton et brique. Coffret avec forets inclus. Utilisée pour mes travaux personnels.',
        dureeJours: 2,
        conditions: 'Manipulation avec précaution, retour propre',
        bobizGagnes: 12
      },
      {
        type: 'pret', 
        titre: 'Tondeuse thermique Honda',
        description: 'Tondeuse robuste, coupe 46cm, bac de ramassage. Parfait pour jardins moyens. Essence à prévoir par l\'emprunteur.',
        dureeJours: 1,
        conditions: 'Vidanger après utilisation si usage intensif',
        bobizGagnes: 15
      },
      {
        type: 'pret',
        titre: 'Plancha gaz Weber',
        description: 'Plancha 3 feux, idéale pour barbecues entre amis. Avec spatules et racloir. Se transporte facilement.',
        dureeJours: 1,
        conditions: 'Nettoyage après usage, gaz non inclus',
        bobizGagnes: 18
      },

      // EMPRUNTS
      {
        type: 'emprunt',
        titre: 'Recherche échelle 3m',
        description: 'J\'ai besoin d\'emprunter une échelle pour nettoyer mes gouttières ce weekend. Je peux me déplacer pour récupérer.',
        dureeJours: 1,
        conditions: 'Usage prudent, restitution impeccable',
        bobizGagnes: 8
      },
      {
        type: 'emprunt',
        titre: 'Scie circulaire pour projet DIY',
        description: 'Je refais ma terrasse et j\'aurais besoin d\'une scie circulaire pour découper des planches. Projet de 2-3 jours.',
        dureeJours: 3,
        conditions: 'Expérience bricolage, assurance personnelle',
        bobizGagnes: 20
      },

      // SERVICES OFFERTS
      {
        type: 'service_offert',
        titre: 'Cours de guitare débutant',
        description: 'Je donne des cours de guitare depuis 5 ans. Méthode adaptée aux débutants, tous âges. Guitare fournie si besoin.',
        bobizGagnes: 25,
        conditions: 'Séances 1h, à mon domicile ou chez vous'
      },
      {
        type: 'service_offert',
        titre: 'Garde d\'enfants occasionnelle',
        description: 'Garde vos enfants (2-12 ans) pour sorties, rendez-vous médicaux. Expérience avec mes neveux, références disponibles.',
        bobizGagnes: 30,
        conditions: 'Disponible soirs et weekends, tarif modulable'
      },
      {
        type: 'service_offert',
        titre: 'Aide informatique seniors',
        description: 'J\'aide les seniors avec leurs smartphones, tablettes, ordinateurs. Installation apps, cours utilisation, dépannage.',
        bobizGagnes: 20,
        conditions: 'Patience garantie, explications simples'
      },

      // SERVICES DEMANDÉS  
      {
        type: 'service_demande',
        titre: 'Aide déménagement samedi 14h',
        description: 'Déménagement F2 vers F3, étage sans ascenseur. Camion réservé, besoin de 2-3 personnes costauds !',
        bobizGagnes: 35,
        conditions: 'Début 14h, fini vers 18h, pizza offerte'
      },
      {
        type: 'service_demande',
        titre: 'Cours de cuisine italienne',
        description: 'Je voudrais apprendre à faire de vraies pâtes fraîches et sauces italiennes. Contre service ou échange.',
        bobizGagnes: 28,
        conditions: 'Ingrédients à mes frais, flexible sur horaires'
      },
      {
        type: 'service_demande',
        titre: 'Réparation vélo vintage',
        description: 'Mon vélo des années 80 a besoin d\'un réglage des freins et changement de chaîne. Pièces fournies.',
        bobizGagnes: 22,
        conditions: 'Pièces achetées, juste besoin du savoir-faire'
      }
    ];

    const createdExchanges = [];
    const statuts = ['actif', 'actif', 'actif', 'en_cours', 'termine']; // Majorité actifs

    for (let i = 0; i < Math.min(count, realExchanges.length); i++) {
      const exchangeData = {
        ...realExchanges[i],
        statut: faker.random.arrayElement(statuts),
        dateCreation: faker.date.recent(30).toISOString(),
        metadata: {
          localisation: faker.address.city(),
          urgence: faker.random.arrayElement(['basse', 'normale', 'haute']),
          vues: faker.datatype.number({ min: 0, max: 50 }),
          demandes: faker.datatype.number({ min: 0, max: 5 })
        }
      };

      try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/echanges`, {
          data: exchangeData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        createdExchanges.push(response.data.data);
        this.log('✅', `${exchangeData.type.toUpperCase()}: ${exchangeData.titre}`);
      } catch (error) {
        this.log('⚠️', `Échec échange: ${error.response?.data?.error?.message || error.message}`);
      }

      // Pause pour éviter surcharge
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.createdExchanges = createdExchanges;
    return createdExchanges;
  }

  // 📅 Génération événements réalistes
  async generateRealisticEvents(userId, token, count = 5) {
    this.log('📅', `Génération de ${count} événements réalistes...`);

    const realEvents = [
      {
        titre: 'Atelier réparation vélos',
        description: 'Apprenons ensemble à réparer nos vélos ! Venez avec votre vélo en panne, on partage outils et savoir-faire.',
        dateDebut: faker.date.soon(7),
        maxParticipants: 8,
        bobizRecompense: 25,
        adresse: '15 rue des Artisans, Paris 11ème',
        besoins: [
          { id: 'outils_1', type: 'objet', titre: 'Boîte à outils complète', description: 'Clés, tournevis, dérive-chaîne', quantite: 2 },
          { id: 'service_1', type: 'service_individuel', titre: 'Mécanicien expérimenté', description: 'Personne qui s\'y connaît en mécanique vélo', quantite: 1 }
        ]
      },
      {
        titre: 'Jardinage collectif samedi',
        description: 'Remettons en état le jardin partagé ! Plantation, désherbage, aménagement. Matériel et plants fournis.',
        dateDebut: faker.date.soon(14),
        maxParticipants: 12,
        bobizRecompense: 30,
        adresse: 'Jardin partagé, square des Lilas',
        besoins: [
          { id: 'outils_2', type: 'objet', titre: 'Outils jardinage', description: 'Bêches, râteaux, sécateurs', quantite: 5 },
          { id: 'service_2', type: 'service_collectif', titre: 'Équipe binage', description: 'Groupe pour préparer la terre', quantite: 4 }
        ]
      },
      {
        titre: 'Cuisine du monde dimanche',
        description: 'Chacun apporte une spécialité de son pays/région. Dégustation conviviale et échange de recettes !',
        dateDebut: faker.date.soon(10),
        maxParticipants: 15,
        bobizRecompense: 20,
        adresse: 'Salle des fêtes, 8 avenue de la République',
        besoins: [
          { id: 'materiel_1', type: 'objet', titre: 'Matériel service', description: 'Assiettes, couverts, nappes', quantite: 3 },
          { id: 'service_3', type: 'service_individuel', titre: 'Photographe amateur', description: 'Quelqu\'un pour immortaliser la soirée', quantite: 1 }
        ]
      }
    ];

    const createdEvents = [];

    for (let i = 0; i < Math.min(count, realEvents.length); i++) {
      const eventBase = realEvents[i];
      const eventData = {
        ...eventBase,
        dateDebut: new Date(eventBase.dateDebut).toISOString(),
        dateFin: new Date(new Date(eventBase.dateDebut).getTime() + 4 * 60 * 60 * 1000).toISOString(), // +4h
        statut: 'planifie',
        dateCreation: new Date().toISOString(),
        metadata: {
          besoins: eventBase.besoins,
          ciblage: { type: 'all' },
          type: 'bob_collectif'
        }
      };

      try {
        const response = await axios.post(`${CONFIG.API_BASE_URL}/evenements`, {
          data: eventData
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        createdEvents.push(response.data.data);
        this.log('✅', `Événement: ${eventData.titre}`);
      } catch (error) {
        this.log('⚠️', `Échec événement: ${error.response?.data?.error?.message || error.message}`);
      }
    }

    this.createdEvents = createdEvents;
    return createdEvents;
  }

  // 🚀 Génération complète
  async generateCompleteDataset() {
    console.log('\n🎯 ================================');
    console.log('🎨 GÉNÉRATION DONNÉES RÉALISTES BOB');
    console.log('🎯 ================================\n');

    try {
      await this.setupAdmin();
      
      // Génération utilisateurs
      const users = await this.generateRealisticUsers(8);
      
      // Pour chaque utilisateur, générer ses données
      for (let i = 0; i < Math.min(3, users.length); i++) { // Limiter à 3 pour le test
        const user = users[i];
        
        // Login en tant qu'utilisateur
        const loginResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local`, {
          identifier: user.email,
          password: 'TestPassword123!'
        });
        const userToken = loginResponse.data.jwt;
        
        this.log('👤', `Génération données pour ${user.prenom} ${user.nom}`);
        
        // Générer contacts
        await this.generateRealisticContacts(user.id, userToken, 15);
        
        // Générer échanges
        await this.generateRealisticExchanges(user.id, userToken, 8);
        
        // Générer événements (moins fréquents)
        if (i < 2) {
          await this.generateRealisticEvents(user.id, userToken, 2);
        }
      }

      console.log('\n🎉 ================================');
      console.log('✅ GÉNÉRATION TERMINÉE !');
      console.log(`👥 Utilisateurs: ${users.length}`);
      console.log(`🔄 Échanges: ${this.createdExchanges.length}`);
      console.log(`📅 Événements: ${this.createdEvents.length}`);
      console.log('🎉 ================================\n');

    } catch (error) {
      console.error('\n❌ Erreur génération:', error.message);
      if (error.response?.data) {
        console.error('Détails:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Installation faker si pas présent
try {
  require('faker');
} catch (error) {
  console.log('📦 Installation de faker...');
  const { execSync } = require('child_process');
  execSync('npm install faker@5.5.3', { stdio: 'inherit' });
  console.log('✅ Faker installé');
}

if (require.main === module) {
  const generator = new RealisticDataGenerator();
  generator.generateCompleteDataset().catch(console.error);
}

module.exports = RealisticDataGenerator;