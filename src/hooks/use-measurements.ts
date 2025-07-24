import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ClientMeasurement = Database['public']['Tables']['client_measurements']['Row'];
type ClientMeasurementInsert = Database['public']['Tables']['client_measurements']['Insert'];
type ClientMeasurementUpdate = Database['public']['Tables']['client_measurements']['Update'];

export const useMeasurements = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getMeasurements = async (): Promise<ClientMeasurement[]> => {
    const { data, error } = await supabase
      .from('client_measurements')
      .select(`
        *,
        client:client_id (
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des mesures:', error);
      throw error;
    }

    return data || [];
  };

  const createMeasurement = async (measurementData: Omit<ClientMeasurementInsert, 'id' | 'created_at' | 'updated_at'>): Promise<ClientMeasurement> => {
    const { data, error } = await supabase
      .from('client_measurements')
      .insert(measurementData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la mesure:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: measurements = [],
    isLoading: isLoadingMeasurements,
    error: measurementsError
  } = useQuery({
    queryKey: ['measurements'],
    queryFn: getMeasurements,
  });

  // Mutations
  const createMeasurementMutation = useMutation({
    mutationFn: createMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
      toast({
        title: "Mesures enregistrées",
        description: "Les mesures ont été enregistrées avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer les mesures",
        variant: "destructive",
      });
      console.error('Erreur lors de l\'enregistrement des mesures:', error);
    },
  });

  return {
    measurements,
    isLoadingMeasurements,
    measurementsError,
    createMeasurement: createMeasurementMutation.mutate,
    isCreatingMeasurement: createMeasurementMutation.isPending,
  };
};