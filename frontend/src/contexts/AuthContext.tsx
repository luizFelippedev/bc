"use client";
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "visitor";
  avatar?: string;
  stats: {
    loginCount: number;
    lastLogin: Date;
    timeSpent: number;
  };
  permissions: {
    canCreateProjects: boolean;
    canEditProjects: boolean;
    canDeleteProjects: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until we check localStorage
  error: null,
};

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: keyof User["permissions"]) => boolean;
  trackAction: (action: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  const [initialized, setInitialized] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("portfolio_token");

        if (token) {
          // In a real app, validate token with API
          // For mock, we'll just create a user
          const user: User = {
            id: "1",
            name: "Admin User",
            email: "admin@portfolio.com",
            role: "admin",
            avatar: "/api/placeholder/40/40",
            stats: {
              loginCount: parseInt(localStorage.getItem("loginCount") || "1"),
              lastLogin: new Date(),
              timeSpent: 0,
            },
            permissions: {
              canCreateProjects: true,
              canEditProjects: true,
              canDeleteProjects: true,
              canManageUsers: true,
              canViewAnalytics: true,
            },
          };

          dispatch({ type: "LOGIN_SUCCESS", payload: user });
          console.log("Auth restored from token");
        } else {
          // No stored credentials
          dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Error restoring auth:", error);
        dispatch({ type: "LOGOUT" });
      } finally {
        // Mark as initialized either way
        setInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Hard-coded credentials for demo
      if (email === "admin@portfolio.com" && password === "admin123") {
        const user: User = {
          id: "1",
          name: "Admin User",
          email: email,
          role: "admin",
          avatar: "/api/placeholder/40/40",
          stats: {
            loginCount: parseInt(localStorage.getItem("loginCount") || "0") + 1,
            lastLogin: new Date(),
            timeSpent: 0,
          },
          permissions: {
            canCreateProjects: true,
            canEditProjects: true,
            canDeleteProjects: true,
            canManageUsers: true,
            canViewAnalytics: true,
          },
        };

        // Store in localStorage
        localStorage.setItem("portfolio_token", "demo-jwt-token-" + Date.now());
        localStorage.setItem("loginCount", user.stats.loginCount.toString());
        localStorage.setItem("user_role", user.role);
        localStorage.setItem("user_email", user.email);

        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        console.log("Login successful:", user);
        return true;
      } else {
        throw new Error(
          "Credenciais inválidas. Use admin@portfolio.com / admin123",
        );
      }
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao fazer login. Tente novamente.";
      console.error("Login error:", errorMessage);
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      return false;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("portfolio_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_email");

    // Update state
    dispatch({ type: "LOGOUT" });
    console.log("Logged out successfully");
  };

  const checkPermission = (permission: keyof User["permissions"]): boolean => {
    return state.user?.permissions[permission] || false;
  };

  const trackAction = (action: string) => {
    console.log("Action tracked:", action);
    // In a real app, send to analytics
  };

  // Don't render children until we've checked for existing auth
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    checkPermission,
    trackAction,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
