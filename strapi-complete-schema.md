# 🏗️ Architecture Strapi Complète pour l'Écosystème Bob

## 📋 Vue d'ensemble

Cette architecture permet de sauvegarder **le maximum** de données pour un écosystème Bob complet avec :
- Gestion des utilisateurs (Bobers)
- Bobs (échanges) riches avec médias et géolocalisation
- Réseau social avec contacts et groupes
- Système de messagerie temps réel
- Économie Bobiz avec transactions
- Évaluations et réputation
- Notifications personnalisées
- Catégories et tags organisés

---

## 🗂️ Collections détaillées

### 1. 👤 **Users** (Extension de la collection existante)

```json
{
  // Champs Strapi par défaut
  "id": "Number",
  "username": "String (unique)",
  "email": "String (unique)", 
  "password": "String (encrypted)",
  "confirmed": "Boolean",
  "blocked": "Boolean",
  
  // Extension profil Bober
  "prenom": "String",
  "nom": "String", 
  "telephone": "String (unique)",
  "dateNaissance": "Date",
  "avatar": "Media (single)",
  "bio": "Text",
  
  // Géolocalisation
  "adresse": "String",
  "ville": "String",
  "codePostal": "String", 
  "latitude": "Float",
  "longitude": "Float",
  "rayonAction": "Integer (km)",
  
  // Économie Bob
  "bobizPoints": "Integer (default: 0)",
  "bobizGagnes": "Integer (default: 0)", 
  "bobizDepenses": "Integer (default: 0)",
  "niveau": "Enumeration (debutant, ami_fidele, super_bob, legende)",
  
  // Statistiques
  "nombreBobsCrees": "Integer (default: 0)",
  "nombreBobsTermines": "Integer (default: 0)",
  "tauxSucces": "Float (default: 0)",
  "noteGlobale": "Float (1-5)",
  "nombreEvaluations": "Integer (default: 0)",
  
  // Préférences
  "notifications": "JSON",
  "confidentialite": "JSON", 
  "languePreferee": "String (default: fr)",
  "themeApp": "Enumeration (light, dark, auto)",
  
  // Métadonnées
  "dernierConnexion": "DateTime",
  "compteVerifie": "Boolean (default: false)",
  "telephoneVerifie": "Boolean (default: false)",
  "emailVerifie": "Boolean (default: false)",
  
  // Relations
  "contacts": "Relation (has many → Contacts)",
  "bobsCrees": "Relation (has many → Bobs)",
  "bobsParticipes": "Relation (has many → Bobs)",
  "messages": "Relation (has many → Messages)",
  "transactions": "Relation (has many → Transactions)",
  "evaluationsDonnees": "Relation (has many → Evaluations)",
  "evaluationsRecues": "Relation (has many → Evaluations)", 
  "notifications": "Relation (has many → Notifications)",
  "medias": "Relation (has many → Medias)"
}
```

---

### 2. 🔄 **Bobs** (Échanges) - Collection principale

```json
{
  // Informations de base
  "titre": "String (required)",
  "description": "Text (required)",
  "type": "Enumeration (pret, emprunt, service_offert, service_demande)",
  "statut": "Enumeration (en_attente, actif, en_cours, termine, annule, expire)",
  
  // Catégorisation
  "categorie": "Relation (belongs to → Categories)",
  "tags": "Relation (has many → Tags)",
  "urgence": "Enumeration (basse, normale, haute)",
  
  // Conditions d'échange
  "conditions": "Text",
  "dureeJours": "Integer",
  "dateExpiration": "DateTime",
  "flexibiliteHoraire": "Boolean (default: true)",
  
  // Géolocalisation
  "adresse": "String",
  "ville": "String", 
  "latitude": "Float",
  "longitude": "Float",
  "rayonAcceptable": "Integer (km)",
  "livraisonPossible": "Boolean (default: false)",
  
  // Économie
  "bobizGagnes": "Integer (default: 10)",
  "bobizProposed": "Integer",
  "negociable": "Boolean (default: true)",
  
  // Dates importantes
  "dateDebut": "DateTime",
  "dateFin": "DateTime", 
  "dateRenduPrevu": "DateTime",
  "dateRenduReel": "DateTime",
  
  // Participants
  "createur": "Relation (belongs to → Users)",
  "contactsCibles": "Relation (has many → Users)",
  "participants": "Relation (has many → Users)", 
  "beneficiaire": "Relation (belongs to → Users)",
  
  // Contenu multimédia
  "photos": "Media (multiple)",
  "videos": "Media (multiple)", 
  "documents": "Media (multiple)",
  
  // Interaction sociale
  "vues": "Integer (default: 0)",
  "interessesCount": "Integer (default: 0)",
  "partages": "Integer (default: 0)",
  "signalements": "Integer (default: 0)",
  
  // Chat et communication
  "chatActif": "Boolean (default: true)",
  "messagesCount": "Integer (default: 0)",
  "dernierMessage": "DateTime",
  
  // Métadonnées
  "metadata": "JSON",
  "sourceCreation": "Enumeration (app, web, api)",
  "versionApp": "String",
  
  // Relations
  "messages": "Relation (has many → Messages)",
  "evaluations": "Relation (has many → Evaluations)",
  "transactions": "Relation (has many → Transactions)",
  "notifications": "Relation (has many → Notifications)"
}
```

