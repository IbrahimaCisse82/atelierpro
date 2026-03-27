import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase before importing anything that uses it
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({}),
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

import { renderWithProviders, screen, waitFor } from '@/test/test-utils';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

// Helper component to read auth state
function AuthStateReader() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user">{auth.user ? auth.user.email : 'null'}</span>
      <span data-testid="error">{auth.error || 'none'}</span>
      <button data-testid="login-demo" onClick={auth.loginAsDemo}>Demo</button>
      <button data-testid="logout" onClick={auth.logout}>Logout</button>
    </div>
  );
}

function renderAuth() {
  return renderWithProviders(
    <AuthProvider>
      <AuthStateReader />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  it('starts with loading state then resolves to unauthenticated', async () => {
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('loginAsDemo sets demo user correctly', async () => {
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Click demo login
    screen.getByTestId('login-demo').click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
      expect(screen.getByTestId('user').textContent).toBe('demo@atelierpro.app');
    });
  });

  it('logout resets state to unauthenticated', async () => {
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    // Login demo then logout
    screen.getByTestId('login-demo').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    screen.getByTestId('logout').click();

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  it('demo user has correct properties', async () => {
    const DemoUserDetails = () => {
      const { user, company } = useAuth();
      if (!user) return <div data-testid="no-user">none</div>;
      return (
        <div>
          <span data-testid="user-id">{user.id}</span>
          <span data-testid="user-role">{user.role}</span>
          <span data-testid="company-id">{user.companyId}</span>
          <span data-testid="company-name">{company?.name}</span>
          <span data-testid="first-name">{user.firstName}</span>
        </div>
      );
    };

    renderWithProviders(
      <AuthProvider>
        <DemoUserDetails />
        <AuthStateReader />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    screen.getByTestId('login-demo').click();

    await waitFor(() => {
      expect(screen.getByTestId('user-id').textContent).toBe('demo-user-id');
      expect(screen.getByTestId('user-role').textContent).toBe('owner');
      expect(screen.getByTestId('company-id').textContent).toBe('demo-company-id');
      expect(screen.getByTestId('company-name').textContent).toBe('Atelier Démo');
      expect(screen.getByTestId('first-name').textContent).toBe('Utilisateur');
    });
  });

  it('switchRole changes demo user role', async () => {
    const RoleSwitcher = () => {
      const { user, switchRole } = useAuth();
      return (
        <div>
          <span data-testid="current-role">{user?.role || 'none'}</span>
          <button data-testid="switch-tailor" onClick={() => switchRole('tailor')}>Tailor</button>
          <button data-testid="switch-manager" onClick={() => switchRole('manager')}>Manager</button>
        </div>
      );
    };

    renderWithProviders(
      <AuthProvider>
        <RoleSwitcher />
        <AuthStateReader />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    screen.getByTestId('login-demo').click();

    await waitFor(() => {
      expect(screen.getByTestId('current-role').textContent).toBe('owner');
    });

    screen.getByTestId('switch-tailor').click();
    await waitFor(() => {
      expect(screen.getByTestId('current-role').textContent).toBe('tailor');
    });

    screen.getByTestId('switch-manager').click();
    await waitFor(() => {
      expect(screen.getByTestId('current-role').textContent).toBe('manager');
    });
  });
});
