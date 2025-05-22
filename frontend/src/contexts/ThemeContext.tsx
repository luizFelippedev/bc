'use client';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

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
  | { type: 'HYDRATE'; payload: ThemeState };

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
    case 'HYDRATE':
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
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, dispatch] = useReducer(themeReducer, initialThemeState);
  const [isLoaded, setIsLoaded] = useState(false);

  // Função para aplicar tema no DOM
  const applyThemeToDOM = (themeState: ThemeState) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const colors = themeState.customColors;
    
    // Remove classes de tema anteriores
    root.className = root.className.replace(/theme-\w+/g, '');
    
    // Adiciona nova classe de tema
    root.classList.add(`theme-${themeState.mode}`);
    
    // Define CSS custom properties
    root.style.setProperty('--color-primary', colors.primary);
    root.style.setProperty('--color-secondary', colors.secondary);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-surface', colors.surface);
    root.style.setProperty('--color-text', colors.text);
    
    // Controla animações globalmente
    if (!themeState.animations) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }
    
    // Controla efeito glass
    root.classList.toggle('glass-enabled', themeState.glassEffect);
    root.classList.toggle('glass-disabled', !themeState.glassEffect);
  };

  // Carrega tema do localStorage apenas no cliente (após hidratação)
  useEffect(() => {
    const loadTheme = () => {
      try {
        const savedTheme = window.localStorage.getItem('portfolio_theme');
        if (savedTheme) {
          const parsedTheme: ThemeState = JSON.parse(savedTheme);
          dispatch({ type: 'HYDRATE', payload: parsedTheme });
          applyThemeToDOM(parsedTheme);
        } else {
          // Se não há tema salvo, aplica o tema padrão
          applyThemeToDOM(initialThemeState);
        }
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
        applyThemeToDOM(initialThemeState);
      } finally {
        setIsLoaded(true);
      }
    };

    // Aguarda a hidratação completa antes de carregar o tema
    if (document.readyState === 'complete') {
      loadTheme();
    } else {
      window.addEventListener('load', loadTheme);
      return () => window.removeEventListener('load', loadTheme);
    }
  }, []);

  // Salva tema no localStorage e aplica no DOM (apenas após hidratação)
  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem('portfolio_theme', JSON.stringify(theme));
        applyThemeToDOM(theme);
      } catch (error) {
        console.error('Error saving theme to localStorage:', error);
      }
    }
  }, [theme, isLoaded]);

  // Funções auxiliares
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
    isLoaded,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook para aguardar carregamento do tema
export const useThemeReady = () => {
  const { isLoaded } = useTheme();
  return isLoaded;
};

// Componente ThemeScript mais simples e seguro para SSR
export const ThemeScript: React.FC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function setTheme(mode) {
              try {
                document.documentElement.className = document.documentElement.className.replace(/theme-\\w+/g, '');
                document.documentElement.classList.add('theme-' + mode);
                
                var colors = {
                  light: { background: '#ffffff', text: '#1f2937' },
                  dark: { background: '#0f172a', text: '#f8fafc' },
                  cyberpunk: { background: '#0a0a0a', text: '#00ffff' },
                  neon: { background: '#000000', text: '#ffffff' },
                  matrix: { background: '#000000', text: '#00ff41' }
                };
                
                var themeColors = colors[mode] || colors.dark;
                document.documentElement.style.setProperty('--color-background', themeColors.background);
                document.documentElement.style.setProperty('--color-text', themeColors.text);
                document.body.style.backgroundColor = themeColors.background;
                document.body.style.color = themeColors.text;
              } catch (e) {
                // Fallback silencioso
              }
            }

            try {
              var savedTheme = localStorage.getItem('portfolio_theme');
              if (savedTheme) {
                var parsed = JSON.parse(savedTheme);
                setTheme(parsed.mode);
              } else {
                setTheme('dark');
              }
            } catch (e) {
              setTheme('dark');
            }
          })();
        `,
      }}
    />
  );
};