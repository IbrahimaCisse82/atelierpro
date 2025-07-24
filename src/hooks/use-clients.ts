import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type Client = Database['public']['Tables']['clients']['Row'];
type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getClients = async (): Promise<Client[]> => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      throw error;
    }

    return data || [];
  };

  const createClient = async (clientData: Omit<ClientInsert, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .insert(clientData)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du client:', error);
      throw error;
    }

    return data;
  };

  const updateClient = async (id: string, updates: Partial<ClientUpdate>): Promise<Client> => {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      throw error;
    }

    return data;
  };

  // Queries
  const {
    data: clients = [],
    isLoading: isLoadingClients,
    error: clientsError
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  // Mutations
  const createClientMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client créé",
        description: "Le client a été créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le client",
        variant: "destructive",
      });
      console.error('Erreur lors de la création du client:', error);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ClientUpdate> }) =>
      updateClient(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client mis à jour",
        description: "Le client a été mis à jour avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le client",
        variant: "destructive",
      });
      console.error('Erreur lors de la mise à jour du client:', error);
    },
  });

  return {
    clients,
    isLoadingClients,
    clientsError,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    isCreatingClient: createClientMutation.isPending,
    isUpdatingClient: updateClientMutation.isPending,
  };
};