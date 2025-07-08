// Types pour le système d'authentification et de gestion des entreprises

export type UserRole = 
  | 'owner'          // Propriétaire d'Atelier (Administrateur Unique)
  | 'manager'        // Gérant d'Atelier
  | 'tailor'         // Couturier
  | 'orders'         // Responsable des Commandes
  | 'stocks'         // Responsable des Stocks
  | 'customer_service'; // Responsable du Service Client

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
}

export interface CompanyRegistrationData {
  companyName: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
  password: string;
}

// Permissions par rôle
export const ROLE_PERMISSIONS = {
  owner: {
    label: 'Propriétaire d\'Atelier',
    description: 'Accès complet à toutes les fonctionnalités',
    modules: ['all'],
    canManageUsers: true,
    canViewFinancial: true,
    canManageCompany: true
  },
  manager: {
    label: 'Gérant d\'Atelier',
    description: 'Gestion de la production et du planning',
    modules: ['production', 'planning', 'orders', 'patterns'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  tailor: {
    label: 'Couturier',
    description: 'Accès aux commandes assignées uniquement',
    modules: ['personal_orders', 'patterns'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  orders: {
    label: 'Responsable des Commandes',
    description: 'Gestion des clients et commandes',
    modules: ['clients', 'orders', 'billing', 'measurements'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  stocks: {
    label: 'Responsable des Stocks',
    description: 'Gestion de l\'inventaire et fournisseurs',
    modules: ['inventory', 'suppliers', 'procurement'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  },
  customer_service: {
    label: 'Responsable du Service Client',
    description: 'Communication et satisfaction client',
    modules: ['customer_support', 'complaints', 'communications'],
    canManageUsers: false,
    canViewFinancial: false,
    canManageCompany: false
  }
} as const;