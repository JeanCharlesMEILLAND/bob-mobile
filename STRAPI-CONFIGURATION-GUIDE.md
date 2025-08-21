# 🎛️ Guide Configuration Strapi Admin - Écosystème Bob Complet

**URL Admin :** http://46.202.153.43:1337/admin

---

## 🚀 Plan d'action

1. **[PRIORITÉ 1]** Étendre les collections existantes
2. **[PRIORITÉ 2]** Créer les nouvelles collections essentielles  
3. **[PRIORITÉ 3]** Configurer les relations
4. **[PRIORITÉ 4]** Permissions et sécurité

---

## 📊 PRIORITÉ 1 : Étendre les collections existantes

### 1.1 Collection **Users** (User Profile Extended)

**Accès :** Content Manager → User → Configurer la vue → Ajouter des champs

**Champs à ajouter :**

```
📋 PROFIL BOBER
┣━ prenom (Text, Required)
┣━ nom (Text, Required) 
┣━ telephone (Text, Unique)
┣━ dateNaissance (Date)
┣━ avatar (Media - Single)
┣━ bio (Rich Text)

📍 GÉOLOCALISATION  
┣━ adresse (Text)
┣━ ville (Text)
┣━ codePostal (Text)
┣━ latitude (Number - Decimal)
┣━ longitude (Number - Decimal)
┣━ rayonAction (Number - Integer, Default: 10)

💰 ÉCONOMIE BOB
┣━ bobizPoints (Number - Integer, Default: 0)
┣━ bobizGagnes (Number - Integer, Default: 0)
┣━ bobizDepenses (Number - Integer, Default: 0)
┣━ niveau (Enumeration: debutant|ami_fidele|super_bob|legende, Default: debutant)

📊 STATISTIQUES
┣━ nombreBobsCrees (Number - Integer, Default: 0)
┣━ nombreBobsTermines (Number - Integer, Default: 0)
┣━ tauxSucces (Number - Decimal, Default: 0)
┣━ noteGlobale (Number - Decimal, Min: 1, Max: 5)
┣━ nombreEvaluations (Number - Integer, Default: 0)

⚙️ PRÉFÉRENCES
┣━ notifications (JSON)
┣━ confidentialite (JSON)
┣━ languePreferee (Text, Default: "fr")
┣━ themeApp (Enumeration: light|dark|auto, Default: auto)

🔐 MÉTADONNÉES
┣━ dernierConnexion (DateTime)
┣━ compteVerifie (Boolean, Default: false)
┣━ telephoneVerifie (Boolean, Default: false)
┗━ emailVerifie (Boolean, Default: false)
```

---

### 1.2 Collection **Echanges** (Extension complète des Bobs)

**Accès :** Content Manager → Echange → Configurer la vue

**Champs à ajouter :**

```
🏷️ CATÉGORISATION
┣━ urgence (Enumeration: basse|normale|haute, Default: normale)
┣━ mots_cles (Text) // Tags séparés par virgules temporairement

📍 GÉOLOCALISATION AVANCÉE
┣━ ville (Text)
┣━ rayonAcceptable (Number - Integer, Default: 10)
┣━ livraisonPossible (Boolean, Default: false)

💰 ÉCONOMIE AVANCÉE  
┣━ bobizProposed (Number - Integer)
┣━ negociable (Boolean, Default: true)

📅 DATES DÉTAILLÉES
┣━ dateRenduPrevu (DateTime)
┣━ dateRenduReel (DateTime)

👥 INTERACTION SOCIALE
┣━ vues (Number - Integer, Default: 0)
┣━ interessesCount (Number - Integer, Default: 0)
┣━ partages (Number - Integer, Default: 0)
┣━ signalements (Number - Integer, Default: 0)

💬 CHAT  
┣━ chatActif (Boolean, Default: true)
┣━ messagesCount (Number - Integer, Default: 0)
┣━ dernierMessage (DateTime)

📱 MÉTADONNÉES
┣━ flexibiliteHoraire (Boolean, Default: true)
┣━ sourceCreation (Enumeration: app|web|api, Default: app)
┣━ versionApp (Text)
┗━ metadata (JSON)
```

