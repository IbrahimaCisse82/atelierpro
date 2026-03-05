import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

// Détecte si on est en mode démo
export function isDemoMode(userId: string): boolean {
  return userId === 'demo-user-id';
}

// Données de démonstration
export const DEMO_DATA = {
  clients: [
    { id: 'demo-c1', first_name: 'Marie', last_name: 'Dupont', email: 'marie.dupont@mail.com', phone: '+225 07 01 02 03', address: 'Cocody, Abidjan', gender: 'femme', is_active: true, company_id: 'demo-company-id', created_at: '2025-11-15T10:00:00Z', notes: 'Cliente fidèle', client_number: 'CLI-001', city: 'Abidjan', country: 'Côte d\'Ivoire', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-11-15T10:00:00Z' },
    { id: 'demo-c2', first_name: 'Jean', last_name: 'Koné', email: 'jean.kone@mail.com', phone: '+225 05 04 05 06', address: 'Plateau, Abidjan', gender: 'homme', is_active: true, company_id: 'demo-company-id', created_at: '2025-12-01T10:00:00Z', notes: '', client_number: 'CLI-002', city: 'Abidjan', country: 'Côte d\'Ivoire', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-12-01T10:00:00Z' },
    { id: 'demo-c3', first_name: 'Aminata', last_name: 'Traoré', email: 'aminata@mail.com', phone: '+225 01 07 08 09', address: 'Marcory, Abidjan', gender: 'femme', is_active: true, company_id: 'demo-company-id', created_at: '2026-01-10T10:00:00Z', notes: 'Commandes régulières', client_number: 'CLI-003', city: 'Abidjan', country: 'Côte d\'Ivoire', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-01-10T10:00:00Z' },
    { id: 'demo-c4', first_name: 'Fatou', last_name: 'Diallo', email: 'fatou.d@mail.com', phone: '+225 07 10 11 12', address: 'Treichville, Abidjan', gender: 'femme', is_active: true, company_id: 'demo-company-id', created_at: '2026-01-20T10:00:00Z', notes: '', client_number: 'CLI-004', city: 'Abidjan', country: 'Côte d\'Ivoire', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-01-20T10:00:00Z' },
    { id: 'demo-c5', first_name: 'Moussa', last_name: 'Ouattara', email: 'moussa@mail.com', phone: '+225 05 13 14 15', address: 'Yopougon, Abidjan', gender: 'homme', is_active: true, company_id: 'demo-company-id', created_at: '2026-02-05T10:00:00Z', notes: 'VIP', client_number: 'CLI-005', city: 'Abidjan', country: 'Côte d\'Ivoire', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-02-05T10:00:00Z' },
  ],
  products: [
    { id: 'demo-p1', name: 'Tissu Bazin Riche', description: 'Bazin de qualité supérieure', sku: 'BAZ-001', unit_price: 15000, current_stock: 45, min_stock_level: 10, unit: 'mètre', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
    { id: 'demo-p2', name: 'Fil à coudre polyester', description: 'Fil résistant multi-usage', sku: 'FIL-001', unit_price: 2500, current_stock: 120, min_stock_level: 20, unit: 'bobine', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
    { id: 'demo-p3', name: 'Boutons dorés', description: 'Boutons décoratifs plaqués or', sku: 'BTN-001', unit_price: 500, current_stock: 200, min_stock_level: 50, unit: 'pièce', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
    { id: 'demo-p4', name: 'Tissu Wax Hollandais', description: 'Wax imprimé africain', sku: 'WAX-001', unit_price: 8000, current_stock: 30, min_stock_level: 15, unit: 'mètre', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
    { id: 'demo-p5', name: 'Fermeture éclair', description: 'Fermeture éclair 20cm', sku: 'ZIP-001', unit_price: 1000, current_stock: 5, min_stock_level: 10, unit: 'pièce', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
    { id: 'demo-p6', name: 'Dentelle française', description: 'Dentelle haute couture', sku: 'DEN-001', unit_price: 25000, current_stock: 8, min_stock_level: 5, unit: 'mètre', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', category_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
  ],
  orders: [
    { id: 'demo-o1', order_number: 'CMD-2026-001', client_id: 'demo-c1', status: 'order_created', total_amount: 75000, paid_amount: 25000, due_date: '2026-03-20', notes: 'Robe de cérémonie', company_id: 'demo-company-id', created_at: '2026-02-15T10:00:00Z', assigned_tailor_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-02-15T10:00:00Z' },
    { id: 'demo-o2', order_number: 'CMD-2026-002', client_id: 'demo-c2', status: 'cutting_in_progress', total_amount: 120000, paid_amount: 60000, due_date: '2026-03-25', notes: 'Costume 3 pièces', company_id: 'demo-company-id', created_at: '2026-02-20T10:00:00Z', assigned_tailor_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-02-20T10:00:00Z' },
    { id: 'demo-o3', order_number: 'CMD-2026-003', client_id: 'demo-c3', status: 'assembly_in_progress', total_amount: 45000, paid_amount: 45000, due_date: '2026-03-15', notes: 'Ensemble pagne', company_id: 'demo-company-id', created_at: '2026-02-10T10:00:00Z', assigned_tailor_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-02-10T10:00:00Z' },
    { id: 'demo-o4', order_number: 'CMD-2026-004', client_id: 'demo-c4', status: 'ready_to_deliver', total_amount: 95000, paid_amount: 95000, due_date: '2026-03-10', notes: 'Robe de mariée', company_id: 'demo-company-id', created_at: '2026-01-25T10:00:00Z', assigned_tailor_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-01-25T10:00:00Z' },
    { id: 'demo-o5', order_number: 'CMD-2026-005', client_id: 'demo-c5', status: 'delivered', total_amount: 55000, paid_amount: 55000, due_date: '2026-02-28', notes: 'Boubou grand modèle', company_id: 'demo-company-id', created_at: '2026-01-15T10:00:00Z', assigned_tailor_id: null, deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-01-15T10:00:00Z' },
  ],
  suppliers: [
    { id: 'demo-s1', name: 'Textiles Abidjan SARL', contact_person: 'Koffi Yao', email: 'textiles@abidjan.ci', phone: '+225 27 20 30 40', address: 'Zone Industrielle, Abidjan', category: 'Tissus', is_active: true, company_id: 'demo-company-id', created_at: '2025-09-01T10:00:00Z', supplier_number: 'FRN-001', city: 'Abidjan', country: 'Côte d\'Ivoire', payment_terms: 30, credit_limit: 5000000, rating: 4, tax_id: null, notes: 'Fournisseur principal', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-09-01T10:00:00Z' },
    { id: 'demo-s2', name: 'Mercerie du Plateau', contact_person: 'Awa Cissé', email: 'mercerie@plateau.ci', phone: '+225 27 21 31 41', address: 'Plateau, Abidjan', category: 'Mercerie', is_active: true, company_id: 'demo-company-id', created_at: '2025-09-15T10:00:00Z', supplier_number: 'FRN-002', city: 'Abidjan', country: 'Côte d\'Ivoire', payment_terms: 15, credit_limit: 2000000, rating: 5, tax_id: null, notes: '', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-09-15T10:00:00Z' },
    { id: 'demo-s3', name: 'Import Tissus Lagos', contact_person: 'Chukwu Emeka', email: 'import@lagos.ng', phone: '+234 801 234 5678', address: 'Lagos, Nigeria', category: 'Tissus', is_active: true, company_id: 'demo-company-id', created_at: '2025-10-01T10:00:00Z', supplier_number: 'FRN-003', city: 'Lagos', country: 'Nigeria', payment_terms: 45, credit_limit: 10000000, rating: 3, tax_id: null, notes: 'Importateur', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2025-10-01T10:00:00Z' },
  ],
  employees: [
    { id: 'demo-e1', employee_number: 'EMP-001', profile_id: null, hire_date: '2024-01-15', hourly_rate: 2500, is_active: true, company_id: 'demo-company-id', created_at: '2024-01-15T10:00:00Z', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2024-01-15T10:00:00Z' },
    { id: 'demo-e2', employee_number: 'EMP-002', profile_id: null, hire_date: '2024-03-01', hourly_rate: 2000, is_active: true, company_id: 'demo-company-id', created_at: '2024-03-01T10:00:00Z', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2024-03-01T10:00:00Z' },
    { id: 'demo-e3', employee_number: 'EMP-003', profile_id: null, hire_date: '2024-06-15', hourly_rate: 1800, is_active: true, company_id: 'demo-company-id', created_at: '2024-06-15T10:00:00Z', deleted_at: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2024-06-15T10:00:00Z' },
  ],
  treasury_accounts: [
    { id: 'demo-ta1', account_name: 'Caisse Principale', account_type: 'cash', account_number: null, bank_name: null, initial_balance: 500000, current_balance: 1250000, currency: 'XOF', is_active: true, company_id: 'demo-company-id', created_at: '2025-01-01T10:00:00Z', notes: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-03-01T10:00:00Z' },
    { id: 'demo-ta2', account_name: 'Compte Bancaire BIAO', account_type: 'bank', account_number: 'CI001-12345678', bank_name: 'BIAO-CI', initial_balance: 2000000, current_balance: 3500000, currency: 'XOF', is_active: true, company_id: 'demo-company-id', created_at: '2025-01-01T10:00:00Z', notes: null, created_by: 'demo-user-id', updated_by: 'demo-user-id', updated_at: '2026-03-01T10:00:00Z' },
  ],
};

// Hook pour obtenir les données démo d'une table
export function useDemoData<T>(table: string): T[] | null {
  const tableMap: Record<string, any[]> = {
    clients: DEMO_DATA.clients,
    products: DEMO_DATA.products,
    orders: DEMO_DATA.orders,
    suppliers: DEMO_DATA.suppliers,
    employees: DEMO_DATA.employees,
    treasury_accounts: DEMO_DATA.treasury_accounts,
  };
  return (tableMap[table] as T[]) || [];
}
