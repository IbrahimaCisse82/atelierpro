#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://zvdytkcqhnsivrargtvp.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SERVICE_ROLE_KEY) {
  console.error('Veuillez définir SUPABASE_SERVICE_ROLE_KEY dans vos variables d\'environnement.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createDemoUser() {
  const email = 'test@atelierpro.com';
  const password = 'test1234';

  // Vérifier si l'utilisateur existe déjà
  const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) {
    console.error('Erreur lors de la vérification de l\'utilisateur :', fetchError.message);
    process.exit(1);
  }
  if (users && users.users && users.users.some(u => u.email === email)) {
    console.log('Utilisateur déjà présent.');
    process.exit(0);
  }

  // Créer l'utilisateur
  const { data, error } = await supabase.auth.admin.createUser({
          email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error('Erreur lors de la création de l\'utilisateur :', error.message);
    process.exit(1);
  }
  console.log('Utilisateur de test créé avec succès :', data.user?.email);
}

createDemoUser(); 