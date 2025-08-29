// src/styles/webDesign.ts - Design moderne spécifique web
import { Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const isWeb = Platform.OS === 'web';
export const isLargeScreen = width > 1024;
export const isMediumScreen = width > 768 && width <= 1024;
export const isSmallScreen = width <= 768;

// Palette couleurs moderne
export const WebColors = {
  // Couleurs principales
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  
  // Couleurs secondaires
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',
  
  // Couleurs accent
  accent: '#10B981',
  accentLight: '#34D399',
  accentDark: '#059669',
  
  // Couleurs neutres
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Couleurs fonctionnelles
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Couleurs spécifiques Bob
  bobGreen: '#10B981',
  bobBlue: '#3B82F6',
  bobPurple: '#8B5CF6',
  bobOrange: '#F59E0B',
  
  // Backgrounds
  background: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceHover: '#F8FAFC',
  
  // Bordures
  border: '#E2E8F0',
  borderHover: '#CBD5E1',
  
  // Ombres
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowLarge: 'rgba(0, 0, 0, 0.25)',
};

// Typography moderne
export const WebTypography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Espacements
export const WebSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

// Border radius
export const WebRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Design System Web
export const WebDesign = {
  // Layout
  layout: {
    maxWidth: 1440,
    sidebarWidth: 280,
    headerHeight: 72,
    contentPadding: 32, // Valeur par défaut, à calculer dynamiquement si nécessaire
  },
  
  // Navigation sidebar moderne
  sidebar: {
    width: 280,
    backgroundColor: WebColors.white,
    borderRight: `1px solid ${WebColors.border}`,
    boxShadow: `0 4px 6px -1px ${WebColors.shadow}`,
  },
  
  // Header moderne
  header: {
    height: 72,
    backgroundColor: WebColors.white,
    borderBottom: `1px solid ${WebColors.border}`,
    boxShadow: `0 1px 3px 0 ${WebColors.shadow}`,
    padding: `0 ${WebSpacing.xl}px`,
  },
  
  // Conteneur principal
  container: {
    maxWidth: 1440,
    alignSelf: 'center',
    padding: `0 ${WebSpacing.xl}px`,
    backgroundColor: WebColors.background,
    minHeight: '100vh',
  },
  
  // Cards modernes
  card: {
    backgroundColor: WebColors.white,
    borderRadius: WebRadius.lg,
    padding: WebSpacing.lg,
    boxShadow: `0 1px 3px 0 ${WebColors.shadow}`,
    border: `1px solid ${WebColors.border}`,
    transition: 'all 0.2s ease',
    
    hover: {
      boxShadow: `0 4px 6px -1px ${WebColors.shadowMedium}`,
      borderColor: WebColors.borderHover,
      transform: 'translateY(-1px)',
    },
  },
  
  // Boutons modernes
  button: {
    primary: {
      backgroundColor: WebColors.primary,
      color: WebColors.white,
      padding: `${WebSpacing.sm}px ${WebSpacing.md}px`,
      borderRadius: WebRadius.md,
      fontWeight: WebTypography.fontWeight.medium,
      fontSize: WebTypography.fontSize.base,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      
      hover: {
        backgroundColor: WebColors.primaryDark,
        transform: 'translateY(-1px)',
        boxShadow: `0 4px 6px -1px ${WebColors.shadowMedium}`,
      },
    },
    
    secondary: {
      backgroundColor: WebColors.white,
      color: WebColors.gray700,
      padding: `${WebSpacing.sm}px ${WebSpacing.md}px`,
      borderRadius: WebRadius.md,
      fontWeight: WebTypography.fontWeight.medium,
      fontSize: WebTypography.fontSize.base,
      border: `1px solid ${WebColors.border}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      
      hover: {
        backgroundColor: WebColors.gray50,
        borderColor: WebColors.borderHover,
        transform: 'translateY(-1px)',
      },
    },
  },
  
  // Inputs modernes
  input: {
    backgroundColor: WebColors.white,
    border: `1px solid ${WebColors.border}`,
    borderRadius: WebRadius.md,
    padding: `${WebSpacing.sm}px ${WebSpacing.md}px`,
    fontSize: WebTypography.fontSize.base,
    color: WebColors.gray900,
    transition: 'all 0.2s ease',
    
    focus: {
      borderColor: WebColors.primary,
      boxShadow: `0 0 0 3px ${WebColors.primary}20`,
      outline: 'none',
    },
  },
  
  // Grid system
  grid: {
    container: {
      display: 'grid',
      gap: WebSpacing.lg,
    },
    
    cols1: { gridTemplateColumns: '1fr' },
    cols2: { gridTemplateColumns: 'repeat(2, 1fr)' },
    cols3: { gridTemplateColumns: 'repeat(3, 1fr)' },
    cols4: { gridTemplateColumns: 'repeat(4, 1fr)' },
    cols12: { gridTemplateColumns: 'repeat(12, 1fr)' },
  },
  
  // Responsive breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
  
  // Animations
  animations: {
    fadeIn: {
      opacity: 0,
      animation: 'fadeIn 0.3s ease forwards',
    },
    
    slideInFromLeft: {
      transform: 'translateX(-20px)',
      opacity: 0,
      animation: 'slideInFromLeft 0.3s ease forwards',
    },
    
    slideInFromRight: {
      transform: 'translateX(20px)',
      opacity: 0,
      animation: 'slideInFromRight 0.3s ease forwards',
    },
  },
  
  // Utilitaires responsive
  responsive: {
    mobile: isSmallScreen,
    tablet: isMediumScreen,
    desktop: isLargeScreen,
    
    show: {
      mobile: isSmallScreen ? {} : { display: 'none' },
      tablet: isMediumScreen ? {} : { display: 'none' },
      desktop: isLargeScreen ? {} : { display: 'none' },
    },
    
    hide: {
      mobile: isSmallScreen ? { display: 'none' } : {},
      tablet: isMediumScreen ? { display: 'none' } : {},
      desktop: isLargeScreen ? { display: 'none' } : {},
    },
  },
};

// Types pour les styles web
interface WebStyleObject {
  [key: string]: any;
  cursor?: 'pointer' | 'default' | 'text' | 'wait' | 'help';
  transition?: string;
  transform?: string;
  boxShadow?: string;
  borderRadius?: number | string;
  backgroundColor?: string;
  borderColor?: string;
  outline?: string;
  overflowY?: 'auto' | 'hidden' | 'scroll' | 'visible';
  maxHeight?: string;
  minHeight?: number | string;
  paddingHorizontal?: number;
  marginHorizontal?: string | number;
}

// Helpers pour utilisation conditionnelle
export const getWebStyle = (webStyle: WebStyleObject, mobileStyle: any = {}) => {
  return isWeb ? webStyle : mobileStyle;
};

export const getResponsiveStyle = (
  mobileStyle: any = {},
  tabletStyle: any = {},
  desktopStyle: any = {}
) => {
  if (isLargeScreen) return { ...mobileStyle, ...tabletStyle, ...desktopStyle };
  if (isMediumScreen) return { ...mobileStyle, ...tabletStyle };
  return mobileStyle;
};

// CSS pour animations (à injecter dans le DOM web)
export const WebCSS = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideInFromLeft {
  from { 
    transform: translateX(-20px);
    opacity: 0;
  }
  to { 
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInFromRight {
  from { 
    transform: translateX(20px);
    opacity: 0;
  }
  to { 
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scrollbar personnalisée */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: ${WebColors.gray100};
}

::-webkit-scrollbar-thumb {
  background: ${WebColors.gray400};
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: ${WebColors.gray500};
}

/* Styles globaux web */
body {
  font-family: ${WebTypography.fontFamily.sans};
  background-color: ${WebColors.background};
}

/* Transitions globales */
* {
  transition: all 0.2s ease;
}

/* Focus visible amélioré */
*:focus-visible {
  outline: 2px solid ${WebColors.primary};
  outline-offset: 2px;
}
`;