import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('merges class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('handles undefined values', () => {
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
    });

    it('handles conditional classes', () => {
      const isActive = true;
      const result = cn('base', isActive && 'active');
      expect(result).toContain('active');
    });

    it('merges tailwind conflicts correctly', () => {
      // tailwind-merge should resolve conflicts
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('handles empty inputs', () => {
      expect(cn()).toBe('');
      expect(cn('')).toBe('');
    });
  });
});

describe('Environment', () => {
  it('should have import.meta.env defined', () => {
    expect(import.meta).toBeDefined();
    expect(import.meta.env).toBeDefined();
  });
});
