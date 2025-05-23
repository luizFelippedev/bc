"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";

// --- Interfaces ---

interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

interface ThemeState {
  mode: "light" | "dark" | "cyberpunk" | "neon" | "matrix";
  customColors: ThemeConfig;
  animations: boolean;
  particles: boolean;
  glassEffect: boolean;
}

type ThemeAction =
  | { type: "SET_MODE"; payload: ThemeState["mode"] }
  | { type: "TOGGLE_ANIMATIONS" }
  | { type: "TOGGLE_PARTICLES" }
  | { type: "TOGGLE_GLASS_EFFECT" }
  | { type: "HYDRATE"; payload: ThemeState };

interface ThemeContextType {
  theme: ThemeState;
  dispatch: React.Dispatch<ThemeAction>;
  setThemeMode: (mode: ThemeState["mode"]) => void;
  toggleAnimations: () => void;
  toggleParticles: () => void;
  toggleGlassEffect: () => void;
  isLoaded: boolean;
}

// --- Available Themes ---

const themes: Record<ThemeState["mode"], ThemeConfig> = {
  light: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1f2937",
  },
  dark: {
    primary: "#60a5fa",
    secondary: "#a78bfa",
    accent: "#fbbf24",
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f8fafc",
  },
  cyberpunk: {
    primary: "#00ffff",
    secondary: "#ff00ff",
    accent: "#ffff00",
    background: "#0a0a0a",
    surface: "#1a1a2e",
    text: "#00ffff",
  },
  neon: {
    primary: "#ff0080",
    secondary: "#8000ff",
    accent: "#00ff80",
    background: "#000000",
    surface: "#111111",
    text: "#ffffff",
  },
  matrix: {
    primary: "#00ff41",
    secondary: "#008f11",
    accent: "#41ff00",
    background: "#000000",
    surface: "#001100",
    text: "#00ff41",
  },
};

// --- Initial State ---

const initialThemeState: ThemeState = {
  mode: "dark",
  customColors: themes.dark, // Ensure initial customColors match initial mode
  animations: true,
  particles: true,
  glassEffect: true,
};

// --- Reducer ---

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case "SET_MODE": {
      // Garantir que payload é do tipo correto
      const mode = action.payload as ThemeState["mode"];
      return {
        ...state,
        mode,
        customColors: themes[mode],
      };
    }
    case "TOGGLE_ANIMATIONS":
      return { ...state, animations: !state.animations };
    case "TOGGLE_PARTICLES":
      return { ...state, particles: !state.particles };
    case "TOGGLE_GLASS_EFFECT":
      return { ...state, glassEffect: !state.glassEffect };
    case "HYDRATE":
      // Quando hidratar, garantir cores correspondentes ao modo
      return { ...action.payload, customColors: themes[action.payload.mode] };
    default:
      return state;
  }
};

