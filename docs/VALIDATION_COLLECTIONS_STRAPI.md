# Validation Collections Strapi - Architecture Unifiée Bob

## Vue d'ensemble

Ce document valide les collections Strapi nécessaires pour supporter l'écosystème unifié Bob où **événements et BOB individuels convergent vers une même structure**.

## Collections Strapi Requises

### 1. Collection `echanges` (BOB Individuels) ✅

**Endpoint**: `/api/echanges`

#### Champs Obligatoires
```json
{
  "titre": {
    "type": "string",
    "required": true,
    "maxLength": 255
  },
  "description": {
    "type": "text", 
    "required": true
  },
  "type": {
    "type": "enumeration",
    "enum": ["pret", "emprunt", "service_offert", "service_demande"],
    "required": true
  },
  "statut": {
    "type": "enumeration", 
    "enum": ["actif", "en_cours", "termine", "annule"],
    "default": "actif"
  },
  "bobizGagnes": {
    "type": "integer",
    "default": 10,
    "min": 0
  },
  "dureeJours": {
    "type": "integer",
    "min": 1
  },
  "conditions": {
    "type": "text"
  }
}
```

#### Relations
```json
{
  "createur": {
    "type": "relation",
    "relation": "manyToOne", 
    "target": "plugin::users-permissions.user",
    "required": true
  },
  "demandeur": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "plugin::users-permissions.user"
  }
}
```

#### 🔗 **Champs Architecture Unifiée** (À AJOUTER)
```json
{
  "origine": {
    "type": "enumeration",
    "enum": ["direct", "evenement"],
    "default": "direct"
  },
  "evenement": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "api::evenement.evenement"
  },
  "metadata": {
    "type": "json",
    "default": {}
  }
}
```

### 2. Collection `evenements` ✅

**Endpoint**: `/api/evenements`

#### Champs Obligatoires
```json
{
  "titre": {
    "type": "string", 
    "required": true,
    "maxLength": 255
  },
  "description": {
    "type": "text",
    "required": true
  },
  "dateDebut": {
    "type": "datetime",
    "required": true
  },
  "dateFin": {
    "type": "datetime"
  },
  "adresse": {
    "type": "string"
  },
  "lieu": {
    "type": "json"
  },
  "maxParticipants": {
    "type": "integer",
    "default": 50
  },
  "statut": {
    "type": "enumeration",
    "enum": ["planifie", "en_cours", "termine", "annule"],
    "default": "planifie"
  },
  "bobizRecompense": {
    "type": "integer",
    "default": 15
  }
}
```

#### Relations
```json
{
  "organisateur": {
    "type": "relation",
    "relation": "manyToOne",
    "target": "plugin::users-permissions.user",
    "required": true
  },
  "participants": {
    "type": "relation", 
    "relation": "manyToMany",
    "target": "plugin::users-permissions.user"
  }
}
```

#### Métadonnées (JSON Field)
```typescript
interface EventMetadata {
  // Besoins de l'événement
  besoins: {
    id: string;
    titre: string;
    description: string;
    type: 'objet' | 'service_individuel' | 'service_collectif' | 'service_timing';
    quantite?: {
      demandee: number;
      flexible: boolean;
      min?: number;
      max?: number;
    };
    maxPersonnes?: number;
    timing?: 'avant' | 'pendant' | 'apres';
    dateRemise?: string;
    organisateurPositionne?: boolean;
    assignations: {
      id: string;
      participantId: number;
      participantNom: string;
      quantiteProposee: number;
      dateAssignation: string;
      statut: 'accepte' | 'refuse' | 'attente';
      bobIndividuelId?: number; // 🔗 Lien vers le BOB créé !
    }[];
    statut: 'ouvert' | 'partiellement_comble' | 'complet' | 'ferme';
  }[];
  
  // Ciblage invitations
  ciblage: {
    type: 'all' | 'groups' | 'contacts';
    groupes?: string[];
    contacts?: string[];
    includeUtilisateursBob: boolean;
    includeContactsSansBob: boolean;
  };
  
  // 🔗 Tracking des BOB créés depuis cet événement
  bobsIndividuelsCreés: number[]; // IDs des échanges créés
  
  // Chat de groupe
  chatGroupeId?: string;
}
```

### 3. Collection `invitations` (Optionnelle)

**Endpoint**: `/api/invitations`

