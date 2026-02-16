export const colors = {
    // Backgrounds
    background: {
      primary: '#0B0D15',      // Deep navy (почти черный)
      secondary: '#151922',    // Card background
      tertiary: '#1F2532',     // Elevated cards
    },
    
    accent: {
      primary: '#6B8AFF',      // Soft blue (основной цвет)
      secondary: '#8B7FFF',    // Soft purple
      tertiary: '#5FB3E8',     // Muted cyan
      success: '#52D9A6',      // Soft green (не яркий неон!)
      warning: '#FFB84D',      // Soft gold
      danger: '#FF7B9C',       // Soft pink
    },
    
    // Semantic Colors
    success: '#52D9A6',
    warning: '#FFB84D',
    error: '#FF7B9C',
    info: '#5FB3E8',
    
    // Text
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
      tertiary: '#718096',
      muted: '#4A5568',
    },
    
    // Glassmorphism
    glass: {
      white: 'rgba(255, 255, 255, 0.08)',
      dark: 'rgba(0, 0, 0, 0.3)',
      border: 'rgba(255, 255, 255, 0.12)',
    },
  };
  
  export const shadows = {
    sm: {
      shadowColor: '#6B8AFF',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 2,
    },
    md: {
      shadowColor: '#6B8AFF',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    },
    lg: {
      shadowColor: '#6B8AFF',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    glow: {
      shadowColor: '#6B8AFF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },
  };
  
  export const borderRadius = {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    full: 9999,
  };
  
  export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };