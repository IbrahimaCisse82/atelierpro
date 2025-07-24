-- Ajouter la colonne gender manquante à la table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('homme', 'femme', 'enfant'));

-- Mettre à jour les valeurs existantes avec une valeur par défaut
UPDATE public.clients 
SET gender = 'homme' 
WHERE gender IS NULL;