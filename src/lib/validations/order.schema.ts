// Schémas de validation Zod pour les commandes
import { z } from 'zod';

export const orderSchema = z.object({
  client_id: z.string().uuid({ message: "Client invalide" }),
  order_date: z.coerce.date({ required_error: "Date de commande requise" }),
  delivery_date: z.coerce.date().optional().nullable(),
  due_date: z.coerce.date().optional().nullable(),
  total_amount: z.coerce.number()
    .min(0, "Le montant doit être positif")
    .default(0),
  paid_amount: z.coerce.number()
    .min(0, "Le montant payé doit être positif")
    .default(0),
  measurements_id: z.string().uuid().optional().nullable(),
  assigned_tailor_id: z.string().uuid().optional().nullable(),
  notes: z.string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional()
    .nullable(),
  reference_photos: z.array(z.string()).optional().nullable(),
  fabric_photos: z.array(z.string()).optional().nullable(),
}).refine((data) => {
  // Validation: paid_amount ne peut pas dépasser total_amount
  return data.paid_amount <= data.total_amount;
}, {
  message: "Le montant payé ne peut pas dépasser le montant total",
  path: ["paid_amount"]
}).refine((data) => {
  // Validation: delivery_date doit être après order_date
  if (data.delivery_date && data.order_date) {
    return data.delivery_date >= data.order_date;
  }
  return true;
}, {
  message: "La date de livraison doit être après la date de commande",
  path: ["delivery_date"]
});

export type OrderFormData = z.infer<typeof orderSchema>;
