import { describe, it, expect } from 'vitest';
import {
  getRemainingBalance,
  canAcceptPayment,
  needsDepositHandling,
  isFullyPaid,
} from '@/lib/order-rules';

// Lot 1 — Intégrité des paiements : règles métier (miroir des triggers SQL)
describe('Règles de paiement des commandes', () => {
  const order = { total_amount: 150000, paid_amount: 50000, status: 'order_created' };

  it('solde = total - payé (150 000 - 50 000 = 100 000)', () => {
    expect(getRemainingBalance(order)).toBe(100000);
  });

  it('le solde ne devient jamais négatif', () => {
    expect(getRemainingBalance({ total_amount: 50000, paid_amount: 80000, status: 'paid' })).toBe(0);
  });

  it('accepte un paiement égal au solde restant', () => {
    expect(canAcceptPayment(order, 100000).ok).toBe(true);
  });

  it('refuse un paiement supérieur au solde restant', () => {
    const res = canAcceptPayment(order, 100001);
    expect(res.ok).toBe(false);
    expect(res.reason).toContain('100000');
  });

  it('refuse un paiement sur une commande annulée', () => {
    expect(canAcceptPayment({ ...order, status: 'cancelled' }, 1000).ok).toBe(false);
  });

  it('refuse un montant nul ou négatif', () => {
    expect(canAcceptPayment(order, 0).ok).toBe(false);
    expect(canAcceptPayment(order, -500).ok).toBe(false);
  });

  it("l'annulation d'une commande avec acompte exige un choix (remboursement ou conservation)", () => {
    expect(needsDepositHandling(order)).toBe(true);
    expect(needsDepositHandling({ ...order, paid_amount: 0 })).toBe(false);
  });

  it('statut payé cohérent : paid_amount >= total_amount', () => {
    expect(isFullyPaid({ total_amount: 150000, paid_amount: 150000, status: 'paid' })).toBe(true);
    expect(isFullyPaid(order)).toBe(false);
  });
});
