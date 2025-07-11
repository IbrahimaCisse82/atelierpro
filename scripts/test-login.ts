#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = "https://zvdytkcqhnsivrargtvp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2ZHl0a2NxaG5zaXZyYXJndHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MzY2NTMsImV4cCI6MjA2NzUxMjY1M30.VG0gPQFIYskyiRLgbC7A3kq7rpHghxWH4US3ghXDqPc";

// Créer le client Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// Fonction de test de connexion
async function testLogin(email: string, password: string) {
  console.log('🔍 Test de connexion Supabase');
  console.log('================================');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Mot de passe: ${password.replace(/./g, '*')} (${password.length} caractères)`);
  console.log(`🌐 URL Supabase: ${SUPABASE_URL}`);
  console.log(`🔑 Clé anonyme: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  console.log('');

  try {
    console.log('⏳ Tentative de connexion...');
    const startTime = Date.now();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (error) {
      console.log('❌ ÉCHEC DE CONNEXION');
      console.log('================================');
      console.log(`⏱️  Durée: ${duration}ms`);
      console.log(`🚨 Code d'erreur: ${error.message}`);
      console.log(`📝 Message: ${error.message}`);
      console.log(`🔍 Détails:`, error);
      
      // Analyse des erreurs courantes
      if (error.message.includes('Invalid login credentials')) {
        console.log('');
        console.log('🔍 DIAGNOSTIC:');
        console.log('   • L\'email ou le mot de passe est incorrect');
        console.log('   • Vérifiez que le compte existe dans Supabase');
        console.log('   • Vérifiez que l\'email est confirmé');
        console.log('   • Vérifiez qu\'il n\'y a pas d\'espaces dans les identifiants');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('');
        console.log('🔍 DIAGNOSTIC:');
        console.log('   • L\'email n\'est pas confirmé');
        console.log('   • Vérifiez votre boîte mail pour le lien de confirmation');
      } else if (error.message.includes('Too many requests')) {
        console.log('');
        console.log('🔍 DIAGNOSTIC:');
        console.log('   • Trop de tentatives de connexion');
        console.log('   • Attendez quelques minutes avant de réessayer');
      }
      
      return false;
    }

    if (data.user) {
      console.log('✅ CONNEXION RÉUSSIE');
      console.log('================================');
      console.log(`⏱️  Durée: ${duration}ms`);
      console.log(`👤 ID utilisateur: ${data.user.id}`);
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`✅ Email confirmé: ${data.user.email_confirmed_at ? 'Oui' : 'Non'}`);
      console.log(`🕐 Créé le: ${data.user.created_at}`);
      console.log(`🔄 Dernière connexion: ${data.user.last_sign_in_at}`);
      
      // Vérifier le profil utilisateur
      console.log('');
      console.log('🔍 Vérification du profil...');
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

      if (profileError) {
        console.log('⚠️  Erreur lors de la récupération du profil:', profileError.message);
      } else if (profile) {
        console.log('✅ Profil trouvé:');
        console.log(`   • Nom: ${profile.first_name} ${profile.last_name}`);
        console.log(`   • Rôle: ${profile.role}`);
        console.log(`   • Entreprise ID: ${profile.company_id}`);
        console.log(`   • Actif: ${profile.is_active ? 'Oui' : 'Non'}`);
      } else {
        console.log('⚠️  Aucun profil trouvé pour cet utilisateur');
      }

      // Déconnexion
      await supabase.auth.signOut();
      console.log('🔓 Déconnexion effectuée');
      
      return true;
    }

  } catch (error) {
    console.log('💥 ERREUR INATTENDUE');
    console.log('================================');
    console.log('Erreur:', error);
    return false;
  }
}

// Fonction pour créer un utilisateur de test
async function createTestUser(email: string, password: string) {
  console.log('🔧 Création d\'un utilisateur de test');
  console.log('================================');
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: 'https://atelierpro-production.up.railway.app/',
        data: {
          first_name: 'Demo',
          last_name: 'User',
          company_name: 'Atelier Demo'
        }
      }
    });

    if (error) {
      console.log('❌ Erreur lors de la création:', error.message);
      return false;
    }

    if (data.user) {
      console.log('✅ Utilisateur créé avec succès');
      console.log(`👤 ID: ${data.user.id}`);
      console.log(`📧 Email: ${data.user.email}`);
      console.log(`📧 Confirmation requise: ${data.user.email_confirmed_at ? 'Non' : 'Oui'}`);
      
      if (!data.user.email_confirmed_at) {
        console.log('');
        console.log('📧 IMPORTANT:');
        console.log('   • L\'utilisateur a été créé mais l\'email n\'est pas confirmé');
        console.log('   • Vérifiez la boîte mail pour confirmer l\'email');
        console.log('   • Ou utilisez l\'API Admin pour confirmer manuellement');
      }
      
      return true;
    }

  } catch (error) {
    console.log('💥 Erreur lors de la création:', error);
    return false;
  }
}

// Fonction pour vérifier la configuration
async function checkConfiguration() {
  console.log('🔧 Vérification de la configuration');
  console.log('================================');
  
  console.log(`🌐 URL Supabase: ${SUPABASE_URL}`);
  console.log(`🔑 Clé anonyme: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
  
  try {
    // Test de connexion basique
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Erreur de configuration:', error.message);
      return false;
    }
    
    console.log('✅ Configuration valide');
    console.log(`📊 Session actuelle: ${data.session ? 'Active' : 'Aucune'}`);
    return true;
    
  } catch (error) {
    console.log('❌ Erreur de configuration:', error);
    return false;
  }
}

// Fonction principale
async function main() {
  const email = 'demo@atelierpro.com';
  const password = 'DemoTest@1234';
  
  console.log('🚀 Diagnostic AtelierPro - Erreur de connexion');
  console.log('==============================================');
  console.log('');

  // 1. Vérifier la configuration
  const configOk = await checkConfiguration();
  console.log('');

  if (!configOk) {
    console.log('❌ Configuration invalide, arrêt du diagnostic');
    return;
  }

  // 2. Tester la connexion
  const loginSuccess = await testLogin(email, password);
  console.log('');

  if (!loginSuccess) {
    console.log('🔧 Tentative de création d\'un utilisateur de test...');
    console.log('');
    
    // 3. Créer un utilisateur de test si la connexion échoue
    await createTestUser(email, password);
  }

  console.log('');
  console.log('📋 RÉSUMÉ DES ACTIONS RECOMMANDÉES:');
  console.log('==================================');
  console.log('1. Vérifiez que l\'utilisateur existe dans Supabase Auth');
  console.log('2. Vérifiez que l\'email est confirmé');
  console.log('3. Vérifiez les variables d\'environnement sur Railway');
  console.log('4. Testez avec un autre navigateur/incognito');
  console.log('5. Vérifiez les logs de Supabase pour plus de détails');
}

// Exécuter le script
main().catch(console.error); 