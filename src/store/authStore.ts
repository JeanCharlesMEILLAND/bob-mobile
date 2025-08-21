import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, LoginData, RegisterData } from '../services/auth.service';
import { tokenStorage } from '../services/api';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (data: LoginData) => {
    try {
      set({ isLoading: true });
      
      const response = await authService.login(data);
      
      // Stocker token et user
      await tokenStorage.setToken(response.jwt);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.jwt,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    try {
      set({ isLoading: true });
      
      const response = await authService.register(data);
      
      // Stocker token et user
      await tokenStorage.setToken(response.jwt);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      set({
        user: response.user,
        token: response.jwt,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await tokenStorage.removeToken();
    await AsyncStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadStoredAuth: async () => {
    try {
      const token = await tokenStorage.getToken();
      const userStr = await AsyncStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    }
  },

  updateUser: (userData) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
  },
}));
