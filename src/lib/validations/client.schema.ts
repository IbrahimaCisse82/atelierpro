// Schémas de validation Zod pour les clients
import { z } from 'zod';

export const clientSchema = z.object({
  first_name: z.string()
    .trim()
    .min(1, "Le prénom est requis")
    .max(100, "Le prénom ne doit pas dépasser 100 caractères"),
  last_name: z.string()
    .trim()
    .min(1, "Le nom est requis")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  email: z.string()
    .trim()
    .email("Email invalide")
    .max(255, "L'email ne doit pas dépasser 255 caractères")
    .optional()
    .nullable()
    .or(z.literal('')),
  phone: z.string()
    .trim()
    .regex(/^(\+?[0-9]{8,15})?$/, "Numéro de téléphone invalide (8-15 chiffres)")
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string()
    .max(500, "L'adresse ne doit pas dépasser 500 caractères")
    .optional()
    .nullable()
    .or(z.literal('')),
  gender: z.enum(['male', 'female', 'other'])
    .optional()
    .nullable(),
  notes: z.string()
    .max(1000, "Les notes ne doivent pas dépasser 1000 caractères")
    .optional()
    .nullable()
    .or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;
