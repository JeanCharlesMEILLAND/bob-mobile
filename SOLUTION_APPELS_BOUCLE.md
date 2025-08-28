# 🔧 Solution aux appels en boucle Strapi

## Problèmes identifiés

### 1. Double vérification contacts (409 Conflict)
- `syncSingleContact` vérifie l'existence avec `findContactByPhone` 
- `createContact` fait un POST qui échoue en 409
- `createContact` refait un `findContactByPhone` pour gérer le doublon

### 2. Cache non optimisé
- Cache `syncedContactsCache` mal initialisé 
- Pas de vérification avant sync

### 3. Détection Bob inefficace
- `checkSinglePhone` récupère TOUS les utilisateurs à chaque appel
- Aucun cache des utilisateurs Bob

## Solutions immédiates

### Solution 1: Cache de contacts existants pré-chargé

```typescript
// Dans ContactsSync.ts
private existingContactsCache: Map<string, string> = new Map(); // téléphone → documentId

private async preloadExistingContacts(token: string): Promise<void> {
  try {
    const response = await apiClient.get('/contacts?pagination[limit]=2000', token);
    if (response.ok) {
      const data = await response.json();
      this.existingContactsCache.clear();
      
      data.data?.forEach((contact: any) => {
        if (contact.telephone) {
          const normalized = this.normalizePhoneNumber(contact.telephone);
          this.existingContactsCache.set(normalized, contact.documentId || contact.id);
        }
      });
      
      console.log(`✅ Cache existants: ${this.existingContactsCache.size} contacts`);
    }
  } catch (error) {
    console.error('❌ Erreur preload cache:', error);
  }
}

private async syncSingleContact(contact: Contact, token: string): Promise<{ created: boolean; updated: boolean }> {
  const normalizedPhone = this.normalizePhoneNumber(contact.telephone);
  
  // ✅ Vérifier le cache AVANT tout appel réseau
  const existingId = this.existingContactsCache.get(normalizedPhone);
  
  if (existingId) {
    // Contact existe déjà - pas besoin de créer
    return { created: false, updated: false };
  } else {
    // Contact n'existe pas - créer directement
    await contactsService.createContact({...}, token);
    return { created: true, updated: false };
  }
}
```

### Solution 2: Batch de détection Bob

```typescript
// Cache unique des utilisateurs Bob
private bobUsersCache: Map<string, any> = new Map();
private bobCacheTimestamp = 0;
private BOB_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

private async loadBobUsersOnce(token: string): Promise<void> {
  const now = Date.now();
  
  // Cache valide ? Pas besoin de recharger
  if (now - this.bobCacheTimestamp < this.BOB_CACHE_TTL && this.bobUsersCache.size > 0) {
    return;
  }
  
  console.log('🔄 Rechargement cache utilisateurs Bob...');
  
  try {
    const response = await apiClient.get('/users?pagination[limit]=1000', token);
    if (response.ok) {
      const data = await response.json();
      const users = Array.isArray(data) ? data : (data.data || []);
      
      this.bobUsersCache.clear();
      users.forEach((user: any) => {
        if (user.telephone) {
          const normalized = this.normalizePhoneNumber(user.telephone);
          this.bobUsersCache.set(normalized, user);
        }
      });
      
      this.bobCacheTimestamp = now;
      console.log(`✅ Cache Bob: ${this.bobUsersCache.size} utilisateurs`);
    }
  } catch (error) {
    console.error('❌ Erreur cache Bob:', error);
  }
}

private async checkSinglePhone(telephone: string, token: string): Promise<boolean> {
  // Charger le cache Bob si nécessaire (UNE SEULE FOIS)
  await this.loadBobUsersOnce(token);
  
  const normalized = this.normalizePhoneNumber(telephone);
  return this.bobUsersCache.has(normalized);
}
```

### Solution 3: Optimisation dans createContact

```typescript
// Dans contacts.service.ts, ligne 295
createContact: async (data: CreateContactData, token: string): Promise<Contact> => {
  const normalized = contactsService.normalizePhoneNumber(data.telephone);
  
  // ✅ Vérifier AVANT de créer (éviter 409)
  const existing = await findContactByPhoneHelper(normalized, token);
  if (existing) {
    console.log('📋 Contact existe déjà, retour direct:', existing.nom);
    return existing; // Pas besoin de créer
  }
  
  // Créer seulement si n'existe pas
  const response = await apiClient.post('/contacts', { data: contactData }, token);
  
  if (!response.ok) {
    if (response.status === 409) {
      // Double sécurité : récupérer le contact existant
      const fallback = await findContactByPhoneHelper(normalized, token);
      if (fallback) return fallback;
    }
    // Autres erreurs...
  }
  
  // Traitement normal...
}
```

## Implémentation recommandée

### Étape 1: Modifier ContactsSync.ts

1. Ajouter `preloadExistingContacts()` au début de `syncToStrapi()`
2. Modifier `syncSingleContact()` pour utiliser le cache
3. Ajouter `loadBobUsersOnce()` pour la détection Bob

### Étape 2: Modifier contacts.service.ts

1. Ajouter vérification avant `POST` dans `createContact()`
2. Simplifier la gestion des 409

### Étape 3: Optimiser les appels

1. Regrouper les vérifications par batch de 50
2. Implémenter un délai entre les batches (100ms)
3. Ajouter un circuit breaker pour les erreurs répétées

## Résultat attendu

- **Avant**: 1252 contacts = ~3756 appels API (3x par contact)
- **Après**: 1252 contacts = ~1254 appels API (1x par contact + 2 appels de cache)

**Réduction de 66% des appels API** 🎯