// --- Context ---

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// --- Provider ---

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, dispatch] = useReducer(themeReducer, initialThemeState);
  const [isLoaded, setIsLoaded] = useState(false);

  const applyThemeToDOM = useCallback((themeState: ThemeState) => {
    if (typeof document === "undefined") return;

    requestAnimationFrame(() => {
      const root = document.documentElement;
      const { customColors } = themeState;

      // Remove classes antigas de tema
      root.className = root.className.replace(/\btheme-\w+\b/g, "");
      root.classList.add(`theme-${themeState.mode}`);

      // Define variáveis CSS
      const cssVars = {
        "--color-primary": customColors.primary,
        "--color-secondary": customColors.secondary,
        "--color-accent": customColors.accent,
        "--color-background": customColors.background,
        "--color-surface": customColors.surface,
        "--color-text": customColors.text,
      };

      for (const [key, value] of Object.entries(cssVars)) {
        root.style.setProperty(key, value);
      }

      // Toggle classes de animações e glass effect
      root.classList.toggle("no-animations", !themeState.animations);
      root.classList.toggle("glass-enabled", themeState.glassEffect);
      root.classList.toggle("glass-disabled", !themeState.glassEffect);

      // Ajusta duração das animações
      if (!themeState.animations) {
        root.style.setProperty("--animation-duration", "0s");
        root.style.setProperty("--transition-duration", "0s");
      } else {
        root.style.removeProperty("--animation-duration");
        root.style.removeProperty("--transition-duration");
      }

      document.body.style.backgroundColor = customColors.background;
      document.body.style.color = customColors.text;
    });
  }, []);

  // Carrega tema do localStorage no mount
  useEffect(() => {
    const loadTheme = () => {
      try {
        const saved = localStorage.getItem("portfolio_theme");
        if (saved) {
          const parsed = JSON.parse(saved);

          // Validar mode
          const validModes = ["light", "dark", "cyberpunk", "neon", "matrix"] as const;
          const mode = validModes.includes(parsed.mode) ? (parsed.mode as ThemeState["mode"]) : "dark";
    
          // Monta estado para dispatch e aplicação
          const hydratedTheme: ThemeState = {
            mode,
            animations: parsed.animations ?? true,
            particles: parsed.particles ?? true,
            glassEffect: parsed.glassEffect ?? true,
            customColors: themes[mode],
          };

          dispatch({ type: "HYDRATE", payload: hydratedTheme });
          applyThemeToDOM(hydratedTheme);
        } else {
          applyThemeToDOM(initialThemeState);
        }
      } catch (e) {
        console.error("Error loading theme from localStorage:", e);
        applyThemeToDOM(initialThemeState);
      } finally {
        setIsLoaded(true);
      }
    };

    if (document.readyState === "complete") {
      loadTheme();
    } else {
      window.addEventListener("load", loadTheme);
      return () => window.removeEventListener("load", loadTheme);
    }
  }, [applyThemeToDOM]);

  // Salva tema no localStorage quando mudar
  useEffect(() => {
    if (!isLoaded) return;

    try {
      const toSave = {
        mode: theme.mode,
        animations: theme.animations,
        particles: theme.particles,
        glassEffect: theme.glassEffect,
      };
      localStorage.setItem("portfolio_theme", JSON.stringify(toSave));
      applyThemeToDOM(theme);
    } catch (e) {
      console.error("Error saving theme to localStorage:", e);
    }
  }, [theme, isLoaded, applyThemeToDOM]);

  // Actions memoizadas
  const setThemeMode = useCallback((mode: ThemeState["mode"]) => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const toggleAnimations = useCallback(() => {
    dispatch({ type: "TOGGLE_ANIMATIONS" });
  }, []);

  const toggleParticles = useCallback(() => {
    dispatch({ type: "TOGGLE_PARTICLES" });
  }, []);

  const toggleGlassEffect = useCallback(() => {
    dispatch({ type: "TOGGLE_GLASS_EFFECT" });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        dispatch,
        setThemeMode,
        toggleAnimations,
        toggleParticles,
        toggleGlassEffect,
        isLoaded,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// --- Hooks ---

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const useThemeReady = () => {
  return useTheme().isLoaded;
};

// --- Pre-Hydration Theme Script (SSR Safe) ---

export const ThemeScript: React.FC = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `
        (function(){
          try{
            const saved=localStorage.getItem('portfolio_theme');
            const parsed=saved?JSON.parse(saved):null;
            const validModes = ['light','dark','cyberpunk','neon','matrix'];
            const mode = validModes.includes(parsed?.mode) ? parsed.mode : 'dark';
            const animations = parsed?.animations !== false;
            const glassEffect = parsed?.glassEffect !== false;
            const themes = {
              light:{background:'#ffffff',text:'#1f2937',primary:'#3b82f6',secondary:'#8b5cf6',accent:'#f59e0b',surface:'#f8fafc'},
              dark:{background:'#0f172a',text:'#f8fafc',primary:'#60a5fa',secondary:'#a78bfa',accent:'#fbbf24',surface:'#1e293b'},
              cyberpunk:{background:'#0a0a0a',text:'#00ffff',primary:'#00ffff',secondary:'#ff00ff',accent:'#ffff00',surface:'#1a1a2e'},
              neon:{background:'#000000',text:'#ffffff',primary:'#ff0080',secondary:'#8000ff',accent:'#00ff80',surface:'#111111'},
              matrix:{background:'#000000',text:'#00ff41',primary:'#00ff41',secondary:'#008f11',accent:'#41ff00',surface:'#001100'}
            };
            const colors=themes[mode] || themes.dark;
            const root=document.documentElement;
            root.className=root.className.replace(/theme-\\w+/g,'');
            root.classList.add('theme-'+mode);
            root.style.setProperty('--color-primary',colors.primary);
            root.style.setProperty('--color-secondary',colors.secondary);
            root.style.setProperty('--color-accent',colors.accent);
            root.style.setProperty('--color-background',colors.background);
            root.style.setProperty('--color-surface',colors.surface);
            root.style.setProperty('--color-text',colors.text);
            document.body.style.backgroundColor=colors.background;
            document.body.style.color=colors.text;
            root.classList.toggle('no-animations',!animations);
            root.classList.toggle('glass-enabled',glassEffect);
            root.classList.toggle('glass-disabled',!glassEffect);
            if(!animations){
              root.style.setProperty('--animation-duration','0s');
              root.style.setProperty('--transition-duration','0s');
            } else {
              root.style.removeProperty('--animation-duration');
              root.style.removeProperty('--transition-duration');
            }
          }catch(e){}
        })()
      `,
    }}
  />
);