#### Champs
```json
{
  "telephone": {
    "type": "string",
    "required": true
  },
  "evenement": {
    "type": "relation",
    "relation": "manyToOne", 
    "target": "api::evenement.evenement",
    "required": true
  },
  "statut": {
    "type": "enumeration",
    "enum": ["envoye", "vu", "accepte", "refuse"],
    "default": "envoye"
  },
  "typeInvitation": {
    "type": "enumeration",
    "enum": ["push", "sms", "whatsapp", "email"],
    "default": "sms"
  },
  "dateEnvoi": {
    "type": "datetime",
    "required": true
  },
  "dateReponse": {
    "type": "datetime"
  }
}
```

## API Endpoints Nécessaires

### 1. Endpoints Échanges Standards ✅
```
GET    /api/echanges                 # Liste échanges
POST   /api/echanges                 # Créer échange
GET    /api/echanges/:id             # Détail échange
PUT    /api/echanges/:id             # Modifier échange
DELETE /api/echanges/:id             # Supprimer échange
```

### 2. Endpoints Événements Standards ✅
```
GET    /api/evenements               # Liste événements
POST   /api/evenements               # Créer événement  
GET    /api/evenements/:id           # Détail événement
PUT    /api/evenements/:id           # Modifier événement
DELETE /api/evenements/:id           # Supprimer événement
```

### 3. 🔗 **Endpoints Architecture Unifiée** (À IMPLÉMENTER)

#### Positionnement sur Besoins
```
POST /api/evenements/:id/besoins/:besoinId/position
Request Body:
{
  "quantiteProposee": 1,
  "commentaire": "Je peux aider !"
}

Response:
{
  "success": true,
  "bobIndividuel": { /* BOB créé */ },
  "message": "Positionnement confirmé !"
}
```

#### Gestion Participations
```
POST /api/evenements/:id/accept         # Accepter invitation
POST /api/evenements/:id/decline        # Refuser invitation
GET  /api/evenements/:id/participation  # Statut participation
GET  /api/evenements/participating      # Mes événements acceptés
```

#### Synchronisation BOB ↔ Événement
```
POST /api/evenements/:id/sync-besoin
Request Body:
{
  "bobId": 123,
  "besoinId": "besoin_1", 
  "newStatus": "termine"
}

GET /api/evenements/:id/bobs            # BOB créés depuis événement
GET /api/echanges?origine=evenement     # Tous BOB d'événements
```

## Logique de Synchronisation

### 1. Création BOB depuis Besoin
```sql
-- Quand un participant se positionne sur un besoin :

1. INSERT INTO echanges (
     titre, description, type, 
     origine = 'evenement',
     evenement_id = :eventId,
     metadata = {
       "besoinOriginal": {
         "id": ":besoinId",
         "titre": ":besoinTitre", 
         "type": ":besoinType"
       }
     }
   );

2. UPDATE evenements 
   SET metadata = JSON_SET(
     metadata, 
     '$.besoins[*].assignations', 
     JSON_ARRAY_APPEND(assignations, '{
       "participantId": :userId,
       "bobIndividuelId": :newBobId,
       "dateAssignation": NOW()
     }')
   )
   WHERE id = :eventId;

3. UPDATE evenements
   SET metadata = JSON_SET(
     metadata,
     '$.bobsIndividuelsCreés',
     JSON_ARRAY_APPEND(bobsIndividuelsCreés, :newBobId)  
   )
   WHERE id = :eventId;
```

### 2. Synchronisation Statut BOB → Besoin
```sql
-- Quand un BOB change de statut :

UPDATE evenements e
JOIN echanges ex ON ex.evenement_id = e.id  
SET e.metadata = JSON_SET(
  e.metadata,
  '$.besoins[*].statut',
  CASE 
    WHEN (SELECT COUNT(*) FROM assignations WHERE statut='accepte') >= quantite_demandee 
    THEN 'complet'
    WHEN COUNT(*) > 0 THEN 'partiellement_comble'  
    ELSE 'ouvert'
  END
)
WHERE ex.id = :bobId;
```

## Tests de Validation

### 1. Test Création BOB Direct
```javascript
test('Créer BOB direct', async () => {
  const bob = await exchangesService.createExchange({
    titre: 'Prêt perceuse',
    type: 'pret',
    origine: 'direct' // Explicite
  }, token);
  
  expect(bob.origine).toBe('direct');
  expect(bob.evenement).toBeNull();
});
```

