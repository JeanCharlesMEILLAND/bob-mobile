import * as LocalAuthentication from 'expo-local-authentication';
import { storageService } from './storage.service';
import { logger } from '../utils/logger';

export interface BiometricCapability {
  isAvailable: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  isEnrolled: boolean;
  securityLevel: LocalAuthentication.SecurityLevel;
}

export interface BiometricSettings {
  enabled: boolean;
  promptMessage: string;
  fallbackTitle: string;
  cancelTitle: string;
}

class BiometricService {
  private static _isSupported: boolean | null = null;
  private static _capability: BiometricCapability | null = null;

  // ==========================================
  // CAPABILITY DETECTION
  // ==========================================

  async checkCapability(): Promise<BiometricCapability> {
    if (BiometricService._capability) {
      return BiometricService._capability;
    }

    try {
      // 1. Vérifier si l'appareil supporte la biométrie
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      
      // 2. Vérifier les types supportés
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // 3. Vérifier si des empreintes/visages sont enregistrés
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // 4. Vérifier le niveau de sécurité
      const securityLevel = await LocalAuthentication.getEnrolledLevelAsync();

      const capability: BiometricCapability = {
        isAvailable,
        supportedTypes,
        isEnrolled,
        securityLevel
      };

      BiometricService._capability = capability;
      logger.debug('biometric', 'Capacité biométrique détectée', capability);

      return capability;
    } catch (error) {
      logger.error('biometric', 'Erreur vérification capacité', error);
      
      const fallback: BiometricCapability = {
        isAvailable: false,
        supportedTypes: [],
        isEnrolled: false,
        securityLevel: LocalAuthentication.SecurityLevel.NONE
      };
      
      BiometricService._capability = fallback;
      return fallback;
    }
  }

  async isSupported(): Promise<boolean> {
    if (BiometricService._isSupported !== null) {
      return BiometricService._isSupported;
    }

    const capability = await this.checkCapability();
    BiometricService._isSupported = capability.isAvailable && capability.isEnrolled;
    
    return BiometricService._isSupported;
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  async authenticate(customPrompt?: string): Promise<boolean> {
    try {
      const isSupported = await this.isSupported();
      if (!isSupported) {
        logger.warn('biometric', 'Biométrie non supportée ou non configurée');
        return false;
      }

      const capability = await this.checkCapability();
      const settings = await this.getSettings();

      // Déterminer le message à afficher selon les types supportés
      let promptMessage = customPrompt || settings.promptMessage;
      if (!customPrompt) {
        if (capability.supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          promptMessage = "Authentifiez-vous avec Face ID";
        } else if (capability.supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          promptMessage = "Authentifiez-vous avec Touch ID";
        }
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: settings.fallbackTitle,
        cancelLabel: settings.cancelTitle,
        disableDeviceFallback: false, // Permet le code PIN en fallback
        requireConfirmation: false
      });

      if (result.success) {
        logger.debug('biometric', 'Authentification biométrique réussie');
        return true;
      } else {
        logger.warn('biometric', 'Authentification biométrique échouée', {
          error: result.error,
          warning: result.warning
        });
        return false;
      }

    } catch (error) {
      logger.error('biometric', 'Erreur authentification biométrique', error);
      return false;
    }
  }

  // ==========================================
  // SETTINGS MANAGEMENT
  // ==========================================

  async getSettings(): Promise<BiometricSettings> {
    try {
      const stored = await storageService.get('biometric_settings');
      
      if (stored) {
        return JSON.parse(stored);
      }

      // Paramètres par défaut
      const defaultSettings: BiometricSettings = {
        enabled: true,
        promptMessage: "Authentifiez-vous pour accéder à BOB",
        fallbackTitle: "Utiliser le mot de passe",
        cancelTitle: "Annuler"
      };

      await this.saveSettings(defaultSettings);
      return defaultSettings;

    } catch (error) {
      logger.error('biometric', 'Erreur récupération paramètres biométrie', error);
      
      return {
        enabled: false,
        promptMessage: "Authentifiez-vous pour accéder à BOB",
        fallbackTitle: "Utiliser le mot de passe", 
        cancelTitle: "Annuler"
      };
    }
  }

