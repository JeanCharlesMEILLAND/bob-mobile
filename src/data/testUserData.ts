// src/data/testUserData.ts - Données du Bober Testeur
export const TEST_USER = {
  id: 'bober_testeur_001',
  username: 'bober_testeur',
  email: 'test@bob-app.fr',
  prenom: 'Bober',
  nom: 'Testeur',
  telephone: '+33612345678',
  avatar: '🤖',
  bio: 'Je suis le Bober Testeur officiel ! Ami de tous les utilisateurs de Bob pour vos tests.',
  bobizBalance: 1000,
  reputation: 5.0,
  totalExchanges: 50,
  joinedDate: '2024-01-01',
  badges: [
    { id: 'super_helper', name: 'Super Aidant', icon: '🦸', description: 'A aidé plus de 20 personnes' },
    { id: 'trusted_lender', name: 'Prêteur de Confiance', icon: '🏆', description: 'Plus de 15 prêts réussis' },
    { id: 'fast_responder', name: 'Réponse Rapide', icon: '⚡', description: 'Répond toujours en moins d\'1h' }
  ],
  location: {
    city: 'Lyon',
    region: 'Auvergne-Rhône-Alpes',
    coordinates: { lat: 45.7640, lng: 4.8357 }
  },
  preferences: {
    maxDistance: 10,
    categories: ['bricolage', 'jardinage', 'transport', 'electronique', 'sport'],
    availability: {
      weekdays: { start: '09:00', end: '18:00' },
      weekend: { start: '10:00', end: '16:00' }
    }
  }
};

// Fonction pour ajouter le Bober Testeur aux contacts de tout le monde
export const addTestUserToContacts = async (currentUserId: string) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        data: {
          prenom: TEST_USER.prenom,
          nom: TEST_USER.nom,
          telephone: TEST_USER.telephone,
          email: TEST_USER.email,
          aSurBob: true,
          userId: TEST_USER.id,
          addedBy: currentUserId,
          isTestUser: true
        }
      })
    });

    if (response.ok) {
      console.log('✅ Bober Testeur ajouté aux contacts');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur ajout Bober Testeur:', error);
  }
  return false;
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