---

### 3. 👥 **Contacts** - Réseau social

```json
{
  // Identification
  "proprietaire": "Relation (belongs to → Users)", 
  "contact": "Relation (belongs to → Users)",
  
  // Informations contact
  "nom": "String",
  "prenom": "String", 
  "telephone": "String",
  "email": "String",
  "surnom": "String",
  
  // Statut relation
  "statut": "Enumeration (ami, famille, collegue, voisin, autre)",
  "relation": "String", // Description libre
  "confiance": "Enumeration (faible, moyenne, forte, totale)",
  
  // État Bob
  "aBob": "Boolean (default: false)", 
  "dateInvitation": "DateTime",
  "invitationAcceptee": "Boolean (default: false)",
  "nombreInvitationsEnvoyees": "Integer (default: 0)",
  
  // Interaction
  "nombreBobsEnsemble": "Integer (default: 0)",
  "dernierBobEnsemble": "DateTime", 
  "noteRelation": "Float (1-5)",
  "favoris": "Boolean (default: false)",
  
  // Groupes
  "groupes": "Relation (has many → GroupesContacts)",
  
  // Historique
  "dateAjout": "DateTime",
  "dernierContact": "DateTime",
  "sourceAjout": "Enumeration (telephone, invitation, qr_code, autre)",
  
  // Métadonnées
  "notes": "Text",
  "metadata": "JSON"
}
```

---

### 4. 💬 **Messages** - Système de chat

```json
{
  // Message de base
  "contenu": "Text (required)",
  "type": "Enumeration (texte, image, video, audio, fichier, systeme, action)",
  
  // Participants
  "expediteur": "Relation (belongs to → Users)",
  "destinataire": "Relation (belongs to → Users)", 
  "bob": "Relation (belongs to → Bobs)",
  
  // État du message
  "lu": "Boolean (default: false)",
  "dateLu": "DateTime",
  "supprime": "Boolean (default: false)",
  "edite": "Boolean (default: false)",
  "dateEdition": "DateTime",
  
  // Contenu riche
  "media": "Media (single)",
  "metadataMessage": "JSON",
  
  // Message système/action
  "actionType": "Enumeration (bob_accepte, bob_refuse, bob_termine, reminder, etc.)",
  "actionData": "JSON",
  
  // Réponse/Thread
  "repondA": "Relation (belongs to → Messages)",
  "thread": "Relation (has many → Messages)",
  
  // Métadonnées
  "metadata": "JSON",
  "version": "String"
}
```

---

### 5. 💰 **Transactions** - Économie Bobiz

```json
{
  // Transaction de base
  "montant": "Integer (required)", 
  "type": "Enumeration (gain, depense, bonus, penalite, transfert)",
  "statut": "Enumeration (en_attente, validee, annulee, echouee)",
  
  // Participants
  "utilisateur": "Relation (belongs to → Users)",
  "destinataire": "Relation (belongs to → Users)", // Pour transferts
  
  // Origine
  "bob": "Relation (belongs to → Bobs)",
  "source": "Enumeration (bob_termine, bonus_fidelite, parrainage, achat, etc.)",
  "description": "String",
  
  // Validation
  "dateValidation": "DateTime",
  "validePar": "Relation (belongs to → Users)",
  "automatique": "Boolean (default: true)",
  
  // Métadonnées
  "metadata": "JSON",
  "referenceExterne": "String"
}
```

---

### 6. ⭐ **Evaluations** - Système de notation

```json
{
  // Évaluation de base
  "note": "Integer (1-5, required)",
  "commentaire": "Text",
  "type": "Enumeration (bob, utilisateur, service)",
  
  // Participants
  "evaluateur": "Relation (belongs to → Users)",
  "evalue": "Relation (belongs to → Users)",
  "bob": "Relation (belongs to → Bobs)",
  
  // Critères détaillés
  "ponctualite": "Integer (1-5)",
  "communication": "Integer (1-5)", 
  "qualiteService": "Integer (1-5)",
  "confiance": "Integer (1-5)",
  "recommande": "Boolean",
  
  // Métadonnées
  "publique": "Boolean (default: true)",
  "signale": "Boolean (default: false)",
  "utile": "Integer (default: 0)", // Votes utilité
  "metadata": "JSON"
}
```

---

### 7. 🔔 **Notifications** - Système d'alertes

