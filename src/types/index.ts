/**
 * ========================================
 * TYPES BOB - Point d'entrée unifié
 * ========================================
 * 
 * Organisation hiérarchique des types BOB avec Strapi v5
 * Utiliser de préférence les types unifiés pour nouveaux développements
 */

// ==========================================
// 🎯 TYPES PRINCIPAUX UNIFIÉS (RECOMMANDÉ)
// ==========================================
export * from './unified.types';

// ==========================================
// 🔧 TYPES API ET TECHNIQUES
// ==========================================
export * from './api.types';
export * from './entities.types';

// ==========================================
// 📱 TYPES SPÉCIALISÉS PAR DOMAINE
// ==========================================
export * from './auth.types';
export * from './contacts.types';
export * from './chat.types';
export * from './events.extended.types';
export * from './bob-chat.types';
export * from './unified-api.types';

// ==========================================
// 🗂️ TYPES NAVIGATION
// ==========================================
export * from './navigation.types';

// ==========================================
// 📜 TYPES LEGACY (DÉPRÉCIÉ - Migration en cours)
// ==========================================
// ⚠️  Ces types seront supprimés dans une version future
// ⚠️  Utilisez les types unifiés pour les nouveaux développements
export * from './app.types';
export * from './bob.types';