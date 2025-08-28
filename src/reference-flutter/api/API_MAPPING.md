# 🔗 API Mapping Flutter → Strapi 5

## 📊 Endpoints Flutter → Votre Strapi 5

### **Authentication**
```typescript
// Flutter utilise Strapi 4
'/api/auth/local'                    // ✅ Identique Strapi 5
'/api/auth/local/register'           // ✅ Identique
'/api/users/me'                      // ✅ Identique
'/api/auth/change-password'          // ✅ Identique
'/api/auth/forgot-password'          // ✅ Identique
'/api/auth/reset-password'           // ✅ Identique

// OAuth
'/api/auth/google/callback'          // ✅ Compatible
'/api/auth/facebook/callback'        // ✅ Compatible
```

### **Contacts - CHANGEMENT MAJEUR**
```typescript
// Flutter (custom endpoints)
'/api/users-permissions/user/contact'     // ❌ Custom

// Votre Strapi 5 (mieux!)
'/api/contacts'                           // ✅ Collection native
'/api/invitations'                        // ✅ Plus propre
```

### **Products & Bobs**
```typescript
// Flutter
'/api/products'                      // ✅ Identique
'/api/demande-prets'                 // → Votre '/api/echanges' ?
'/api/demande-emprunts'              // → Votre '/api/echanges' ?
'/api/demande-services'              // → Votre '/api/echanges' ?
'/api/pret-empunts'                  // → Votre '/api/echanges' ?

// Collectifs
'/api/collectifs'                    // → Votre '/api/evenements' ?
'/api/demande-collectifs'            // → Votre '/api/evenements' ?
```

### **Chat & Messaging**
```typescript
// Flutter
'/api/messages'                      // → Votre '/api/bob-messages'
'/api/chats'                         // → Votre '/api/bob-conversations'
```

### **Notifications**
```typescript
// Flutter
'/api/notifications'                 // ✅ Probablement identique
'/api/notifications/by-user/{id}'    // ✅ Compatible
```

## 🎯 Plan de Migration API

### **1. Garder identiques (30min)**
- Auth endpoints
- Upload file
- User management

### **2. Adapter les contacts (2h)**
- Mapper custom endpoints → collections natives
- Profit des relations Strapi 5

### **3. Unifier les "Bobs" (3h)**
- Flutter : 4 endpoints séparés (pret/emprunt/service/collectif)
- Strapi 5 : Probablement 1 collection 'echanges' + types

### **4. Moderniser chat (1h)**  
- Utiliser vos bob-conversations/bob-messages
- Plus de flexibilité que Flutter

## ⚡ TypeScript Conversion

```typescript
// Version React Native
export const API_ENDPOINTS = {
  // Auth (identique)
  login: '/api/auth/local',
  register: '/api/auth/local/register',
  
  // Contacts (amélioré)
  contacts: '/api/contacts',
  invitations: '/api/invitations',
  
  // Exchanges (unifié) 
  exchanges: '/api/echanges',
  events: '/api/evenements',
  
  // Chat (moderne)
  conversations: '/api/bob-conversations',
  messages: '/api/bob-messages',
  
  // Notifications
  notifications: '/api/notifications',
}
```

**Résultat : API plus propre et moderne que Flutter !**