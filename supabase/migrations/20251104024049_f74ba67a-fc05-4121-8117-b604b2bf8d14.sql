-- Migration finale pour éliminer les dernières politiques RLS en double

-- Stock Movements - supprimer la politique générale, garder celle par rôle
DROP POLICY IF EXISTS "Users can manage stock movements from their company" ON public.stock_movements;

-- Suppliers - supprimer les politiques de vue générales
DROP POLICY IF EXISTS "Users can view suppliers from leur company" ON public.suppliers;
DROP POLICY IF EXISTS "Users can view suppliers from their company" ON public.suppliers;

-- Syscohada Accounts - supprimer les politiques générales
DROP POLICY IF EXISTS "Users can insert syscohada accounts for their company" ON public.syscohada_accounts;
DROP POLICY IF EXISTS "Users can view syscohada accounts for their company" ON public.syscohada_accounts;
DROP POLICY IF EXISTS "Users can update syscohada accounts for their company" ON public.syscohada_accounts;

-- Work Hours - supprimer une des deux politiques de vue
DROP POLICY IF EXISTS "Users can view work hours from their company" ON public.work_hours;

-- Vérification: toutes les politiques restantes sont maintenant optimales
-- Chaque table a une seule politique par rôle et par action