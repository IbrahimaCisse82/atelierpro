import { describe, it, expect } from 'vitest';
import { canRoleAccess } from '@/lib/route-access';

describe('canRoleAccess', () => {
  it('un tailleur ne peut pas ouvrir les finances', () => {
    expect(canRoleAccess('/dashboard/finances', 'tailor')).toBe(false);
  });
  it('le gérant peut ouvrir les finances', () => {
    expect(canRoleAccess('/dashboard/finances', 'manager')).toBe(true);
  });
  it('seul le propriétaire gère les applications', () => {
    expect(canRoleAccess('/dashboard/apps', 'manager')).toBe(false);
    expect(canRoleAccess('/dashboard/apps', 'owner')).toBe(true);
  });
  it('le tailleur accède à la production', () => {
    expect(canRoleAccess('/dashboard/production', 'tailor')).toBe(true);
  });
});
