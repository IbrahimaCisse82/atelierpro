import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type ClientMeasurement = Tables<'client_measurements'>;
type ClientMeasurementInsert = Tables<'client_measurements'>['Insert'];
type ClientMeasurementUpdate = Tables<'client_measurements'>['Update'];

export function useMeasurements() {
  const {
    data: measurements,
    loading,
    error,
    refetch
  } = useSupabaseQuery<ClientMeasurement>({
    table: 'client_measurements',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<ClientMeasurement>('client_measurements');

  // Créer une nouvelle mesure
  const addMeasurement = useCallback(async (measurementData: Omit<ClientMeasurementInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      const result = await create(measurementData);
      toast({
        title: "Mesures ajoutées",
        description: "Les mesures ont été ajoutées avec succès.",
      });
      refetch();
      return result;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter les mesures.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch]);

  // Mettre à jour des mesures
  const updateMeasurement = useCallback(async (measurementId: string, measurementData: Partial<ClientMeasurementUpdate>) => {
    try {
      await update(measurementId, measurementData);
      toast({
        title: "Mesures modifiées",
        description: "Les mesures ont été modifiées avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier les mesures.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Supprimer des mesures
  const deleteMeasurement = useCallback(async (measurementId: string) => {
    try {
      await remove(measurementId);
      toast({
        title: "Mesures supprimées",
        description: "Les mesures ont été supprimées avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer les mesures.",
        variant: "destructive"
      });
      throw error;
    }
  }, [remove, refetch]);

  // Valider des mesures
  const validateMeasurement = useCallback(async (measurementId: string, validatedBy: string) => {
    try {
      await update(measurementId, {
        is_validated: true,
        validated_by: validatedBy,
        validated_at: new Date().toISOString()
      });
      toast({
        title: "Mesures validées",
        description: "Les mesures ont été validées avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider les mesures.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  // Dupliquer des mesures
  const duplicateMeasurement = useCallback(async (measurementId: string, newClientId: string) => {
    try {
      const originalMeasurement = getMeasurementById(measurementId);
      if (!originalMeasurement) {
        throw new Error('Mesures originales non trouvées');
      }

      const newMeasurement = {
        client_id: newClientId,
        measurement_date: new Date().toISOString().split('T')[0],
        version: 1,
        bust: originalMeasurement.bust,
        waist: originalMeasurement.waist,
        hips: originalMeasurement.hips,
        shoulder_width: originalMeasurement.shoulder_width,
        arm_length: originalMeasurement.arm_length,
        leg_length: originalMeasurement.leg_length,
        neck_circumference: originalMeasurement.neck_circumference,
        chest_width: originalMeasurement.chest_width,
        back_width: originalMeasurement.back_width,
        arm_circumference: originalMeasurement.arm_circumference,
        thigh_circumference: originalMeasurement.thigh_circumference,
        calf_circumference: originalMeasurement.calf_circumference,
        notes: `Copie des mesures du ${originalMeasurement.measurement_date}`
      };

      await create(newMeasurement);
      toast({
        title: "Mesures dupliquées",
        description: "Les mesures ont été dupliquées avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de dupliquer les mesures.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch, getMeasurementById]);

  // Utilitaires
  const getMeasurementById = useCallback((id: string) => {
    return measurements?.find(measurement => measurement.id === id);
  }, [measurements]);

  const getMeasurementsByClient = useCallback((clientId: string) => {
    return measurements?.filter(measurement => measurement.client_id === clientId) || [];
  }, [measurements]);

  const getValidatedMeasurements = useCallback(() => {
    return measurements?.filter(measurement => measurement.is_validated) || [];
  }, [measurements]);

  const getPendingMeasurements = useCallback(() => {
    return measurements?.filter(measurement => !measurement.is_validated) || [];
  }, [measurements]);

  const getMeasurementsByDate = useCallback((date: string) => {
    return measurements?.filter(measurement => measurement.measurement_date === date) || [];
  }, [measurements]);

  const getMeasurementsByDateRange = useCallback((startDate: string, endDate: string) => {
    return measurements?.filter(measurement => 
      measurement.measurement_date >= startDate && measurement.measurement_date <= endDate
    ) || [];
  }, [measurements]);

  const getLatestMeasurementByClient = useCallback((clientId: string) => {
    const clientMeasurements = getMeasurementsByClient(clientId);
    return clientMeasurements.sort((a, b) => 
      new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime()
    )[0];
  }, [getMeasurementsByClient]);

  const searchMeasurements = useCallback((searchTerm: string) => {
    if (!measurements) return [];
    
    const term = searchTerm.toLowerCase();
    return measurements.filter(measurement => 
      measurement.measurement_date.includes(term) ||
      measurement.notes?.toLowerCase().includes(term)
    );
  }, [measurements]);

  // Calculs de moyennes
  const getAverageMeasurements = useCallback(() => {
    if (!measurements || measurements.length === 0) return null;

    const validMeasurements = measurements.filter(m => 
      m.bust && m.waist && m.hips && m.shoulder_width
    );

    if (validMeasurements.length === 0) return null;

    const averages = {
      bust: validMeasurements.reduce((sum, m) => sum + (m.bust || 0), 0) / validMeasurements.length,
      waist: validMeasurements.reduce((sum, m) => sum + (m.waist || 0), 0) / validMeasurements.length,
      hips: validMeasurements.reduce((sum, m) => sum + (m.hips || 0), 0) / validMeasurements.length,
      shoulder_width: validMeasurements.reduce((sum, m) => sum + (m.shoulder_width || 0), 0) / validMeasurements.length,
      arm_length: validMeasurements.reduce((sum, m) => sum + (m.arm_length || 0), 0) / validMeasurements.length,
      leg_length: validMeasurements.reduce((sum, m) => sum + (m.leg_length || 0), 0) / validMeasurements.length
    };

    return averages;
  }, [measurements]);

  // Statistiques
  const getMeasurementStats = useCallback(() => {
    if (!measurements) return null;

    const total = measurements.length;
    const validated = getValidatedMeasurements().length;
    const pending = getPendingMeasurements().length;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = getMeasurementsByDate(today).length;

    return {
      total,
      validated,
      pending,
      todayCount
    };
  }, [measurements, getValidatedMeasurements, getPendingMeasurements, getMeasurementsByDate]);

  return {
    measurements: measurements || [],
    loading: loading || mutationLoading,
    error,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    validateMeasurement,
    duplicateMeasurement,
    getMeasurementById,
    getMeasurementsByClient,
    getValidatedMeasurements,
    getPendingMeasurements,
    getMeasurementsByDate,
    getMeasurementsByDateRange,
    getLatestMeasurementByClient,
    searchMeasurements,
    getAverageMeasurements,
    getMeasurementStats,
    refetch
  };
} 