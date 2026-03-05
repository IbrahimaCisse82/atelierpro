import { z } from 'zod';

export const employeeSchema = z.object({
  employee_number: z.string().trim().max(20).optional().nullable(),
  hire_date: z.string().optional().nullable(),
  hourly_rate: z.number().min(0, "Le taux horaire doit être positif").optional().nullable(),
  profile_id: z.string().uuid().optional().nullable(),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
