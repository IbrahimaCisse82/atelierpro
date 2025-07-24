import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Model = Database['public']['Tables']['models']['Row'];
type ModelInsert = Database['public']['Tables']['models']['Insert'];
type ModelUpdate = Database['public']['Tables']['models']['Update'];

type Pattern = Database['public']['Tables']['patterns']['Row'];
type PatternInsert = Database['public']['Tables']['patterns']['Insert'];
type PatternUpdate = Database['public']['Tables']['patterns']['Update'];

export const usePatterns = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getModels = async (): Promise<Model[]> => {
    const { data, error } = await supabase
      .from('models')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des modèles:', error);
      throw error;
    }

    return data || [];
  };

  const getPatterns = async (): Promise<Pattern[]> => {
    const { data, error } = await supabase
      .from('patterns')
      .select(`
        *,
        model:model_id (
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des patrons:', error);
      throw error;
    }

    return data || [];
  };

  const createModel = async (modelData: Omit<ModelInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Model> => {
    const { data, error } = await supabase
      .from('models')
      .insert(modelData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du modèle:', error);
      throw error;
    }

    return data;
  };

  const createPattern = async (patternData: Omit<PatternInsert, 'id' | 'created_at'>): Promise<Pattern> => {
    const { data, error } = await supabase
      .from('patterns')
      .insert(patternData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du patron:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: models = [],
    isLoading: isLoadingModels,
    error: modelsError
  } = useQuery({
    queryKey: ['models'],
    queryFn: getModels,
  });

  const {
    data: patterns = [],
    isLoading: isLoadingPatterns,
    error: patternsError
  } = useQuery({
    queryKey: ['patterns'],
    queryFn: getPatterns,
  });

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: createModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['models'] });
      toast({
        title: "Modèle créé",
        description: "Le modèle a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le modèle",
        variant: "destructive",
      });
      console.error('Erreur lors de la création du modèle:', error);
    },
  });

  const createPatternMutation = useMutation({
    mutationFn: createPattern,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patterns'] });
      toast({
        title: "Patron créé",
        description: "Le patron a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le patron",
        variant: "destructive",
      });
      console.error('Erreur lors de la création du patron:', error);
    },
  });

  return {
    models,
    patterns,
    isLoadingModels,
    isLoadingPatterns,
    modelsError,
    patternsError,
    createModel: createModelMutation.mutate,
    createPattern: createPatternMutation.mutate,
    isCreatingModel: createModelMutation.isPending,
    isCreatingPattern: createPatternMutation.isPending,
  };
};