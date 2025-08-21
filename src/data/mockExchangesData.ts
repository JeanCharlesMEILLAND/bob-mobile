// src/data/mockExchangesData.ts - Exemples d'échanges pour Strapi
import { TEST_USER } from './testUserData';

export const MOCK_EXCHANGES = [
  // 🔧 BOBS DE PRÊT
  {
    titre: "Perceuse sans fil Makita 18V",
    description: "Perceuse sans fil professionnelle avec 2 batteries, chargeur et coffret de mèches. Parfaite pour tous travaux de perçage et vissage. État impeccable, peu utilisée.",
    type: "pret",
    categorie: "bricolage",
    statut: "en_attente",
    dureeJours: 3,
    conditions: "• Retour propre et chargée\n• Dépôt de garantie 80€\n• Disponible dès demain\n• Récupération chez moi ou livraison possible",
    bobizRecompense: 15,
    createdBy: TEST_USER.id,
    photos: [
      "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400",
      "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400"
    ],
    location: "Lyon 3e, Metro Part-Dieu",
    tags: ["bricolage", "perceuse", "makita", "18v", "professionnel"]
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
    createdBy: TEST_USER.id,
    location: "Lyon 6e, Metro Foch",
    tags: ["velo", "electrique", "transport", "ecologique"]
  },

  {
    titre: "Tondeuse thermique Honda",
    description: "Tondeuse autoportée Honda, parfaite pour grandes surfaces. Bac de ramassage 150L, largeur de coupe 107cm. Très puissante et fiable.",
    type: "pret",
    categorie: "jardinage",
    statut: "termine",
    dureeJours: 2,
    conditions: "• Essence à votre charge\n• Nettoyage après usage\n• Formation rapide si besoin\n• Disponible weekend uniquement",
    bobizRecompense: 30,
    createdBy: TEST_USER.id,
    location: "Villeurbanne, Metro Gratte-Ciel",
    tags: ["tondeuse", "honda", "jardinage", "autoportee"]
  },

  // 📥 BOBS D'EMPRUNT  
  {
    titre: "Échelle télescopique ou échafaudage",
    description: "Je cherche une échelle télescopique (4-5m) ou petit échafaudage pour refaire la peinture de ma façade. Travaux prévus ce weekend.",
    type: "emprunt",
    categorie: "bricolage", 
    statut: "en_attente",
    dureeJours: 2,
    conditions: "• Utilisation soigneuse garantie\n• Assurance habitation couvre\n• Récupération/livraison flexible\n• Petit dédommagement possible",
    bobizRecompense: 10,
    createdBy: TEST_USER.id,
    location: "Lyon 7e, Quartier Jean Macé",
    tags: ["echelle", "telescopique", "echafaudage", "peinture", "facade"]
  },

  {
    titre: "Appareil photo reflex + objectifs",
    description: "Recherche reflex numérique avec objectif 50mm pour shooting photo mariage d'un ami. Je maîtrise bien, juste besoin de matériel pro.",
    type: "emprunt",
    categorie: "electronique",
    statut: "actif", 
    dureeJours: 3,
    conditions: "• Expérience photo confirmée\n• Assurance matériel souscrite\n• Restitution état parfait\n• Références disponibles",
    bobizRecompense: 20,
    createdBy: TEST_USER.id,
    location: "Lyon 2e, Bellecour",
    tags: ["photo", "reflex", "mariage", "objectif", "professionnel"]
  },

  {
    titre: "Remorque ou camionnette weekend",
    description: "Déménagement prévu samedi, je cherche une remorque (permis B) ou camionnette pour transporter mobilier. Trajet Lyon - Grenoble.",
    type: "emprunt",
    categorie: "transport",
    statut: "en_attente",
    dureeJours: 1,
    conditions: "• Permis depuis +3 ans\n• Kilométrage remboursé\n• Nettoyage avant retour\n• Disponible samedi matin",
    bobizRecompense: 15,
    createdBy: TEST_USER.id,
    location: "Lyon 9e, Vaise",
    tags: ["remorque", "camionnette", "demenagement", "transport", "weekend"]
  },

  // 🤝 BOBS SERVICE OFFERT
  {
    titre: "Cours particuliers informatique",
    description: "Prof d'informatique, je propose des cours personnalisés : bureautique, programmation, dépannage PC/Mac. Tous niveaux, méthode adaptée.",
    type: "service_offert",
    categorie: "formation",
    statut: "en_attente",
    dureeJours: null, // Service récurrent
    conditions: "• 1ère séance gratuite\n• Flexible horaires soir/weekend\n• Chez vous ou chez moi\n• Support de cours fourni",
    bobizRecompense: 20,
    createdBy: TEST_USER.id,
    location: "Lyon centre, déplacements possibles",
    tags: ["informatique", "cours", "bureautique", "programmation", "depannage"]
  },

  {
    titre: "Aide jardinage et petit bricolage",
    description: "Retraité passionné, je propose mes services pour jardinage (tonte, taille, plantation) et petits travaux de bricolage. Expérience 40 ans !",
    type: "service_offert", 
    categorie: "jardinage",
    statut: "actif",
    dureeJours: null,
    conditions: "• Matériel à votre charge\n• Tarif symbolique Bobiz\n• Weekends de préférence\n• Conseil gratuit inclus",
    bobizRecompense: 25,
    createdBy: TEST_USER.id,
    location: "Métropole lyonnaise",
    tags: ["jardinage", "bricolage", "tonte", "taille", "retraite", "experience"]
  },

  {
    titre: "Livraisons courses/repas vélo/scooter",
    description: "Étudiant disponible, je propose livraisons courses, repas, colis dans Lyon. Rapide, soigneux, tarifs étudiants. Scooter + vélo élec.",
    type: "service_offert",
    categorie: "transport", 
    statut: "en_attente",
    dureeJours: null,
    conditions: "• Paiement Bobiz uniquement\n• Horaires 11h-21h\n• Lyon intramuros\n• Produits frais OK",
    bobizRecompense: 10,
    createdBy: TEST_USER.id,
    location: "Lyon toutes zones",
    tags: ["livraison", "courses", "repas", "scooter", "etudiant", "rapide"]
  },

  // 🙋 BOBS SERVICE DEMANDÉ
  {
    titre: "Aide déménagement samedi matin",
    description: "Déménagement studio Lyon 6e vers Lyon 3e, je cherche 2 personnes motivées pour cartons + quelques meubles. Camion déjà réservé.",
    type: "service_demande",
    categorie: "transport",
    statut: "en_attente", 
    dureeJours: null,
    conditions: "• Samedi 9h-13h environ\n• Pizza + boissons offertes\n• Bonne condition physique\n• Ambiance sympa garantie",
    bobizRecompense: 30,
    createdBy: TEST_USER.id,
    location: "Lyon 6e vers Lyon 3e",
    tags: ["demenagement", "aide", "cartons", "meubles", "samedi"]
  },

  {
    titre: "Réparation fuite robinetterie cuisine",
    description: "Fuite sous évier cuisine, je cherche quelqu'un qui s'y connaît en plomberie pour diagnostic et réparation si possible. Urgent !",
    type: "service_demande",
    categorie: "bricolage",
    statut: "actif",
    dureeJours: null, 
    conditions: "• Dépannage rapide souhaité\n• Fournitures remboursées\n• Créneau flexible\n• Merci d'avance !",
    bobizRecompense: 25,
    createdBy: TEST_USER.id,
    location: "Lyon 8e, Monplaisir",
    tags: ["plomberie", "fuite", "robinet", "cuisine", "urgent", "reparation"]
  },

  {
    titre: "Garde chien weekend 21-23 février",
    description: "Recherche famille/personne de confiance pour garder mon golden retriever Balto, très gentil. Weekend ski prévu, impossible d'annuler.",
    type: "service_demande",
    categorie: "animaux",
    statut: "en_attente",
    dureeJours: 3,
    conditions: "• Expérience chiens requise\n• Jardin/balcon apprécié\n• Croquettes + jouets fournis\n• Photos de nouvelles welcome",
    bobizRecompense: 40,
    createdBy: TEST_USER.id,
    location: "Lyon 5e, Vieux Lyon",
    tags: ["garde", "chien", "golden", "weekend", "confiance", "ski"]
  }
];

