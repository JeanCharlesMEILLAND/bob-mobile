// src/services/auth.service.ts
import { apiClient } from './api';
import { storageService } from './storage.service';
import { LoginData, RegisterData, AuthResponse } from '../types';

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    console.log('🔄 AuthService - Tentative de connexion avec:', data.identifier);
    console.log('📡 Envoi requête vers: /auth/local');
    
    const response = await apiClient.post('/auth/local', data);
    
    console.log('📥 Réponse status:', response.status);
    console.log('📥 Réponse OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur réponse:', errorText);
      throw new Error('Identifiants incorrects');
    }

    const result = await response.json();
    console.log('✅ Connexion réussie! User:', result.user.username);
    console.log('🔑 JWT reçu:', result.jwt ? 'OUI' : 'NON');
    
    // 💾 NOUVEAU: Sauvegarder automatiquement la session
    try {
      await storageService.saveSession(result.jwt, result.user);
      console.log('💾 Session sauvegardée automatiquement');
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde session:', error);
      // Ne pas faire échouer le login pour autant
    }
    
    return result;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    console.log('📝 AuthService - Inscription:', data.username);
    
    const response = await apiClient.post('/auth/local/register', data);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erreur lors de l\'inscription');
    }

    const result = await response.json();
    console.log('✅ Inscription réussie! User:', result.user.username);
    
    // 💾 NOUVEAU: Sauvegarder automatiquement la session après inscription
    try {
      await storageService.saveSession(result.jwt, result.user);
      console.log('💾 Session sauvegardée après inscription');
    } catch (error) {
      console.warn('⚠️ Erreur sauvegarde session:', error);
    }
    
    return result;
  },

  // 🆕 NOUVEAU: Restaurer une session depuis le stockage
  restoreSession: async (): Promise<AuthResponse | null> => {
    console.log('🔄 AuthService - Tentative de restauration session');
    
    try {
      const session = await storageService.getSession();
      
      if (!session) {
        console.log('❌ Aucune session à restaurer');
        return null;
      }

      console.log('✅ Session restaurée:', session.user.username);
      return {
        jwt: session.token,
        user: session.user,
      };
    } catch (error) {
      console.error('❌ Erreur restauration session:', error);
      await storageService.clearAll(); // Nettoyer en cas d'erreur
      return null;
    }
  },

  // 🆕 NOUVEAU: Logout avec nettoyage du stockage
  logout: async (): Promise<void> => {
    console.log('🚪 AuthService - Déconnexion');
    
    try {
      await storageService.clearAll();
      console.log('✅ Session nettoyée');
    } catch (error) {
      console.error('❌ Erreur nettoyage session:', error);
    }
  },

  testConnection: async (): Promise<{ status: number; ok: boolean }> => {
    try {
      const response = await apiClient.get('/users/me');
      return { status: response.status, ok: response.ok };
    } catch (error: any) {
      console.error('❌ Test connexion erreur:', error);
      throw error;
    }
  },
};