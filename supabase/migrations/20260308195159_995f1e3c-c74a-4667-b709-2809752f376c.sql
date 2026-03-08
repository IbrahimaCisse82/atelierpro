
-- Corriger la policy INSERT sur profiles pour permettre la création par le trigger
-- Le trigger handle_new_user utilise SECURITY DEFINER donc bypasse RLS,
-- mais on corrige quand même pour robustesse
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT TO authenticated 
  WITH CHECK (user_id = auth.uid());
