# COMPOSANTS CRITIQUES - NE PAS MODIFIER SANS ATTENTION

## ⚠️ ATTENTION DÉVELOPPEURS ⚠️

Les 3 composants suivants sont **CRITIQUES** pour l'application BOB car ils constituent les **actions principales** que les utilisateurs peuvent effectuer :

## 🎯 COMPOSANTS CRITIQUES

### 1. **Créer un BOB** (HomeScreen.tsx)
- **Localisation** : `renderMainCards()` - Première carte
- **Fonction** : Action principale de création d'un BOB (prêt, service, etc.)
- **Icône** : 🏠 + bouton "+" bleu
- **Couleur** : Dégradé bleu/vert
- **Navigation** : Vers écran de création de BOB

### 2. **Créer un événement** (HomeScreen.tsx) 
- **Localisation** : `renderMainCards()` - Deuxième carte
- **Fonction** : Action principale de création d'événements
- **Icône** : Bouton "+" bleu (sans emoji)
- **Couleur** : Dégradé rose/orange
- **Navigation** : Vers écran de création d'événement

### 3. **Section Événements complète** (HomeScreen.tsx)
- **Localisation** : `renderExchanges()` 
- **Fonction** : Affichage des événements disponibles
- **Titre** : "🎉 Événements"
- **Contenu** : 
  - Carte "Week-end à Cracovie" (🎉 badge orange)
  - Carte "Anniversaire de Zaky" (🎂 badge rose)
  - Bouton "Voir tous les événements"

## 🚨 RÈGLES STRICTES

1. **NE JAMAIS SUPPRIMER** ces composants
2. **TESTER SYSTÉMATIQUEMENT** après toute modification
3. **VALIDER LA NAVIGATION** vers les écrans de création
4. **CONSERVER LES STYLES** qui rendent ces actions visibles
5. **MAINTENIR L'ORDRE** : Créer BOB → Créer événement → Liste événements

## 📍 Localisation dans le code

```typescript
// Dans HomeScreen.tsx
const renderMainCards = () => (
  // Carte 1: Créer un BOB
  // Carte 2: Créer un événement
)

const renderExchanges = () => (
  // Section complète des événements
)
```

## 🔄 Ordre d'affichage actuel (IMPORTANT)
1. Header sticky
2. Message d'accueil (si applicable)
3. **CARTES PRINCIPALES** (Créer BOB + Créer événement)
4. Demandes et Actions
5. **SECTION ÉVÉNEMENTS** 
6. Vos Bob en cours (ex-Activités)
7. Conseils (sans titre)

---
**Date de création** : 2025-08-29  
**Dernière modification** : 2025-08-29  
**Créé par** : Claude Code Assistant