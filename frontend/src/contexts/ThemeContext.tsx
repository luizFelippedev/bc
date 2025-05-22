'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

interface ThemeState {
  mode: 'light' | 'dark' | 'cyberpunk' | 'neon' | 'matrix';
  customColors: ThemeConfig;
  animations: boolean;
  particles: boolean;
  glassEffect: boolean;
}

const themes: Record<ThemeState['mode'], ThemeConfig> = {
  light: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
  },
  dark: {
    primary: '#60a5fa',
    secondary: '#a78bfa',
    accent: '#fbbf24',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
  },
  cyberpunk: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    accent: '#ffff00',
    background: '#0a0a0a',
    surface: '#1a1a2e',
    text: '#00ffff',
  },
  neon: {
    primary: '#ff0080',
    secondary: '#8000ff',
    accent: '#00ff80',
    background: '#000000',
    surface: '#111111',
    text: '#ffffff',
  },
  matrix: {
    primary: '#00ff41',
    secondary: '#008f11',
    accent: '#41ff00',
    background: '#000000',
    surface: '#001100',
    text: '#00ff41',
  },
};

type ThemeAction =
  | { type: 'SET_MODE'; payload: ThemeState['mode'] }
  | { type: 'TOGGLE_ANIMATIONS' }
  | { type: 'TOGGLE_PARTICLES' }
  | { type: 'TOGGLE_GLASS_EFFECT' }
  | { type: 'SET_STATE'; payload: ThemeState }; // para restaurar estado completo do localStorage

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_MODE':
      return {
        ...state,
        mode: action.payload,
        customColors: themes[action.payload],
      };
    case 'TOGGLE_ANIMATIONS':
      return { ...state, animations: !state.animations };
    case 'TOGGLE_PARTICLES':
      return { ...state, particles: !state.particles };
    case 'TOGGLE_GLASS_EFFECT':
      return { ...state, glassEffect: !state.glassEffect };
    case 'SET_STATE':
      return { ...action.payload, customColors: themes[action.payload.mode] };
    default:
      return state;
  }
};

const initialThemeState: ThemeState = {
  mode: 'dark',
  customColors: themes.dark,
  animations: true,
  particles: true,
  glassEffect: true,
};

interface ThemeContextType {
  theme: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  setThemeMode: (mode: ThemeState['mode']) => void;
  toggleAnimations: () => void;
  toggleParticles: () => void;
  toggleGlassEffect: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, dispatch] = useReducer(themeReducer, initialThemeState);

  // Carrega tema do localStorage uma única vez
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio_theme');
    if (savedTheme) {
      try {
        const parsedTheme: ThemeState = JSON.parse(savedTheme);
        dispatch({ type: 'SET_STATE', payload: parsedTheme });
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
      }
    }
  }, []);

  // Salva tema no localStorage sempre que ele muda
  useEffect(() => {
    localStorage.setItem('portfolio_theme', JSON.stringify(theme));
  }, [theme]);

  // Funções auxiliares para facilitar uso no componente
  const setThemeMode = (mode: ThemeState['mode']) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const toggleAnimations = () => dispatch({ type: 'TOGGLE_ANIMATIONS' });
  const toggleParticles = () => dispatch({ type: 'TOGGLE_PARTICLES' });
  const toggleGlassEffect = () => dispatch({ type: 'TOGGLE_GLASS_EFFECT' });

  const value: ThemeContextType = {
    theme,
    dispatch,
    setThemeMode,
    toggleAnimations,
    toggleParticles,
    toggleGlassEffect,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
