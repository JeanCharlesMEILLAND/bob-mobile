# 🔄 BOB ECOSYSTEM - FLOWS & CONNECTIONS

## 🎯 ARCHITECTURE DES CONNEXIONS

### 📥 "Demandes et Actions" - HUB CENTRAL
```typescript
interface RequestsHub {
  // 3 SOURCES DE DEMANDES
  directRequests: DirectBobRequest[]     // Pierre → moi : "Prête-moi ta perceuse"
  eventInvitations: EventInvitation[]    // Marie → moi : "Viens week-end Cracovie" 
  eventNeeds: EventNeedRequest[]         // Événement → moi : "Besoin enceintes pour Zaky"
}
```

### ⚡ HANDLERS DE MIGRATION
```typescript
class RequestFlowService {
  
  // ACCEPTER DEMANDE DIRECTE
  acceptDirectRequest(requestId: string) {
    const request = getDirectRequest(requestId)
    // Supprimer de "Demandes et Actions"
    removeFromPendingRequests(requestId)
    // Créer BOB actif
    createActiveBob({
      type: 'individual',
      item: request.item,
      borrower: request.requester,
      lender: currentUser
    })
    // Ajouter à "Vos Bob en cours"
    addToActiveBobs(newBob)
  }

  // ACCEPTER INVITATION ÉVÉNEMENT  
  acceptEventInvitation(invitationId: string) {
    const invitation = getEventInvitation(invitationId)
    // Supprimer de "Demandes et Actions"
    removeFromPendingRequests(invitationId)
    // Ajouter à "Mes Événements"
    addToMyEvents({
      event: invitation.event,
      status: 'participating',
      joinedAt: new Date()
    })
    // Rafraîchir section "🎉 Événements"
    refreshEventsSection()
  }

  // SE POSITIONNER SUR BESOIN ÉVÉNEMENT
  acceptEventNeed(eventId: string, needId: string) {
    const eventNeed = getEventNeed(eventId, needId)
    // Supprimer de "Demandes et Actions"  
    removeFromPendingRequests(needId)
    // Créer BOB automatiquement
    createActiveBob({
      type: 'event_related',
      item: eventNeed.item,
      borrower: eventNeed.event,
      lender: currentUser,
      eventContext: eventId
    })
    // Ajouter à "Vos Bob en cours"
    addToActiveBobs(newBob)
    // Marquer besoin comme "résolu" dans l'événement
    markEventNeedFulfilled(eventId, needId, currentUser)
  }
}
```

### 🎪 CRÉATION DE BOB - 3 CHEMINS
```typescript
class BobCreationService {
  
  // 1. BOB INDIVIDUEL DIRECT (bouton "Créer un Bob")
  createIndividualBob(data: BobCreationData) {
    const bob = new Bob({
      type: 'individual',
      creator: currentUser,
      ...data
    })
    
    // Notifier le réseau
    notifyNetwork(bob, 'new_bob_available')
    
    // Apparaît dans "Demandes et Actions" des contacts
    contacts.forEach(contact => {
      addToPendingRequests(contact.id, {
        type: 'individual_direct',
        bob: bob,
        from: currentUser
      })
    })
  }

  // 2. ÉVÉNEMENT (bouton "Créer un événement")
  createEvent(eventData: EventCreationData) {
    const event = new Event({
      creator: currentUser,
      needs: eventData.needs, // Besoins de l'événement
      ...eventData
    })
    
    // Inviter les participants
    eventData.invitees.forEach(user => {
      addToPendingRequests(user.id, {
        type: 'event_invitation',
        event: event,
        from: currentUser
      })
    })
    
    // Si événement a des besoins
    event.needs.forEach(need => {
      // Notifier participants potentiels
      notifyNetwork(need, 'event_need_available')
    })
  }

  // 3. POSITIONNEMENT SUR BESOIN EXISTANT
  positionOnEventNeed(eventId: string, needId: string) {
    // Utilise le même flow que acceptEventNeed()
    return acceptEventNeed(eventId, needId)
  }
}
```

---

## 🎯 ÉTAT DYNAMIQUE DES SECTIONS

### 📊 SECTION STATES
```typescript
interface HomeScreenSections {
  demandesActions: {
    directRequests: DirectBobRequest[]
    eventInvitations: EventInvitation[]  
    eventNeeds: EventNeedRequest[]
    count: number // Badge notification
  }
  
  evenements: {
    participating: Event[]
    canParticipate: Event[]
    needs: EventNeed[] // Besoins des événements où je participe
  }
  
  bobsEnCours: {
    lending: ActiveBob[]      // Ce que je prête
    borrowing: ActiveBob[]    // Ce que j'emprunte
    services: ActiveBob[]     // Services en cours
  }
}
```

---

## 🔄 REFRESH LOGIC

### ⚡ SYNCHRONISATION TEMPS RÉEL
```typescript
class HomeScreenRefreshService {
  
  async refreshAllSections() {
    // 1. Récupérer nouvelles demandes réseau
    const networkRequests = await fetchNetworkRequests()
    
    // 2. Mettre à jour "Demandes et Actions"
    updateDemandesActions(networkRequests)
    
    // 3. Récupérer mes événements actifs  
    const myEvents = await fetchMyEvents()
    updateEvenementsSection(myEvents)
    
    // 4. Récupérer mes BOB actifs
    const activeBobs = await fetchActiveBobs()
    updateBobsEnCoursSection(activeBobs)
    
    // 5. Calculer nouveaux points Bobiz
    const newStats = await calculateBobizStats()
    updateHeaderStats(newStats)
  }
}
```

---

## 🎪 EXEMPLE FLOW COMPLET

### 👤 USER STORY : Thomas accepte tout !
```
ÉTAT INITIAL - "Demandes et Actions" (3 items) :
├── 📞 Pierre demande perceuse (direct)
├── 🎉 Marie invite week-end Cracovie (événement)  
└── 🎂 Événement Zaky cherche enceintes (besoin)

ACTION 1 : Thomas accepte demande Pierre
├── ❌ Disparaît de "Demandes et Actions"
└── ✅ Apparaît dans "Vos Bob en cours" → "Perceuse → Pierre"

ACTION 2 : Thomas accepte invitation Marie  
├── ❌ Disparaît de "Demandes et Actions"
└── ✅ Apparaît dans "🎉 Événements" → "Week-end Cracovie"

ACTION 3 : Thomas se positionne enceintes Zaky
├── ❌ Disparaît de "Demandes et Actions"  
├── ✅ Apparaît dans "Vos Bob en cours" → "Enceintes → Zaky"
└── ✅ Reste dans "🎉 Événements" → "Anniversaire Zaky (participant + prêteur)"

RÉSULTAT FINAL :
├── "Demandes et Actions" → VIDE (0 items)
├── "🎉 Événements" → 2 événements (Cracovie + Zaky)  
└── "Vos Bob en cours" → 2 BOB actifs (Perceuse + Enceintes)
```

---

**Date** : 2025-08-29  
**État** : Architecture documentée - Prêt pour implémentation