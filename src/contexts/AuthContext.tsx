import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, Company, CompanyRegistrationData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

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
  logout: () => Promise<void>;
  registerCompany: (data: CompanyRegistrationData) => Promise<void>;
  switchRole: (role: UserRole) => void; // Pour le prototype
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialisation avec Supabase Auth
  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserData(session);
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (session: Session) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      const user: User = {
        id: profileData.user_id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role as UserRole,
        companyId: profileData.company_id,
        isActive: profileData.is_active,
        createdAt: new Date(profileData.created_at),
        lastLogin: profileData.last_login ? new Date(profileData.last_login) : undefined
      };

      const company: Company = {
        id: profileData.companies.id,
        name: profileData.companies.name,
        email: profileData.companies.email,
        createdAt: new Date(profileData.companies.created_at),
        isActive: profileData.companies.is_active
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
    } catch (error) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Connexion avec Supabase
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      // Le loadUserData sera appelé automatiquement par onAuthStateChange
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  // Inscription d'entreprise avec Supabase
  const registerCompany = async (data: CompanyRegistrationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Vérifier l'unicité du nom d'entreprise
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('name', data.companyName)
        .single();

      if (existingCompany) {
        throw new Error('Ce nom d\'entreprise existe déjà');
      }

      // Créer l'utilisateur avec les métadonnées d'entreprise
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.ownerEmail,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            company_name: data.companyName,
            first_name: data.ownerFirstName,
            last_name: data.ownerLastName
          }
        }
      });

      if (signUpError) throw signUpError;
      
      // Le trigger handle_new_user créera automatiquement l'entreprise et le profil
      // L'utilisateur sera connecté automatiquement après confirmation email
      
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // Le dispatch({ type: 'LOGOUT' }) sera appelé automatiquement par onAuthStateChange
  };

  // Fonction pour changer de rôle (pour le développement uniquement)
  const switchRole = async (role: UserRole) => {
    if (state.user && state.company) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ role })
          .eq('user_id', state.user.id);

        if (error) throw error;

        // Mettre à jour le state local
        const updatedUser = { ...state.user, role };
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, company: state.company } });
      } catch (error) {
        console.error('Erreur lors du changement de rôle:', error);
      }
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