import { describe, it, expect, vi } from 'vitest';
import { ALL_MODULES, MODULE_CATEGORIES, ModuleDefinition } from '@/hooks/use-company-modules';

describe('Module Definitions', () => {
  it('should have all expected categories', () => {
    expect(MODULE_CATEGORIES).toContain('Couture');
    expect(MODULE_CATEGORIES).toContain('Production');
    expect(MODULE_CATEGORIES).toContain('Commercial');
    expect(MODULE_CATEGORIES).toContain('Achats');
    expect(MODULE_CATEGORIES).toContain('Finance');
    expect(MODULE_CATEGORIES).toContain('Ressources Humaines');
    expect(MODULE_CATEGORIES).toContain('Outils');
  });

  it('should have unique module keys', () => {
    const keys = ALL_MODULES.map(m => m.key);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });

  it('should have at least 20 modules', () => {
    expect(ALL_MODULES.length).toBeGreaterThanOrEqual(20);
  });

  it('every module should have required fields', () => {
    ALL_MODULES.forEach((mod: ModuleDefinition) => {
      expect(mod.key).toBeTruthy();
      expect(mod.label).toBeTruthy();
      expect(mod.shortDesc).toBeTruthy();
      expect(mod.fullDesc).toBeTruthy();
      expect(mod.icon).toBeTruthy();
      expect(mod.category).toBeTruthy();
      expect(Array.isArray(mod.dependencies)).toBe(true);
      expect(mod.version).toBeTruthy();
      expect(mod.author).toBe('AteliérPro');
      expect(Array.isArray(mod.features)).toBe(true);
      expect(mod.features.length).toBeGreaterThan(0);
    });
  });

  it('all dependencies should reference existing modules', () => {
    const allKeys = new Set(ALL_MODULES.map(m => m.key));
    ALL_MODULES.forEach((mod) => {
      mod.dependencies.forEach((dep) => {
        expect(allKeys.has(dep)).toBe(true);
      });
    });
  });

  it('should not have circular dependencies', () => {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const moduleMap = new Map(ALL_MODULES.map(m => [m.key, m]));

    function hasCycle(key: string): boolean {
      if (visiting.has(key)) return true;
      if (visited.has(key)) return false;
      
      visiting.add(key);
      const mod = moduleMap.get(key);
      if (mod) {
        for (const dep of mod.dependencies) {
          if (hasCycle(dep)) return true;
        }
      }
      visiting.delete(key);
      visited.add(key);
      return false;
    }

    ALL_MODULES.forEach(mod => {
      visited.clear();
      visiting.clear();
      expect(hasCycle(mod.key)).toBe(false);
    });
  });

  it('every module category should match one of the defined categories', () => {
    ALL_MODULES.forEach(mod => {
      expect(MODULE_CATEGORIES).toContain(mod.category);
    });
  });

  it('core couture modules should exist', () => {
    const coutureKeys = ALL_MODULES.filter(m => m.category === 'Couture').map(m => m.key);
    expect(coutureKeys).toContain('clients');
    expect(coutureKeys).toContain('orders');
    expect(coutureKeys).toContain('measurements');
    expect(coutureKeys).toContain('patterns');
  });

  it('orders should depend on clients', () => {
    const orders = ALL_MODULES.find(m => m.key === 'orders');
    expect(orders?.dependencies).toContain('clients');
  });

  it('purchases should depend on suppliers', () => {
    const purchases = ALL_MODULES.find(m => m.key === 'purchases');
    expect(purchases?.dependencies).toContain('suppliers');
  });

  it('treasury should depend on finance_dashboard', () => {
    const treasury = ALL_MODULES.find(m => m.key === 'treasury');
    expect(treasury?.dependencies).toContain('finance_dashboard');
  });

  it('remunerations should depend on employees', () => {
    const remu = ALL_MODULES.find(m => m.key === 'remunerations');
    expect(remu?.dependencies).toContain('employees');
  });
});
