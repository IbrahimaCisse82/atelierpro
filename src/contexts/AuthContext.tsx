import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, Company, CompanyRegistrationData, UserRole } from '@/types/auth';

// Actions pour le reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_COMPANY_SUCCESS'; payload: { user: User; company: Company } };

// State initial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  company: null,
  loading: true
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        company: action.payload.company,
        loading: false
      };
    case 'REGISTER_COMPANY_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        company: action.payload.company,
        loading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        company: null,
        loading: false
      };
    default:
      return state;
  }
}

// Context
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerCompany: (data: CompanyRegistrationData) => Promise<void>;
  switchRole: (role: UserRole) => void; // Pour le prototype
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Simulation d'initialisation (vérification session stockée)
  useEffect(() => {
    const savedAuth = localStorage.getItem('atelier_auth');
    if (savedAuth) {
      try {
        const { user, company } = JSON.parse(savedAuth);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
      } catch {
        localStorage.removeItem('atelier_auth');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Simulation de connexion
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Données simulées - en réalité viendrait de l'API
    const user: User = {
      id: '1',
      email,
      firstName: 'Demo',
      lastName: 'User',
      role: 'owner',
      companyId: 'company-1',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };

    const company: Company = {
      id: 'company-1',
      name: 'Atelier Demo',
      email: 'contact@atelier-demo.fr',
      createdAt: new Date(),
      isActive: true
    };

    localStorage.setItem('atelier_auth', JSON.stringify({ user, company }));
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
  };

  // Simulation d'inscription d'entreprise
  const registerCompany = async (data: CompanyRegistrationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Simulation d'appel API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Vérification nom d'entreprise unique (simulation)
    const existingCompanies = ['Atelier Existant', 'Couture Pro'];
    if (existingCompanies.includes(data.companyName)) {
      throw new Error('Ce nom d\'entreprise existe déjà');
    }

    // Création de l'entreprise et du premier utilisateur (Propriétaire)
    const company: Company = {
      id: `company-${Date.now()}`,
      name: data.companyName,
      email: data.ownerEmail,
      createdAt: new Date(),
      isActive: true
    };

    const user: User = {
      id: `user-${Date.now()}`,
      email: data.ownerEmail,
      firstName: data.ownerFirstName,
      lastName: data.ownerLastName,
      role: 'owner', // Premier utilisateur = toujours Propriétaire
      companyId: company.id,
      isActive: true,
      createdAt: new Date()
    };

    localStorage.setItem('atelier_auth', JSON.stringify({ user, company }));
    dispatch({ type: 'REGISTER_COMPANY_SUCCESS', payload: { user, company } });
  };

  const logout = () => {
    localStorage.removeItem('atelier_auth');
    dispatch({ type: 'LOGOUT' });
  };

  // Fonction pour changer de rôle (pour tester les différents dashboards)
  const switchRole = (role: UserRole) => {
    if (state.user && state.company) {
      const updatedUser = { ...state.user, role };
      const authData = { user: updatedUser, company: state.company };
      localStorage.setItem('atelier_auth', JSON.stringify(authData));
      dispatch({ type: 'LOGIN_SUCCESS', payload: authData });
    }
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    registerCompany,
    switchRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}