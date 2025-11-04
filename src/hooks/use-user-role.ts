// Hook pour gérer les rôles utilisateur de manière sécurisée
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

export function useUserRole() {
  const { user } = useAuth();

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  // Vérifier si l'utilisateur a un des rôles spécifiés
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  // Vérifier si l'utilisateur est propriétaire
  const isOwner = (): boolean => {
    return user?.role === 'owner';
  };

  // Vérifier si l'utilisateur est manager
  const isManager = (): boolean => {
    return user?.role === 'manager';
  };

  // Vérifier si l'utilisateur peut gérer les utilisateurs
  const canManageUsers = (): boolean => {
    return hasAnyRole(['owner', 'manager']);
  };

  // Vérifier si l'utilisateur peut voir les données financières
  const canViewFinancial = (): boolean => {
    return hasAnyRole(['owner', 'manager']);
  };

  // Vérifier si l'utilisateur peut gérer l'entreprise
  const canManageCompany = (): boolean => {
    return hasRole('owner');
  };

  return {
    role: user?.role,
    hasRole,
    hasAnyRole,
    isOwner,
    isManager,
    canManageUsers,
    canViewFinancial,
    canManageCompany
  };
}