---

### 1.3 Collection **Contacts** (Extension réseau social)

**Accès :** Content Manager → Contact → Configurer la vue

**Champs à ajouter :**

```
👤 INFORMATIONS DÉTAILLÉES
┣━ nom (Text, Required)
┣━ prenom (Text)
┣━ telephone (Text)
┣━ email (Text)
┣━ surnom (Text)

🤝 RELATION SOCIALE
┣━ statut (Enumeration: ami|famille|collegue|voisin|autre, Default: ami)
┣━ relation (Text) // Description libre
┣━ confiance (Enumeration: faible|moyenne|forte|totale, Default: moyenne)

📱 ÉTAT BOB
┣━ aBob (Boolean, Default: false)
┣━ dateInvitation (DateTime)
┣━ invitationAcceptee (Boolean, Default: false)
┣━ nombreInvitationsEnvoyees (Number - Integer, Default: 0)

📊 INTERACTION
┣━ nombreBobsEnsemble (Number - Integer, Default: 0)
┣━ dernierBobEnsemble (DateTime)
┣━ noteRelation (Number - Decimal, Min: 1, Max: 5)
┣━ favoris (Boolean, Default: false)

📅 HISTORIQUE
┣━ dateAjout (DateTime, Default: now)
┣━ dernierContact (DateTime)
┣━ sourceAjout (Enumeration: telephone|invitation|qr_code|autre, Default: telephone)

📝 NOTES
┣━ notes (Rich Text)
┗━ metadata (JSON)
```

---

### 1.4 Collection **Messages** (Extension chat avancé)

**Accès :** Content Manager → Message → Configurer la vue

**Champs à ajouter :**

```
💬 TYPE DE MESSAGE
┣━ type (Enumeration: texte|image|video|audio|fichier|systeme|action, Default: texte)

📖 ÉTAT MESSAGE
┣━ lu (Boolean, Default: false)
┣━ dateLu (DateTime)
┣━ supprime (Boolean, Default: false)
┣━ edite (Boolean, Default: false)
┣━ dateEdition (DateTime)

🎬 CONTENU RICHE
┣━ media (Media - Single)
┣━ metadataMessage (JSON)

⚙️ MESSAGES SYSTÈME
┣━ actionType (Enumeration: bob_accepte|bob_refuse|bob_termine|reminder|autre)
┣━ actionData (JSON)

🧵 RÉPONSES/THREAD
┣━ repondA (Relation - Message, Single)

📱 MÉTADONNÉES
┗━ version (Text, Default: "1.0")
```

---

## 📊 PRIORITÉ 2 : Créer les nouvelles collections

### 2.1 Collection **Categories**

**Créer :** Content-Type Builder → Create new collection type → "categories"

```
📁 CATÉGORIE BASE
┣━ nom (Text, Required, Unique)
┣━ description (Rich Text)
┣━ icone (Text) // Emoji ou nom icône
┣━ couleur (Text) // Code couleur hex

🌳 HIÉRARCHIE
┣━ parent (Relation - Categories, Single)
┣━ niveau (Number - Integer, Default: 0)
┣━ ordre (Number - Integer)

✅ ÉTAT
┣━ active (Boolean, Default: true)
┣━ populaire (Boolean, Default: false)

📊 STATISTIQUES
┣━ nombreBobs (Number - Integer, Default: 0)
┣━ dernierBob (DateTime)

🔍 RECHERCHE
┣━ mots_cles (Text)
┗━ metadata (JSON)
```

**Données de test à créer :**
```
1. Bricolage - 🔨 - #3B82F6 - Outils et matériel de bricolage
2. Jardinage - 🌱 - #10B981 - Plantes, outils de jardin, conseils
3. Électroménager - 🏠 - #8B5CF6 - Appareils électroménagers
4. Transport - 🚗 - #F59E0B - Véhicules, covoiturage
5. Services - 🤝 - #EF4444 - Aide, services entre voisins
```