// Fonction pour injecter les données dans Strapi
export const injectMockExchangesToStrapi = async () => {
  console.log('🚀 Injection des échanges de test dans Strapi...');
  
  const results = {
    success: 0,
    errors: 0,
    total: MOCK_EXCHANGES.length
  };

  for (const exchange of MOCK_EXCHANGES) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/echanges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`
        },
        body: JSON.stringify({
          data: {
            ...exchange,
            dateCreation: new Date().toISOString(),
            dateModification: new Date().toISOString(),
            isTestData: true, // Marqueur pour identifier les données de test
            createur: exchange.createdBy
          }
        })
      });

      if (response.ok) {
        const created = await response.json();
        console.log(`✅ ${exchange.titre} - ${exchange.type}`);
        results.success++;
      } else {
        console.error(`❌ Échec: ${exchange.titre}`, response.status);
        results.errors++;
      }
      
      // Délai pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`❌ Erreur: ${exchange.titre}`, error);
      results.errors++;
    }
  }

  console.log('📊 Résultats injection:', results);
  return results;
};

// Fonction pour nettoyer les données de test
export const cleanTestExchanges = async () => {
  try {
    console.log('🧹 Nettoyage des données de test...');
    
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/api/echanges?filters[isTestData][$eq]=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${await getAuthToken()}`
      }
    });

    if (response.ok) {
      const { data } = await response.json();
      
      for (const exchange of data) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/echanges/${exchange.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await getAuthToken()}`
          }
        });
      }
      
      console.log(`✅ ${data.length} échanges de test supprimés`);
      return data.length;
    }
  } catch (error) {
    console.error('❌ Erreur nettoyage:', error);
  }
  return 0;
};

const getAuthToken = async () => {
  try {
    // TODO: Intégrer avec le vrai service d'auth
    const { authService } = await import('../services/auth.service');
    return await authService.getValidToken();
  } catch (error) {
    console.warn('AuthService non disponible, utilisation token mock');
    return 'mock_token';
  }
};