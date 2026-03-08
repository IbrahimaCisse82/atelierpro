import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { AuthState, User, Company, CompanyRegistrationData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Actions pour le reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  company: null,
  loading: true,
  error: ''
};

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
        loading: false,
        error: ''
      };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// Context
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;
  registerCompany: (data: CompanyRegistrationData) => Promise<void>;
  switchRole: (role: UserRole) => void;
  retryCount: number;
  handleRetry: () => void;
  clearError: () => void;
  userProfile: User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  const [forceReload, setForceReload] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxRetries = 2;

  const loadUserData = async (session: Session) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, company_id, is_active, created_at, last_login')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError || !profileData) {
        if (profileError?.code === 'PGRST116') {
          dispatch({ type: 'SET_ERROR', payload: 'Profil non trouvé. Vérifiez votre email de confirmation.' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: `Erreur profil: ${profileError?.message || 'Introuvable'}` });
        }
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('company_id', profileData.company_id)
        .single();

      if (roleError || !roleData) {
        if (roleError?.code === 'PGRST116') {
          dispatch({ type: 'SET_ERROR', payload: 'Compte en cours de création. Veuillez réessayer.' });
        } else {
          dispatch({ type: 'SET_ERROR', payload: `Erreur rôle: ${roleError?.message || 'Introuvable'}` });
        }
        return;
      }

      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, email, created_at, is_active')
        .eq('id', profileData.company_id)
        .single();
      
      if (companyError || !companyData) {
        dispatch({ type: 'SET_ERROR', payload: `Erreur entreprise: ${companyError?.message || 'Introuvable'}` });
        return;
      }

      const user: User = {
        id: profileData.user_id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: roleData.role as UserRole,
        companyId: profileData.company_id,
        isActive: profileData.is_active,
        createdAt: new Date(profileData.created_at),
        lastLogin: profileData.last_login ? new Date(profileData.last_login) : undefined
      };

      const company: Company = {
        id: companyData.id,
        name: companyData.name,
        email: companyData.email,
        createdAt: new Date(companyData.created_at),
        isActive: companyData.is_active
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Erreur lors du chargement du profil.' });
    }
  };

  const loadUserDataWithTimeout = async (session: Session) => {
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout'));
        }, 5000);
      });
      
      await Promise.race([loadUserData(session), timeoutPromise]);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadUserDataWithTimeout(session), 1000 * (retryCount + 1));
        return;
      }
      dispatch({ type: 'SET_ERROR', payload: `Chargement trop long. (${retryCount}/${maxRetries})` });
    }
  };

  useEffect(() => {
    const init = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data?.session?.user) {
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }
        await loadUserDataWithTimeout(data.session);
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await loadUserDataWithTimeout(session);
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line
  }, [forceReload]);

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setRetryCount(0);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Email non confirmé. Vérifiez votre boîte mail.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou mot de passe incorrect.');
        } else if (error.message.includes('Too many requests')) {
          throw new Error('Trop de tentatives. Patientez quelques minutes.');
        }
        throw new Error(error.message);
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const registerCompany = async (data: CompanyRegistrationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Note: company name uniqueness is not checked here because
      // the companies table has RLS that prevents anonymous reads.
      // The trigger will create the company regardless.

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
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch {
      // Silent fail on logout
    }
  };

  const switchRole = (role: UserRole) => {
    if (state.user && state.company && state.user.id === 'demo-user-id') {
      const updatedUser = { ...state.user, role };
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, company: state.company } });
    }
  };

  const loginAsDemo = () => {
    const demoUser: User = {
      id: 'demo-user-id',
      email: 'demo@atelierpro.app',
      firstName: 'Utilisateur',
      lastName: 'Démo',
      role: 'owner' as UserRole,
      companyId: 'demo-company-id',
      isActive: true,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    const demoCompany: Company = {
      id: 'demo-company-id',
      name: 'Atelier Démo',
      email: 'demo@atelierpro.app',
      createdAt: new Date(),
      isActive: true
    };
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user: demoUser, company: demoCompany } });
  };

  const handleRetry = () => {
    setRetryCount(0);
    setForceReload(prev => prev + 1);
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: '' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      loginAsDemo,
      logout,
      registerCompany,
      switchRole,
      retryCount,
      handleRetry,
      clearError,
      userProfile: state.user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
