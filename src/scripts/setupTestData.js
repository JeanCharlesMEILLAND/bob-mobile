// src/scripts/setupTestData.js - Script pour configurer les données de test dans Strapi
// À exécuter côté Strapi pour initialiser les données de test

const TEST_USER = {
  username: 'bober_testeur',
  email: 'test@bob-app.fr',
  password: 'TestPassword123!',
  confirmed: true,
  blocked: false,
  prenom: 'Bober',
  nom: 'Testeur',
  telephone: '+33612345678',
  bio: 'Je suis le Bober Testeur officiel ! Ami de tous les utilisateurs de Bob pour vos tests.',
  bobizBalance: 1000,
  reputation: 5.0,
  totalExchanges: 50,
  isTestUser: true
};

const MOCK_EXCHANGES = [
  {
    titre: "Perceuse sans fil Makita 18V",
    description: "Perceuse sans fil professionnelle avec 2 batteries, chargeur et coffret de mèches. Parfaite pour tous travaux de perçage et vissage. État impeccable, peu utilisée.",
    type: "pret",
    categorie: "bricolage",
    statut: "en_attente",
    dureeJours: 3,
    conditions: "• Retour propre et chargée\n• Dépôt de garantie 80€\n• Disponible dès demain\n• Récupération chez moi ou livraison possible",
    bobizRecompense: 15,
    isTestData: true,
    location: "Lyon 3e, Metro Part-Dieu"
  },
  {
    titre: "Vélo électrique Décathlon", 
    description: "Vélo électrique de ville, autonomie 50km, idéal pour vos déplacements urbains. Très confortable avec selle gel et guidon ajustable.",
    type: "pret",
    categorie: "transport", 
    statut: "actif",
    dureeJours: 7,
    conditions: "• Casque fourni\n• Assurance responsabilité civile requise\n• Recharge tous les 2 jours\n• Interdiction autoroutes",
    bobizRecompense: 25,
    isTestData: true,
    location: "Lyon 6e, Metro Foch"
  },
  {
    titre: "Échelle télescopique ou échafaudage",
    description: "Je cherche une échelle télescopique (4-5m) ou petit échafaudage pour refaire la peinture de ma façade. Travaux prévus ce weekend.",
    type: "emprunt",
    categorie: "bricolage",
    statut: "en_attente", 
    dureeJours: 2,
    conditions: "• Utilisation soigneuse garantie\n• Assurance habitation couvre\n• Récupération/livraison flexible\n• Petit dédommagement possible",
    bobizRecompense: 10,
    isTestData: true,
    location: "Lyon 7e, Quartier Jean Macé"
  },
  {
    titre: "Cours particuliers informatique",
    description: "Prof d'informatique, je propose des cours personnalisés : bureautique, programmation, dépannage PC/Mac. Tous niveaux, méthode adaptée.",
    type: "service_offert",
    categorie: "formation",
    statut: "en_attente",
    dureeJours: null,
    conditions: "• 1ère séance gratuite\n• Flexible horaires soir/weekend\n• Chez vous ou chez moi\n• Support de cours fourni",
    bobizRecompense: 20,
    isTestData: true,
    location: "Lyon centre, déplacements possibles"
  },
  {
    titre: "Aide déménagement samedi matin", 
    description: "Déménagement studio Lyon 6e vers Lyon 3e, je cherche 2 personnes motivées pour cartons + quelques meubles. Camion déjà réservé.",
    type: "service_demande",
    categorie: "transport",
    statut: "en_attente",
    dureeJours: null,
    conditions: "• Samedi 9h-13h environ\n• Pizza + boissons offertes\n• Bonne condition physique\n• Ambiance sympa garantie",
    bobizRecompense: 30,
    isTestData: true,
    location: "Lyon 6e vers Lyon 3e"
  }
];

/**
 * Instructions pour Strapi :
 * 
 * 1. Créer le Bober Testeur :
 *    - Aller dans Content-Type Builder > User
 *    - Créer un nouvel utilisateur avec les données TEST_USER
 *    - Noter l'ID généré
 * 
 * 2. Injecter les échanges de test :
 *    - Aller dans Content Manager > Echange
 *    - Pour chaque objet dans MOCK_EXCHANGES :
 *      - Créer un nouvel échange
 *      - Assigner le Bober Testeur comme créateur
 *      - Copier les données de l'objet
 * 
 * 3. Alternative - Script Node.js pour automatiser :
 */

// Script d'automatisation pour Strapi (à exécuter côté serveur)
const setupTestData = async () => {
  try {
    // Créer le Bober Testeur
    const testUser = await strapi.plugins['users-permissions'].services.user.add({
      ...TEST_USER,
      provider: 'local',
      role: 1 // ID du rôle "Authenticated"
    });

    console.log('✅ Bober Testeur créé:', testUser.id);

    // Créer les échanges de test
    let successCount = 0;
    for (const exchangeData of MOCK_EXCHANGES) {
      try {
        const exchange = await strapi.services.echange.create({
          ...exchangeData,
          createur: testUser.id,
          dateCreation: new Date(),
          dateModification: new Date()
        });
        
        console.log(`✅ Échange créé: ${exchange.titre}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Erreur échange: ${exchangeData.titre}`, error.message);
      }
    }

    console.log(`\n🎉 Setup terminé: ${successCount}/${MOCK_EXCHANGES.length} échanges créés`);
    
  } catch (error) {
    console.error('❌ Erreur setup:', error);
  }
};

// Export pour utilisation
module.exports = {
  TEST_USER,
  MOCK_EXCHANGES,
  setupTestData
};

/**
 * Commande à exécuter dans Strapi :
 * 
 * 1. Copier ce fichier dans le dossier Strapi
 * 2. Dans la console Strapi :
 *    const { setupTestData } = require('./setupTestData.js');
 *    setupTestData();
 * 
 * Ou créer une route API temporaire qui appelle setupTestData()
 */