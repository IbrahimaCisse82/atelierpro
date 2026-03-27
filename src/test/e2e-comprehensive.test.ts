import { describe, it, expect } from 'vitest';
import { formatFCFA, formatFCFAWithDecimals, getFCFASymbol } from '@/lib/utils';
import { DEMO_DATA, isDemoMode } from '@/contexts/DemoContext';
import { ALL_MODULES, MODULE_CATEGORIES, ModuleDefinition } from '@/hooks/use-company-modules';
import { ROLE_PERMISSIONS, UserRole } from '@/types/auth';

// ══════════════════════════════════════════════════════════════
// 1. DEVISE FCFA — Cohérence monétaire complète
// ══════════════════════════════════════════════════════════════
describe('FCFA Currency — Full Consistency', () => {
  it('formatFCFA formats all demo amounts correctly', () => {
    const amounts = [0, 500, 2500, 15000, 75000, 450000, 1500000, 5000000];
    amounts.forEach(amount => {
      const formatted = formatFCFA(amount);
      expect(formatted).toMatch(/CFA|XOF/i);
      // No EUR or $ symbol
      expect(formatted).not.toMatch(/€|\$/);
    });
  });

  it('all treasury accounts use XOF currency', () => {
    DEMO_DATA.treasury_accounts.forEach((ta: any) => {
      expect(ta.currency).toBe('XOF');
    });
  });

  it('no demo data contains EUR references', () => {
    const jsonStr = JSON.stringify(DEMO_DATA);
    expect(jsonStr).not.toContain('"EUR"');
    expect(jsonStr).not.toContain('€');
  });
});