---

### 2.2 Collection **Tags**

**Créer :** Content-Type Builder → "tags"

```
🏷️ TAG BASE
┣━ nom (Text, Required, Unique)
┣━ description (Text)
┣━ couleur (Text)

📊 USAGE
┣━ nombreUtilisations (Number - Integer, Default: 0)
┣━ populaire (Boolean, Default: false)

👤 CRÉATEUR
┣━ creePar (Relation - User, Single)

📅 MÉTADONNÉES
┗━ metadata (JSON)
```

**Tags de test :**
```
urgent, weekend, gratuit, échange, professionnel, débutant, expert, local, livraison
```

---

### 2.3 Collection **Transactions**

**Créer :** Content-Type Builder → "transactions"

```
💰 TRANSACTION BASE
┣━ montant (Number - Integer, Required)
┣━ type (Enumeration: gain|depense|bonus|penalite|transfert, Required)
┣━ statut (Enumeration: en_attente|validee|annulee|echouee, Default: en_attente)

💳 ORIGINE
┣━ source (Enumeration: bob_termine|bonus_fidelite|parrainage|achat|penalite|autre)
┣━ description (Text, Required)

✅ VALIDATION
┣━ dateValidation (DateTime)
┣━ automatique (Boolean, Default: true)

🔗 RÉFÉRENCES
┣━ referenceExterne (Text)
┗━ metadata (JSON)
```

---

### 2.4 Collection **Evaluations**

**Créer :** Content-Type Builder → "evaluations"

```
⭐ ÉVALUATION BASE
┣━ note (Number - Integer, Required, Min: 1, Max: 5)
┣━ commentaire (Rich Text)
┣━ type (Enumeration: bob|utilisateur|service, Default: bob)

📊 CRITÈRES DÉTAILLÉS
┣━ ponctualite (Number - Integer, Min: 1, Max: 5)
┣━ communication (Number - Integer, Min: 1, Max: 5)
┣━ qualiteService (Number - Integer, Min: 1, Max: 5)
┣━ confiance (Number - Integer, Min: 1, Max: 5)
┣━ recommande (Boolean, Default: true)

🔐 VISIBILITÉ
┣━ publique (Boolean, Default: true)
┣━ signale (Boolean, Default: false)
┣━ utile (Number - Integer, Default: 0)

📱 MÉTADONNÉES
┗━ metadata (JSON)
```

---

### 2.5 Collection **Notifications**

**Créer :** Content-Type Builder → "notifications"

```
🔔 NOTIFICATION BASE
┣━ titre (Text, Required)
┣━ message (Rich Text, Required)
┣━ type (Enumeration: bob|message|transaction|evaluation|systeme, Required)

📖 ÉTAT
┣━ lue (Boolean, Default: false)
┣━ dateLue (DateTime)
┣━ archivee (Boolean, Default: false)

⚡ ACTION
┣━ actionRequise (Boolean, Default: false)
┣━ actionType (Text)
┣━ actionData (JSON)
┣━ actionUrl (Text)

📱 DELIVERY
┣━ canalEnvoi (Enumeration: app|email|sms|push, Default: app)
┣━ dateEnvoi (DateTime)
┣━ tentativesEnvoi (Number - Integer, Default: 0)

🚨 PRIORITÉ
┣━ priorite (Enumeration: basse|normale|haute|urgente, Default: normale)

📅 MÉTADONNÉES
┗━ metadata (JSON)
```

---

### 2.6 Collection **GroupesContacts**

**Créer :** Content-Type Builder → "groupes-contacts"

```
👥 GROUPE BASE
┣━ nom (Text, Required)
┣━ description (Rich Text)
┣━ icone (Text)
┣━ couleur (Text)

🏷️ TYPE
┣━ type (Enumeration: famille|amis|collegues|voisins|bricoleurs|jardiniers|autre, Default: amis)
┣━ prive (Boolean, Default: true)

📊 STATISTIQUES
┣━ nombreMembres (Number - Integer, Default: 0)
┣━ nombreBobsGroupe (Number - Integer, Default: 0)
┣━ dernierBobGroupe (DateTime)

📱 MÉTADONNÉES
┗━ metadata (JSON)
```

