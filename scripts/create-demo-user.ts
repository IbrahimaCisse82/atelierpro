#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://zvdytkcqhnsivrargtvp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "VOTRE_SERVICE_ROLE_KEY_ICI";

// Client Supabase avec service role pour les opérations admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction pour créer l'utilisateur demo avec confirmation forcée
async function createDemoUserWithConfirmation() {
  const email = 'demo@atelierpro.com';
  const password = 'DemoTest@1234';
  
  console.log('📧 Email:', email);
  console.log(`🔑 Mot de passe: ${password.replace(/./g, '*')}`);
  console.log('');

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...');
    
    // Utiliser listUsers avec un filtre par email au lieu de getUserByEmail
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log('❌ Erreur lors de la récupération des utilisateurs:', listError.message);
      return false;
    }

    const existingUser = users.users.find(user => user.email === email);
    
    if (existingUser) {
      console.log('⚠️  L\'utilisateur existe déjà');
      console.log(`👤 ID: ${existingUser.id}`);
      console.log(`✅ Email confirmé: ${existingUser.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      // Si l'email n'est pas confirmé, le confirmer
      if (!existingUser.email_confirmed_at) {
        console.log('📧 Confirmation de l\'email...');
        
        const { error: confirmError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { email_confirm: true }
        );
        
        if (confirmError) {
          console.log('❌ Erreur lors de la confirmation:', confirmError.message);
          return false;
        }
        
        console.log('✅ Email confirmé avec succès');
      }
      
      // Mettre à jour le mot de passe si nécessaire
      console.log('🔑 Mise à jour du mot de passe...');
      
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: password }
      );
      
      if (updateError) {
        console.log('❌ Erreur lors de la mise à jour du mot de passe:', updateError.message);
        return false;
      }
      
      console.log('✅ Mot de passe mis à jour');
      
      return true;
    }

    // 2. Créer l'utilisateur avec confirmation forcée
    console.log('👤 Création de l\'utilisateur...');
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Confirmation forcée
      user_metadata: {
        first_name: 'Demo',
        last_name: 'User',
        company_name: 'Atelier Demo'
      }
    });

    if (createError) {
      console.log('❌ Erreur lors de la création:', createError.message);
      return false;
    }

    if (newUser.user) {
      console.log('✅ Utilisateur créé avec succès');
      console.log(`👤 ID: ${newUser.user.id}`);
      console.log(`📧 Email: ${newUser.user.email}`);
      console.log(`✅ Email confirmé: ${newUser.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`🕐 Créé le: ${newUser.user.created_at}`);
      
      // 3. Créer l'entreprise et le profil via les triggers
      console.log('');
      console.log('🏢 Création de l\'entreprise et du profil...');
      
      // Attendre un peu pour que les triggers se déclenchent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Vérifier si le profil a été créé
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', newUser.user.id)
        .single();

      if (profileError) {
        console.log('⚠️  Profil non trouvé, création manuelle...');
        
        // Créer l'entreprise d'abord
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: 'Atelier Demo',
            email: email,
            is_active: true
          })
          .select()
          .single();

        if (companyError) {
          console.log('❌ Erreur lors de la création de l\'entreprise:', companyError.message);
          return false;
        }

        console.log('✅ Entreprise créée:', company.name);

        // Créer le profil
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            user_id: newUser.user.id,
            email: email,
            first_name: 'Demo',
            last_name: 'User',
            role: 'owner',
            company_id: company.id,
            is_active: true
          });

        if (profileCreateError) {
          console.log('❌ Erreur lors de la création du profil:', profileCreateError.message);
          return false;
        }

        console.log('✅ Profil créé avec succès');
      } else {
        console.log('✅ Profil trouvé:', profile.first_name, profile.last_name);
      }
      
      return true;
    }

  } catch (error) {
    console.log('💥 Erreur inattendue:', error);
    return false;
  }
}

// Fonction pour tester la connexion après création
async function testLoginAfterCreation() {
  const email = 'demo@atelierpro.com';
  const password = 'DemoTest@1234';
  
  console.log('');
  console.log('🧪 Test de connexion après création');
  console.log('===================================');
  
  // Créer un nouveau client avec la clé anonyme pour le test
  const testSupabase = createClient(
    SUPABASE_URL,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc"
  );

  try {
    const { data, error } = await testSupabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log('❌ Test de connexion échoué:', error.message);
      return false;
    }

    if (data.user) {
      console.log('✅ Test de connexion réussi!');
      console.log(`👤 Utilisateur connecté: ${data.user.email}`);
      
      // Déconnexion
      await testSupabase.auth.signOut();
      return true;
    }

  } catch (error) {
    console.log('💥 Erreur lors du test:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Création forcée de l\'utilisateur demo AtelierPro');
  console.log('==================================================');
  console.log('');

  // Vérifier la clé service role
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "VOTRE_SERVICE_ROLE_KEY_ICI") {
    console.log('❌ ERREUR: Clé service role manquante');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Allez dans votre dashboard Supabase');
    console.log('2. Settings > API');
    console.log('3. Copiez la "service_role" key');
    console.log('4. Exécutez: SUPABASE_SERVICE_ROLE_KEY=votre_cle tsx scripts/create-demo-user.ts');
    console.log('');
    console.log('⚠️  ATTENTION: Ne partagez JAMAIS cette clé publiquement!');
    return;
  }

  // Créer l'utilisateur
  const success = await createDemoUserWithConfirmation();
  
  if (success) {
    // Tester la connexion
    await testLoginAfterCreation();
    
    console.log('');
    console.log('🎉 SUCCÈS!');
    console.log('==========');
    console.log('L\'utilisateur demo a été créé et peut maintenant se connecter');
    console.log('Email: demo@atelierpro.com');
    console.log('Mot de passe: DemoTest@1234');
  } else {
    console.log('');
    console.log('❌ ÉCHEC');
    console.log('=======');
    console.log('La création de l\'utilisateur a échoué');
  }
}

// Exécuter le script
main().catch(console.error); 