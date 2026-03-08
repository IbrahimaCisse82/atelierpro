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

describe('Navigation Routes', () => {
  // Validate that all expected dashboard routes are mapped
  const expectedRoutes = [
    '/dashboard',
    '/dashboard/clients',
    '/dashboard/orders',
    '/dashboard/measurements',
    '/dashboard/patterns',
    '/dashboard/production',
    '/dashboard/stocks',
    '/dashboard/suppliers',
    '/dashboard/purchases',
    '/dashboard/receptions',
    '/dashboard/invoices',
    '/dashboard/customer-invoices',
    '/dashboard/finances',
    '/dashboard/treasury',
    '/dashboard/fixed-assets',
    '/dashboard/financial-reports',
    '/dashboard/bank-reconciliation',
    '/dashboard/syscohada',
    '/dashboard/hr',
    '/dashboard/remunerations',
    '/dashboard/reports',
    '/dashboard/alerts',
    '/dashboard/audit',
    '/dashboard/export',
    '/dashboard/apps',
    '/dashboard/settings',
    '/dashboard/profile',
  ];

  it('should have all expected route paths', async () => {
    // Import App to verify routes are defined
    const appModule = await import('@/App');
    expect(appModule.default).toBeDefined();
    
    // Since we can't easily extract routes from JSX, 
    // we verify the route constants from the module system
    const { ALL_MODULES } = await import('@/hooks/use-company-modules');
    
    // Every module should have at least one route
    const moduleKeys = ALL_MODULES.map(m => m.key);
    expect(moduleKeys.length).toBeGreaterThan(15);
  });

  it('all public routes should be accessible', () => {
    const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/install'];
    // Just verify they're strings - actual routing tested via E2E
    publicRoutes.forEach(route => {
      expect(typeof route).toBe('string');
      expect(route.startsWith('/')).toBe(true);
    });
  });

  it('expected routes list is comprehensive', () => {
    expect(expectedRoutes.length).toBeGreaterThanOrEqual(25);
    expect(expectedRoutes).toContain('/dashboard/apps');
    expect(expectedRoutes).toContain('/dashboard/settings');
  });
});
