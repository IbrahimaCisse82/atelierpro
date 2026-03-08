import { describe, it, expect, vi } from 'vitest';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  },
}));

import { DEMO_DATA, isDemoMode } from '@/contexts/DemoContext';

describe('Demo Mode', () => {
  it('isDemoMode returns true for demo-user-id', () => {
    expect(isDemoMode('demo-user-id')).toBe(true);
  });

  it('isDemoMode returns false for real UUIDs', () => {
    expect(isDemoMode('550e8400-e29b-41d4-a716-446655440000')).toBe(false);
    expect(isDemoMode('')).toBe(false);
    expect(isDemoMode('some-other-id')).toBe(false);
  });

  it('should have demo clients data', () => {
    expect(DEMO_DATA.clients).toBeDefined();
    expect(DEMO_DATA.clients.length).toBeGreaterThan(0);
    
    DEMO_DATA.clients.forEach((client: any) => {
      expect(client.id).toBeTruthy();
      expect(client.first_name).toBeTruthy();
      expect(client.last_name).toBeTruthy();
      expect(client.company_id).toBe('demo-company-id');
    });
  });

  it('should have demo orders data', () => {
    expect(DEMO_DATA.orders).toBeDefined();
    expect(DEMO_DATA.orders.length).toBeGreaterThan(0);
    
    DEMO_DATA.orders.forEach((order: any) => {
      expect(order.order_number).toBeTruthy();
      expect(order.status).toBeTruthy();
      expect(order.company_id).toBe('demo-company-id');
      expect(typeof order.total_amount).toBe('number');
    });
  });

  it('should have demo products data', () => {
    expect(DEMO_DATA.products).toBeDefined();
    expect(DEMO_DATA.products.length).toBeGreaterThan(0);
    
    DEMO_DATA.products.forEach((product: any) => {
      expect(product.name).toBeTruthy();
      expect(typeof product.unit_price).toBe('number');
      expect(typeof product.current_stock).toBe('number');
    });
  });

  it('should have demo suppliers data', () => {
    expect(DEMO_DATA.suppliers).toBeDefined();
    expect(DEMO_DATA.suppliers.length).toBeGreaterThan(0);
  });

  it('should have demo employees data', () => {
    expect(DEMO_DATA.employees).toBeDefined();
    expect(DEMO_DATA.employees.length).toBeGreaterThan(0);
  });

  it('should have demo treasury accounts', () => {
    expect(DEMO_DATA.treasury_accounts).toBeDefined();
    expect(DEMO_DATA.treasury_accounts.length).toBeGreaterThan(0);
  });

  it('should have demo alerts with different levels', () => {
    expect(DEMO_DATA.alerts).toBeDefined();
    const levels = DEMO_DATA.alerts.map((a: any) => a.level);
    expect(levels).toContain('warning');
    expect(levels).toContain('error');
    expect(levels).toContain('info');
  });

  it('demo order references should point to valid demo clients', () => {
    const clientIds = new Set(DEMO_DATA.clients.map((c: any) => c.id));
    DEMO_DATA.orders.forEach((order: any) => {
      if (order.client_id) {
        expect(clientIds.has(order.client_id)).toBe(true);
      }
    });
  });

  it('demo purchase orders should reference valid suppliers', () => {
    const supplierIds = new Set(DEMO_DATA.suppliers.map((s: any) => s.id));
    DEMO_DATA.purchase_orders.forEach((po: any) => {
      if (po.supplier_id) {
        expect(supplierIds.has(po.supplier_id)).toBe(true);
      }
    });
  });

  it('all demo data should use demo-company-id', () => {
    Object.entries(DEMO_DATA).forEach(([table, records]) => {
      (records as any[]).forEach((record: any) => {
        if ('company_id' in record) {
          expect(record.company_id).toBe('demo-company-id');
        }
      });
    });
  });
});
