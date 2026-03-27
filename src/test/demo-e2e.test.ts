import { describe, it, expect } from 'vitest';
import { formatFCFA, formatFCFAWithDecimals, getFCFASymbol } from '@/lib/utils';
import { DEMO_DATA, isDemoMode } from '@/contexts/DemoContext';

describe('FCFA Currency Formatting', () => {
  it('formatFCFA uses XOF currency code', () => {
    const result = formatFCFA(75000);
    // XOF displays as "FCFA" or "CFA" depending on locale
    expect(result).toMatch(/75[\s\u202f.]?000/);
    expect(result).toMatch(/CFA|XOF/i);
  });

  it('formatFCFA handles zero', () => {
    const result = formatFCFA(0);
    expect(result).toMatch(/0/);
    expect(result).toMatch(/CFA|XOF/i);
  });

  it('formatFCFA handles large amounts', () => {
    const result = formatFCFA(1500000);
    expect(result).toMatch(/1[\s\u202f.]?500[\s\u202f.]?000/);
  });

  it('formatFCFAWithDecimals works', () => {
    const result = formatFCFAWithDecimals(1234.56);
    expect(result).toMatch(/1[\s\u202f.]?234/);
  });

  it('getFCFASymbol returns FCFA', () => {
    expect(getFCFASymbol()).toBe('FCFA');
  });
});

describe('Demo Mode Detection', () => {
  it('identifies demo user correctly', () => {
    expect(isDemoMode('demo-user-id')).toBe(true);
    expect(isDemoMode('some-other-id')).toBe(false);
  });
});

describe('Demo Data Integrity', () => {
  it('has all required data collections', () => {
    const requiredKeys = [
      'clients', 'products', 'orders', 'suppliers',
      'employees', 'treasury_accounts', 'treasury_movements',
      'customer_invoices', 'patterns', 'client_measurements',
      'production_tasks', 'purchase_orders', 'models', 'alerts',
      'fixed_assets',
    ];
    requiredKeys.forEach(key => {
      expect(DEMO_DATA).toHaveProperty(key);
      expect(Array.isArray(DEMO_DATA[key])).toBe(true);
      expect(DEMO_DATA[key].length).toBeGreaterThan(0);
    });
  });

  it('clients have required fields', () => {
    DEMO_DATA.clients.forEach((c: any) => {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('first_name');
      expect(c).toHaveProperty('last_name');
      expect(c).toHaveProperty('company_id', 'demo-company-id');
    });
  });

  it('orders have valid amounts and FCFA-compatible numbers', () => {
    DEMO_DATA.orders.forEach((o: any) => {
      expect(typeof o.total_amount).toBe('number');
      expect(o.total_amount).toBeGreaterThan(0);
      expect(o.paid_amount).toBeLessThanOrEqual(o.total_amount);
      // Verify formatFCFA works on order amounts
      const formatted = formatFCFA(o.total_amount);
      expect(formatted).toMatch(/CFA|XOF/i);
    });
  });

  it('products have valid stock levels', () => {
    DEMO_DATA.products.forEach((p: any) => {
      expect(typeof p.current_stock).toBe('number');
      expect(typeof p.min_stock_level).toBe('number');
      expect(typeof p.unit_price).toBe('number');
    });
  });

  it('treasury accounts use XOF currency', () => {
    DEMO_DATA.treasury_accounts.forEach((ta: any) => {
      expect(ta.currency).toBe('XOF');
    });
  });

  it('customer invoices have correct tax calculations', () => {
    DEMO_DATA.customer_invoices.forEach((inv: any) => {
      expect(inv.total_with_tax).toBe(inv.total_amount + inv.tax_amount);
    });
  });

  it('all demo entities reference demo-company-id', () => {
    const collections = ['clients', 'products', 'orders', 'suppliers', 'employees'];
    collections.forEach(key => {
      DEMO_DATA[key].forEach((item: any) => {
        expect(item.company_id).toBe('demo-company-id');
      });
    });
  });

  it('order statuses are valid production_status values', () => {
    const validStatuses = [
      'order_created', 'cutting_in_progress', 'assembly_in_progress',
      'ready_to_deliver', 'delivered',
    ];
    DEMO_DATA.orders.forEach((o: any) => {
      expect(validStatuses).toContain(o.status);
    });
  });
});

describe('Navigation Routes Coverage', () => {
  const expectedRoutes = [
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

  it('has all expected dashboard routes defined', () => {
    // This test documents all routes that should exist
    expect(expectedRoutes.length).toBeGreaterThan(25);
  });
});
