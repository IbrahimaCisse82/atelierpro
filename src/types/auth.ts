// Types pour le système d'authentification et de gestion des entreprises

export type UserRole = 'owner' | 'manager' | 'tailor' | 'orders' | 'stocks' | 'customer_service';

export interface Company {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  companyId: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  company: Company | null;
  loading: boolean;
  error: string;
  retryCount?: number;
}

export interface CompanyRegistrationData {
  companyName: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  password: string;
}

// Permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, {
  name: string;
  label: string;
  description: string;
  permissions: string[];
  modules: string[];
  canManageUsers: boolean;
  canViewFinancial: boolean;
  canManageCompany: boolean;
}> = {
  owner: {
    name: 'Propriétaire',
    label: 'Propriétaire',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: ['all'],
    modules: ['dashboard', 'orders', 'clients', 'production', 'stocks', 'purchases', 'patterns', 'measurements', 'invoices', 'reports', 'alerts', 'hr', 'finances'],
    canManageUsers: true,
    canViewFinancial: true,
    canManageCompany: true
  },
  manager: {
    name: 'Manager',
    label: 'Manager',
    description: 'Gestion complète de l\'atelier',
    permissions: ['dashboard', 'orders', 'clients', 'production', 'stocks', 'purchases', 'patterns', 'measurements', 'invoices', 'reports', 'alerts'],
    modules: ['dashboard', 'orders', 'clients', 'production', 'stocks', 'purchases', 'patterns', 'measurements', 'invoices', 'reports', 'alerts'],
    canManageUsers: true,
    canViewFinancial: true,
    canManageCompany: false
  },
  tailor: {
    name: 'Tailleur',
    label: 'Tailleur',
    description: 'Gestion de la production et des mesures',
    permissions: ['production', 'measurements', 'patterns'],
    modules: ['production', 'measurements', 'patterns'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  orders: {
    name: 'Gestionnaire de commandes',
    label: 'Commandes',
    description: 'Gestion des commandes et clients',
    permissions: ['orders', 'clients', 'measurements'],
    modules: ['orders', 'clients', 'measurements'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  stocks: {
    name: 'Gestionnaire de stocks',
    label: 'Stocks',
    description: 'Gestion des stocks et achats',
    permissions: ['stocks', 'purchases', 'suppliers'],
    modules: ['stocks', 'purchases', 'suppliers'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  customer_service: {
    name: 'Service client',
    label: 'Service client',
    description: 'Gestion des clients et commandes',
    permissions: ['clients', 'orders'],
    modules: ['clients', 'orders'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  }
};