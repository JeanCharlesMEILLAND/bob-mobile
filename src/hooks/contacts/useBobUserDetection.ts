// src/hooks/contacts/useBobUserDetection.ts
import { useCallback, useRef } from 'react';
import { contactsService } from '../../services/contacts.service';
import { authService } from '../../services/auth.service';
import { Contact } from '../../types/contacts.types';

export const useBobUserDetection = () => {
  const detectionInProgress = useRef(false);
  const lastDetectionRepertoire = useRef<string>('');
  
  const detectBobUsersOnStartup = useCallback(async (
    repertoire: Contact[], 
    onUpdate: (contacts: Contact[]) => void
  ) => {
    if (repertoire.length === 0) return;
    
    // Prevent multiple simultaneous calls with same repertoire
    const repertoireKey = repertoire.map(c => c.id).sort().join(',');
    if (detectionInProgress.current || lastDetectionRepertoire.current === repertoireKey) {
      console.log('🚫 Détection Bob déjà en cours ou déjà faite pour ce répertoire');
      return;
    }
    
    detectionInProgress.current = true;
    lastDetectionRepertoire.current = repertoireKey;
    
    console.log('🔎 Démarrage détection utilisateurs Bob avec délai anti-rate-limiting...');
    
    // Délai pour éviter le rate limiting au démarrage
    setTimeout(async () => {
      try {
        const token = await authService.getValidToken();
        if (!token || repertoire.length === 0) {
          detectionInProgress.current = false;
          return;
        }
        
        // Vérifier si déjà fait
        const bobUsersCount = repertoire.filter(c => c.estUtilisateurBob === true || c.aSurBob === true).length;
        if (bobUsersCount === 0) {
          console.log('🔍 Lancement détection utilisateurs Bob au démarrage...');
          try {
            const result = await contactsService.detectRealBobUsers(token);
            if (result.contactsWithBob.length > 0) {
              console.log(`✅ Détection démarrage: ${result.contactsWithBob.length} utilisateurs Bob enrichis`);
              onUpdate(result.contactsWithBob);
            } else {
              console.log('📭 Aucun utilisateur Bob détecté dans les contacts');
            }
          } catch (detectionError: any) {
            console.warn('⚠️ Erreur spécifique detectRealBobUsers:', detectionError.message);
            // Ne pas bloquer l'app, juste logger l'erreur
          }
        } else {
          console.log('💡 Utilisateurs Bob déjà présents dans le cache');
        }
      } catch (error) {
        console.warn('⚠️ Erreur détection démarrage (pas grave):', error);
      } finally {
        detectionInProgress.current = false;
      }
    }, 3000); // 3 secondes de délai
  }, []);

  const detectBobUsersManual = useCallback(async () => {
    try {
      console.log('🔍 Démarrage détection manuelle des utilisateurs Bob...');
      const token = await authService.getValidToken();
      if (!token) {
        console.error('❌ Pas de token pour détecter les utilisateurs Bob');
        return { success: false, error: 'Pas de token' };
      }
      
      const result = await contactsService.detectRealBobUsers(token);
      
      console.log(`✅ Détection manuelle: ${result.contactsWithBob.length} utilisateurs Bob trouvés`);
      
      return { 
        success: true, 
        contactsWithBob: result.contactsWithBob,
        stats: result.stats 
      };
    } catch (error: any) {
      console.error('❌ Erreur détection manuelle:', error);
      return { 
        success: false, 
        error: error.message || 'Erreur inconnue' 
      };
    }
  }, []);

  return {
    detectBobUsersOnStartup,
    detectBobUsersManual
  };
};