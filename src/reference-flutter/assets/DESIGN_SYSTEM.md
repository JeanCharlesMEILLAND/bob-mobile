# 🎨 Design System Flutter → React Native

## 🎯 Palette de Couleurs (COPY-PASTE DIRECT)

```typescript
// Conversion exacte Flutter → RN
export const Colors = {
  // Couleurs principales
  dark: '#030511',
  lightblue: '#166AF6',        // Couleur signature Bob
  darkblue: '#205780',
  blue: '#295CC5',
  deepBlue: '#0D4B79',
  white: '#FFFFFF',
  
  // Navigation
  navBackgroundColor: '#0D2133',
  activeNavColor: '#0AC7F4',
  
  // États
  red500: '#F04438',           // Erreurs
  greenActive: '#33FF00',      // Succès
  orangeNotActiveColor: '#FAC417', // Warning
  grey: '#8C8C8C',
  textGreyShade: '#8E8EA9',
  
  // Bob specifiques
  lendColor: '#9B7402',        // Couleur prêt (or)
  borrowColor: '#DE2A25',      // Couleur emprunt (rouge)
  
  // Pro version
  proBlueActive: '#166AF6',
  proBlueNormal: 'rgba(22, 104, 246, 0.8)',
  proBlack: '#262626',
  proWhite: '#FFFAEF',
  proBlueActiveGradient: '#00C9F7',
  
  // Gradients Bobies (monnaie virtuelle)
  gradientBobies0: '#FFBA26',
  gradientBobies100: '#FFE62C',
  
  // Backgrounds
  loginLightBackground: '#F9FEFF',
  deepNavyBlue: '#0B2740',
};
```

## 📱 Responsive Design

### **Flutter ScreenUtil → RN**
```typescript
// Flutter utilise flutter_screenutil
// Design size: 393x852

// RN equivalent avec react-native-size-matters
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// Ou dimensions custom
import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const baseWidth = 393;
const baseHeight = 852;

export const responsive = {
  width: (size: number) => (screenWidth / baseWidth) * size,
  height: (size: number) => (screenHeight / baseHeight) * size,
  font: (size: number) => moderateScale(size),
};
```

## 🔤 Typography

### **Flutter Fonts → RN**
```typescript
// 4 familles de polices utilisées
export const Fonts = {
  outfit: {
    regular: 'Outfit-Regular',
    bold: 'Outfit-Bold',
    semiBold: 'Outfit-SemiBold',
  },
  roboto: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    semiBold: 'Roboto-SemiBold',
  },
  prompt: {
    regular: 'Prompt-Regular',
    medium: 'Prompt-Medium',
    semiBold: 'Prompt-SemiBold',
    bold: 'Prompt-Bold',
  },
  inter: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
  },
};

// Styles de texte
export const TextStyles = {
  title: {
    fontFamily: Fonts.outfit.bold,
    fontSize: responsive.font(24),
    color: Colors.proBlack,
  },
  body: {
    fontFamily: Fonts.roboto.regular,
    fontSize: responsive.font(16),
    color: Colors.grey,
  },
  button: {
    fontFamily: Fonts.prompt.semiBold,
    fontSize: responsive.font(16),
    color: Colors.white,
  },
};
```

## 🎭 Thèmes

### **Light/Dark Theme**
```typescript
export const LightTheme = {
  background: Colors.white,
  surface: Colors.loginLightBackground,
  primary: Colors.lightblue,
  text: Colors.proBlack,
  border: Colors.grey,
  card: Colors.white,
};

export const DarkTheme = {
  background: Colors.dark,
  surface: Colors.deepNavyBlue,
  primary: Colors.activeNavColor,
  text: Colors.white,
  border: Colors.darkblue,
  card: Colors.navBackgroundColor,
};
```

## 🎨 Assets à Copier

### **Icons SVG (100+ disponibles)**
```bash
# Copier depuis Flutter
C:\Users\jcmei\OneDrive\Bureau\bob\bob\assets\img\svg\

# Vers React Native  
C:\BOB\bob-mobile\assets\icons\

# Icons clés :
- bob_*.svg (logos navigation)
- nav_*_active.svg / nav_*_inactive.svg
- collectif_icon.svg, emprunt_icon.svg, pret_icon.svg, service_icon.svg
- symbols_*.svg (UI générale)
```

### **Images de fond**
```bash
# Backgrounds pour cards Bob
- card-bob-background.png
- card-event-background.png
- background_svg_*.svg (par type de Bob)
```

## ⚡ Migration Express (2h max)

1. **Colors** (30min) → Copy-paste direct
2. **Fonts** (45min) → Import fonts + styles  
3. **Responsive** (30min) → Setup dimensions
4. **Assets** (15min) → Copy SVG/images

**Résultat : Design system identique à Flutter !**