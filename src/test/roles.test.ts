import { describe, it, expect } from 'vitest';
import { UserRole, ROLE_PERMISSIONS } from '@/types/auth';

describe('Role Permissions', () => {
  const allRoles: UserRole[] = ['owner', 'manager', 'tailor', 'orders', 'stocks', 'customer_service'];

  it('should define permissions for all roles', () => {
    allRoles.forEach(role => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(ROLE_PERMISSIONS[role].name).toBeTruthy();
      expect(ROLE_PERMISSIONS[role].label).toBeTruthy();
      expect(ROLE_PERMISSIONS[role].description).toBeTruthy();
      expect(Array.isArray(ROLE_PERMISSIONS[role].permissions)).toBe(true);
      expect(Array.isArray(ROLE_PERMISSIONS[role].modules)).toBe(true);
    });
  });

  it('owner should have full access', () => {
    const owner = ROLE_PERMISSIONS.owner;
    expect(owner.canManageUsers).toBe(true);
    expect(owner.canViewFinancial).toBe(true);
    expect(owner.canManageCompany).toBe(true);
    expect(owner.permissions).toContain('all');
  });

  it('manager should manage users but not company', () => {
    const manager = ROLE_PERMISSIONS.manager;
    expect(manager.canManageUsers).toBe(true);
    expect(manager.canViewFinancial).toBe(true);
    expect(manager.canManageCompany).toBe(false);
  });

  it('tailor should have limited access', () => {
    const tailor = ROLE_PERMISSIONS.tailor;
    expect(tailor.canManageUsers).toBe(false);
    expect(tailor.canViewFinancial).toBe(false);
    expect(tailor.canManageCompany).toBe(false);
    expect(tailor.modules).toContain('production');
    expect(tailor.modules).toContain('measurements');
  });

  it('stocks role should access stocks and purchases', () => {
    const stocks = ROLE_PERMISSIONS.stocks;
    expect(stocks.modules).toContain('stocks');
    expect(stocks.modules).toContain('purchases');
    expect(stocks.canManageUsers).toBe(false);
  });

  it('customer_service should access clients and orders only', () => {
    const cs = ROLE_PERMISSIONS.customer_service;
    expect(cs.modules).toContain('clients');
    expect(cs.modules).toContain('orders');
    expect(cs.canManageUsers).toBe(false);
    expect(cs.canViewFinancial).toBe(false);
  });

  it('no non-owner role should manage company', () => {
    allRoles
      .filter(r => r !== 'owner')
      .forEach(role => {
        expect(ROLE_PERMISSIONS[role].canManageCompany).toBe(false);
      });
  });
});
