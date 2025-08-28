# 🚨 HOOKS DÉPRÉCIÉS

Ces hooks sont **DÉPRÉCIÉS** et ne doivent plus être utilisés dans les nouveaux développements.

## Hooks dépréciés

### ❌ `useContactsBob.ts`
- **Statut**: DÉPRÉCIÉ
- **Remplacé par**: `useContacts` (nouvelle API unifiée)
- **Raison**: Hook monolithique de 4000+ lignes, difficile à maintenir

### ❌ `useContactsRealTime.ts` 
- **Statut**: DÉPRÉCIÉ
- **Remplacé par**: `useContacts` (nouvelle API unifiée)
- **Raison**: Dépendance sur `useContactsBob`, logique fragmentée

## Migration recommandée

### Avant (ancien système)
```typescript
import { useContactsRealTime } from '../hooks/useContactsRealTime';

const MyComponent = () => {
  const {
    contactsBruts,
    repertoire,
    contacts,
    invitations,
    isLoading,
    getStats,
    scannerRepertoire,
    importerContactsSelectionnes,
    sendInvitation
  } = useContactsRealTime();
  
  // ...
};
```

### Après (nouveau système)
```typescript
import { useContacts } from '../hooks/contacts/useContacts';

const MyComponent = () => {
  const {
    phoneContacts,           // Remplace contactsBruts
    repertoireContacts,      // Remplace repertoire
    bobContacts,             // Remplace contacts
    invitedContacts,         // Remplace invitations
    loading,                 // Remplace isLoading
    getStats,                // API identique
    scannerRepertoireBrut,   // Remplace scannerRepertoire
    importerContactsSelectionnes,  // API identique
    sendInvitation           // API identique
  } = useContacts();
  
  // ...
};
```

## Avantages du nouveau système

✅ **Architecture modulaire** - Séparation claire des responsabilités
✅ **Performance optimisée** - Cache intelligent et mises à jour réactives  
✅ **API cohérente** - Nommage unifié et prévisible
✅ **Maintenance facilitée** - Code plus petit et plus lisible
✅ **Extensibilité** - Facile d'ajouter de nouvelles fonctionnalités

## Écrans à migrer

Les écrans suivants utilisent encore les anciens hooks :

### Utilisation de `useContactsRealTime`:
- `src/screens/contacts/InvitationContactsScreen.tsx`
- `src/screens/contacts/ContactsWebScreen.tsx`
- `src/screens/contacts/ContactsGroupesView.tsx`
- `src/screens/contacts/GroupeDetailScreen.tsx`
- `src/screens/contacts/ContactsSelectionScreen.tsx`

### Utilisation de `useContactsBob`:
- `src/screens/modals/CreateBoberScreen.tsx`
- `src/screens/main/ChatListScreen.tsx`
- `src/screens/exchanges/LendItemScreen.tsx`
- `src/screens/exchanges/CreateBoberScreen.tsx`
- `src/screens/contacts/RepertoireScreen.tsx`
- `src/screens/contacts/ContactsRepertoireScreen.tsx`
- `src/screens/chat/ChatListScreen.tsx`

## Plan de suppression

1. ✅ **Phase 1**: Création de la nouvelle architecture (TERMINÉ)
2. ✅ **Phase 2**: Migration de `ContactsScreen` (TERMINÉ)  
3. 🔄 **Phase 3**: Migration des écrans restants (EN COURS)
4. 🔄 **Phase 4**: Suppression définitive des anciens hooks

**⚠️ Les anciens hooks seront supprimés dans une version future. Migrez vos écrans dès que possible.**