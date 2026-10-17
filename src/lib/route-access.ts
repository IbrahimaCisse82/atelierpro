// Pages réservées par rôle (les autres pages sont ouvertes à tous les rôles connectés).
const FINANCE = ['/dashboard/finances', '/dashboard/financial-reports', '/dashboard/syscohada',
  '/dashboard/treasury', '/dashboard/bank-reconciliation', '/dashboard/fixed-assets', '/dashboard/remunerations'];

export const RESTRICTED_ROUTES: Record<string, string[]> = {
  ...Object.fromEntries(FINANCE.map((r) => [r, ['owner', 'manager']])),
  '/dashboard/audit': ['owner', 'manager'],
  '/dashboard/hr': ['owner', 'manager'],
  '/dashboard/export': ['owner', 'manager'],
  '/dashboard/apps': ['owner'],
};

export function canRoleAccess(route: string, role?: string | null): boolean {
  const allowed = RESTRICTED_ROUTES[route];
  if (!allowed) return true;
  return !!role && allowed.includes(role);
}
