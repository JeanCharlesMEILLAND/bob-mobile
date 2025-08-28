// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types';
import { authService } from '../services';

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // ⚠️ IMPORTANT: Commencer en loading
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Nouveau: État d'initialisation

  // Debug: Log des changements d'état (uniquement en dev)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 AuthProvider - État changé:', { 
        isAuthenticated, 
        user: user?.username, 
        isLoading,
        isInitialized,
      });
    }
  }, [isAuthenticated, user, isLoading, isInitialized]);

  // 🆕 NOUVEAU: Auto-restoration de session au démarrage
  useEffect(() => {
    restoreSessionOnStartup();
  }, []);

  const restoreSessionOnStartup = async () => {
    setIsLoading(true);
    
    try {
      const session = await authService.restoreSession();
      
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        } else {
      }
    } catch (error) {
      console.error('💥 Erreur restauration session:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    console.log('🔄 AuthProvider - Tentative de connexion');
    
    try {
      const data = await authService.login({ identifier, password });
      
      setUser(data.user);
      setIsAuthenticated(true);
      console.log('✅ AuthProvider - Connexion réussie');
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 AuthProvider - Erreur login:', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
      console.log('🏁 AuthProvider - Login terminé');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    console.log('📝 AuthProvider - Tentative d\'inscription');
    
    try {
      const data = await authService.register({ username, email, password });
      
      setUser(data.user);
      setIsAuthenticated(true);
      console.log('✅ AuthProvider - Inscription réussie');
      
      return { success: true };
    } catch (error: any) {
      console.error('💥 AuthProvider - Erreur register:', error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 AuthProvider - Déconnexion');
    setIsLoading(true);
    
    try {
      await authService.logout(); // Nettoie le stockage
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Déconnexion complète');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await authService.testConnection();
      console.log('🔍 Test connexion:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Test connexion erreur:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    isLoading,
    register,
    testConnection,
    isInitialized, // Nouveau: Indiquer si l'initialisation est terminée
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};