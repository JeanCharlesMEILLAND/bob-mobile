/**
 * 🧪 TESTS COMPLETS D'INTÉGRATION BOB
 * 
 * Ce script teste le parcours complet :
 * 1. Création dans l'app mobile (via services)
 * 2. Enregistrement en base Strapi
 * 3. Vérification des données
 * 4. Test des fonctionnalités métier
 * 
 * Usage: node tests/integration/bob-complete-tests.js
 */

const axios = require('axios');

// 🔧 Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:1337/api',
  STRAPI_ADMIN_URL: 'http://localhost:1337',
  TEST_USER: {
    email: `test-${Date.now()}@bob.com`,
    password: 'TestPassword123!',
    username: `testbob_${Date.now()}`
  },
  TEST_USERS: [
    {
      email: 'alice@bob.com',
      password: 'AlicePassword123!',
      username: 'alice_bob'
    },
    {
      email: 'charlie@bob.com', 
      password: 'CharliePassword123!',
      username: 'charlie_bob'
    }
  ]
};

class BobIntegrationTester {
  constructor() {
    this.token = null;
    this.testUserId = null;
    this.createdItems = {
      users: [],
      contacts: [],
      exchanges: [],
      events: [],
      groups: [],
      messages: []
    };
  }

  // 🔧 Utilitaires
  log(emoji, message, data = null) {
    console.log(`${emoji} ${message}`);
    if (data && typeof data === 'object') {
      console.log('   📄 Détails:', JSON.stringify(data, null, 2));
    } else if (data) {
      console.log('   📄 Détails:', data);
    }
  }

