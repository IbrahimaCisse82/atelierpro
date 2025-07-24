import { useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query';
import { Database } from '@/integrations/supabase/types';
import { toast } from './use-toast';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type ProductCategory = Database['public']['Tables']['product_categories']['Row'];
type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert'];
type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update'];

export function useProducts() {
  const {
    data: products,
    loading,
    error,
    refetch
  } = useSupabaseQuery<Product>({
    table: 'products',
    select: '*',
    orderBy: { column: 'created_at', ascending: false }
  });

  const {
    data: categories,
    loading: categoriesLoading,
    refetch: refetchCategories
  } = useSupabaseQuery<ProductCategory>({
    table: 'product_categories',
    select: '*',
    orderBy: { column: 'name', ascending: true }
  });

  const { create, update, remove, loading: mutationLoading } = useSupabaseMutation<Product>('products');
  const { create: createCategory, update: updateCategoryMutation, remove: removeCategory } = useSupabaseMutation<ProductCategory>('product_categories');

  // Opérations sur les produits
  const addProduct = useCallback(async (productData: Omit<ProductInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await create(productData);
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit.",
        variant: "destructive"
      });
      throw error;
    }
  }, [create, refetch]);

  const updateProduct = useCallback(async (id: string, productData: Partial<ProductUpdate>) => {
    try {
      await update(id, productData);
      toast({
        title: "Produit modifié",
        description: "Le produit a été modifié avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le produit.",
        variant: "destructive"
      });
      throw error;
    }
  }, [update, refetch]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await remove(id);
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit.",
        variant: "destructive"
      });
      throw error;
    }
  }, [remove, refetch]);

  // Opérations sur les catégories
  const addCategory = useCallback(async (categoryData: Omit<ProductCategoryInsert, 'company_id' | 'created_by' | 'updated_by'>) => {
    try {
      await createCategory(categoryData);
      toast({
        title: "Catégorie ajoutée",
        description: "La catégorie a été ajoutée avec succès.",
      });
      refetchCategories();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la catégorie.",
        variant: "destructive"
      });
      throw error;
    }
  }, [createCategory, refetchCategories]);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<ProductCategoryUpdate>) => {
    try {
      await updateCategoryMutation(id, categoryData);
      toast({
        title: "Catégorie modifiée",
        description: "La catégorie a été modifiée avec succès.",
      });
      refetchCategories();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la catégorie.",
        variant: "destructive"
      });
      throw error;
    }
  }, [updateCategoryMutation, refetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      await removeCategory(id);
      toast({
        title: "Catégorie supprimée",
        description: "La catégorie a été supprimée avec succès.",
      });
      refetchCategories();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la catégorie.",
        variant: "destructive"
      });
      throw error;
    }
  }, [removeCategory, refetchCategories]);

  // Utilitaires
  const getProductById = useCallback((id: string) => {
    return products?.find(product => product.id === id);
  }, [products]);

  const getActiveProducts = useCallback(() => {
    return products?.filter(product => product.is_active) || [];
  }, [products]);

  const getProductsByCategory = useCallback((categoryId: string) => {
    return products?.filter(product => product.category_id === categoryId) || [];
  }, [products]);

  const getLowStockProducts = useCallback(() => {
    return products?.filter(product => product.current_stock <= product.min_stock_level) || [];
  }, [products]);

  const searchProducts = useCallback((searchTerm: string) => {
    if (!products) return [];
    
    const term = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term)
    );
  }, [products]);

  return {
    products: products || [],
    categories: categories || [],
    loading: loading || categoriesLoading || mutationLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    getProductById,
    getActiveProducts,
    getProductsByCategory,
    getLowStockProducts,
    searchProducts,
    refetch
  };
}