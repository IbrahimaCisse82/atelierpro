import { describe, it, expect, vi } from 'vitest';

// Mock supabase
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
import { Login } from '@/components/auth/Login';
import React from 'react';

function LoginWrapper() {
  return (
    <AuthProvider>
      <Login onSwitchToRegister={() => {}} />
    </AuthProvider>
  );
}

describe('Login Component', () => {
  it('renders login form', async () => {
    renderWithProviders(<LoginWrapper />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });
  });

  it('renders demo button', async () => {
    renderWithProviders(<LoginWrapper />);
    
    await waitFor(() => {
      const demoBtn = screen.getByText(/démo/i);
      expect(demoBtn).toBeInTheDocument();
    });
  });

  it('has password input of type password', async () => {
    renderWithProviders(<LoginWrapper />);
    
    await waitFor(() => {
      const passwordInput = screen.getByLabelText(/mot de passe/i);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  it('has email input of type email', async () => {
    renderWithProviders(<LoginWrapper />);
    
    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });
});
