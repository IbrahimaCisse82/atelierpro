import { describe, it, expect, vi } from 'vitest';

// Mock supabase
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

import { renderWithProviders, screen, waitFor } from '@/test/test-utils';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import React from 'react';

function ThemeReader() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
    </div>
  );
}

describe('ThemeContext', () => {
  it('defaults to system theme', () => {
    renderWithProviders(<ThemeReader />);
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('can switch to dark mode', async () => {
    renderWithProviders(<ThemeReader />);
    screen.getByTestId('set-dark').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('dark');
    });
  });

  it('can switch to light mode', async () => {
    renderWithProviders(<ThemeReader />);
    screen.getByTestId('set-light').click();
    
    await waitFor(() => {
      expect(screen.getByTestId('theme').textContent).toBe('light');
    });
  });
});
