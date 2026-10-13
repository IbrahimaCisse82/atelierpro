// Règles métier des commandes (Lot 1 — intégrité des paiements).
// Ces règles sont AUSSI appliquées en base (triggers) ; elles servent ici
// à guider l'interface avant l'envoi.

export interface OrderAmounts {
  total_amount: number;
  paid_amount: number;
  status: string;
}

/** Solde restant à payer, jamais négatif. */
export function getRemainingBalance(order: OrderAmounts): number {
  return Math.max(0, order.total_amount - order.paid_amount);
}

/** Un paiement est-il acceptable sur cette commande ? */
export function canAcceptPayment(order: OrderAmounts, amount: number): { ok: boolean; reason?: string } {
  if (amount <= 0) return { ok: false, reason: 'Le montant doit être positif.' };
  if (order.status === 'cancelled') return { ok: false, reason: 'La commande est annulée.' };
  if (amount > getRemainingBalance(order)) {
    return { ok: false, reason: `Paiement supérieur au solde restant (${getRemainingBalance(order)} FCFA).` };
  }
  return { ok: true };
}

/** L'annulation exige-t-elle un choix sur l'acompte ? */
export function needsDepositHandling(order: OrderAmounts): boolean {
  return order.paid_amount > 0 && order.status !== 'cancelled';
}

export type DepositHandling = 'refund' | 'keep';

/** La commande est-elle entièrement payée ? */
export function isFullyPaid(order: OrderAmounts): boolean {
  return order.total_amount > 0 && order.paid_amount >= order.total_amount;
}
