import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Employee = Database['public']['Tables']['employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export const useEmployees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        profiles:profile_id (
          first_name,
          last_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des employés:', error);
      throw error;
    }

    return data || [];
  };

  const createEmployee = async (employeeData: Omit<EmployeeInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Employee> => {
    const { data, error } = await supabase
      .from('employees')
      .insert(employeeData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de l\'employé:', error);
      throw error;
    }

    return data;
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeUpdate>): Promise<Employee> => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: employees = [],
    isLoading: isLoadingEmployees,
    error: employeesError
  } = useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
  });

  // Mutations
  const createEmployeeMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employé créé",
        description: "L'employé a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'employé",
        variant: "destructive",
      });
      console.error('Erreur lors de la création de l\'employé:', error);
    },
  });

  return {
    employees,
    isLoadingEmployees,
    employeesError,
    createEmployee: createEmployeeMutation.mutate,
    isCreatingEmployee: createEmployeeMutation.isPending,
    // Mock function for compatibility
    updateWorkHours: (workHoursId: string, workHoursData: any) => Promise.resolve(),
  };
};