// src/types/auth.types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  bobizPoints?: number;
  niveau?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string, enableBiometric?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>; // ⚠️ Maintenant async
  testConnection: () => Promise<{ status: number; ok: boolean }>;
  loginWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  isInitialized: boolean; // 🆕 Nouveau: État d'initialisation
}

export interface LoginData {
  identifier: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}