---

## 🔗 PRIORITÉ 3 : Configurer les relations

### 3.1 Relations **Users**

```
Users → Echanges (1:n) - Champ: "createur"
Users → Contacts (1:n) - Champ: "proprietaire"  
Users → Messages (1:n) - Champ: "expediteur"
Users → Transactions (1:n) - Champ: "utilisateur"
Users → Evaluations (1:n) - Champ: "evaluateur"
Users → Notifications (1:n) - Champ: "utilisateur"
Users → GroupesContacts (1:n) - Champ: "proprietaire"
```

### 3.2 Relations **Echanges (Bobs)**

```
Echanges → Users (n:1) - Champ: "createur"
Echanges → Users (n:n) - Champ: "contactsCibles"
Echanges → Categories (n:1) - Champ: "categorie"
Echanges → Tags (n:n) - Champ: "tags"
Echanges → Messages (1:n) - Champ: "bob"
Echanges → Evaluations (1:n) - Champ: "bob"
Echanges → Transactions (1:n) - Champ: "bob"
```

### 3.3 Relations **Messages**

```
Messages → Users (n:1) - Champ: "expediteur"
Messages → Users (n:1) - Champ: "destinataire"
Messages → Echanges (n:1) - Champ: "bob"
Messages → Messages (n:1) - Champ: "repondA"
```

### 3.4 Relations **Contacts**

```
Contacts → Users (n:1) - Champ: "proprietaire"
Contacts → Users (n:1) - Champ: "contact"
Contacts → GroupesContacts (n:n) - Champ: "groupes"
```

---

## 🔐 PRIORITÉ 4 : Permissions et rôles

### 4.1 Rôle **Authenticated** (Utilisateurs connectés)

**Users :**
- Read: Own data only
- Update: Own data only

**Echanges :**
- Create: ✅
- Read: Own + Where "contactsCibles" contains user
- Update: Own only
- Delete: Own only

**Contacts :**
- Create: ✅ 
- Read: Own only
- Update: Own only
- Delete: Own only

**Messages :**
- Create: ✅ (if participant in Bob)
- Read: Own conversations only
- Update: Own only (edit message)
- Delete: Own only

**Categories :**
- Read: ✅ (All)

**Tags :**
- Read: ✅ (All)
- Create: ✅

**Transactions :**
- Read: Own only

**Evaluations :**
- Create: ✅ (if participant in Bob)
- Read: All public evaluations
- Update: Own only

**Notifications :**
- Read: Own only
- Update: Own only (mark as read)

### 4.2 Rôle **Public**

```
Categories: Read (All)
Tags: Read (All)
Users: Read (Basic profile info only for public profiles)
```

---

## 🧪 Test de validation

Après configuration, tester avec ce script :

```bash
cd /c/BOB/bob-mobile && node strapi-collection-creator.js
```

**Résultats attendus :**
- ✅ Status 201 pour toutes les collections
- ✅ Données créées avec tous les champs
- ✅ Relations fonctionnelles

---

## 📋 Checklist finale

- [ ] Collection Users étendue avec 20+ nouveaux champs
- [ ] Collection Echanges étendue avec géolocalisation et métadonnées  
- [ ] Collection Contacts avec réseau social complet
- [ ] Collection Messages avec chat avancé
- [ ] Collection Categories créée avec hiérarchie
- [ ] Collection Tags créée
- [ ] Collection Transactions créée
- [ ] Collection Evaluations créée
- [ ] Collection Notifications créée
- [ ] Collection GroupesContacts créée
- [ ] Relations configurées entre toutes les collections
- [ ] Permissions Authenticated configurées
- [ ] Permissions Public configurées
- [ ] Test de validation passé

---

Cette configuration permettra de sauvegarder **absolument tout** ce qui se passe dans l'écosystème Bob ! 🚀