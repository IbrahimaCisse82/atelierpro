import { z } from 'zod';

const positiveNumber = z.number().min(0, "Doit être positif").optional().nullable();

export const measurementSchema = z.object({
  client_id: z.string().uuid("Client requis"),
  measurement_type: z.string().max(50).optional().nullable(),
  chest: positiveNumber,
  waist: positiveNumber,
  hips: positiveNumber,
  shoulder_width: positiveNumber,
  arm_length: positiveNumber,
  back_length: positiveNumber,
  neck: positiveNumber,
  inseam: positiveNumber,
  notes: z.string().max(1000).optional().nullable(),
});

export type MeasurementFormData = z.infer<typeof measurementSchema>;
