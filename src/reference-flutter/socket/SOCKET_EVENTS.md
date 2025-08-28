# 🔄 Socket.IO Events - Flutter Reference

## 📥 Événements ÉCOUTÉS (Listeners)

### Bob Management
- `bob.list.refresh` - Actualiser liste des bobs
- `bob.state.change` - Changement statut bob
- `availability.change` - Disponibilité produit
- `lend_prop.edit` - Édition demande prêt
- `lend_prop.approuve` - Approbation prêt

### Notifications
- `notification.list.refresh` - Actualiser notifications
- `notification.item.update` - Mise à jour notification

### Collectifs
- `collectif.refresh` - Actualiser collectif
- `collectif.rebuild` - Reconstruire collectif

### Chat
- `message.send` - Nouveau message

## 📤 Événements ÉMIS (Emitters)

### Room Management
- `joinRoom` - Rejoindre une salle
- `leaveRoom` - Quitter une salle

### Bob Actions
- `bob.state.change` - Changer statut bob
- `bob.list.refresh` - Demander actualisation
- `availability.change` - Changer disponibilité
- `lend_prop.edit` - Éditer demande
- `lend_prop.approuve` - Approuver demande

### Notifications
- `notification.list.refresh` - Actualiser notifications
- `notification.item.update` - Mettre à jour notification

### Collectifs
- `collectif.refresh` - Actualiser collectif
- `collectif.rebuild` - Reconstruire collectif

### Chat
- `message.send` - Envoyer message

## 🏠 Room Patterns

```dart
// User rooms
'user.{userId}'          // Notifications utilisateur
'chat.{chatId}'          // Conversation
'bob.{bobId}'            // Échange spécifique
'product.{productId}'    // Produit spécifique
'collectif.{collectifId}' // Collectif
'lend_prop.{propositionId}' // Demande de prêt
'notification.{notificationId}' // Notification
```

## ⚡ Usage React Native

```typescript
// Écouter événements
socket.on('bob.list.refresh', (data) => {
  // Actualiser liste des bobs
});

// Émettre événements  
socket.emit('bob.state.change', {
  room: 'bob.123',
  bob: { status: 'accepted' }
});

// Gestion rooms
socket.emit('joinRoom', 'user.456');
socket.emit('leaveRoom', 'chat.789');
```