// src/screens/exchanges/mockBoberData.ts - Données d'exemple pour tester les Bobs
import { BoberData } from './BoberCardScreen';

export const mockBoberExamples: BoberData[] = [
  // Bob de prêt actif
  {
    id: 'bober_pret_001',
    title: 'Perceuse sans fil Bosch',
    description: 'Perceuse sans fil 18V avec batteries, chargeur et set de mèches. Parfait pour vos travaux de bricolage.',
    type: 'pret',
    category: 'Bricolage',
    status: 'actif',
    createdBy: {
      id: 'user_123',
      name: 'Marie Dupont',
    },
    participants: [
      {
        id: 'user_456',
        name: 'Pierre Martin',
        status: 'accepte',
        isCurrentUser: true,
      }
    ],
    createdAt: '2024-12-20T10:30:00Z',
    duration: '3 jours',
    conditions: 'Merci de la rendre propre et chargée. Petit dépôt de garantie demandé.',
    location: {
      address: '15 rue de la Paix, 75001 Paris',
      distance: '800m'
    },
    chatId: 'chat_001',
    qrCode: 'bob://bober/bober_pret_001'
  },

  // Bob d'emprunt en attente
  {
    id: 'bober_emprunt_002',
    title: 'Tondeuse électrique',
    description: 'Je cherche une tondeuse électrique pour tondre mon petit jardin ce weekend. Une journée suffit.',
    type: 'emprunt',
    category: 'Jardinage',
    status: 'en_attente',
    createdBy: {
      id: 'current_user',
      name: 'Vous',
    },
    participants: [
      {
        id: 'user_789',
        name: 'Sophie Bernard',
        status: 'invite',
      },
      {
        id: 'user_101',
        name: 'Lucas Moreau',
        status: 'invite',
      }
    ],
    createdAt: '2024-12-21T14:15:00Z',
    duration: '1 jour',
    location: {
      address: 'Quartier République, Lyon 3e',
    },
    chatId: 'chat_002',
    qrCode: 'bob://bober/bober_emprunt_002'
  },

  // Bob service offert terminé
  {
    id: 'bober_service_003',
    title: 'Aide déménagement',
    description: 'Je propose mon aide pour un déménagement ce weekend. J\'ai un utilitaire et je suis costaud !',
    type: 'service_offert',
    category: 'Transport',
    status: 'termine',
    createdBy: {
      id: 'user_202',
      name: 'Thomas Leroy',
    },
    participants: [
      {
        id: 'current_user',
        name: 'Vous',
        status: 'accepte',
        isCurrentUser: true,
      }
    ],
    createdAt: '2024-12-18T09:00:00Z',
    duration: '1 journée',
    conditions: 'Prévoir les cartons et matériel d\'emballage. Essence à partager.',
    location: {
      address: 'Bordeaux Centre',
      distance: '2.5km'
    },
    chatId: 'chat_003',
    qrCode: 'bob://bober/bober_service_003'
  },

  // Bob service demandé en attente
  {
    id: 'bober_service_004',
    title: 'Cours d\'anglais',
    description: 'Je cherche quelqu\'un pour m\'aider à améliorer mon anglais oral. 1-2h par semaine, niveau intermédiaire.',
    type: 'service_demande',
    category: 'Formation',
    status: 'en_attente',
    createdBy: {
      id: 'current_user',
      name: 'Vous',
    },
    participants: [
      {
        id: 'user_303',
        name: 'Emma Wilson',
        status: 'invite',
      },
      {
        id: 'user_404',
        name: 'James Smith',
        status: 'invite',
      }
    ],
    createdAt: '2024-12-21T16:45:00Z',
    duration: 'Récurrent',
    conditions: 'Préférence pour cours en visio ou dans un café. Peut échanger contre cours de français.',
    location: {
      address: 'Toulouse ou visio',
    },
    chatId: 'chat_004',
    qrCode: 'bob://bober/bober_service_004'
  }
];

// Fonction pour générer un Bob aléatoire pour les tests
export const generateRandomBober = (type?: BoberData['type']): BoberData => {
  const types = ['pret', 'emprunt', 'service_offert', 'service_demande'] as const;
  const statuses = ['en_attente', 'actif', 'termine', 'annule'] as const;
  const categories = ['Bricolage', 'Jardinage', 'Transport', 'Sport', 'Électronique'];
  
  const selectedType = type || types[Math.floor(Math.random() * types.length)];
  const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `bober_${selectedType}_${Date.now()}`,
    title: `Titre du ${selectedType}`,
    description: `Description détaillée du Bob de type ${selectedType}`,
    type: selectedType,
    category: categories[Math.floor(Math.random() * categories.length)],
    status: selectedStatus,
    createdBy: {
      id: 'user_random',
      name: 'Utilisateur Test',
    },
    participants: [
      {
        id: 'current_user',
        name: 'Vous',
        status: 'accepte',
        isCurrentUser: true,
      }
    ],
    createdAt: new Date().toISOString(),
    duration: '2 jours',
    location: {
      address: 'Ville Test',
      distance: '1.2km'
    },
    chatId: `chat_${Date.now()}`,
    qrCode: `bob://bober/bober_${selectedType}_${Date.now()}`
  };
};