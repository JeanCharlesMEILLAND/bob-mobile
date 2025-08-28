# 📊 Modèles Flutter → TypeScript

## 🎯 Modèles Clés à Adapter

### **UserModel** (PRIORITÉ 1)
- Utilisateur complet avec numéros téléphone
- Gestion contacts et invitations
- Authentification et JWT
- **Gain : 1-2 jours** de logique métier

### **ProductModel** 
- Produits pour prêts/emprunts
- Gestion propriétaire et disponibilité
- Upload d'images
- **Gain : 3-4h** de development

### **ChatModel + MessageModel**
- Chat temps réel complet
- Messages avec images et réponses
- Historique et état "lu/non lu"
- **Gain : 1 jour** de logique chat

### **NotificationModel**
- 6 types de notifications différents
- Rich content avec images
- État de lecture par utilisateur
- **Gain : 1 jour** de système notifications

## 🔄 Patterns de Conversion

### **Dart → TypeScript**
```dart
// Flutter
class UserModel extends Equatable {
  final String? email;
  const UserModel({this.email});
}

// React Native
interface User {
  email?: string;
}
```

### **Méthodes utiles à porter**
- `fromMap()` → parsers JSON
- `toMap()` → serializers  
- `copyWith()` → state updates
- `fromSharedPreferences()` → storage local

### **Validation & Business Logic**
- Regex de validation email/téléphone
- Logique métier des statuts Bob
- Gestion des états d'invitation
- Comparaison numéros internationaux

## ⚡ Quick Wins

1. **Copier les interfaces** (30min)
2. **Porter la validation** (2h)
3. **Adapter les parsers** (3h)
4. **Tester l'intégration** (1h)

**Total : 6h pour tous les modèles !**