  async saveSettings(settings: BiometricSettings): Promise<void> {
    try {
      await storageService.set('biometric_settings', JSON.stringify(settings));
      logger.debug('biometric', 'Paramètres biométrie sauvegardés', settings);
    } catch (error) {
      logger.error('biometric', 'Erreur sauvegarde paramètres biométrie', error);
    }
  }

  async isEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    const isSupported = await this.isSupported();
    
    return settings.enabled && isSupported;
  }

  async setEnabled(enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.enabled = enabled;
    await this.saveSettings(settings);
    
    logger.debug('biometric', `Biométrie ${enabled ? 'activée' : 'désactivée'}`);
  }

  // ==========================================
  // CONVENIENCE METHODS
  // ==========================================

  async canEnableBiometric(): Promise<{ canEnable: boolean; reason?: string }> {
    try {
      const capability = await this.checkCapability();

      if (!capability.isAvailable) {
        return {
          canEnable: false,
          reason: "Cet appareil ne supporte pas l'authentification biométrique"
        };
      }

      if (!capability.isEnrolled) {
        return {
          canEnable: false,
          reason: "Aucune empreinte digitale ou Face ID configuré sur cet appareil"
        };
      }

      if (capability.securityLevel === LocalAuthentication.SecurityLevel.NONE) {
        return {
          canEnable: false,
          reason: "Niveau de sécurité biométrique insuffisant"
        };
      }

      return { canEnable: true };

    } catch (error) {
      return {
        canEnable: false,
        reason: "Erreur lors de la vérification des capacités biométriques"
      };
    }
  }

  getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return "Face ID";
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return "Touch ID";
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return "Iris";
    } else {
      return "Biométrie";
    }
  }

  // ==========================================
  // CREDENTIAL STORAGE (SECURE)
  // ==========================================

  async saveBiometricCredential(identifier: string): Promise<boolean> {
    try {
      // Sauvegarder de manière sécurisée l'identifiant pour login automatique
      await storageService.setSecure('biometric_credential', identifier);
      logger.debug('biometric', 'Identifiant biométrique sauvegardé');
      return true;
    } catch (error) {
      logger.error('biometric', 'Erreur sauvegarde identifiant biométrique', error);
      return false;
    }
  }

  async getBiometricCredential(): Promise<string | null> {
    try {
      const credential = await storageService.getSecure('biometric_credential');
      return credential;
    } catch (error) {
      logger.error('biometric', 'Erreur récupération identifiant biométrique', error);
      return null;
    }
  }

  async clearBiometricCredential(): Promise<void> {
    try {
      await storageService.deleteSecure('biometric_credential');
      logger.debug('biometric', 'Identifiant biométrique supprimé');
    } catch (error) {
      logger.error('biometric', 'Erreur suppression identifiant biométrique', error);
    }
  }

  // ==========================================
  // DEBUG
  // ==========================================

  async debugBiometricStatus(): Promise<void> {
    console.log('🔐 === DEBUG BIOMETRIC STATUS ===');
    
    try {
      const capability = await this.checkCapability();
      const settings = await this.getSettings();
      const isEnabled = await this.isEnabled();
      const credential = await this.getBiometricCredential();

      console.log('📱 Disponibilité:', capability.isAvailable ? 'OUI' : 'NON');
      console.log('👆 Types supportés:', capability.supportedTypes.map(type => 
        this.getBiometricTypeName([type])
      ).join(', '));
      console.log('✅ Configuré:', capability.isEnrolled ? 'OUI' : 'NON');
      console.log('🔒 Sécurité:', capability.securityLevel);
      console.log('⚙️ Activé dans BOB:', isEnabled ? 'OUI' : 'NON');
      console.log('🔑 Identifiant sauvé:', credential ? 'OUI' : 'NON');
      console.log('📝 Paramètres:', settings);
      
    } catch (error) {
      console.error('❌ Erreur debug biométrie:', error);
    }
    
    console.log('🔐 === FIN DEBUG BIOMETRIC ===');
  }
}

export const biometricService = new BiometricService();