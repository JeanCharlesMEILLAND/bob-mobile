// src/utils/webCSS.ts - Injection CSS pour le web
import { Platform } from 'react-native';
import { WebCSS } from '../styles/webDesign';

export const injectWebCSS = () => {
  if (Platform.OS !== 'web') return;
  
  // Vérifier si le CSS n'est pas déjà injecté
  if (document.getElementById('bob-web-styles')) return;

  const style = document.createElement('style');
  style.id = 'bob-web-styles';
  style.type = 'text/css';
  style.innerHTML = WebCSS;
  
  document.head.appendChild(style);
};

// Auto-injection au chargement du module
if (Platform.OS === 'web') {
  // Attendre que le DOM soit prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWebCSS);
  } else {
    injectWebCSS();
  }
}