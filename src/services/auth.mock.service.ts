// src/services/auth.mock.service.ts - Service mock pour tests de développement
import { LoginData, RegisterData, AuthResponse } from '../types';

// Mock user database
const MOCK_USERS = [
  {
    id: 1,
    username: 'testuser',
    email: 'test@bob.com',
    password: 'password123', // En réalité ceci serait hashé
    nom: 'Test',
    prenom: 'User',
    phone: '+33612345678',
    active: true
  },
  {
    id: 2,
    username: 'alice',
    email: 'alice@bob.com', 
    password: 'alice123',
    nom: 'Dupont',
    prenom: 'Alice',
    phone: '+33623456789',
    active: true
  }
];

// Mock JWT token (not secure, just for testing)
const generateMockToken = (userId: number) => {
  return `mock-jwt-${userId}-${Date.now()}`;
};

export class MockAuthService {
  static async login(data: LoginData): Promise<AuthResponse> {
    console.log('🎭 MockAuthService: Tentative de connexion', { identifier: data.identifier });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Find user by email or username
    const user = MOCK_USERS.find(u => 
      u.email === data.identifier || 
      u.username === data.identifier
    );
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    // Check password
    if (user.password !== data.password) {
      throw new Error('Mot de passe incorrect');
    }
    
    console.log('✅ MockAuthService: Connexion réussie', { username: user.username });
    
    return {
      jwt: generateMockToken(user.id),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        bobizPoints: 0,
        niveau: 'débutant'
      }
    };
  }
  
  static async register(data: RegisterData): Promise<AuthResponse> {
    console.log('🎭 MockAuthService: Tentative inscription', { username: data.username });
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => 
      u.email === data.email || 
      u.username === data.username
    );
    
    if (existingUser) {
      throw new Error('Un utilisateur avec cet email ou nom d\'utilisateur existe déjà');
    }
    
    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      username: data.username,
      email: data.email,
      password: data.password,
      nom: '',
      prenom: '',
      phone: '',
      active: true
    };
    
    MOCK_USERS.push(newUser);
    
    console.log('✅ MockAuthService: Inscription réussie', { username: newUser.username });
    
    return {
      jwt: generateMockToken(newUser.id),
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        bobizPoints: 0,
        niveau: 'débutant'
      }
    };
  }
  
  static async validateToken(token: string): Promise<boolean> {
    // Mock validation - just check if it's a valid mock token format
    return token.startsWith('mock-jwt-');
  }
  
  static async getCurrentUser(token: string): Promise<any> {
    if (!token.startsWith('mock-jwt-')) {
      throw new Error('Token invalide');
    }
    
    // Extract user ID from token
    const parts = token.split('-');
    const userId = parseInt(parts[2]);
    
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      bobizPoints: 0,
      niveau: 'débutant'
    };
  }
}

// Debug info
console.log('🎭 MockAuthService initialisé avec les utilisateurs:');
console.log(MOCK_USERS.map(u => ({ username: u.username, email: u.email })));