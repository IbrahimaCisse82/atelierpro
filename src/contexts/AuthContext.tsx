import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { AuthState, User, Company, CompanyRegistrationData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Actions pour le reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_COMPANY_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_RETRY_COUNT'; payload: number };

// State initial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  company: null,
  loading: true,
  error: ''
};

// Cache local pour les données utilisateur
const CACHE_KEY = 'atelierpro_auth_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  user: User;
  company: Company;
  timestamp: number;
}

// Fonction pour gérer le cache local
const getCachedData = (): CachedData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data: CachedData = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

const setCachedData = (user: User, company: Company) => {
  try {
    const data: CachedData = { user, company, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('[AuthContext] Impossible de mettre en cache:', error);
  }
};

const clearCachedData = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.warn('[AuthContext] Impossible de supprimer le cache:', error);
  }
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
        loading: false,
        error: ''
      };
    case 'REGISTER_COMPANY_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        company: action.payload.company,
        loading: false,
        error: ''
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        company: null,
        loading: false,
        error: ''
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_RETRY_COUNT':
      return { ...state, retryCount: action.payload };
    default:
      return state;
  }
}

// Context
interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerCompany: (data: CompanyRegistrationData) => Promise<void>;
  switchRole: (role: UserRole) => void;
  retryCount: number;
  handleRetry: () => void;
  clearError: () => void;
  userProfile: User | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  const [forceReload, setForceReload] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeout = 12000; // 12 secondes (optimisé pour connexions lentes)
  const maxRetries = 3;

  // Fonction pour charger la session et le profil avec timeout et retry
  const loadSessionAndProfile = async (isRetry = false) => {
    if (isRetry) {
      setRetryCount(prev => prev + 1);
      dispatch({ type: 'SET_RETRY_COUNT', payload: retryCount + 1 });
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    let didTimeout = false;
    
    console.time('supabase-auth-total');
    try {
      // Timeout global
      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          didTimeout = true;
          reject(new Error('Timeout de connexion à Supabase'));
        }, retryTimeout);
      });
      
      // Récupération de la session
      const sessionPromise = supabase.auth.getSession();
      const result = await Promise.race([sessionPromise, timeoutPromise]);
      
      const session = (result as any)?.data?.session;
      console.timeEnd('supabase-auth-total');
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      if (session?.user) {
        await loadUserDataWithTimeout(session);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      // Retry automatique si pas encore au maximum
      if (retryCount < maxRetries && !didTimeout) {
        setTimeout(() => loadSessionAndProfile(true), 1000 * (retryCount + 1));
        return;
      }
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `Connexion trop longue ou erreur réseau. (${retryCount}/${maxRetries})` 
      });
    }
  };

  // Fonction pour charger le profil utilisateur avec timeout et cache
  const loadUserDataWithTimeout = async (session: Session) => {
    let didTimeout = false;
    
    try {
      // Vérifier le cache d'abord
      const cachedData = getCachedData();
      if (cachedData && cachedData.user.id === session.user.id) {
        dispatch({ 
          type: 'LOGIN_SUCCESS', 
          payload: { user: cachedData.user, company: cachedData.company } 
        });
        return;
      }

      const timeoutPromise = new Promise((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          didTimeout = true;
          reject(new Error('Timeout de chargement du profil'));
        }, retryTimeout);
      });
      
      await Promise.race([loadUserData(session), timeoutPromise]);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    } catch (error) {
      // Retry automatique si pas encore au maximum
      if (retryCount < maxRetries && !didTimeout) {
        setTimeout(() => loadUserDataWithTimeout(session), 1000 * (retryCount + 1));
        return;
      }
      
      dispatch({ 
        type: 'SET_ERROR', 
        payload: `Chargement du profil trop long ou erreur réseau. (${retryCount}/${maxRetries})` 
      });
    }
  };

  // Initialisation avec Supabase Auth (avec retry)
  useEffect(() => {
    loadSessionAndProfile();
    
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserDataWithTimeout(session);
        } else {
          clearCachedData();
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

  // Charger les données utilisateur depuis Supabase (OPTIMISÉ avec user_roles)
  const loadUserData = async (session: Session) => {
    try {
      // 1. Récupérer le profil utilisateur
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, company_id, is_active, created_at, last_login')
        .eq('user_id', session.user.id)
        .single();
      
      if (profileError || !profileData) {
        dispatch({ type: 'SET_ERROR', payload: `Erreur profil: ${profileError?.message || 'Profil introuvable'}` });
        return;
      }

      // 2. Récupérer le rôle depuis user_roles (table sécurisée)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', session.user.id)
        .eq('company_id', profileData.company_id)
        .single();

      if (roleError || !roleData) {
        dispatch({ type: 'SET_ERROR', payload: `Erreur rôle: ${roleError?.message || 'Rôle introuvable'}` });
        return;
      }

      // 3. Récupérer l'entreprise
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, email, created_at, is_active')
        .eq('id', profileData.company_id)
        .single();
      
      if (companyError || !companyData) {
        dispatch({ type: 'SET_ERROR', payload: `Erreur entreprise: ${companyError?.message || 'Entreprise introuvable'}` });
        return;
      }

      const user: User = {
        id: profileData.user_id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: (roleData as any).role as UserRole,  // ✅ Rôle depuis table sécurisée
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
      
      // Mettre en cache les données
      setCachedData(user, company);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: "Erreur lors du chargement du profil utilisateur." });
    }
  };

  // Connexion avec Supabase
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    setRetryCount(0);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        // Gestion spécifique des erreurs 400
        if (error.status === 400) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Votre email n\'est pas encore confirmé. Veuillez vérifier votre boîte mail et cliquer sur le lien de confirmation.');
          } else if (error.message.includes('Invalid login credentials')) {
            throw new Error('Email ou mot de passe incorrect.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('Trop de tentatives de connexion. Veuillez patienter quelques minutes.');
          } else {
            throw new Error(`Erreur d'authentification: ${error.message}`);
          }
        }
        
        throw error;
      }
      
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
    try {
      await supabase.auth.signOut();
      clearCachedData();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('[AuthContext] Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour changer de rôle - Maintenant utilise user_roles (sécurisé)
  const switchRole = async (role: UserRole) => {
    if (state.user && state.company) {
      try {
        // ✅ Mettre à jour dans user_roles au lieu de profiles
        const { error } = await supabase
          .from('user_roles' as any)
          .update({ role })
          .eq('user_id', state.user.id)
          .eq('company_id', state.company.id);

        if (error) throw error;

        // Mettre à jour le state local
        const updatedUser = { ...state.user, role };
        setCachedData(updatedUser, state.company);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: updatedUser, company: state.company } });
      } catch (error) {
        console.error('Erreur lors du changement de rôle:', error);
      }
    }
  };

  // Handler pour le bouton "Réessayer"
  const handleRetry = () => {
    setRetryCount(0);
    setForceReload(prev => prev + 1);
  };

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: '' });
  };

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    registerCompany,
    switchRole,
    retryCount,
    handleRetry,
    clearError,
    userProfile: state.user
  };

  // Ajout du message d'attente intelligent dans le provider
  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
      registerCompany,
      switchRole,
      retryCount,
      handleRetry,
      clearError,
      userProfile: state.user
    }}>
      {state.loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <div className="space-y-2">
              <div className="text-xl font-semibold text-gray-700">Chargement de votre espace...</div>
              <div className="text-sm text-gray-500">Connexion à la base de données</div>
            </div>
            <div className="flex space-x-1 justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            {state.error && (
              <div className="mt-4 text-red-600 text-sm">
                {state.error} <br />
                <button onClick={handleRetry} className="mt-2 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary-dark transition">Réessayer (tentative #{retryCount})</button>
              </div>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook personnalisé
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};