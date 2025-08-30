# 🔐 Guide de Connexion BOB - Mode Développement

## 🎯 Problème Identifié

L'API Strapi de production (`https://bobv2.strapi-pro.com/api`) est actuellement inaccessible (erreur 404), ce qui empêche la connexion sur le web.

## 🎭 Solution Mise en Place

Un **système de fallback MockAuthService** a été implémenté pour permettre le développement et les tests locaux.

## 🚀 Utilisateurs de Test Disponibles

### Utilisateur 1
- **Username:** `testuser`
- **Email:** `test@bob.com`
- **Mot de passe:** `password123`

### Utilisateur 2
- **Username:** `alice`
- **Email:** `alice@bob.com`
- **Mot de passe:** `alice123`

## 🌐 Comment Tester la Connexion Web

1. **Ouvrir** http://localhost:19007/
2. **Utiliser** les identifiants de test ci-dessus
3. **Le système tentera d'abord** l'API Strapi réelle
4. **En cas d'échec**, il basculera automatiquement sur le MockAuthService

## 🔄 Comportement du Système

### Mode Production
- ✅ Utilise uniquement l'API Strapi réelle
- ❌ Pas de fallback mock

### Mode Développement
- 🎯 **Priorité 1**: Essaie l'API Strapi réelle
- 🎭 **Fallback**: Utilise MockAuthService si l'API ne répond pas
- 💾 **Session**: Sauvegarde locale identique dans les deux cas

## 📱 Fonctionnalités Supportées en Mode Mock

- ✅ Connexion avec username/email + mot de passe
- ✅ Inscription de nouveaux utilisateurs
- ✅ Validation et persistance des sessions
- ✅ Restauration automatique de session
- ✅ Validation des tokens mock
- ✅ Déconnexion propre

## 🐛 Debug et Logs

Tous les appels d'authentification sont loggés avec des préfixes clairs :
- `🚀 AUTHENTIFICATION STRAPI` - Tentative avec l'API réelle
- `🎭 MockAuthService` - Utilisation du service mock
- `✅ Connexion réussie` - Succès (réel ou mock)
- `💥 Erreur` - Échecs avec détails

## 🔧 Configuration

Le fallback est automatiquement activé en mode développement :
- `__DEV__` = true
- `process.env.NODE_ENV` = 'development'

## 📝 Prochaines Étapes

1. **Corriger l'API Strapi** de production
2. **Tester la connexion** avec les vrais identifiants
3. **Désactiver le MockAuthService** en production
4. **Garder le système de fallback** pour le développement futur

## 🚨 Important

⚠️ Le **MockAuthService ne doit JAMAIS être utilisé en production**. Il est automatiquement désactivé hors mode développement.

Les mots de passe sont stockés en plain text dans le mock (uniquement pour tests) - ceci est normal et sécurisé car le mock ne fonctionne qu'en développement local.