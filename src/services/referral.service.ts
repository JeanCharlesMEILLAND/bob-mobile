// src/services/referral.service.ts - Service pour la gestion du parrainage
import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ReferralInfo {
  code: string;
  qrCodeDataURL: string;
  deepLink: string;
  webLink: string;
  usageCount: number;
  isActive: boolean;
  stats: {
    totalReferred: number;
    successfulSignups: number;
    pendingSignups: number;
    totalBobizEarned: number;
  };
  shareLinks: {
    whatsapp: string;
    sms: string;
  };
}

interface ReferralStats {
  totalReferred: number;
  successfulSignups: number;
  pendingSignups: number;
  totalBobizEarned: number;
  codes: Array<{
    code: string;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
  }>;
  referees: Array<{
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    status: string;
    bobizEarned: number;
    createdAt: string;
    completedAt: string;
  }>;
}

class ReferralService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Erreur récupération token:', error);
      return null;
    }
  }

  /**
   * Obtenir les informations complètes de parrainage (code + QR + liens)
   */
  async getReferralInfo(): Promise<{ success: boolean; data?: ReferralInfo; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Token d\'authentification requis' };
      }

      const response = await apiClient.get('/referral/info', token);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API referral info:', error);
        return { success: false, error: `Erreur ${response.status}: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur getReferralInfo:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }

  /**
   * Obtenir les statistiques de parrainage détaillées
   */
  async getReferralStats(): Promise<{ success: boolean; data?: ReferralStats; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Token d\'authentification requis' };
      }

      const response = await apiClient.get('/referral/stats', token);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API referral stats:', error);
        return { success: false, error: `Erreur ${response.status}: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur getReferralStats:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }

  /**
   * Générer un nouveau code de parrainage (ou récupérer l'existant)
   */
  async generateReferralCode(): Promise<{ success: boolean; data?: { code: string; usageCount: number; message: string }; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Token d\'authentification requis' };
      }

      const response = await apiClient.post('/referral/generate', {}, token);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API generate referral:', error);
        return { success: false, error: `Erreur ${response.status}: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur generateReferralCode:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }

  /**
   * Valider un code de parrainage
   */
  async validateReferralCode(code: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await apiClient.post('/referral/validate', { code });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API validate referral:', error);
        return { success: false, error: `Code invalide` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur validateReferralCode:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }

  /**
   * Appliquer un code de parrainage (pour utilisateur connecté)
   */
  async applyReferralCode(code: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Token d\'authentification requis' };
      }

      const response = await apiClient.post('/referral/apply', { code }, token);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API apply referral:', error);
        return { success: false, error: `Erreur application code: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur applyReferralCode:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }

  /**
   * Obtenir uniquement le QR code
   */
  async getQRCode(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        return { success: false, error: 'Token d\'authentification requis' };
      }

      const response = await apiClient.get('/referral/qr', token);
      
      if (!response.ok) {
        const error = await response.text();
        console.error('Erreur API QR code:', error);
        return { success: false, error: `Erreur ${response.status}: ${error}` };
      }

      const data = await response.json();
      return { success: true, data };

    } catch (error) {
      console.error('Erreur getQRCode:', error);
      return { success: false, error: error.message || 'Erreur réseau' };
    }
  }
}

export const referralService = new ReferralService();
export default referralService;