import { describe, it, expect } from 'vitest';
import { getDemoRows, demoInsert, demoUpdate, demoRemove } from '@/contexts/DemoContext';

describe('Mode démo : modifications en mémoire', () => {
  it('un client ajouté apparaît dans la liste', () => {
    const before = getDemoRows('clients').length;
    const row = demoInsert('clients', { first_name: 'Awa', last_name: 'Ba' });
    expect(getDemoRows('clients').length).toBe(before + 1);
    expect(getDemoRows<any>('clients')[0].id).toBe(row.id);
  });
  it('une modification est conservée', () => {
    demoUpdate('clients', 'demo-c1', { phone: '+221 77 000 00 00' });
    expect(getDemoRows<any>('clients').find((c) => c.id === 'demo-c1').phone).toBe('+221 77 000 00 00');
  });
  it('un élément supprimé (doux ou définitif) disparaît', () => {
    demoUpdate('clients', 'demo-c2', { deleted_at: new Date().toISOString() });
    demoRemove('clients', 'demo-c3');
    const ids = getDemoRows<any>('clients').map((c) => c.id);
    expect(ids).not.toContain('demo-c2');
    expect(ids).not.toContain('demo-c3');
  });
});
