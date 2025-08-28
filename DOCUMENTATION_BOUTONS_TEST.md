# 🧪 Documentation des Boutons de Test - Bob Mobile

## 🎯 Vue d'Ensemble

Cette documentation explique tous les boutons de test disponibles dans l'application Bob Mobile pour aider les collaborateurs à comprendre leur rôle et utilisation.

## 📱 Localisation des Boutons

### Profile Screen (Écran Principal)
**Accès**: Menu → Profil → Section "Tests et Debug"

### Contacts Screen  
**Accès**: Menu → Contacts → Boutons d'action

---

## 🎭 Tests Interface Utilisateur

### 1. Test Modal Simple
**Description**: Teste l'affichage d'une modal basique avec du texte  
**Utilité**: Vérifier le fonctionnement des modals dans l'interface  
**Usage**: Développement UI, tests d'intégration

### 2. Test Modal avec Boutons
**Description**: Teste une modal interactive avec boutons d'action  
**Utilité**: Valider les interactions utilisateur complexes  
**Usage**: Tests d'expérience utilisateur

### 3. Test Permissions
**Description**: Vérifie l'état des permissions (caméra, contacts, notifications)  
**Utilité**: Diagnostiquer les problèmes d'accès aux fonctionnalités natives  
**Usage**: Debug des permissions, onboarding

### 4. Test Navigation
**Description**: Teste la navigation entre écrans  
**Utilité**: Vérifier le routage de l'application  
**Usage**: Tests de navigation, debug routing

---

## 📱 Gestion Contacts & Synchronisation

### 5. Scanner Contacts Téléphone
**Description**: Lance un scan complet du répertoire téléphone  
**Résultat**: Affiche le nombre de contacts trouvés  
**Utilité**: Première étape pour importer les contacts  
**Usage**: Onboarding, rafraîchissement des données

### 6. Importer Tous les Contacts
**Description**: Importe automatiquement tous les contacts scannés  
**Résultat**: Contacts ajoutés au répertoire Bob  
**Utilité**: Import en masse rapide  
**Usage**: Configuration initiale, migration

### 7. Synchroniser avec Strapi
**Description**: Envoie les contacts locaux vers le serveur Strapi  
**Résultat**: Contacts sauvegardés sur le serveur  
**Utilité**: Backup et partage des données  
**Usage**: Sauvegarde, synchronisation multi-appareils

### 8. Détecter Utilisateurs Bob
**Description**: Identifie quels contacts sont déjà inscrits sur Bob  
**Résultat**: Met à jour le statut "aSurBob" des contacts  
**Utilité**: Éviter les invitations inutiles  
**Usage**: Mise à jour périodique, optimisation invitations

### 9. Resync depuis Strapi ⭐
**Description**: Récupère les contacts depuis Strapi et lance la détection Bob  
**Résultat**: Synchronise l'app avec l'état du serveur  
**Utilité**: Résoudre les désynchronisations  
**Usage**: Debug sync, récupération après problème

### 10. Test API Contacts Strapi v5
**Description**: Teste directement l'API Strapi pour lister les contacts  
**Résultat**: Affiche la structure JSON des contacts serveur  
**Utilité**: Debug API, vérification format données  
**Usage**: Développement, diagnostic API

### 11. Test API Users Strapi v5
**Description**: Teste l'API utilisateurs Strapi  
**Résultat**: Affiche la liste des utilisateurs Bob  
**Utilité**: Debug détection Bob, vérification API  
**Usage**: Développement, diagnostic utilisateurs

---

## 🔧 Debug & Diagnostic

### 12. Voir Debug Contacts
**Description**: Affiche toutes les informations techniques des contacts  
**Résultat**: JSON complet avec IDs, sources, états  
**Utilité**: Diagnostic approfondi des données  
**Usage**: Debug, investigation de bugs

