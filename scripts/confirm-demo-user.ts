#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase (utilisez votre SERVICE_ROLE_KEY ici)
const SUPABASE_URL = "https://zvdytkcqhnsivrargtvp.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "VOTRE_SERVICE_ROLE_KEY_ICI";

// Créer le client Supabase avec la clé service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Fonction pour confirmer l'utilisateur demo et créer l'entreprise
async function confirmDemoUser() {
  const email = 'demo@atelierpro.com';
  const userId = '68a7d8cd-0e35-420f-aacb-af4f75b8cf7d'; // ID de l'utilisateur créé
  
  console.log('🔧 Confirmation de l\'utilisateur demo');
  console.log('=====================================');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 ID: ${userId}`);
  console.log('');

  try {
    // 1. Confirmer l'email de l'utilisateur
    console.log('📧 Confirmation de l\'email...');
    
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        email_confirm: true,
        password: 'DemoTest@1234' // S'assurer que le mot de passe est correct
      }
    );
    
    if (confirmError) {
      console.log('❌ Erreur lors de la confirmation:', confirmError.message);
      return false;
    }
    
    console.log('✅ Email confirmé avec succès');
    
    // 2. Créer l'entreprise
    console.log('');
    console.log('🏢 Création de l\'entreprise...');
    
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
    console.log(`🏢 ID Entreprise: ${company.id}`);

    // 3. Créer le profil utilisateur
    console.log('');
    console.log('👤 Création du profil utilisateur...');
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: email,
        first_name: 'Demo',
        last_name: 'User',
        role: 'owner',
        company_id: company.id,
        is_active: true
      });

    if (profileError) {
      console.log('❌ Erreur lors de la création du profil:', profileError.message);
      return false;
    }

    console.log('✅ Profil utilisateur créé');
    
    // 4. Vérifier que tout est en place
    console.log('');
    console.log('🔍 Vérification finale...');
    
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      console.log('❌ Erreur lors de la vérification:', userError.message);
      return false;
    }

    if (user.user) {
      console.log('✅ Utilisateur vérifié:');
      console.log(`   • Email: ${user.user.email}`);
      console.log(`   • Confirmé: ${user.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`   • Créé le: ${user.user.created_at}`);
    }

    // Vérifier le profil
    const { data: profile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileCheckError) {
      console.log('❌ Erreur lors de la vérification du profil:', profileCheckError.message);
      return false;
    }

    if (profile) {
      console.log('✅ Profil vérifié:');
      console.log(`   • Nom: ${profile.first_name} ${profile.last_name}`);
      console.log(`   • Rôle: ${profile.role}`);
      console.log(`   • Entreprise: ${profile.company_id}`);
      console.log(`   • Actif: ${profile.is_active ? 'Oui' : 'Non'}`);
    }

    return true;

  } catch (error) {
    console.log('💥 Erreur inattendue:', error);
    return false;
  }
}

// Fonction pour tester la connexion après confirmation
async function testLoginAfterConfirmation() {
  const email = 'demo@atelierpro.com';
  const password = 'DemoTest@1234';
  
  console.log('');
  console.log('🧪 Test de connexion après confirmation');
  console.log('========================================');
  
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
      console.log(`✅ Email confirmé: ${data.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      
      // Vérifier le profil
      const { data: profile, error: profileError } = await testSupabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (!profileError && profile) {
        console.log('✅ Profil trouvé:');
        console.log(`   • Nom: ${profile.first_name} ${profile.last_name}`);
        console.log(`   • Rôle: ${profile.role}`);
        console.log(`   • Actif: ${profile.is_active ? 'Oui' : 'Non'}`);
      }
      
      // Déconnexion
      await testSupabase.auth.signOut();
      console.log('🔓 Déconnexion effectuée');
      return true;
    }

  } catch (error) {
    console.log('💥 Erreur lors du test:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Confirmation de l\'utilisateur demo AtelierPro');
  console.log('===============================================');
  console.log('');

  // Vérifier la clé service role
  if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY === "VOTRE_SERVICE_ROLE_KEY_ICI") {
    console.log('❌ ERREUR: Clé service role manquante');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Allez dans votre dashboard Supabase');
    console.log('2. Settings > API');
    console.log('3. Copiez la "service_role" key');
    console.log('4. Exécutez: SUPABASE_SERVICE_ROLE_KEY=votre_cle tsx scripts/confirm-demo-user.ts');
    console.log('');
    console.log('⚠️  ATTENTION: Ne partagez JAMAIS cette clé publiquement!');
    return;
  }

  // Confirmer l'utilisateur
  const success = await confirmDemoUser();
  
  if (success) {
    // Tester la connexion
    await testLoginAfterConfirmation();
    
    console.log('');
    console.log('🎉 SUCCÈS!');
    console.log('==========');
    console.log('L\'utilisateur demo a été confirmé et peut maintenant se connecter');
    console.log('');
    console.log('📋 IDENTIFIANTS DE CONNEXION:');
    console.log('============================');
    console.log('Email: demo@atelierpro.com');
    console.log('Mot de passe: DemoTest@1234');
    console.log('');
    console.log('🌐 URL: https://atelierpro-production.up.railway.app');
  } else {
    console.log('');
    console.log('❌ ÉCHEC');
    console.log('=======');
    console.log('La confirmation de l\'utilisateur a échoué');
  }
}

// Exécuter le script
main().catch(console.error); 