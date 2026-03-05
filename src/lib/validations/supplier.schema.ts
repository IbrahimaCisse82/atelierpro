import { z } from 'zod';

export const supplierSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100, "100 caractères maximum"),
  contact_person: z.string().trim().max(100).optional().nullable(),
  email: z.string().email("Email invalide").optional().nullable().or(z.literal('')),
  phone: z.string().regex(/^[0-9+\s()\-]+$/, "Numéro invalide").optional().nullable().or(z.literal('')),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  payment_terms: z.number().int().min(0).max(365).optional().nullable(),
  credit_limit: z.number().min(0).optional().nullable(),
  tax_id: z.string().max(50).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
