import { useCRUD } from './use-crud';
import { Database } from "@/integrations/supabase/types";

type Client = Database['public']['Tables']['clients']['Row'];

export const useClients = () => {
  const {
    items: clients,
    loading: isLoadingClients,
    error: clientsError,
    create: createClient,
    update: updateClient,
  } = useCRUD<Client>({
    table: 'clients',
    orderBy: { column: 'created_at', ascending: false },
  });

  return {
    clients,
    isLoadingClients,
    clientsError,
    createClient: (data: Partial<Client>) => createClient(data),
    updateClient: (id: string, updates: Partial<Client>) => updateClient(id, updates),
    isCreatingClient: false,
    isUpdatingClient: false,
  };
};
