import { useCRUD } from './use-crud';
import { Database } from "@/integrations/supabase/types";

type Model = Database['public']['Tables']['models']['Row'];
type Pattern = Database['public']['Tables']['patterns']['Row'];

export const usePatterns = () => {
  const {
    items: models,
    loading: isLoadingModels,
    error: modelsError,
    create: createModel,
  } = useCRUD<Model>({
    table: 'models',
    orderBy: { column: 'created_at', ascending: false },
  });

  const {
    items: patterns,
    loading: isLoadingPatterns,
    error: patternsError,
    create: createPattern,
  } = useCRUD<Pattern>({
    table: 'patterns',
    select: `
      *,
      model:model_id (
        name
      )
    `,
    orderBy: { column: 'created_at', ascending: false },
  });

  return {
    models,
    patterns,
    isLoadingModels,
    isLoadingPatterns,
    modelsError,
    patternsError,
    createModel: (data: Partial<Model>) => createModel(data),
    createPattern: (data: Partial<Pattern>) => createPattern(data),
    isCreatingModel: false,
    isCreatingPattern: false,
  };
};
