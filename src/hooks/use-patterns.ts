import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Model = Tables<'models'>;
type ModelInsert = Tables<'models'>['Insert'];
type ModelUpdate = Tables<'models'>['Update'];
type Pattern = Tables<'patterns'>;
type PatternInsert = Tables<'patterns'>['Insert'];
type PatternUpdate = Tables<'patterns'>['Update'];

export function usePatterns() {
  const {
    data: models,
    loading: modelsLoading,
    error: modelsError,
    refetch: refetchModels
  } = useSupabaseQuery<Model>({
    table: 'models',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const {
    data: patterns,
    loading: patternsLoading,
    error: patternsError,
    refetch: refetchPatterns
  } = useSupabaseQuery<Pattern>({
    table: 'patterns',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create: createModel, update: updateModel, remove: removeModel, loading: modelMutationLoading } = useSupabaseMutation<Model>('models');
  const { create: createPattern, update: updatePattern, remove: removePattern, loading: patternMutationLoading } = useSupabaseMutation<Pattern>('patterns');

  // Opérations sur les modèles
  const addModel = useCallback(async (modelData: Omit<ModelInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      const result = await createModel(modelData);
      toast({
        title: "Modèle ajouté",
        description: "Le modèle a été ajouté avec succès.",
      });
      refetchModels();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le modèle.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createModel, refetchModels]);

  const updateModel = useCallback(async (modelId: string, modelData: Partial<ModelUpdate>) => {
    try {
      await updateModel(modelId, modelData);
      toast({
        title: "Modèle modifié",
        description: "Le modèle a été modifié avec succès.",
      });
      refetchModels();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le modèle.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateModel, refetchModels]);

  const deleteModel = useCallback(async (modelId: string) => {
    try {
      await removeModel(modelId);
      toast({
        title: "Modèle supprimé",
        description: "Le modèle a été supprimé avec succès.",
      });
      refetchModels();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le modèle.",
        variant: "destructive"
      });
      throw error;
    }
  }, [removeModel, refetchModels]);

  // Opérations sur les patrons
  const addPattern = useCallback(async (patternData: Omit<PatternInsert, 'company_id' | 'created_by'>) => {
    try {
      const result = await createPattern(patternData);
      toast({
        title: "Patron ajouté",
        description: "Le patron a été ajouté avec succès.",
      });
      refetchPatterns();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le patron.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createPattern, refetchPatterns]);

  const updatePattern = useCallback(async (patternId: string, patternData: Partial<PatternUpdate>) => {
    try {
      await updatePattern(patternId, patternData);
      toast({
        title: "Patron modifié",
        description: "Le patron a été modifié avec succès.",
      });
      refetchPatterns();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le patron.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updatePattern, refetchPatterns]);

  const deletePattern = useCallback(async (patternId: string) => {
    try {
      await removePattern(patternId);
      toast({
        title: "Patron supprimé",
        description: "Le patron a été supprimé avec succès.",
      });
      refetchPatterns();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le patron.",
        variant: "destructive"
      });
      throw error;
    }
  }, [removePattern, refetchPatterns]);

  // Dupliquer un patron
  const duplicatePattern = useCallback(async (patternId: string, newModelId: string) => {
    try {
      const originalPattern = getPatternById(patternId);
      if (!originalPattern) {
        throw new Error('Patron original non trouvé');
      }

      const newPattern = {
        model_id: newModelId,
        name: `${originalPattern.name} (copie)`,
        file_path: originalPattern.file_path,
        file_size: originalPattern.file_size,
        version: originalPattern.version,
        is_active: true
      };

      await createPattern(newPattern);
      toast({
        title: "Patron dupliqué",
        description: "Le patron a été dupliqué avec succès.",
      });
      refetchPatterns();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer le patron.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createPattern, refetchPatterns, getPatternById]);

  // Utilitaires pour les modèles
  const getModelById = useCallback((id: string) => {
    return models?.find(model => model.id === id);
  }, [models]);

  const getActiveModels = useCallback(() => {
    return models?.filter(model => model.is_active) || [];
  }, [models]);

  const getModelsByCategory = useCallback((category: string) => {
    return models?.filter(model => model.category === category) || [];
  }, [models]);

  const searchModels = useCallback((searchTerm: string) => {
    if (!models) return [];
    
    const term = searchTerm.toLowerCase();
    return models.filter(model => 
      model.name.toLowerCase().includes(term) ||
      model.description?.toLowerCase().includes(term) ||
      model.category?.toLowerCase().includes(term)
    );
  }, [models]);

  // Utilitaires pour les patrons
  const getPatternById = useCallback((id: string) => {
    return patterns?.find(pattern => pattern.id === id);
  }, [patterns]);

  const getPatternsByModel = useCallback((modelId: string) => {
    return patterns?.filter(pattern => pattern.model_id === modelId) || [];
  }, [patterns]);

  const getActivePatterns = useCallback(() => {
    return patterns?.filter(pattern => pattern.is_active) || [];
  }, [patterns]);

  const getPatternsByVersion = useCallback((version: string) => {
    return patterns?.filter(pattern => pattern.version === version) || [];
  }, [patterns]);

  const searchPatterns = useCallback((searchTerm: string) => {
    if (!patterns) return [];
    
    const term = searchTerm.toLowerCase();
    return patterns.filter(pattern => 
      pattern.name.toLowerCase().includes(term) ||
      pattern.version.toLowerCase().includes(term)
    );
  }, [patterns]);

  // Statistiques
  const getPatternStats = useCallback(() => {
    if (!models || !patterns) return null;

    const totalModels = models.length;
    const activeModels = getActiveModels().length;
    const totalPatterns = patterns.length;
    const activePatterns = getActivePatterns().length;
    const totalFileSize = patterns.reduce((sum, pattern) => sum + (pattern.file_size || 0), 0);

    // Catégories de modèles
    const categories = models.reduce((acc, model) => {
      if (model.category) {
        acc[model.category] = (acc[model.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      models: {
        total: totalModels,
        active: activeModels,
        categories
      },
      patterns: {
        total: totalPatterns,
        active: activePatterns,
        totalFileSize
      }
    };
  }, [models, patterns, getActiveModels, getActivePatterns]);

  return {
    models: models || [],
    patterns: patterns || [],
    loading: modelsLoading || patternsLoading || modelMutationLoading || patternMutationLoading,
    error: modelsError || patternsError,
    addModel,
    updateModel,
    deleteModel,
    addPattern,
    updatePattern,
    deletePattern,
    duplicatePattern,
    getModelById,
    getActiveModels,
    getModelsByCategory,
    searchModels,
    getPatternById,
    getPatternsByModel,
    getActivePatterns,
    getPatternsByVersion,
    searchPatterns,
    getPatternStats,
    refetchModels,
    refetchPatterns
  };
} 