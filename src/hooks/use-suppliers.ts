import { useCRUD } from './use-crud';
import { supabase } from '@/integrations/supabase/client';

export interface Supplier {
  id: string;
  company_id: string;
  supplier_number: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_id?: string;
  payment_terms: number;
  credit_limit: number;
  category?: string;
  rating?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSuppliers = () => {
  const {
    items: suppliers,
    loading: isLoading,
    create,
    update,
    delete: deleteItem,
  } = useCRUD<Supplier>({
    table: 'suppliers',
    orderBy: { column: 'name', ascending: true },
  });

  const createSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'supplier_number' | 'company_id'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Non authentifié');

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('user_id', user.id)
      .single();

    if (!profile) throw new Error('Profil non trouvé');

    const { data: existingSuppliers } = await supabase
      .from('suppliers')
      .select('supplier_number')
      .eq('company_id', profile.company_id)
      .order('created_at', { ascending: false })
      .limit(1);

    const count = existingSuppliers?.length || 0;
    const supplierNumber = `FOUR-${String(count + 1).padStart(6, '0')}`;

    return create({
      ...supplier,
      supplier_number: supplierNumber,
      company_id: profile.company_id,
    } as any);
  };

  return {
    suppliers,
    isLoading,
    createSupplier,
    updateSupplier: (data: Partial<Supplier> & { id: string }) => update(data.id, data),
    deleteSupplier: (id: string) => deleteItem(id),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  };
};
