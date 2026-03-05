import { z } from 'zod';

export const invoiceSchema = z.object({
  invoice_number: z.string().trim().min(1, "Numéro de facture requis").max(50),
  invoice_date: z.string().min(1, "Date requise"),
  due_date: z.string().optional().nullable(),
  order_id: z.string().uuid().optional().nullable(),
  total_amount: z.number().min(0, "Montant positif requis"),
  tax_amount: z.number().min(0).default(0),
  total_with_tax: z.number().min(0).default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;
