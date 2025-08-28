# Scénarios de Test - Événements Bob

## Vue d'ensemble

Ce document présente les scénarios de test complets pour valider tous les parcours utilisateur des événements Bob. Chaque scénario peut être exécuté manuellement ou automatisé.

## Table des matières

1. [Tests Organisateur](#tests-organisateur)
2. [Tests Participant Existant](#tests-participant-existant)
3. [Tests Nouvel Utilisateur](#tests-nouvel-utilisateur)
4. [Tests Chat Collectif](#tests-chat-collectif)
5. [Tests Edge Cases](#tests-edge-cases)
6. [Tests Performance](#tests-performance)

---

## Tests Organisateur

### TEST-ORG-001 : Création d'événement complète

**Objectif :** Valider la création d'un événement de A à Z

**Préconditions :**
- Utilisateur Bob connecté
- Au moins 10 contacts dans le répertoire (5 avec Bob, 5 sans Bob)

**Étapes :**
1. Ouvrir HomeScreen
2. Cliquer "Créer un événement"
3. Remplir les informations :
   - Titre : "Barbecue de quartier"
   - Description : "BBQ convivial entre voisins avec jeux pour les enfants"
   - Date début : Samedi prochain 14h
   - Date fin : Samedi prochain 18h
   - Lieu : "Parc des Buttes Chaumont, Paris"
4. Ajouter une photo d'événement
5. Ajouter 3 besoins différents :
   - Objet : "Barbecue portable" (quantité 1, flexible)
   - Service individuel : "Apporter des boissons"
   - Service collectif : "Aide installation" (max 3 personnes)
6. Se positionner sur le besoin "Aide installation"
7. Sélectionner ciblage "Groupes spécifiques"
8. Choisir groupes "Voisins" et "Famille"
9. Prévisualiser les destinataires
10. Confirmer création
11. Naviguer vers écran d'invitations
12. Sélectionner 8 contacts (4 Bob + 4 non-Bob)
13. Confirmer envoi d'invitations

**Résultats attendus :**
- ✅ Événement créé avec succès
- ✅ 3 besoins sauvegardés correctement
- ✅ Organisateur positionné sur "Aide installation"
- ✅ 4 notifications push envoyées
- ✅ 4 SMS envoyés
- ✅ Message de confirmation avec statistiques
- ✅ Navigation retour vers HomeScreen

**Critères d'acceptation :**
- Toutes les données sont persistées en base
- Les invitations sont trackées individuellement
- Les erreurs d'envoi sont gérées gracieusement

---

### TEST-ORG-002 : Gestion des besoins avancée

**Objectif :** Tester les fonctionnalités avancées des besoins

**Étapes :**
1. Créer un événement "Déménagement collectif"
2. Ajouter 5 types de besoins :
   - Objet flexible : "Cartons" (10 demandés, min 5, max 20)
   - Objet fixe : "Camionnette" (1 exactement)
   - Service timing : "Démontage mobilier" (avant événement)
   - Service collectif : "Portage" (max 6 personnes)
   - Service individuel : "Ménage final"
3. Définir dates de remise spécifiques
4. Sauvegarder l'événement

**Résultats attendus :**
- ✅ Quantités flexibles correctement enregistrées
- ✅ Contraintes de timing respectées
- ✅ Services collectifs avec limites
- ✅ Dates de remise sauvegardées

---

## Tests Participant Existant

### TEST-PART-001 : Réception et acceptation d'invitation

**Objectif :** Valider le parcours complet d'un participant Bob

**Préconditions :**
- Utilisateur Bob connecté (différent de l'organisateur)
- Invitation reçue pour un événement

**Étapes :**
1. Recevoir notification push "Marie vous invite à Barbecue de quartier"
2. Taper sur la notification
3. Observer l'écran EventDetailScreen
4. Vérifier les informations affichées :
   - Photo de l'événement
   - Titre, description, date, lieu
   - Organisateur
   - Liste des besoins
   - Statut de chaque besoin
5. Cliquer "Participer" ou équivalent
6. Confirmer la participation

**Résultats attendus :**
- ✅ Notification reçue et cliquable
- ✅ Détails événement complets affichés
- ✅ Invitation marquée comme "vue"
- ✅ Statut changé vers "accepté"
- ✅ Chat de groupe activé
- ✅ Organisateur notifié

---

### TEST-PART-002 : Positionnement sur besoins

**Objectif :** Valider le positionnement sur différents types de besoins

**Préconditions :**
- Participant ayant accepté un événement
- Événement avec besoins ouverts

**Étapes :**
1. Ouvrir détails de l'événement
2. Naviguer vers la section "Besoins"
3. Identifier un besoin ouvert "Apporter des chaises"
4. Cliquer "Je peux aider"
5. Si quantité demandée, ajuster si flexible
6. Confirmer le positionnement
7. Vérifier la création du BOB individuel
8. Répéter pour un service collectif

**Résultats attendus :**
- ✅ Bouton "Je peux aider" visible uniquement pour besoins ouverts
- ✅ Gestion quantités flexible correcte
- ✅ BOB individuel créé automatiquement
- ✅ Notification dans le chat de groupe
- ✅ Besoin marqué "partiellement_comblé"
- ✅ Participant ne peut plus se positionner sur le même besoin

---

## Tests Nouvel Utilisateur

### TEST-NEW-001 : Installation via invitation SMS

**Objectif :** Valider le parcours complet nouveau utilisateur via SMS

**Préconditions :**
- Numéro de téléphone non inscrit à Bob
- Invitation SMS envoyée à ce numéro

**Étapes :**
1. Simuler réception SMS d'invitation :
   ```
   🎉 Marie t'invite à "Barbecue de quartier"
   📅 Samedi 15 juin à 14h
   📍 Parc des Buttes Chaumont
   
   💫 Télécharge Bob pour répondre :
   📱 iOS: [lien] | Android: [lien]
   🔑 Code: EVT-ABC123
   ```

2. Cliquer sur le lien de téléchargement
3. Installer l'application Bob
4. Premier lancement de l'application
5. Suivre l'onboarding (si présent)
6. S'inscrire avec le numéro ayant reçu l'invitation
7. Observer la HomeScreen

**Résultats attendus :**
- ✅ Invitation automatiquement détectée
- ✅ EventInvitationCard affichée prominente
- ✅ Message "Marie vous invite..." visible
- ✅ Possibilité d'accepter/décliner directement
- ✅ Accès aux détails de l'événement

---

### TEST-NEW-002 : Onboarding avec code événement

**Objectif :** Tester la saisie manuelle du code événement

**Étapes :**
1. Installer Bob (nouvel utilisateur)
2. Lancer l'application
3. Commencer l'inscription
4. Dans l'écran onboarding, chercher "Code événement"
5. Saisir "EVT-ABC123"
6. Continuer l'inscription
7. Finaliser avec le bon numéro de téléphone

**Résultats attendus :**
- ✅ Champ code événement accessible
- ✅ Validation du code en temps réel
- ✅ Association automatique à l'inscription
- ✅ Invitation visible immédiatement après inscription

---

### TEST-NEW-003 : Première participation complète

**Objectif :** Nouveau utilisateur participe à son premier événement

**Préconditions :**
- Nouveau compte créé via invitation

**Étapes :**
1. Accepter l'invitation depuis HomeScreen
2. Explorer les détails de l'événement
3. Se positionner sur un besoin simple
4. Accéder au chat de groupe
5. Envoyer un premier message
6. Explorer les autres fonctionnalités Bob

**Résultats attendus :**
- ✅ Acceptation d'invitation réussie
- ✅ Positionnement sur besoin OK
- ✅ BOB individuel créé
- ✅ Accès au chat collectif
- ✅ Message envoyé avec succès
- ✅ Découverte naturelle de Bob

---

## Tests Chat Collectif

### TEST-CHAT-001 : Création automatique

**Objectif :** Valider la création automatique du chat

**Préconditions :**
- Événement créé avec organisateur
- Aucun participant encore accepté

**Étapes :**
1. Premier participant accepte l'invitation
2. Observer la création du chat de groupe
3. Vérifier le message de bienvenue automatique
4. Deuxième participant accepte
5. Observer son ajout automatique au chat
6. Troisième participant accepte
7. Vérifier que tous reçoivent les notifications

**Résultats attendus :**
- ✅ Chat créé à la première acceptation
- ✅ Message de bienvenue automatique envoyé
- ✅ Nouveaux participants ajoutés automatiquement
- ✅ Messages d'arrivée automatiques
- ✅ Notifications push pour tous les membres

---

### TEST-CHAT-002 : Messages automatiques d'événements

**Objectif :** Tester tous les types de messages automatiques

**Étapes :**
1. Créer un événement avec chat
2. Déclencher différents événements :
   - Nouveau participant
   - Positionnement sur besoin
   - Besoin complètement comblé
   - Rappel 24h avant événement
   - Début de l'événement
3. Observer les messages automatiques

**Résultats attendus :**
- ✅ Message nouveau participant : "👋 Thomas a rejoint l'événement !"
- ✅ Message positionnement : "🎯 Sophie s'est positionnée sur 'Apporter des chaises' !"
- ✅ Message besoin comblé : "✅ Le besoin 'Barbecue portable' est maintenant complet !"
- ✅ Message rappel : "⏰ Plus que 24h avant 'Barbecue de quartier' !"
- ✅ Tous les messages sont horodatés et formatés

---

## Tests Edge Cases

### TEST-EDGE-001 : Gestion des erreurs d'envoi

**Objectif :** Tester la robustesse face aux erreurs

**Étapes :**
1. Créer un événement
2. Sélectionner des contacts avec numéros invalides
3. Simuler une panne du service SMS
4. Observer la gestion des erreurs
5. Réessayer l'envoi

**Résultats attendus :**
- ✅ Erreurs d'envoi correctement identifiées
- ✅ Messages d'erreur explicites
- ✅ Possibilité de réessayer
- ✅ Invitations partiellement réussies sauvegardées

---

### TEST-EDGE-002 : Événement complet

**Objectif :** Comportement quand tous les besoins sont comblés

**Étapes :**
1. Créer événement avec besoins limités
2. Faire accepter assez de participants pour combler tous les besoins
3. Observer le changement de statut
4. Nouveau participant tente de s'inscrire

**Résultats attendus :**
- ✅ Besoins passent en statut "complet"
- ✅ Boutons "Je peux aider" disparaissent
- ✅ Nouveaux participants peuvent encore accepter l'événement
- ✅ Message dans le chat : "Tous les besoins sont comblés !"

---

### TEST-EDGE-003 : Utilisateur bloqué/supprimé

**Objectif :** Gérer les cas de comptes supprimés

**Étapes :**
1. Créer événement avec invitations
2. Supprimer un compte participant
3. Observer le comportement du chat
4. Organiser avec compte désactivé

**Résultats attendus :**
- ✅ Messages de l'utilisateur supprimé restent visibles
- ✅ Nom affiché comme "[Utilisateur supprimé]"
- ✅ Besoins assignés restent avec nom générique
- ✅ Pas de crash applicatif

---

## Tests Performance

### TEST-PERF-001 : Gros volume d'invitations

**Objectif :** Tester l'envoi de masse d'invitations

**Préconditions :**
- 100+ contacts dans le répertoire

**Étapes :**
1. Créer un événement
2. Sélectionner 50+ contacts
3. Lancer l'envoi d'invitations
4. Observer les performances
5. Vérifier les résultats

**Critères de performance :**
- ✅ Envoi initié en < 2 secondes
- ✅ Progression visible en temps réel
- ✅ Envoi complet en < 30 secondes
- ✅ Interface reste responsive
- ✅ Résultats précis (succès/échecs)

---

### TEST-PERF-002 : Chat avec nombreux participants

**Objectif :** Performance du chat collectif

**Étapes :**
1. Événement avec 20+ participants
2. Chat collectif très actif (50+ messages)
3. Nouveaux messages en temps réel
4. Scroll dans l'historique

**Critères de performance :**
- ✅ Messages affichés instantanément
- ✅ Scroll fluide même avec 100+ messages
- ✅ Notifications push rapides (< 5 secondes)
- ✅ Pas de doublons ou messages perdus

---

## Scripts de test automatisés

### Test d'intégration complet

```javascript
// test/integration/event-flow.test.js
describe('Parcours événement complet', () => {
  test('Organisateur crée → Participant accepte → Chat fonctionne', async () => {
    // Créer événement
    const event = await createEvent({
      title: 'Test Event',
      needs: [{ type: 'objet', title: 'Test Need' }]
    });
    
    // Envoyer invitations
    const inviteResult = await sendInvitations(event.id, contacts);
    expect(inviteResult.success).toBeGreaterThan(0);
    
    // Simuler acceptation
    await acceptInvitation(inviteResult.invitations[0].id);
    
    // Vérifier chat créé
    const chat = await getChatForEvent(event.id);
    expect(chat).toBeDefined();
    expect(chat.participants.length).toBe(2); // Organisateur + participant
    
    // Test positionnement
    await positionOnNeed(event.needs[0].id, participant.id);
    
    // Vérifier BOB créé
    const bobs = await getBobsFromEvent(event.id);
    expect(bobs.length).toBe(1);
  });
});
```

### Test de charge

```javascript
describe('Tests de performance', () => {
  test('Envoi 100 invitations simultanées', async () => {
    const startTime = Date.now();
    
    const result = await sendBulkInvitations(event.id, generate100Contacts());
    
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // < 30 secondes
    expect(result.success).toBeGreaterThan(80); // Au moins 80% de succès
  });
});
```

---

## Checklist finale

### Fonctionnalités critiques
- [ ] Création d'événement avec tous les types de besoins
- [ ] Détection automatique des invitations pour nouveaux utilisateurs
- [ ] Envoi d'invitations multi-canaux (Push/SMS/WhatsApp)
- [ ] Positionnement sur besoins avec création BOB automatique
- [ ] Chat collectif automatique avec messages d'événements
- [ ] Gestion des erreurs et cas limites

### Parcours utilisateur
- [ ] Organisateur : création → invitations → gestion
- [ ] Participant Bob : invitation → acceptation → participation
- [ ] Nouvel utilisateur : SMS → installation → première participation
- [ ] Edge cases : erreurs, comptes supprimés, événements complets

### Performance et robustesse
- [ ] Envoi en masse d'invitations (50+ contacts)
- [ ] Chat collectif avec nombreux participants
- [ ] Gestion des pannes réseau
- [ ] Récupération après erreurs

Tous ces scénarios validés garantissent le bon fonctionnement de la fonctionnalité événements Bob dans toutes les conditions d'utilisation.