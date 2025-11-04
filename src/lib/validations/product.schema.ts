// Schémas de validation Zod pour les produits
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Le nom du produit est requis")
    .max(200, "Le nom ne doit pas dépasser 200 caractères"),
  sku: z.string()
    .trim()
    .max(50, "Le SKU ne doit pas dépasser 50 caractères")
    .optional()
    .nullable()
    .or(z.literal('')),
  description: z.string()
    .max(1000, "La description ne doit pas dépasser 1000 caractères")
    .optional()
    .nullable()
    .or(z.literal('')),
  unit_price: z.coerce.number()
    .min(0, "Le prix unitaire doit être positif")
    .default(0),
  current_stock: z.coerce.number()
    .min(0, "Le stock ne peut pas être négatif")
    .default(0),
  min_stock_level: z.coerce.number()
    .min(0, "Le stock minimum doit être positif")
    .default(0),
  unit: z.enum(['m', 'kg', 'unit', 'roll', 'piece'])
    .default('m'),
  category_id: z.string().uuid().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
});

export type ProductFormData = z.infer<typeof productSchema>;