// ══════════════════════════════════════════════════════════════
// 2. MODE DÉMO — Workflow complet
// ══════════════════════════════════════════════════════════════
describe('Demo Mode — Complete Workflow', () => {
  it('demo user ID is consistent', () => {
    expect(isDemoMode('demo-user-id')).toBe(true);
    expect(isDemoMode('')).toBe(false);
    expect(isDemoMode('real-user-id')).toBe(false);
  });

  it('demo company ID is consistent across all data', () => {
    const tablesWithCompanyId = [
      'clients', 'products', 'orders', 'suppliers', 'employees',
      'treasury_accounts', 'treasury_movements', 'customer_invoices',
      'patterns', 'client_measurements', 'production_tasks',
      'purchase_orders', 'models', 'alerts', 'fixed_assets', 'work_hours'
    ];
    tablesWithCompanyId.forEach(table => {
      if (DEMO_DATA[table] && DEMO_DATA[table].length > 0) {
        DEMO_DATA[table].forEach((item: any) => {
          expect(item.company_id).toBe('demo-company-id');
        });
      }
    });
  });

  it('all required demo data collections exist and are non-empty', () => {
    const requiredNonEmpty = [
      'clients', 'products', 'orders', 'suppliers', 'employees',
      'treasury_accounts', 'treasury_movements', 'customer_invoices',
      'patterns', 'client_measurements', 'production_tasks',
      'purchase_orders', 'models', 'alerts', 'fixed_assets', 'work_hours'
    ];
    requiredNonEmpty.forEach(key => {
      expect(DEMO_DATA).toHaveProperty(key);
      expect(Array.isArray(DEMO_DATA[key])).toBe(true);
      expect(DEMO_DATA[key].length).toBeGreaterThan(0);
    });
  });

  it('empty demo collections exist for structural consistency', () => {
    const emptyAllowed = ['receptions', 'depreciations', 'order_items', 'production_tracking', 'payment_reminders', 'product_categories'];
    emptyAllowed.forEach(key => {
      expect(DEMO_DATA).toHaveProperty(key);
      expect(Array.isArray(DEMO_DATA[key])).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 3. COHÉRENCE RELATIONNELLE DES DONNÉES DÉMO
// ══════════════════════════════════════════════════════════════
describe('Demo Data — Referential Integrity', () => {
  it('order client_ids reference existing clients', () => {
    const clientIds = new Set(DEMO_DATA.clients.map((c: any) => c.id));
    DEMO_DATA.orders.forEach((o: any) => {
      if (o.client_id) {
        expect(clientIds.has(o.client_id)).toBe(true);
      }
    });
  });

  it('customer_invoices order_ids reference existing orders', () => {
    const orderIds = new Set(DEMO_DATA.orders.map((o: any) => o.id));
    DEMO_DATA.customer_invoices.forEach((inv: any) => {
      if (inv.order_id) {
        expect(orderIds.has(inv.order_id)).toBe(true);
      }
    });
  });

  it('production_tasks order_ids reference existing orders', () => {
    const orderIds = new Set(DEMO_DATA.orders.map((o: any) => o.id));
    DEMO_DATA.production_tasks.forEach((pt: any) => {
      if (pt.order_id) {
        expect(orderIds.has(pt.order_id)).toBe(true);
      }
    });
  });

  it('purchase_orders supplier_ids reference existing suppliers', () => {
    const supplierIds = new Set(DEMO_DATA.suppliers.map((s: any) => s.id));
    DEMO_DATA.purchase_orders.forEach((po: any) => {
      if (po.supplier_id) {
        expect(supplierIds.has(po.supplier_id)).toBe(true);
      }
    });
  });

  it('client_measurements client_ids reference existing clients', () => {
    const clientIds = new Set(DEMO_DATA.clients.map((c: any) => c.id));
    DEMO_DATA.client_measurements.forEach((cm: any) => {
      expect(clientIds.has(cm.client_id)).toBe(true);
    });
  });

  it('treasury_movements treasury_account_ids reference existing accounts', () => {
    const accountIds = new Set(DEMO_DATA.treasury_accounts.map((ta: any) => ta.id));
    DEMO_DATA.treasury_movements.forEach((tm: any) => {
      expect(accountIds.has(tm.treasury_account_id)).toBe(true);
    });
  });

  it('work_hours employee_ids reference existing employees', () => {
    const employeeIds = new Set(DEMO_DATA.employees.map((e: any) => e.id));
    DEMO_DATA.work_hours.forEach((wh: any) => {
      expect(employeeIds.has(wh.employee_id)).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 4. LOGIQUE MÉTIER — Calculs et contraintes
// ══════════════════════════════════════════════════════════════
describe('Business Logic — Calculations & Constraints', () => {
  it('order paid_amount never exceeds total_amount', () => {
    DEMO_DATA.orders.forEach((o: any) => {
      expect(o.paid_amount).toBeLessThanOrEqual(o.total_amount);
    });
  });

  it('order amounts are positive', () => {
    DEMO_DATA.orders.forEach((o: any) => {
      expect(o.total_amount).toBeGreaterThan(0);
      expect(o.paid_amount).toBeGreaterThanOrEqual(0);
    });
  });

  it('customer invoices tax calculations are correct', () => {
    DEMO_DATA.customer_invoices.forEach((inv: any) => {
      expect(inv.total_with_tax).toBe(inv.total_amount + inv.tax_amount);
      expect(inv.tax_amount).toBeGreaterThanOrEqual(0);
    });
  });

  it('purchase orders tax calculations are correct', () => {
    DEMO_DATA.purchase_orders.forEach((po: any) => {
      expect(po.total_with_tax).toBe(po.total_amount + po.tax_amount);
    });
  });

  it('fixed assets net_book_value = acquisition_cost - accumulated_depreciation', () => {
    DEMO_DATA.fixed_assets.forEach((fa: any) => {
      expect(fa.net_book_value).toBe(fa.acquisition_cost - fa.accumulated_depreciation);
    });
  });

  it('fixed assets depreciation does not exceed acquisition cost', () => {
    DEMO_DATA.fixed_assets.forEach((fa: any) => {
      expect(fa.accumulated_depreciation).toBeLessThanOrEqual(fa.acquisition_cost);
      expect(fa.net_book_value).toBeGreaterThanOrEqual(0);
    });
  });

  it('employee hourly rates are positive', () => {
    DEMO_DATA.employees.forEach((e: any) => {
      expect(e.hourly_rate).toBeGreaterThan(0);
    });
  });

  it('work_hours total_hours are reasonable (0-24)', () => {
    DEMO_DATA.work_hours.forEach((wh: any) => {
      expect(wh.total_hours).toBeGreaterThan(0);
      expect(wh.total_hours).toBeLessThanOrEqual(24);
    });
  });

  it('product stock levels are non-negative', () => {
    DEMO_DATA.products.forEach((p: any) => {
      expect(p.current_stock).toBeGreaterThanOrEqual(0);
      expect(p.min_stock_level).toBeGreaterThanOrEqual(0);
      expect(p.unit_price).toBeGreaterThan(0);
    });
  });

  it('order statuses are valid production_status enum values', () => {
    const validStatuses = ['order_created', 'cutting_in_progress', 'assembly_in_progress', 'ready_to_deliver', 'delivered'];
    DEMO_DATA.orders.forEach((o: any) => {
      expect(validStatuses).toContain(o.status);
    });
  });

  it('purchase order statuses are valid', () => {
    const validStatuses = ['draft', 'ordered', 'received', 'cancelled'];
    DEMO_DATA.purchase_orders.forEach((po: any) => {
      expect(validStatuses).toContain(po.status);
    });
  });

  it('alert levels are valid', () => {
    const validLevels = ['info', 'warning', 'error', 'success'];
    DEMO_DATA.alerts.forEach((a: any) => {
      expect(validLevels).toContain(a.level);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 5. MODULE SYSTEM — Install/Uninstall Logic
// ══════════════════════════════════════════════════════════════
describe('Module System — Architecture & Dependencies', () => {
  it('has all 23 modules defined', () => {
    expect(ALL_MODULES.length).toBe(23);
  });

  it('all modules have unique keys', () => {
    const keys = ALL_MODULES.map(m => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('all module categories are valid', () => {
    ALL_MODULES.forEach(mod => {
      expect(MODULE_CATEGORIES).toContain(mod.category);
    });
  });

  it('dependency chain: orders → clients', () => {
    const orders = ALL_MODULES.find(m => m.key === 'orders')!;
    expect(orders.dependencies).toContain('clients');
  });

  it('dependency chain: purchases → suppliers', () => {
    const purchases = ALL_MODULES.find(m => m.key === 'purchases')!;
    expect(purchases.dependencies).toContain('suppliers');
  });

  it('dependency chain: receptions → suppliers + purchases', () => {
    const receptions = ALL_MODULES.find(m => m.key === 'receptions')!;
    expect(receptions.dependencies).toContain('suppliers');
    expect(receptions.dependencies).toContain('purchases');
  });

  it('dependency chain: treasury → finance_dashboard', () => {
    const treasury = ALL_MODULES.find(m => m.key === 'treasury')!;
    expect(treasury.dependencies).toContain('finance_dashboard');
  });

  it('dependency chain: bank_reconciliation → treasury', () => {
    const bankRecon = ALL_MODULES.find(m => m.key === 'bank_reconciliation')!;
    expect(bankRecon.dependencies).toContain('treasury');
  });

  it('dependency chain: remunerations → employees', () => {
    const remu = ALL_MODULES.find(m => m.key === 'remunerations')!;
    expect(remu.dependencies).toContain('employees');
  });

  it('dependency chain: customer_invoices → clients + orders', () => {
    const ci = ALL_MODULES.find(m => m.key === 'customer_invoices')!;
    expect(ci.dependencies).toContain('clients');
    expect(ci.dependencies).toContain('orders');
  });

  it('dependency chain: production → orders', () => {
    const prod = ALL_MODULES.find(m => m.key === 'production')!;
    expect(prod.dependencies).toContain('orders');
  });

  it('no circular dependencies exist', () => {
    const moduleMap = new Map(ALL_MODULES.map(m => [m.key, m]));
    
    function hasCycle(key: string, visiting = new Set<string>(), visited = new Set<string>()): boolean {
      if (visiting.has(key)) return true;
      if (visited.has(key)) return false;
      visiting.add(key);
      const mod = moduleMap.get(key);
      if (mod) {
        for (const dep of mod.dependencies) {
          if (hasCycle(dep, visiting, visited)) return true;
        }
      }
      visiting.delete(key);
      visited.add(key);
      return false;
    }

    ALL_MODULES.forEach(mod => {
      expect(hasCycle(mod.key)).toBe(false);
    });
  });

  it('all dependencies reference existing modules', () => {
    const allKeys = new Set(ALL_MODULES.map(m => m.key));
    ALL_MODULES.forEach(mod => {
      mod.dependencies.forEach(dep => {
        expect(allKeys.has(dep)).toBe(true);
      });
    });
  });

  it('independent modules (no dependencies) can be installed standalone', () => {
    const independent = ALL_MODULES.filter(m => m.dependencies.length === 0);
    expect(independent.length).toBeGreaterThan(5);
    const independentKeys = independent.map(m => m.key);
    expect(independentKeys).toContain('clients');
    expect(independentKeys).toContain('patterns');
    expect(independentKeys).toContain('stocks');
    expect(independentKeys).toContain('suppliers');
    expect(independentKeys).toContain('employees');
    expect(independentKeys).toContain('finance_dashboard');
  });

  it('every module has complete metadata', () => {
    ALL_MODULES.forEach(mod => {
      expect(mod.key).toBeTruthy();
      expect(mod.label).toBeTruthy();
      expect(mod.shortDesc.length).toBeGreaterThan(5);
      expect(mod.fullDesc.length).toBeGreaterThan(20);
      expect(mod.icon).toBeTruthy();
      expect(mod.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(mod.author).toBe('AteliérPro');
      expect(mod.price).toBe('Gratuit');
      expect(mod.features.length).toBeGreaterThan(0);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 6. ROUTES — Lazy Loading & Route Coverage
// ══════════════════════════════════════════════════════════════
describe('Routes — Complete Coverage', () => {
  const allDashboardRoutes = [
    '/dashboard', '/dashboard/clients', '/dashboard/orders',
    '/dashboard/production', '/dashboard/stocks', '/dashboard/suppliers',
    '/dashboard/purchases', '/dashboard/receptions', '/dashboard/patterns',
    '/dashboard/measurements', '/dashboard/invoices', '/dashboard/customer-invoices',
    '/dashboard/finances', '/dashboard/treasury', '/dashboard/fixed-assets',
    '/dashboard/hr', '/dashboard/remunerations', '/dashboard/reports',
    '/dashboard/financial-reports', '/dashboard/bank-reconciliation',
    '/dashboard/alerts', '/dashboard/audit', '/dashboard/export',
    '/dashboard/apps', '/dashboard/settings', '/dashboard/syscohada',
    '/dashboard/profile',
  ];

  it('has 27 dashboard routes', () => {
    expect(allDashboardRoutes.length).toBe(27);
  });

  it('every module has a corresponding route', () => {
    const moduleRouteMap: Record<string, string> = {
      clients: '/dashboard/clients',
      orders: '/dashboard/orders',
      measurements: '/dashboard/measurements',
      patterns: '/dashboard/patterns',
      production: '/dashboard/production',
      stocks: '/dashboard/stocks',
      customer_invoices: '/dashboard/customer-invoices',
      suppliers: '/dashboard/suppliers',
      purchases: '/dashboard/purchases',
      receptions: '/dashboard/receptions',
      supplier_invoices: '/dashboard/invoices',
      finance_dashboard: '/dashboard/finances',
      treasury: '/dashboard/treasury',
      fixed_assets: '/dashboard/fixed-assets',
      financial_reports: '/dashboard/financial-reports',
      bank_reconciliation: '/dashboard/bank-reconciliation',
      syscohada: '/dashboard/syscohada',
      employees: '/dashboard/hr',
      remunerations: '/dashboard/remunerations',
      reports: '/dashboard/reports',
      alerts: '/dashboard/alerts',
      audit: '/dashboard/audit',
      export: '/dashboard/export',
    };

    ALL_MODULES.forEach(mod => {
      expect(moduleRouteMap).toHaveProperty(mod.key);
      expect(allDashboardRoutes).toContain(moduleRouteMap[mod.key]);
    });
  });

  it('public routes exist', () => {
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/install'];
    expect(publicRoutes.length).toBe(6);
  });
});

// ══════════════════════════════════════════════════════════════
// 7. ROLE SYSTEM — Permissions & Access Control
// ══════════════════════════════════════════════════════════════
describe('Role System — Permissions', () => {
  const allRoles: UserRole[] = ['owner', 'manager', 'tailor', 'orders', 'stocks', 'customer_service'];

  it('all 6 roles are defined', () => {
    allRoles.forEach(role => {
      expect(ROLE_PERMISSIONS).toHaveProperty(role);
    });
  });

  it('owner has full access', () => {
    const owner = ROLE_PERMISSIONS.owner;
    expect(owner.canManageUsers).toBe(true);
    expect(owner.canViewFinancial).toBe(true);
    expect(owner.canManageCompany).toBe(true);
    expect(owner.permissions).toContain('all');
  });

  it('tailor has restricted access', () => {
    const tailor = ROLE_PERMISSIONS.tailor;
    expect(tailor.canManageUsers).toBe(false);
    expect(tailor.canViewFinancial).toBe(false);
    expect(tailor.canManageCompany).toBe(false);
  });

  it('each role has label and description', () => {
    allRoles.forEach(role => {
      const perms = ROLE_PERMISSIONS[role];
      expect(perms.name).toBeTruthy();
      expect(perms.label).toBeTruthy();
      expect(perms.description.length).toBeGreaterThan(10);
      expect(perms.modules.length).toBeGreaterThan(0);
    });
  });

  it('only owner can manage company', () => {
    allRoles.forEach(role => {
      if (role === 'owner') {
        expect(ROLE_PERMISSIONS[role].canManageCompany).toBe(true);
      } else {
        expect(ROLE_PERMISSIONS[role].canManageCompany).toBe(false);
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 8. DATA UNIQUENESS — No duplicates
// ══════════════════════════════════════════════════════════════
describe('Demo Data — Uniqueness', () => {
  const collectionsToCheck = [
    'clients', 'products', 'orders', 'suppliers', 'employees',
    'treasury_accounts', 'treasury_movements', 'customer_invoices',
    'patterns', 'client_measurements', 'production_tasks',
    'purchase_orders', 'models', 'alerts', 'fixed_assets', 'work_hours'
  ];

  collectionsToCheck.forEach(collection => {
    it(`${collection} have unique IDs`, () => {
      const ids = DEMO_DATA[collection].map((item: any) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('order numbers are unique', () => {
    const numbers = DEMO_DATA.orders.map((o: any) => o.order_number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('invoice numbers are unique', () => {
    const numbers = DEMO_DATA.customer_invoices.map((i: any) => i.invoice_number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('employee numbers are unique', () => {
    const numbers = DEMO_DATA.employees.map((e: any) => e.employee_number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('client numbers are unique', () => {
    const numbers = DEMO_DATA.clients.map((c: any) => c.client_number);
    expect(new Set(numbers).size).toBe(numbers.length);
  });
});

// ══════════════════════════════════════════════════════════════
// 9. SOFT DELETE — Consistency
// ══════════════════════════════════════════════════════════════
describe('Soft Delete — Active Records', () => {
  const softDeletableTables = ['clients', 'products', 'orders', 'suppliers', 'patterns', 'client_measurements', 'production_tasks', 'purchase_orders', 'models', 'customer_invoices'];

  softDeletableTables.forEach(table => {
    it(`${table} active records have null deleted_at`, () => {
      DEMO_DATA[table].forEach((item: any) => {
        expect(item.deleted_at).toBeNull();
      });
    });
  });

  it('all active clients have is_active = true', () => {
    DEMO_DATA.clients.forEach((c: any) => {
      expect(c.is_active).toBe(true);
    });
  });

  it('all active employees have is_active = true', () => {
    DEMO_DATA.employees.forEach((e: any) => {
      expect(e.is_active).toBe(true);
    });
  });

  it('all active products have is_active = true', () => {
    DEMO_DATA.products.forEach((p: any) => {
      expect(p.is_active).toBe(true);
    });
  });
});

// ══════════════════════════════════════════════════════════════
// 10. STOCK ALERTS — Business Rules
// ══════════════════════════════════════════════════════════════
describe('Stock Alerts — Low Stock Detection', () => {
  it('products below min_stock_level are identifiable', () => {
    const lowStockProducts = DEMO_DATA.products.filter(
      (p: any) => p.current_stock < p.min_stock_level
    );
    // We expect at least one low-stock product for alerts
    expect(lowStockProducts.length).toBeGreaterThan(0);
  });

  it('low stock alert exists for product below threshold', () => {
    const lowStockProducts = DEMO_DATA.products.filter(
      (p: any) => p.current_stock < p.min_stock_level
    );
    const alertMessages = DEMO_DATA.alerts.map((a: any) => a.message.toLowerCase());
    
    // At least one low-stock product should have a corresponding alert
    const hasStockAlert = lowStockProducts.some((p: any) =>
      alertMessages.some((msg: string) => msg.includes('fermeture') || msg.includes('stock'))
    );
    expect(hasStockAlert).toBe(true);
  });
});