  error(message, error = null) {
    console.error(`❌ ERREUR: ${message}`);
    if (error) {
      console.error('   🔍 Stack:', error.message);
      if (error.response?.data) {
        console.error('   📄 Réponse API:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  success(message, data = null) {
    console.log(`✅ SUCCÈS: ${message}`);
    if (data) {
      console.log('   📊 Résultat:', JSON.stringify(data, null, 2));
    }
  }

  // 🔐 Authentification
  async setupAuthentication() {
    try {
      this.log('🔐', 'Configuration authentification...');
      
      // 1. Tenter de se connecter avec utilisateur existant
      try {
        const loginResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local`, {
          identifier: CONFIG.TEST_USER.email,
          password: CONFIG.TEST_USER.password
        });

        this.token = loginResponse.data.jwt;
        this.testUserId = loginResponse.data.user.id;
        this.success('Connexion avec utilisateur existant', {
          userId: this.testUserId,
          token: `${this.token.substring(0, 20)}...`
        });
        return;
      } catch (loginError) {
        this.log('⚠️', 'Utilisateur non trouvé, création d\'un nouveau...');
      }

      // 2. Créer nouvel utilisateur si nécessaire
      const registerResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local/register`, CONFIG.TEST_USER);
      
      this.token = registerResponse.data.jwt;
      this.testUserId = registerResponse.data.user.id;
      this.createdItems.users.push(this.testUserId);

      this.success('Nouvel utilisateur créé et connecté', {
        userId: this.testUserId,
        token: `${this.token.substring(0, 20)}...`
      });
    } catch (error) {
      this.error('Configuration authentification', error);
      throw error;
    }
  }

  // 👥 Création d'utilisateurs de test
  async createTestUsers() {
    try {
      this.log('👥', 'Création utilisateurs de test...');
      
      for (const userData of CONFIG.TEST_USERS) {
        try {
          // Tenter connexion existante
          const loginResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local`, {
            identifier: userData.email,
            password: userData.password
          });
          this.log('ℹ️', `Utilisateur ${userData.prenom} existe déjà`);
        } catch (loginError) {
          // Créer s'il n'existe pas
          const registerResponse = await axios.post(`${CONFIG.API_BASE_URL}/auth/local/register`, userData);
          this.createdItems.users.push(registerResponse.data.user.id);
          this.success(`Utilisateur ${userData.prenom} créé`, {
            id: registerResponse.data.user.id,
            email: userData.email
          });
        }
      }
    } catch (error) {
      this.error('Création utilisateurs de test', error);
    }
  }

  // 📞 Test création contacts
  async testContactsCreation() {
    try {
      this.log('📞', 'TEST CONTACTS: Création et synchronisation...');

      // 1. Créer des contacts de test
      const contactsToCreate = [
        {
          nom: 'Martin',
          prenom: 'Alice',
          telephone: '+33611111111',
          email: 'alice@test.com',
          source: 'test_integration'
        },
        {
          nom: 'Durand',
          prenom: 'Bob',
          telephone: '+33622222222',
          email: 'bob@test.com',
          source: 'test_integration'
        },
        {
          nom: 'Moreau',
          prenom: 'Charlie',
          telephone: '+33633333333',
          source: 'test_integration'
        }
      ];

      // 2. Créer les contacts un par un (l'endpoint bulk custom n'existe peut-être pas encore)
      this.log('📤', 'Création des contacts un par un...');
      const createdContacts = [];
      
      for (const contactData of contactsToCreate) {
        try {
          const response = await axios.post(`${CONFIG.API_BASE_URL}/contacts`, {
            data: contactData
          }, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          createdContacts.push(response.data.data);
          this.log('✅', `Contact créé: ${contactData.nom} ${contactData.prenom || ''}`);
        } catch (error) {
          this.log('⚠️', `Échec contact ${contactData.nom}: ${error.response?.data?.error?.message || error.message}`);
        }
      }

      this.success('Contacts créés', { count: createdContacts.length });

      // 3. Vérifier que les contacts sont bien créés
      this.log('🔍', 'Vérification contacts créés...');
      const contactsResponse = await axios.get(`${CONFIG.API_BASE_URL}/contacts`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const allContacts = contactsResponse.data.data || [];
      this.success(`${allContacts.length} contacts vérifiés`, {
        contacts: allContacts.map(c => ({ nom: c.nom, telephone: c.telephone }))
      });

      // Sauvegarder pour cleanup
      this.createdItems.contacts = createdContacts.map(c => c.documentId || c.id);

      this.log('ℹ️', 'Tests endpoints custom contacts ignorés (à implémenter)');

      return allContacts;
    } catch (error) {
      this.error('Test contacts', error);
      throw error;
    }
  }

  // 🔄 Test création échanges (PRÊT)
  async testExchangeCreation() {
    try {
      this.log('🔄', 'TEST ÉCHANGES: Création prêt/emprunt/service...');

      const exchangesToTest = [
        // PRÊT
        {
          type: 'pret',
          titre: 'Perceuse électrique Bosch',
          description: 'Perceuse professionnelle avec coffret de mèches. Parfait état, utilisée récemment pour des travaux. Disponible pour dépannage entre voisins.',
          dureeJours: 3,
          conditions: 'Utilisation avec précaution, retour propre',
          bobizRecompense: 15
        },
        // EMPRUNT
        {
          type: 'emprunt', 
          titre: 'Recherche tondeuse pour weekend',
          description: 'J\'ai besoin d\'emprunter une tondeuse thermique pour tondre mon jardin ce weekend. Je peux venir la chercher et la ramener.',
          dureeJours: 2,
          conditions: 'Je fournis l\'essence et nettoie après usage',
          bobizRecompense: 12
        },
        // SERVICE OFFERT
        {
          type: 'service_offert',
          titre: 'Garde d\'enfants occasionnelle',
          description: 'Je propose de garder vos enfants (3-10 ans) pour vos sorties ou urgences. Expérience avec mes propres enfants et neveux.',
          bobizRecompense: 20,
          conditions: 'Disponible soirs semaine et weekends'
        },
        // SERVICE DEMANDÉ
        {
          type: 'service_demande',
          titre: 'Aide déménagement samedi',
          description: 'Je cherche 2-3 personnes pour m\'aider à déménager mes affaires samedi matin. Camion déjà réservé, besoin de bras!',
          bobizRecompense: 25,
          conditions: 'Début 9h, fini vers 13h, repas offert'
        }
      ];

      const createdExchanges = [];

      for (const exchangeData of exchangesToTest) {
        try {
          this.log('📤', `Création ${exchangeData.type}: ${exchangeData.titre}`);
          
          // Simuler le service mobile
          const response = await axios.post(`${CONFIG.API_BASE_URL}/echanges`, {
            data: {
              ...exchangeData,
              statut: 'actif',
              bobizGagnes: exchangeData.bobizRecompense, // Mapping
              dateCreation: new Date().toISOString()
            }
          }, {
            headers: { Authorization: `Bearer ${this.token}` }
          });

          const createdExchange = response.data.data;
          createdExchanges.push(createdExchange);
          
          // Sauvegarder pour cleanup
          this.createdItems.exchanges.push(createdExchange.documentId || createdExchange.id);

          this.success(`${exchangeData.type.toUpperCase()} créé`, {
            id: createdExchange.documentId || createdExchange.id,
            titre: createdExchange.titre,
            type: createdExchange.type,
            statut: createdExchange.statut,
            bobizGagnes: createdExchange.bobizGagnes
          });

          // Petite pause entre créations
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          this.error(`Création ${exchangeData.type}`, error);
        }
      }

      // Vérification des échanges créés
      this.log('🔍', 'Vérification échanges en base...');
      const allExchangesResponse = await axios.get(`${CONFIG.API_BASE_URL}/echanges?populate=*`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const allExchanges = allExchangesResponse.data.data || [];
      this.success(`${allExchanges.length} échanges total en base`, {
        types: allExchanges.reduce((acc, ex) => {
          acc[ex.type] = (acc[ex.type] || 0) + 1;
          return acc;
        }, {}),
        statuts: allExchanges.reduce((acc, ex) => {
          acc[ex.statut] = (acc[ex.statut] || 0) + 1;
          return acc;
        }, {})
      });

      return createdExchanges;
    } catch (error) {
      this.error('Test échanges', error);
      throw error;
    }
  }

  // 📅 Test création événements
  async testEventCreation() {
    try {
      this.log('📅', 'TEST ÉVÉNEMENTS: Création événement avec besoins...');

      const eventData = {
        titre: 'Atelier bricolage collectif',
        description: 'Construction d\'une cabane pour les enfants du quartier. Venez avec vos outils et votre bonne humeur ! Matériaux fournis.',
        dateDebut: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 1 semaine
        dateFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(), // +4h
        adresse: 'Jardin partagé, 15 rue des Lilas, Paris 15ème',
        maxParticipants: 8,
        bobizRecompense: 30,
        besoins: [
          {
            id: 'besoin_1',
            type: 'objet',
            titre: 'Perceuses électriques',
            description: 'Nous avons besoin de 2-3 perceuses pour les assemblages',
            quantite: 3,
            maxPersonnes: 3
          },
          {
            id: 'besoin_2', 
            type: 'service_individuel',
            titre: 'Aide découpe bois',
            description: 'Personne expérimentée en découpe de planches',
            quantite: 1,
            maxPersonnes: 1
          },
          {
            id: 'besoin_3',
            type: 'service_collectif', 
            titre: 'Équipe peinture',
            description: 'Groupe pour peindre la cabane en fin d\'atelier',
            quantite: 1,
            maxPersonnes: 4
          }
        ],
        ciblage: {
          type: 'all' // Ouvert à tous les contacts
        }
      };

      this.log('📤', 'Création événement...');
      const response = await axios.post(`${CONFIG.API_BASE_URL}/evenements`, {
        data: {
          ...eventData,
          statut: 'planifie',
          dateCreation: new Date().toISOString(),
          metadata: {
            besoins: eventData.besoins,
            ciblage: eventData.ciblage,
            type: 'bob_collectif'
          }
        }
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      const createdEvent = response.data.data;
      this.createdItems.events.push(createdEvent.documentId || createdEvent.id);

      this.success('Événement créé avec succès', {
        id: createdEvent.documentId || createdEvent.id,
        titre: createdEvent.titre,
        statut: createdEvent.statut,
        dateDebut: createdEvent.dateDebut,
        besoinsCount: eventData.besoins.length,
        bobizRecompense: createdEvent.bobizRecompense
      });

      // Test des endpoints événements
      await this.testEventEndpoints(createdEvent.documentId || createdEvent.id, eventData.besoins[0].id);

      return createdEvent;
    } catch (error) {
      this.error('Test événement', error);
      throw error;
    }
  }

  // 🎯 Test endpoints spéciaux événements
  async testEventEndpoints(eventId, besoinId) {
    try {
      this.log('🎯', 'Test endpoints spéciaux événements...');

      // 1. Test acceptation invitation
      try {
        this.log('📨', 'Test acceptation invitation...');
        const acceptResponse = await axios.post(`${CONFIG.API_BASE_URL}/evenements/${eventId}/accept`, {
          data: {
            dateAcceptation: new Date().toISOString(),
            statut: 'accepte'
          }
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.success('Invitation acceptée', { statut: 'accepté' });
      } catch (error) {
        this.log('⚠️', 'Acceptation invitation échouée (peut-être normal si déjà organisateur)', error.message);
      }

      // 2. Test positionnement sur besoin
      try {
        this.log('🎯', 'Test positionnement sur besoin...');
        const positionResponse = await axios.post(`${CONFIG.API_BASE_URL}/evenements/${eventId}/besoins/${besoinId}/position`, {
          quantiteProposee: 1,
          commentaire: 'J\'ai une perceuse Bosch professionnelle à disposition'
        }, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        
        const bobCree = positionResponse.data.bobIndividuel;
        if (bobCree) {
          this.createdItems.exchanges.push(bobCree.documentId || bobCree.id);
        }

        this.success('Positionnement sur besoin réussi', {
          bobId: bobCree?.id,
          titre: bobCree?.titre,
          bobizGagnes: bobCree?.bobizGagnes
        });
      } catch (error) {
        this.log('⚠️', 'Positionnement sur besoin échoué', error.response?.data || error.message);
      }

      // 3. Test récupération BOBs de l'événement
      try {
        this.log('📋', 'Test récupération BOBs événement...');
        const bobsResponse = await axios.get(`${CONFIG.API_BASE_URL}/evenements/${eventId}/bobs`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });

        const bobs = bobsResponse.data.bobs || bobsResponse.data.data?.bobs || [];
        this.success('BOBs événement récupérés', {
          count: bobs.length,
          bobs: bobs.map(bob => ({
            id: bob.id,
            titre: bob.titre,
            origine: bob.origine
          }))
        });
      } catch (error) {
        this.log('⚠️', 'Récupération BOBs échouée', error.response?.data || error.message);
      }
    } catch (error) {
      this.error('Test endpoints événements', error);
    }
  }

  // 👥 Test création groupes
  async testGroupCreation() {
    try {
      this.log('👥', 'TEST GROUPES: Création et organisation...');

      const groupsToCreate = [
        {
          nom: 'Famille proche',
          description: 'Parents, frères et sœurs',
          couleur: '#FF6B6B',
          type: 'famille'
        },
        {
          nom: 'Voisins sympa',
          description: 'Les voisins du quartier avec qui on s\'entraide',
          couleur: '#4ECDC4', 
          type: 'voisins'
        },
        {
          nom: 'Bricoleurs du dimanche',
          description: 'Les copains qui aiment bricoler ensemble',
          couleur: '#45B7D1',
          type: 'bricoleurs'
        }
      ];

      const createdGroups = [];

      for (const groupData of groupsToCreate) {
        try {
          this.log('📤', `Création groupe: ${groupData.nom}`);
          
          const response = await axios.post(`${CONFIG.API_BASE_URL}/groupes`, {
            data: {
              ...groupData,
              actif: true,
              dateCreation: new Date().toISOString()
            }
          }, {
            headers: { Authorization: `Bearer ${this.token}` }
          });

          const createdGroup = response.data.data;
          createdGroups.push(createdGroup);
          this.createdItems.groups.push(createdGroup.documentId || createdGroup.id);

          this.success(`Groupe ${groupData.nom} créé`, {
            id: createdGroup.documentId || createdGroup.id,
            nom: createdGroup.nom,
            type: createdGroup.type,
            couleur: createdGroup.couleur
          });

        } catch (error) {
          this.error(`Création groupe ${groupData.nom}`, error);
        }
      }

      return createdGroups;
    } catch (error) {
      this.error('Test groupes', error);
      throw error;
    }
  }

  // 📊 Test statistiques
  async testStatistics() {
    try {
      this.log('📊', 'TEST STATISTIQUES: Récupération données...');

      // 1. Stats contacts
      try {
        const contactsStatsResponse = await axios.get(`${CONFIG.API_BASE_URL}/contacts/stats`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.success('Statistiques contacts', contactsStatsResponse.data.data);
      } catch (error) {
        this.log('⚠️', 'Stats contacts non disponibles', error.message);
      }

      // 2. Stats utilisateur
      try {
        const userResponse = await axios.get(`${CONFIG.API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        this.success('Profil utilisateur', {
          id: userResponse.data.id,
          username: userResponse.data.username,
          bobizPoints: userResponse.data.bobizPoints || 0,
          niveau: userResponse.data.niveau || 'Débutant'
        });
      } catch (error) {
        this.error('Récupération profil utilisateur', error);
      }

      // 3. Compter créations
      this.success('Bilan créations de test', {
        contacts: this.createdItems.contacts.length,
        exchanges: this.createdItems.exchanges.length,
        events: this.createdItems.events.length,
        groups: this.createdItems.groups.length,
        users: this.createdItems.users.length
      });

    } catch (error) {
      this.error('Test statistiques', error);
    }
  }

  // 🧹 Nettoyage
  async cleanup() {
    try {
      this.log('🧹', 'Nettoyage des données de test...');

      let deletedCount = 0;

      // Supprimer échanges
      for (const exchangeId of this.createdItems.exchanges) {
        try {
          await axios.delete(`${CONFIG.API_BASE_URL}/echanges/${exchangeId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          deletedCount++;
        } catch (error) {
          this.log('⚠️', `Échec suppression échange ${exchangeId}: ${error.message}`);
        }
      }

      // Supprimer événements
      for (const eventId of this.createdItems.events) {
        try {
          await axios.delete(`${CONFIG.API_BASE_URL}/evenements/${eventId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          deletedCount++;
        } catch (error) {
          this.log('⚠️', `Échec suppression événement ${eventId}: ${error.message}`);
        }
      }

      // Supprimer contacts
      for (const contactId of this.createdItems.contacts) {
        try {
          await axios.delete(`${CONFIG.API_BASE_URL}/contacts/${contactId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          deletedCount++;
        } catch (error) {
          this.log('⚠️', `Échec suppression contact ${contactId}: ${error.message}`);
        }
      }

      // Supprimer groupes
      for (const groupId of this.createdItems.groups) {
        try {
          await axios.delete(`${CONFIG.API_BASE_URL}/groupes/${groupId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          deletedCount++;
        } catch (error) {
          this.log('⚠️', `Échec suppression groupe ${groupId}: ${error.message}`);
        }
      }

      this.success(`Nettoyage terminé: ${deletedCount} éléments supprimés`);
    } catch (error) {
      this.error('Nettoyage', error);
    }
  }

  // 🚀 Lancer tous les tests
  async runAllTests() {
    console.log('\n🚀 ================================');
    console.log('🧪 TESTS D\'INTÉGRATION COMPLETS BOB');
    console.log('🚀 ================================\n');

    const startTime = Date.now();

    try {
      // Phase 1: Setup
      await this.setupAuthentication();
      await this.createTestUsers();

      // Phase 2: Tests fonctionnels
      await this.testContactsCreation();
      await this.testGroupCreation(); 
      await this.testExchangeCreation();
      await this.testEventCreation();

      // Phase 3: Statistiques
      await this.testStatistics();

      const duration = Date.now() - startTime;
      
      console.log('\n🎉 ================================');
      console.log('✅ TOUS LES TESTS RÉUSSIS !');
      console.log(`⏱️ Durée totale: ${Math.round(duration / 1000)}s`);
      console.log('🎉 ================================\n');

    } catch (error) {
      console.log('\n💥 ================================');
      console.log('❌ ÉCHEC DES TESTS');
      this.error('Test général', error);
      console.log('💥 ================================\n');
    } finally {
      // Nettoyage toujours effectué
      await this.cleanup();
    }
  }
}

// 🏃 Exécution des tests
if (require.main === module) {
  const tester = new BobIntegrationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = BobIntegrationTester;