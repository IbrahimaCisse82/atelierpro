// Hook métier pour la gestion des clients : CRUD, recherche, filtrage, feedback utilisateur toast.
import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Tables } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Client = Tables<'clients'>;
type ClientInsert = Tables<'clients'>['Insert'];
type ClientUpdate = Tables<'clients'>['Update'];

// Centralisation du pattern de gestion d’erreur/toast
function showErrorToast(message: string) {
  toast({
    title: "Erreur",
    description: message,
    variant: "destructive"
  });
}

export function useClients(): {
  clients: Client[];
  loading: boolean;
  error: any;
  addClient: (clientData: Omit<ClientInsert, 'company_id' | 'created_by' | 'updated_by'>) => Promise<void>;
  updateClient: (id: string, clientData: Partial<ClientUpdate>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getActiveClients: () => Client[];
  searchClients: (searchTerm: string) => Client[];
  refetch: () => void;
} {
  const {
    data: clients,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Client>({
    table: 'clients',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Client>('clients');

  // Ajout d’un client avec feedback utilisateur
  const addClient = useCallback(async (clientData: Omit<ClientInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await create(clientData);
      toast({
        title: "Client ajouté",
        description: "Le client a été ajouté avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible d'ajouter le client.");
      throw error;
    }
  }, [create, refetch]);

  // Mise à jour d’un client
  const updateClient = useCallback(async (id: string, clientData: Partial<ClientUpdate>) => {
    try {
      await update(id, clientData);
      toast({
        title: "Client modifié",
        description: "Le client a été modifié avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de modifier le client.");
      throw error;
    }
  }, [update, refetch]);

  // Suppression d’un client
  const deleteClient = useCallback(async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      showErrorToast("Impossible de supprimer le client.");
      throw error;
    }
  }, [remove, refetch]);

  // Recherche et utilitaires
  const getClientById = useCallback((id: string) => {
    return clients?.find(client => client.id === id);
  }, [clients]);

  const getActiveClients = useCallback(() => {
    return clients?.filter(client => client.is_active) || [];
  }, [clients]);

  const searchClients = useCallback((searchTerm: string) => {
    if (!clients) return [];
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.first_name.toLowerCase().includes(term) ||
      client.last_name.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
  }, [clients]);

  return {
    clients: clients || [],
    loading: loading || mutationLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    getClientById,
    getActiveClients,
    searchClients,
    refetch
  };
} 