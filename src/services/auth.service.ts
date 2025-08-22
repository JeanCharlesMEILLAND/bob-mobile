// src/services/auth.service.ts
import { apiClient } from './api';
import { storageService } from './storage.service';
import { LoginData, RegisterData, AuthResponse } from '../types';

// Export types for external use
export type { LoginData, RegisterData };

class AuthService {
  private static _token: string | null = null;
  private static _user: any = null;
  private static _isValidating: boolean = false;

  // ==========================================
  // MÉTHODES PUBLIQUES EXISTANTES
  // ==========================================

  async login(data: LoginData): Promise<AuthResponse> {
    console.log('🔄 AuthService - Tentative de connexion avec:', data.identifier);
    
    // 🧪 MODE TEST LOCAL - Identifiants prédéfinis
    const localTestCredentials = [
      { identifier: 'test@bob.com', password: 'password123', username: 'TestUser', bobizPoints: 250 },
      { identifier: 'admin@bob.com', password: 'admin123', username: 'Admin', bobizPoints: 1000 },
      { identifier: 'marie@bob.com', password: 'marie123', username: 'Marie Dupont', bobizPoints: 320 },
      { identifier: 'test', password: 'test', username: 'Demo User', bobizPoints: 100 }
    ];

    // Vérifier d'abord les identifiants locaux
    const localUser = localTestCredentials.find(cred => 
      (cred.identifier === data.identifier || cred.username.toLowerCase() === data.identifier.toLowerCase()) && 
      cred.password === data.password
    );

    if (localUser) {
      console.log('✅ Connexion locale réussie! User:', localUser.username);
      
      const mockResult = {
        jwt: 'mock-jwt-token-' + Date.now(),
        user: {
          id: Math.floor(Math.random() * 10000),
          username: localUser.username,
          email: localUser.identifier.includes('@') ? localUser.identifier : `${localUser.username.toLowerCase().replace(' ', '.')}@bob.com`,
          bobizPoints: localUser.bobizPoints
        }
      };

      // 💾 Sauvegarder automatiquement la session avec cache
      try {
        await this.setSession(mockResult.jwt, mockResult.user);
        console.log('💾 Session locale sauvegardée automatiquement');
      } catch (error) {
        console.warn('⚠️ Erreur sauvegarde session:', error);
      }

      return mockResult;
    }

    // Si pas de match local, essayer le serveur distant
    try {
      console.log('📡 Envoi requête vers: /auth/local');
      const response = await apiClient.post('/auth/local', data);
      
      console.log('📥 Réponse status:', response.status);
      console.log('📥 Réponse OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur réponse serveur:', errorText);
        throw new Error('Identifiants incorrects. Utilisez les identifiants de test:\n• test@bob.com / password123\n• admin@bob.com / admin123\n• marie@bob.com / marie123\n• test / test');
      }

      const result = await response.json();
      console.log('✅ Connexion serveur réussie! User:', result.user.username);
      
      // 💾 Sauvegarder automatiquement la session avec cache
      try {
        await this.setSession(result.jwt, result.user);
        console.log('💾 Session serveur sauvegardée automatiquement');
      } catch (error) {
        console.warn('⚠️ Erreur sauvegarde session:', error);
      }
      
      return result;

    } catch (serverError) {
      console.error('❌ Erreur serveur, utilisation du mode local uniquement');
      throw new Error('Connexion impossible. Utilisez les identifiants de test:\n• test@bob.com / password123\n• admin@bob.com / admin123\n• marie@bob.com / marie123\n• test / test');
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    console.log('📝 AuthService - Inscription:', data.username);
    
    const response = await apiClient.post('/auth/local/register', data);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'inscription');
    }

    const result = await response.json();
    console.log('✅ Inscription réussie! User:', result.user.username);
    
    // 💾 Sauvegarder automatiquement la session après inscription
    try {
      await this.setSession(result.jwt, result.user);
      console.log('💾 Session sauvegardée après inscription');
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde session:', error);
    }
    
    return result;
  }

  async restoreSession(): Promise<AuthResponse | null> {
    console.log('🔄 AuthService - Tentative de restauration session');
    
    try {
      // 1. Vérifier d'abord le cache mémoire
      if (AuthService._token && AuthService._user) {
        console.log('🧠 Session trouvée en mémoire');
        
        // Valider que le token est encore bon
        const isValid = await this.validateCurrentToken();
        if (isValid) {
          console.log('✅ Session mémoire valide');
          return {
            jwt: AuthService._token,
            user: AuthService._user,
          };
        } else {
          console.warn('⚠️ Token mémoire invalide, nettoyage...');
          await this.clearSession();
        }
      }

      // 2. Essayer de restaurer depuis le storage
      const session = await storageService.getSession();
      
      if (!session) {
        console.log('❌ Aucune session à restaurer');
        return null;
      }

      // 3. Valider le token restauré
      const isValid = await this.validateToken(session.token);
      if (!isValid) {
        console.warn('⚠️ Token stocké invalide, suppression...');
        await this.clearSession();
        return null;
      }

      // 4. Mettre en cache et retourner
      AuthService._token = session.token;
      AuthService._user = session.user;

      console.log('✅ Session complète récupérée:', session.user.username || session.user);
      return {
        jwt: session.token,
        user: session.user,
      };
    } catch (error) {
      console.error('❌ Erreur restauration session:', error);
      await this.clearSession(); // Nettoyer en cas d'erreur
      return null;
    }
  }

  async logout(): Promise<void> {
    console.log('🚪 AuthService - Déconnexion');
    await this.clearSession();
  }

  async testConnection(): Promise<{ status: number; ok: boolean }> {
    try {
      const token = await this.getValidToken();
      const response = await apiClient.get('/users/me', token ?? undefined);
      return { status: response.status, ok: response.ok };
    } catch (error: any) {
      console.error('❌ Test connexion erreur:', error);
      throw error;
    }
  }

  // ==========================================
  // MÉTHODES DE GESTION DU TOKEN (NOUVELLES)
  // ==========================================

  async getValidToken(): Promise<string | null> {
    try {
      // 1. Vérifier d'abord en mémoire
      if (AuthService._token) {
        console.log('🔑 Token depuis mémoire: PRÉSENT');
        
        // Valider le token périodiquement (pas à chaque appel)
        if (!AuthService._isValidating) {
          this.validateCurrentTokenAsync(); // Validation en arrière-plan
        }
        
        return AuthService._token;
      }
      
      // 2. Essayer de restaurer depuis le storage
      console.log('🔄 Tentative restauration token depuis storage...');
      const session = await storageService.getSession();
      
      if (!session?.token) {
        console.warn('⚠️ Aucun token trouvé dans le storage');
        return null;
      }
      
      // 3. Valider le token restauré
      const isValid = await this.validateToken(session.token);
      
      if (!isValid) {
        console.warn('⚠️ Token stocké expiré, suppression...');
        await this.clearSession();
        return null;
      }
      
      // 4. Mettre en cache en mémoire
      AuthService._token = session.token;
      AuthService._user = session.user;
      console.log('🔑 Token valide récupéré et mis en cache');
      
      return session.token;
      
    } catch (error) {
      console.error('❌ Erreur récupération token:', error);
      return null;
    }
  }

  async getCurrentUser(): Promise<any | null> {
    try {
      // 1. Vérifier le cache mémoire
      if (AuthService._user) {
        return AuthService._user;
      }

      // 2. Essayer de restaurer depuis le storage
      const session = await storageService.getSession();
      if (session?.user) {
        AuthService._user = session.user;
        return session.user;
      }

      return null;
    } catch (error) {
      console.error('❌ Erreur récupération utilisateur:', error);
      return null;
    }
  }

  // ==========================================
  // MÉTHODES PRIVÉES DE VALIDATION
  // ==========================================

  private async validateToken(token: string): Promise<boolean> {
    try {
      // 1. Vérifier la structure basique du token
      if (!token || token.length < 10 || !token.includes('.')) {
        console.warn('⚠️ Token malformé');
        return false;
      }
      
      // 2. Vérifier auprès du serveur
      const response = await apiClient.get('/users/me', token);
      
      if (response.ok) {
        console.log('✅ Token validé avec succès');
        return true;
      } else {
        console.warn('⚠️ Token rejeté par le serveur:', response.status);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Erreur validation token:', error);
      return false;
    }
  }

  private async validateCurrentToken(): Promise<boolean> {
    if (!AuthService._token) return false;
    return await this.validateToken(AuthService._token);
  }

  // Validation asynchrone en arrière-plan (non bloquante)
  private validateCurrentTokenAsync(): void {
    if (AuthService._isValidating || !AuthService._token) return;
    
    AuthService._isValidating = true;
    
    this.validateToken(AuthService._token)
      .then(isValid => {
        if (!isValid) {
          console.warn('⚠️ Token invalide détecté en arrière-plan, nettoyage...');
          this.clearSession();
        }
      })
      .catch(error => {
        console.error('❌ Erreur validation arrière-plan:', error);
      })
      .finally(() => {
        AuthService._isValidating = false;
      });
  }

  // ==========================================
  // MÉTHODES DE GESTION DE SESSION
  // ==========================================

  private async setSession(token: string, user: any): Promise<void> {
    try {
      // 1. Sauvegarder dans le storage
      await storageService.saveSession(token, user);
      
      // 2. Mettre en cache en mémoire
      AuthService._token = token;
      AuthService._user = user;
      
      console.log('✅ Session complète sauvegardée (storage + cache)');
    } catch (error) {
      console.error('❌ Erreur sauvegarde session:', error);
      throw error;
    }
  }

  private async clearSession(): Promise<void> {
    try {
      // 1. Nettoyer le storage
      await storageService.clearAll();
      
      // 2. Nettoyer le cache mémoire
      AuthService._token = null;
      AuthService._user = null;
      AuthService._isValidating = false;
      
      console.log('🗑️ Session complètement nettoyée');
    } catch (error) {
      console.error('❌ Erreur nettoyage session:', error);
    }
  }

  // ==========================================
  // MÉTHODES DE DEBUG
  // ==========================================

  async debugTokenStatus(): Promise<void> {
    console.log('🔍 === DEBUG TOKEN STATUS ===');
    
    try {
      // Vérifier mémoire
      console.log('🧠 Token mémoire:', AuthService._token ? 'PRÉSENT' : 'ABSENT');
      console.log('👤 User mémoire:', AuthService._user ? AuthService._user.username || 'PRÉSENT' : 'ABSENT');
      
      // Vérifier storage
      const session = await storageService.getSession();
      console.log('📱 Token storage:', session?.token ? 'PRÉSENT' : 'ABSENT');
      console.log('👤 User storage:', session?.user ? session.user.username || 'PRÉSENT' : 'ABSENT');
      
      // Test validation si token disponible
      const currentToken = await this.getValidToken();
      if (currentToken) {
        const isValid = await this.validateToken(currentToken);
        console.log('✅ Token validité:', isValid ? 'VALIDE' : 'INVALIDE');
      }
      
    } catch (error) {
      console.error('❌ Erreur debug:', error);
    }
    
    console.log('🔍 === FIN DEBUG TOKEN ===');
  }

  // Méthode pour forcer la synchronisation du cache
  async syncCache(): Promise<void> {
    console.log('🔄 Synchronisation cache...');
    
    try {
      const session = await storageService.getSession();
      if (session) {
        AuthService._token = session.token;
        AuthService._user = session.user;
        console.log('✅ Cache synchronisé');
      } else {
        AuthService._token = null;
        AuthService._user = null;
        console.log('🗑️ Cache vidé (pas de session)');
      }
    } catch (error) {
      console.error('❌ Erreur sync cache:', error);
    }
  }
}

// Exporter une instance singleton
export const authService = new AuthService();