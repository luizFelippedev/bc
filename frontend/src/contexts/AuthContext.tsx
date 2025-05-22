'use client';
import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'visitor';
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
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case 'LOGIN_FAILURE':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

interface AuthContextType {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkPermission: (permission: keyof User['permissions']) => boolean;
  trackAction: (action: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const token = localStorage.getItem('portfolio_token');
    if (token) {
      const mockUser: User = {
        id: '1',
        name: 'Admin User',
        email: 'admin@portfolio.com',
        role: 'admin',
        avatar: '/api/placeholder/40/40',
        stats: {
          loginCount: parseInt(localStorage.getItem('loginCount') || '0') + 1,
          lastLogin: new Date(),
          timeSpent: 0
        },
        permissions: {
          canCreateProjects: true,
          canEditProjects: true,
          canDeleteProjects: true,
          canManageUsers: true,
          canViewAnalytics: true
        }
      };
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: mockUser });
      localStorage.setItem('loginCount', mockUser.stats.loginCount.toString());
    }
  }, []);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'admin@portfolio.com' && password === 'admin123') {
        const user: User = {
          id: '1',
          name: 'Admin User',
          email: email,
          role: 'admin',
          avatar: '/api/placeholder/40/40',
          stats: {
            loginCount: parseInt(localStorage.getItem('loginCount') || '0') + 1,
            lastLogin: new Date(),
            timeSpent: 0
          },
          permissions: {
            canCreateProjects: true,
            canEditProjects: true,
            canDeleteProjects: true,
            canManageUsers: true,
            canViewAnalytics: true
          }
        };
        
        localStorage.setItem('portfolio_token', 'fake-jwt-token');
        localStorage.setItem('loginCount', user.stats.loginCount.toString());
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        throw new Error('Credenciais inválidas');
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
    }
  };

  const logout = () => {
    localStorage.removeItem('portfolio_token');
    dispatch({ type: 'LOGOUT' });
  };

  const checkPermission = (permission: keyof User['permissions']): boolean => {
    return state.user?.permissions[permission] || false;
  };

  const trackAction = (action: string) => {
    console.log('Action tracked:', action);
  };

  const value: AuthContextType = {
    state,
    dispatch,
    login,
    logout,
    checkPermission,
    trackAction
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
