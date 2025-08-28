# ✅ Logique de Validation Flutter → React Native

## 🎯 Validation Patterns Flutter

### **Phone Number Validation**
```dart
// Validation sophistiquée des numéros internationaux
final validator = (PhoneNumber? phone) {
  if (phone?.completeNumber?.isEmpty ?? true) {
    return 'Numéro requis';
  }
  if (!phone!.isValid) {
    return 'Numéro invalide';
  }
  return null;
}
```

### **Email Validation**
```dart
// Pattern email complexe
final emailValidator = (String? value) {
  if (value?.isEmpty ?? true) return 'Email requis';
  
  final emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
  );
  
  if (!emailRegex.hasMatch(value!)) {
    return 'Format email invalide';
  }
  return null;
}
```

### **Password Validation**
```dart
final passwordValidator = (String? value) {
  if (value?.isEmpty ?? true) return 'Mot de passe requis';
  if (value!.length < 6) return 'Minimum 6 caractères';
  return null;
}
```

## 🔄 React Native Conversion

```typescript
// Validation téléphone avec libphonenumber-js
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export const validatePhone = (value: string, country: string): string | null => {
  if (!value) return 'Numéro requis';
  
  try {
    const phoneNumber = parsePhoneNumber(value, country as any);
    if (!phoneNumber || !isValidPhoneNumber(value, country as any)) {
      return 'Numéro invalide';
    }
    return null;
  } catch {
    return 'Format invalide';
  }
};

// Validation email
export const validateEmail = (value: string): string | null => {
  if (!value) return 'Email requis';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value)) {
    return 'Format email invalide';
  }
  return null;
};

// Validation mot de passe
export const validatePassword = (value: string): string | null => {
  if (!value) return 'Mot de passe requis';
  if (value.length < 6) return 'Minimum 6 caractères';
  return null;
};
```

## 📋 Form Builders

### **Flutter FormBuilder**
```dart
FormBuilderTextField(
  name: 'email',
  validator: FormBuilderValidators.compose([
    FormBuilderValidators.required(),
    FormBuilderValidators.email(),
  ]),
)
```

### **React Native Equivalent**
```typescript
// Avec react-hook-form
import { useForm } from 'react-hook-form';

const { register, formState: { errors } } = useForm();

<TextInput
  {...register('email', {
    required: 'Email requis',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Format email invalide'
    }
  })}
/>
```

## 🎯 Validation Business Logic

### **Bob Creation Validation**
```typescript
export const validateBobCreation = (data: BobCreationData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Titre requis
  if (!data.title?.trim()) {
    errors.title = 'Titre requis';
  }
  
  // Description
  if (!data.description?.trim()) {
    errors.description = 'Description requise';
  }
  
  // Contacts sélectionnés
  if (!data.contacts || data.contacts.length === 0) {
    errors.contacts = 'Sélectionnez au moins un contact';
  }
  
  // Date (si planifié)
  if (data.type === 'planned' && !data.date) {
    errors.date = 'Date requise pour planification';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
```

## ⚡ Gain de Temps

**Patterns Flutter → RN :**
1. **Validators functions** → Direct copy (1h)
2. **Regex patterns** → Identiques (15min)
3. **Business logic** → Adaptation légère (2h)
4. **Error messages** → Copy-paste (30min)

**Total : 3h45 pour toute la validation !**