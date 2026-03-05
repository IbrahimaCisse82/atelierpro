import { z } from 'zod';

export const patternSchema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(100, "100 caractères maximum"),
  description: z.string().max(500).optional().nullable(),
  size: z.string().max(20).optional().nullable(),
  model_id: z.string().uuid().optional().nullable(),
  file_url: z.string().url("URL invalide").optional().nullable().or(z.literal('')),
});

export type PatternFormData = z.infer<typeof patternSchema>;
