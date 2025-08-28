# 🧪 Guide de Test d'Interface BOB

## 🎯 Comment tester les différents modes

### 📱 **Étape 1 : Ouvrir la page Profil**
- Va dans l'app BOB
- Clique sur l'onglet **"Profil"** (en bas)
- Scroll jusqu'à la section **"🧪 Tests Interface"**

### 🔄 **Étape 2 : Choisir un mode de test**

#### 🆕 **Mode Nouvel Utilisateur**
1. Clique sur **"Test Nouvel Utilisateur"** 
2. Clique **"Voir maintenant"** → Tu arrives sur l'accueil
3. **Résultat** : WelcomeSection avec guide d'onboarding

#### 🎉 **Mode Utilisateur Invité**  
1. Clique sur **"Test Utilisateur Invité"**
2. Clique **"Voir maintenant"** → Tu arrives sur l'accueil
3. **Résultat** : WelcomeSection + message "Marie vous a invité !"

#### ✅ **Mode Normal (activités)**
1. Clique sur **"Mode Normal"**
2. Clique **"Voir maintenant"** → Tu arrives sur l'accueil  
3. **Résultat** : Écran classique avec activités fictives

---

## 👀 **Ce que tu vas voir**

### 🆕 **WelcomeSection (nouveaux utilisateurs)**
```
┌─────────────────────────────┐
│  👋 Bienvenue [Nom] !       │
│                            │
│  🔒 100% privé - Seuls vos │
│  contacts peuvent voir...   │
├─────────────────────────────┤
│  💡 Quelques idées          │
│  🔧 🏠 📚 🌱                 │
├─────────────────────────────┤
│  🚀 Vos premières étapes    │
│                            │
│  [👥 Ajouter contacts]      │
│  [🎯 Créer un BOB]         │  
│  [🎉 Créer événement]       │
└─────────────────────────────┘
```

### ✅ **Écran Normal**
```
┌─────────────────────────────┐
│  [Créer BOB] [Créer Event]  │
├─────────────────────────────┤
│  📥 Demandes reçues         │
│  • Marie: Besoin perceuse   │
│  • Thomas: Aide déménagement│
├─────────────────────────────┤
│  📱 Mes activités (4)       │  
│  🎮 🔧 📸 📚                 │
└─────────────────────────────┘
```

---

## 🔄 **Changer de mode rapidement**

1. **Retour au Profil** → Section "🧪 Tests Interface"  
2. **Indicateur visuel** → Mode actuel affiché en haut
3. **Switch instantané** → Chaque bouton change le mode immédiatement
4. **Navigation auto** → "Voir maintenant" = va direct à l'accueil

---

## 🧪 **Tests suggérés**

### Test 1 : **Parcours complet nouveau utilisateur**
1. Mode "Nouvel Utilisateur" 
2. Clique "Ajouter contacts" → Vérifie navigation
3. Retour → Clique "Créer un BOB" → Vérifie navigation
4. Retour → Clique "Créer événement" → Vérifie navigation

### Test 2 : **Message d'invitation**
1. Mode "Utilisateur Invité"
2. Vérifie que "Marie vous a invité !" s'affiche bien
3. Regarde si l'UI change vs nouveau utilisateur simple

### Test 3 : **Retour mode normal**
1. Mode "Normal" 
2. Vérifie que les 4 activités fictives s'affichent
3. Vérifie que les 2 demandes reçues s'affichent
4. Teste les interactions classiques

---

## 💾 **Persistance**

- ✅ **Le mode choisi reste actif** même si tu fermes/rouvres l'app
- ✅ **Stocké avec AsyncStorage** via Zustand
- ✅ **Reset possible** en mode Normal

---

## 🐛 **Si quelque chose ne marche pas**

1. **Vérifier les logs** console : `🧪 HomeScreen modes:`
2. **Forcer refresh** : tire vers le bas sur l'écran d'accueil
3. **Reset** : Mode Normal pour revenir à la base

Tu peux maintenant **tester tous les parcours utilisateur** sans créer de nouveaux comptes ! 🎉