### 13. Stats Temps Réel
**Description**: Affiche les statistiques détaillées du système  
**Résultat**: Compteurs par source, taux de conversion, etc.  
**Utilité**: Monitoring des performances  
**Usage**: Analyse, optimisation

### 14. Actualiser Données
**Description**: Force le rechargement des données depuis le cache  
**Résultat**: Interface mise à jour avec données fraîches  
**Utilité**: Rafraîchissement manuel des vues  
**Usage**: Debug affichage, mise à jour manuelle

### 15. Test Token API
**Description**: Vérifie la validité du token d'authentification  
**Résultat**: Statut du token et infos utilisateur  
**Utilité**: Debug authentification  
**Usage**: Diagnostic connexion, debug API

---

## 🧹 Nettoyage & Reset

### 16. Vider Strapi Utilisateur
**Description**: Supprime TOUS les contacts de l'utilisateur sur Strapi  
**⚠️ DANGER**: Opération irréversible  
**Utilité**: Reset complet serveur  
**Usage**: Tests, nettoyage développement

### 17. Supprimer Tous Contacts
**Description**: Vide complètement le cache local  
**⚠️ DANGER**: Perte des données locales  
**Utilité**: Reset complet local  
**Usage**: Tests, réinitialisation

### 18. Nettoyage Complet
**Description**: Combine suppression locale + serveur  
**⚠️ DANGER**: Reset total de toutes les données  
**Utilité**: Remise à zéro complète  
**Usage**: Reset de développement

### 19. Arrêt d'Urgence
**Description**: Bloque immédiatement toutes les synchronisations  
**Résultat**: Aucune opération Strapi n'est exécutée  
**Utilité**: Stopper les opérations en cas de problème  
**Usage**: Urgence, debug

### 20. Débloquer Sync
**Description**: Réactive les synchronisations après un arrêt  
**Résultat**: Les opérations Strapi redeviennent possibles  
**Utilité**: Reprendre après un arrêt d'urgence  
**Usage**: Reprise normale

---

## 🚀 Boutons TURBO (À supprimer - Doublons)

### ⚠️ Boutons Dupliqués dans l'Onglet Contacts
Ces boutons existent déjà dans le Profile Screen et créent de la confusion:

- **TURBO Actualisation**: Doublon de "Actualiser Données"
- **TURBO Arrêt d'Urgence**: Doublon de "Arrêt d'Urgence"  
- **TURBO Reset**: Doublon des boutons de nettoyage

**Action requise**: Supprimer ces doublons pour éviter la confusion.

---

## 📋 Workflows Recommandés

### 🔄 Workflow Initial (Nouveau Utilisateur)
1. Scanner Contacts Téléphone
2. Importer Tous les Contacts
3. Synchroniser avec Strapi
4. Détecter Utilisateurs Bob

### 🔧 Workflow Debug Sync
1. Test API Contacts Strapi v5
2. Voir Debug Contacts
3. Resync depuis Strapi
4. Stats Temps Réel

### 🧹 Workflow Reset Développement
1. Arrêt d'Urgence
2. Nettoyage Complet
3. Débloquer Sync
4. Workflow Initial

### 🚨 Workflow Urgence
1. Arrêt d'Urgence (immédiat)
2. Voir Debug Contacts (diagnostic)
3. Décision: Débloquer Sync OU Reset

---

## ⚡ Codes Couleur des Boutons

- 🟢 **Vert**: Opérations sûres (scan, stats, debug)
- 🟡 **Jaune**: Opérations de sync (modifient données)
- 🔴 **Rouge**: Opérations dangereuses (suppression, reset)
- 🟣 **Violet**: Tests et diagnostics

---

## 📞 Support

Pour toute question sur l'utilisation des boutons de test:
1. Vérifier cette documentation
2. Consulter les logs dans la console
3. Utiliser "Voir Debug Contacts" pour diagnostic
4. Contacter l'équipe technique avec les détails

---

*Documentation mise à jour: Août 2025*  
*Version: 1.0 - Strapi v5 Compatible*