// src/styles/tokens.ts
export const Colors = {
  background: '#f8f9fa',
  primary: '#3B82F6',
  text: '#212529',
  textSecondary: '#6c757d',
  white: '#ffffff',
  border: '#e9ecef',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  
  // Couleurs spécifiques Bob (ajout depuis Flutter)
  lightblue: '#166AF6',        // Couleur signature Bob
  lendColor: '#9B7402',        // Couleur prêt (or)
  borrowColor: '#DE2A25',      // Couleur emprunt (rouge)
  gradientBobies0: '#FFBA26',  // Bobies monnaie
  gradientBobies100: '#FFE62C',
  activeNavColor: '#0AC7F4',   // Navigation active
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

export const Typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 32,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: 'bold',
  },
} as const;

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
} as const;