```json
{
  // Notification de base
  "titre": "String (required)",
  "message": "Text (required)",
  "type": "Enumeration (bob, message, transaction, evaluation, systeme)",
  
  // Destinataire
  "utilisateur": "Relation (belongs to → Users)",
  
  // État
  "lue": "Boolean (default: false)",
  "dateLue": "DateTime", 
  "archivee": "Boolean (default: false)",
  
  // Action
  "actionRequise": "Boolean (default: false)",
  "actionType": "String",
  "actionData": "JSON",
  "actionUrl": "String",
  
  // Origine
  "bob": "Relation (belongs to → Bobs)",
  "expediteur": "Relation (belongs to → Users)",
  
  // Delivery
  "canalEnvoi": "Enumeration (app, email, sms, push)",
  "dateEnvoi": "DateTime",
  "tentativesEnvoi": "Integer (default: 0)",
  
  // Métadonnées
  "metadata": "JSON",
  "priorite": "Enumeration (basse, normale, haute, urgente)"
}
```

---

### 8. 🏷️ **Categories** - Organisation du contenu

```json
{
  // Catégorie de base
  "nom": "String (required)",
  "description": "Text",
  "icone": "String", // Emoji ou nom icône
  "couleur": "String", // Code couleur hex
  
  // Hiérarchie
  "parent": "Relation (belongs to → Categories)",
  "enfants": "Relation (has many → Categories)",
  "niveau": "Integer (default: 0)",
  "ordre": "Integer",
  
  // État
  "active": "Boolean (default: true)",
  "populaire": "Boolean (default: false)",
  
  // Statistiques
  "nombreBobs": "Integer (default: 0)",
  "dernierBob": "DateTime",
  
  // Métadonnées
  "metadata": "JSON",
  "mots_cles": "Text" // Pour recherche
}
```

---

### 9. 🏷️ **Tags** - Étiquetage libre

```json
{
  // Tag de base
  "nom": "String (required, unique)",
  "description": "Text",
  "couleur": "String",
  
  // Usage
  "nombreUtilisations": "Integer (default: 0)",
  "creePar": "Relation (belongs to → Users)",
  "populaire": "Boolean (default: false)",
  
  // Relations
  "bobs": "Relation (has many → Bobs)",
  
  // Métadonnées
  "metadata": "JSON"
}
```

---

### 10. 📁 **Medias** - Gestion fichiers

```json
{
  // Fichier de base (extension de Media Strapi)
  "nom": "String",
  "description": "Text",
  "type": "Enumeration (image, video, audio, document)",
  "taille": "Integer", // bytes
  "format": "String", // jpg, mp4, etc.
  
  // Origine
  "proprietaire": "Relation (belongs to → Users)",
  "bob": "Relation (belongs to → Bobs)",
  "message": "Relation (belongs to → Messages)",
  
  // Traitement
  "redimensionne": "Boolean (default: false)",
  "optimise": "Boolean (default: false)",
  "vignette": "Media (single)",
  
  // Sécurité
  "prive": "Boolean (default: false)",
  "expire": "DateTime",
  "telechargements": "Integer (default: 0)",
  
  // Métadonnées
  "metadata": "JSON",
  "gps": "JSON", // Coordonnées GPS si photo
  "exif": "JSON" // Données EXIF si applicable
}
```

---

### 11. 👥 **GroupesContacts** - Organisation des contacts

```json
{
  // Groupe de base
  "nom": "String (required)",
  "description": "Text",
  "icone": "String",
  "couleur": "String",
  
  // Propriétaire
  "proprietaire": "Relation (belongs to → Users)",
  
  // Membres
  "contacts": "Relation (has many → Contacts)",
  "nombreMembres": "Integer (default: 0)",
  
  // Type de groupe
  "type": "Enumeration (famille, amis, collegues, voisins, bricoleurs, jardiniers, etc.)",
  "prive": "Boolean (default: true)",
  
  // Statistiques
  "nombreBobsGroupe": "Integer (default: 0)",
  "dernierBobGroupe": "DateTime",
  
  // Métadonnées
  "metadata": "JSON"
}
```

---

## 🔗 Relations principales

```
Users 1:n Bobs (créateur)
Users n:n Bobs (participants)
Users 1:n Contacts (propriétaire)
Users 1:n Messages (expéditeur)
Users 1:n Transactions
Users 1:n Evaluations (évaluateur/évalué)
Users 1:n Notifications

Bobs 1:n Messages
Bobs 1:n Evaluations  
Bobs 1:n Transactions
Bobs n:1 Categories
Bobs n:n Tags
Bobs 1:n Medias

Categories 1:n Categories (parent/enfant)
Categories 1:n Bobs

Contacts n:n GroupesContacts
```

---

## 🛡️ Permissions et Rôles

### Rôles utilisateurs :
- **Public** : Lecture seule des catégories publiques
- **Authenticated** : CRUD sur ses propres données
- **Moderator** : Modération des contenus
- **Admin** : Accès complet

### Permissions spécifiques :
- Utilisateurs peuvent seulement voir leurs contacts
- Messages privés entre participants Bob
- Transactions visibles par les parties concernées
- Evaluations publiques mais modérables

---

Cette architecture permet de sauvegarder **absolument tout** ce qui se passe dans l'écosystème Bob, avec une traçabilité complète et des possibilités d'analyse avancées.