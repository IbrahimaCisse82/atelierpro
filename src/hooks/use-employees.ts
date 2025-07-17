// Hook métier pour la gestion des employés et des heures de travail : CRUD, recherche, statistiques, feedback utilisateur toast.
import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Employee = Tables<'employees'>;
type EmployeeInsert = Tables<'employees'>['Insert'];
type EmployeeUpdate = Tables<'employees'>['Update'];
type WorkHours = Tables<'work_hours'>;
type WorkHoursInsert = Tables<'work_hours'>['Insert'];
type WorkHoursUpdate = Tables<'work_hours'>['Update'];

// Centralisation du pattern de gestion d’erreur/toast
function showErrorToast(message: string) {
  toast({
    title: "Erreur",
    description: message,
    variant: "destructive"
  });
}

export function useEmployees(): {
  employees: Employee[];
  workHours: WorkHours[];
  loading: boolean;
  error: any;
  addEmployee: (employeeData: Omit<EmployeeInsert, 'company_id' | 'created_by' | 'updated_by'>) => Promise<void>;
  updateEmployee: (employeeId: string, employeeData: Partial<EmployeeUpdate>) => Promise<void>;
  deleteEmployee: (employeeId: string) => Promise<void>;
  addWorkHours: (workHoursData: Omit<WorkHoursInsert, 'company_id' | 'created_by' | 'updated_by'>) => Promise<void>;
  updateWorkHours: (workHoursId: string, workHoursData: Partial<WorkHoursUpdate>) => Promise<void>;
  deleteWorkHours: (workHoursId: string) => Promise<void>;
  getEmployeeById: (id: string) => Employee | undefined;
  getActiveEmployees: () => Employee[];
  searchEmployees: (searchTerm: string) => Employee[];
  getWorkHoursByEmployee: (employeeId: string) => WorkHours[];
  getWorkHoursByDate: (date: string) => WorkHours[];
  getWorkHoursByDateRange: (startDate: string, endDate: string) => WorkHours[];
  getWorkHoursByOrder: (orderId: string) => WorkHours[];
  calculateEmployeeSalary: (employeeId: string, startDate: string, endDate: string) => number;
  calculateOrderCost: (orderId: string) => number;
  getEmployeeStats: () => {
    totalEmployees: number;
    activeEmployees: number;
    totalWorkHours: number;
    totalSalaryCost: number;
  } | null;
  refetch: () => void;
  refetchWorkHours: () => void;
} {
  const {
    data: employees,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Employee>({
    table: 'employees',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const {
    data: workHours,
    loading: workHoursLoading,
    refetch: refetchWorkHours
  } = useSupabaseQuery<WorkHours>({
    table: 'work_hours',
    select: '*',
    orderBy: { column: 'work_date', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Employee>('employees');
  const { create: createWorkHours, update: updateWorkHours, remove: removeWorkHours } = useSupabaseMutation<WorkHours>('work_hours');

  // Opérations sur les employés
  const addEmployee = useCallback(async (employeeData: Omit<EmployeeInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await create(employeeData);
      toast({
        title: "Employé ajouté",
        description: "L'employé a été ajouté avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible d'ajouter l'employé.");
      throw error;
    }
  }, [create, refetch]);

  const updateEmployee = useCallback(async (employeeId: string, employeeData: Partial<EmployeeUpdate>) => {
    try {
      await update(employeeId, employeeData);
      toast({
        title: "Employé modifié",
        description: "L'employé a été modifié avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de modifier l'employé.");
      throw error;
    }
  }, [update, refetch]);

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      await remove(employeeId);
      toast({
        title: "Employé supprimé",
        description: "L'employé a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de supprimer l'employé.");
      throw error;
    }
  }, [remove, refetch]);

  // Opérations sur les heures de travail
  const addWorkHours = useCallback(async (workHoursData: Omit<WorkHoursInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await createWorkHours(workHoursData);
      toast({
        title: "Heures ajoutées",
        description: "Les heures de travail ont été ajoutées avec succès.",
      });
      refetchWorkHours();
    } catch (error) {
      showErrorToast("Impossible d'ajouter les heures de travail.");
      throw error;
    }
  }, [createWorkHours, refetchWorkHours]);

  const updateWorkHours = useCallback(async (workHoursId: string, workHoursData: Partial<WorkHoursUpdate>) => {
    try {
      await updateWorkHours(workHoursId, workHoursData);
      toast({
        title: "Heures modifiées",
        description: "Les heures de travail ont été modifiées avec succès.",
      });
      refetchWorkHours();
    } catch (error) {
      showErrorToast("Impossible de modifier les heures de travail.");
      throw error;
    }
  }, [updateWorkHours, refetchWorkHours]);

  const deleteWorkHours = useCallback(async (workHoursId: string) => {
    try {
      await removeWorkHours(workHoursId);
      toast({
        title: "Heures supprimées",
        description: "Les heures de travail ont été supprimées avec succès.",
      });
      refetchWorkHours();
    } catch (error) {
      showErrorToast("Impossible de supprimer les heures de travail.");
      throw error;
    }
  }, [removeWorkHours, refetchWorkHours]);

  // Utilitaires pour les employés
  const getEmployeeById = useCallback((id: string) => {
    return employees?.find(employee => employee.id === id);
  }, [employees]);

  const getActiveEmployees = useCallback(() => {
    return employees?.filter(employee => employee.is_active) || [];
  }, [employees]);

  const searchEmployees = useCallback((searchTerm: string) => {
    if (!employees) return [];
    const term = searchTerm.toLowerCase();
    return employees.filter(employee => 
      employee.employee_number.toLowerCase().includes(term)
    );
  }, [employees]);

  // Utilitaires pour les heures de travail
  const getWorkHoursByEmployee = useCallback((employeeId: string) => {
    return workHours?.filter(workHour => workHour.employee_id === employeeId) || [];
  }, [workHours]);

  const getWorkHoursByDate = useCallback((date: string) => {
    return workHours?.filter(workHour => workHour.work_date === date) || [];
  }, [workHours]);

  const getWorkHoursByDateRange = useCallback((startDate: string, endDate: string) => {
    return workHours?.filter(workHour => 
      workHour.work_date >= startDate && workHour.work_date <= endDate
    ) || [];
  }, [workHours]);

  const getWorkHoursByOrder = useCallback((orderId: string) => {
    return workHours?.filter(workHour => workHour.order_id === orderId) || [];
  }, [workHours]);

  // Calculs de rémunération
  const calculateEmployeeSalary = useCallback((employeeId: string, startDate: string, endDate: string) => {
    const employee = getEmployeeById(employeeId);
    if (!employee) return 0;
    const employeeWorkHours = getWorkHoursByDateRange(startDate, endDate)
      .filter(workHour => workHour.employee_id === employeeId);
    const totalHours = employeeWorkHours.reduce((sum, workHour) => 
      sum + (workHour.total_hours || 0), 0
    );
    return totalHours * employee.hourly_rate;
  }, [getEmployeeById, getWorkHoursByDateRange]);

  const calculateOrderCost = useCallback((orderId: string) => {
    const orderWorkHours = getWorkHoursByOrder(orderId);
    return orderWorkHours.reduce((totalCost, workHour) => {
      const employee = getEmployeeById(workHour.employee_id);
      if (!employee) return totalCost;
      const hours = workHour.total_hours || 0;
      return totalCost + (hours * employee.hourly_rate);
    }, 0);
  }, [getWorkHoursByOrder, getEmployeeById]);

  // Statistiques
  const getEmployeeStats = useCallback(() => {
    if (!employees || !workHours) return null;
    const totalEmployees = employees.length;
    const activeEmployees = getActiveEmployees().length;
    const totalWorkHours = workHours.reduce((sum, workHour) => sum + (workHour.total_hours || 0), 0);
    const totalSalaryCost = workHours.reduce((totalCost, workHour) => {
      const employee = getEmployeeById(workHour.employee_id);
      if (!employee) return totalCost;
      const hours = workHour.total_hours || 0;
      return totalCost + (hours * employee.hourly_rate);
    }, 0);
    return {
      totalEmployees,
      activeEmployees,
      totalWorkHours,
      totalSalaryCost
    };
  }, [employees, workHours, getActiveEmployees, getEmployeeById]);

  return {
    employees: employees || [],
    workHours: workHours || [],
    loading: loading || workHoursLoading || mutationLoading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addWorkHours,
    updateWorkHours,
    deleteWorkHours,
    getEmployeeById,
    getActiveEmployees,
    searchEmployees,
    getWorkHoursByEmployee,
    getWorkHoursByDate,
    getWorkHoursByDateRange,
    getWorkHoursByOrder,
    calculateEmployeeSalary,
    calculateOrderCost,
    getEmployeeStats,
    refetch,
    refetchWorkHours
  };
} 