### 2. Test Création BOB depuis Événement
```javascript  
test('Positionnement besoin → Création BOB', async () => {
  // 1. Créer événement avec besoin
  const event = await eventsService.createEvent({
    titre: 'Barbecue',
    besoins: [{
      id: 'besoin_1',
      titre: 'Barbecue portable',
      type: 'objet'
    }]
  }, token);
  
  // 2. Se positionner sur le besoin
  const result = await eventsService.positionnerSurBesoin(
    event.id, 
    'besoin_1', 
    token
  );
  
  // 3. Vérifier BOB créé
  expect(result.bobIndividuel.origine).toBe('evenement');
  expect(result.bobIndividuel.evenementId).toBe(event.id);
  expect(result.bobIndividuel.type).toBe('pret');
  
  // 4. Vérifier synchronisation événement
  const updatedEvent = await eventsService.getEvent(event.id, token);
  const besoin = updatedEvent.besoins.find(b => b.id === 'besoin_1');
  expect(besoin.assignations).toHaveLength(1);
  expect(besoin.assignations[0].bobIndividuelId).toBe(result.bobIndividuel.id);
});
```

### 3. Test Synchronisation Bidirectionnelle
```javascript
test('BOB terminé → Besoin mis à jour', async () => {
  // Setup: BOB créé depuis événement
  const { bobIndividuel } = await eventsService.positionnerSurBesoin(/*...*/);
  
  // Terminer le BOB
  await exchangesService.completeExchange(bobIndividuel.id, token);
  
  // Vérifier synchronisation automatique  
  const event = await eventsService.getEvent(eventId, token);
  const assignation = event.besoins[0].assignations.find(
    a => a.bobIndividuelId === bobIndividuel.id
  );
  expect(assignation.statut).toBe('termine');
});
```

## Configuration Strapi Recommandée

### 1. Permissions API
```json
{
  "authenticated": {
    "echanges": ["find", "findOne", "create", "update"],
    "evenements": ["find", "findOne", "create", "update"],
    "evenements.accept": ["create"],
    "evenements.besoins.position": ["create"]
  },
  "public": {
    "evenements": ["findOne"],  // Pour invités via SMS
    "invitations": ["findOne"]  // Détection invitations
  }
}
```

### 2. Middlewares Requis
```javascript
// middleware/events-sync.js
module.exports = () => {
  return async (ctx, next) => {
    await next();
    
    // Après modification d'un BOB, synchroniser l'événement
    if (ctx.request.url.includes('/echanges/') && ctx.request.method === 'PUT') {
      await synchronizeBobToEvent(ctx.response.data);
    }
  };
};
```

### 3. Hooks Automatiques
```javascript
// src/api/echange/content-types/echange/lifecycles.js
module.exports = {
  async afterUpdate(event) {
    const { result } = event;
    
    // Si BOB vient d'un événement, synchroniser
    if (result.origine === 'evenement' && result.evenement) {
      await strapi.service('api::evenement.evenement')
        .syncBesoinFromBob(result);
    }
  }
};
```

## Checklist Validation ✅

### Collections Strapi
- [ ] Collection `echanges` avec champs `origine` et `evenement`  
- [ ] Collection `evenements` avec `metadata.besoins`
- [ ] Collection `evenements` avec `metadata.bobsIndividuelsCreés`
- [ ] Relations correctement configurées

### Endpoints API
- [ ] `POST /evenements/:id/besoins/:besoinId/position`
- [ ] `POST /evenements/:id/accept` et `/decline`
- [ ] `GET /evenements/participating`
- [ ] `POST /evenements/:id/sync-besoin`

### Fonctionnalités  
- [ ] Création BOB automatique lors positionnement
- [ ] Synchronisation bidirectionnelle BOB ↔ Besoin
- [ ] Tracking des BOB créés depuis événements
- [ ] Permissions appropriées pour tous les endpoints

### Tests
- [ ] Test création BOB direct vs événement
- [ ] Test positionnement → création BOB
- [ ] Test synchronisation statuts
- [ ] Test cas limites (erreurs, rollbacks)

## Conclusion

Cette architecture garantit que **chaque interaction d'entraide converge vers un BOB individuel**, qu'elle soit initiée directement ou via un événement. Les collections Strapi supportent parfaitement cette logique unifiée avec les bons champs et relations.

**Prochaine étape** : Implémenter les endpoints manquants et tester en conditions réelles.