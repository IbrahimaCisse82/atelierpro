import { useCRUD } from './use-crud';
import { Database } from "@/integrations/supabase/types";

type Employee = Database['public']['Tables']['employees']['Row'];

export const useEmployees = () => {
  const {
    items: employees,
    loading: isLoadingEmployees,
    error: employeesError,
    create: createEmployee,
  } = useCRUD<Employee>({
    table: 'employees',
    select: `
      *,
      profiles:profile_id (
        first_name,
        last_name,
        email
      )
    `,
    orderBy: { column: 'created_at', ascending: false },
  });

  return {
    employees,
    isLoadingEmployees,
    employeesError,
    createEmployee: (data: Partial<Employee>) => createEmployee(data),
    isCreatingEmployee: false,
    updateWorkHours: (workHoursId: string, workHoursData: any) => Promise.resolve(),
  };
};
