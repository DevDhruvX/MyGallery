export const Colors = {
  light: {
    // Primary colors
    primary: '#667EEA',
    primaryDark: '#5A67D8',
    primaryLight: '#A5B4FC',
    
    // Accent colors
    accent: '#F093FB',
    accentDark: '#F093FB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    backgroundTertiary: '#F1F5F9',
    
    // Surface colors
    surface: '#FFFFFF',
    surfaceSecondary: '#F8FAFC',
    card: '#FFFFFF',
    
    // Text colors
    text: '#1E293B',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    ripple: 'rgba(102, 126, 234, 0.12)',
  },
  dark: {
    // Primary colors
    primary: '#818CF8',
    primaryDark: '#6366F1',
    primaryLight: '#A5B4FC',
    
    // Accent colors
    accent: '#F093FB',
    accentDark: '#F093FB',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    
    // Background colors
    background: '#0F172A',
    backgroundSecondary: '#1E293B',
    backgroundTertiary: '#334155',
    
    // Surface colors
    surface: '#1E293B',
    surfaceSecondary: '#334155',
    card: '#1E293B',
    
    // Text colors
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textTertiary: '#94A3B8',
    textInverse: '#1E293B',
    
    // Border colors
    border: '#475569',
    borderLight: '#334155',
    
    // Special colors
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    ripple: 'rgba(129, 140, 248, 0.16)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Typography = {
  fontFamily: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    giant: 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const Shadows = {
  light: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  dark: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

export const Animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};