#!/usr/bin/env node

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 Force confirmation utilisateur AtelierPro');
console.log('===========================================');
console.log('');

if (!serviceRoleKey) {
  console.log('❌ ERREUR: Clé service role manquante');
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('1. Allez dans votre dashboard Supabase');
  console.log('2. Settings > API');
  console.log('3. Copiez la "service_role" key');
  console.log('4. Ajoutez-la à votre fichier .env:');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=votre_cle');
  console.log('');
  console.log('⚠️  ATTENTION: Ne partagez JAMAIS cette clé publiquement!');
  process.exit(1);
}

// Client avec service role pour les opérations admin
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Client normal pour les tests
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function forceConfirmUser() {
  const email = 'demo@atelierpro.com';
  const password = 'demo123456';

  console.log('🔍 Recherche de l\'utilisateur...');
  console.log(`📧 Email: ${email}`);
  console.log('');

  try {
    // 1. Vérifier si l'utilisateur existe
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:');
      console.log(listError.message);
      return;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
      console.log('🔧 Création de l\'utilisateur...');
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmation forcée
        user_metadata: {
          role: 'admin',
          company: 'AtelierPro Demo'
        }
      });

      if (createError) {
        console.log('❌ Erreur lors de la création:');
        console.log(createError.message);
        return;
      }

      console.log('✅ Utilisateur créé avec confirmation forcée');
      console.log(`🆔 ID: ${newUser.user.id}`);
    } else {
      console.log('✅ Utilisateur trouvé');
      console.log(`🆔 ID: ${user.id}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`✅ Email confirmé: ${user.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      if (!user.email_confirmed_at) {
        console.log('🔧 Confirmation forcée de l\'email...');
        
        const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          user.id,
          { email_confirm: true }
        );

        if (updateError) {
          console.log('❌ Erreur lors de la confirmation:');
          console.log(updateError.message);
          return;
        }

        console.log('✅ Email confirmé avec succès');
      }
    }

    console.log('');
    console.log('🧪 Test de connexion...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.log('❌ Erreur de connexion:');
      console.log(signInError.message);
      return;
    }

    console.log('✅ Connexion réussie!');
    console.log(`👤 Utilisateur: ${signInData.user.email}`);
    console.log(`🆔 ID: ${signInData.user.id}`);
    console.log(`📅 Créé le: ${signInData.user.created_at}`);

  } catch (error) {
    console.log('❌ Erreur inattendue:');
    console.log(error);
  }
}

// Fonction principale
async function main() {
  await forceConfirmUser();
  console.log('');
  console.log('✅ Opération terminée');
}

// Exécution
main().catch(console.error); 