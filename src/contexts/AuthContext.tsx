import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User, Company, CompanyRegistrationData, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Actions pour le reducer
type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'LOGOUT' }
  | { type: 'REGISTER_COMPANY_SUCCESS'; payload: { user: User; company: Company } }
  | { type: 'SET_ERROR'; payload: string };

// State initial
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  company: null,
  loading: true,
  error: ''
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
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
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
    const start = Date.now();
    let timeoutId: NodeJS.Timeout | null = null;
    // Affiche un message si le chargement dure plus de 3 secondes
    timeoutId = setTimeout(() => {
      dispatch({ type: 'SET_ERROR', payload: 'Chargement long, merci de patienter...' });
    }, 3000);
    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Supabase Auth] Event:', event, 'Session:', session);
        if (session?.user) {
          console.log('[Supabase Auth] Utilisateur connecté, chargement du profil...');
          await loadUserData(session);
        } else {
          console.log('[Supabase Auth] Déconnexion détectée ou session invalide, déclenchement du LOGOUT');
          dispatch({ type: 'LOGOUT' });
        }
      }
    );
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Chargement session terminé en', Date.now() - start, 'ms');
      if (session?.user) {
        loadUserData(session);
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      if (timeoutId) clearTimeout(timeoutId);
    });
    return () => {
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Charger les données utilisateur depuis Supabase
  const loadUserData = async (session: Session) => {
    const start = Date.now();
    try {
      console.log('[AuthContext] Chargement du profil pour user_id:', session.user.id);
      
      // Requête optimisée : d'abord le profil, puis l'entreprise séparément
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, role, company_id, is_active, created_at, last_login')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('[AuthContext] Chargement profil terminé en', Date.now() - start, 'ms');
      console.log('[AuthContext] Données du profil:', profileData);
      console.log('[AuthContext] Erreur du profil:', profileError);
      
      if (profileError) {
        console.error('[AuthContext] Erreur lors du chargement du profil:', profileError);
        dispatch({ type: 'SET_ERROR', payload: `Erreur profil: ${profileError.message}` });
        return;
      }
      
      if (!profileData) {
        console.error('[AuthContext] Aucune donnée de profil trouvée');
        dispatch({ type: 'SET_ERROR', payload: "Profil utilisateur introuvable. Veuillez contacter l'administrateur." });
        return;
      }

      // Charger l'entreprise séparément pour éviter les JOIN lents
      console.log('[AuthContext] Chargement de l\'entreprise pour company_id:', profileData.company_id);
      
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('id, name, email, created_at, is_active')
        .eq('id', profileData.company_id)
        .single();

      console.log('[AuthContext] Données de l\'entreprise:', companyData);
      console.log('[AuthContext] Erreur de l\'entreprise:', companyError);

      if (companyError) {
        console.error('[AuthContext] Erreur lors du chargement de l\'entreprise:', companyError);
        dispatch({ type: 'SET_ERROR', payload: `Erreur entreprise: ${companyError.message}` });
        return;
      }
      
      if (!companyData) {
        console.error('[AuthContext] Aucune donnée d\'entreprise trouvée');
        dispatch({ type: 'SET_ERROR', payload: "Entreprise introuvable. Veuillez contacter l'administrateur." });
        return;
      }

      const user: User = {
        id: profileData.user_id,
        email: profileData.email,
        firstName: profileData.first_name,
        lastName: profileData.last_name,
        role: profileData.role as UserRole || 'owner', // Valeur par défaut si le rôle n'est pas défini
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

      console.log('[AuthContext] Chargement complet terminé en', Date.now() - start, 'ms');
      console.log('[AuthContext] Utilisateur créé:', user);
      console.log('[AuthContext] Entreprise créée:', company);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, company } });
    } catch (error) {
      console.error('[AuthContext] Erreur lors du chargement des données utilisateur:', error);
      dispatch({ type: 'SET_ERROR', payload: "Erreur lors du chargement du profil utilisateur." });
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